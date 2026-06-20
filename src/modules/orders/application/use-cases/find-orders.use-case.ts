import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { Order } from '../../domain/entities/order.entitie';

@Injectable()
export class FindOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: any): Promise<Order[]> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}