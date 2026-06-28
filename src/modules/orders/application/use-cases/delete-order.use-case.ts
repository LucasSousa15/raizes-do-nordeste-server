import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { Order } from '../../domain/entities/order.entitie';
import { OrderStatus } from '../../domain/@types/order';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { AuditService } from 'src/modules/audit/application/services/audit.service';

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const cancelled = await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
    });

    await this.auditService.logAction(
      order.customerId,
      'ORDER_CANCELLED',
      { orderId: id },
    );

    return cancelled;
  }
}

