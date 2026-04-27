import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/paths';

export function CtaSection() {
  return (
    <section className="container py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white sm:p-14">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to ship a resume worth interviewing?
          </h2>
          <p className="mt-4 text-white/85">
            Start with a job description, finish with a recruiter-grade PDF. Free to try.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-foreground">
              <Link to={ROUTES.auth.register}>
                <span>Create free account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <Link to={ROUTES.marketing.contact}>Talk to us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
