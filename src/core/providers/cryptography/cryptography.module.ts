import { Module } from '@nestjs/common';

import { HashProvider } from './models/hashing.service';
import { BcryptProvider } from './implementation/brcypt.provider';

@Module({
  providers: [
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
  ],
  exports: [HashProvider],
})
export class CryptographyModule {}
