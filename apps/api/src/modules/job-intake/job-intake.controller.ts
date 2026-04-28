import type {
  JobAnalysisListQuery,
  JobDescriptionInput,
} from '@hireboost/shared';
import type { Request, Response } from 'express';

import { ApiError } from '../../utils/api-error.js';
import { created, noContent, ok } from '../../utils/api-response.js';
import {
  analyzeJobDescription,
  getJobAnalysis,
  listJobAnalyses,
  removeJobAnalysis,
} from './job-analysis.service.js';

function userIdFrom(req: Request): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.sub;
}

/* -------------------------------------------------------------------------- */
/*                                  Analyze                                   */
/* -------------------------------------------------------------------------- */

export async function analyze(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const { jobDescription } = req.body as JobDescriptionInput;

  const analysis = await analyzeJobDescription({ userId, jobDescription });
  return created(res, analysis, 'Job description analyzed');
}

/* -------------------------------------------------------------------------- */
/*                                    Get                                     */
/* -------------------------------------------------------------------------- */

export async function getById(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const id = req.params.id ?? '';

  const analysis = await getJobAnalysis(userId, id);
  return ok(res, analysis);
}

/* -------------------------------------------------------------------------- */
/*                                    List                                    */
/* -------------------------------------------------------------------------- */

export async function list(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const { limit } = req.query as unknown as JobAnalysisListQuery;

  const items = await listJobAnalyses(userId, limit);
  return ok(res, items);
}

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export async function remove(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const id = req.params.id ?? '';

  await removeJobAnalysis(userId, id);
  return noContent(res);
}
