import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductNotFoundError } from 'src/modules/products/application/errors/product-not-found.error';
import { UpdateProductUseCase } from 'src/modules/products/application/use-cases/update-product.use-case';
import { InMemoryProductRepository } from '../repositories/in-memory-product.repositorie';
import { InvalidPriceError } from 'src/modules/products/application/errors/invalid-price.error';

let productsRepository: InMemoryProductRepository;
let sut: UpdateProductUseCase;

describe('Update product tests', () => {
    beforeEach(() => {
        productsRepository = new InMemoryProductRepository();
        sut = new UpdateProductUseCase(productsRepository);
    });

    const createProduct = () => ({
        id: 'product-1',
        name: 'Acaraje',
        description: 'Bolinho de feijao-fradinho frito no azeite de dende',
        price: 8.5,
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    });

    it('should update product name, price and description successfully', async () => {
        await productsRepository.create(createProduct());

        await sut.execute('product-1', {
            name: 'Acaraje completo',
            price: 12,
            description: 'Acaraje com vatapa, camarao e salada',
        });

        const updatedProduct = await productsRepository.findById('product-1');

        expect(updatedProduct).toEqual(expect.objectContaining({
            id: 'product-1',
            name: 'Acaraje completo',
            price: 12,
            description: 'Acaraje com vatapa, camarao e salada',
        }));
        expect(updatedProduct?.createdAt).toEqual(new Date('2026-05-01T00:00:00.000Z'));
        expect(updatedProduct?.updatedAt).toBeInstanceOf(Date);
        expect(updatedProduct?.updatedAt).not.toEqual(new Date('2026-05-01T00:00:00.000Z'));
    });

    it('should update only the provided fields and keep the original values', async () => {
        await productsRepository.create(createProduct());

        await sut.execute('product-1', {
            price: 10.75,
        });

        const updatedProduct = await productsRepository.findById('product-1');

        expect(updatedProduct).toEqual(expect.objectContaining({
            id: 'product-1',
            name: 'Acaraje',
            description: 'Bolinho de feijao-fradinho frito no azeite de dende',
            price: 10.75,
        }));
    });

    it('should throw InvalidPriceError when updating price to zero', async () => {
        await productsRepository.create(createProduct());
        const updateSpy = vi.spyOn(productsRepository, 'update');

        await expect(() => sut.execute('product-1', {
            price: 0,
        })).rejects.toBeInstanceOf(InvalidPriceError);

        const updatedProduct = await productsRepository.findById('product-1');

        expect(updatedProduct?.price).toBe(8.5);
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should throw InvalidPriceError when updating price to a negative value', async () => {
        await productsRepository.create(createProduct());
        const updateSpy = vi.spyOn(productsRepository, 'update');

        await expect(() => sut.execute('product-1', {
            name: 'Acaraje invalido',
            price: -1,
        })).rejects.toBeInstanceOf(InvalidPriceError);

        const updatedProduct = await productsRepository.findById('product-1');

        expect(updatedProduct).toEqual(expect.objectContaining({
            name: 'Acaraje',
            price: 8.5,
        }));
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should ignore undefined fields when updating a product', async () => {
        await productsRepository.create(createProduct());

        await sut.execute('product-1', {
            name: undefined,
            price: undefined,
            description: undefined,
        });

        const updatedProduct = await productsRepository.findById('product-1');

        expect(updatedProduct).toEqual(expect.objectContaining({
            id: 'product-1',
            name: 'Acaraje',
            description: 'Bolinho de feijao-fradinho frito no azeite de dende',
            price: 8.5,
        }));
    });

    it('should throw ProductNotFoundError when product does not exist', async () => {
        await expect(() => sut.execute('non-existent-product', {
            name: 'Bolo de Rolo',
        })).rejects.toBeInstanceOf(ProductNotFoundError);
    });

    it('should not call repository update when product does not exist', async () => {
        const updateSpy = vi.spyOn(productsRepository, 'update');

        await expect(() => sut.execute('non-existent-product', {
            name: 'Bolo de Rolo',
            price: 9.9,
        })).rejects.toBeInstanceOf(ProductNotFoundError);

        expect(updateSpy).not.toHaveBeenCalled();
    });
});
