import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDate,
  IsNumber,
  Min,
  ValidateNested,
  Equals,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserProfile, UserRole } from 'src/modules/accounts/@types/users';

export class CustomerDataDTO {
  @ApiProperty({ example: '123.456.789-00', description: 'CPF do cliente' })
  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @ApiProperty({ example: true, description: 'Consentimento do cliente' })
  @IsBoolean()
  @IsNotEmpty()
  consent!: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Data do consentimento' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  consentAt!: Date;

  @ApiProperty({ example: 0, description: 'Pontos acumulados' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  points!: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Data de criação' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Data de atualização' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  updatedAt!: Date;
}

export class AdminUserDTO {
  @ApiProperty({ example: 'John Doe', description: 'Nome completo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'E-mail' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Senha' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: UserRole.ADMIN, enum: UserRole, description: 'Role do usuário' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  @Equals(UserRole.ADMIN)
  role!: UserRole;
}

export class StaffUserDTO {
  @ApiProperty({ example: 'John Doe', description: 'Nome completo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'E-mail' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Senha' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: UserRole.STAFF, enum: UserRole, description: 'Papel do usuário' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  @Equals(UserRole.STAFF)
  role!: UserRole;

  @ApiProperty({ enum: UserProfile, description: 'Perfil (obrigatório para staff)' })
  @IsEnum(UserProfile)
  @IsNotEmpty()
  profile!: UserProfile;
}

export class CustomerUserDTO {
  @ApiProperty({ example: 'John Doe', description: 'Nome completo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'E-mail' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Senha' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: UserRole.CUSTOMER, enum: UserRole, description: 'Papel do usuário' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  @Equals(UserRole.CUSTOMER)
  role!: UserRole;

  @ApiProperty({ type: () => CustomerDataDTO, description: 'Dados do cliente' })
  @ValidateNested()
  @Type(() => CustomerDataDTO)
  @IsDefined()
  customerData!: CustomerDataDTO;
}
