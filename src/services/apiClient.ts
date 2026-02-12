import { getStoredSession } from '../storage/authStorage';
import { CONTEXT_ID } from '../config/context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

type ApiOptions = RequestInit & {
  token?: string;
};

function createUrl(path: string): string {
  if (!API_BASE_URL) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const session = options.token ? null : await getStoredSession();
  const bearerToken = options.token ?? session?.token;

  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (bearerToken) {
    headers.set('Authorization', `Bearer ${bearerToken}`);
  }

  headers.set('X-App-Context', String(CONTEXT_ID));

  const { token: _unusedToken, ...requestOptions } = options;

  return fetch(createUrl(path), {
    ...requestOptions,
    headers,
  });
}
