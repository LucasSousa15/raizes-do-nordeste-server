import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { CryptographyModule } from "./providers/cryptography/cryptography.module";
import { DatabaseModule } from "./providers/database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { TokenModule } from "./token/token.module";


@Global()
@Module({
  imports: [CryptographyModule, ConfigModule, DatabaseModule, TokenModule],
  exports: [DatabaseModule, ConfigModule, CryptographyModule, TokenModule],
  controllers: [],})
  
export class CoreModule {}