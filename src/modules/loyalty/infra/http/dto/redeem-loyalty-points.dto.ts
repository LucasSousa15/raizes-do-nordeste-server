import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class RedeemLoyaltyPointsDto {
  @ApiProperty({
    example: 10,
    minimum: 1,
    description: 'Quantidade de pontos a resgatar',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  points!: number;
}
