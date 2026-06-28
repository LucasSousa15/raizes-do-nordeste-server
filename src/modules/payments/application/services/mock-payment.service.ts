import { Injectable } from '@nestjs/common';
import {
  IPayment,
  PaymentProvider,
  PaymentStatus,
  RequestMockPaymentReq,
} from '../../domain/@types/payment';
import { PaymentRepository } from '../../domain/repositories/payment.repositorie';

@Injectable()
export class MockPaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async requestPayment(data: RequestMockPaymentReq): Promise<IPayment> {
    const requestPayload = {
      provider: PaymentProvider.MOCK,
      orderId: data.orderId,
      amount: data.amount,
      customerId: data.customerId,
      metadata: data.metadata ?? {},
      idempotencyKey: data.idempotencyKey ?? null,
    };

    const deterministicOutcome = this.resolveOutcome(data);
    const approved =
      !data.simulateFailure && data.amount > 0 && deterministicOutcome;
    const responsePayload = {
      transactionId: crypto.randomUUID(),
      approved,
      reason: approved ? null : 'Pagamento recusado pelo mock.',
      processedAt: new Date().toISOString(),
    };

    return this.paymentRepository.create({
      orderId: data.orderId,
      provider: PaymentProvider.MOCK,
      status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      requestPayload,
      responsePayload,
    });
  }

  private resolveOutcome(data: RequestMockPaymentReq): boolean {
    if (data.simulateFailure || data.amount <= 0) return false;

    const key = data.idempotencyKey;
    if (typeof key === 'string' && key.length >= 16) {
      if (key.startsWith('approve-')) return true;
      if (key.startsWith('reject-')) return false;
    }

    return Math.random() >= 0.5;
  }
}
