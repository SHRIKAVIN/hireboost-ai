export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

/** Default workflow steps as required by the product spec. */
export const DEFAULT_WORKFLOW_STEPS: StepperStep[] = [
  { id: 'job-description', label: 'Job Description', description: 'Paste target JD' },
  { id: 'upload-resume', label: 'Upload Resume', description: 'PDF or DOCX' },
  { id: 'review-changes', label: 'Review Changes', description: 'AI improvements' },
  { id: 'preview-edit', label: 'Preview & Edit', description: 'Polish content' },
  { id: 'download', label: 'Download', description: 'Export PDF' },
];
