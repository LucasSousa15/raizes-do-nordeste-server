import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { Order } from '../../domain/entities/order.entitie';
import { OrderStatus } from '../../domain/@types/order';
import { MockPaymentService } from 'src/modules/payments/application/services/mock-payment.service';
import { PaymentStatus } from 'src/modules/payments/domain/@types/payment';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { PaymentNotApprovedError } from '../errors/payment-not-approved.error';

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
  ) {}

  async execute(id: string, data: UpdateOrderReq): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError();
    }

    if (!data.confirmPayment) {
      if (!data.status) return order;
      return this.orderRepository.update(id, { status: data.status });
    }

    const payment = await this.paymentService.requestPayment({
      orderId: order.id,
      amount: order.totalAmount,
      customerId: order.customerId,
      simulateFailure: data.simulatePaymentFailure,
    });

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new PaymentNotApprovedError();
    }

    await this.addLoyaltyPoints(order.customerId, order.totalAmount);

    return this.orderRepository.update(id, {
      status: OrderStatus.CONFIRMED,
    });
  }

  private async addLoyaltyPoints(customerId: string, totalAmount: number): Promise<void> {
    const user = await this.usersRepository.findById(customerId);
    if (!user?.customerData) {
      return;
    }

    const earnedPoints = Math.floor(totalAmount * 0.1);

    await this.usersRepository.update({
      ...user,
      customerData: {
        ...user.customerData,
        points: user.customerData.points + earnedPoints,
        updatedAt: new Date(),
      },
    });
  }
}
