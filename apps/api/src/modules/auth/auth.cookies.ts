import type { CookieOptions, Response } from 'express';

import { env } from '../../config/env.js';
import { expiresInToSeconds } from '../../utils/jwt.js';

export const REFRESH_COOKIE_NAME = 'hb_rt';

function refreshCookieOptions(): CookieOptions {
  const maxAgeMs = expiresInToSeconds(env.JWT_REFRESH_EXPIRES_IN) * 1000;
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
}
