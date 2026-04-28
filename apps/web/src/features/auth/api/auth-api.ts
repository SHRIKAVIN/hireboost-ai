import type {
  ApiResponse,
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

/** Single-flight refresh so marketing shell + protected route never duplicate POST /auth/refresh. */
let refreshInflight: Promise<AuthSession | null> | null = null;

export function trySilentRefreshSession(): Promise<AuthSession | null> {
  if (!refreshInflight) {
    refreshInflight = authApi
      .refresh()
      .then((s) => s)
      .catch((): null => null)
      .finally(() => {
        refreshInflight = null;
      });
  }
  return refreshInflight;
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', input);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>('/auth/register', input);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async refresh(): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>('/auth/refresh');
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },
};

/** Absolute URL to start the Google OAuth flow (server-driven redirect). */
export function googleOAuthStartUrl(): string {
  const { origin } = new URL(env.VITE_API_BASE_URL);
  return `${origin}/api/v1/auth/google`;
}
