import type { ApiResponse, Resume, ResumeListItem } from '@hireboost/shared';
import type { AxiosProgressEvent } from 'axios';

import { apiClient } from '@/lib/api-client';

/**
 * Typed REST client for the `/resumes` API.
 *
 * Mirrors the shape of `jobIntakeApi` so feature modules feel symmetric:
 * each method unwraps the `ApiResponse<T>` envelope and throws on the
 * error case. The upload method uniquely supports a progress callback so
 * the UI can show a real upload progress bar.
 */
export interface ResumeUploadOptions {
  /** Links this upload to a job analysis (Step 1) when present. */
  jobAnalysisId?: string;
}

export const resumeApi = {
  async upload(
    file: File,
    onProgress?: (percent: number) => void,
    options?: ResumeUploadOptions,
  ): Promise<Resume> {
    const form = new FormData();
    form.append('file', file);
    if (options?.jobAnalysisId) {
      form.append('jobAnalysisId', options.jobAnalysisId);
    }

    const { data } = await apiClient.post<ApiResponse<Resume>>(
      '/resumes/upload',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (!onProgress) return;
          const total = evt.total ?? 0;
          if (total > 0) {
            onProgress(Math.round((evt.loaded * 100) / total));
          }
        },
      },
    );
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async list(limit = 10): Promise<ResumeListItem[]> {
    const { data } = await apiClient.get<ApiResponse<ResumeListItem[]>>('/resumes', {
      params: { limit },
    });
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async getById(id: string): Promise<Resume> {
    const { data } = await apiClient.get<ApiResponse<Resume>>(`/resumes/${id}`);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },

  /** URL of the original PDF/DOCX, suitable for `<a href>` downloads. */
  getOriginalFileUrl(id: string): string {
    const base = apiClient.defaults.baseURL ?? '';
    return `${base.replace(/\/$/, '')}/resumes/${id}/file`;
  },
};
