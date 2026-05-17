import { Injectable } from "@nestjs/common";
import { IUser, UserProfile, UserRole, UserStatus } from "../../@types/users";
import { UsersRepository } from "../../domain/repositories/users.repositories";
import { ProfileRequiredError } from "../errors/profile-required.error";
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

interface CreateUserReq {
    name: string;
    email: string;
    password: string;
    status: UserStatus;
    role: UserRole;
    profile?: UserProfile;
}

interface CreateUserRes {
    user: IUser;
}

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userRepository: UsersRepository) {}

    async execute(data: CreateUserReq): Promise<CreateUserRes> {

        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await this.userRepository.create({
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            password: passwordHash,
            role: data.role,
            status: UserStatus.ACTIVE,
            profile: data.profile
        });

        if (data.role === UserRole.STAFF && !data.profile) {
            throw new ProfileRequiredError();
        }

        return { user };
    }
}