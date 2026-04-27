import { GitCompare } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';
import {
  DEFAULT_WORKFLOW_STEPS,
  WorkflowStepper,
} from '@/components/shared/workflow-stepper';
import { ROUTES } from '@/routes/paths';

export function ResumeDiffPage() {
  return (
    <div className="space-y-8">
      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="review-changes" />
      <ComingSoonPlaceholder
        eyebrow="Step 4 — Resume Diff"
        title="See what changed, accept what you like"
        description="Side-by-side on desktop, stacked on mobile. Highlighted edits, added keyword chips, before/after summaries, and per-section accept/reject."
        phase="Phase 9"
        icon={GitCompare}
        cta={{ label: 'Open ATS review', to: ROUTES.app.atsReview }}
      />
    </div>
  );
}

export default ResumeDiffPage;
