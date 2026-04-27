import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

const HEADER = 'x-request-id';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
  }
}

/**
 * Reads `X-Request-Id` from the inbound request (or generates a UUID),
 * exposes it on `req.id` so the HTTP logger picks up the same value, and
 * echoes it on the response so clients can correlate logs end-to-end.
 *
 * Must be installed BEFORE `httpLogger`.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(HEADER);
  const id = incoming && incoming.length <= 128 ? incoming : randomUUID();
  req.id = id;
  res.setHeader(HEADER, id);
  next();
}
