import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/shared/page-loader';
import { trySilentRefreshSession } from '@/features/auth/api/auth-api';
import { needsSilentRefresh } from '@/lib/access-token';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/auth-store';

/**
 * Guards every authenticated route. After storage rehydrates, we renew the access token
 * via the HttpOnly refresh cookie when it is missing or expired so returning users are not
 * bounced to /login on every visit.
 */
export function ProtectedRoute() {
  const { isAuthenticated, accessToken, user, isHydrated, setSession, clear } = useAuthStore();
  const location = useLocation();
  const [bootstrapping, setBootstrapping] = useState(false);
  const triedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (triedRef.current) return;
    if (!needsSilentRefresh(accessToken)) return;
    triedRef.current = true;
    setBootstrapping(true);

    (async () => {
      try {
        const session = await trySilentRefreshSession();
        if (session) {
          setSession(session);
        } else {
          const { accessToken: tok } = useAuthStore.getState();
          if (needsSilentRefresh(tok)) clear();
        }
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [isHydrated, accessToken, setSession, clear]);

  if (!isHydrated || bootstrapping) {
    return <PageLoader label="Restoring session…" />;
  }

  const accessTokenUsable = Boolean(accessToken) && !needsSilentRefresh(accessToken);
  const hasPersistedSession = Boolean(user) && Boolean(accessToken);
  if (!isAuthenticated && !accessTokenUsable && !hasPersistedSession) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
