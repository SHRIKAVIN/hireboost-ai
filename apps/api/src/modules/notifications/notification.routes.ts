import { notificationListQuerySchema } from '@hireboost/shared';
import { Router } from 'express';

import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './notification.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(notificationListQuerySchema, 'query'), asyncHandler(controller.list));
router.post('/read-all', asyncHandler(controller.markAllReadController));
router.patch('/:id/read', asyncHandler(controller.markRead));

export default router;
