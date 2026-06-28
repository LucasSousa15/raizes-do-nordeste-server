import { IAuditLog } from 'src/modules/audit/domain/@types/audit';

export class AuditLog {
  private props: IAuditLog;

  private constructor(props: IAuditLog) {
    this.props = props;
  }

  public static fromPrisma(props: IAuditLog): AuditLog {
    return new AuditLog(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string | null {
    return this.props.userId;
  }

  public get action(): string {
    return this.props.action;
  }

  public get details(): string {
    return this.props.details;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
