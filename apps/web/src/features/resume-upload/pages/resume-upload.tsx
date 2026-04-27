import { Upload } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';
import {
  DEFAULT_WORKFLOW_STEPS,
  WorkflowStepper,
} from '@/components/shared/workflow-stepper';
import { ROUTES } from '@/routes/paths';

export function ResumeUploadPage() {
  return (
    <div className="space-y-8">
      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="upload-resume" />
      <ComingSoonPlaceholder
        eyebrow="Step 2 — Upload Resume"
        title="Drop in your current resume"
        description="PDF or DOCX. We'll extract every section automatically and run the analysis against the JD you just analyzed."
        phase="Phase 6"
        icon={Upload}
        cta={{ label: 'Analyze a JD first', to: ROUTES.app.jobIntake }}
      />
    </div>
  );
}

export default ResumeUploadPage;
