import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repositorie';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';
import { StoreNotFoundError } from '../errors/store-not-found.error';
import { StoreRepository } from '../../domain/repositories/store.repositories';

export type StoreMenuItem = {
  productId: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity: number;
  available: boolean;
};

export type StoreMenuResult = {
  storeId: string;
  storeName: string;
  items: StoreMenuItem[];
};

@Injectable()
export class GetStoreMenuUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly storeStockRepository: StoreStockRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(storeId: string): Promise<StoreMenuResult> {
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new StoreNotFoundError();
    }

    const stocks = await this.storeStockRepository.findByStoreId(storeId);
    const items: StoreMenuItem[] = [];

    for (const stock of stocks) {
      const product = await this.productRepository.findById(stock.productId);
      if (!product) continue;

      items.push({
        productId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        availableQuantity: stock.quantity,
        available: stock.quantity > 0,
      });
    }

    return {
      storeId: store.id,
      storeName: store.name,
      items,
    };
  }
}
