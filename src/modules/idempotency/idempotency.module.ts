import { Module } from '@nestjs/common';
import { IdempotencyKeyRepository } from './domain/repositories/idempotency-key.repositorie';
import { PrismaIdempotencyKeyRepository } from './infra/database/prisma/repositories/prisma-idempotency-key.repositorie';

@Module({
  providers: [
    {
      provide: IdempotencyKeyRepository,
      useClass: PrismaIdempotencyKeyRepository,
    },
  ],
  exports: [IdempotencyKeyRepository],
})
export class IdempotencyModule {}