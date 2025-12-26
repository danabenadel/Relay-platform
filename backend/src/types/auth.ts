export interface CreateUserData {
  email: string;
  password?: string;
  name?: string;
  newsletter?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface OAuthTokenData {
  userId: string;
  serviceName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope: string[];
  email?: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
  };
}

export interface UserWithTokens {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  oauthTokens: OAuthTokenData[];
}