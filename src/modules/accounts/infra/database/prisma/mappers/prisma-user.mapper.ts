import {
  Customer,
  IUser,
  PaginatedUsers,
  UserProfile,
  UserRole,
  UserStatus,
} from 'src/modules/accounts/@types/users';
import type {
  User,
  Role,
  User_status,
  Profile,
  Customer as PrismaCustomer,
  Prisma,
} from '@prisma/client';
import { User_status as PrismaUserStatus } from '@prisma/client';

const roleDomainToPrisma: Record<UserRole, Role> = {
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.STAFF]: 'STAFF',
  [UserRole.CUSTOMER]: 'CUSTOMER',
} as const;

const rolePrismaToDomain: Record<Role, UserRole> = {
  ADMIN: UserRole.ADMIN,
  STAFF: UserRole.STAFF,
  CUSTOMER: UserRole.CUSTOMER,
};

const statusDomainToPrisma: Record<UserStatus, User_status> = {
  [UserStatus.ACTIVE]: PrismaUserStatus.ACTIVE,
  [UserStatus.INACTIVE]: PrismaUserStatus.INACTIVE,
  [UserStatus.SUSPENDED]: PrismaUserStatus.SUSPENDED,
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

export function statusToPrisma(status: UserStatus): User_status {
  const mapped = statusDomainToPrisma[status as UserStatus];
  if (!mapped) throw new Error(`Unknown UserStatus: ${status}`);
  return mapped;
}

function statusFromPrisma(status: User_status): UserStatus {
  const mapped = statusPrismaToDomain[status as User_status];
  if (!mapped) throw new Error(`Unknown Prisma User_status: ${status}`);
  return mapped;
}

function profileToPrisma(profile?: UserProfile): Profile | null {
  if (!profile) return null;
  return profile as unknown as Profile;
}

function customerDataToPrisma(customerData: Customer): PrismaCustomer | null {
  if (!customerData) return null;
  return {
    id: customerData.id,
    cpf: customerData.cpf,
    consent: customerData.consent,
    consentAt: customerData.consentAt,
    points: customerData.points,
    userId: customerData.id,
    createdAt: customerData.createdAt,
    updatedAt: customerData.updatedAt,
  };
}

export class PrismaUserMapper {
  static toPrisma(user: IUser): Prisma.UserCreateInput {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: roleToPrisma(user.role),
      status: statusToPrisma(user.status),
      profile: profileToPrisma(user.profile),
      customer: user.customerData
        ? {
            create: {
              id: user.customerData.id,
              cpf: user.customerData.cpf,
              consent: user.customerData.consent,
              consentAt: user.customerData.consentAt,
              points: user.customerData.points,
              createdAt: user.customerData.createdAt,
              updatedAt: user.customerData.updatedAt,
            },
          }
        : undefined,
    };
  }

  static toDomain(raw: User & { customer?: PrismaCustomer | null }): IUser {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: roleFromPrisma(raw.role),
      status: statusFromPrisma(raw.status),
      profile: raw.profile as unknown as UserProfile,
      customerData: raw.customer
        ? {
            id: raw.customer.id,
            cpf: raw.customer.cpf,
            consent: raw.customer.consent,
            consentAt: raw.customer.consentAt,
            points: raw.customer.points,
            createdAt: raw.customer.createdAt,
            updatedAt: raw.customer.updatedAt,
          }
        : undefined,
    };
  }
}

export class PrismaPaginatedUsersMapper {
  static toDomain(
    raw: Array<User & { customer?: PrismaCustomer | null }>,
    meta: {
      totalItems: number;
      currentPage: number;
      itemsPerPage: number;
    },
  ): PaginatedUsers {
    return {
      data: raw.map(PrismaUserMapper.toDomain),
      meta: {
        totalItems: meta.totalItems,
        currentPage: meta.currentPage,
        itemsPerPage: meta.itemsPerPage,
        lastPage: Math.ceil(meta.totalItems / meta.itemsPerPage),
      },
    };
  }
}
