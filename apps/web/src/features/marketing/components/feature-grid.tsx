import {
  FileSearch,
  GitCompare,
  PencilRuler,
  ScanSearch,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    icon: ScanSearch,
    title: 'Job-description-first',
    body: 'Paste any JD. We extract role, seniority, must-have skills, and tooling — all before you upload a resume.',
  },
  {
    icon: FileSearch,
    title: 'ATS scoring you can trust',
    body: 'Deterministic engine for keyword coverage, formatting, and section completeness — augmented by AI explanations.',
  },
  {
    icon: Sparkles,
    title: 'AI bullet rewrites',
    body: 'Weak bullets become measurable, role-aligned wins. Summaries get rewritten for the exact job in front of you.',
  },
  {
    icon: GitCompare,
    title: 'Side-by-side diff',
    body: 'See exactly what changed. Highlighted edits, added keywords, before/after summaries, and section accept/reject.',
  },
  {
    icon: PencilRuler,
    title: 'Recruiter-grade editor',
    body: 'Structured form on the left, live preview on the right. Pick a template. Export a clean, ATS-safe PDF.',
  },
  {
    icon: Target,
    title: 'Skill gap analysis',
    body: 'Quantified match %, missing keywords, and a focused list of skills that move the needle for this role.',
  },
];

export function FeatureGrid() {
  return (
    <section className="container py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Everything you need to ship the right resume, fast.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Built around how recruiters actually screen — keyword fit, measurable impact, and
          formatting that doesn&rsquo;t break the ATS.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="group transition-shadow hover:shadow-elevated">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
