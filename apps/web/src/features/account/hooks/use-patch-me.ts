import type { UpdateCurrentUserInput } from '@hireboost/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ME_QUERY_KEY } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';

import { accountApi } from '../api/account-api';

export function usePatchMeMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCurrentUserInput) => accountApi.patchMe(input),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}
