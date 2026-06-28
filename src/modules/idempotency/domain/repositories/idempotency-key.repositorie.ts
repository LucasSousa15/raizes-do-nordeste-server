import { CreateIdempotencyKeyReq, IIdempotencyKey } from '../@types/idempotency-key';

export abstract class IdempotencyKeyRepository {
  abstract findByKey(key: string): Promise<IIdempotencyKey | null>;
  abstract create(data: CreateIdempotencyKeyReq): Promise<IIdempotencyKey>;
  abstract deleteExpired(): Promise<void>;
}