import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import {
  RefreshTokenData,
  RefreshTokenRepository,
} from 'src/modules/auth/domain/repositories/refresh-token.repositorie';
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token.mapper';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RefreshTokenData): Promise<void> {
    const prismaData = PrismaRefreshTokenMapper.toPrisma(data);

    await this.prisma.refreshToken.create({
      data: prismaData,
    });
  }

  async findById(id: string): Promise<RefreshTokenData | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id },
    });

    if (!refreshToken) return null;

    return PrismaRefreshTokenMapper.toDomain(refreshToken);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
