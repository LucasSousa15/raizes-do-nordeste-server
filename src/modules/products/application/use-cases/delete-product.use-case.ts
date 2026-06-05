import { Injectable } from "@nestjs/common";
import { ProductRepository } from "../../domain/repositories/product.repositorie";
import { ProductNotFoundError } from "../errors/product-not-found.error";

@Injectable()
export class DeleteProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(id: string) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new ProductNotFoundError();
        }

        await this.productRepository.delete(id);
    }
}