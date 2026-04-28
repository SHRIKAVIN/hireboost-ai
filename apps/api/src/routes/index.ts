import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import jobIntakeRoutes from '../modules/job-intake/job-intake.routes.js';

/**
 * Versioned API root. Every feature module mounts under here.
 *
 * Phase 3:  /health      (live)
 * Phase 4:  /auth        (live)
 * Phase 5:  /job-intake  (live)
 * Phase 6:  /resumes
 * Phase 7:  /ats
 * Phase 8:  /ai
 * Phase 9:  /diff
 * Phase 11: /matcher /notifications
 */
export function buildApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/job-intake', jobIntakeRoutes);

  return router;
}
