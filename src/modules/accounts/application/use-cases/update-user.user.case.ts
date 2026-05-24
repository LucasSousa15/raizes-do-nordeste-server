import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserProfile, UserRole, UserStatus } from "../../@types/users";
import { UsersRepository } from "../../domain/repositories/users.repositories";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { DataAlreadyUsedError } from "../errors/data-already-used.error";
import { ProfileRequiredError } from "../errors/profile-required.error";
import { PersonalInfoRequiredError } from "../errors/personal-info-required.error";

export type UpdateUserReq = {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    status?: UserStatus;
    role?: UserRole;
    profile?: UserProfile;
    customerData?: {
        cpf: string;
        updatedAt?: Date;
        points?: number;
        consentAt?: Date | null;
        consent?: boolean;
    };
};

export type UpdateUserRes = {
    user: {
        id: string;
        name: string;
        email: string;
        status: UserStatus;
        role: UserRole;
    };
};

@Injectable()
export class UpdateUserUseCase {
    constructor(private readonly userRepository: UsersRepository) {}

    async execute(data: UpdateUserReq): Promise<UpdateUserRes> {
        const user = await this.userRepository.findById(data.id);
        if (!user) throw new UserNotFoundError();

        if (data.email && data.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser) throw new DataAlreadyUsedError();
        }

        if (data.role === UserRole.STAFF && !data.profile) {
            throw new ProfileRequiredError();
        }

        if (data.role === UserRole.CUSTOMER && !data.customerData) {
            throw new PersonalInfoRequiredError();
        }

        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
        const now = new Date();
        const customerData = data.customerData
            ? {
                id: user.customerData?.id ?? crypto.randomUUID(),
                cpf: data.customerData.cpf,
                consent: data.customerData.consent ?? user.customerData?.consent ?? false,
                consentAt:
                    data.customerData.consentAt !== undefined
                        ? data.customerData.consentAt
                        : data.customerData.consent === true
                        ? (user.customerData?.consentAt ?? now)
                        : (user.customerData?.consentAt ?? null),
                points: data.customerData.points ?? user.customerData?.points ?? 0,
                createdAt: user.customerData?.createdAt ?? now,
                updatedAt: data.customerData.updatedAt ?? now,
            }
            : user.customerData;

        const updatedUser = await this.userRepository.update({
            id: data.id,
            name: data.name ?? user.name,
            email: data.email ?? user.email,
            password: hashedPassword ?? user.password,
            status: data.status ?? user.status,
            role: data.role ?? user.role,
            profile: data.profile ?? user.profile,
            customerData,
        });

        if (!updatedUser) throw new Error("Falha ao atualizar usuário"); 
        return {
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                status: updatedUser.status,
                role: updatedUser.role,
            },
        };
    }
}
