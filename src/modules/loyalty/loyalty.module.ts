import { Module } from '@nestjs/common';
import { UsersModule } from '../accounts/users.module';
import { GetLoyaltyBalanceUseCase } from './application/use-cases/get-loyalty-balance.use-case';
import { RedeemLoyaltyPointsUseCase } from './application/use-cases/redeem-loyalty-points.use-case';
import { LoyaltyController } from './infra/http/controllers/loyalty.controller';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [UsersModule, PromotionsModule],
  controllers: [LoyaltyController],
  providers: [GetLoyaltyBalanceUseCase, RedeemLoyaltyPointsUseCase],
})
export class LoyaltyModule {}
