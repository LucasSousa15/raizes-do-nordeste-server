import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindStockDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Filtrar por ID da loja (retorna estoque por loja)' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ example: '987e6543-e21b-12d3-a456-426614174000', description: 'Filtrar por ID do produto (para estoque global por produto)' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Número da página (se houver paginação)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Itens por página (se houver paginação)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}