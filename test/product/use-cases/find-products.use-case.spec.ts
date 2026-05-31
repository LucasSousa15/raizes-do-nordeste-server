// find-products.use-case.spec.ts

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { InMemoryProductRepository } from '../repositories/in-memory-product.repositorie';
import { FindProductsUseCase } from 'src/modules/products/application/use-cases/find-products.use-case';
import { ProductNotFoundError } from 'src/modules/products/application/errors/product-not-found.error';

let productsRepository: InMemoryProductRepository;
let sut: FindProductsUseCase;

describe('Find products tests', () => {
    beforeEach(() => {
        productsRepository = new InMemoryProductRepository();
        sut = new FindProductsUseCase(productsRepository);
    });

    afterEach(() => {
        productsRepository.items = [];
    });

    const createProduct = (id: string, name: string, price: number, description?: string) => ({
        id,
        name,
        description: description || `Delicioso ${name} da culinária nordestina`,
        price,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const seedProducts = async () => {
        await productsRepository.create(createProduct('1', 'Acarajé', 8.50, 'Bolinho de feijão-fradinho frito no azeite de dendê'));
        await productsRepository.create(createProduct('2', 'Vatapá', 12.00, 'Cremoso de pão, leite de coco, amendoim e camarão'));
        await productsRepository.create(createProduct('3', 'Baião de Dois', 18.90, 'Arroz e feijão verde com queijo coalho e carne de sol'));
        await productsRepository.create(createProduct('4', 'Carne de Sol com Macaxeira', 32.50, 'Carne de sol assada com macaxeira cozida'));
        await productsRepository.create(createProduct('5', 'Bolo de Rolo', 9.90, 'Massa fina de goiabada enrolada'));
    };

    it('should be able to find a product by id', async () => {
        await seedProducts();

        const result = await sut.execute({ productId: '2' });

        expect(result).toBeInstanceOf(Object);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toHaveProperty('id', '2');
        expect(result.data[0].name).toBe('Vatapá');
        expect(result.meta).toEqual({
            totalItems: 1,
            lastPage: 1,
            currentPage: 1,
            itemsPerPage: 1,
        });
    });

    it('should throw ProductNotFoundError when product id does not exist', async () => {
        await seedProducts();

        await expect(() => sut.execute({ productId: '999' })).rejects.toBeInstanceOf(ProductNotFoundError);
    });

    it('should be able to find products by name (partial match)', async () => {
        await seedProducts();

        const result = await sut.execute({ name: 'acarajé', page: 1, limit: 10 });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe('Acarajé');
        expect(result.meta.totalItems).toBe(1);
    });

    it('should be able to find products containing "carne" in name', async () => {
        await seedProducts();

        const result = await sut.execute({ name: 'carne', page: 1, limit: 10 });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe('Carne de Sol com Macaxeira');
        expect(result.meta.totalItems).toBe(1);
    });

    it('should apply pagination when searching by name', async () => {
        await seedProducts();

        const result = await sut.execute({ name: 'de', page: 1, limit: 1 });

        expect(result.data).toHaveLength(1);
        expect(result.meta.totalItems).toBe(3);
        expect(result.meta.lastPage).toBe(3);
    });

    it('should use default pagination (page=1, limit=10) when omitted', async () => {
        await seedProducts();

        const result = await sut.execute({ name: 'a' });
        expect(result.meta.currentPage).toBe(1);
        expect(result.meta.itemsPerPage).toBe(10);
    });

    it('should throw ProductNotFoundError when no product matches the name', async () => {
        await seedProducts();

        await expect(() => sut.execute({ name: 'pizza' })).rejects.toBeInstanceOf(ProductNotFoundError);
    });

    it('should return all products paginated when no filters are provided', async () => {
        await seedProducts();

        const result = await sut.execute({ page: 1, limit: 10 });

        expect(result.data).toHaveLength(5);
        expect(result.meta.totalItems).toBe(5);
        expect(result.data[0].name).toBe('Acarajé');
    });

    it('should apply pagination correctly when listing all products', async () => {
        await seedProducts();

        const result = await sut.execute({ page: 2, limit: 2 });

        expect(result.data).toHaveLength(2);
        expect(result.meta.currentPage).toBe(2);
        expect(result.meta.itemsPerPage).toBe(2);
        expect(result.meta.lastPage).toBe(3); 
        expect(result.data[0].name).toBe('Baião de Dois');
    });

    it('should throw ProductNotFoundError when there are no products', async () => {
        await expect(() => sut.execute({})).rejects.toBeInstanceOf(ProductNotFoundError);
    });

    it('should convert string page/limit to numbers', async () => {
        await seedProducts();

        const result = await sut.execute({ page: '2', limit: '2' } as any);

        expect(result.meta.currentPage).toBe(2);
        expect(result.meta.itemsPerPage).toBe(2);
    });

    it('should fallback to default pagination when page/limit are NaN', async () => {
        await seedProducts();

        const result = await sut.execute({ page: NaN, limit: NaN } as any);

        expect(result.meta.currentPage).toBe(1);
        expect(result.meta.itemsPerPage).toBe(10);
    });
});
