import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/shared/page-loader';
import { authApi } from '@/features/auth/api/auth-api';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/auth-store';

/**
 * Guards every authenticated route. On mount it tries to silently refresh
 * the session via the HttpOnly refresh-token cookie if there's no in-memory
 * access token, so a hard reload doesn't bounce the user to /login.
 */
export function ProtectedRoute() {
  const { isAuthenticated, accessToken, isHydrated, setSession, clear } = useAuthStore();
  const location = useLocation();
  const [bootstrapping, setBootstrapping] = useState(false);
  const triedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (accessToken || triedRef.current) return;
    triedRef.current = true;
    setBootstrapping(true);

    (async () => {
      try {
        const session = await authApi.refresh();
        setSession(session);
      } catch {
        clear();
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [isHydrated, accessToken, setSession, clear]);

  if (!isHydrated || bootstrapping) {
    return <PageLoader label="Restoring session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
