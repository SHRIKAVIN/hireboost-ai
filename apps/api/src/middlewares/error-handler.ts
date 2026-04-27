import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

import { isProd } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import { fail } from '../utils/api-response.js';

/**
 * Central error handler. Every error in the app eventually lands here
 * via `next(err)` and is converted into the canonical `ApiResponse` envelope.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Normalize known error types into ApiError
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = ApiError.unprocessable('Validation failed', err.flatten().fieldErrors);
  } else if (err instanceof mongoose.Error.ValidationError) {
    apiError = ApiError.unprocessable('Validation failed', err.errors);
  } else if (err instanceof mongoose.Error.CastError) {
    apiError = ApiError.badRequest(`Invalid ${err.path}: ${String(err.value)}`);
  } else if (isMongoDuplicateKey(err)) {
    apiError = ApiError.conflict('Duplicate value', err.keyValue);
  } else {
    apiError = ApiError.internal(err instanceof Error ? err.message : 'Unexpected error');
  }

  const log = req.log ?? console;
  if (apiError.statusCode >= 500) {
    log.error?.({ err, code: apiError.code }, 'request failed');
  } else {
    log.warn?.({ code: apiError.code, status: apiError.statusCode }, 'request rejected');
  }

  const exposedMessage = apiError.expose
    ? apiError.message
    : isProd
      ? 'Something went wrong on our side.'
      : apiError.message;

  fail(res, {
    statusCode: apiError.statusCode,
    code: apiError.code,
    message: exposedMessage,
    details: apiError.details,
  });
};

function isMongoDuplicateKey(err: unknown): err is { code: 11000; keyValue: Record<string, unknown> } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  );
}
