import { Module } from '@nestjs/common';
import { StocksController } from './infra/http/controllers/stocks.controller';
import { PrismaStocksRepository } from './infra/database/prisma/repositories/prisma-stock.repositorie';
import { StockRepository } from './domain/repositories/stock.repositorie';
import { CreateStockUseCase } from './application/use-cases/create-stock.use-case';
import { FindStocksUseCase } from './application/use-cases/find-stocks.use-case';
import { UpdateStockUseCase } from './application/use-cases/update-stock.use-case';
import { DeleteStockUseCase } from './application/use-cases/delete-stock.use-case';

@Module({
  controllers: [StocksController],
  providers: [
    CreateStockUseCase,
    FindStocksUseCase,
    UpdateStockUseCase,
    DeleteStockUseCase,
    {
      provide: StockRepository,
      useClass: PrismaStocksRepository,
    },
  ],
  exports: [],
})
export class StocksModule {}