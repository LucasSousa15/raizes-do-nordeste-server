import { CreateAuditLogReq, IAuditLog } from '../@types/audit';

export abstract class AuditLogRepository {
  abstract create(data: CreateAuditLogReq): Promise<IAuditLog>;
  abstract findByUserId(userId: string): Promise<IAuditLog[]>;
  abstract findByAction(action: string): Promise<IAuditLog[]>;
}
