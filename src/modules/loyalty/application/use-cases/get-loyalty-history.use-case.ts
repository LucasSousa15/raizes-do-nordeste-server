import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from 'src/modules/audit/domain/repositories/audit-log.repositorie';
import { IAuditLog } from 'src/modules/audit/domain/@types/audit';

export type LoyaltyHistoryEntryType = 'EARN' | 'REDEEM' | 'ORDER_PAID';

export interface LoyaltyHistoryEntry {
  type: LoyaltyHistoryEntryType;
  pointsDelta: number;
  orderId?: string;
  couponCode?: string;
  promotionId?: string;
  paymentId?: string;
  createdAt: Date;
}

const RELEVANT_ACTIONS = new Set<string>([
  'POINTS_EARNED',
  'POINTS_REDEEMED',
  'PAYMENT_APPROVED',
]);

@Injectable()
export class GetLoyaltyHistoryUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(customerId: string): Promise<LoyaltyHistoryEntry[]> {
    const logs = await this.auditLogRepository.findByUserId(customerId);
    return logs
      .filter((log) => RELEVANT_ACTIONS.has(log.action))
      .map((log) => this.toEntry(log))
      .filter((entry): entry is LoyaltyHistoryEntry => entry !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private toEntry(log: IAuditLog): LoyaltyHistoryEntry | null {
    const details = this.parseDetails(log.details);

    switch (log.action) {
      case 'POINTS_EARNED': {
        const earned = this.numberOrNull(details.earnedPoints);
        if (earned === null) return null;
        return {
          type: 'EARN',
          pointsDelta: earned,
          orderId: this.stringOrUndefined(details.orderId),
          paymentId: this.stringOrUndefined(details.paymentId),
          createdAt: log.createdAt,
        };
      }
      case 'POINTS_REDEEMED': {
        const redeemed = this.numberOrNull(details.redeemedPoints);
        if (redeemed === null) return null;
        return {
          type: 'REDEEM',
          pointsDelta: -redeemed,
          couponCode: this.stringOrUndefined(details.couponCode),
          promotionId: this.stringOrUndefined(details.promotionId),
          createdAt: log.createdAt,
        };
      }
      case 'PAYMENT_APPROVED': {
        const total = this.numberOrNull(details.totalAmount);
        if (total === null) return null;
        const earned = Math.floor(total * 0.1);
        return {
          type: 'ORDER_PAID',
          pointsDelta: earned,
          orderId: this.stringOrUndefined(details.orderId),
          paymentId: this.stringOrUndefined(details.paymentId),
          createdAt: log.createdAt,
        };
      }
      default:
        return null;
    }
  }

  private parseDetails(raw: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  private numberOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private stringOrUndefined(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }
}