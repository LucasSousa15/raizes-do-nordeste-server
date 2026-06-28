import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repositorie';
import { CreateAuditLogReq } from '../../domain/@types/audit';

@Injectable()
export class CreateAuditLogUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(data: CreateAuditLogReq): Promise<void> {
    await this.auditLogRepository.create(data);
  }
}
