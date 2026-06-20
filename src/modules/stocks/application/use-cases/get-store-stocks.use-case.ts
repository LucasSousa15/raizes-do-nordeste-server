import { Inject, Injectable } from '@nestjs/common';
import { StoreRepository } from 'src/modules/stores/domain/repositories/store.repositories';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';
import { StoreNotFoundError } from 'src/modules/stores/application/errors/store-not-found.error';

@Injectable()
export class GetStoreStocksUseCase {
  constructor(
    @Inject(StoreRepository) private storeRepository: StoreRepository,
    @Inject(StoreStockRepository) private storeStockRepository: StoreStockRepository,
  ) {}

  async execute(storeId: string) {
    const store = await this.storeRepository.findById(storeId);
    if (!store) throw new StoreNotFoundError();

    return this.storeStockRepository.findByStoreId(storeId);
  }
}
