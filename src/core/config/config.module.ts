import { Global, Module } from '@nestjs/common';
import { env } from './env';

@Global()
@Module({
  providers: [
    {
      provide: 'ENV',
      useValue: env,
    },
  ],
  exports: ['ENV'],
})
export class ConfigModule {}
