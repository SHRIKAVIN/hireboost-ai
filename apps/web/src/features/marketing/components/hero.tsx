import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/paths';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-fade" aria-hidden />
      <div className="absolute inset-x-0 top-0 -z-10 h-[480px] bg-grid" aria-hidden />

      <div className="container relative pb-20 pt-16 sm:pt-24 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <Badge variant="default" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resume + ATS + AI in one workflow</span>
          </Badge>

          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Tailor your resume to any job.
            <span className="block bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Land the interview.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            HireBoost AI starts with the job description, then scores your resume against it,
            rewrites weak bullets, fills keyword gaps, and ships a recruiter-ready PDF — all in
            one guided workflow.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="primary">
              <Link to={ROUTES.auth.register}>
                <span>Boost my resume</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.marketing.pricing}>See pricing</Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-success" />
            No credit card needed · Free ATS analysis on every plan
          </div>
        </motion.div>

        {/* Workflow card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="rounded-2xl border border-border bg-card p-2 shadow-elevated">
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { i: 1, t: 'Job Description', d: 'Paste the JD' },
                  { i: 2, t: 'Upload Resume', d: 'PDF or DOCX' },
                  { i: 3, t: 'Review Changes', d: 'AI improvements' },
                  { i: 4, t: 'Preview & Edit', d: 'Polish content' },
                  { i: 5, t: 'Download', d: 'Export PDF' },
                ].map((s) => (
                  <div
                    key={s.i}
                    className="rounded-lg border border-border bg-card p-4 text-left shadow-soft"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {s.i}
                    </span>
                    <p className="mt-3 text-sm font-medium">{s.t}</p>
                    <p className="text-xs text-muted-foreground">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
