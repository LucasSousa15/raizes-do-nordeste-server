import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductRepository } from '../../product/repositories/in-memory-product.repositorie';
import { InMemoryGlobalStockRepository } from '../repositories/in-memory-global-stock.repositorie';
import { GetGlobalStockUseCase } from 'src/modules/stocks/application/use-cases/get-global-stock.use-case';

describe('GetGlobalStockUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let globalRepo: InMemoryGlobalStockRepository;
  let useCase: GetGlobalStockUseCase;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    globalRepo = new InMemoryGlobalStockRepository(productRepo);
    useCase = new GetGlobalStockUseCase(globalRepo as any, productRepo as any);

    productRepo.items.push({ id: 'p1', name: 'Prod 1', description: '', price: 10, createdAt: new Date(), updatedAt: new Date() } as any);
    globalRepo.create({ productId: 'p1', quantity: 7 });
  });

  it('returns global stock when product exists', async () => {
    const res = await useCase.execute('p1');
    expect(res).not.toBeNull();
    expect(res!.quantity).toBe(7);
  });

  it('throws when product not found', async () => {
    await expect(useCase.execute('no')).rejects.toThrow();
  });
});
