/**
 * Domain error class. Throwing one of these from any controller / service
 * is the canonical way to surface a friendly, structured error to the client.
 *
 * The central error handler middleware converts these into the
 * `ApiResponse<never>` envelope defined in `@hireboost/shared`.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly expose: boolean;

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
    /** When false, the message is replaced with a generic 5xx message in production. */
    expose?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
    this.expose = params.expose ?? params.statusCode < 500;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message, details });
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message });
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError({ statusCode: 403, code: 'FORBIDDEN', message });
  }
  static notFound(message = 'Resource not found') {
    return new ApiError({ statusCode: 404, code: 'NOT_FOUND', message });
  }
  static conflict(message = 'Conflict', details?: unknown) {
    return new ApiError({ statusCode: 409, code: 'CONFLICT', message, details });
  }
  static unprocessable(message = 'Unprocessable entity', details?: unknown) {
    return new ApiError({ statusCode: 422, code: 'UNPROCESSABLE_ENTITY', message, details });
  }
  static tooManyRequests(message = 'Too many requests', details?: unknown) {
    return new ApiError({ statusCode: 429, code: 'RATE_LIMITED', message, details });
  }
  static internal(message = 'Internal server error', details?: unknown) {
    return new ApiError({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message,
      details,
      expose: false,
    });
  }
  static serviceUnavailable(message = 'Service unavailable') {
    return new ApiError({ statusCode: 503, code: 'SERVICE_UNAVAILABLE', message, expose: false });
  }
}
