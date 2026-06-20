import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryStoreRepository } from '../../store/repositories/in-memory-store.repositorie';
import { InMemoryStoreStockRepository } from '../repositories/in-memory-store-stock.repositorie';
import { GetStoreStocksUseCase } from 'src/modules/stocks/application/use-cases/get-store-stocks.use-case';

describe('GetStoreStocksUseCase', () => {
  let storeRepo: InMemoryStoreRepository;
  let storeStockRepo: InMemoryStoreStockRepository;
  let useCase: GetStoreStocksUseCase;

  beforeEach(async () => {
    storeRepo = new InMemoryStoreRepository();
    storeStockRepo = new InMemoryStoreStockRepository();
    useCase = new GetStoreStocksUseCase(storeRepo as any, storeStockRepo as any);

    storeRepo.items.push({ id: 's1', name: 'Store 1', createdAt: new Date(), updatedAt: new Date() } as any);
    await storeStockRepo.upsertIncrement('s1', 'p1', 3);
    await storeStockRepo.upsertIncrement('s1', 'p2', 5);
  });

  it('returns stocks for store', async () => {
    const res = await useCase.execute('s1');
    expect(res.length).toBe(2);
  });

  it('throws when store not found', async () => {
    await expect(useCase.execute('no')).rejects.toThrow();
  });
});
