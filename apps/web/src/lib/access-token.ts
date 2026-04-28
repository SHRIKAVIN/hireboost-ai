/** Seconds before JWT exp to treat the access token as stale and renew via /auth/refresh. */
const EXPIRY_SKEW_SEC = 60;

function decodeJwtPayload(token: string): { exp?: unknown } | null {
  try {
    const parts = token.split('.');
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as { exp?: unknown };
  } catch {
    return null;
  }
}

/**
 * True when we should call POST /auth/refresh (refresh cookie) before trusting the session.
 * A persisted access token can be expired while `isAuthenticated` is still true — without this,
 * the guard skips refresh and the next API 401 may clear the session if the cookie is missing.
 */
export function needsSilentRefresh(accessToken: string | null): boolean {
  if (!accessToken) return true;
  const payload = decodeJwtPayload(accessToken);
  const exp = typeof payload?.exp === 'number' ? payload.exp : null;
  if (exp == null) return true;
  return exp < Math.floor(Date.now() / 1000) + EXPIRY_SKEW_SEC;
}
