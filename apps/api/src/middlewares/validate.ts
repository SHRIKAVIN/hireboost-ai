import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodTypeAny, z } from 'zod';

import { ApiError } from '../utils/api-error.js';

type Source = 'body' | 'query' | 'params';

function flattenZod(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join('.'),
    code: i.code,
    message: i.message,
  }));
}

/**
 * Build a middleware that validates `req[source]` against a Zod schema and
 * replaces it with the parsed (typed + transformed) value.
 */
export function validate<S extends ZodTypeAny>(schema: S, source: Source = 'body') {
  return function validator(req: Request, _res: Response, next: NextFunction): void {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        ApiError.unprocessable('Validation failed', { issues: flattenZod(result.error) }),
      );
    }
    // Replace with the parsed value so downstream handlers get the typed shape.
    (req as unknown as Record<Source, z.infer<S>>)[source] = result.data;
    next();
  };
}
