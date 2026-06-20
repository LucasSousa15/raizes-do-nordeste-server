import { beforeEach, describe, expect, it } from 'vitest';

import { OrderChannel } from 'src/modules/orders/domain/@types/order';
import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { InMemoryOrderRepository } from '../repositories/in-memory-order-repositorie';
import { CreateOrderUseCase } from 'src/modules/orders/application/use-cases/create-order.use-case';
import { InMemoryUsersRepository } from 'test/accounts/repositories/in-memory.users.repository';
import { InMemoryProductRepository } from 'test/product/repositories/in-memory-product.repositorie';
import { InMemoryStoreStockRepository } from 'test/stock/repositories/in-memory-store-stock.repositorie';

describe('CreateOrderUseCase (TDD) tests', () => {
  let orderRepo: InMemoryOrderRepository;
  let productRepo: InMemoryProductRepository;
  let storeStockRepo: InMemoryStoreStockRepository;
  let usersRepo: InMemoryUsersRepository;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    productRepo = new InMemoryProductRepository();
    storeStockRepo = new InMemoryStoreStockRepository();
    usersRepo = new InMemoryUsersRepository();
  });

  it('creates an order, associates to customer and decrements store stock', async () => {
    const product = {
      id: 'p1',
      name: 'Prod 1',
      price: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    productRepo.items.push(product);

    await storeStockRepo.upsertIncrement('s1', 'p1', 10);

    const user = {
      id: 'u1',
      name: 'Customer 1',
      email: 'c1@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: { id: 'c1', cpf: '000', consent: true, consentAt: new Date(), points: 0, createdAt: new Date(), updatedAt: new Date() }
    } as any;
    await usersRepo.create(user);

    const sut = new (CreateOrderUseCase as any)(orderRepo, productRepo, storeStockRepo, usersRepo);

    const result = await sut.execute({
      storeId: 's1',
      items: [{ productId: 'p1', quantity: 2 }],
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
    });

    expect(result).toBeDefined();
    expect(result.items[0].price).toBe(100);
    expect(result.totalAmount).toBe(200);

    const stock = await storeStockRepo.findByStoreAndProduct('s1', 'p1');
    expect(stock).not.toBeNull();
    expect(stock!.quantity).toBe(8);
  });

  it('throws when channel is not provided', async () => {
    const product = { id: 'p2', name: 'Prod 2', price: 50, createdAt: new Date(), updatedAt: new Date() } as any;
    productRepo.items.push(product);
    await storeStockRepo.upsertIncrement('s2', 'p2', 5);

    const user = { id: 'u2', name: 'C2', email: 'c2@example.com', password: 'p', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE } as any;
    await usersRepo.create(user);

    const sut = new (CreateOrderUseCase as any)(orderRepo, productRepo, storeStockRepo, usersRepo);

    await expect(() => sut.execute({
      storeId: 's2',
      items: [{ productId: 'p2', quantity: 1 }],
      customerId: 'u2',
    })).rejects.toThrow();
  });

  it('throws when associated user is not a customer', async () => {
    const product = { id: 'p3', name: 'Prod 3', price: 30, createdAt: new Date(), updatedAt: new Date() } as any;
    productRepo.items.push(product);
    await storeStockRepo.upsertIncrement('s3', 'p3', 5);

    const user = { id: 'u3', name: 'Staff', email: 'staff@example.com', password: 'p', role: UserRole.ADMIN, status: UserStatus.ACTIVE } as any;
    await usersRepo.create(user);

    const sut = new (CreateOrderUseCase as any)(orderRepo, productRepo, storeStockRepo, usersRepo);

    await expect(() => sut.execute({
      storeId: 's3',
      items: [{ productId: 'p3', quantity: 1 }],
      customerId: 'u3',
      channel: OrderChannel.PHONE,
    })).rejects.toThrow();
  });
});
