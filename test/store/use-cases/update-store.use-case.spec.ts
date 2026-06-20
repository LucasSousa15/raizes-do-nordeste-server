import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { InMemoryStoreRepository } from '../repositories/in-memory-store.repositorie';
import { UpdateStoreUseCase } from 'src/modules/stores/application/use-cases/update-store.use-case';
import { StoreNotFoundError } from 'src/modules/stores/application/errors/store-not-found.error';

let storeRepository: InMemoryStoreRepository;
let sut: UpdateStoreUseCase;

describe('Update store use case tests', () => {
    beforeEach(() => {
        storeRepository = new InMemoryStoreRepository();
        sut = new UpdateStoreUseCase(storeRepository);
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

    it('should update store name and address', async () => {
        await storeRepository.create(createStore('1', 'Loja A', 'Endereço A'));

        await sut.execute('1', 'Loja A Atualizada', 'Endereço A Atualizado');

        const store = await storeRepository.findById('1');
        expect(store).not.toBeNull();
        expect(store!.name).toBe('Loja A Atualizada');
        expect(store!.address).toBe('Endereço A Atualizado');
    });

    it('should update only provided fields and preserve others', async () => {
        await storeRepository.create(createStore('2', 'Loja B', 'Endereço B'));

        await sut.execute('2', 'Loja B Renomeada', undefined as any);

        const store = await storeRepository.findById('2');
        expect(store).not.toBeNull();
        expect(store!.name).toBe('Loja B Renomeada');
        expect(store!.address).toBe('Endereço B');
    });

    it('should throw StoreNotFoundError when trying to update non-existing store', async () => {
        await expect(() => sut.execute('999', 'Nome', 'Endereço')).rejects.toBeInstanceOf(StoreNotFoundError);
    });

});
