import type {
  JobAnalysis,
  JobAnalysisListItem,
  JobDescriptionInput,
} from '@hireboost/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { jobIntakeApi } from '../api/job-intake-api';
import { useJobIntakeStore } from '../store/job-intake-store';

/* -------------------------------------------------------------------------- */
/*                               Query keys                                   */
/* -------------------------------------------------------------------------- */

export const JOB_INTAKE_KEYS = {
  all: ['job-intake'] as const,
  list: (limit: number) => [...JOB_INTAKE_KEYS.all, 'list', limit] as const,
  detail: (id: string) => [...JOB_INTAKE_KEYS.all, 'detail', id] as const,
};

/* -------------------------------------------------------------------------- */
/*                                  Queries                                   */
/* -------------------------------------------------------------------------- */

/** Recent job analyses for the current user. */
export function useJobAnalysesList(limit = 10) {
  return useQuery<JobAnalysisListItem[]>({
    queryKey: JOB_INTAKE_KEYS.list(limit),
    queryFn: () => jobIntakeApi.list(limit),
    staleTime: 1000 * 30,
  });
}

/** Full analysis for a specific id. */
export function useJobAnalysis(id: string | null | undefined) {
  return useQuery<JobAnalysis>({
    queryKey: JOB_INTAKE_KEYS.detail(id ?? ''),
    queryFn: () => jobIntakeApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

/* -------------------------------------------------------------------------- */
/*                                Mutations                                   */
/* -------------------------------------------------------------------------- */

/**
 * Submit a JD for analysis. On success, hydrate caches AND set the
 * "current analysis" pointer in the workflow store so downstream steps
 * (Phase 6 resume upload, Phase 7 ATS) can read it.
 */
export function useAnalyzeJobDescription() {
  const queryClient = useQueryClient();
  const setCurrent = useJobIntakeStore((s) => s.setCurrent);

  return useMutation({
    mutationFn: (input: JobDescriptionInput) => jobIntakeApi.analyze(input),
    onSuccess: (analysis) => {
      setCurrent({ id: analysis.id, role: analysis.extractedRole });
      queryClient.setQueryData(JOB_INTAKE_KEYS.detail(analysis.id), analysis);
      queryClient.invalidateQueries({ queryKey: JOB_INTAKE_KEYS.all });
    },
  });
}

export function useDeleteJobAnalysis() {
  const queryClient = useQueryClient();
  const currentId = useJobIntakeStore((s) => s.currentAnalysisId);
  const clearCurrent = useJobIntakeStore((s) => s.clearCurrent);

  return useMutation({
    mutationFn: (id: string) => jobIntakeApi.remove(id),
    onSuccess: (_void, id) => {
      if (id === currentId) clearCurrent();
      queryClient.invalidateQueries({ queryKey: JOB_INTAKE_KEYS.all });
    },
  });
}
