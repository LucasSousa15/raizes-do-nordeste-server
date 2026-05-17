import { IUser, UserProfile, UserRole, UserStatus } from "src/modules/accounts/@types/users";
import type { User, Role, User_status, Profile } from "@prisma/client";

// Ajuste os valores abaixo conforme os enums reais do seu domínio e do Prisma.
const roleDomainToPrisma: Record<UserRole, Role> = {
    [UserRole.ADMIN]: "ADMIN",
    [UserRole.STAFF]: "STAFF",
    [UserRole.CUSTOMER]: "CUSTOMER",
} as const;

const rolePrismaToDomain: Record<Role, UserRole> = {
    ADMIN: UserRole.ADMIN,
    STAFF: UserRole.STAFF,
    CUSTOMER: UserRole.CUSTOMER,
};

const statusDomainToPrisma: Record<UserStatus, User_status> = {
    [UserStatus.ACTIVE]: "ACTIVE",
    [UserStatus.INACTIVE]: "INACTIVE",
    [UserStatus.SUSPENDED]: "SUSPENDED",
} as const;

const statusPrismaToDomain: Record<User_status, UserStatus> = {
    ACTIVE: UserStatus.ACTIVE,
    INACTIVE: UserStatus.INACTIVE,
    SUSPENDED: UserStatus.SUSPENDED,
};

function roleToPrisma(role: UserRole): Role {
    const mapped = roleDomainToPrisma[role as UserRole];
    if (!mapped) throw new Error(`Unknown UserRole: ${role}`);
    return mapped;
}

function roleFromPrisma(role: Role): UserRole {
    const mapped = rolePrismaToDomain[role as Role];
    if (!mapped) throw new Error(`Unknown Prisma Role: ${role}`);
    return mapped;
}

function statusToPrisma(status: UserStatus): User_status {
    const mapped = statusDomainToPrisma[status as UserStatus];
    if (!mapped) throw new Error(`Unknown UserStatus: ${status}`);
    return mapped;
}

function statusFromPrisma(status: User_status): UserStatus {
    const mapped = statusPrismaToDomain[status as User_status];
    if (!mapped) throw new Error(`Unknown Prisma User_status: ${status}`);
    return mapped;
}

export class PrismaUserMapper {
    static toPrisma(user: IUser) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: roleToPrisma(user.role),
            status: statusToPrisma(user.status),
            profile: user.profile as unknown as Profile | null
        };
    }

    static toDomain(raw: User): IUser {
        return {
            id: raw.id,
            name: raw.name,
            email: raw.email,
            password: raw.password,
            role: roleFromPrisma(raw.role),
            status: statusFromPrisma(raw.status),
            profile: raw.profile as unknown as UserProfile
        };
    }
}
