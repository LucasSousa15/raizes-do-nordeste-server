import { Prisma } from '@prisma/client';
import { CreateIdempotencyKeyReq, IIdempotencyKey } from '../../../../domain/@types/idempotency-key';

export const PrismaIdempotencyKeyMapper = {
  toDomain(raw: {
    id: string;
    key: string;
    orderId: string;
    paymentId: string | null;
    responseStatus: number;
    responseBody: unknown;
    createdAt: Date;
    expiresAt: Date;
  }): IIdempotencyKey {
    return {
      id: raw.id,
      key: raw.key,
      orderId: raw.orderId,
      paymentId: raw.paymentId,
      responseStatus: raw.responseStatus,
      responseBody:
        raw.responseBody && typeof raw.responseBody === 'object'
          ? (raw.responseBody as Record<string, unknown>)
          : null,
      createdAt: raw.createdAt,
      expiresAt: raw.expiresAt,
    };
  },

  /**
   * Converte o `responseBody` do domínio (object | null) para o tipo aceito
   * pelo Prisma em colunas JSON (`NullableJsonNullValueInput | InputJsonValue`):
   * - `null`  → `Prisma.JsonNull` (SQL NULL explícito).
   * - objeto → passado como `InputJsonValue`.
   *
   * Sem essa tradução, o TypeScript reclama que `null` não é atribuível
   * a `NullableJsonNullValueInput | InputJsonValue | undefined`.
   */
  toPrismaCreate(data: CreateIdempotencyKeyReq) {
    return {
      key: data.key,
      orderId: data.orderId,
      paymentId: data.paymentId ?? null,
      responseStatus: data.responseStatus,
      responseBody:
        data.responseBody === null || data.responseBody === undefined
          ? Prisma.JsonNull
          : (data.responseBody as Prisma.InputJsonValue),
      expiresAt: data.expiresAt,
    };
  },
};
