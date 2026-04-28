import { resumeEnhanceRequestSchema } from '@hireboost/shared';
import { Router } from 'express';

import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { aiRateLimiter } from '../../middlewares/rate-limit.js';
import { validate } from '../../middlewares/validate.js';
import { enhanceResume } from './ai.controller.js';

const router = Router();

router.use(requireAuth);
router.post(
  '/enhance-resume',
  aiRateLimiter,
  validate(resumeEnhanceRequestSchema),
  asyncHandler(enhanceResume),
);

export default router;
