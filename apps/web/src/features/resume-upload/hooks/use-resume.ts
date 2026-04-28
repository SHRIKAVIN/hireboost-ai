import type { Resume, ResumeListItem } from '@hireboost/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { resumeApi, type ResumeUploadOptions } from '../api/resume-api';
import { useResumeStore } from '../store/resume-store';

/* -------------------------------------------------------------------------- */
/*                               Query keys                                   */
/* -------------------------------------------------------------------------- */

export const RESUME_KEYS = {
  all: ['resumes'] as const,
  list: (limit: number) => [...RESUME_KEYS.all, 'list', limit] as const,
  detail: (id: string) => [...RESUME_KEYS.all, 'detail', id] as const,
};

/* -------------------------------------------------------------------------- */
/*                                  Queries                                   */
/* -------------------------------------------------------------------------- */

/** Recent resumes for the current user. */
export function useResumesList(limit = 10) {
  return useQuery<ResumeListItem[]>({
    queryKey: RESUME_KEYS.list(limit),
    queryFn: () => resumeApi.list(limit),
    staleTime: 1000 * 30,
  });
}

/** Full resume for a specific id. */
export function useResume(id: string | null | undefined) {
  return useQuery<Resume>({
    queryKey: RESUME_KEYS.detail(id ?? ''),
    queryFn: () => resumeApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

/* -------------------------------------------------------------------------- */
/*                                Mutations                                   */
/* -------------------------------------------------------------------------- */

/**
 * Upload a resume with progress reporting. We expose `progress` as state
 * so the UI can show a real progress bar without reaching into the
 * mutation internals.
 */
export function useUploadResume() {
  const queryClient = useQueryClient();
  const setCurrent = useResumeStore((s) => s.setCurrent);
  const [progress, setProgress] = useState<number>(0);

  const mutation = useMutation({
    mutationFn: async (input: File | { file: File; options?: ResumeUploadOptions }) => {
      const file = input instanceof File ? input : input.file;
      const options = input instanceof File ? undefined : input.options;
      setProgress(0);
      try {
        return await resumeApi.upload(file, setProgress, options);
      } finally {
        setProgress(0);
      }
    },
    onSuccess: (resume) => {
      setCurrent({ id: resume.id, fileName: resume.originalFileName });
      queryClient.setQueryData(RESUME_KEYS.detail(resume.id), resume);
      queryClient.invalidateQueries({ queryKey: RESUME_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['job-intake'] });
    },
  });

  return { ...mutation, progress };
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const currentId = useResumeStore((s) => s.currentResumeId);
  const clearCurrent = useResumeStore((s) => s.clearCurrent);

  return useMutation({
    mutationFn: (id: string) => resumeApi.remove(id),
    onSuccess: (_void, id) => {
      if (id === currentId) clearCurrent();
      queryClient.invalidateQueries({ queryKey: RESUME_KEYS.all });
    },
  });
}
