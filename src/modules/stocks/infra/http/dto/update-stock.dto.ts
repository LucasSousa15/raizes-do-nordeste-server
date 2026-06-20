import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStockDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID da loja (para estoque por loja)' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ example: '987e6543-e21b-12d3-a456-426614174000', description: 'ID do produto' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 5, description: 'Variação da quantidade (positivo para incremento, negativo para decremento)' })
  @IsNumber()
  @IsNotEmpty()
  delta!: number;
}