import { FindOrdersReq, IOrder, PaginatedOrders, } from '../@types/order';
import { Order } from '../entities/order.entitie';

export abstract class OrderRepository {
  abstract createOrder(data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  abstract findAll(data: FindOrdersReq): Promise<PaginatedOrders>;
  abstract findById(id: string): Promise<Order | null>;
  abstract update(id: string, data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'> ): Promise<Order>;
  abstract delete(id: string): Promise<void>;
}