import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPaymentService } from 'src/modules/payments/application/services/mock-payment.service';
import { PaymentProvider, PaymentStatus } from 'src/modules/payments/domain/@types/payment';
import { InMemoryPaymentRepository } from '../repositories/in-memory-payment.repositorie';

describe('MockPaymentService', () => {
  let paymentRepository: InMemoryPaymentRepository;
  let sut: MockPaymentService;

  beforeEach(() => {
    paymentRepository = new InMemoryPaymentRepository();
    sut = new MockPaymentService(paymentRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('approves and registers a mock payment', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const payment = await sut.requestPayment({
      orderId: 'order-1',
      customerId: 'customer-1',
      amount: 100,
    });

    expect(payment.provider).toBe(PaymentProvider.MOCK);
    expect(payment.status).toBe(PaymentStatus.SUCCESS);
    expect(payment.requestPayload).toMatchObject({ orderId: 'order-1', amount: 100 });
    expect(payment.responsePayload).toMatchObject({ approved: true });
    expect(paymentRepository.items).toHaveLength(1);
  });

  it('rejects and registers a randomly failed mock payment', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const payment = await sut.requestPayment({
      orderId: 'order-2',
      amount: 100,
    });

    expect(payment.status).toBe(PaymentStatus.FAILED);
    expect(payment.responsePayload).toMatchObject({
      approved: false,
      reason: 'Pagamento recusado pelo mock.',
    });
    expect(paymentRepository.items).toHaveLength(1);
  });

  it('rejects and registers a simulated failed payment', async () => {
    const payment = await sut.requestPayment({
      orderId: 'order-3',
      amount: 100,
      simulateFailure: true,
    });

    expect(payment.status).toBe(PaymentStatus.FAILED);
    expect(payment.responsePayload).toMatchObject({
      approved: false,
      reason: 'Pagamento recusado pelo mock.',
    });
    expect(paymentRepository.items).toHaveLength(1);
  });

  it('approves deterministically when idempotencyKey starts with "approve-"', async () => {
    const payment = await sut.requestPayment({
      orderId: 'order-4',
      amount: 100,
      idempotencyKey: 'approve-test-12345678',
    });

    expect(payment.status).toBe(PaymentStatus.SUCCESS);
    expect(payment.responsePayload).toMatchObject({ approved: true });
  });

  it('rejects deterministically when idempotencyKey starts with "reject-"', async () => {
    const payment = await sut.requestPayment({
      orderId: 'order-5',
      amount: 100,
      idempotencyKey: 'reject-test-12345678',
    });

    expect(payment.status).toBe(PaymentStatus.FAILED);
    expect(payment.responsePayload).toMatchObject({ approved: false });
  });

  it('falls back to random outcome when idempotencyKey is missing or unrecognized', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const payment = await sut.requestPayment({
      orderId: 'order-6',
      amount: 100,
      idempotencyKey: 'unknown-prefix-12345678',
    });

    expect(payment.status).toBe(PaymentStatus.FAILED);
  });

  it('falls back to random outcome when idempotencyKey is shorter than 16 chars', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const payment = await sut.requestPayment({
      orderId: 'order-7',
      amount: 100,
      idempotencyKey: 'approve-short',
    });

    expect(payment.status).toBe(PaymentStatus.SUCCESS);
  });
});
