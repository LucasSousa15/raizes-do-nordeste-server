import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { TokenService } from 'src/core/token/models/token.service';
import { UserStatus } from 'src/modules/accounts/domain/@types/users';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { SignInRequest, SignInResponse } from '../../domain/@types/auth-types';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { CreateRefreshTokenUseCase } from './create-refresh-token.use-case';

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashProvider: HashProvider,
    private readonly tokenProvider: TokenService,
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
  ) {}

  async execute({ email, password }: SignInRequest): Promise<SignInResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const matchPassword = await this.hashProvider.compare(password, user.password);

    if (!matchPassword) {
      throw new InvalidCredentialsError();
    }

    const verifiedEmail = user.status === UserStatus.ACTIVE;
    const tokenId = randomUUID();
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      verifiedEmail,
      tokenId,
    };

    const accessToken = await this.tokenProvider.signAccessToken(payload);
    const { refreshToken } = await this.createRefreshTokenUseCase.execute({
      userId: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      verifiedEmail,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
