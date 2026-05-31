import { RefreshToken, Role } from '@prisma/client';
import { UserRole } from 'src/modules/accounts/@types/users';
import { RefreshTokenData } from 'src/modules/auth/domain/repositories/refresh-token.repositorie';

const roleDomainToPrisma: Record<UserRole, Role> = {
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.STAFF]: 'STAFF',
  [UserRole.CUSTOMER]: 'CUSTOMER',
};

const rolePrismaToDomain: Record<Role, UserRole> = {
  ADMIN: UserRole.ADMIN,
  STAFF: UserRole.STAFF,
  CUSTOMER: UserRole.CUSTOMER,
};

export class PrismaRefreshTokenMapper {
  static toPrisma(data: RefreshTokenData) {
    return {
      id: data.id,
      hashed_token: data.hashed_token,
      userId: data.userId,
      expires_at: data.expires_at,
      created_at: data.created_at,
      role: roleDomainToPrisma[data.role],
    };
  }

  static toDomain(raw: RefreshToken): RefreshTokenData {
    return {
      id: raw.id,
      hashed_token: raw.hashed_token,
      userId: raw.userId,
      expires_at: raw.expires_at,
      created_at: raw.created_at,
      role: rolePrismaToDomain[raw.role],
    };
  }
}
