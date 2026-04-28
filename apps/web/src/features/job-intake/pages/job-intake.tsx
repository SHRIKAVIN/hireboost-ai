import type { JobAnalysisListItem, JobDescriptionInput } from '@hireboost/shared';
import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { DEFAULT_WORKFLOW_STEPS } from '@/components/shared/workflow-stepper-data';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';
import { Skeleton } from '@/components/ui/skeleton';
import { formatApiError } from '@/lib/api-client';

import { AnalysisResult } from '../components/analysis-result';
import { JdInputCard } from '../components/jd-input-card';
import { RecentAnalysesList } from '../components/recent-analyses-list';
import {
  useAnalyzeJobDescription,
  useJobAnalysis,
} from '../hooks/use-job-intake';
import { useJobIntakeStore } from '../store/job-intake-store';

export function JobIntakePage() {
  const currentAnalysisId = useJobIntakeStore((s) => s.currentAnalysisId);
  const setCurrent = useJobIntakeStore((s) => s.setCurrent);
  const clearCurrent = useJobIntakeStore((s) => s.clearCurrent);

  /**
   * Local "selected for viewing" id. It defaults to the persisted current
   * analysis but can diverge if the user clicks a different recent item
   * without committing it as their workflow's current analysis.
   */
  const [viewingId, setViewingId] = useState<string | null>(currentAnalysisId);

  const analysisQuery = useJobAnalysis(viewingId);
  const analyzeMutation = useAnalyzeJobDescription();

  const resultRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the result when one becomes available.
  useEffect(() => {
    if (analysisQuery.data) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisQuery.data?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = async (input: JobDescriptionInput) => {
    try {
      const analysis = await analyzeMutation.mutateAsync(input);
      setViewingId(analysis.id);
      toast.success('Analysis ready', {
        description: `Detected ${analysis.extractedSkills.length} skills · ${analysis.extractedKeywords.length} keywords`,
      });
    } catch (err) {
      toast.error('Could not analyze JD', { description: formatApiError(err) });
    }
  };

  const handleSelectRecent = (item: JobAnalysisListItem) => {
    setViewingId(item.id);
    setCurrent({ id: item.id, role: item.extractedRole });
  };

  const handleReset = () => {
    setViewingId(null);
    clearCurrent();
  };

  const showResult = Boolean(viewingId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Step 1 — Job Description
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Anchor the workflow on the job you want
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The entire HireBoost workflow is built around the JD. Paste the role
          you're targeting and we'll extract the seniority, must-have skills,
          tools, and ATS keywords before you upload a resume.
        </p>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="job-description" />

      {/* Main two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <JdInputCard
            onAnalyze={handleAnalyze}
            isAnalyzing={analyzeMutation.isPending}
          />

          <div ref={resultRef} className="scroll-mt-8">
            {showResult && analysisQuery.isLoading && <ResultSkeleton />}

            {showResult && analysisQuery.isError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Couldn't load that analysis. {formatApiError(analysisQuery.error)}
              </p>
            )}

            {showResult && analysisQuery.data && (
              <AnalysisResult
                analysis={analysisQuery.data}
                onReset={handleReset}
              />
            )}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent analyses
          </h2>
          <RecentAnalysesList
            selectedId={viewingId}
            onSelect={handleSelectRecent}
          />
        </aside>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-soft">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobIntakePage;
