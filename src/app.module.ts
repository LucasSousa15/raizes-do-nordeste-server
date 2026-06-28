import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/accounts/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { StoresModule } from './modules/stores/stores.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    StoresModule,
    StocksModule,
    PaymentsModule,
    OrdersModule,
    LoyaltyModule,
    AuditModule,
  ],
})
export class AppModule {}

