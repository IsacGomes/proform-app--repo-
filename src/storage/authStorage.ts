import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthUser } from '../types/Auth';

const AUTH_STORAGE_KEY = '@auth_session';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null;

  const user: AuthUser = {
    id: sanitizeString(value.id),
    name: sanitizeString(value.name),
    email: sanitizeString(value.email),
    role: sanitizeString(value.role),
  };

  if (!user.id || !user.name || !user.email) {
    return null;
  }

  return user;
}

function sanitizeSession(value: unknown): AuthSession | null {
  if (!isRecord(value)) return null;

  const token = sanitizeString(value.token);
  const issuedAt = sanitizeString(value.issuedAt);
  const expiresAt = sanitizeString(value.expiresAt);
  const user = sanitizeUser(value.user);

  if (!token || !issuedAt || !expiresAt || !user) {
    return null;
  }

  return {
    token,
    issuedAt,
    expiresAt,
    user,
  };
}

export async function getStoredSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    const session = sanitizeSession(parsed);

    if (!session) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch (error) {
    console.log('Erro ao buscar sessao:', error);
    return null;
  }
}

export async function storeSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}
