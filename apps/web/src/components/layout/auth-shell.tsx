import { ArrowLeft, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/paths';

const highlights = [
  {
    icon: Workflow,
    title: 'Job-description-first workflow',
    body: 'Anchor every analysis on the role you actually want.',
  },
  {
    icon: Sparkles,
    title: 'AI rewrites with measurable impact',
    body: 'Stronger summaries, sharper bullets, recruiter-ready phrasing.',
  },
  {
    icon: ShieldCheck,
    title: 'ATS-safe by default',
    body: 'Formatting, keywords, and structure scored against the JD.',
  },
];

export function AuthShell() {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:flex lg:flex-col lg:justify-between lg:p-12 text-white">
        <div className="absolute inset-0 bg-grid opacity-15" aria-hidden />
        <div className="relative flex items-center gap-2">
          <Logo size="md" showWordmark={false} />
          <span className="font-display text-lg font-semibold tracking-tight">HireBoost AI</span>
        </div>
        <div className="relative max-w-md space-y-8">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
            Land more interviews with a resume that&rsquo;s tailored, scored, and ATS-ready.
          </h2>
          <ul className="space-y-5">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <li key={h.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium">{h.title}</p>
                    <p className="text-sm text-white/80">{h.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="relative text-xs text-white/70">
          © {new Date().getFullYear()} HireBoost AI. Built for candidates and recruiters.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to={ROUTES.marketing.home}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back to site</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
