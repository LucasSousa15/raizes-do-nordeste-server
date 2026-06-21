import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { Order } from '../../domain/entities/order.entitie';
import { OrderStatus } from '../../domain/@types/order';
import { OrderNotFoundError } from '../errors/order-not-found.error';

@Injectable()
export class DeleteOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError();
    }

    return this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
    });
  }
}
