import { Inject, Injectable } from '@nestjs/common';
import { GlobalStockRepository } from 'src/modules/stocks/domain/repositories/global-stock.repositorie';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repositorie';
import { ProductNotFoundError } from 'src/modules/products/application/errors/product-not-found.error';

@Injectable()
export class GetGlobalStockUseCase {
  constructor(
    @Inject(GlobalStockRepository) private globalStockRepository: GlobalStockRepository,
    @Inject(ProductRepository) private productRepository: ProductRepository,
  ) {}

  async execute(productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError();

    return this.globalStockRepository.findByProductId(productId);
  }
}
