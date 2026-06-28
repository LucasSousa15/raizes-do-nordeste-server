import { IdempotencyKeyRepository } from 'src/modules/idempotency/domain/repositories/idempotency-key.repositorie';
import {
  CreateIdempotencyKeyReq,
  IIdempotencyKey,
} from 'src/modules/idempotency/domain/@types/idempotency-key';

export class InMemoryIdempotencyKeyRepository extends IdempotencyKeyRepository {
  public items: IIdempotencyKey[] = [];

  async findByKey(key: string): Promise<IIdempotencyKey | null> {
    return this.items.find((i) => i.key === key) ?? null;
  }

  async create(data: CreateIdempotencyKeyReq): Promise<IIdempotencyKey> {
    const existing = this.items.find((i) => i.key === data.key);
    if (existing) {
      throw new Error(`Idempotency key already exists: ${data.key}`);
    }
    const record: IIdempotencyKey = {
      id: crypto.randomUUID(),
      key: data.key,
      orderId: data.orderId,
      paymentId: data.paymentId ?? null,
      responseStatus: data.responseStatus,
      responseBody: data.responseBody ?? null,
      createdAt: new Date(),
      expiresAt: data.expiresAt,
    };
    this.items.push(record);
    return record;
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    this.items = this.items.filter((i) => i.expiresAt > now);
  }
}