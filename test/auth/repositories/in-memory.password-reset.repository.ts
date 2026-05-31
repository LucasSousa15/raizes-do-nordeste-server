import {
  PasswordResetData,
  PasswordResetRepository,
} from 'src/modules/auth/domain/repositories/password-reset.repositorie';

export class InMemoryPasswordResetRepository
  implements PasswordResetRepository
{
  public items: PasswordResetData[] = [];

  async create(
    data: Omit<PasswordResetData, 'id'>,
  ): Promise<PasswordResetData> {
    const passwordReset = {
      id: `password-reset-${this.items.length + 1}`,
      ...data,
    };

    this.items.push(passwordReset);

    return passwordReset;
  }

  async findByHashedToken(
    hashed_token: string,
  ): Promise<PasswordResetData | null> {
    const passwordReset = this.items.find(
      (item) => item.hashed_token === hashed_token,
    );

    return passwordReset ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
