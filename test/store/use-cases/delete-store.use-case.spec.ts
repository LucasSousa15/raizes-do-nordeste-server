import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { InMemoryStoreRepository } from '../repositories/in-memory-store.repositorie';
import { DeleteStoreUseCase } from 'src/modules/stores/application/use-cases/delete-store.use-case';
import { StoreNotFoundError } from 'src/modules/stores/application/errors/store-not-found.error';

let storeRepository: InMemoryStoreRepository;
let sut: DeleteStoreUseCase;

describe('Delete store use case tests', () => {
	beforeEach(() => {
		storeRepository = new InMemoryStoreRepository();
		sut = new DeleteStoreUseCase(storeRepository);
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

	it('should delete an existing store', async () => {
		await storeRepository.create(createStore('1', 'Loja A', 'Endereço A'));

		expect(storeRepository.items.length).toBe(1);

		await sut.execute('1');

		const store = await storeRepository.findById('1');
		expect(store).toBeNull();
		expect(storeRepository.items.length).toBe(0);
	});

	it('should throw StoreNotFoundError when trying to delete non-existing store', async () => {
		await expect(() => sut.execute('999')).rejects.toBeInstanceOf(StoreNotFoundError);
	});

});
