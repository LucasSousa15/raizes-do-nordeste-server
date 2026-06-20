import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/providers/database/models/prisma.service';
import { StockRepository } from '../../../../domain/repositories/stock.repositorie';
import { Stock } from '../../../../domain/entities/stock.entitie';
import { PrismaStocksMapper } from '../mappers/prisma-stocks.mapper';

@Injectable()
export class PrismaStocksRepository extends StockRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: any): Promise<Stock> {
    const prismaStock = await this.prisma.stock.create({ data });
    return PrismaStocksMapper.toDomain(prismaStock);
  }

  async findAll(): Promise<Stock[]> {
    const prismaStocks = await this.prisma.stock.findMany();
    return prismaStocks.map(PrismaStocksMapper.toDomain);
  }

  async findById(id: string): Promise<Stock | null> {
    const prismaStock = await this.prisma.stock.findUnique({ where: { id } });
    return prismaStock ? PrismaStocksMapper.toDomain(prismaStock) : null;
  }

  async update(id: string, data: any): Promise<Stock> {
    const prismaStock = await this.prisma.stock.update({ where: { id }, data });
    return PrismaStocksMapper.toDomain(prismaStock);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stock.delete({ where: { id } });
  }
}