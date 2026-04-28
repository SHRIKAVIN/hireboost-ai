import type { AtsAnalyzeInput } from '@hireboost/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { JOB_INTAKE_KEYS } from '@/features/job-intake/hooks/use-job-intake';

import { atsApi } from '../api/ats-api';

export function useAtsAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AtsAnalyzeInput) => atsApi.analyze(input),
    onSuccess: (analysis) => {
      queryClient.setQueryData(JOB_INTAKE_KEYS.detail(analysis.id), analysis);
      queryClient.invalidateQueries({ queryKey: JOB_INTAKE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}
