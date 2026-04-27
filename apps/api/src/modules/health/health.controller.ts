import type { Request, Response } from 'express';

import { env } from '../../config/env.js';
import { getDbStatus } from '../../config/db.js';
import { ok } from '../../utils/api-response.js';

/**
 * Public liveness + readiness probe.
 * Always returns 200 — the body reports detailed component status so
 * load balancers and uptime probes can choose what to consider healthy.
 */
export function getHealth(_req: Request, res: Response): Response {
  const memory = process.memoryUsage();
  const db = getDbStatus();

  return ok(res, {
    status: db.connected ? 'ok' : 'degraded',
    service: '@hireboost/api',
    env: env.NODE_ENV,
    version: process.env.npm_package_version ?? '0.1.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    components: {
      database: db,
    },
    runtime: {
      node: process.version,
      pid: process.pid,
      memoryMb: {
        rss: round(memory.rss / 1024 / 1024),
        heapUsed: round(memory.heapUsed / 1024 / 1024),
        heapTotal: round(memory.heapTotal / 1024 / 1024),
      },
    },
  });
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
