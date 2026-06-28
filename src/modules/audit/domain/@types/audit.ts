export interface IAuditLog {
  id: string;
  userId: string | null;
  action: string;
  details: string;
  createdAt: Date;
}

export interface CreateAuditLogReq {
  userId: string | null;
  action: string;
  details: Record<string, unknown> | string;
}
