import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryAuditLogRepository } from 'test/audit/repositories/in-memory.audit-log.repository';
import { GetLoyaltyHistoryUseCase } from 'src/modules/loyalty/application/use-cases/get-loyalty-history.use-case';

describe('GetLoyaltyHistoryUseCase', () => {
  let auditRepo: InMemoryAuditLogRepository;
  let sut: GetLoyaltyHistoryUseCase;

  beforeEach(() => {
    auditRepo = new InMemoryAuditLogRepository();
    sut = new GetLoyaltyHistoryUseCase(auditRepo);
  });

  it('returns only POINTS_EARNED, POINTS_REDEEMED and PAYMENT_APPROVED entries for the user', async () => {
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_EARNED',
      details: { earnedPoints: 20, previousPoints: 0, newPoints: 20, orderId: 'o1' },
    });
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_REDEEMED',
      details: {
        redeemedPoints: 10,
        previousPoints: 20,
        remainingPoints: 10,
        couponCode: 'ABC123',
        promotionId: 'p1',
      },
    });
    await auditRepo.create({
      userId: 'u1',
      action: 'PAYMENT_APPROVED',
      details: { orderId: 'o1', paymentId: 'pay-1', totalAmount: 100 },
    });
    await auditRepo.create({
      userId: 'u1',
      action: 'ORDER_STATUS_UPDATED',
      details: { orderId: 'o1', newStatus: 'shipped' },
    });
    await auditRepo.create({
      userId: 'other',
      action: 'POINTS_EARNED',
      details: { earnedPoints: 5 },
    });

    const history = await sut.execute('u1');

    expect(history).toHaveLength(3);
    expect(history.map((h) => h.type)).toEqual(['EARN', 'REDEEM', 'ORDER_PAID']);
  });

  it('maps POINTS_EARNED to EARN with positive delta and orderId', async () => {
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_EARNED',
      details: {
        earnedPoints: 30,
        previousPoints: 10,
        newPoints: 40,
        orderId: 'o9',
        paymentId: 'pay-9',
      },
    });

    const [entry] = await sut.execute('u1');

    expect(entry.type).toBe('EARN');
    expect(entry.pointsDelta).toBe(30);
    expect(entry.orderId).toBe('o9');
    expect(entry.paymentId).toBe('pay-9');
  });

  it('maps POINTS_REDEEMED to REDEEM with negative delta and coupon code', async () => {
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_REDEEMED',
      details: {
        redeemedPoints: 20,
        previousPoints: 100,
        remainingPoints: 80,
        couponCode: 'SAVE20',
        promotionId: 'p-1',
      },
    });

    const [entry] = await sut.execute('u1');

    expect(entry.type).toBe('REDEEM');
    expect(entry.pointsDelta).toBe(-20);
    expect(entry.couponCode).toBe('SAVE20');
    expect(entry.promotionId).toBe('p-1');
  });

  it('maps PAYMENT_APPROVED to ORDER_PAID with 10% of totalAmount as delta', async () => {
    await auditRepo.create({
      userId: 'u1',
      action: 'PAYMENT_APPROVED',
      details: { orderId: 'o1', paymentId: 'pay-1', totalAmount: 250 },
    });

    const [entry] = await sut.execute('u1');

    expect(entry.type).toBe('ORDER_PAID');
    expect(entry.pointsDelta).toBe(25);
    expect(entry.orderId).toBe('o1');
  });

  it('returns entries ordered by createdAt desc', async () => {
    const now = Date.now();
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_EARNED',
      details: { earnedPoints: 5, createdAt: new Date(now - 1000) },
    });

    await new Promise((resolve) => setTimeout(resolve, 5));
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_EARNED',
      details: { earnedPoints: 10 },
    });

    const history = await sut.execute('u1');

    expect(history).toHaveLength(2);
    expect(history[0].pointsDelta).toBe(10);
    expect(history[1].pointsDelta).toBe(5);
  });

  it('returns empty array when there are no loyalty-relevant logs', async () => {
    await auditRepo.create({
      userId: 'u1',
      action: 'ORDER_STATUS_UPDATED',
      details: { newStatus: 'shipped' },
    });

    const history = await sut.execute('u1');

    expect(history).toEqual([]);
  });

  it('skips malformed entries without valid points info', async () => {
    await auditRepo.create({
      userId: 'u1',
      action: 'POINTS_EARNED',
      details: { foo: 'bar' },
    });

    const history = await sut.execute('u1');

    expect(history).toEqual([]);
  });
});