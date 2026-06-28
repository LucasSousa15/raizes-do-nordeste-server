import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
import { PaymentStatus } from 'src/modules/payments/domain/@types/payment';
import { PaymentNotApprovedError } from 'src/modules/orders/application/errors/payment-not-approved.error';
import { IdempotencyKeyConflictError } from 'src/modules/idempotency/application/errors/idempotency-key-conflict.error';

describe('UpdateOrderUseCase', () => {
  let orderRepo: InMemoryOrderRepository;
  let usersRepo: InMemoryUsersRepository;
  let paymentRepo: InMemoryPaymentRepository;
  let paymentService: MockPaymentService;
  let auditRepo: InMemoryAuditLogRepository;
  let idempotencyRepo: InMemoryIdempotencyKeyRepository;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    usersRepo = new InMemoryUsersRepository();
    paymentRepo = new InMemoryPaymentRepository();
    paymentService = new MockPaymentService(paymentRepo);
    auditRepo = new InMemoryAuditLogRepository();
    idempotencyRepo = new InMemoryIdempotencyKeyRepository();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates order to confirmed after approved mock payment and adds loyalty points', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const user = {
      id: 'u1',
      name: 'Customer 1',
      email: 'c1@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: {
        id: 'c1',
        cpf: '000',
        consent: true,
        consentAt: new Date(),
        points: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any;
    await usersRepo.create(user);

    const order = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 2, price: 100 }],
      totalAmount: 200,
      status: OrderStatus.PENDING,
    });

    const sut = new UpdateOrderUseCase(
      orderRepo,
      paymentService,
      usersRepo,
      new AuditService(auditRepo),
      idempotencyRepo,
    );

    const result = await sut.execute(order.id, {
      confirmPayment: true,
    });

    expect(result.status).toBe(OrderStatus.CONFIRMED);

    const payments = await paymentRepo.findByOrderId(order.id);
    expect(payments).toHaveLength(1);
    expect(payments[0].status).toBe(PaymentStatus.SUCCESS);
    expect(payments[0].responsePayload).toMatchObject({ approved: true });

    const updatedUser = await usersRepo.findById('u1');
    expect(updatedUser?.customerData?.points).toBe(25);

    // Audit: PAYMENT_APPROVED + POINTS_EARNED
    const actions = auditRepo.items.map((l) => l.action);
    expect(actions).toContain('PAYMENT_APPROVED');
    expect(actions).toContain('POINTS_EARNED');
  });

  it('throws when mock payment is not approved', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const order = await orderRepo.createOrder({
      storeId: 's1',
      customerId: 'u1',
      channel: OrderChannel.ONLINE,
      items: [{ productId: 'p1', quantity: 1, price: 50 }],
      totalAmount: 50,
      status: OrderStatus.PENDING,
    });

    const sut = new UpdateOrderUseCase(
      orderRepo,
      paymentService,
      usersRepo,
      new AuditService(auditRepo),
      idempotencyRepo,
    );

    await expect(
      sut.execute(order.id, { confirmPayment: true }),
    ).rejects.toBeInstanceOf(PaymentNotApprovedError);

    expect(auditRepo.items.map((l) => l.action)).toContain('PAYMENT_FAILED');
  });
});