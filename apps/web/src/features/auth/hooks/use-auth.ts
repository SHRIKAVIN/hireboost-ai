import type { LoginInput, RegisterInput } from '@hireboost/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/auth-store';

import { authApi } from '../api/auth-api';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => {
      setSession(session);
      queryClient.setQueryData(ME_QUERY_KEY, session.user);
    },
  });
}

export function useRegisterMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (session) => {
      setSession(session);
      queryClient.setQueryData(ME_QUERY_KEY, session.user);
    },
  });
}

export function useLogoutMutation() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}

/**
 * Loads the current user via /auth/me whenever the access token changes.
 * Query is disabled when there's no token (so we don't hit a guaranteed 401).
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const user = await authApi.me();
      setUser(user);
      return user;
    },
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
