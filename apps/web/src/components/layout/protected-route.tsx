import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/shared/page-loader';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/auth-store';

/**
 * Phase 2: in dev we treat the user as authenticated even without a session
 * so layouts and routes are easy to inspect. Phase 4 flips this to a strict
 * check against `isAuthenticated`.
 */
const PHASE_2_DEV_BYPASS = import.meta.env.DEV;

export function ProtectedRoute() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const location = useLocation();

  if (!isHydrated) {
    return <PageLoader label="Restoring session…" />;
  }

  if (!isAuthenticated && !PHASE_2_DEV_BYPASS) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
