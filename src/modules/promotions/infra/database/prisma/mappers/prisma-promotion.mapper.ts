import type { Promotion as PrismaPromotion } from '@prisma/client';
import { IPromotion } from 'src/modules/promotions/domain/@types/promotion';

export class PrismaPromotionMapper {
  static toDomain(prisma: PrismaPromotion): IPromotion {
    return {
      id: prisma.id,
      code: prisma.code,
      discount: prisma.discount,
      isActive: prisma.isActive,
      expiresAt: prisma.expiresAt,
      createdAt: prisma.createdAt,
    };
  }
}
