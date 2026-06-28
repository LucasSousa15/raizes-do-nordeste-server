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

type UpdateOrderReq = {
  status?: OrderStatus;
  confirmPayment?: boolean;
  simulatePaymentFailure?: boolean;
};

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: MockPaymentService,
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
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

    const payment = await this.paymentService.requestPayment({
      orderId: order.id,
      amount: order.totalAmount,
      customerId: order.customerId,
      simulateFailure: data.simulatePaymentFailure,
    });

    if (payment.status !== PaymentStatus.SUCCESS) {
      await this.auditService.logAction(
        order.customerId,
        'PAYMENT_FAILED',
        { orderId: id, paymentId: payment.id },
      );
      throw new PaymentNotApprovedError();
    }

    await this.addLoyaltyPoints(order.customerId, order.totalAmount);

    const updated = await this.orderRepository.update(id, {
      status: OrderStatus.CONFIRMED,
    });

    await this.auditService.logAction(
      order.customerId,
      'PAYMENT_APPROVED',
      { orderId: id, paymentId: payment.id, totalAmount: order.totalAmount },
    );

    return updated;
  }

private async addLoyaltyPoints(customerId: string, totalAmount: number): Promise<void> {
  const earnedPoints = Math.floor(totalAmount * 0.1);
  if (earnedPoints > 0) {
    await this.usersRepository.addPoints(customerId, earnedPoints);
  }
}
}

