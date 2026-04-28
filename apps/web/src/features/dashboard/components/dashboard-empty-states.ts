import { ROUTES } from '@/routes/paths';

export const dashboardEmptyStates = {
  recentAnalyses: {
    title: 'No analyses yet',
    description: 'Paste a job description to kick off your first ATS review.',
    cta: { label: 'Analyze a JD', to: ROUTES.app.jobIntake },
  },
  recentResumes: {
    title: 'No resumes uploaded',
    description: 'Drop in a PDF or DOCX to get a structured, editable version.',
    cta: { label: 'Upload resume', to: ROUTES.app.resumeUpload },
  },
} as const;
