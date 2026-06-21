import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrderChannel, OrderStatus } from '../../../domain/@types/order';

export class FindOrderDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do pedido',
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID da loja/unidade',
  })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({
    example: '987e6543-e21b-12d3-a456-426614174000',
    description: 'ID do cliente',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    enum: OrderChannel,
    example: OrderChannel.ONLINE,
    description: 'Canal de origem do pedido',
  })
  @IsOptional()
  @IsEnum(OrderChannel)
  channel?: OrderChannel;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Status do pedido',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 50,
    minimum: 0,
    description: 'Valor total minimo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minTotalAmount?: number;

  @ApiPropertyOptional({
    example: 500,
    minimum: 0,
    description: 'Valor total maximo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxTotalAmount?: number;

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
