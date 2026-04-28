import {
  jobAnalysisListQuerySchema,
  jobDescriptionSchema,
} from '@hireboost/shared';
import { Router } from 'express';

import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { analyze, getById, list, remove } from './job-intake.controller.js';

const router = Router();

// Every endpoint here is user-scoped — auth required up-front.
router.use(requireAuth);

router.post('/', validate(jobDescriptionSchema), asyncHandler(analyze));
router.get('/', validate(jobAnalysisListQuerySchema, 'query'), asyncHandler(list));
router.get('/:id', asyncHandler(getById));
router.delete('/:id', asyncHandler(remove));

export default router;
