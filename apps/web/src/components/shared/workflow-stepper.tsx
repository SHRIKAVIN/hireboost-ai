import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

interface WorkflowStepperProps {
  steps: StepperStep[];
  currentStepId: string;
  className?: string;
}

/**
 * Top progress stepper used across the guided workflow:
 * Job Description → Upload Resume → Review Changes → Preview & Edit → Download
 */
export function WorkflowStepper({ steps, currentStepId, className }: WorkflowStepperProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === currentStepId),
  );

  return (
    <ol
      className={cn(
        'flex w-full items-center gap-2 overflow-x-auto rounded-xl border border-border bg-card p-3 shadow-soft',
        className,
      )}
      aria-label="Workflow progress"
    >
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.id} className="flex min-w-fit flex-1 items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isComplete &&
                    !isCurrent &&
                    'border-border bg-background text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div className="hidden flex-col leading-tight sm:flex">
                <span
                  className={cn(
                    'text-xs font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[11px] text-muted-foreground/80">{step.description}</span>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-px flex-1 transition-colors',
                  isComplete ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Default workflow steps as required by the product spec. */
export const DEFAULT_WORKFLOW_STEPS: StepperStep[] = [
  { id: 'job-description', label: 'Job Description', description: 'Paste target JD' },
  { id: 'upload-resume', label: 'Upload Resume', description: 'PDF or DOCX' },
  { id: 'review-changes', label: 'Review Changes', description: 'AI improvements' },
  { id: 'preview-edit', label: 'Preview & Edit', description: 'Polish content' },
  { id: 'download', label: 'Download', description: 'Export PDF' },
];
