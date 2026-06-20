import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductUseCase } from 'src/modules/products/application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from 'src/modules/products/application/use-cases/delete-product.use-case';
import { FindProductsUseCase } from 'src/modules/products/application/use-cases/find-products.use-case';
import { UpdateProductUseCase } from 'src/modules/products/application/use-cases/update-product.use-case';
import { JwtAuthGuard } from 'src/modules/auth/infra/http/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/infra/http/guards/permission.guard';
import { RequirePermission } from 'src/modules/auth/infra/http/decorators/require-permission.decorator';
import { CreateProductDTO } from '../dto/create-product.dto';
import { FindProductDTO } from '../dto/find-product.dto';
import { UpdateProductDTO } from '../dto/update-product.dto';
import {
  FindProductView,
  ProductView,
  ProductViewModel,
} from '../view-model/product.view-model';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductsUseCase: FindProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get()
  @RequirePermission('list:products')
  @ApiOperation({ summary: 'Buscar produtos' })
  @ApiOkResponse({ description: 'Produtos encontrados com sucesso' })
  async find(
    @Query() findProductDTO: FindProductDTO,
  ): Promise<FindProductView> {
    const products = await this.findProductsUseCase.execute(findProductDTO);

    return {
      product: ProductViewModel.toHTTP(products),
    };
  }

  @Get(':id')
  @RequirePermission('read:product')
  @ApiOperation({ summary: 'Buscar produto por id' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do produto',
  })
  @ApiOkResponse({ description: 'Produto encontrado com sucesso' })
  async findById(@Param('id') id: string): Promise<{ product: ProductView }> {
    const products = await this.findProductsUseCase.execute({ productId: id });
    const [product] = products.data;

    return {
      product: ProductViewModel.toHTTP(product),
    };
  }

  @Post()
  @RequirePermission('create:product')
  @ApiOperation({ summary: 'Criar produto' })
  @ApiBody({ type: CreateProductDTO })
  @ApiCreatedResponse({ description: 'Produto criado com sucesso' })
  async create(@Body() createProductDTO: CreateProductDTO): Promise<void> {
    await this.createProductUseCase.execute(createProductDTO);
  }

  @Patch(':id')
  @RequirePermission('update:product')
  @HttpCode(204)
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do produto',
  })
  @ApiBody({ type: UpdateProductDTO })
  @ApiNoContentResponse({ description: 'Produto atualizado com sucesso' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDTO: UpdateProductDTO,
  ): Promise<void> {
    await this.updateProductUseCase.execute(id, updateProductDTO);
  }

  @Delete(':id')
  @RequirePermission('delete:product')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover produto' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do produto',
  })
  @ApiNoContentResponse({ description: 'Produto removido com sucesso' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteProductUseCase.execute(id);
  }
}
