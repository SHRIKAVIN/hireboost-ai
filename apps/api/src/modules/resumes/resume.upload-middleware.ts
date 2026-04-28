import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import {
  MAX_RESUME_FILE_SIZE_BYTES,
  SUPPORTED_RESUME_EXTENSIONS,
  SUPPORTED_RESUME_MIME_TYPES,
} from '@hireboost/shared';
import type { Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';

import { env } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';

/**
 * Resolve the absolute upload directory once and ensure it exists. We
 * keep uploads on local disk during development; Phase 12 will swap
 * this for S3-compatible storage behind the same service interface.
 */
const UPLOAD_ROOT = path.isAbsolute(env.UPLOAD_DIR)
  ? env.UPLOAD_DIR
  : path.resolve(process.cwd(), env.UPLOAD_DIR);

const RESUME_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'resumes');

if (!existsSync(RESUME_UPLOAD_DIR)) {
  mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });
}

export function getResumeStorageRoot(): string {
  return RESUME_UPLOAD_DIR;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RESUME_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // We intentionally don't include the user id in the filename — the
    // mongo doc is the source of truth for ownership, and the file path
    // is never exposed to the client.
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  const ext = path.extname(file.originalname).toLowerCase();

  const validExt = (SUPPORTED_RESUME_EXTENSIONS as readonly string[]).includes(ext);
  const validMime = (SUPPORTED_RESUME_MIME_TYPES as readonly string[]).includes(file.mimetype);

  if (!validExt || !validMime) {
    return cb(
      ApiError.badRequest(
        `Unsupported file type. Please upload a PDF or DOCX (got ${
          file.mimetype || 'unknown'
        }).`,
      ),
    );
  }
  cb(null, true);
}

/**
 * Single-file upload middleware. Field name is `file`. Multer rejects
 * anything past `MAX_RESUME_FILE_SIZE_BYTES` with `LIMIT_FILE_SIZE`,
 * which the resume route translates to a friendly 413.
 */
export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
}).single('file');
