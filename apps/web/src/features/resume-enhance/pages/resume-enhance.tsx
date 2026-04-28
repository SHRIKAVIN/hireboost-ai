import type { Resume } from '@hireboost/shared';
import { Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { DEFAULT_WORKFLOW_STEPS } from '@/components/shared/workflow-stepper-data';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobAnalysis } from '@/features/job-intake/hooks/use-job-intake';
import { useJobIntakeStore } from '@/features/job-intake/store/job-intake-store';
import { ParsedResumePreview } from '@/features/resume-upload/components/parsed-resume-preview';
import { useResume } from '@/features/resume-upload/hooks/use-resume';
import { useResumeStore } from '@/features/resume-upload/store/resume-store';
import { formatApiError } from '@/lib/api-client';
import { ROUTES } from '@/routes/paths';

import { useResumeReviewStore } from '@/features/resume-diff/store/resume-review-store';

import { useEnhanceResume } from '../hooks/use-ai-enhance';

function resumeWithParsed(base: Resume, parsedData: Resume['parsedData']): Resume {
  return { ...base, parsedData };
}

export function ResumeEnhancePage() {
  const currentAnalysisId = useJobIntakeStore((s) => s.currentAnalysisId);
  const currentRole = useJobIntakeStore((s) => s.currentRole);
  const currentResumeId = useResumeStore((s) => s.currentResumeId);

  const analysisQuery = useJobAnalysis(currentAnalysisId);
  const analysis = analysisQuery.data;

  const resumeId = analysis?.resumeId ?? currentResumeId ?? null;
  const resumeQuery = useResume(resumeId);

  const enhanceMutation = useEnhanceResume();
  const [enhanced, setEnhanced] = useState<Resume['parsedData'] | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ provider: string; model: string } | null>(null);

  const canRun = Boolean(currentAnalysisId && resumeId && resumeQuery.data);

  const originalResume = resumeQuery.data;

  const enhancedResumeView = useMemo(() => {
    if (!originalResume || !enhanced) return null;
    return resumeWithParsed(originalResume, enhanced);
  }, [originalResume, enhanced]);

  const handleEnhance = async () => {
    if (!currentAnalysisId || !resumeId) return;
    try {
      const result = await enhanceMutation.mutateAsync({
        jobAnalysisId: currentAnalysisId,
        ...(analysis?.resumeId ? {} : { resumeId }),
      });
      setEnhanced(result.enhancedStructuredData);
      setHighlights(result.highlights);
      setMeta({ provider: result.provider, model: result.model });
      if (originalResume) {
        useResumeReviewStore.getState().setSession({
          jobAnalysisId: currentAnalysisId,
          resumeId,
          original: originalResume.parsedData,
          enhanced: result.enhancedStructuredData,
          highlights: result.highlights,
          provider: result.provider,
          model: result.model,
          updatedAt: new Date().toISOString(),
        });
      }
      toast.success('AI-enhanced resume ready', {
        description: `Powered by ${result.provider} · ${result.model}`,
      });
    } catch (err) {
      toast.error('Enhancement failed', { description: formatApiError(err) });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Wand2 className="h-3 w-3 text-primary" />
          Step 4 — AI enhancement
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Tailor your resume to the job — with AI
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          We send your structured resume plus the job analysis (including ATS gaps) to the
          configured provider (Gemini or OpenAI). Open <strong>Resume Diff</strong> next to inspect every
          change before you pick a version for the editor.
        </p>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="preview-edit" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Context
          </p>
          <p className="font-medium">
            {currentRole || analysis?.extractedRole || 'Select a job analysis'}{' '}
            {originalResume && (
              <span className="text-muted-foreground">
                · {originalResume.originalFileName}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.jobIntake}>JD</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.resumeUpload}>Resume</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.atsReview}>ATS</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.resumeDiff}>Diff</Link>
          </Button>
        </div>
      </div>

      {analysisQuery.isLoading && <Skeleton className="h-24 w-full" />}

      {!canRun && !analysisQuery.isLoading && (
        <p className="rounded-lg border border-warning/30 bg-warning/[0.06] px-4 py-3 text-sm">
          Load a <Link className="text-primary underline" to={ROUTES.app.jobIntake}>job analysis</Link>{' '}
          and <Link className="text-primary underline" to={ROUTES.app.resumeUpload}>resume</Link> first.
          Run ATS review for best gap context (optional but recommended).
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="primary"
          size="lg"
          loading={enhanceMutation.isPending}
          disabled={!canRun || enhanceMutation.isPending}
          onClick={() => void handleEnhance()}
        >
          <Wand2 className="h-4 w-4" />
          {enhanced ? 'Regenerate enhancement' : 'Generate AI-enhanced resume'}
        </Button>
        <div className="flex flex-col items-end gap-1">
          {meta && (
            <p className="text-xs text-muted-foreground">
              Last run: <span className="font-mono">{meta.provider}</span> /{' '}
              <span className="font-mono">{meta.model}</span>
            </p>
          )}
          {enhanced && (
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.app.resumeDiff}>Open diff & review</Link>
            </Button>
          )}
        </div>
      </div>

      {highlights.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Highlights</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {originalResume && (
        <div className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Original
            </h2>
            <ParsedResumePreview resume={originalResume} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              AI-enhanced
            </h2>
            {enhancedResumeView ? (
              <ParsedResumePreview resume={enhancedResumeView} />
            ) : (
              <Card>
                <CardContent className="flex min-h-[200px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
                  Run enhancement to see a side-by-side preview.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeEnhancePage;
