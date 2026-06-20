import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { IGlobalStock } from 'src/modules/stocks/domain/@types/global-stock';
import { GlobalStockRepository } from 'src/modules/stocks/domain/repositories/global-stock.repositorie';


@Injectable()
export class PrismaGlobalStockRepository implements GlobalStockRepository {
  constructor(private prisma: PrismaService) {}

  async findByProductId(productId: string): Promise<IGlobalStock | null> {
    const agg = await this.prisma.storeStock.aggregate({
      where: { productId },
      _sum: { quantity: true },
      _max: { updatedAt: true },
    });

    const quantity = agg._sum.quantity ?? 0;
    if (quantity === 0 && agg._max.updatedAt == null) return null;

    const ig: IGlobalStock = {
      id: productId,
      productId,
      quantity,
      createdAt: new Date(),
      updatedAt: agg._max.updatedAt ?? new Date(),
    };

    return ig;
  }

  async findAll(): Promise<IGlobalStock[]> {
    const groups = await this.prisma.storeStock.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _max: { updatedAt: true },
    });

    return groups.map((g) => ({
      id: g.productId,
      productId: g.productId,
      quantity: g._sum.quantity ?? 0,
      createdAt: new Date(),
      updatedAt: g._max.updatedAt ?? new Date(),
    } as IGlobalStock));
  }

  async findByStoreId(storeId: string): Promise<IGlobalStock[]> {
    const items = await this.prisma.storeStock.findMany({ where: { storeId } });
    return items.map((s) => ({
      id: s.id,
      productId: s.productId,
      quantity: s.quantity,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    } as IGlobalStock));
  }

  async updateByStoreId(storeId: string, data: Partial<IGlobalStock>): Promise<IGlobalStock> {
    if (data.productId) {
      await this.prisma.storeStock.updateMany({
        where: { storeId, productId: data.productId },
        data: { quantity: data.quantity ?? undefined, updatedAt: new Date() },
      });
      const updated = await this.prisma.storeStock.findFirst({ where: { storeId, productId: data.productId } });
      if (!updated) throw new Error('Stock not found');
      return { id: updated.id, productId: updated.productId, quantity: updated.quantity, createdAt: updated.createdAt, updatedAt: updated.updatedAt } as IGlobalStock;
    }

    await this.prisma.storeStock.updateMany({ where: { storeId }, data: { quantity: data.quantity ?? undefined, updatedAt: new Date() } });
    const updated = await this.prisma.storeStock.findFirst({ where: { storeId } });
    if (!updated) throw new Error('Stock not found');
    return { id: updated.id, productId: updated.productId, quantity: updated.quantity, createdAt: updated.createdAt, updatedAt: updated.updatedAt } as IGlobalStock;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeStock.delete({ where: { id } });
  }
}