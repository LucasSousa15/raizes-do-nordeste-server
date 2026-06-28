import { ICustomerPromotion } from 'src/modules/promotions/domain/@types/customer-promotion';
import { IPromotion } from 'src/modules/promotions/domain/@types/promotion';
import { CustomerPromotionRepository } from 'src/modules/promotions/domain/repositories/customer-promotion.repositorie';
    
export class InMemoryCustomerPromotionRepository extends CustomerPromotionRepository {
  private customerPromotions: (ICustomerPromotion & { promotion?: IPromotion })[] = [];

  async create(customerId: string, promotionId: string): Promise<ICustomerPromotion> {
    const newCp: ICustomerPromotion = {
      id: crypto.randomUUID(),
      customerId,
      promotionId,
      used: false,
      createdAt: new Date(),
    };
    this.customerPromotions.push(newCp);
    return newCp;
  }

  async findValidByUserAndCode(userId: string, code: string): Promise<ICustomerPromotion | null> {
    return this.customerPromotions.find(cp => {
      return (cp as any).userId === userId && cp.promotion?.code === code && !cp.used;
    }) || null;
  }

  async markAsUsed(id: string): Promise<void> {
    const cp = this.customerPromotions.find(c => c.id === id);
    if (cp) cp.used = true;
  }
}