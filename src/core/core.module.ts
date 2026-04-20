import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { CryptographyModule } from "./providers/cryptography/cryptography.module";
import { DatabaseModule } from "./providers/database/database.module";


@Global()
@Module({
  imports: [CryptographyModule, ConfigModule, DatabaseModule],
  exports: [DatabaseModule, ConfigModule, CryptographyModule],
  controllers: [],})
export class CoreModule {}