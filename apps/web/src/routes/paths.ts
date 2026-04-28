/**
 * Centralized URL paths. Always use these constants instead of magic strings
 * so that renaming a route is a one-line change.
 */
export const ROUTES = {
  marketing: {
    home: '/',
    pricing: '/pricing',
    testimonials: '/testimonials',
    contact: '/contact',
  },
  auth: {
    login: '/login',
    register: '/register',
    oauthCallback: '/auth/callback',
  },
  app: {
    dashboard: '/app/dashboard',
    jobIntake: '/app/job-description',
    resumeUpload: '/app/resume-upload',
    atsReview: '/app/ats-review',
    aiEnhance: '/app/ai-enhance',
    resumeDiff: '/app/resume-diff',
    resumeEditor: '/app/resume-editor',
    profile: '/app/profile',
    settings: '/app/settings',
  },
} as const;

export type AppRoute =
  | (typeof ROUTES.marketing)[keyof typeof ROUTES.marketing]
  | (typeof ROUTES.auth)[keyof typeof ROUTES.auth]
  | (typeof ROUTES.app)[keyof typeof ROUTES.app];
