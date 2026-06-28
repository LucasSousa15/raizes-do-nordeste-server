import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteOrderUseCase } from 'src/modules/orders/application/use-cases/delete-order.use-case';
import { OrderChannel, OrderStatus } from 'src/modules/orders/domain/@types/order';
import { InMemoryOrderRepository } from '../repositories/in-memory-order-repositorie';

describe('DeleteOrderUseCase', () => {
  let orderRepo: InMemoryOrderRepository;
  let sut: DeleteOrderUseCase;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    sut = new DeleteOrderUseCase(orderRepo, { logAction: vi.fn() } as any);
  });

  it('does not delete the order and updates status to cancelled', async () => {
    const order = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 100 }],
      totalAmount: 100,
      status: OrderStatus.PENDING,
      discount: 0
    });

    const result = await sut.execute(order.id);

    expect(result.status).toBe(OrderStatus.CANCELLED);
    expect(orderRepo.items).toHaveLength(1);

    const persisted = await orderRepo.findById(order.id);
    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBe(OrderStatus.CANCELLED);
  });

  it('throws when order does not exist', async () => {
    await expect(() => sut.execute('missing-order')).rejects.toThrow('Pedido não encontrado.');
  });
});
