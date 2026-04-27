import type { User } from '@hireboost/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (payload: { user: User; accessToken: string }) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
  setHydrated: () => void;
}

/**
 * Phase 2: store + persistence shell only — login/logout flows hook into
 * this in Phase 4 once /auth/login + /auth/me are real.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setSession: ({ user, accessToken }) =>
        set({ user, accessToken, isAuthenticated: true }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
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
