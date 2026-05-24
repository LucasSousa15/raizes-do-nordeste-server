import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  UserProfile,
  UserRole,
  UserStatus,
} from 'src/modules/accounts/@types/users';

export class UpdateCustomerDataDTO {
  @ApiProperty({ example: '123.456.789-00', description: 'CPF do cliente' })
  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @ApiPropertyOptional({ example: true, description: 'Consentimento do cliente' })
  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @ApiPropertyOptional({
    example: '2026-05-17T00:00:00.000Z',
    description: 'Data do consentimento',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  consentAt?: Date | null;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    description: 'Pontos acumulados',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({
    example: '2026-05-17T00:00:00.000Z',
    description: 'Data de atualizacao',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}

class BaseUpdateUserDTO {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Nome completo',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'johndoe@example.com',
    description: 'E-mail',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'password123',
    description: 'Senha',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'Status do usuario',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateAdminUserDTO extends BaseUpdateUserDTO {
  @ApiPropertyOptional({
    example: UserRole.ADMIN,
    enum: UserRole,
    description: 'Papel do usuario',
  })
  @IsOptional()
  @IsEnum(UserRole)
  @Equals(UserRole.ADMIN)
  role?: UserRole;
}

export class UpdateStaffUserDTO extends BaseUpdateUserDTO {
  @ApiPropertyOptional({
    example: UserRole.STAFF,
    enum: UserRole,
    description: 'Papel do usuario',
  })
  @IsOptional()
  @IsEnum(UserRole)
  @Equals(UserRole.STAFF)
  role?: UserRole;

  @ApiProperty({
    example: UserProfile.KITCHEN,
    enum: UserProfile,
    description: 'Perfil do usuario staff',
  })
  @IsEnum(UserProfile)
  @IsNotEmpty()
  profile!: UserProfile;
}

export class UpdateCustomerUserDTO extends BaseUpdateUserDTO {
  @ApiPropertyOptional({
    example: UserRole.CUSTOMER,
    enum: UserRole,
    description: 'Papel do usuario',
  })
  @IsOptional()
  @IsEnum(UserRole)
  @Equals(UserRole.CUSTOMER)
  role?: UserRole;

  @ApiProperty({
    type: () => UpdateCustomerDataDTO,
    description: 'Dados do cliente',
  })
  @ValidateNested()
  @Type(() => UpdateCustomerDataDTO)
  @IsNotEmpty()
  customerData!: UpdateCustomerDataDTO;
}

export type UpdateUserDTO =
  | UpdateAdminUserDTO
  | UpdateStaffUserDTO
  | UpdateCustomerUserDTO;
