import { API_BASE_URL } from '../api/config';
import { getErrorMessageFromResponse } from '../api/parseApiError';
import { t } from '../i18n/sk';
import { hashPasswordForLogin, hashPasswordForRegister } from './passwordWire';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  plainPassword: string;
  userRole?: string;
};

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
};

/** Unauthenticated — raw fetch only (no apiRequest / Bearer). */
export async function loginRequest(email: string, plainPassword: string): Promise<AuthTokens> {
  const password = await hashPasswordForLogin(plainPassword);
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(getErrorMessageFromResponse(body, res.status));
  }
  const data = (await res.json()) as LoginResponse;
  const accessToken = data.accessToken ?? data.access_token;
  const refreshToken = data.refreshToken ?? data.refresh_token;
  if (!accessToken || !refreshToken) {
    throw new Error(t('auth.missingTokens'));
  }
  return { accessToken, refreshToken };
}

export async function registerRequest(input: RegisterInput) {
  const { username, email, plainPassword, userRole = 'ROLE_USER' } = input;
  const password = await hashPasswordForRegister(plainPassword);
  const res = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, userRole }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(getErrorMessageFromResponse(body, res.status));
  }
  return (await res.json()) as { id: number; username: string; email: string };
}

export async function logoutRequest(refreshToken: string) {
  if (!refreshToken) return;
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(getErrorMessageFromResponse(body, res.status));
  }
}
