import { beforeEach, describe, expect, it } from 'vitest';

import { GetStoreMenuUseCase } from 'src/modules/stores/application/use-cases/get-store-menu.use-case';
import { StoreNotFoundError } from 'src/modules/stores/application/errors/store-not-found.error';
import { InMemoryStoreRepository } from '../repositories/in-memory-store.repositorie';
import { InMemoryProductRepository } from 'test/product/repositories/in-memory-product.repositorie';
import { InMemoryStoreStockRepository } from 'test/stock/repositories/in-memory-store-stock.repositorie';

describe('GetStoreMenuUseCase', () => {
  let storeRepo: InMemoryStoreRepository;
  let productRepo: InMemoryProductRepository;
  let storeStockRepo: InMemoryStoreStockRepository;
  let sut: GetStoreMenuUseCase;

  beforeEach(() => {
    storeRepo = new InMemoryStoreRepository();
    productRepo = new InMemoryProductRepository();
    storeStockRepo = new InMemoryStoreStockRepository();
    sut = new GetStoreMenuUseCase(storeRepo, storeStockRepo, productRepo);
  });

  it('returns menu items with availability for a store', async () => {
    await storeRepo.create({
      id: 's1',
      name: 'Centro',
      address: 'Rua A',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    productRepo.items.push({
      id: 'p1',
      name: 'Acaraje',
      description: 'Bolinho',
      price: 8.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await storeStockRepo.upsertIncrement('s1', 'p1', 5);

    const result = await sut.execute('s1');

    expect(result.storeName).toBe('Centro');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      productId: 'p1',
      name: 'Acaraje',
      price: 8.5,
      availableQuantity: 5,
      available: true,
    });
  });

  it('throws when store does not exist', async () => {
    await expect(() => sut.execute('missing')).rejects.toBeInstanceOf(StoreNotFoundError);
  });
});
