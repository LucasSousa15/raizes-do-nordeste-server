import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CoreModule } from 'src/core/core.module';
import { PasswordResetRepository } from './domain/repositories/password-reset.repositorie';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repositorie';
import { PrismaPasswordResetRepository } from './infra/database/prisma/repositories/prisma-password-reset.repositorie';
import { PrismaRefreshTokenRepository } from './infra/database/prisma/repositories/prisma-refresh-token.repositorie';
import { UsersModule } from '../accounts/users.module';
import { SignInUseCase } from './application/use-cases/sign-in.use-case';
import { CreateRefreshTokenUseCase } from './application/use-cases/create-refresh-token.use-case';
import { CreatePasswordResetUseCase } from './application/use-cases/create-password-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { JwtStrategy } from './infra/http/strategies/jwt-strategy';
import { JwtRefreshStrategy } from './infra/http/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './infra/http/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './infra/http/guards/jwt-refresh.guard';
import { PermissionGuard } from './infra/http/guards/permission.guard';
import { AuthController } from './infra/http/controllers/auth.controller';

@Module({
  imports: [CoreModule, ConfigModule, PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [
    SignInUseCase,
    CreateRefreshTokenUseCase,
    CreatePasswordResetUseCase,
    ResetPasswordUseCase,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    PermissionGuard,
    {
      provide: PasswordResetRepository,
      useClass: PrismaPasswordResetRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
  exports: [
    PasswordResetRepository,
    RefreshTokenRepository,
    SignInUseCase,
    CreateRefreshTokenUseCase,
    CreatePasswordResetUseCase,
    ResetPasswordUseCase,
    JwtAuthGuard,
    JwtRefreshGuard,
    PermissionGuard,
  ],
})
export class AuthModule {}
