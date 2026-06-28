import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { IdempotencyKeyRepository } from '../../../../domain/repositories/idempotency-key.repositorie';
import {
  CreateIdempotencyKeyReq,
  IIdempotencyKey,
} from '../../../../domain/@types/idempotency-key';
import { IdempotencyKeyConflictError } from '../../../../application/errors/idempotency-key-conflict.error';
import { PrismaIdempotencyKeyMapper } from '../mappers/prisma-idempotency-key.mapper';

@Injectable()
export class PrismaIdempotencyKeyRepository extends IdempotencyKeyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Retorna a chave de idempotência **somente se ainda estiver dentro do TTL**.
   * Registros expirados são tratados como inexistentes — o caller pode então
   * prosseguir com uma nova tentativa de pagamento (a inserção subsequente
   * falhará com P2002, indicando corrida que será tratada no `create`).
   */
  async findByKey(key: string): Promise<IIdempotencyKey | null> {
    const record = await this.prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!record) return null;

    if (record.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    return PrismaIdempotencyKeyMapper.toDomain(record);
  }


  async create(data: CreateIdempotencyKeyReq): Promise<IIdempotencyKey> {
    try {
      const record = await this.prisma.idempotencyKey.create({
        data: PrismaIdempotencyKeyMapper.toPrismaCreate(data),
      });
      return PrismaIdempotencyKeyMapper.toDomain(record);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new IdempotencyKeyConflictError();
      }
      throw error;
    }
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}