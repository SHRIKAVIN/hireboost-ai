import type { ApiResponse, AtsAnalyzeInput, JobAnalysis } from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';

export const atsApi = {
  async analyze(input: AtsAnalyzeInput): Promise<JobAnalysis> {
    const { data } = await apiClient.post<ApiResponse<JobAnalysis>>('/ats/analyze', input);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },
};
