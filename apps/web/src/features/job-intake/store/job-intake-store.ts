import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global pointer to the user's "current" job analysis — the one driving
 * the rest of the workflow (resume upload → ATS → diff → editor).
 *
 * Persisted to localStorage so a refresh keeps the user on the same
 * step they were on. We deliberately don't cache the full analysis
 * here — that lives in TanStack Query, keyed by id.
 */
interface JobIntakeState {
  currentAnalysisId: string | null;
  currentRole: string | null;
  setCurrent: (input: { id: string; role: string }) => void;
  clearCurrent: () => void;
}

export const useJobIntakeStore = create<JobIntakeState>()(
  persist(
    (set) => ({
      currentAnalysisId: null,
      currentRole: null,
      setCurrent: ({ id, role }) =>
        set({ currentAnalysisId: id, currentRole: role || null }),
      clearCurrent: () => set({ currentAnalysisId: null, currentRole: null }),
    }),
    {
      name: 'hireboost.job-intake',
      partialize: (s) => ({
        currentAnalysisId: s.currentAnalysisId,
        currentRole: s.currentRole,
      }),
    },
  ),
);
