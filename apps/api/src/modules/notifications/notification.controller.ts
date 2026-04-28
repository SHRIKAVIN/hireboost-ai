import type { Request, Response } from 'express';

import { ApiError } from '../../utils/api-error.js';
import { ok } from '../../utils/api-response.js';
import * as notificationService from './notification.service.js';

export async function list(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw ApiError.unauthorized();
  const limit = req.query.limit as unknown as number;
  const items = await notificationService.listNotifications(req.auth.sub, limit);
  return ok(res, { items });
}

export async function markRead(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw ApiError.unauthorized();
  const id = req.params.id;
  if (!id) throw ApiError.badRequest('Missing notification id');
  const updated = await notificationService.markOneRead(req.auth.sub, id);
  if (!updated) throw ApiError.notFound('Notification not found');
  return ok(res, updated);
}

export async function markAllReadController(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw ApiError.unauthorized();
  const result = await notificationService.markAllRead(req.auth.sub);
  return ok(res, result);
}
