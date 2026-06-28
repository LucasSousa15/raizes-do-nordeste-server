import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderChannel } from 'src/modules/orders/domain/@types/order';
import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { InMemoryOrderRepository } from '../repositories/in-memory-order-repositorie';
import { CreateOrderUseCase } from 'src/modules/orders/application/use-cases/create-order.use-case';
import { InMemoryUsersRepository } from 'test/accounts/repositories/in-memory.users.repository';
import { InMemoryProductRepository } from 'test/product/repositories/in-memory-product.repositorie';
import { InMemoryStoreStockRepository } from 'test/stock/repositories/in-memory-store-stock.repositorie';
import { CustomerPromotionRepository } from 'src/modules/promotions/domain/repositories/customer-promotion.repositorie';
import { AuditService } from 'src/modules/audit/application/services/audit.service';

class InMemoryCustomerPromotionRepository extends CustomerPromotionRepository {
  public items: any[] = [];

  async create(customerId: string, promotionId: string): Promise<any> {
    const cp = { id: 'cp-' + Date.now(), customerId, promotionId, used: false, promotion: { discount: 0.1 } };
    this.items.push(cp);
    return cp;
  }

  async findValidByUserAndCode(userId: string, code: string): Promise<any> {
    return this.items.find(cp => cp.promotion?.code === code && !cp.used) || null;
  }

  async markAsUsed(id: string): Promise<void> {
    const cp = this.items.find(c => c.id === id);
    if (cp) cp.used = true;
  }
}

describe('CreateOrderUseCase (TDD) tests', () => {
  let orderRepo: InMemoryOrderRepository;
  let productRepo: InMemoryProductRepository;
  let storeStockRepo: InMemoryStoreStockRepository;
  let usersRepo: InMemoryUsersRepository;
  let customerPromotionRepo: InMemoryCustomerPromotionRepository;
  let auditService: AuditService;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    productRepo = new InMemoryProductRepository();
    storeStockRepo = new InMemoryStoreStockRepository();
    usersRepo = new InMemoryUsersRepository();
    customerPromotionRepo = new InMemoryCustomerPromotionRepository();
    auditService = { logAction: vi.fn() } as any;
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

    const sut = new CreateOrderUseCase(
      orderRepo,
      productRepo,
      storeStockRepo,
      usersRepo,
      customerPromotionRepo,
      auditService,
    );

    const result = await sut.execute({
      storeId: 's1',
      items: [{ productId: 'p1', quantity: 2 }],
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
    });

    expect(result).toBeDefined();
    expect(result.items[0].price).toBe(100);
    expect(result.totalAmount).toBe(200);
    expect(auditService.logAction).toHaveBeenCalledWith(
      'u1',
      'ORDER_CREATED',
      expect.objectContaining({ orderId: result.id }),
    );

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

    const sut = new CreateOrderUseCase(orderRepo, productRepo, storeStockRepo, usersRepo, customerPromotionRepo, auditService);

    await expect(() => sut.execute({
      storeId: 's2',
      items: [{ productId: 'p2', quantity: 1 }],
      customerId: 'u2',
      channel: OrderChannel.ONLINE
    })).rejects.toThrow();
  });

  it('throws when associated user is not a customer', async () => {
    const product = { id: 'p3', name: 'Prod 3', price: 30, createdAt: new Date(), updatedAt: new Date() } as any;
    productRepo.items.push(product);
    await storeStockRepo.upsertIncrement('s3', 'p3', 5);

    const user = { id: 'u3', name: 'Staff', email: 'staff@example.com', password: 'p', role: UserRole.ADMIN, status: UserStatus.ACTIVE } as any;
    await usersRepo.create(user);

    const sut = new CreateOrderUseCase(orderRepo, productRepo, storeStockRepo, usersRepo, customerPromotionRepo, auditService);

    await expect(() => sut.execute({
      storeId: 's3',
      items: [{ productId: 'p3', quantity: 1 }],
      customerId: 'u3',
      channel: OrderChannel.PHONE,
    })).rejects.toThrow();
  });

  it('applies a valid coupon and marks it as used', async () => {
    const product = { id: 'p4', name: 'Prod 4', price: 100, createdAt: new Date(), updatedAt: new Date() } as any;
    productRepo.items.push(product);
    await storeStockRepo.upsertIncrement('s4', 'p4', 10);

    const user = {
      id: 'u4',
      name: 'Customer 4',
      email: 'c4@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: { id: 'c4', cpf: '000', consent: true, consentAt: new Date(), points: 0, createdAt: new Date(), updatedAt: new Date() }
    } as any;
    await usersRepo.create(user);

    customerPromotionRepo.items.push({
      id: 'cp1',
      customerId: 'c4',
      promotionId: 'promo1',
      used: false,
      promotion: { code: 'DESC10', discount: 0.1, isActive: true, expiresAt: new Date(Date.now() + 99999) }
    });

    const sut = new CreateOrderUseCase(orderRepo, productRepo, storeStockRepo, usersRepo, customerPromotionRepo, auditService);

    const result = await sut.execute({
      storeId: 's4',
      items: [{ productId: 'p4', quantity: 2 }],
      customerId: 'u4',
      channel: OrderChannel.ONLINE,
      couponCode: 'DESC10',
    });

    expect(result.discount).toBe(20);
    expect(result.totalAmount).toBe(180);
    const cp = customerPromotionRepo.items.find(c => c.id === 'cp1');
    expect(cp?.used).toBe(true);
    expect(auditService.logAction).toHaveBeenCalled();
  });

  it('throws when coupon is invalid or not linked to customer', async () => {
    const product = { id: 'p5', name: 'Prod 5', price: 50, createdAt: new Date(), updatedAt: new Date() } as any;
    productRepo.items.push(product);
    await storeStockRepo.upsertIncrement('s5', 'p5', 5);

    const user = { id: 'u5', name: 'C5', email: 'c5@example.com', password: 'p', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, customerData: { id: 'c5', points: 0 } } as any;
    await usersRepo.create(user);

    const sut = new CreateOrderUseCase(orderRepo, productRepo, storeStockRepo, usersRepo, customerPromotionRepo, auditService);

    await expect(() => sut.execute({
      storeId: 's5',
      items: [{ productId: 'p5', quantity: 1 }],
      customerId: 'u5',
      channel: OrderChannel.ONLINE,
      couponCode: 'INVALID',
    })).rejects.toThrow('Cupom inválido, expirado ou não pertence a este cliente');
  });
});