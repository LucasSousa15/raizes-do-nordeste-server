import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repositorie';
import { CreateAuditLogReq, IAuditLog } from '../../../../domain/@types/audit';
import { PrismaAuditLogMapper } from '../mappers/prisma-audit-log.mapper';

@Injectable()
export class PrismaAuditLogRepository extends AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: CreateAuditLogReq): Promise<IAuditLog> {
    const details =
      typeof data.details === 'string'
        ? data.details
        : JSON.stringify(data.details);

    const log = await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        details,
      },
    });

    return PrismaAuditLogMapper.toDomain(log);
  }

  async findByUserId(userId: string): Promise<IAuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map(PrismaAuditLogMapper.toDomain);
  }

  async findByAction(action: string): Promise<IAuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map(PrismaAuditLogMapper.toDomain);
  }
}
