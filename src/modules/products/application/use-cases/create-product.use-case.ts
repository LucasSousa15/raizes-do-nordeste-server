import { Injectable } from "@nestjs/common";
import { IProduct } from "../../domain/@types/products";
import { ProductRepository } from "../../domain/repositories/product.repositorie";
import { InvalidPriceError } from "../errors/invalid-price.error";
import { RequireProductMissingError } from "../errors/require-product-missing.error";

@Injectable()
export class CreateProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute({name, description, price}: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) {

        const invalidPrice = price <= 0;

        if (invalidPrice) {
            throw new InvalidPriceError();
        }

        if (!name) {
            throw new RequireProductMissingError();
        }

        const newProduct: IProduct = {
            id: crypto.randomUUID(),
            name,
            description,
            price,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.productRepository.create(newProduct);
    }
}