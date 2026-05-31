import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import {
  PasswordResetData,
  PasswordResetRepository,
} from 'src/modules/auth/domain/repositories/password-reset.repositorie';
import { PrismaPasswordResetMapper } from '../mappers/prisma-password-reset.mapper';

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<PasswordResetData, 'id'>,
  ): Promise<PasswordResetData> {
    const prismaData = PrismaPasswordResetMapper.toPrisma(data);
    const passwordReset = await this.prisma.passwordReset.create({
      data: prismaData,
    });

    return PrismaPasswordResetMapper.toDomain(passwordReset);
  }

  async findByHashedToken(
    hashed_token: string,
  ): Promise<PasswordResetData | null> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { hashed_token },
    });

    if (!passwordReset) return null;

    return PrismaPasswordResetMapper.toDomain(passwordReset);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.passwordReset.delete({
      where: { id },
    });
  }
}
