import { Briefcase, FileSearch, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { DEFAULT_WORKFLOW_STEPS } from '@/components/shared/workflow-stepper-data';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobAnalysis } from '@/features/job-intake/hooks/use-job-intake';
import { useJobIntakeStore } from '@/features/job-intake/store/job-intake-store';
import { useResume } from '@/features/resume-upload/hooks/use-resume';
import { useResumeStore } from '@/features/resume-upload/store/resume-store';
import { formatApiError } from '@/lib/api-client';
import { ROUTES } from '@/routes/paths';

import { AtsResultsPanel } from '../components/ats-results-panel';
import { useAtsAnalyze } from '../hooks/use-ats';

export function AtsReviewPage() {
  const currentAnalysisId = useJobIntakeStore((s) => s.currentAnalysisId);
  const currentRole = useJobIntakeStore((s) => s.currentRole);
  const currentResumeId = useResumeStore((s) => s.currentResumeId);

  const analysisQuery = useJobAnalysis(currentAnalysisId);
  const analysis = analysisQuery.data;

  const resumeId = analysis?.resumeId ?? currentResumeId ?? null;
  const resumeQuery = useResume(resumeId);

  const atsMutation = useAtsAnalyze();

  const canRun = Boolean(currentAnalysisId && resumeId);

  const handleAnalyze = async () => {
    if (!currentAnalysisId || !resumeId) return;
    try {
      await atsMutation.mutateAsync({
        jobAnalysisId: currentAnalysisId,
        ...(analysis?.resumeId ? {} : { resumeId }),
      });
      toast.success('ATS analysis complete', {
        description: 'Scores and gaps are saved on this job analysis.',
      });
    } catch (err) {
      toast.error('Analysis failed', { description: formatApiError(err) });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Step 3 — ATS review
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          See how you stack up before you change a word
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Deterministic keyword and structure scoring against the job you analyzed — missing
          terms, weak bullets, and layout flags. Then use{' '}
          <Link className="font-medium text-primary underline" to={ROUTES.app.aiEnhance}>
            AI Enhance
          </Link>{' '}
          for LLM-powered rewrites aligned to this JD.
        </p>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="review-changes" />

      {/* Context */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Job analysis
              </p>
              {currentAnalysisId ? (
                <p className="font-medium">{currentRole || analysis?.extractedRole || 'Loaded'}</p>
              ) : (
                <p className="text-muted-foreground">None selected</p>
              )}
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.app.jobIntake}>JD</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resume
              </p>
              {resumeId ? (
                <p className="font-medium">
                  {resumeQuery.data?.originalFileName ??
                    resumeQuery.data?.parsedData?.basics?.fullName ??
                    'Loading…'}
                </p>
              ) : (
                <p className="text-muted-foreground">Upload a resume first</p>
              )}
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.app.resumeUpload}>Upload</Link>
          </Button>
        </div>
      </div>

      {analysisQuery.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {analysisQuery.isError && (
        <p className="text-sm text-destructive">
          Could not load job analysis. {formatApiError(analysisQuery.error)}
        </p>
      )}

      {analysis && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSearch className="h-4 w-4 text-primary" />
              {analysis.atsScore !== undefined ? (
                <span>
                  Last ATS score: <strong className="text-foreground">{analysis.atsScore}</strong>
                  {' · '}
                  Match: <strong className="text-foreground">{analysis.matchPercent}%</strong>
                </span>
              ) : (
                <span>Run an analysis to generate your ATS score and gap list.</span>
              )}
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={atsMutation.isPending}
              disabled={!canRun || atsMutation.isPending}
              onClick={() => void handleAnalyze()}
            >
              {analysis.atsScore !== undefined ? 'Re-run ATS analysis' : 'Run ATS analysis'}
            </Button>
          </div>

          {!canRun && (
            <p className="rounded-lg border border-warning/30 bg-warning/[0.06] px-4 py-3 text-sm text-foreground/90">
              You need both a <Link className="font-medium text-primary underline" to={ROUTES.app.jobIntake}>job description</Link>{' '}
              and a <Link className="font-medium text-primary underline" to={ROUTES.app.resumeUpload}>resume</Link>
              . Upload your resume from Step 2 while that JD is active so we can link them.
            </p>
          )}

          <AtsResultsPanel analysis={analysis} />

          {canRun && (
            <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-transparent px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground/90">
                Ready for deeper edits? Generate an AI-tailored resume using this job context and
                ATS gaps.
              </p>
              <Button asChild variant="primary">
                <Link to={ROUTES.app.aiEnhance}>Go to AI Enhance</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AtsReviewPage;
