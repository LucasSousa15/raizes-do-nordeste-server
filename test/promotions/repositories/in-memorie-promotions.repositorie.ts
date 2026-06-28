import { PromotionRepository } from 'src/modules/promotions/domain/repositories/promotion.repositorie';
import { IPromotion } from 'src/modules/promotions/domain/@types/promotion';

export class InMemoryPromotionRepository extends PromotionRepository {

  private promotions: IPromotion[] = [];



  async create(data: { code: string; discount: number; isActive: boolean; expiresAt: Date }): Promise<IPromotion> {
    const promotion: IPromotion = {
      id: crypto.randomUUID(),
      code: data.code,
      discount: data.discount,
      isActive: data.isActive,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    this.promotions.push(promotion);
    return promotion;
  }

  async findById(id: string): Promise<IPromotion | null> {
    return this.promotions.find(p => p.id === id) || null;
  }

  async findAll(): Promise<IPromotion[]> {
    return this.promotions;
  }

  async findByCode(code: string): Promise<IPromotion | null> {
    return this.promotions.find(p => p.code === code) || null;
  }

  async findActiveByDiscount(discount: number): Promise<IPromotion | null> {
    return this.promotions.find(p => p.discount === discount && p.isActive && p.expiresAt > new Date()) || null;
  }
}