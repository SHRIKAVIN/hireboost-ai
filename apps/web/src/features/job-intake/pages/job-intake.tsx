import { Sparkles } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';
import {
  DEFAULT_WORKFLOW_STEPS,
  WorkflowStepper,
} from '@/components/shared/workflow-stepper';
import { ROUTES } from '@/routes/paths';

export function JobIntakePage() {
  return (
    <div className="space-y-8">
      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="job-description" />
      <ComingSoonPlaceholder
        eyebrow="Step 1 — Job Description"
        title="Paste the job you're targeting"
        description="The entire workflow is anchored on the JD. We'll extract role, seniority, must-have skills, tools, and keywords before you upload a resume."
        phase="Phase 5"
        icon={Sparkles}
        cta={{ label: 'Back to dashboard', to: ROUTES.app.dashboard }}
      />
    </div>
  );
}

export default JobIntakePage;
