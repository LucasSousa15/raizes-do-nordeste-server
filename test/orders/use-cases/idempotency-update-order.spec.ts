import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryUsersRepository } from 'test/accounts/repositories/in-memory.users.repository';
import { InMemoryOrderRepository } from '../repositories/in-memory-order-repositorie';
import { InMemoryPaymentRepository } from 'test/payments/repositories/in-memory-payment.repositorie';
import { InMemoryAuditLogRepository } from 'test/audit/repositories/in-memory.audit-log.repository';
import { InMemoryIdempotencyKeyRepository } from 'test/idempotency/repositories/in-memory-idempotency-key.repositorie';
import { MockPaymentService } from 'src/modules/payments/application/services/mock-payment.service';
import { AuditService } from 'src/modules/audit/application/services/audit.service';
import { UpdateOrderUseCase } from 'src/modules/orders/application/use-cases/update-order.use-case';
import { OrderChannel, OrderStatus } from 'src/modules/orders/domain/@types/order';
import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { IdempotencyKeyConflictError } from 'src/modules/idempotency/application/errors/idempotency-key-conflict.error';

describe('UpdateOrderUseCase — idempotency', () => {
  let orderRepo: InMemoryOrderRepository;
  let usersRepo: InMemoryUsersRepository;
  let paymentRepo: InMemoryPaymentRepository;
  let paymentService: MockPaymentService;
  let auditRepo: InMemoryAuditLogRepository;
  let idempotencyRepo: InMemoryIdempotencyKeyRepository;
  let sut: UpdateOrderUseCase;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    usersRepo = new InMemoryUsersRepository();
    paymentRepo = new InMemoryPaymentRepository();
    paymentService = new MockPaymentService(paymentRepo);
    auditRepo = new InMemoryAuditLogRepository();
    idempotencyRepo = new InMemoryIdempotencyKeyRepository();
    sut = new UpdateOrderUseCase(
      orderRepo,
      paymentService,
      usersRepo,
      new AuditService(auditRepo),
      idempotencyRepo,
    );

    usersRepo.create({
      id: 'u1',
      name: 'Customer',
      email: 'c@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: {
        id: 'c1',
        cpf: '000',
        consent: true,
        consentAt: new Date(),
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);
  });

  it('approves deterministically when idempotencyKey starts with "approve-"', async () => {
    const order = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 100 }],
      totalAmount: 100,
      status: OrderStatus.PENDING,
    });

    const result = await sut.execute(order.id, {
      confirmPayment: true,
      idempotencyKey: 'approve-test-001-AAAA',
    });

    expect(result.status).toBe(OrderStatus.CONFIRMED);
    const payments = await paymentRepo.findByOrderId(order.id);
    expect(payments[0].status).toBe('success');

    const stored = await idempotencyRepo.findByKey('approve-test-001-AAAA');
    expect(stored).not.toBeNull();
    expect(stored?.orderId).toBe(order.id);
    expect(stored?.responseStatus).toBe(200);
  });

  it('rejects deterministically when idempotencyKey starts with "reject-"', async () => {
    const order = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 100 }],
      totalAmount: 100,
      status: OrderStatus.PENDING,
    });

    await expect(
      sut.execute(order.id, {
        confirmPayment: true,
        idempotencyKey: 'reject-test-002-BBBB',
      }),
    ).rejects.toThrow();

    const stored = await idempotencyRepo.findByKey('reject-test-002-BBBB');
    expect(stored).not.toBeNull();
    expect(stored?.responseStatus).toBe(422);
  });

  it('returns cached order when same idempotencyKey is replayed for same order', async () => {
    const order = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 100 }],
      totalAmount: 100,
      status: OrderStatus.PENDING,
    });

    const first = await sut.execute(order.id, {
      confirmPayment: true,
      idempotencyKey: 'approve-replay-003-CCCC',
    });
    expect(first.status).toBe(OrderStatus.CONFIRMED);

    // Replay should NOT generate a second payment
    const paymentsAfterFirst = await paymentRepo.findByOrderId(order.id);
    const initialPaymentCount = paymentsAfterFirst.length;

    const second = await sut.execute(order.id, {
      confirmPayment: true,
      idempotencyKey: 'approve-replay-003-CCCC',
    });
    expect(second.id).toBe(first.id);

    const paymentsAfterReplay = await paymentRepo.findByOrderId(order.id);
    expect(paymentsAfterReplay.length).toBe(initialPaymentCount);

    // Loyalty points should be added only once
    const user = await usersRepo.findById('u1');
    expect(user?.customerData?.points).toBe(10); // 10% of 100
  });

  it('throws IdempotencyKeyConflictError when same key is reused across different orders', async () => {
    const orderA = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 100 }],
      totalAmount: 100,
      status: OrderStatus.PENDING,
    });
    const orderB = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 100 }],
      totalAmount: 100,
      status: OrderStatus.PENDING,
    });

    await sut.execute(orderA.id, {
      confirmPayment: true,
      idempotencyKey: 'approve-conflict-004-DDDD',
    });

    await expect(
      sut.execute(orderB.id, {
        confirmPayment: true,
        idempotencyKey: 'approve-conflict-004-DDDD',
      }),
    ).rejects.toBeInstanceOf(IdempotencyKeyConflictError);
  });
});