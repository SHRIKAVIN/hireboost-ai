import type {
  ApiResponse,
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

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
  return `${env.VITE_API_BASE_URL}/auth/google`;
}
