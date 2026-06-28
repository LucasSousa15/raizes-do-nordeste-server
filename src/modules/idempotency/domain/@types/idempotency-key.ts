export interface IIdempotencyKey {
  id: string;
  key: string;
  orderId: string;
  paymentId: string | null;
  responseStatus: number;
  responseBody: Record<string, unknown> | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateIdempotencyKeyReq {
  key: string;
  orderId: string;
  paymentId?: string | null;
  responseStatus: number;
  responseBody?: Record<string, unknown> | null;
  expiresAt: Date;
}