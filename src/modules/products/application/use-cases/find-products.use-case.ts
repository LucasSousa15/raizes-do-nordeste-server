import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repositorie';
import { FindProductsReq, PaginatedProducts } from '../../@types/products';
import { ProductNotFoundError } from '../errors/product-not-found.error';

@Injectable() 
export class FindProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(data: FindProductsReq): Promise<PaginatedProducts> {
        const pageParam = Number(data.page ?? 1);
        const limitParam = Number(data.limit ?? 10);
        const page = Number.isNaN(pageParam) ? 1 : pageParam;
        const limit = Number.isNaN(limitParam) ? 10 : limitParam;

        if (data.productId) {
            const product = await this.productRepository.findById(data.productId);
            if (!product) {
                throw new ProductNotFoundError();
            }
            return {
                data: [product],
                meta: {
                    totalItems: 1,
                    lastPage: 1,
                    currentPage: 1,
                    itemsPerPage: 1,
                },
            };
        }

        if (data.name) {
            const result = await this.productRepository.findByName(data.name, page, limit);
            if (!result || result.data.length === 0) {
                throw new ProductNotFoundError();
            }
            return result;
        }

        const allProducts = await this.productRepository.findAll({ page, limit });
        if (!allProducts || allProducts.data.length === 0) {
            throw new ProductNotFoundError();
        }
        return allProducts;
    }
}
