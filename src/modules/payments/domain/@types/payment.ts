export enum PaymentProvider {
  MOCK = 'mock',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface IPayment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  requestPayload?: Record<string, unknown> | null;
  responsePayload?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestMockPaymentReq {
  orderId: string;
  amount: number;
  customerId?: string;
  simulateFailure?: boolean;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export type CreatePaymentReq = Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>;
