import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductRepository } from '../../product/repositories/in-memory-product.repositorie';
import { InMemoryStoreRepository } from '../../store/repositories/in-memory-store.repositorie';
import { InMemoryGlobalStockRepository } from '../repositories/in-memory-global-stock.repositorie';
import { InMemoryStoreStockRepository } from '../repositories/in-memory-store-stock.repositorie';
import { TransferGlobalToStoreUseCase } from 'src/modules/stocks/application/use-cases/transfer-global-to-store.use-case';
import { InsufficientStockError } from 'src/modules/stocks/application/errors/insufficient-stock.error';

describe('TransferGlobalToStoreUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let storeRepo: InMemoryStoreRepository;
  let globalStockRepo: InMemoryGlobalStockRepository;
  let storeStockRepo: InMemoryStoreStockRepository;
  let useCase: TransferGlobalToStoreUseCase;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    storeRepo = new InMemoryStoreRepository();
    globalStockRepo = new InMemoryGlobalStockRepository(productRepo);
    storeStockRepo = new InMemoryStoreStockRepository();

    useCase = new TransferGlobalToStoreUseCase(productRepo as any, storeRepo as any, globalStockRepo as any, storeStockRepo as any);

    const product = { id: 'p1', name: 'Prod 1', description: '', price: 10, createdAt: new Date(), updatedAt: new Date() };
    productRepo.items.push(product as any);

    const storeA = { id: 's1', name: 'Store 1', createdAt: new Date(), updatedAt: new Date() };
    const storeB = { id: 's2', name: 'Store 2', createdAt: new Date(), updatedAt: new Date() };
    storeRepo.items.push(storeA as any, storeB as any);

    // seed store stocks
    await storeStockRepo.upsertIncrement('s1', 'p1', 10);
    await storeStockRepo.upsertIncrement('s2', 'p1', 5);

    // seed global stock to reflect aggregated value
    await globalStockRepo.create({ productId: 'p1', quantity: 15 });
  });

  it('transfers quantity from source store to destination store (positive)', async () => {
    await useCase.execute({ productId: 'p1', storeId: 's2', sourceStoreId: 's1', quantity: 6 });

    const source = await storeStockRepo.findByStoreAndProduct('s1', 'p1');
    const dest = await storeStockRepo.findByStoreAndProduct('s2', 'p1');

    expect(source).not.toBeNull();
    expect(dest).not.toBeNull();
    expect(source!.quantity).toBe(4);
    expect(dest!.quantity).toBe(11);
  });

  it('throws InsufficientStockError when source has insufficient quantity', async () => {
    await expect(useCase.execute({ productId: 'p1', storeId: 's2', sourceStoreId: 's1', quantity: 200 })).rejects.toBeInstanceOf(InsufficientStockError);
  });

  it('throws when product not found', async () => {
    await expect(useCase.execute({ productId: 'not-found', storeId: 's2', sourceStoreId: 's1', quantity: 1 })).rejects.toThrow();
  });

  it('throws when destination store not found', async () => {
    await expect(useCase.execute({ productId: 'p1', storeId: 'no-store', sourceStoreId: 's1', quantity: 1 })).rejects.toThrow();
  });
});
