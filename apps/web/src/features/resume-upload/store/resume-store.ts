import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global pointer to the user's "current" resume — the one driving the
 * rest of the workflow (ATS review → diff → editor).
 *
 * Persisted to localStorage so a page refresh keeps the user on the
 * same workflow step. Heavy resume data lives in TanStack Query.
 */
interface ResumeState {
  currentResumeId: string | null;
  currentFileName: string | null;
  setCurrent: (input: { id: string; fileName: string }) => void;
  clearCurrent: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      currentResumeId: null,
      currentFileName: null,
      setCurrent: ({ id, fileName }) =>
        set({ currentResumeId: id, currentFileName: fileName || null }),
      clearCurrent: () => set({ currentResumeId: null, currentFileName: null }),
    }),
    {
      name: 'hireboost.resume',
      partialize: (s) => ({
        currentResumeId: s.currentResumeId,
        currentFileName: s.currentFileName,
      }),
    },
  ),
);
