import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { JwtPayload, TokenService } from 'src/core/token/models/token.service';
import { UserProfile, UserRole } from 'src/modules/accounts/domain/@types/users';
import { CreateRefreshTokenUseCase } from 'src/modules/auth/application/use-cases/create-refresh-token.use-case';
import { InMemoryRefreshTokenRepository } from '../repositories/in-memory.refresh-token.repository';

class FakeHashProvider implements HashProvider {
  async hash(payload: string): Promise<string> {
    return `hashed:${payload}`;
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${payload}`;
  }
}

class FakeTokenService implements TokenService {
  public refreshPayload: JwtPayload | null = null;
  public refreshTokenExpiresAt = new Date('2026-06-07T12:00:00.000Z');

  async signAccessToken(payload: JwtPayload): Promise<string> {
    return `access:${payload.tokenId}`;
  }

  async signRefreshToken(payload: JwtPayload): Promise<string> {
    this.refreshPayload = payload;
    return `refresh:${payload.tokenId}`;
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    throw new Error(`Not implemented: ${token}`);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    throw new Error(`Not implemented: ${token}`);
  }

  getRefreshTokenExpiresAt(): Date {
    return this.refreshTokenExpiresAt;
  }
}

describe('Create refresh token tests', () => {
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let hashProvider: FakeHashProvider;
  let tokenProvider: FakeTokenService;
  let sut: CreateRefreshTokenUseCase;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-31T12:00:00.000Z'));

    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    hashProvider = new FakeHashProvider();
    tokenProvider = new FakeTokenService();

    sut = new CreateRefreshTokenUseCase(
      refreshTokenRepository,
      hashProvider,
      tokenProvider,
    );
  });

  it('should create a refresh token and persist its hashed value', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      email: 'john.doe@example.com',
      role: UserRole.STAFF,
      profile: UserProfile.KITCHEN,
      verifiedEmail: true,
    });

    expect(result.refreshToken).toEqual(expect.stringMatching(/^refresh:/));
    expect(refreshTokenRepository.items).toHaveLength(1);
    expect(refreshTokenRepository.items[0]).toEqual(
      expect.objectContaining({
        id: tokenProvider.refreshPayload?.tokenId,
        hashed_token: `hashed:${result.refreshToken}`,
        userId: 'user-1',
        role: UserRole.STAFF,
        expires_at: new Date('2026-06-07T12:00:00.000Z'),
      }),
    );
  });

  it('should sign the refresh token with the expected payload', async () => {
    await sut.execute({
      userId: 'user-1',
      email: 'john.doe@example.com',
      role: UserRole.ADMIN,
      verifiedEmail: false,
    });

    expect(tokenProvider.refreshPayload).toEqual(
      expect.objectContaining({
        sub: 'user-1',
        email: 'john.doe@example.com',
        role: UserRole.ADMIN,
        profile: undefined,
        verifiedEmail: false,
        tokenId: expect.any(String),
      }),
    );
  });

  it('should use the expiration date provided by the token service', async () => {
    tokenProvider.refreshTokenExpiresAt = new Date('2026-05-31T13:00:00.000Z');

    await sut.execute({
      userId: 'user-1',
      email: 'john.doe@example.com',
      role: UserRole.ADMIN,
      verifiedEmail: true,
    });

    expect(refreshTokenRepository.items[0].expires_at).toEqual(
      new Date('2026-05-31T13:00:00.000Z'),
    );
  });
});
