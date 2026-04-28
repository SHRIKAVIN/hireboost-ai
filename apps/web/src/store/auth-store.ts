import type { AuthSession, User, UserPreferences } from '@hireboost/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultPreferences: UserPreferences = {
  emailAnalysisReady: true,
  emailProductTips: false,
  inAppAnalysisReady: true,
};

function normalizeUser(user: User): User {
  return {
    ...user,
    preferences: { ...defaultPreferences, ...user.preferences },
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setSession: (session) =>
        set({
          user: normalizeUser(session.user),
          accessToken: session.accessToken,
          isAuthenticated: true,
        }),
      setUser: (user) =>
        user
          ? set({ user: normalizeUser(user), isAuthenticated: true })
          : set({ user: null, accessToken: null, isAuthenticated: false }),
      clear: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'hireboost.auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydration can finish synchronously before `useAuthStore` is assigned — never call
      // `useAuthStore` here on the success path; use the `state` argument from persist instead.
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[auth] Persist rehydration failed', error);
        }
        if (state) {
          state.setHydrated();
        } else {
          queueMicrotask(() => {
            useAuthStore.getState().setHydrated();
          });
        }
      },
    },
  ),
);

/** Read-only snapshot of the current access token (used by axios interceptor). */
export function readAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
