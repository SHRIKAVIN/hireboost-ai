import type { ResumeEnhanceInput } from '@hireboost/shared';
import { useMutation } from '@tanstack/react-query';

import { aiApi } from '../api/ai-api';

export function useEnhanceResume() {
  return useMutation({
    mutationFn: (input: ResumeEnhanceInput) => aiApi.enhanceResume(input),
  });
}
