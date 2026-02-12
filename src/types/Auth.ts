export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  issuedAt: string;
  expiresAt: string;
  user: AuthUser;
}

export interface SignInPayload {
  email: string;
  password: string;
}
