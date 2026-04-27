import { ArrowRight, FileSearch, GitCompare, Sparkles, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/routes/paths';

const actions = [
  {
    icon: Sparkles,
    title: 'Analyze a job description',
    body: 'Start the workflow with the role you actually want.',
    to: ROUTES.app.jobIntake,
    accent: 'from-indigo-500/15 to-violet-500/10',
  },
  {
    icon: Upload,
    title: 'Upload a resume',
    body: 'PDF or DOCX — we extract every section automatically.',
    to: ROUTES.app.resumeUpload,
    accent: 'from-fuchsia-500/15 to-pink-500/10',
  },
  {
    icon: FileSearch,
    title: 'Run an ATS review',
    body: 'Score, gaps, weak bullets, formatting flags.',
    to: ROUTES.app.atsReview,
    accent: 'from-emerald-500/15 to-teal-500/10',
  },
  {
    icon: GitCompare,
    title: 'Open the diff view',
    body: 'See exactly what AI changed before you accept.',
    to: ROUTES.app.resumeDiff,
    accent: 'from-amber-500/15 to-orange-500/10',
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.title}
            to={a.to}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-elevated">
              <CardContent className={`relative h-full overflow-hidden bg-gradient-to-br ${a.accent} p-5`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-foreground shadow-soft">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{a.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Continue <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
