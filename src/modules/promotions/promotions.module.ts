import { Module } from "@nestjs/common";
import { CustomerPromotionRepository } from "./domain/repositories/customer-promotion.repositorie";
import { PrismaCustomerPromotionRepository } from "./infra/database/prisma/repositories/prisma-customer-promotion.repositories";
import { PromotionRepository } from "./domain/repositories/promotion.repositorie";
import { PrismaPromotionRepository } from "./infra/database/prisma/repositories/prisma-promotion.repositorie";

@Module({
  providers: [
    { provide: CustomerPromotionRepository, useClass: PrismaCustomerPromotionRepository },
    { provide: PromotionRepository, useClass: PrismaPromotionRepository },
  ],
  exports: [PromotionRepository, CustomerPromotionRepository],
})
export class PromotionsModule {}