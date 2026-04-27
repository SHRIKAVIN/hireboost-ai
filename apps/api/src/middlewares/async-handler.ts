import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler<P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown> | unknown;

/**
 * Wraps async controllers so any thrown error or rejected promise
 * is forwarded to Express's `next()` (and therefore to the central
 * error handler). Lets controllers stay clean of try/catch boilerplate.
 */
export function asyncHandler<P, ResBody, ReqBody, ReqQuery>(
  fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
