import {
  IOrder,
  PaginatedOrders,
} from '../../../domain/@types/order';
import { Order } from '../../../domain/entities/order.entitie';

export type OrderView = IOrder;

export type PaginatedOrdersView = Omit<PaginatedOrders, 'data'> & {
  data: OrderView[];
};

export type FindOrderView = {
  order: OrderView | PaginatedOrdersView | null;
};

export class OrderViewModel {
  static toHTTP(order: Order): OrderView;
  static toHTTP(order: IOrder): OrderView;
  static toHTTP(orders: PaginatedOrders): PaginatedOrdersView;
  static toHTTP(order: null): null;
  static toHTTP(
    order: Order | IOrder | PaginatedOrders | null,
  ): OrderView | PaginatedOrdersView | null;
  static toHTTP(
    order: Order | IOrder | PaginatedOrders | null,
  ): OrderView | PaginatedOrdersView | null {
    if (!order) return null;

    if ('data' in order) {
      return {
        data: order.data.map((item) => OrderViewModel.toHTTP(item)),
        meta: order.meta,
      };
    }

    if (order instanceof Order) {
      return {
        id: order.id,
        storeId: order.storeId,
        items: order.items,
        customerId: order.customerId,
        channel: order.channel,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    }

    return order;
  }
}
