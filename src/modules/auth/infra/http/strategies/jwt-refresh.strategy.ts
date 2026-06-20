import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { JwtPayload } from 'src/core/token/models/token.service';
import { UserStatus } from 'src/modules/accounts/domain/@types/users';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { RefreshTokenRepository } from 'src/modules/auth/domain/repositories/refresh-token.repositorie';
import { AuthenticatedUser } from './jwt-strategy';

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken?: string;
  };
}

export interface AuthenticatedRefreshUser extends AuthenticatedUser {
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashProvider: HashProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET')!,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(
    req: RefreshTokenRequest,
    payload: JwtPayload,
  ): Promise<AuthenticatedRefreshUser> {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresh não foi enviado.');
    }

    const persistedRefreshToken = await this.refreshTokenRepository.findById(
      payload.tokenId,
    );

    if (!persistedRefreshToken) {
      throw new UnauthorizedException('Token de refresh inválido.');
    }

    const isRefreshTokenValid = await this.hashProvider.compare(
      refreshToken,
      persistedRefreshToken.hashed_token,
    );

    if (!isRefreshTokenValid || persistedRefreshToken.expires_at < new Date()) {
      throw new UnauthorizedException('Token de refresh inválido.');
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user || user.id !== persistedRefreshToken.userId) {
      throw new UnauthorizedException('Token de refresh inválido.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile,
      verifiedEmail: user.status === UserStatus.ACTIVE,
      tokenId: payload.tokenId,
      refreshToken,
    };
  }
}
