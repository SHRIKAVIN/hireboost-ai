import { PencilRuler } from 'lucide-react';

import { ComingSoonPlaceholder } from '@/components/shared/coming-soon-placeholder';
import {
  DEFAULT_WORKFLOW_STEPS,
  WorkflowStepper,
} from '@/components/shared/workflow-stepper';
import { ROUTES } from '@/routes/paths';

export function ResumeEditorPage() {
  return (
    <div className="space-y-8">
      <WorkflowStepper steps={DEFAULT_WORKFLOW_STEPS} currentStepId="preview-edit" />
      <ComingSoonPlaceholder
        eyebrow="Step 5 — Editor & Preview"
        title="Polish content, pick a template, export PDF"
        description="Structured form on the left, live preview on the right. ATS-safe templates, inline edits, and a clean PDF export."
        phase="Phase 10"
        icon={PencilRuler}
        cta={{ label: 'Open diff view', to: ROUTES.app.resumeDiff }}
      />
    </div>
  );
}

export default ResumeEditorPage;
