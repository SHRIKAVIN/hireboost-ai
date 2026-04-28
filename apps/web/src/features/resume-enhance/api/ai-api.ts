import type { ApiResponse, ResumeEnhanceInput, ResumeEnhancementResult } from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';

export const aiApi = {
  async enhanceResume(input: ResumeEnhanceInput): Promise<ResumeEnhancementResult> {
    const { data } = await apiClient.post<ApiResponse<ResumeEnhancementResult>>(
      '/ai/enhance-resume',
      input,
      { timeout: 120_000 },
    );
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },
};
