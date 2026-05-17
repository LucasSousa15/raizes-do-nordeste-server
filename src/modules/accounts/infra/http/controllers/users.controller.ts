import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags, ApiExtraModels, getSchemaPath } from "@nestjs/swagger";
import { CreateUserUseCase } from "src/modules/accounts/application/use-cases/create-user.use-case";
import type { CreateUserRes } from 'src/modules/accounts/application/use-cases/create-user.use-case';
import { AdminUserDTO, StaffUserDTO, CustomerUserDTO, CustomerDataDTO } from "../dto/create-user.dto";
import { UserProfile, UserRole, UserStatus } from 'src/modules/accounts/@types/users';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase
    ) {}

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
async create(@Body() createUserDTO: AdminUserDTO | StaffUserDTO | CustomerUserDTO): Promise<CreateUserRes> {
    const payload: any = {
        name: createUserDTO.name,
        email: createUserDTO.email,
        password: createUserDTO.password,
        role: (createUserDTO as any).role,
        status: UserStatus.ACTIVE,
    };

    if ('profile' in createUserDTO) payload.profile = (createUserDTO as any).profile;
    if ('customerData' in createUserDTO) payload.customerData = (createUserDTO as any).customerData;

    return this.createUserUseCase.execute(payload);
}
}
