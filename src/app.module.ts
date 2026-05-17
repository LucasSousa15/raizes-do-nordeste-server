import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/accounts/users.module';

@Module({
  imports: 
  [
    ScheduleModule.forRoot(),
    CoreModule,
    UsersModule,
  ],
})
export class AppModule {}
