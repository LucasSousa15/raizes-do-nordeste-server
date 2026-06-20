import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateStockDto } from '../dto/create-stock.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { FindStockDto } from '../dto/find-stock.dto';
import { StockViewModel } from '../view-models/stock.view-model';
import { GetGlobalStockUseCase } from '../../../application/use-cases/get-global-stock.use-case';
import { GetStoreStocksUseCase } from '../../../application/use-cases/get-store-stocks.use-case';
import { UpdateStoreStockUseCase } from '../../../application/use-cases/update-store-stock.use-case';
import { TransferGlobalToStoreUseCase } from '../../../application/use-cases/transfer-global-to-store.use-case';
import { GlobalStockRepository } from 'src/modules/stocks/domain/repositories/global-stock.repositorie';

@ApiTags('Stocks')
@Controller('stocks')
export class StocksController {
  constructor(
    private readonly getGlobalStockUseCase: GetGlobalStockUseCase,
    private readonly getStoreStocksUseCase: GetStoreStocksUseCase,
    private readonly updateStoreStockUseCase: UpdateStoreStockUseCase,
    private readonly transferGlobalToStoreUseCase: TransferGlobalToStoreUseCase,
    private readonly globalStockRepository: GlobalStockRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar quantidade de estoque por loja' })
  @ApiBody({ type: CreateStockDto })
  @ApiCreatedResponse({ description: 'Quantidade adicionada com sucesso (por loja)' })
  @ApiBadRequestResponse({ description: 'storeId é obrigatório para criar/atualizar estoque' })
  async create(@Body() body: CreateStockDto) {
    if (!body.storeId) throw new BadRequestException('storeId is required for creating store stock');

    const updated = await this.updateStoreStockUseCase.execute({ storeId: body.storeId, productId: body.productId, delta: body.quantity });
    return { stock: StockViewModel.toHTTP(updated) };
  }

  @Get()
  @ApiOperation({ summary: 'Buscar estoques (global ou por loja, conforme query)' })
  @ApiOkResponse({ description: 'Estoques retornados com sucesso' })
  async find(@Query() query: FindStockDto) {
    if (query.storeId) {
      const items = await this.getStoreStocksUseCase.execute(query.storeId);
      return { stocks: StockViewModel.toHTTPList(items) };
    }

    if (query.productId) {
      const stock = await this.getGlobalStockUseCase.execute(query.productId);
      return { stock: StockViewModel.toHTTP(stock) };
    }

    const list = await this.globalStockRepository.findAll();
    return { stocks: StockViewModel.toHTTPList(list) };
  }

  @Put()
  @ApiOperation({ summary: 'Ajustar quantidade de estoque por loja (delta)' })
  @ApiBody({ type: UpdateStockDto })
  @ApiOkResponse({ description: 'Estoque ajustado com sucesso' })
  @ApiBadRequestResponse({ description: 'storeId obrigatório para ajuste por loja' })
  async update(@Body() body: UpdateStockDto) {
    if (!body.storeId) throw new BadRequestException('storeId is required to update store stock');

    const updated = await this.updateStoreStockUseCase.execute({ storeId: body.storeId, productId: body.productId, delta: body.delta });
    return { stock: StockViewModel.toHTTP(updated) };
  }

  @Post('transfer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Transferir quantidade do estoque global / outro estoque para uma loja' })
  @ApiBody({ schema: { example: { productId: 'pid', storeId: 'destStoreId', quantity: 5, sourceStoreId: 'sourceStoreId' } } })
  async transfer(@Body() body: { productId: string; storeId: string; quantity: number; sourceStoreId: string }) {
    await this.transferGlobalToStoreUseCase.execute({ productId: body.productId, storeId: body.storeId, quantity: body.quantity, sourceStoreId: body.sourceStoreId });
  }
}