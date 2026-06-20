
import { UserProfile, UserRole } from 'src/modules/accounts/domain/@types/users';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateRefreshTokenRequest {
  userId: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
  verifiedEmail: boolean;
}

export interface CreateRefreshTokenResponse {
  refreshToken: string;
}

export interface CreatePasswordResetRequest {
  email: string;
}

export interface CreatePasswordResetResponse {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
