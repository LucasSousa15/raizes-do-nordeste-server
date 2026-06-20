import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateStockDto } from '../dto/create-stock.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { FindStockDto } from '../dto/find-stock.dto';
import { StockViewModel } from '../view-models/stock.view-model';
import { CreateStockUseCase } from '../../../application/use-cases/create-stock.use-case';
import { FindStocksUseCase } from '../../../application/use-cases/find-stocks.use-case';
import { UpdateStockUseCase } from '../../../application/use-cases/update-stock.use-case';
import { DeleteStockUseCase } from '../../../application/use-cases/delete-stock.use-case';

@Controller('stocks')
export class StocksController {
  constructor(
    private readonly createStockUseCase: CreateStockUseCase,
    private readonly findStocksUseCase: FindStocksUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly deleteStockUseCase: DeleteStockUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateStockDto) {
    // TODO: implementar
  }

  @Get()
  async find(@Body() body: FindStockDto) {
    // TODO: implementar
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateStockDto) {
    // TODO: implementar
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // TODO: implementar
  }
}