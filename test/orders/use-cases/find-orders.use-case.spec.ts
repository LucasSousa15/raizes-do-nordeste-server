import { beforeEach, describe, expect, it } from 'vitest';

import { FindOrdersUseCase } from 'src/modules/orders/application/use-cases/find-orders.use-case';
import { OrderChannel, OrderStatus } from 'src/modules/orders/domain/@types/order';
import { InMemoryOrderRepository } from '../repositories/in-memory-order-repositorie';

describe('FindOrdersUseCase', () => {
  let orderRepo: InMemoryOrderRepository;
  let sut: FindOrdersUseCase;

  beforeEach(async () => {
    orderRepo = new InMemoryOrderRepository();
    sut = new FindOrdersUseCase(orderRepo);

    const first = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 2, price: 100 }],
      totalAmount: 200,
      status: OrderStatus.PENDING,
    });
    const second = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u2',
      channel: OrderChannel.IN_STORE,
      items: [{ productId: 'p2', quantity: 1, price: 50 }],
      totalAmount: 50,
      status: OrderStatus.CONFIRMED,
    });
    const third = await orderRepo.createOrder({
      storeId: 's2',
      customerId: 'u1',
      channel: OrderChannel.PHONE,
      items: [{ productId: 'p3', quantity: 1, price: 300 }],
      totalAmount: 300,
      status: OrderStatus.DELIVERED,
    });

    (first as any).props.createdAt = new Date('2026-01-10T00:00:00.000Z');
    (second as any).props.createdAt = new Date('2026-02-10T00:00:00.000Z');
    (third as any).props.createdAt = new Date('2026-03-10T00:00:00.000Z');
  });

  it('filters orders by all query fields defined in FindOrdersReq', async () => {
    const byStore = await sut.execute({ storeId: 's1' });
    expect(byStore.data).toHaveLength(2);

    const byCustomer = await sut.execute({ customerId: 'u1' });
    expect(byCustomer.data).toHaveLength(2);

    const byChannel = await sut.execute({ channel: OrderChannel.IN_STORE });
    expect(byChannel.data).toHaveLength(1);
    expect(byChannel.data[0].customerId).toBe('u2');

    const byStatus = await sut.execute({ status: OrderStatus.DELIVERED });
    expect(byStatus.data).toHaveLength(1);
    expect(byStatus.data[0].storeId).toBe('s2');

    const byTotalRange = await sut.execute({ minTotalAmount: 100, maxTotalAmount: 250 });
    expect(byTotalRange.data).toHaveLength(1);
    expect(byTotalRange.data[0].totalAmount).toBe(200);

    const byCreatedAtRange = await sut.execute({
      createdAtStart: new Date('2026-02-01T00:00:00.000Z'),
      createdAtEnd: new Date('2026-02-28T23:59:59.999Z'),
    });
    expect(byCreatedAtRange.data).toHaveLength(1);
    expect(byCreatedAtRange.data[0].customerId).toBe('u2');

    const byOrderId = await sut.execute({ orderId: byStore.data[0].id });
    expect(byOrderId.data).toHaveLength(1);
    expect(byOrderId.data[0].id).toBe(byStore.data[0].id);
  });

  it('paginates filtered orders', async () => {
    const result = await sut.execute({ page: 2, limit: 1 });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      totalItems: 3,
      lastPage: 3,
      currentPage: 2,
      itemsPerPage: 1,
    });
  });
});
