import { CreatePaymentReq, IPayment } from 'src/modules/payments/domain/@types/payment';
import { PaymentRepository } from 'src/modules/payments/domain/repositories/payment.repositorie';

export class InMemoryPaymentRepository implements PaymentRepository {
  public items: IPayment[] = [];

  async create(data: CreatePaymentReq): Promise<IPayment> {
    const payment: IPayment = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(payment);
    return payment;
  }

  async findById(id: string): Promise<IPayment | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<IPayment[]> {
    return this.items.filter((item) => item.orderId === orderId);
  }
}
