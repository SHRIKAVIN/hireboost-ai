import type { Request, Response, NextFunction } from 'express';

import { ApiError } from '../utils/api-error.js';

/**
 * Catch-all for unmatched routes. Forwards a 404 ApiError to the
 * central error handler so the JSON envelope is consistent.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
