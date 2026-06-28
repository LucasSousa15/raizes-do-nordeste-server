import type { Prisma, CustomerPromotion as PrismaCustomerPromotion, Promotion as PrismaPromotion } from '@prisma/client';
import { ICustomerPromotion } from 'src/modules/promotions/domain/@types/customer-promotion';
import { IPromotion } from 'src/modules/promotions/domain/@types/promotion';


type PrismaCustomerPromotionWithPromotion = PrismaCustomerPromotion & {
  promotion?: PrismaPromotion;
};

export class PrismaCustomerPromotionMapper {
  static toDomain(prisma: PrismaCustomerPromotionWithPromotion): ICustomerPromotion {
    return {
      id: prisma.id,
      customerId: prisma.customerId,
      promotionId: prisma.promotionId,
      used: prisma.used,
      createdAt: prisma.createdAt,
      ...(prisma.promotion && {
        promotion: {
          id: prisma.promotion.id,
          code: prisma.promotion.code,
          discount: prisma.promotion.discount,
          isActive: prisma.promotion.isActive,
          expiresAt: prisma.promotion.expiresAt,
          createdAt: prisma.promotion.createdAt,
        } as IPromotion,
      }),
    };
  }

  static toPrismaCreate(customerId: string, promotionId: string): Prisma.CustomerPromotionUncheckedCreateInput {
    return {
      customerId,
      promotionId,
    };
  }
}