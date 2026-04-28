import { MAX_RESUME_FILE_SIZE_MB, resumeListQuerySchema } from '@hireboost/shared';
import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';

import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { ApiError } from '../../utils/api-error.js';
import {
  downloadOriginal,
  getById,
  list,
  remove,
  upload as uploadController,
} from './resume.controller.js';
import { resumeUpload } from './resume.upload-middleware.js';

const router = Router();

// All resume routes are user-scoped — auth required up front.
router.use(requireAuth);

/**
 * Wrap the multer middleware so MulterErrors (file too large, wrong field)
 * surface as our standard ApiError envelope instead of crashing the
 * generic error handler with a vague 500.
 */
function uploadMiddleware(req: Request, res: Response, next: NextFunction): void {
  resumeUpload(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApiError({
            statusCode: 413,
            code: 'PAYLOAD_TOO_LARGE',
            message: `Resume file is too large. Max size is ${MAX_RESUME_FILE_SIZE_MB} MB.`,
          }),
        );
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(ApiError.badRequest('Unexpected file field. Use form-field name "file".'));
      }
      return next(ApiError.badRequest(`Upload error: ${err.message}`));
    }
    next(err);
  });
}

router.post('/upload', uploadMiddleware, asyncHandler(uploadController));
router.get('/', validate(resumeListQuerySchema, 'query'), asyncHandler(list));
router.get('/:id', asyncHandler(getById));
router.get('/:id/file', asyncHandler(downloadOriginal));
router.delete('/:id', asyncHandler(remove));

export default router;
