import { Module } from '@nestjs/common';
import { OrdersController } from './infra/http/controllers/orders.controller';
import { PrismaOrdersRepository } from './infra/database/prisma/repositories/prisma-order.repositorie';
import { OrderRepository } from './domain/repositories/order.repositorie';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { FindOrdersUseCase } from './application/use-cases/find-orders.use-case';
import { UpdateOrderUseCase } from './application/use-cases/update-order.use-case';
import { DeleteOrderUseCase } from './application/use-cases/delete-order.use-case';
import { ProductsModule } from '../products/products.module';
import { StocksModule } from '../stocks/stocks.module';
import { UsersModule } from '../accounts/users.module';

@Module({
  imports: [ProductsModule, StocksModule, UsersModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    FindOrdersUseCase,
    UpdateOrderUseCase,
    DeleteOrderUseCase,
    {
      provide: OrderRepository,
      useClass: PrismaOrdersRepository,
    },
  ],
  exports: [],
})
export class OrdersModule {}
