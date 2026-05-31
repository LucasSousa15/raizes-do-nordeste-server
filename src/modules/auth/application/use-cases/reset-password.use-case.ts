import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { HashProvider } from 'src/core/providers/cryptography/models/hashing.service';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import { ResetPasswordRequest } from '../../@types/auth-types';
import { PasswordResetRepository } from '../../domain/repositories/password-reset.repositorie';
import { InvalidPasswordResetTokenError } from '../errors/invalid-password-reset-token.error';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly hashProvider: HashProvider,
  ) {}

  async execute({ token, password }: ResetPasswordRequest): Promise<void> {
    const passwordReset = await this.passwordResetRepository.findByHashedToken(
      this.hashToken(token),
    );

    if (!passwordReset) {
      throw new InvalidPasswordResetTokenError();
    }

    if (passwordReset.expires_at < new Date()) {
      await this.passwordResetRepository.delete(passwordReset.id);
      throw new InvalidPasswordResetTokenError();
    }

    const user = await this.usersRepository.findById(passwordReset.user_id);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.usersRepository.update({
      ...user,
      password: await this.hashProvider.hash(password),
    });

    await this.passwordResetRepository.delete(passwordReset.id);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
