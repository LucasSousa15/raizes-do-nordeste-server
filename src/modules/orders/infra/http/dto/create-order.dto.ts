import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderChannel } from '../../../domain/@types/order';

export class CreateOrderItemDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do produto',
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    example: 2,
    minimum: 1,
    description: 'Quantidade do produto no pedido',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID da loja/unidade',
  })
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({
    example: '987e6543-e21b-12d3-a456-426614174000',
    description: 'ID do usuário cliente (User.id) associado ao pedido',
  })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({
    enum: OrderChannel,
    example: OrderChannel.ONLINE,
    description: 'Canal de origem do pedido',
  })
  @IsEnum(OrderChannel)
  channel!: OrderChannel;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Itens do pedido. O preço é calculado pelo produto cadastrado.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({
    example: 'DESC10',
    description: 'Código do cupom promocional (opcional)',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}