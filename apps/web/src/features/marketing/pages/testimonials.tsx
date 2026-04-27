import { Quote, Star } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'I rewrote my resume against a senior PM listing in 12 minutes. Two interviews scheduled the next day. The diff view is what sold me — I knew exactly what changed and why.',
    name: 'Priya Menon',
    role: 'Senior Product Manager',
    rating: 5,
  },
  {
    quote:
      'The ATS scoring is the closest I have seen to what real resume parsers do. The keyword gap report alone is worth the subscription.',
    name: 'Marcus Lee',
    role: 'Engineering Manager',
    rating: 5,
  },
  {
    quote:
      'I run a coaching practice with 40+ clients. HireBoost cut my review time in half without sacrificing the personal touch.',
    name: 'Aisha Khan',
    role: 'Career Coach',
    rating: 5,
  },
  {
    quote:
      'Resume builders before this felt like Word with extra steps. The job-description-first flow finally makes my resume targeted, not generic.',
    name: 'Daniel Ortiz',
    role: 'Data Scientist',
    rating: 5,
  },
  {
    quote:
      'The AI-rewritten bullets sound like me, just sharper. No corporate fluff, no fake metrics. That alone is rare.',
    name: 'Hannah Park',
    role: 'UX Designer',
    rating: 5,
  },
  {
    quote:
      'The editor + live preview is exactly the experience I want. Clean PDF in one click. Recruiters notice.',
    name: 'Jordan Reyes',
    role: 'Software Engineer',
    rating: 5,
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function TestimonialsPage() {
  return (
    <div className="container py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Loved by people who land jobs.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Real candidates, coaches, and hiring leaders. No paid endorsements, no scripted quotes.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-5 p-6">
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="text-sm text-foreground/90">{t.quote}</p>
              <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials(t.name)}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TestimonialsPage;
