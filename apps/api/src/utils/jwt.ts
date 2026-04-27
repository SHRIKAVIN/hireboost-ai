import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import { ApiError } from './api-error.js';

/* -------------------------------------------------------------------------- */
/*                                 Token types                                */
/* -------------------------------------------------------------------------- */

export type TokenType = 'access' | 'refresh';

export interface AccessTokenClaims extends JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenClaims extends JwtPayload {
  sub: string;
  type: 'refresh';
  /** Token version — bumped to invalidate all refresh tokens for a user. */
  tv?: number;
}

const baseSignOptions: SignOptions = {
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
};

/* -------------------------------------------------------------------------- */
/*                                  Sign                                      */
/* -------------------------------------------------------------------------- */

export function signAccessToken(payload: { sub: string; email: string; role: string }): string {
  const claims: Omit<AccessTokenClaims, keyof JwtPayload> = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    type: 'access',
  };
  return jwt.sign(claims, env.JWT_SECRET, {
    ...baseSignOptions,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: { sub: string; tv?: number }): string {
  const claims: Omit<RefreshTokenClaims, keyof JwtPayload> = {
    sub: payload.sub,
    type: 'refresh',
    tv: payload.tv ?? 0,
  };
  return jwt.sign(claims, env.JWT_REFRESH_SECRET, {
    ...baseSignOptions,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/* -------------------------------------------------------------------------- */
/*                                  Verify                                    */
/* -------------------------------------------------------------------------- */

export function verifyAccessToken(token: string): AccessTokenClaims {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as AccessTokenClaims;
    if (decoded.type !== 'access') {
      throw ApiError.unauthorized('Invalid access token');
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as RefreshTokenClaims;
    if (decoded.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Refresh token expired');
    }
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

/** Best-effort conversion of `15m | 7d | 3600` style strings to seconds. */
export function expiresInToSeconds(value: string): number {
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(\d+)\s*([smhdw])$/i);
  if (!m || !m[1] || !m[2]) return 900;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return n * (map[unit] ?? 60);
}
