import { PasswordReset } from '@prisma/client';
import { PasswordResetData } from 'src/modules/auth/domain/repositories/password-reset.repositorie';

export class PrismaPasswordResetMapper {
  static toPrisma(data: Omit<PasswordResetData, 'id'>) {
    return {
      hashed_token: data.hashed_token,
      user_id: data.user_id,
      expires_at: data.expires_at,
    };
  }

  static toDomain(raw: PasswordReset): PasswordResetData {
    return {
      id: raw.id,
      hashed_token: raw.hashed_token,
      user_id: raw.user_id,
      expires_at: raw.expires_at,
    };
  }
}
