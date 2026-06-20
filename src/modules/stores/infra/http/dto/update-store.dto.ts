import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDTO } from './create-store.dto';

export class UpdateStoreDTO {
  @ApiPropertyOptional({ example: 'Loja Atualizada', description: 'Novo nome da loja' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: AddressDTO, description: 'Novo endereço dividido em campos' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDTO)
  address?: AddressDTO;
}
