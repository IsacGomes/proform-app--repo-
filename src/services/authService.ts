import type { AuthSession, SignInPayload } from '../types/Auth';

const SESSION_DURATION_HOURS = 12;

const MOCK_USER = {
  id: 'user-1',
  name: 'Operador ProForm',
  email: 'operador@proform.app',
  role: 'Operador',
};

function createToken(): string {
  const random = Math.random().toString(36).slice(2);
  return `pf_${Date.now()}_${random}`;
}

export function isSessionValid(session: AuthSession): boolean {
  const expiresAt = Date.parse(session.expiresAt);
  if (Number.isNaN(expiresAt)) return false;
  return expiresAt > Date.now();
}

export async function signIn(payload: SignInPayload): Promise<AuthSession> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();

  if (email !== MOCK_USER.email || password !== '123456') {
    throw new Error('Credenciais invalidas. Use operador@proform.app / 123456');
  }

  const issuedAtDate = new Date();
  const expiresAtDate = new Date(issuedAtDate.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  return {
    token: createToken(),
    issuedAt: issuedAtDate.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    user: MOCK_USER,
  };
}
