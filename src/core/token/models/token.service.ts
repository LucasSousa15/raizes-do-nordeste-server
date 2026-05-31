import { UserProfile, UserRole } from 'src/modules/accounts/@types/users';

export interface JwtPayload {
  sub: string;
  email: string;
  tokenId: string;
  role: UserRole;
  profile?: UserProfile;
  verifiedEmail: boolean;
}

export abstract class TokenService {
  abstract signAccessToken(payload: JwtPayload): Promise<string>;
  abstract signRefreshToken(payload: JwtPayload): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<JwtPayload>;
  abstract verifyRefreshToken(token: string): Promise<JwtPayload>;
  abstract getRefreshTokenExpiresAt(): Date;
}
