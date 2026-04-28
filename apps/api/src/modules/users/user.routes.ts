import { updateCurrentUserSchema } from '@hireboost/shared';
import { Router } from 'express';

import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './user.controller.js';

const router = Router();

router.use(requireAuth);
router.patch('/me', validate(updateCurrentUserSchema), asyncHandler(controller.patchMe));

export default router;
