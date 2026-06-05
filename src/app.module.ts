import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/accounts/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreModule,
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}
