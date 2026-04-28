import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

/**
 * Default rate limiter applied to the entire API surface.
 * Stricter limiters (auth, AI) will be created later by composing this.
 */
export const defaultRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please slow down and try again shortly.',
    },
  },
});

/** Stricter limiter for auth endpoints. Wired up in Phase 4. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
});

/** Stricter limiter for AI endpoints (Phase 8). */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many AI requests this hour. Please try again later.',
    },
  },
});
