import { IAuditLog } from 'src/modules/audit/domain/@types/audit';
import { AuditLog } from 'src/modules/audit/domain/entities/audit-log.entity';
import type { AuditLog as PrismaAuditLog } from '@prisma/client';

export class PrismaAuditLogMapper {
  static toDomain(prisma: PrismaAuditLog): IAuditLog {
    return {
      id: prisma.id,
      userId: prisma.userId,
      action: prisma.action,
      details: prisma.details,
      createdAt: prisma.createdAt,
    };
  }

  static toEntity(prisma: PrismaAuditLog): AuditLog {
    return AuditLog.fromPrisma(this.toDomain(prisma));
  }
}
