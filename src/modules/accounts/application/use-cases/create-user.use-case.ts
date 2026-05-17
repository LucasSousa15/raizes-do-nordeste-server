import { Injectable } from "@nestjs/common";
import { CreateUserReq, IUser, UserProfile, UserRole, UserStatus } from "../../@types/users";
import { UsersRepository } from "../../domain/repositories/users.repositories";
import { ProfileRequiredError } from "../errors/profile-required.error";
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PersonalInfoRequiredError } from "../errors/personal-info-required.error";



export interface CreateUserRes {
    user: IUser;
}

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userRepository: UsersRepository) { }

    async execute(data: CreateUserReq): Promise<CreateUserRes> {

        const passwordHash = await bcrypt.hash(data.password, 10);

        const isCustomer = data.role === UserRole.CUSTOMER;

        const user = await this.userRepository.create({
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            password: passwordHash,
            role: data.role,
            status: UserStatus.ACTIVE,
            profile: data.profile,
            customerData: isCustomer ? {
                id: crypto.randomUUID(),
                cpf: data.customerData?.cpf || '',
                consent: true,
                consentAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),

                points: 0
            } : undefined
        });

        if (data.role === UserRole.STAFF && !data.profile) {
            throw new ProfileRequiredError();
        }

        if (data.role === UserRole.CUSTOMER && !data.customerData) {
            throw new PersonalInfoRequiredError();
        }

        return { user };
    }
}