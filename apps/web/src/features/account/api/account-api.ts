import type { ApiResponse, UpdateCurrentUserInput, User } from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';

export const accountApi = {
  async patchMe(input: UpdateCurrentUserInput): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<User>>('/users/me', input);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },
};
