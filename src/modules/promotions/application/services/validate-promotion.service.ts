import { Injectable, BadRequestException } from '@nestjs/common';
import { PromotionRepository } from '../../domain/repositories/promotion.repositorie';

@Injectable()
export class ValidatePromotionService {
  constructor(private readonly promotionRepo: PromotionRepository) {}

  async execute(code: string): Promise<number> {
    const promo = await this.promotionRepo.findByCode(code);
    if (!promo || !promo.isActive || new Date() > promo.expiresAt) {
      throw new BadRequestException('Cupom inválido ou expirado');
    }
    return promo.discount;
  }
}