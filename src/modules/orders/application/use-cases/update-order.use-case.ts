import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { Order } from '../../domain/entities/order.entitie';
import { OrderStatus } from '../../domain/@types/order';
import { MockPaymentService } from 'src/modules/payments/application/services/mock-payment.service';
import { PaymentStatus } from 'src/modules/payments/domain/@types/payment';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { PaymentNotApprovedError } from '../errors/payment-not-approved.error';
import { AuditService } from 'src/modules/audit/application/services/audit.service';
import { IdempotencyKeyRepository } from 'src/modules/idempotency/domain/repositories/idempotency-key.repositorie';
import { IdempotencyKeyConflictError } from 'src/modules/idempotency/application/errors/idempotency-key-conflict.error';

type UpdateOrderReq = {
  status?: OrderStatus;
  confirmPayment?: boolean;
  simulatePaymentFailure?: boolean;
  idempotencyKey?: string;
};

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: MockPaymentService,
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
    private readonly idempotencyKeyRepository: IdempotencyKeyRepository,
  ) {}


  async execute(id: string, data: UpdateOrderReq): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError();
    }

    if (!data.confirmPayment) {
      if (!data.status) return order;

      const updated = await this.orderRepository.update(id, { status: data.status });

      await this.auditService.logAction(
        order.customerId,
        'ORDER_STATUS_UPDATED',
        { orderId: id, previousStatus: order.status, newStatus: data.status },
      );

      return updated;
    }

    // ── Idempotência ──────────────────────────────────────────────────────
    if (data.idempotencyKey) {
      const existing = await this.idempotencyKeyRepository.findByKey(
        data.idempotencyKey,
      );
      if (existing) {
        if (existing.orderId !== order.id) {
          throw new IdempotencyKeyConflictError();
        }
        // Mesma chave para o mesmo pedido → retorna o estado atual
        // sem disparar um segundo pagamento.
        const refreshed = await this.orderRepository.findById(order.id);
        return refreshed ?? order;
      }
    }

    const payment = await this.paymentService.requestPayment({
      orderId: order.id,
      amount: order.totalAmount,
      customerId: order.customerId,
      simulateFailure: data.simulatePaymentFailure,
      idempotencyKey: data.idempotencyKey,
    });

    if (payment.status !== PaymentStatus.SUCCESS) {
      await this.auditService.logAction(
        order.customerId,
        'PAYMENT_FAILED',
        { orderId: id, paymentId: payment.id },
      );
      await this.recordIdempotency(data.idempotencyKey, order, payment, 422, {
        error: 'PAYMENT_FAILED',
        paymentId: payment.id,
      });
      throw new PaymentNotApprovedError();
    }

    const earnedPoints = await this.addLoyaltyPoints(
      order.customerId,
      order.totalAmount,
    );

    const updated = await this.orderRepository.update(id, {
      status: OrderStatus.CONFIRMED,
    });

    await this.auditService.logAction(
      order.customerId,
      'PAYMENT_APPROVED',
      { orderId: id, paymentId: payment.id, totalAmount: order.totalAmount },
    );

    if (earnedPoints) {
      await this.auditService.logAction(order.customerId, 'POINTS_EARNED', {
        orderId: id,
        paymentId: payment.id,
        ...earnedPoints,
      });
    }

    await this.recordIdempotency(data.idempotencyKey, order, payment, 200, {
      orderId: updated.id,
      status: updated.status,
    });

    return updated;
  }

  private async addLoyaltyPoints(
    customerId: string,
    totalAmount: number,
  ): Promise<{
    previousPoints: number;
    earnedPoints: number;
    newPoints: number;
  } | null> {
    const earned = Math.floor(totalAmount * 0.1);
    if (earned <= 0) return null;

    const user = await this.usersRepository.findById(customerId);
    const previousPoints = user?.customerData?.points ?? 0;

    await this.usersRepository.addPoints(customerId, earned);

    return {
      previousPoints,
      earnedPoints: earned,
      newPoints: previousPoints + earned,
    };
  }

  private async recordIdempotency(
    key: string | undefined,
    order: Order,
    payment: { id: string },
    responseStatus: number,
    responseBody: Record<string, unknown>,
  ): Promise<void> {
    if (!key) return;
    try {
      await this.idempotencyKeyRepository.create({
        key,
        orderId: order.id,
        paymentId: payment.id,
        responseStatus,
        responseBody,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
      });
    } catch (error) {
      // Corrida: outra request gravou a mesma chave antes de nós.
      // O cache já carrega a resposta vencedora; não falhamos a operação.
      if (error instanceof IdempotencyKeyConflictError) {
        return;
      }
      throw error;
    }
  }
}