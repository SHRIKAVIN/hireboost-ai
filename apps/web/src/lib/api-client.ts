import axios, { type AxiosInstance, AxiosError } from 'axios';

import { env } from './env';

/**
 * Centralized axios instance.
 *
 * Phase 2 wires the basic shape; the auth token interceptor and 401 refresh
 * flow are wired in Phase 4 once the auth store + refresh endpoint exist.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: false,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/** Convenience helper to extract a typed `data` field from an API response. */
export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
