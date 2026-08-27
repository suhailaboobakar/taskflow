export interface AuthenticatedUser {
  email: string;
  id: string;
  name: string;
}

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface AuthResponse {
  tokens: TokenPair;
  user: AuthenticatedUser;
}

export interface AccessTokenPayload {
  email: string;
  name: string;
  sub: string;
}
