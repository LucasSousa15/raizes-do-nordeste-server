export interface PasswordResetData {
  id: string;
  hashed_token: string;
  user_id: string;
  expires_at: Date;
}

export abstract class PasswordResetRepository {
  abstract create(
    data: Omit<PasswordResetData, 'id'>,
  ): Promise<PasswordResetData>;
  abstract findByHashedToken(
    hashed_token: string,
  ): Promise<PasswordResetData | null>;
  abstract delete(id: string): Promise<void>;
}
