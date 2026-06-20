import { IGlobalStock } from '../../../../domain/@types/global-stock';
import type { Prisma, GlobalStock as PrismaStock } from '@prisma/client';

export class PrismaGlobalStockMapper {
  static toDomain(prismaStock: PrismaStock): IGlobalStock {
    return {
      id: prismaStock.id,
      productId: prismaStock.productId,
      quantity: prismaStock.quantity,
      createdAt: prismaStock.createdAt,
      updatedAt: prismaStock.updatedAt,
    } as IGlobalStock;
  }
  
  static toPrisma(stock: IGlobalStock): Prisma.GlobalStockUncheckedCreateInput {
    return {
      id: stock.id,
      productId: stock.productId,
      quantity: stock.quantity,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    } as Prisma.GlobalStockUncheckedCreateInput;
  }
}