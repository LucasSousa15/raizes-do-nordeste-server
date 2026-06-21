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
    };

    const approved = data.amount > 0 && !data.simulateFailure && Math.random() >= 0.5;
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
}
