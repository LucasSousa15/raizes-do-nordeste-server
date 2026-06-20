import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { CreatePasswordResetUseCase } from 'src/modules/auth/application/use-cases/create-password-reset.use-case';
import { InMemoryUsersRepository } from '../../accounts/repositories/in-memory.users.repository';
import { InMemoryPasswordResetRepository } from '../repositories/in-memory.password-reset.repository';

describe('Create password reset tests', () => {
  let usersRepository: InMemoryUsersRepository;
  let passwordResetRepository: InMemoryPasswordResetRepository;
  let sut: CreatePasswordResetUseCase;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-31T12:00:00.000Z'));

    usersRepository = new InMemoryUsersRepository();
    passwordResetRepository = new InMemoryPasswordResetRepository();
    sut = new CreatePasswordResetUseCase(
      usersRepository,
      passwordResetRepository,
    );
  });

  it('should create a password reset token', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    const result = await sut.execute({
      email: 'john.doe@example.com',
    });

    const hashedToken = createHash('sha256')
      .update(result.token)
      .digest('hex');

    expect(result.token).toEqual(expect.any(String));
    expect(passwordResetRepository.items).toHaveLength(1);
    expect(passwordResetRepository.items[0]).toEqual(
      expect.objectContaining({
        hashed_token: hashedToken,
        user_id: 'user-1',
        expires_at: new Date('2026-05-31T13:00:00.000Z'),
      }),
    );
  });

  it('should not create a password reset token for an unknown user', async () => {
    await expect(() =>
      sut.execute({
        email: 'unknown@example.com',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);

    expect(passwordResetRepository.items).toHaveLength(0);
  });
});
