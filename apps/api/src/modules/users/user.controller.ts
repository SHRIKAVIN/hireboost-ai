import type { UpdateCurrentUserInput } from '@hireboost/shared';
import type { Request, Response } from 'express';

import { ApiError } from '../../utils/api-error.js';
import { ok } from '../../utils/api-response.js';
import { updateUserById } from './user.service.js';

export async function patchMe(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw ApiError.unauthorized();
  const body = req.body as UpdateCurrentUserInput;
  const user = await updateUserById(req.auth.sub, body);
  if (!user) throw ApiError.notFound('User not found');
  return ok(res, user.toPublic());
}
