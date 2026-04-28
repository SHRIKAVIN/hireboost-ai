import type { ResumeListItem } from '@hireboost/shared';
import { ArrowLeft, Briefcase, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import {
  DEFAULT_WORKFLOW_STEPS,
  WorkflowStepper,
} from '@/components/shared/workflow-stepper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobIntakeStore } from '@/features/job-intake/store/job-intake-store';
import { formatApiError } from '@/lib/api-client';
import { ROUTES } from '@/routes/paths';

import { ParsedResumePreview } from '../components/parsed-resume-preview';
import { RecentResumesList } from '../components/recent-resumes-list';
import { ResumeDropzone } from '../components/resume-dropzone';
import { useResume, useUploadResume } from '../hooks/use-resume';
import { useResumeStore } from '../store/resume-store';

export function ResumeUploadPage() {
  const currentResumeId = useResumeStore((s) => s.currentResumeId);
  const setCurrent = useResumeStore((s) => s.setCurrent);
  const clearCurrent = useResumeStore((s) => s.clearCurrent);

  const currentRole = useJobIntakeStore((s) => s.currentRole);
  const currentAnalysisId = useJobIntakeStore((s) => s.currentAnalysisId);

  const [viewingId, setViewingId] = useState<string | null>(currentResumeId);

  const resumeQuery = useResume(viewingId);
  const uploadMutation = useUploadResume();

  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (resumeQuery.data) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [resumeQuery.data?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (file: File) => {
    try {
      const resume = await uploadMutation.mutateAsync({
        file,
        ...(currentAnalysisId && { options: { jobAnalysisId: currentAnalysisId } }),
      });
      setViewingId(resume.id);
      toast.success('Resume parsed', {
        description: `${resume.parsedData.skills.length} skills · ${resume.parsedData.experience.length} roles · ${resume.parsedData.education.length} education entries`,
      });
    } catch (err) {
      toast.error('Could not parse resume', { description: formatApiError(err) });
    }
  };

  const handleSelectRecent = (item: ResumeListItem) => {
    setViewingId(item.id);
    setCurrent({ id: item.id, fileName: item.originalFileName });
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
          Step 2 — Upload Resume
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Drop in your current resume
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          We'll extract every section automatically — basics, summary, skills,
          experience, education, projects, and certifications — and use it as
          the source of truth for the next steps.
        </p>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="upload-resume" />

      {/* Active JD context strip */}
      {currentAnalysisId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                Targeting role
              </p>
              <p className="font-medium">{currentRole || 'Active job description'}</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.app.jobIntake}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to JD</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/[0.06] px-4 py-3 text-sm">
          <p className="text-foreground/80">
            <span className="font-semibold">Tip:</span> analyze a job description first
            so we can tailor the ATS review and AI suggestions to that role.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.app.jobIntake}>Analyze a JD</Link>
          </Button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <ResumeDropzone
            onUpload={handleUpload}
            isUploading={uploadMutation.isPending}
            progress={uploadMutation.progress}
          />

          <div ref={resultRef} className="scroll-mt-8">
            {showResult && resumeQuery.isLoading && <ResultSkeleton />}

            {showResult && resumeQuery.isError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Couldn't load that resume. {formatApiError(resumeQuery.error)}
              </p>
            )}

            {showResult && resumeQuery.data && (
              <ParsedResumePreview
                resume={resumeQuery.data}
                onReset={handleReset}
              />
            )}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your resumes
          </h2>
          <RecentResumesList
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
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-soft"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumeUploadPage;
