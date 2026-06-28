import { Global, Module } from '@nestjs/common';
import { AuditLogRepository } from './domain/repositories/audit-log.repositorie';
import { PrismaAuditLogRepository } from './infra/database/prisma/repositories/prisma-audit-log.repositorie';
import { CreateAuditLogUseCase } from './application/use-cases/create-audit-log.use-case';
import { AuditService } from './application/services/audit.service';

@Global()
@Module({
  providers: [
    AuditService,
    CreateAuditLogUseCase,
    {
      provide: AuditLogRepository,
      useClass: PrismaAuditLogRepository,
    },
  ],
  exports: [AuditService, CreateAuditLogUseCase, AuditLogRepository],
})
export class AuditModule {}
