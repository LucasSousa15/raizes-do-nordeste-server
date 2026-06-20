import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';

@Injectable()
export class DeleteOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<void> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}