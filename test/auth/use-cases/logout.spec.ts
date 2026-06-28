import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from 'src/modules/auth/infra/http/controllers/auth.controller';
import { InMemoryRefreshTokenRepository } from '../repositories/in-memory.refresh-token.repository';
import type { AuthenticatedRefreshUser } from 'src/modules/auth/infra/http/strategies/jwt-refresh.strategy';

describe('AuthController.logout', () => {
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let controller: AuthController;

  beforeEach(() => {
    vi.restoreAllMocks();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();

    controller = new AuthController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      refreshTokenRepository,
    );

    refreshTokenRepository.items.push({
      id: 'token-1',
      hashed_token: 'hashed',
      userId: 'u1',
      role: 'customer' as any,
      expires_at: new Date(Date.now() + 60_000),
      created_at: new Date(),
    });
    refreshTokenRepository.items.push({
      id: 'token-2',
      hashed_token: 'hashed',
      userId: 'u1',
      role: 'customer' as any,
      expires_at: new Date(Date.now() + 60_000),
      created_at: new Date(),
    });
  });

  it('deletes the refresh token identified by the current session', async () => {
    const user = {
      id: 'u1',
      email: 'user@example.com',
      name: 'User',
      role: 'customer' as any,
      profile: undefined,
      verifiedEmail: true,
      tokenId: 'token-1',
      refreshToken: 'rt',
    } as AuthenticatedRefreshUser;

    await controller.logout(user);

    expect(refreshTokenRepository.items).toHaveLength(1);
    expect(refreshTokenRepository.items[0].id).toBe('token-2');
  });

  it('does not throw when the token id does not exist anymore (idempotent)', async () => {
    const user = {
      id: 'u1',
      email: 'user@example.com',
      name: 'User',
      role: 'customer' as any,
      profile: undefined,
      verifiedEmail: true,
      tokenId: 'already-deleted',
      refreshToken: 'rt',
    } as AuthenticatedRefreshUser;

    await expect(controller.logout(user)).resolves.toBeUndefined();
    expect(refreshTokenRepository.items).toHaveLength(2);
  });
});