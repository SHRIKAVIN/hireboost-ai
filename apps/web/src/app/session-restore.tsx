import { useEffect } from 'react';

import { trySilentRefreshSession } from '@/features/auth/api/auth-api';
import { needsSilentRefresh } from '@/lib/access-token';
import { useAuthStore } from '@/store/auth-store';

/**
 * Renews the access token from the HttpOnly refresh cookie on every cold start.
 * The PWA `start_url` is `/`, so users often never hit `ProtectedRoute` until later;
 * without this, an expired JWT in persisted storage looks "logged out" or breaks API calls.
 */
export function SessionRestore(): null {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated && !accessToken) return;
    if (!needsSilentRefresh(accessToken)) return;

    void (async () => {
      const session = await trySilentRefreshSession();
      if (session) {
        setSession(session);
        return;
      }
      const { isAuthenticated: authed, accessToken: tok } = useAuthStore.getState();
      if (authed || tok) clear();
    })();
  }, [isHydrated, isAuthenticated, accessToken, setSession, clear]);

  return null;
}
