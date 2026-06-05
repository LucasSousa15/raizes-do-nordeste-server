import { Module } from '@nestjs/common';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { FindProductsUseCase } from './application/use-cases/find-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { ProductRepository } from './domain/repositories/product.repositorie';
import { PrismaProductsRepository } from './infra/database/prisma/repositories/prisma-product.repositorie';
import { ProductsController } from './infra/http/controllers/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    FindProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    {
      provide: ProductRepository,
      useClass: PrismaProductsRepository,
    },
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
