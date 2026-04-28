import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Resume, ResumeListItem } from '@hireboost/shared';

import { logger } from '../../config/logger.js';
import { ApiError } from '../../utils/api-error.js';
import {
  findJobAnalysisById,
  setJobAnalysisResumeId,
} from '../job-intake/job-analysis.repository.js';
import type { ResumeDocument } from './resume.model.js';
import { parseResume } from './resume.parser.js';
import {
  createResume,
  deleteResume,
  findResumeById,
  listResumesForUser,
} from './resume.repository.js';
import { extractText } from './resume.text-extractor.js';

/* -------------------------------------------------------------------------- */
/*                                  Upload                                    */
/* -------------------------------------------------------------------------- */

export interface UploadResumeInput {
  userId: string;
  filePath: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  /** When set, must belong to `userId`; links the new resume on the analysis doc. */
  jobAnalysisId?: string;
}

/**
 * Read the just-uploaded resume from disk, extract text, run the
 * deterministic parser, and persist the resulting document.
 *
 * On any failure we attempt to clean up the on-disk file so we don't
 * leak storage. The DB is the source of truth for "this resume exists".
 */
export async function ingestResume(input: UploadResumeInput): Promise<Resume> {
  if (input.jobAnalysisId) {
    const analysis = await findJobAnalysisById(input.userId, input.jobAnalysisId);
    if (!analysis) {
      throw ApiError.badRequest('Job analysis not found or does not belong to you');
    }
  }

  let buffer: Buffer;
  try {
    buffer = await fs.readFile(input.filePath);
  } catch (err) {
    throw ApiError.internal(
      `Could not read uploaded file: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }

  try {
    const extracted = await extractText(buffer, input.mimeType);

    if (!extracted.text || extracted.text.trim().length < 30) {
      throw ApiError.badRequest(
        'We couldn\'t extract any text from this file. ' +
          'Make sure the resume is text-based (not a scanned image PDF).',
      );
    }

    const parsed = parseResume(extracted.text);

    const doc = await createResume({
      userId: input.userId,
      ...(input.jobAnalysisId && { jobAnalysisId: input.jobAnalysisId }),
      originalFileName: input.originalFileName,
      storagePath: input.filePath,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      rawText: extracted.text,
      parsedData: parsed,
    });

    if (input.jobAnalysisId) {
      const linked = await setJobAnalysisResumeId(input.userId, input.jobAnalysisId, doc._id);
      if (!linked) {
        logger.warn(
          { userId: input.userId, jobAnalysisId: input.jobAnalysisId },
          '[resumes] failed to attach resume id to job analysis',
        );
      }
    }

    return doc.toPublic();
  } catch (err) {
    // We failed somewhere after the file landed on disk — best-effort cleanup.
    void fs.unlink(input.filePath).catch((unlinkErr) => {
      logger.warn(
        { unlinkErr, filePath: input.filePath },
        '[resumes] failed to clean up upload after ingest error',
      );
    });
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Get                                     */
/* -------------------------------------------------------------------------- */

export async function getResume(userId: string, id: string): Promise<Resume> {
  const doc = await loadResume(userId, id);
  return doc.toPublic();
}

/* -------------------------------------------------------------------------- */
/*                                   List                                     */
/* -------------------------------------------------------------------------- */

export async function listResumes(userId: string, limit: number): Promise<ResumeListItem[]> {
  const docs = await listResumesForUser(userId, limit);
  return docs.map((d) => d.toListItem());
}

/* -------------------------------------------------------------------------- */
/*                                  Delete                                    */
/* -------------------------------------------------------------------------- */

export async function removeResume(userId: string, id: string): Promise<void> {
  const doc = await deleteResume(userId, id);
  if (!doc) throw ApiError.notFound('Resume not found');

  // Best-effort: clear the file on disk. Failure here is non-fatal —
  // we already deleted the DB record, which is the source of truth.
  if (doc.storagePath) {
    try {
      await fs.unlink(doc.storagePath);
    } catch (err) {
      logger.warn(
        { err: (err as Error).message, storagePath: doc.storagePath },
        '[resumes] file cleanup after delete failed',
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Original file                                 */
/* -------------------------------------------------------------------------- */

export interface OriginalFile {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

/**
 * Read the original uploaded file off disk for download. We only ever
 * serve a file when the requester owns it — `loadResume` guards that.
 */
export async function getResumeOriginalFile(
  userId: string,
  id: string,
): Promise<OriginalFile> {
  const doc = await loadResume(userId, id);
  try {
    const buffer = await fs.readFile(doc.storagePath);
    return {
      buffer,
      fileName: doc.originalFileName || path.basename(doc.storagePath),
      mimeType: doc.mimeType,
    };
  } catch {
    throw ApiError.notFound('Original file is no longer available');
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Internal                                   */
/* -------------------------------------------------------------------------- */

async function loadResume(userId: string, id: string): Promise<ResumeDocument> {
  const doc = await findResumeById(userId, id);
  if (!doc) throw ApiError.notFound('Resume not found');
  return doc;
}
