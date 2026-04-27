import { ArrowRight, Download, FileText, Sparkles, Upload } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: '1. Drop in the job description',
    body: 'We pull out role, seniority, required skills, tools, and keywords automatically.',
  },
  {
    icon: Upload,
    title: '2. Upload your resume',
    body: 'PDF or DOCX. We extract structured sections and raw text for analysis.',
  },
  {
    icon: Sparkles,
    title: '3. Review the AI improvements',
    body: 'See your ATS score, fill keyword gaps, and approve rewritten bullets in a clean diff.',
  },
  {
    icon: Download,
    title: '4. Edit, preview, and export',
    body: 'Tweak anything in the structured editor and ship a recruiter-ready PDF.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="container py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            A guided workflow, not a blank canvas.
          </h2>
          <p className="mt-4 text-muted-foreground">
            HireBoost AI walks you from job description to download in five focused steps.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.title}
                className="relative flex flex-col gap-3 rounded-xl border border-border bg-background p-6 shadow-soft"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>

                {i < steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground lg:block"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
