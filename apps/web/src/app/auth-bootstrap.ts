import { configureApiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

/**
 * Wire the global axios instance to the auth store. Imported once at boot
 * (in `main.tsx`) so the side effect runs before any component renders.
 */
export function bootstrapAuth(): void {
  configureApiClient({
    getAccessToken: () => useAuthStore.getState().accessToken,
    onSessionRefreshed: (session) => useAuthStore.getState().setSession(session),
    onSessionCleared: () => useAuthStore.getState().clear(),
  });
}
