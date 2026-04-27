/**
 * apps/api placeholder entry — replaced in Phase 3 by a real
 * Express + TypeScript application bootstrap (`app.ts` + `server.ts`).
 *
 * Phase 1 only verifies the workspace wires up cleanly,
 * `@hireboost/shared` resolves, and `tsc` succeeds.
 */

import { API_PREFIX, APP_NAME } from '@hireboost/shared';

export const phase1Banner = {
  app: APP_NAME,
  apiPrefix: API_PREFIX,
} as const;
