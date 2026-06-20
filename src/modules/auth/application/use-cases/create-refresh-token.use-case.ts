import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { TokenService } from 'src/core/token/models/token.service';
import {
  CreateRefreshTokenRequest,
  CreateRefreshTokenResponse,
} from '../../domain/@types/auth-types';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repositorie';

@Injectable()
export class CreateRefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashProvider: HashProvider,
    private readonly tokenProvider: TokenService,
  ) {}

  async execute({
    userId,
    email,
    role,
    profile,
    verifiedEmail,
  }: CreateRefreshTokenRequest): Promise<CreateRefreshTokenResponse> {
    const tokenId = randomUUID();
    const refreshToken = await this.tokenProvider.signRefreshToken({
      sub: userId,
      email,
      role,
      profile,
      verifiedEmail,
      tokenId,
    });

    const hashedRefreshToken = await this.hashProvider.hash(refreshToken);

    await this.refreshTokenRepository.create({
      id: tokenId,
      hashed_token: hashedRefreshToken,
      userId,
      role,
      expires_at: this.tokenProvider.getRefreshTokenExpiresAt(),
    });

    return {
      refreshToken,
    };
  }
}
