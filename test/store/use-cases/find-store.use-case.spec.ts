import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { InMemoryStoreRepository } from '../repositories/in-memory-store.repositorie';
import { FindStoreUseCase } from 'src/modules/stores/application/use-cases/find-store.use-case';
import { StoreNotFoundError } from 'src/modules/stores/application/errors/store-not-found.error';

let storeRepository: InMemoryStoreRepository;
let sut: FindStoreUseCase;

describe('Find store use case tests', () => {
    beforeEach(() => {
        storeRepository = new InMemoryStoreRepository();
        sut = new FindStoreUseCase(storeRepository);
    });

    afterEach(() => {
        storeRepository.items = [];
    });

    const createStore = (id: string, name: string, address: string) => ({
        id,
        name,
        address,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const seedStores = async () => {
        await storeRepository.create(createStore('1', 'Loja A', 'Endereço A'));
        await storeRepository.create(createStore('2', 'Loja B', 'Endereço B'));
        await storeRepository.create(createStore('3', 'Loja C', 'Endereço C'));
        await storeRepository.create(createStore('4', 'Loja D', 'Endereço D'));
        await storeRepository.create(createStore('5', 'Loja E', 'Endereço E'));
    };

    it('should be able to find a store by id', async () => {
        await seedStores();

        const result = await sut.execute({ storeId: '2' });

        expect(result).toBeInstanceOf(Object);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toHaveProperty('id', '2');
        expect(result.data[0].name).toBe('Loja B');
        expect(result.meta).toEqual({
            totalItems: 1,
            lastPage: 1,
            currentPage: 1,
            itemsPerPage: 10,
        });
    });

    it('should throw StoreNotFoundError when store id does not exist', async () => {
        await seedStores();

        await expect(() => sut.execute({ storeId: '999' })).rejects.toBeInstanceOf(StoreNotFoundError);
    });

    it('should return all stores paginated when no filters are provided', async () => {
        await seedStores();

        const result = await sut.execute({ page: 1, limit: 10 });

        expect(result.data).toHaveLength(5);
        expect(result.meta.totalItems).toBe(5);
        expect(result.data[0].name).toBe('Loja A');
    });

    it('should apply pagination correctly when listing all stores', async () => {
        await seedStores();

        const result = await sut.execute({ page: 2, limit: 2 });

        expect(result.data).toHaveLength(2);
        expect(result.meta.currentPage).toBe(2);
        expect(result.meta.itemsPerPage).toBe(2);
        expect(result.meta.lastPage).toBe(3);
        expect(result.data[0].name).toBe('Loja C');
    });

    it('should convert string page/limit to numbers', async () => {
        await seedStores();

        const result = await sut.execute({ page: '2', limit: '2' } as any);

        expect(result.meta.currentPage).toBe(2);
        expect(result.meta.itemsPerPage).toBe(2);
    });

    it('should fallback to default pagination when page/limit are NaN', async () => {
        await seedStores();

        const result = await sut.execute({ page: NaN, limit: NaN } as any);

        expect(result.meta.currentPage).toBe(1);
        expect(result.meta.itemsPerPage).toBe(10);
    });

    it('should return empty data when there are no stores', async () => {
        const result = await sut.execute({ page: 1, limit: 10 });

        expect(result.data).toHaveLength(0);
        expect(result.meta.totalItems).toBe(0);
    });

});
