import { IProduct, PaginatedProducts } from 'src/modules/products/@types/products';
import type { Prisma, Product as PrismaProduct } from '@prisma/client';

export class PrismaProductMapper {
  static toPrisma(product: IProduct): Prisma.ProductCreateInput {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toDomain(raw: PrismaProduct): IProduct {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

export class PrismaPaginatedProductsMapper {
  static toDomain(
    raw: PrismaProduct[],
    meta: {
      totalItems: number;
      currentPage: number;
      itemsPerPage: number;
    },
  ): PaginatedProducts {
    return {
      data: raw.map(PrismaProductMapper.toDomain),
      meta: {
        totalItems: meta.totalItems,
        currentPage: meta.currentPage,
        itemsPerPage: meta.itemsPerPage,
        lastPage: Math.ceil(meta.totalItems / meta.itemsPerPage),
      },
    };
  }
}
