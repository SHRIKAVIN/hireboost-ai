import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

let isConnected = false;

export async function connectDatabase(): Promise<typeof mongoose | null> {
  if (isConnected) return mongoose;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 8_000,
      maxPoolSize: 10,
    });
    isConnected = true;
    logger.info({ db: env.MONGODB_DB_NAME }, 'mongo: connected');

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'mongo: connection error');
    });
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('mongo: disconnected');
    });
    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('mongo: reconnected');
    });

    return mongoose;
  } catch (err) {
    logger.error({ err }, 'mongo: connection failed (continuing — /health will report disconnected)');
    return null;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('mongo: disconnected on shutdown');
}

export function getDbStatus(): {
  connected: boolean;
  state: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
} {
  // mongoose readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting, 99 uninitialized
  const map = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  } as const;
  const rs = mongoose.connection.readyState as keyof typeof map;
  return {
    connected: rs === 1,
    state: map[rs] ?? 'uninitialized',
  };
}
