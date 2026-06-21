import { forwardRef, Module } from '@nestjs/common';
import { StocksController } from './infra/http/controllers/stocks.controller';
import { PrismaGlobalStockRepository } from './infra/database/prisma/repositories/prisma-global-stock.repositorie';
import { GlobalStockRepository } from './domain/repositories/global-stock.repositorie';
import { ProductsModule } from '../products/products.module';
import { StoresModule } from '../stores/stores.module';
import { PrismaStoreStockRepository } from './infra/database/prisma/repositories/prisma-store-stock.repositorie';
import { StoreStockRepository } from './domain/repositories/store-stock.repositorie';
import { ProductRepository } from '../products/domain/repositories/product.repositorie';
import { StoreRepository } from '../stores/domain/repositories/store.repositories';
import { GetGlobalStockUseCase } from './application/use-cases/get-global-stock.use-case';
import { GetStoreStocksUseCase } from './application/use-cases/get-store-stocks.use-case';
import { UpdateStoreStockUseCase } from './application/use-cases/update-store-stock.use-case';
import { TransferGlobalToStoreUseCase } from './application/use-cases/transfer-global-to-store.use-case';

@Module({
  controllers: [StocksController],
  providers: [
    {
      provide: GlobalStockRepository,
      useClass: PrismaGlobalStockRepository,
    },
    {
      provide: StoreStockRepository,
      useClass: PrismaStoreStockRepository,
    },
    GetGlobalStockUseCase,
    GetStoreStocksUseCase,
    UpdateStoreStockUseCase,
    TransferGlobalToStoreUseCase,
  ],
  exports: [GlobalStockRepository, StoreStockRepository],
  imports: [ProductsModule, forwardRef(() => StoresModule)],
})
export class StocksModule {}