import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/components/layout/app-shell';
import { AuthShell } from '@/components/layout/auth-shell';
import { MarketingShell } from '@/components/layout/marketing-shell';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { PageLoader } from '@/components/shared/page-loader';

import { ROUTES } from './paths';

/* ----------------------------- Lazy routes ----------------------------- */

// Marketing
const LandingPage = lazy(() => import('@/features/marketing/pages/landing'));
const PricingPage = lazy(() => import('@/features/marketing/pages/pricing'));
const TestimonialsPage = lazy(() => import('@/features/marketing/pages/testimonials'));
const ContactPage = lazy(() => import('@/features/marketing/pages/contact'));

// Auth
const LoginPage = lazy(() => import('@/features/auth/pages/login'));
const RegisterPage = lazy(() => import('@/features/auth/pages/register'));

// App (private)
const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard'));
const JobIntakePage = lazy(() => import('@/features/job-intake/pages/job-intake'));
const ResumeUploadPage = lazy(() => import('@/features/resume-upload/pages/resume-upload'));
const AtsReviewPage = lazy(() => import('@/features/ats-review/pages/ats-review'));
const ResumeDiffPage = lazy(() => import('@/features/resume-diff/pages/resume-diff'));
const ResumeEditorPage = lazy(() => import('@/features/resume-editor/pages/resume-editor'));
const ProfilePage = lazy(() => import('@/features/profile/pages/profile'));
const SettingsPage = lazy(() => import('@/features/settings/pages/settings'));

// Misc
const NotFoundPage = lazy(() => import('@/routes/not-found'));

/* ------------------------- Suspense wrapper ---------------------------- */

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

/* ------------------------------ Router --------------------------------- */

export const router = createBrowserRouter([
  {
    element: <MarketingShell />,
    children: [
      { path: ROUTES.marketing.home, element: withSuspense(<LandingPage />) },
      { path: ROUTES.marketing.pricing, element: withSuspense(<PricingPage />) },
      { path: ROUTES.marketing.testimonials, element: withSuspense(<TestimonialsPage />) },
      { path: ROUTES.marketing.contact, element: withSuspense(<ContactPage />) },
    ],
  },
  {
    element: <AuthShell />,
    children: [
      { path: ROUTES.auth.login, element: withSuspense(<LoginPage />) },
      { path: ROUTES.auth.register, element: withSuspense(<RegisterPage />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/app', element: <Navigate to={ROUTES.app.dashboard} replace /> },
          { path: ROUTES.app.dashboard, element: withSuspense(<DashboardPage />) },
          { path: ROUTES.app.jobIntake, element: withSuspense(<JobIntakePage />) },
          { path: ROUTES.app.resumeUpload, element: withSuspense(<ResumeUploadPage />) },
          { path: ROUTES.app.atsReview, element: withSuspense(<AtsReviewPage />) },
          { path: ROUTES.app.resumeDiff, element: withSuspense(<ResumeDiffPage />) },
          { path: ROUTES.app.resumeEditor, element: withSuspense(<ResumeEditorPage />) },
          { path: ROUTES.app.profile, element: withSuspense(<ProfilePage />) },
          { path: ROUTES.app.settings, element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);
