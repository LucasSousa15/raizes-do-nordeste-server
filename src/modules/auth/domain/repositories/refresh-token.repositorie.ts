import { UserRole } from "src/modules/accounts/domain/@types/users";

export interface RefreshTokenData {
  id: string;
  hashed_token: string;
  userId: string;
  expires_at: Date;
  created_at?: Date;
  role: UserRole;
}

export abstract class RefreshTokenRepository {
  abstract create(data: RefreshTokenData): Promise<void>;
  abstract findById(id: string): Promise<RefreshTokenData | null>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
