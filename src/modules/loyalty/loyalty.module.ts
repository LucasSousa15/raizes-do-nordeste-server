import { Module } from '@nestjs/common';
import { UsersModule } from '../accounts/users.module';
import { GetLoyaltyBalanceUseCase } from './application/use-cases/get-loyalty-balance.use-case';
import { RedeemLoyaltyPointsUseCase } from './application/use-cases/redeem-loyalty-points.use-case';
import { GetLoyaltyHistoryUseCase } from './application/use-cases/get-loyalty-history.use-case';
import { LoyaltyController } from './infra/http/controllers/loyalty.controller';
import { PromotionsModule } from '../promotions/promotions.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UsersModule, PromotionsModule, AuditModule],
  controllers: [LoyaltyController],
  providers: [
    GetLoyaltyBalanceUseCase,
    RedeemLoyaltyPointsUseCase,
    GetLoyaltyHistoryUseCase,
  ],
})
export class LoyaltyModule {}
