import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { FindOrdersReq, PaginatedOrders } from '../../domain/@types/order';

@Injectable()
export class FindOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: FindOrdersReq): Promise<PaginatedOrders> {
    return this.orderRepository.findAll(query);
  }
}
