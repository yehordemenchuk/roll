/**
 * Same convention as tap-tile: base URL already includes `/api/v1`.
 * Paths are then `/auth/login`, `/scores/...`, etc. (no second `/api/v1`).
 */
function normalizeApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) {
    return '/api/v1';
  }
  const cleaned = raw.replace(/\/+$/, '');
  if (cleaned.endsWith('/api/v1')) {
    return cleaned;
  }
  if (/^https?:\/\//i.test(cleaned) && !cleaned.includes('/api/')) {
    return `${cleaned}/api/v1`;
  }
  return cleaned;
}

export const API_BASE_URL = normalizeApiBase();
