import { Order } from '../../../../domain/entities/order.entitie';
import { IOrder, IOrderItem, OrderChannel, OrderStatus } from '../../../../domain/@types/order';
import type { Prisma, Order as PrismaOrder, OrderItem as PrismaOrderItem, Channel as PrismaChannel, OrderStatus as PrismaOrderStatus } from '@prisma/client';

const channelPrismaToDomain: Record<PrismaChannel, OrderChannel> = {
  WEB: OrderChannel.ONLINE,
  APP: OrderChannel.ONLINE,
  TOTEM: OrderChannel.ONLINE,
  IN_STORE: OrderChannel.IN_STORE,
  PICKUP: OrderChannel.ONLINE,
};

export const channelDomainToPrisma: Record<OrderChannel, PrismaChannel> = {
  [OrderChannel.ONLINE]: 'WEB',
  [OrderChannel.IN_STORE]: 'IN_STORE',
  [OrderChannel.PHONE]: 'WEB',
};

const statusPrismaToDomain: Record<PrismaOrderStatus, OrderStatus> = {
  PENDING: OrderStatus.PENDING,
  IN_KITCHEN: OrderStatus.CONFIRMED,
  READY: OrderStatus.SHIPPED,
  DELIVERED: OrderStatus.DELIVERED,
  CANCELLED: OrderStatus.CANCELLED,
};

export const statusDomainToPrisma: Record<OrderStatus, PrismaOrderStatus> = {
  [OrderStatus.PENDING]: 'PENDING',
  [OrderStatus.CONFIRMED]: 'IN_KITCHEN',
  [OrderStatus.SHIPPED]: 'READY',
  [OrderStatus.DELIVERED]: 'DELIVERED',
  [OrderStatus.CANCELLED]: 'CANCELLED',
};

export class PrismaOrdersMapper {
  static toDomain(prismaOrder: PrismaOrder & { orderItems?: PrismaOrderItem[] }): IOrder {
    const items: IOrderItem[] = (prismaOrder.orderItems || []).map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      price: it.price,
    }));

    const order: IOrder = {
      id: prismaOrder.id,
      storeId: prismaOrder.storeId,
      items,
      customerId: prismaOrder.customerId,
      channel: channelPrismaToDomain[prismaOrder.channel as PrismaChannel],
      totalAmount: prismaOrder.total,
      status: statusPrismaToDomain[prismaOrder.status as PrismaOrderStatus],
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    } as IOrder;

    return order;
  }

  static toEntity(prismaOrder: PrismaOrder & { orderItems?: PrismaOrderItem[] }): Order {
    return Order.fromPrisma(this.toDomain(prismaOrder));
  }

  static toPrismaCreate(order: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Prisma.OrderUncheckedCreateInput {
    return {
      storeId: order.storeId,
      customerId: order.customerId,
      channel: channelDomainToPrisma[order.channel as OrderChannel],
      total: order.totalAmount,
      status: statusDomainToPrisma[order.status as OrderStatus],
      orderItems: {
        create: (order.items || []).map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          price: it.price,
        })),
      },
    } as Prisma.OrderUncheckedCreateInput;
  }

  static toPrismaUpdate(order: Partial<IOrder>): Prisma.OrderUncheckedUpdateInput {
    const data: Prisma.OrderUncheckedUpdateInput = {};
    if (order.storeId) data.storeId = order.storeId;
    if (order.customerId) data.customerId = order.customerId;
    if (order.channel) data.channel = channelDomainToPrisma[order.channel as OrderChannel];
    if (typeof order.totalAmount === 'number') data.total = order.totalAmount;
    if (order.status) data.status = statusDomainToPrisma[order.status as OrderStatus];
    if (order.items) {
      // Simplest strategy: remove existing items and recreate (unchecked nested input typed as any)
      (data.orderItems as any) = { deleteMany: {}, create: order.items.map((it) => ({ productId: it.productId, quantity: it.quantity, price: it.price })) };
    }
    return data;
  }
}