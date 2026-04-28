import type {
  ApiResponse,
  JobAnalysis,
  JobAnalysisListItem,
  JobDescriptionInput,
} from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';

/**
 * Typed REST client for the `/job-intake` API.
 *
 * Every method unwraps the `ApiResponse<T>` envelope so callers get
 * back a plain typed value (or a thrown Error) — no envelope
 * inspection bleeds into React components.
 */
export const jobIntakeApi = {
  async analyze(input: JobDescriptionInput): Promise<JobAnalysis> {
    const { data } = await apiClient.post<ApiResponse<JobAnalysis>>('/job-intake', input);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async list(limit = 10): Promise<JobAnalysisListItem[]> {
    const { data } = await apiClient.get<ApiResponse<JobAnalysisListItem[]>>('/job-intake', {
      params: { limit },
    });
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async getById(id: string): Promise<JobAnalysis> {
    const { data } = await apiClient.get<ApiResponse<JobAnalysis>>(`/job-intake/${id}`);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/job-intake/${id}`);
  },
};
