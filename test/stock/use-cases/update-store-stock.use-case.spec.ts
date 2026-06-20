import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductRepository } from '../../product/repositories/in-memory-product.repositorie';
import { InMemoryStoreRepository } from '../../store/repositories/in-memory-store.repositorie';
import { InMemoryStoreStockRepository } from '../repositories/in-memory-store-stock.repositorie';
import { UpdateStoreStockUseCase } from 'src/modules/stocks/application/use-cases/update-store-stock.use-case';
import { InsufficientStockError } from 'src/modules/stocks/application/errors/insufficient-stock.error';

describe('UpdateStoreStockUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let storeRepo: InMemoryStoreRepository;
  let storeStockRepo: InMemoryStoreStockRepository;
  let useCase: UpdateStoreStockUseCase;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    storeRepo = new InMemoryStoreRepository();
    storeStockRepo = new InMemoryStoreStockRepository();

    useCase = new UpdateStoreStockUseCase(productRepo as any, storeRepo as any, storeStockRepo as any);

    const product = { id: 'p1', name: 'Prod 1', description: '', price: 10, createdAt: new Date(), updatedAt: new Date() };
    productRepo.items.push(product as any);

    const store = { id: 's1', name: 'Store 1', createdAt: new Date(), updatedAt: new Date() };
    storeRepo.items.push(store as any);

    await storeStockRepo.upsertIncrement('s1', 'p1', 10);
  });

  it('increases store stock', async () => {
    const res = await useCase.execute({ storeId: 's1', productId: 'p1', delta: 5 });
    expect(res.quantity).toBe(15);
  });

  it('decreases store stock', async () => {
    const res = await useCase.execute({ storeId: 's1', productId: 'p1', delta: -4 });
    expect(res.quantity).toBe(6);
  });

  it('throws InsufficientStockError when decreasing below zero', async () => {
    await expect(useCase.execute({ storeId: 's1', productId: 'p1', delta: -200 })).rejects.toBeInstanceOf(InsufficientStockError);
  });

  it('throws when product not found', async () => {
    await expect(useCase.execute({ storeId: 's1', productId: 'not', delta: 1 })).rejects.toThrow();
  });

  it('throws when store not found', async () => {
    await expect(useCase.execute({ storeId: 'no', productId: 'p1', delta: 1 })).rejects.toThrow();
  });
});
