import type { Server } from 'node:http';

import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env, isProd } from './config/env.js';
import { logger } from './config/logger.js';

async function bootstrap(): Promise<void> {
  // Best-effort DB connect. In dev we still boot the HTTP server so the
  // health endpoint, error handler, and CORS surface are always reachable.
  // In production we fail fast — the orchestrator will restart us.
  try {
    await connectDatabase();
  } catch (err) {
    if (isProd) {
      logger.fatal({ err }, '[boot] database connection failed in production, exiting');
      process.exit(1);
    }
    logger.warn(
      { err: (err as Error).message },
      '[boot] database connection failed, continuing without DB (dev mode)',
    );
  }

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        prefix: env.API_PREFIX,
        env: env.NODE_ENV,
      },
      `🚀 HireBoost API listening on http://localhost:${env.PORT}${env.API_PREFIX}`,
    );
  });

  server.on('error', (err) => {
    logger.fatal({ err }, '[boot] HTTP server error');
    process.exit(1);
  });

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals | 'uncaughtException'): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, '[shutdown] graceful shutdown starting');

    const forceExit = setTimeout(() => {
      logger.error('[shutdown] graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    await new Promise<void>((resolve) => server.close(() => resolve()));
    try {
      await disconnectDatabase();
    } catch (err) {
      logger.error({ err }, '[shutdown] error while disconnecting DB');
    }

    logger.info('[shutdown] complete');
    process.exit(0);
  };

  (['SIGINT', 'SIGTERM'] as const).forEach((signal) => {
    process.on(signal, () => {
      void shutdown(signal);
    });
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, '[process] uncaughtException');
    void shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, '[process] unhandledRejection');
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, '[boot] fatal startup error');
  process.exit(1);
});
