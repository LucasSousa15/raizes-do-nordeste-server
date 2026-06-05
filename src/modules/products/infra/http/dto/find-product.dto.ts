import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FindProductDTO {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do produto',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    example: 'Baiao',
    description: 'Nome ou parte do nome do produto',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 5,
    minimum: 0,
    description: 'Preco minimo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 50,
    minimum: 0,
    description: 'Preco maximo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Pagina atual',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    description: 'Itens por pagina',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Data inicial de criacao',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAtStart?: Date;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.999Z',
    description: 'Data final de criacao',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAtEnd?: Date;
}
