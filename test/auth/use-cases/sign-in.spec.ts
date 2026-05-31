import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { JwtPayload, TokenService } from 'src/core/token/models/token.service';
import {
  UserProfile,
  UserRole,
  UserStatus,
} from 'src/modules/accounts/@types/users';
import { InvalidCredentialsError } from 'src/modules/auth/application/errors/invalid-credentials.error';
import { CreateRefreshTokenUseCase } from 'src/modules/auth/application/use-cases/create-refresh-token.use-case';
import { SignInUseCase } from 'src/modules/auth/application/use-cases/sign-in.use-case';
import { InMemoryUsersRepository } from '../../accounts/repositories/in-memory.users.repository';

class FakeHashProvider implements HashProvider {
  async hash(payload: string): Promise<string> {
    return `hashed:${payload}`;
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${payload}`;
  }
}

class FakeTokenService implements TokenService {
  public accessPayload: JwtPayload | null = null;

  async signAccessToken(payload: JwtPayload): Promise<string> {
    this.accessPayload = payload;
    return `access:${payload.tokenId}`;
  }

  async signRefreshToken(payload: JwtPayload): Promise<string> {
    return `refresh:${payload.tokenId}`;
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    throw new Error(`Not implemented: ${token}`);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    throw new Error(`Not implemented: ${token}`);
  }

  getRefreshTokenExpiresAt(): Date {
    return new Date('2026-06-07T12:00:00.000Z');
  }
}

describe('Sign in tests', () => {
  let usersRepository: InMemoryUsersRepository;
  let hashProvider: FakeHashProvider;
  let tokenProvider: FakeTokenService;
  let createRefreshTokenUseCase: Pick<CreateRefreshTokenUseCase, 'execute'>;
  let sut: SignInUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashProvider = new FakeHashProvider();
    tokenProvider = new FakeTokenService();
    createRefreshTokenUseCase = {
      execute: vi.fn().mockResolvedValue({ refreshToken: 'refresh-token' }),
    };

    sut = new SignInUseCase(
      usersRepository,
      hashProvider,
      tokenProvider,
      createRefreshTokenUseCase as CreateRefreshTokenUseCase,
    );
  });

  it('should sign in an active user', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: await hashProvider.hash('password'),
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      profile: UserProfile.KITCHEN,
    });

    const result = await sut.execute({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(result).toEqual({
      accessToken: expect.stringMatching(/^access:/),
      refreshToken: 'refresh-token',
    });
    expect(tokenProvider.accessPayload).toEqual(
      expect.objectContaining({
        sub: 'user-1',
        email: 'john.doe@example.com',
        role: UserRole.STAFF,
        profile: UserProfile.KITCHEN,
        verifiedEmail: true,
        tokenId: expect.any(String),
      }),
    );
    expect(createRefreshTokenUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'john.doe@example.com',
      role: UserRole.STAFF,
      profile: UserProfile.KITCHEN,
      verifiedEmail: true,
    });
  });

  it('should sign inactive users with verifiedEmail false', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: await hashProvider.hash('password'),
      role: UserRole.ADMIN,
      status: UserStatus.INACTIVE,
    });

    await sut.execute({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(tokenProvider.accessPayload?.verifiedEmail).toBe(false);
    expect(createRefreshTokenUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        verifiedEmail: false,
      }),
    );
  });

  it('should not sign in with an unknown email', async () => {
    await expect(() =>
      sut.execute({
        email: 'unknown@example.com',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(createRefreshTokenUseCase.execute).not.toHaveBeenCalled();
  });

  it('should not sign in with an invalid password', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: await hashProvider.hash('password'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    await expect(() =>
      sut.execute({
        email: 'john.doe@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(createRefreshTokenUseCase.execute).not.toHaveBeenCalled();
  });
});
