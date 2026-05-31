import { Injectable } from "@nestjs/common";
import { ProductRepository } from "../../domain/repositories/product.repositorie";
import { ProductNotFoundError } from "../errors/product-not-found.error";
import { InvalidPriceError } from "../errors/invalid-price.error";

@Injectable()
export class UpdateProductUseCase {
    constructor(private productsRepository: ProductRepository) {}

    async execute(productId: string, data: { name?: string; price?: number, description?: string }): Promise<void> {
        const product = await this.productsRepository.findById(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        if (data.price !== undefined && data.price <= 0) {
            throw new InvalidPriceError();
        }

        if (data.name !== undefined) {
            product.name = data.name;
        }

        if (data.price !== undefined) {
            product.price = data.price;
        }

        if (data.description !== undefined) {
            product.description = data.description;
        }

        await this.productsRepository.update(product);
    }
}
