import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repositorie';
import { StoreRepository } from 'src/modules/stores/domain/repositories/store.repositories';
import { GlobalStockRepository } from 'src/modules/stocks/domain/repositories/global-stock.repositorie';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';
import { InsufficientStockError } from '../errors/insufficient-stock.error';

type TransferInput = { productId: string; storeId: string; quantity: number; sourceStoreId: string };

@Injectable()
export class TransferGlobalToStoreUseCase {
  constructor(
    @Inject(ProductRepository) private productRepository: ProductRepository,
    @Inject(StoreRepository) private storeRepository: StoreRepository,
    @Inject(GlobalStockRepository) private globalStockRepository: GlobalStockRepository,
    @Inject(StoreStockRepository) private storeStockRepository: StoreStockRepository,
  ) {}

  async execute({ productId, storeId, quantity, sourceStoreId }: TransferInput) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new Error('Product not found');

    const store = await this.storeRepository.findById(storeId);
    if (!store) throw new Error('Store not found');

    const global = await this.globalStockRepository.findByProductId(productId);
    const available = global ? global.quantity : 0;
    if (available < quantity) throw new InsufficientStockError();


    const source = await this.storeStockRepository.findByStoreAndProduct(sourceStoreId, productId);
    if (!source || source.quantity < quantity) throw new InsufficientStockError();

    await this.storeStockRepository.adjustQuantity(sourceStoreId, productId, -quantity);
    await this.storeStockRepository.upsertIncrement(storeId, productId, quantity);
  }
}
