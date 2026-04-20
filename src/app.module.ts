import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: 
  [
    ScheduleModule.forRoot(),
    CoreModule
  ],
})
export class AppModule {}
