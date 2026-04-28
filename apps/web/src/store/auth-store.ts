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
        set({ user: user ? normalizeUser(user) : null, isAuthenticated: !!user }),
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
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/** Read-only snapshot of the current access token (used by axios interceptor). */
export function readAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
