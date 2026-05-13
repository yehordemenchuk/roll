import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchUserProfileByEmail } from '../api';
import { jwtSubject } from '../jwt';
import { tokenStore } from '../tokenStore';
import { registerAuthWallOpener } from './authWall';
import { loginRequest, logoutRequest } from './authApi';
import { t } from '../i18n/sk';

type AuthContextValue = {
  email: string | null;
  username: string | null;
  authWall: boolean;
  resolveAuthWall: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshIdentity: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readEmailFromStorage(): string | null {
  const access = tokenStore.getAccess();
  if (!access) return null;
  return jwtSubject(access);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(readEmailFromStorage);
  const [username, setUsername] = useState<string | null>(() => tokenStore.getUsername());
  const [authWall, setAuthWall] = useState(false);

  const syncProfile = useCallback(async () => {
    const em = readEmailFromStorage();
    setEmail(em);
    if (!em || !tokenStore.getAccess()) {
      setUsername(null);
      return;
    }
    try {
      const profile = await fetchUserProfileByEmail(em);
      tokenStore.setUsername(profile.username);
      setUsername(profile.username);
    } catch {
      setUsername(tokenStore.getUsername());
    }
  }, []);

  const refreshIdentity = useCallback(async () => {
    await syncProfile();
  }, [syncProfile]);

  useEffect(() => {
    registerAuthWallOpener(() => setAuthWall(true));
  }, []);

  useEffect(() => {
    if (tokenStore.hasSession()) {
      void syncProfile();
    }
  }, [syncProfile]);

  const resolveAuthWall = useCallback(() => {
    setAuthWall(false);
    void syncProfile();
  }, [syncProfile]);

  const login = useCallback(async (loginEmail: string, password: string) => {
    const tokens = await loginRequest(loginEmail, password);
    const sub = jwtSubject(tokens.accessToken);
    if (!sub) {
      throw new Error(t('auth.missingTokens'));
    }
    tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
    setAuthWall(false);
    setEmail(sub);
    try {
      const profile = await fetchUserProfileByEmail(sub);
      tokenStore.setUsername(profile.username);
      setUsername(profile.username);
    } catch (err) {
      tokenStore.clear();
      setEmail(null);
      setUsername(null);
      throw err instanceof Error ? err : new Error(t('login.failed'));
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      try {
        await logoutRequest(refresh);
      } catch {
        /* ignore */
      }
    }
    tokenStore.clear();
    setEmail(null);
    setUsername(null);
    setAuthWall(false);
  }, []);

  const value = useMemo(
    () => ({
      email,
      username,
      authWall,
      resolveAuthWall,
      login,
      logout,
      refreshIdentity,
    }),
    [email, username, authWall, resolveAuthWall, login, logout, refreshIdentity],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
