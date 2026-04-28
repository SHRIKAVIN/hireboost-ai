import type { ApiError as ApiErrorEnvelope, ApiResponse, AuthSession } from '@hireboost/shared';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { env } from './env';

/* -------------------------------------------------------------------------- */
/*                            Token accessor (Zustand-free)                   */
/* -------------------------------------------------------------------------- */

/**
 * The auth store is the source of truth for the current access token, but
 * importing the store here would create a circular dependency. We let the
 * auth store register read/write functions during app bootstrap.
 */
let getAccessToken: () => string | null = () => null;
let onSessionRefreshed: (session: AuthSession) => void = () => {};
let onSessionCleared: () => void = () => {};

export function configureApiClient(handlers: {
  getAccessToken: () => string | null;
  onSessionRefreshed: (session: AuthSession) => void;
  onSessionCleared: () => void;
}) {
  getAccessToken = handlers.getAccessToken;
  onSessionRefreshed = handlers.onSessionRefreshed;
  onSessionCleared = handlers.onSessionCleared;
}

/* -------------------------------------------------------------------------- */
/*                                Axios instance                              */
/* -------------------------------------------------------------------------- */

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -------------------------------------------------------------------------- */
/*                       Refresh-on-401 (single-flight)                       */
/* -------------------------------------------------------------------------- */

let inflightRefresh: Promise<AuthSession | null> | null = null;

async function refreshSession(): Promise<AuthSession | null> {
  try {
    const { data } = await axios.post<ApiResponse<AuthSession>>(
      `${env.VITE_API_BASE_URL}/auth/refresh`,
      undefined,
      { withCredentials: true },
    );
    if (!data.success) return null;
    onSessionRefreshed(data.data);
    return data.data;
  } catch {
    return null;
  }
}

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _skipRefresh?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorEnvelope>) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry || original._skipRefresh) {
      return Promise.reject(error);
    }

    const url = original.url ?? '';
    if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!inflightRefresh) {
      inflightRefresh = refreshSession().finally(() => {
        inflightRefresh = null;
      });
    }
    const refreshed = await inflightRefresh;

    if (!refreshed) {
      onSessionCleared();
      return Promise.reject(error);
    }

    original.headers = original.headers ?? {};
    (original.headers as Record<string, string>).Authorization = `Bearer ${refreshed.accessToken}`;
    return apiClient(original);
  },
);

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/** Convenience helper to extract a typed `data` field from an API response. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

/** Format an axios error into a user-friendly message. */
export function formatApiError(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const env = err.response?.data as ApiErrorEnvelope | undefined;
    if (env && !env.success && env.error?.message) return env.error.message;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
