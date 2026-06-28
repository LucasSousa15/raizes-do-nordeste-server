import { AuditLogRepository } from 'src/modules/audit/domain/repositories/audit-log.repositorie';
import { CreateAuditLogReq, IAuditLog } from 'src/modules/audit/domain/@types/audit';

export class InMemoryAuditLogRepository extends AuditLogRepository {
  public items: IAuditLog[] = [];

  async create(data: CreateAuditLogReq): Promise<IAuditLog> {
    const log: IAuditLog = {
      id: crypto.randomUUID(),
      userId: data.userId,
      action: data.action,
      details:
        typeof data.details === 'string'
          ? data.details
          : JSON.stringify(data.details),
      createdAt: new Date(),
    };
    this.items.push(log);
    return log;
  }


  async findByUserId(userId: string): Promise<IAuditLog[]> {
    return this.items
      .filter((l) => l.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByAction(action: string): Promise<IAuditLog[]> {
    return this.items
      .filter((l) => l.action === action)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}