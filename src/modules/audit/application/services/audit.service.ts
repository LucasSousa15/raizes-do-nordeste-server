import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from 'src/modules/audit/domain/repositories/audit-log.repositorie';
import { CreateAuditLogReq } from 'src/modules/audit/domain/@types/audit';


@Injectable()
export class AuditService {
  constructor(private readonly auditLogRepository: AuditLogRepository) { }

  async logAction(userId: string | null, action: string, details: Record<string, unknown> | string): Promise<void> {
    const req: CreateAuditLogReq = { userId, action, details };
    await this.auditLogRepository.create(req);
  }
}
