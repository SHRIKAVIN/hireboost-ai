import { Router } from 'express';

import { env } from '../config/env.js';
import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import aiRoutes from '../modules/ai/ai.routes.js';
import atsRoutes from '../modules/ats/ats.routes.js';
import jobIntakeRoutes from '../modules/job-intake/job-intake.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import resumeRoutes from '../modules/resumes/resume.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import { ok } from '../utils/api-response.js';

/**
 * Versioned API root. Every feature module mounts under here.
 *
 * Phase 3:  /health      (live)
 * Phase 4:  /auth        (live)
 * Phase 5:  /job-intake  (live)
 * Phase 6:  /resumes     (live)
 * Phase 7:  /ats         (live)
 * Phase 8:  /ai          (live)
 * Phase 9:  Resume diff (web-only)
 * Phase 11: /users /notifications
 */
export function buildApiRouter(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    return ok(res, {
      service: '@hireboost/api',
      message: 'HireBoost AI API',
      apiPrefix: env.API_PREFIX,
      health: `${env.API_PREFIX}/health`,
    });
  });

  router.use('/health', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);
  router.use('/job-intake', jobIntakeRoutes);
  router.use('/resumes', resumeRoutes);
  router.use('/ats', atsRoutes);
  router.use('/ai', aiRoutes);
  router.use('/notifications', notificationRoutes);

  return router;
}
