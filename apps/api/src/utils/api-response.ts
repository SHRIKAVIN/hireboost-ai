import type { ApiSuccess, ApiError as ApiErrorEnvelope } from '@hireboost/shared';
import type { Response } from 'express';

/**
 * Send a successful response in the canonical envelope used across
 * the entire API surface (matches `ApiResponse<T>` in @hireboost/shared).
 */
export function ok<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
  const body: ApiSuccess<T> = { success: true, data, ...(message && { message }) };
  return res.status(statusCode).json(body);
}

export function created<T>(res: Response, data: T, message?: string): Response {
  return ok(res, data, message, 201);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Send a structured error envelope. Usually you should `throw new ApiError(...)`
 * from the controller and let the central error handler call this — but it's
 * exported for special cases.
 */
export function fail(
  res: Response,
  error: { statusCode: number; code: string; message: string; details?: unknown },
): Response {
  const body: ApiErrorEnvelope = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    },
  };
  return res.status(error.statusCode).json(body);
}
