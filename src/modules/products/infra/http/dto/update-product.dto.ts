import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDTO {
  @ApiPropertyOptional({
    example: 'Baiao de Dois',
    description: 'Nome do produto',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'Arroz e feijao verde com queijo coalho e carne de sol',
    description: 'Descricao do produto',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 18.9,
    minimum: 0.01,
    description: 'Preco do produto',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;
}
