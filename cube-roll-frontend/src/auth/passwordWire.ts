import bcrypt from 'bcryptjs';

async function sha256Hex(plain: string): Promise<string> {
  const data = new TextEncoder().encode(plain);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * DB stores: BCrypt(SHA-256(plain)). Spring matches when login `password` is SHA-256(plain) hex.
 */
export async function hashPasswordForRegister(plain: string): Promise<string> {
  const secret = await sha256Hex(plain);
  return bcrypt.hashSync(secret, 10);
}

/** Login JSON field `password` — SHA-256 hex of plain (not raw password). */
export async function hashPasswordForLogin(plain: string): Promise<string> {
  return sha256Hex(plain);
}
