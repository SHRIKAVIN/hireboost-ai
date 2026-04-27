import { FileSearch } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';
import {
  DEFAULT_WORKFLOW_STEPS,
  WorkflowStepper,
} from '@/components/shared/workflow-stepper';
import { ROUTES } from '@/routes/paths';

export function AtsReviewPage() {
  return (
    <div className="space-y-8">
      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="review-changes" />
      <ComingSoonPlaceholder
        eyebrow="Step 3 — ATS Review"
        title="Score, gaps, and bullet quality"
        description="ATS score, match %, missing keywords, weak bullets, and formatting flags — anchored on the JD you analyzed."
        phase="Phase 7"
        icon={FileSearch}
        cta={{ label: 'Upload a resume first', to: ROUTES.app.resumeUpload }}
      />
    </div>
  );
}

export default AtsReviewPage;
