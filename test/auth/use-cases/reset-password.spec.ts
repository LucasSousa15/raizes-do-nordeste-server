import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { InvalidPasswordResetTokenError } from 'src/modules/auth/application/errors/invalid-password-reset-token.error';
import { ResetPasswordUseCase } from 'src/modules/auth/application/use-cases/reset-password.use-case';
import { InMemoryUsersRepository } from '../../accounts/repositories/in-memory.users.repository';
import { InMemoryPasswordResetRepository } from '../repositories/in-memory.password-reset.repository';

class FakeHashProvider implements HashProvider {
  async hash(payload: string): Promise<string> {
    return `hashed:${payload}`;
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${payload}`;
  }
}

describe('Reset password tests', () => {
  let usersRepository: InMemoryUsersRepository;
  let passwordResetRepository: InMemoryPasswordResetRepository;
  let hashProvider: FakeHashProvider;
  let sut: ResetPasswordUseCase;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-31T12:00:00.000Z'));

    usersRepository = new InMemoryUsersRepository();
    passwordResetRepository = new InMemoryPasswordResetRepository();
    hashProvider = new FakeHashProvider();
    sut = new ResetPasswordUseCase(
      usersRepository,
      passwordResetRepository,
      hashProvider,
    );
  });

  it('should reset the user password and delete the used token', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'old-password',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    await passwordResetRepository.create({
      hashed_token: hashToken('valid-token'),
      user_id: 'user-1',
      expires_at: new Date('2026-05-31T13:00:00.000Z'),
    });

    await sut.execute({
      token: 'valid-token',
      password: 'new-password',
    });

    const user = await usersRepository.findById('user-1');

    expect(user?.password).toBe('hashed:new-password');
    expect(passwordResetRepository.items).toHaveLength(0);
  });

  it('should not reset the password with an invalid token', async () => {
    await expect(() =>
      sut.execute({
        token: 'invalid-token',
        password: 'new-password',
      }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);
  });

  it('should delete expired tokens and not reset the password', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'old-password',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    await passwordResetRepository.create({
      hashed_token: hashToken('expired-token'),
      user_id: 'user-1',
      expires_at: new Date('2026-05-31T11:59:59.000Z'),
    });

    await expect(() =>
      sut.execute({
        token: 'expired-token',
        password: 'new-password',
      }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);

    const user = await usersRepository.findById('user-1');

    expect(user?.password).toBe('old-password');
    expect(passwordResetRepository.items).toHaveLength(0);
  });

  it('should not reset the password when the token user does not exist', async () => {
    await passwordResetRepository.create({
      hashed_token: hashToken('valid-token'),
      user_id: 'missing-user',
      expires_at: new Date('2026-05-31T13:00:00.000Z'),
    });

    await expect(() =>
      sut.execute({
        token: 'valid-token',
        password: 'new-password',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
