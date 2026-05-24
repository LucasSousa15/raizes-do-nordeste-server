import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateUserUseCase } from 'src/modules/accounts/application/use-cases/create-user.use-case';
import type { CreateUserRes } from 'src/modules/accounts/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from 'src/modules/accounts/application/use-cases/delete-users.use-case';
import { FindUserUseCase } from 'src/modules/accounts/application/use-cases/find-users.use-case';
import { UpdateUserUseCase } from 'src/modules/accounts/application/use-cases/update-user.user.case';
import type { UpdateUserRes } from 'src/modules/accounts/application/use-cases/update-user.user.case';
import {
  AdminUserDTO,
  StaffUserDTO,
  CustomerUserDTO,
  CustomerDataDTO,
} from '../dto/create-user.dto';
import { FindUserDTO } from '../dto/find-user.dto';
import {
  UpdateAdminUserDTO,
  UpdateCustomerDataDTO,
  UpdateCustomerUserDTO,
  UpdateStaffUserDTO,
} from '../dto/update-user.dto';
import type { UpdateUserDTO } from '../dto/update-user.dto';
import {
  UserProfile,
  UserRole,
  UserStatus,
} from 'src/modules/accounts/@types/users';
import { FindUserView, UserViewModel } from '../view-models/user.view-model';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Find users' })
  async find(@Query() findUserDTO: FindUserDTO): Promise<FindUserView> {
    const { user } = await this.findUserUseCase.execute(findUserDTO);

    return {
      user: UserViewModel.toHTTP(user),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiExtraModels(AdminUserDTO, StaffUserDTO, CustomerUserDTO, CustomerDataDTO)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AdminUserDTO) },
        { $ref: getSchemaPath(StaffUserDTO) },
        { $ref: getSchemaPath(CustomerUserDTO) },
      ],
      discriminator: {
        propertyName: 'role',
        mapping: {
          [UserRole.ADMIN]: getSchemaPath(AdminUserDTO),
          [UserRole.STAFF]: getSchemaPath(StaffUserDTO),
          [UserRole.CUSTOMER]: getSchemaPath(CustomerUserDTO),
        },
      },
    },
    examples: {
      admin: {
        summary: 'Admin',
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          role: UserRole.ADMIN,
        },
      },
      staff: {
        summary: 'Staff',
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          role: UserRole.STAFF,
          profile: UserProfile.KITCHEN,
        },
      },
      customer: {
        summary: 'Customer',
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          role: UserRole.CUSTOMER,
          customerData: {
            cpf: '123.456.789-00',
            consent: true,
            consentAt: '2026-05-17T00:00:00.000Z',
            points: 0,
            createdAt: '2026-05-17T00:00:00.000Z',
            updatedAt: '2026-05-17T00:00:00.000Z',
          },
        },
      },
    },
  })
  async create(
    @Body() createUserDTO: AdminUserDTO | StaffUserDTO | CustomerUserDTO,
  ): Promise<CreateUserRes> {
    const payload: any = {
      name: createUserDTO.name,
      email: createUserDTO.email,
      password: createUserDTO.password,
      role: (createUserDTO as any).role,
      status: UserStatus.ACTIVE,
    };

    if ('profile' in createUserDTO)
      payload.profile = (createUserDTO as any).profile;
    if ('customerData' in createUserDTO)
      payload.customerData = (createUserDTO as any).customerData;

    return this.createUserUseCase.execute(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do usuario',
  })
  @ApiExtraModels(
    UpdateAdminUserDTO,
    UpdateStaffUserDTO,
    UpdateCustomerUserDTO,
    UpdateCustomerDataDTO,
  )
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UpdateAdminUserDTO) },
        { $ref: getSchemaPath(UpdateStaffUserDTO) },
        { $ref: getSchemaPath(UpdateCustomerUserDTO) },
      ],
      discriminator: {
        propertyName: 'role',
        mapping: {
          [UserRole.ADMIN]: getSchemaPath(UpdateAdminUserDTO),
          [UserRole.STAFF]: getSchemaPath(UpdateStaffUserDTO),
          [UserRole.CUSTOMER]: getSchemaPath(UpdateCustomerUserDTO),
        },
      },
    },
    examples: {
      admin: {
        summary: 'Admin',
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          status: UserStatus.ACTIVE,
          role: UserRole.ADMIN,
        },
      },
      staff: {
        summary: 'Staff',
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          status: UserStatus.ACTIVE,
          role: UserRole.STAFF,
          profile: UserProfile.KITCHEN,
        },
      },
      customer: {
        summary: 'Customer',
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          status: UserStatus.ACTIVE,
          role: UserRole.CUSTOMER,
          customerData: {
            cpf: '123.456.789-00',
            consent: true,
            consentAt: '2026-05-17T00:00:00.000Z',
            points: 10,
            updatedAt: '2026-05-17T00:00:00.000Z',
          },
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<UpdateUserRes> {
    return this.updateUserUseCase.execute({ id, ...updateUserDTO });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do usuario',
  })
  @ApiNoContentResponse({ description: 'Usuario removido com sucesso' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute({ id });
  }
}
