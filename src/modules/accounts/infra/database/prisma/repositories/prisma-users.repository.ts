import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import {
  IUser,
  PaginatedUsers,
  UserStatus,
} from 'src/modules/accounts/domain/@types/users';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import {
  PrismaPaginatedUsersMapper,
  PrismaUserMapper,
  statusToPrisma,
} from '../mappers/prisma-user.mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}
  findByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user
      .findUnique({
        where: { email },
        include: { customer: true },
      })
      .then((user) => {
        if (!user) return null;
        return PrismaUserMapper.toDomain(user);
      });
  }

  findById(id: string): Promise<IUser | null> {
    return this.prisma.user
      .findUnique({
        where: { id },
        include: { customer: true },
      })
      .then((user) => {
        if (!user) return null;
        return PrismaUserMapper.toDomain(user);
      });
  }

  async findByStatus(
    status: UserStatus,
    page = 1,
    limit = 10,
  ): Promise<PaginatedUsers> {
    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.max(Number(limit), 1);
    const where = { status: statusToPrisma(status) };

    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { customer: true },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
      this.prisma.user.count({ where }),
    ]);

    return PrismaPaginatedUsersMapper.toDomain(users, {
      totalItems,
      currentPage,
      itemsPerPage,
    });
  }

  async findMany(page = 1, limit = 10): Promise<PaginatedUsers> {
    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.max(Number(limit), 1);

    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        include: { customer: true },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
      this.prisma.user.count(),
    ]);

    return PrismaPaginatedUsersMapper.toDomain(users, {
      totalItems,
      currentPage,
      itemsPerPage,
    });
  }

  update(user: IUser): Promise<IUser> {
    const prismaData = PrismaUserMapper.toPrismaUpdate(user);
    return this.prisma.user
      .update({
        where: { id: user.id },
        data: prismaData,
        include: { customer: true },
      })
      .then((updatedUser) => PrismaUserMapper.toDomain(updatedUser));
  }
  delete(id: string): Promise<void> {
    const deletePromise = this.prisma.user.delete({
      where: { id },
    });
    return deletePromise.then(() => undefined);
  }

  async create(data: IUser): Promise<IUser> {
    const prismaData = PrismaUserMapper.toPrisma(data);
    const createdUser = await this.prisma.user.create({
      data: prismaData,
      include: { customer: true },
    });

    return PrismaUserMapper.toDomain(createdUser);
  }
}
