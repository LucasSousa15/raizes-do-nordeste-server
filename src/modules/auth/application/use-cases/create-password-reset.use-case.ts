import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { UserNotFoundError } from 'src/modules/accounts/application/errors/user-not-found.error';
import {
  CreatePasswordResetRequest,
  CreatePasswordResetResponse,
} from '../../domain/@types/auth-types';
import { PasswordResetRepository } from '../../domain/repositories/password-reset.repositorie';

@Injectable()
export class CreatePasswordResetUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async execute({
    email,
  }: CreatePasswordResetRequest): Promise<CreatePasswordResetResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    const token = randomUUID();

    await this.passwordResetRepository.create({
      hashed_token: this.hashToken(token),
      user_id: user.id,
      expires_at: this.getExpiresAt(),
    });

    return {
      token,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getExpiresAt(): Date {
    return new Date(Date.now() + 60 * 60 * 1000);
  }
}
