import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
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
}
