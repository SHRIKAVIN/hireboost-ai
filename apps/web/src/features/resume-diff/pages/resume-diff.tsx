import { GitCompare, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DEFAULT_WORKFLOW_STEPS } from '@/components/shared/workflow-stepper-data';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useJobIntakeStore } from '@/features/job-intake/store/job-intake-store';
import { useResumeStore } from '@/features/resume-upload/store/resume-store';
import { ROUTES } from '@/routes/paths';

import { StructuredResumeDiffView } from '../components/structured-resume-diff';
import { useResumeReviewStore } from '../store/resume-review-store';

export function ResumeDiffPage() {
  const navigate = useNavigate();
  const session = useResumeReviewStore((s) => s.session);
  const approveForEditor = useResumeReviewStore((s) => s.approveForEditor);
  const clearSession = useResumeReviewStore((s) => s.clearSession);

  const currentRole = useJobIntakeStore((s) => s.currentRole);
  const currentFileName = useResumeStore((s) => s.currentFileName);

  const handleApproveEnhanced = () => {
    if (!session) return;
    approveForEditor(session.enhanced);
    toast.success('Enhanced resume selected', {
      description: 'Phase 10 editor will load this draft.',
    });
    void navigate(ROUTES.app.resumeEditor);
  };

  const handleApproveOriginal = () => {
    if (!session) return;
    approveForEditor(session.original);
    toast.success('Original resume kept', {
      description: 'Phase 10 editor will load this draft.',
    });
    void navigate(ROUTES.app.resumeEditor);
  };

  const handleClear = () => {
    clearSession();
    toast.message('Diff session cleared');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <GitCompare className="h-3 w-3 text-primary" />
          Step 5 — Diff & review
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Review every AI change</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Compare your parsed resume to the AI-enhanced version. Approve the version you want to take into
          the editor and export flow.
        </p>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="preview-edit" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Context</p>
          <p className="font-medium">
            {currentRole || 'Job analysis'}{' '}
            {currentFileName && (
              <span className="text-muted-foreground">· {currentFileName}</span>
            )}
          </p>
          {session && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Model: {session.provider} / {session.model} ·{' '}
              {new Date(session.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.aiEnhance}>AI Enhance</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.atsReview}>ATS</Link>
          </Button>
          {session && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleClear}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear session
            </Button>
          )}
        </div>
      </div>

      {!session && (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No enhancement session yet. Run <strong>AI Enhance</strong> first — we store the before/after
              structured resume so you can inspect edits here without another API call.
            </p>
            <Button asChild variant="primary">
              <Link to={ROUTES.app.aiEnhance}>Go to AI Enhance</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {session && (
        <>
          {session.highlights.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold">AI highlights</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {session.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <StructuredResumeDiffView before={session.original} after={session.enhanced} />

          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">Choose a version for the editor</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  The editor opens your choice as an editable draft. You can always regenerate from AI
                  Enhance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleApproveOriginal}>
                  Use original
                </Button>
                <Button variant="primary" onClick={handleApproveEnhanced}>
                  Use enhanced
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default ResumeDiffPage;
