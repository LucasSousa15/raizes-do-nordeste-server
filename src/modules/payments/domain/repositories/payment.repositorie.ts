import { CreatePaymentReq, IPayment } from '../@types/payment';

export abstract class PaymentRepository {
  abstract create(data: CreatePaymentReq): Promise<IPayment>;
  abstract findById(id: string): Promise<IPayment | null>;
  abstract findByOrderId(orderId: string): Promise<IPayment[]>;
}
