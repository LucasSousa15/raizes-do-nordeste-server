import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repositorie';
import { StoreRepository } from 'src/modules/stores/domain/repositories/store.repositories';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';
import { InsufficientStockError } from '../errors/insufficient-stock.error';
import { ProductNotFoundError } from 'src/modules/products/application/errors/product-not-found.error';
import { StoreNotFoundError } from 'src/modules/stores/application/errors/store-not-found.error';

type UpdateInput = { storeId: string; productId: string; delta: number };

@Injectable()
export class UpdateStoreStockUseCase {
  constructor(
    @Inject(ProductRepository) private productRepository: ProductRepository,
    @Inject(StoreRepository) private storeRepository: StoreRepository,
    @Inject(StoreStockRepository) private storeStockRepository: StoreStockRepository,
  ) {}

  async execute({ storeId, productId, delta }: UpdateInput) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError();

    const store = await this.storeRepository.findById(storeId);
    if (!store) throw new StoreNotFoundError();

    if (delta < 0) {
      const current = await this.storeStockRepository.findByStoreAndProduct(storeId, productId);
      if (!current || current.quantity < Math.abs(delta)) throw new InsufficientStockError();
    }

    const updated = await this.storeStockRepository.adjustQuantity(storeId, productId, delta);
    return updated;
  }
}
