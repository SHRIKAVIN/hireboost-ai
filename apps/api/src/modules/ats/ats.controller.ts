import type { AtsAnalyzeInput } from '@hireboost/shared';
import type { Request, Response } from 'express';

import { ApiError } from '../../utils/api-error.js';
import { ok } from '../../utils/api-response.js';
import { analyzeAtsForUser } from './ats.service.js';

function userIdFrom(req: Request): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.sub;
}

export async function analyze(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const body = req.body as AtsAnalyzeInput;

  const analysis = await analyzeAtsForUser({
    userId,
    jobAnalysisId: body.jobAnalysisId,
    ...(body.resumeId && { resumeId: body.resumeId }),
  });

  return ok(res, analysis, 'ATS analysis complete');
}
