import { ICustomerPromotion } from '../@types/customer-promotion';


export abstract class CustomerPromotionRepository {
  abstract create(customerId: string, promotionId: string): Promise<ICustomerPromotion>;
  abstract findValidByUserAndCode(userId: string, code: string): Promise<ICustomerPromotion | null>;
  abstract markAsUsed(id: string): Promise<void>;
}