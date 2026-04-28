import type { ResumeStructuredData } from '@hireboost/shared';
import { PencilRuler } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { DEFAULT_WORKFLOW_STEPS } from '@/components/shared/workflow-stepper-data';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useResumeReviewStore } from '@/features/resume-diff/store/resume-review-store';
import { ROUTES } from '@/routes/paths';

import { ResumeEditorWorkspace } from '../components/resume-editor-workspace';
import { emptyResumeStructuredData } from '../lib/empty-resume';

function normalizeSeed(data: ResumeStructuredData): ResumeStructuredData {
  return {
    ...data,
    basics: {
      ...data.basics,
      links: data.basics.links ?? [],
    },
    skills: data.skills ?? [],
    summary: data.summary ?? '',
    experience: (data.experience ?? []).map((e) => ({
      ...e,
      bullets: e.bullets ?? [],
    })),
    education: data.education ?? [],
    projects: (data.projects ?? []).map((p) => ({
      ...p,
      bullets: p.bullets ?? [],
    })),
    certifications: data.certifications ?? [],
  };
}

export function ResumeEditorPage() {
  const approved = useResumeReviewStore((s) => s.approvedForEditor);
  const session = useResumeReviewStore((s) => s.session);

  const seed = useMemo(() => {
    const raw =
      approved ?? session?.enhanced ?? session?.original ?? emptyResumeStructuredData();
    return normalizeSeed(structuredClone(raw));
  }, [approved, session]);

  const hasWorkflowContext = Boolean(approved || session);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <PencilRuler className="h-3 w-3 text-primary" />
          Step 6 — Editor & export
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Polish and download</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Edit structured fields on the left; preview updates live on the right. PDF export uses a
          single-column Helvetica layout without graphics so parsers can read the text.
        </p>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="download" />

      {!hasWorkflowContext && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              No reviewed resume loaded yet. Start from a job analysis and enhancement, or begin from a
              blank draft below.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.app.jobIntake}>Job description</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.app.resumeDiff}>Diff & review</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ResumeEditorWorkspace seed={seed} />
    </div>
  );
}

export default ResumeEditorPage;
