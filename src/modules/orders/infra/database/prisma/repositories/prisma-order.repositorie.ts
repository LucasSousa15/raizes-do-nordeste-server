import { Injectable } from '@nestjs/common';

import { OrderRepository } from '../../../../domain/repositories/order.repositorie';
import { Order } from '../../../../domain/entities/order.entitie';
import { PrismaOrdersMapper, channelDomainToPrisma, statusDomainToPrisma } from '../mappers/prisma-orders.mapper';
import { FindOrdersReq, PaginatedOrders, IOrder, OrderChannel, OrderStatus } from '../../../../domain/@types/order';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaOrdersRepository extends OrderRepository {
  constructor(private prisma: PrismaService) {
    super();
  }
  async createOrder(data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const prismaData = PrismaOrdersMapper.toPrismaCreate(data);
    const prismaOrder = await this.prisma.order.create({
      data: prismaData,
      include: { orderItems: true },
    });
    return PrismaOrdersMapper.toEntity(prismaOrder);
  }

  async findAll(query: FindOrdersReq): Promise<PaginatedOrders> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.storeId) where.storeId = query.storeId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.channel) where.channel = channelDomainToPrisma[query.channel as OrderChannel];
    if (query.status) where.status = statusDomainToPrisma[query.status as OrderStatus];

    if (query.minTotalAmount !== undefined || query.maxTotalAmount !== undefined) {
      const totalFilter: Prisma.FloatFilter = {};
      if (query.minTotalAmount !== undefined) totalFilter.gte = query.minTotalAmount;
      if (query.maxTotalAmount !== undefined) totalFilter.lte = query.maxTotalAmount;
      where.total = totalFilter;
    }

    if (query.createdAtStart !== undefined || query.createdAtEnd !== undefined) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (query.createdAtStart !== undefined) createdAtFilter.gte = query.createdAtStart;
      if (query.createdAtEnd !== undefined) createdAtFilter.lte = query.createdAtEnd;
      where.createdAt = createdAtFilter;
    }

    const [raw, totalItems] = await Promise.all([
      this.prisma.order.findMany({ where, include: { orderItems: true }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: raw.map(PrismaOrdersMapper.toDomain),
      meta: {
        totalItems,
        lastPage: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findById(id: string): Promise<Order | null> {
    const prismaOrder = await this.prisma.order.findUnique({ where: { id }, include: { orderItems: true } });
    return prismaOrder ? PrismaOrdersMapper.toEntity(prismaOrder) : null;
  }

  async update(id: string, data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const prismaData = PrismaOrdersMapper.toPrismaUpdate(data);
    const prismaOrder = await this.prisma.order.update({ where: { id }, data: prismaData, include: { orderItems: true } });
    return PrismaOrdersMapper.toEntity(prismaOrder);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }
}