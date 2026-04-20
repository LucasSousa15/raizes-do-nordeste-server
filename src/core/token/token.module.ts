import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "./models/token.service";
import { JwtTokenService } from "./implementation/jwt-token.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [ConfigModule, JwtModule.register({})],
    providers: [{provide: TokenService, useClass: JwtTokenService}],
    exports: [TokenService],
})

export class TokenModule {}