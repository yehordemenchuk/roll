const ACCESS = 'cube_roll_access';
const REFRESH = 'cube_roll_refresh';
const USERNAME = 'cube_roll_username';

export const tokenStore = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH);
  },
  getUsername(): string | null {
    return localStorage.getItem(USERNAME);
  },
  hasSession(): boolean {
    return Boolean(this.getAccess() || this.getRefresh());
  },
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS, accessToken);
    localStorage.setItem(REFRESH, refreshToken);
  },
  setUsername(username: string) {
    localStorage.setItem(USERNAME, username);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USERNAME);
  },
};
