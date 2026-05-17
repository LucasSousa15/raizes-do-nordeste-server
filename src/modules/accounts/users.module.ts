import { Module } from "@nestjs/common";
import { UsersRepository } from "./domain/repositories/users.repositories";
import { PrismaUsersRepository } from "./infra/database/prisma/repositories/prisma-users.repository";
import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";
import { UsersController } from "./infra/http/controllers/users.controller";

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [
        CreateUserUseCase,
        {
        provide: UsersRepository,
        useClass: PrismaUsersRepository
    }
    ],
    exports: [UsersRepository]
})
export class UsersModule {}

