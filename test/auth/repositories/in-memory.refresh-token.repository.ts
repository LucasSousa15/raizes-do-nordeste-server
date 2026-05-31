import {
  RefreshTokenData,
  RefreshTokenRepository,
} from 'src/modules/auth/domain/repositories/refresh-token.repositorie';

export class InMemoryRefreshTokenRepository
  implements RefreshTokenRepository
{
  public items: RefreshTokenData[] = [];

  async create(data: RefreshTokenData): Promise<void> {
    this.items.push(data);
  }

  async findById(id: string): Promise<RefreshTokenData | null> {
    const refreshToken = this.items.find((item) => item.id === id);
    return refreshToken ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.userId !== userId);
  }
}
