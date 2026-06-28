import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { CustomerPromotionRepository } from '../../../../domain/repositories/customer-promotion.repositorie';
import { PrismaCustomerPromotionMapper } from '../mappers/prisma-customer-promotion.mapper';
import { ICustomerPromotion } from 'src/modules/promotions/domain/@types/customer-promotion';

@Injectable()
export class PrismaCustomerPromotionRepository implements CustomerPromotionRepository {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, promotionId: string): Promise<ICustomerPromotion> {
    const data = PrismaCustomerPromotionMapper.toPrismaCreate(customerId, promotionId);
    const result = await this.prisma.customerPromotion.create({ data });
    return PrismaCustomerPromotionMapper.toDomain(result);
  }

  async findValidByUserAndCode(userId: string, code: string): Promise<ICustomerPromotion | null> {
  const result = await this.prisma.customerPromotion.findFirst({
    where: {
      used: false,
      customer: { userId },
      promotion: {
        code,
        isActive: true,
        expiresAt: { gte: new Date() },
      },
    },
    include: { promotion: true },
  });
  return result ? PrismaCustomerPromotionMapper.toDomain(result) : null;
}

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.customerPromotion.update({
      where: { id },
      data: { used: true },
    });
  }
}