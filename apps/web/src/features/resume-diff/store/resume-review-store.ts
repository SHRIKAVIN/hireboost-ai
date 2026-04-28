import type { ResumeStructuredData } from '@hireboost/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EnhancementSession {
  jobAnalysisId: string;
  resumeId: string;
  original: ResumeStructuredData;
  enhanced: ResumeStructuredData;
  highlights: string[];
  provider: string;
  model: string;
  updatedAt: string;
}

interface ResumeReviewState {
  session: EnhancementSession | null;
  /** Chosen payload for Phase 10 editor / export. */
  approvedForEditor: ResumeStructuredData | null;
  setSession: (session: EnhancementSession) => void;
  clearSession: () => void;
  approveForEditor: (data: ResumeStructuredData) => void;
  clearApproval: () => void;
}

export const useResumeReviewStore = create<ResumeReviewState>()(
  persist(
    (set) => ({
      session: null,
      approvedForEditor: null,
      setSession: (session) => set({ session, approvedForEditor: null }),
      clearSession: () => set({ session: null }),
      approveForEditor: (approvedForEditor) => set({ approvedForEditor }),
      clearApproval: () => set({ approvedForEditor: null }),
    }),
    {
      name: 'hireboost.resume-review',
      partialize: (s) => ({
        session: s.session,
        approvedForEditor: s.approvedForEditor,
      }),
    },
  ),
);
