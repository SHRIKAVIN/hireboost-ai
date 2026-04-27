import { loginSchema, registerSchema } from '@hireboost/shared';
import { Router } from 'express';

import { requireAuth } from '../../middlewares/auth.js';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authRateLimiter } from '../../middlewares/rate-limit.js';
import { validate } from '../../middlewares/validate.js';
import {
  googleCallback,
  googleStart,
  login,
  logout,
  me,
  refresh,
  register,
} from './auth.controller.js';

const router = Router();

/* ----------------------------- Local auth -------------------------------- */

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(register),
);

router.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(login));

router.post('/refresh', asyncHandler(refresh));

router.post('/logout', asyncHandler(logout));

router.get('/me', requireAuth, asyncHandler(me));

/* ----------------------------- Google OAuth ------------------------------ */

router.get('/google', asyncHandler(googleStart));
router.get('/google/callback', asyncHandler(googleCallback));

export default router;
