function base64UrlToJson(part: string) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return JSON.parse(atob(base64 + pad));
}

export function jwtSubject(token: string): string | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = base64UrlToJson(part);
    return typeof json.sub === 'string' ? json.sub : null;
  } catch {
    return null;
  }
}
