import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import jobIntakeRoutes from '../modules/job-intake/job-intake.routes.js';
import resumeRoutes from '../modules/resumes/resume.routes.js';

/**
 * Versioned API root. Every feature module mounts under here.
 *
 * Phase 3:  /health      (live)
 * Phase 4:  /auth        (live)
 * Phase 5:  /job-intake  (live)
 * Phase 6:  /resumes     (live)
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
  router.use('/resumes', resumeRoutes);

  return router;
}
