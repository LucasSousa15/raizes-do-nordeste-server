import { Module } from '@nestjs/common';
import { UsersRepository } from './domain/repositories/users.repositories';
import { PrismaUsersRepository } from './infra/database/prisma/repositories/prisma-users.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UsersController } from './infra/http/controllers/users.controller';
import { FindUserUseCase } from './application/use-cases/find-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.user.case';
import { DeleteUserUseCase } from './application/use-cases/delete-users.use-case';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    FindUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
