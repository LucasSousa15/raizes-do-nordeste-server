import { IPromotion } from '../@types/promotion';

export abstract class PromotionRepository {
  abstract create(data: { code: string; discount: number; isActive: boolean; expiresAt: Date }): Promise<IPromotion>;
  abstract findByCode(code: string): Promise<IPromotion | null>;
  abstract findAll(): Promise<IPromotion[]>;
  abstract findActiveByDiscount(discount: number): Promise<IPromotion | null>;
}
