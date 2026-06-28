import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { UserRole } from 'src/modules/accounts/domain/@types/users';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import { ConsentRequiredError } from '../errors/consent-required.error';
import { InsufficientPointsError } from '../errors/insufficient-points.error';
import { LoyaltyCustomersOnlyError } from '../errors/customers-only.error';
import { PromotionRepository } from 'src/modules/promotions/domain/repositories/promotion.repositorie';
import { CustomerPromotionRepository } from 'src/modules/promotions/domain/repositories/customer-promotion.repositorie';

import { randomUUID } from 'crypto';
import { PromotionCodeAlreadyExistsError } from '../errors/promotion-code-duplicated.error';
import { CouponAlreadyRedeemedError } from '../errors/cupom-already-redeem.error';

export type RedeemLoyaltyPointsReq = {
  userId: string;
  points: number;
};

export type RedeemLoyaltyPointsResult = {
  customerId: string;
  redeemedPoints: number;
  remainingPoints: number;
  couponCode: string;
};

@Injectable()
export class RedeemLoyaltyPointsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly customerPromotionRepository: CustomerPromotionRepository,
  ) {}

  async execute(data: RedeemLoyaltyPointsReq): Promise<RedeemLoyaltyPointsResult> {
    const user = await this.usersRepository.findById(data.userId);
    if (!user) throw new UserNotFoundError();

    if (user.role !== UserRole.CUSTOMER || !user.customerData) {
      throw new LoyaltyCustomersOnlyError();
    }
    if (!user.customerData.consent) throw new ConsentRequiredError();
    if (data.points <= 0 || user.customerData.points < data.points) {
      throw new InsufficientPointsError();
    }

    const discount = this.getDiscountForPoints(data.points);
    if (!discount) throw new BadRequestException('Nenhum cupom disponível para essa quantidade de pontos');

    // Gera código único com até 3 tentativas em caso de colisão
    const MAX_RETRIES = 3;
    let promotion;
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
      try {
        const code = this.generateCode();
        promotion = await this.promotionRepository.create({
          code,
          discount,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        break;
      } catch (error: unknown) {
        if (error instanceof PromotionCodeAlreadyExistsError && attempts < MAX_RETRIES - 1) {
          attempts++;
          continue;
        }
        throw error;
      }
    }

    if (!promotion) {
      throw new BadRequestException('Não foi possível gerar o cupom. Tente novamente.');
    }

    const remainingPoints = user.customerData.points - data.points;
    await this.usersRepository.update({
      ...user,
      customerData: {
        ...user.customerData,
        points: remainingPoints,
        updatedAt: new Date(),
      },
    });

    try {
      await this.customerPromotionRepository.create(user.customerData.id, promotion.id);
    } catch (error: unknown) {
      if (error instanceof CouponAlreadyRedeemedError) {
        throw new ConflictException('Este cupom já foi resgatado anteriormente.');
      }
      throw error;
    }

    return {
      customerId: user.id,
      redeemedPoints: data.points,
      remainingPoints,
      couponCode: promotion.code,
    };
  }

  private getDiscountForPoints(points: number): number | null {
    if (points >= 20) return 0.10;
    if (points >= 10) return 0.05;
    return null;
  }

  private generateCode(): string {
    return randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  }
}