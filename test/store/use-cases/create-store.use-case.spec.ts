import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoreRepository } from "../repositories/in-memory-store.repositorie";
import { CreateStoreUseCase } from "src/modules/stores/application/use-cases/create-store.use-case";
import { StoreAddressUnavailableError } from "src/modules/stores/application/errors/store-addres-unavailable.error";


describe('Create store use case tests', () => {
	let storeRepository: InMemoryStoreRepository;
	let createStoreUseCase: CreateStoreUseCase;

	beforeEach(() => {
		storeRepository = new InMemoryStoreRepository();
		createStoreUseCase = new CreateStoreUseCase(storeRepository);
	});

	it('should create a new store', async () => {
		await createStoreUseCase.execute({
			name: 'Store 1',
			address: 'Address 1',
		});

		expect(storeRepository.items.length).toBe(1);
		const store = storeRepository.items[0];
		expect(store).toBeInstanceOf(Object);
		expect(store).toHaveProperty('id');
		expect(store.name).toBe('Store 1');
		expect(store.address).toBe('Address 1');
		expect(store.createdAt).toBeInstanceOf(Date);
	});

	it('should not be able to create a store with the same address', async () => {
		await createStoreUseCase.execute({
			name: 'Store 1',
			address: 'Address 1',
		});

		await expect(() =>
			createStoreUseCase.execute({
				name: 'Store 2',
				address: 'Address 1',
			})
		).rejects.toBeInstanceOf(StoreAddressUnavailableError);
	});

});