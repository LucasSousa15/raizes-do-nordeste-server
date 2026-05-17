import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/core/providers/database/models/prisma.service";
import { IUser, PaginatedUsers } from "src/modules/accounts/@types/users";
import { UsersRepository } from "src/modules/accounts/domain/repositories/users.repositories";
import { PrismaUserMapper } from "../mappers/prisma-user.mapper";


@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private prisma: PrismaService) {}
    findByEmail(email: string): Promise<IUser | null> {
        const prismUSer = PrismaUserMapper.toPrisma({ email: email } as IUser);
        return this.prisma.user.findUnique({
            where: { email: prismUSer.email }
        }).then(user => {
            if (!user) return null;
            return PrismaUserMapper.toDomain(user);
        });
    }
    findById(id: string): Promise<IUser | null> {
        throw new Error("Method not implemented.");
    }
    findMany(): Promise<PaginatedUsers> {
        throw new Error("Method not implemented.");
    }
    update(user: IUser): Promise<IUser> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async create(data: IUser): Promise<IUser> {
        const prismaData = PrismaUserMapper.toPrisma(data);
        const createdUser = await this.prisma.user.create({ data: prismaData });

        return PrismaUserMapper.toDomain(createdUser);
    }

}