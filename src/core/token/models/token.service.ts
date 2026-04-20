
//TODO: Mover essas tipagens pro arquivo de tipos globais ou para o módulo especifico de usuários.
type UserRole = "USER" | "ADMIN" | "STAFF";
type UserProfile = "KITCHEN" | "WAITER" | "CASHIER";

export interface JwtPayload {
  sub: string;
  email: string;
  tokenId: string;
  role: UserRole;
  profile?: UserProfile
  verifiedEmail: boolean;
}

export abstract class TokenService {
  abstract signAccessToken(payload: JwtPayload): Promise<string>;
  abstract signRefreshToken(payload: JwtPayload): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<JwtPayload>;
  abstract verifyRefreshToken(token: string): Promise<JwtPayload>;
}
