import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { PromotionRepository } from '../../../../domain/repositories/promotion.repositorie';
import { IPromotion } from '../../../../domain/@types/promotion';
import { PrismaPromotionMapper } from '../mappers/prisma-promotion.mapper';
import { Prisma } from '@prisma/client';
import { PromotionCodeAlreadyExistsError } from 'src/modules/loyalty/application/errors/promotion-code-duplicated.error';

@Injectable()
export class PrismaPromotionRepository extends PromotionRepository {

  constructor(private readonly prisma: PrismaService) {
    super();
  }

async create(data: { code: string; discount: number; isActive: boolean; expiresAt: Date }): Promise<IPromotion> {
  try {
    const created = await this.prisma.promotion.create({ data });
    return PrismaPromotionMapper.toDomain(created);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new PromotionCodeAlreadyExistsError(data.code);
    }
    throw error;
  }
}

  async findByCode(code: string): Promise<IPromotion | null> {
    const promotion = await this.prisma.promotion.findUnique({ where: { code } });
    return promotion ? PrismaPromotionMapper.toDomain(promotion) : null;
  }

  async findAll(): Promise<IPromotion[]> {
    const promotions = await this.prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return promotions.map(PrismaPromotionMapper.toDomain);
  }

  async findActiveByDiscount(discount: number): Promise<IPromotion | null> {
    const promo = await this.prisma.promotion.findFirst({
      where: {
        discount,
        isActive: true,
        expiresAt: { gte: new Date() },
      },
    });
    return promo ? PrismaPromotionMapper.toDomain(promo) : null;
  }
}
