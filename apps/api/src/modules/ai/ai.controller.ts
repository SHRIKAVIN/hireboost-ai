import type { ResumeEnhanceInput } from '@hireboost/shared';
import type { Request, Response } from 'express';

import { ApiError } from '../../utils/api-error.js';
import { ok } from '../../utils/api-response.js';
import { enhanceResumeForUser } from './ai.service.js';

function userIdFrom(req: Request): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.sub;
}

export async function enhanceResume(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const body = req.body as ResumeEnhanceInput;

  const result = await enhanceResumeForUser({
    userId,
    jobAnalysisId: body.jobAnalysisId,
    ...(body.resumeId && { resumeId: body.resumeId }),
  });

  return ok(res, result, 'Resume enhancement generated');
}
