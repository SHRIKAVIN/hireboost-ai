import { randomUUID } from 'node:crypto';

import type { Request } from 'express';
import pino from 'pino';
import { pinoHttp } from 'pino-http';

import { env, isProd } from './env.js';

const transport = !isProd && env.LOG_PRETTY
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        singleLine: true,
        ignore: 'pid,hostname,reqId',
      },
    })
  : undefined;

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    base: { service: '@hireboost/api', env: env.NODE_ENV },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        '*.password',
        '*.passwordHash',
        '*.token',
        '*.refreshToken',
      ],
      remove: true,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

/** Express middleware that attaches a child logger + request id to every request. */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const fromMw = (req as { id?: string }).id;
    if (fromMw) return fromMw;
    const headerId = req.headers['x-request-id'];
    if (typeof headerId === 'string' && headerId) return headerId;
    if (Array.isArray(headerId) && headerId[0]) return headerId[0];
    return randomUUID();
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) =>
    `${(req as Request).method} ${(req as Request).originalUrl} → ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${(req as Request).method} ${(req as Request).originalUrl} → ${res.statusCode} (${err.message})`,
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
