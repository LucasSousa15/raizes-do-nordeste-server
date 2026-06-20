import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { FindOrderDto } from '../dto/find-order.dto';
import { OrderViewModel } from '../view-models/order.view-model';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { FindOrdersUseCase } from '../../../application/use-cases/find-orders.use-case';
import { UpdateOrderUseCase } from '../../../application/use-cases/update-order.use-case';
import { DeleteOrderUseCase } from '../../../application/use-cases/delete-order.use-case';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrdersUseCase: FindOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateOrderDto) {
    // TODO: implementar
  }

  @Get()
  async find(@Body() body: FindOrderDto) {
    // TODO: implementar
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    // TODO: implementar
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // TODO: implementar
  }
}