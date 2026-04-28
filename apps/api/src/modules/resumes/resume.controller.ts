import { promises as fs } from 'node:fs';

import type { ResumeListQuery } from '@hireboost/shared';
import type { Request, Response } from 'express';

import { logger } from '../../config/logger.js';
import { ApiError } from '../../utils/api-error.js';
import { created, noContent, ok } from '../../utils/api-response.js';
import {
  getResume,
  getResumeOriginalFile,
  ingestResume,
  listResumes,
  removeResume,
} from './resume.service.js';

function userIdFrom(req: Request): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.sub;
}

/* -------------------------------------------------------------------------- */
/*                                  Upload                                    */
/* -------------------------------------------------------------------------- */

export async function upload(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);

  const file = req.file;
  if (!file) {
    throw ApiError.badRequest('No file uploaded. Send a multipart form with a "file" field.');
  }

  const jobAnalysisIdRaw = req.body?.jobAnalysisId;
  const jobAnalysisId =
    typeof jobAnalysisIdRaw === 'string' && /^[a-fA-F0-9]{24}$/.test(jobAnalysisIdRaw.trim())
      ? jobAnalysisIdRaw.trim()
      : undefined;

  try {
    const resume = await ingestResume({
      userId,
      filePath: file.path,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      ...(jobAnalysisId && { jobAnalysisId }),
    });
    return created(res, resume, 'Resume uploaded and parsed');
  } catch (err) {
    // ingestResume already best-efforts cleanup, but if we got here without
    // even reaching ingestResume (rare), still try to remove the leaked file.
    if (file.path) {
      void fs.unlink(file.path).catch((unlinkErr) => {
        logger.warn(
          { unlinkErr, filePath: file.path },
          '[resumes] controller failed to clean up upload',
        );
      });
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Get                                     */
/* -------------------------------------------------------------------------- */

export async function getById(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const id = req.params.id ?? '';

  const resume = await getResume(userId, id);
  return ok(res, resume);
}

/* -------------------------------------------------------------------------- */
/*                                    List                                    */
/* -------------------------------------------------------------------------- */

export async function list(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const { limit } = req.query as unknown as ResumeListQuery;

  const items = await listResumes(userId, limit);
  return ok(res, items);
}

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export async function remove(req: Request, res: Response): Promise<Response> {
  const userId = userIdFrom(req);
  const id = req.params.id ?? '';

  await removeResume(userId, id);
  return noContent(res);
}

/* -------------------------------------------------------------------------- */
/*                                Download                                    */
/* -------------------------------------------------------------------------- */

export async function downloadOriginal(req: Request, res: Response): Promise<void> {
  const userId = userIdFrom(req);
  const id = req.params.id ?? '';

  const file = await getResumeOriginalFile(userId, id);

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(file.fileName)}"`,
  );
  res.setHeader('Content-Length', String(file.buffer.byteLength));
  res.end(file.buffer);
}
