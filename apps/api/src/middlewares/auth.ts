import type { UserRole } from '@hireboost/shared';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/api-error.js';
import { verifyAccessToken, type AccessTokenClaims } from '../utils/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    /** Decoded access-token claims, present after `requireAuth`. */
    auth?: AccessTokenClaims;
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.header('authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

/** Reject the request unless a valid access token is present. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    return next(ApiError.unauthorized('Missing access token'));
  }
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/** Attach claims if a valid token is present, but never reject. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) return next();
  try {
    req.auth = verifyAccessToken(token);
  } catch {
    // ignore — optional
  }
  next();
}

/**
 * Use AFTER `requireAuth`. Reject when the authenticated user's role isn't in
 * the provided allowlist.
 */
export function requireRole(...roles: UserRole[]) {
  return function roleGuard(req: Request, _res: Response, next: NextFunction): void {
    const claim = req.auth?.role as UserRole | undefined;
    if (!claim) return next(ApiError.unauthorized('Authentication required'));
    if (!roles.includes(claim)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}
