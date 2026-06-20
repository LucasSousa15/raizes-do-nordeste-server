import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';
import { IStoreStock } from 'src/modules/stocks/domain/@types/store-stock';

@Injectable()
export class PrismaStoreStockRepository implements StoreStockRepository {
  constructor(private prisma: PrismaService) {}

  async findByStoreAndProduct(storeId: string, productId: string): Promise<IStoreStock | null> {
    const item = await this.prisma.storeStock.findUnique({ where: { storeId_productId: { storeId, productId } } });
    if (!item) return null;
    return {
      id: item.id,
      storeId: item.storeId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as IStoreStock;
  }

  async upsertIncrement(storeId: string, productId: string, quantity: number): Promise<IStoreStock> {
    const res = await this.prisma.storeStock.upsert({
      where: { storeId_productId: { storeId, productId } },
      create: { storeId, productId, quantity, createdAt: new Date(), updatedAt: new Date() },
      update: { quantity: { increment: quantity }, updatedAt: new Date() },
    });

    return {
      id: res.id,
      storeId: res.storeId,
      productId: res.productId,
      quantity: res.quantity,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    } as IStoreStock;
  }

  async adjustQuantity(storeId: string, productId: string, delta: number): Promise<IStoreStock> {
    const updateRes = await this.prisma.storeStock.updateMany({
      where: { storeId, productId },
      data: { quantity: { increment: delta }, updatedAt: new Date() },
    });

    if (updateRes.count === 0) {
      if (delta < 0) throw new Error('StoreStock not found');
      const created = await this.prisma.storeStock.create({ data: { storeId, productId, quantity: delta, createdAt: new Date(), updatedAt: new Date() } });
      return {
        id: created.id,
        storeId: created.storeId,
        productId: created.productId,
        quantity: created.quantity,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      } as IStoreStock;
    }

    const updated = await this.prisma.storeStock.findUnique({ where: { storeId_productId: { storeId, productId } } });
    if (!updated) throw new Error('StoreStock not found after update');
    return {
      id: updated.id,
      storeId: updated.storeId,
      productId: updated.productId,
      quantity: updated.quantity,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    } as IStoreStock;
  }

  async findByStoreId(storeId: string): Promise<IStoreStock[]> {
    const items = await this.prisma.storeStock.findMany({ where: { storeId } });
    return items.map((i) => ({ id: i.id, storeId: i.storeId, productId: i.productId, quantity: i.quantity, createdAt: i.createdAt, updatedAt: i.updatedAt } as IStoreStock));
  }
}
