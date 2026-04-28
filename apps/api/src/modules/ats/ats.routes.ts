import { atsAnalyzeSchema } from '@hireboost/shared';
import { Router } from 'express';

import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { analyze } from './ats.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/analyze', validate(atsAnalyzeSchema), asyncHandler(analyze));

export default router;
