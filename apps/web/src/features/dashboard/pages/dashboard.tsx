import { Activity, FileSearch, FileText, Target } from 'lucide-react';

import { DEFAULT_WORKFLOW_STEPS } from '@/components/shared/workflow-stepper-data';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';

import { QuickActions } from '../components/quick-actions';
import { dashboardEmptyStates } from '../components/dashboard-empty-states';
import { RecentEmptyState } from '../components/recent-empty-state';
import { StatCard } from '../components/stat-card';

export function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick up where you left off, or start a new tailored resume in five focused steps.
          </p>
        </div>
      </div>

      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="job-description" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Resumes"
          value="0"
          hint="Upload your first one"
        />
        <StatCard
          icon={FileSearch}
          label="ATS reviews"
          value="0"
          hint="No analyses yet"
        />
        <StatCard
          icon={Target}
          label="Avg. match"
          value="—"
          hint="Run an analysis to see"
        />
        <StatCard
          icon={Activity}
          label="Active workflow"
          value="Job Description"
          hint="Step 1 of 5"
        />
      </div>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </h2>
        <QuickActions />
      </section>

      {/* Recent activity */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent analyses
          </h2>
          <RecentEmptyState {...dashboardEmptyStates.recentAnalyses} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent resumes
          </h2>
          <RecentEmptyState {...dashboardEmptyStates.recentResumes} />
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
