import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageLoader } from '@/components/shared/page-loader';
import { formatApiError } from '@/lib/api-client';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/auth-store';

import { authApi } from '../api/auth-api';
import { ME_QUERY_KEY } from '../hooks/use-auth';

/**
 * Landing page for the Google OAuth flow. The backend has already set the
 * refresh-token cookie and redirected here with `?accessToken=...&expiresIn=...`.
 * We hydrate the access token, fetch the profile via /me, then send the user
 * to the dashboard.
 */
export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const expiresInRaw = searchParams.get('expiresIn');
    const error = searchParams.get('error');

    if (error || !accessToken) {
      toast.error('Sign-in failed', { description: error ?? 'Missing access token' });
      navigate(ROUTES.auth.login, { replace: true });
      return;
    }

    const expiresIn = Number(expiresInRaw) || 900;

    (async () => {
      try {
        useAuthStore.setState({ accessToken, isAuthenticated: true });
        const user = await authApi.me();
        setSession({ user, accessToken, expiresIn, tokenType: 'Bearer' });
        queryClient.setQueryData(ME_QUERY_KEY, user);
        toast.success(`Welcome, ${user.name.split(' ')[0]}`);
        navigate(ROUTES.app.dashboard, { replace: true });
      } catch (err) {
        clearSession();
        toast.error('Sign-in failed', { description: formatApiError(err) });
        navigate(ROUTES.auth.login, { replace: true });
      }
    })();
  }, [searchParams, navigate, setSession, clearSession, queryClient]);

  return <PageLoader label="Finishing sign-in…" />;
}

export default OAuthCallbackPage;
