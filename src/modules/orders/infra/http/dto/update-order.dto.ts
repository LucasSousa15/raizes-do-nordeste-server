import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { OrderStatus } from '../../../domain/@types/order';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
    description: 'Novo status do pedido',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: true,
    description: 'Confirma o pagamento mockado e atualiza o pedido para confirmado',
  })
  @IsOptional()
  @IsBoolean()
  confirmPayment?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Simula falha no pagamento mockado (apenas para testes)',
  })
  @IsOptional()
  @IsBoolean()
  simulatePaymentFailure?: boolean;

  @ApiPropertyOptional({
    example: 'approve-order-1234567890',
    description:
      'Chave de idempotência para o pagamento. Prefixos `approve-` e `reject-` forçam o resultado do mock.',
  })
  @IsOptional()
  @IsString()
  @MinLength(16)
  idempotencyKey?: string;
}
