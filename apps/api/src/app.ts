import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { httpLogger } from './config/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { defaultRateLimiter } from './middlewares/rate-limit.js';
import { requestId } from './middlewares/request-id.js';
import { buildApiRouter } from './routes/index.js';
import { ApiError } from './utils/api-error.js';

/**
 * Express application factory. Returns an app that has every layer
 * wired but is *not* listening — `server.ts` is responsible for that.
 * This keeps the app trivially testable and embeddable.
 */
export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop (ALB / CloudFront) for correct req.ip
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ───────────── Observability ─────────────
  app.use(requestId);
  app.use(httpLogger);

  // ───────────── Security ─────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // curl/health checks/server-to-server
        if (env.CORS_ORIGINS.includes(origin) || env.CORS_ORIGINS.includes('*')) {
          return cb(null, true);
        }
        return cb(ApiError.forbidden(`Origin not allowed: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 600,
    }),
  );

  // ───────────── Parsing & compression ─────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(compression());

  // ───────────── Rate limiting on /api/* ─────────────
  app.use(env.API_PREFIX, defaultRateLimiter);

  // ───────────── Versioned routes ─────────────
  app.use(env.API_PREFIX, buildApiRouter());

  // Convenience: friendly root response describing the API.
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        service: '@hireboost/api',
        message: 'HireBoost AI API. See API_PREFIX for routes.',
        apiPrefix: env.API_PREFIX,
        health: `${env.API_PREFIX}/health`,
      },
    });
  });

  // ───────────── 404 + error handler (must be last) ─────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
