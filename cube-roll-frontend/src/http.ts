import { API_BASE_URL } from './api/config';
import { getErrorMessageFromResponse } from './api/parseApiError';
import { tokenStore } from './tokenStore';
import { triggerAuthWall } from './auth/authWall';

function isAuthRefreshPath(path: string) {
  return path.includes('/auth/refresh');
}

let refreshPromise: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
      access_token?: string;
      refresh_token?: string;
    };
    const accessToken = data.accessToken ?? data.access_token;
    const refreshToken = data.refreshToken ?? data.refresh_token ?? refresh;
    if (!accessToken) return false;
    tokenStore.setTokens(accessToken, refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const skipRefresh = isAuthRefreshPath(path);

  const send = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string>),
    };
    if (!headers['Content-Type'] && init?.body && typeof init.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const access = tokenStore.getAccess();
    if (access) {
      headers.Authorization = `Bearer ${access}`;
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  };

  let response = await send();
  let didRefresh = false;

  while (
    (response.status === 401 || response.status === 403) &&
    !skipRefresh &&
    tokenStore.getRefresh() &&
    !didRefresh
  ) {
    didRefresh = true;
    const ok = await refreshOnce();
    if (!ok) {
      tokenStore.clear();
      triggerAuthWall();
      const payload = await response.text().catch(() => '');
      throw new Error(getErrorMessageFromResponse(payload, response.status));
    }
    response = await send();
  }

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(getErrorMessageFromResponse(payload, response.status));
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined as T;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return undefined as T;
  }
}
