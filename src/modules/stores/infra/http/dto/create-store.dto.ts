import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDTO {
  @ApiProperty({ example: 'Rua das Flores, 123', description: 'Rua e número' })
  @IsString()
  @IsNotEmpty()
  streetAndNumber!: string;

  @ApiProperty({ example: '12345-678', description: 'CEP' })
  @IsString()
  @IsNotEmpty()
  cep!: string;

  @ApiProperty({ example: 'Bairro Central', description: 'Bairro' })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({ example: 'Fortaleza', description: 'Cidade' })
  @IsString()
  @IsNotEmpty()
  city!: string;
}

export class CreateStoreDTO {
  @ApiProperty({ example: 'Loja do Nordeste', description: 'Nome da loja' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: AddressDTO, description: 'Endereço da loja dividido em campos' })
  @ValidateNested()
  @Type(() => AddressDTO)
  address!: AddressDTO;
}
