import { ProductRepository } from "src/modules/products/domain/repositories/product.repositorie";
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { IProduct, FindProductsReq, PaginatedProducts } from "src/modules/products/@types/products";
import { PrismaPaginatedProductsMapper, PrismaProductMapper } from "../mappers/prsima-products.mapper";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class PrismaProductsRepository implements ProductRepository {
  constructor(private prisma: PrismaService) {}
    create(product: IProduct): Promise<void> {
        const prismaProduct = PrismaProductMapper.toPrisma(product);
        return this.prisma.product.create({ data: prismaProduct }).then(() => {});
    }
    findById(id: string): Promise<IProduct | null> {
        return this.prisma.product.findUnique({ where: { id } }).then((product) => {
            if (!product) return null;
            return PrismaProductMapper.toDomain(product);
        });
    }
    async findMany(params: FindProductsReq): Promise<PaginatedProducts> {
        const currentPage = Math.max(Number(params.page) || 1, 1);
        const itemsPerPage = Math.max(Number(params.limit) || 10, 1);
        const where: Prisma.ProductWhereInput = {};

        if (params.productId) {
            where.id = params.productId;
        }

        if (params.name) {
            where.name = {
                contains: params.name,
                mode: 'insensitive',
            };
        }

        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            where.price = {
                ...(params.minPrice !== undefined && { gte: params.minPrice }),
                ...(params.maxPrice !== undefined && { lte: params.maxPrice }),
            };
        }

        if (params.createdAtStart || params.createdAtEnd) {
            where.createdAt = {
                ...(params.createdAtStart && { gte: params.createdAtStart }),
                ...(params.createdAtEnd && { lte: params.createdAtEnd }),
            };
        }

        const [products, totalItems] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip: (currentPage - 1) * itemsPerPage,
                take: itemsPerPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        return PrismaPaginatedProductsMapper.toDomain(products, {
            totalItems,
            currentPage,
            itemsPerPage,
        });
    }

    async findByName(name: string, page: number, limit: number): Promise<PaginatedProducts | null> {
        return this.findMany({ name, page, limit });
    }

    update(product: IProduct): Promise<void> {
        const prismaProduct = PrismaProductMapper.toPrisma(product);

        return this.prisma.product.update({
            where: { id: product.id },
            data: prismaProduct,
        }).then(() => undefined);
    }

    delete(id: string): Promise<void> {
        return this.prisma.product.delete({
            where: { id },
        }).then(() => undefined);
    }


}
