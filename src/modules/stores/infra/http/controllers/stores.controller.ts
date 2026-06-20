import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateStoreUseCase } from 'src/modules/stores/application/use-cases/create-store.use-case';
import { FindStoreUseCase } from 'src/modules/stores/application/use-cases/find-store.use-case';
import { UpdateStoreUseCase } from 'src/modules/stores/application/use-cases/update-store.use-case';
import { DeleteStoreUseCase } from 'src/modules/stores/application/use-cases/delete-store.use-case';
import { CreateStoreDTO, AddressDTO } from '../dto/create-store.dto';
import { IStore, FindStoresReq } from 'src/modules/stores/domain/@types/store';
import { FindStoreDTO } from '../dto/find-store.dto';
import { UpdateStoreDTO } from '../dto/update-store.dto';
import { FindStoreView, StoreViewModel } from '../view-models/store.view-model';
import { JwtAuthGuard } from 'src/modules/auth/infra/http/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/infra/http/guards/permission.guard';
import { RequirePermission } from 'src/modules/auth/infra/http/decorators/require-permission.decorator';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(
    private readonly createStoreUseCase: CreateStoreUseCase,
    private readonly findStoreUseCase: FindStoreUseCase,
    private readonly updateStoreUseCase: UpdateStoreUseCase,
    private readonly deleteStoreUseCase: DeleteStoreUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('create:store')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar loja' })
  @ApiBody({ type: CreateStoreDTO })
  @ApiCreatedResponse({ description: 'Loja criada com sucesso' })
  async create(@Body() createStoreDTO: CreateStoreDTO): Promise<void> {
    const address = composeAddress(createStoreDTO.address);

    await this.createStoreUseCase.execute({ name: createStoreDTO.name, address } as Omit<IStore, 'id' | 'createdAt' | 'updatedAt'>);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar lojas' })
  @ApiOkResponse({ description: 'Lojas encontradas com sucesso' })
  async find(@Query() findStoreDTO: FindStoreDTO): Promise<FindStoreView> {
    const stores = await this.findStoreUseCase.execute(findStoreDTO as unknown as FindStoresReq);

    return {
      store: StoreViewModel.toHTTP(stores),
    } as FindStoreView;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar loja por id' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID da loja' })
  @ApiOkResponse({ description: 'Loja encontrada com sucesso' })
  async findById(@Param('id') id: string): Promise<{ store: any } | null> {
    const stores = await this.findStoreUseCase.execute({ storeId: id } as FindStoresReq);
    const [store] = stores.data;

    return { store: StoreViewModel.toHTTP(store) } as { store: IStore | null };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('update:store')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar loja' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID da loja' })
  @ApiBody({ type: UpdateStoreDTO })
  @ApiNoContentResponse({ description: 'Loja atualizada com sucesso' })
  async update(@Param('id') id: string, @Body() updateStoreDTO: UpdateStoreDTO): Promise<void> {
    const address = updateStoreDTO.address ? composeAddress(updateStoreDTO.address) : undefined;

    await this.updateStoreUseCase.execute(id, updateStoreDTO.name ?? undefined, address ?? undefined);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover loja' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID da loja' })
  @ApiNoContentResponse({ description: 'Loja removida com sucesso' })
  @RequirePermission('delete:store')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteStoreUseCase.execute(id);
  }
}

function composeAddress(address: AddressDTO): string {
  const parts = [address.streetAndNumber, address.neighborhood, address.city].filter(Boolean);
  const main = parts.join(', ');
  return address.cep ? `${main} - CEP ${address.cep}` : main;
}
