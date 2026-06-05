import { DeleteProductUseCase } from "src/modules/products/application/use-cases/delete-product.use-case";
import { InMemoryProductRepository } from "../repositories/in-memory-product.repositorie";
import { beforeEach, describe, expect, it } from "vitest";
import { ProductNotFoundError } from "src/modules/products/application/errors/product-not-found.error";

let productsRepository: InMemoryProductRepository;
let sut: DeleteProductUseCase;

describe('Delete product tests', () => {
    beforeEach(() => {
        productsRepository = new InMemoryProductRepository();
        sut = new DeleteProductUseCase(productsRepository);
    });

    it('should delete a product successfully', async () => {
        const product = {
            id: 'product-1',
            name: 'Acaraje',
            description: 'Bolinho de feijao-fradinho frito no azeite de dende',
            price: 8.5,
            createdAt: new Date('2026-05-01T00:00:00.000Z'),
            updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        };
        await productsRepository.create(product);
        await sut.execute(product.id);
    });

    it('should throw an error when trying to delete a non-existing product', async () => {
        try {
            await sut.execute('non-existing-product-id');
        } catch (error) {
            expect(error).toBeInstanceOf(ProductNotFoundError);
        }
    });
});