import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProductRepository } from "../repositories/in-memory-product.repositorie";
import { CreateProductUseCase } from "src/modules/products/application/use-cases/create-product.use-case";
import { InvalidPriceError } from "src/modules/products/application/errors/invalid-price.error";
import { RequireProductMissingError } from "src/modules/products/application/errors/require-product-missing.error";


describe('Create products use case tests', () => {
    let sut: CreateProductUseCase;
    let productRepository: InMemoryProductRepository;
    let createProductUseCase: CreateProductUseCase;

    beforeEach(() => {
        productRepository = new InMemoryProductRepository();
        createProductUseCase = new CreateProductUseCase(productRepository);
    });

    it('should create a new product', async () => {
        await createProductUseCase.execute({
            name: 'Product 1',
            description: 'Description of product 1',
            price: 100,
        });
    });

    it('should not create a product with invalid price', async () => {
        await expect(() => createProductUseCase.execute({
            name: 'Product 2',
            description: 'Description of product 2',
            price: -50,
        })).rejects.toBeInstanceOf(InvalidPriceError);
    });

    it('should not create a product without name', async () => {
        await expect(() => createProductUseCase.execute({
            name: null as any,
            description: 'Description of product 2',
            price: 50,
        })).rejects.toBeInstanceOf(RequireProductMissingError);
    });
});