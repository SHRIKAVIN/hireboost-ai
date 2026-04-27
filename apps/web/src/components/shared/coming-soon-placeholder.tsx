import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonPlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  phase: string;
  icon: LucideIcon;
  cta?: { label: string; to: string };
}

/**
 * Reusable "this screen is fully wired in a later phase" placeholder.
 * Shipped intentionally so every route in the nav has a real, polished page.
 */
export function ComingSoonPlaceholder({
  eyebrow,
  title,
  description,
  phase,
  icon: Icon,
  cta,
}: ComingSoonPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:gap-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <div className="flex-1 space-y-2">
            <Badge variant="secondary">Lands in {phase}</Badge>
            <p className="text-sm text-muted-foreground">
              The interactive flow for this screen is implemented incrementally as we work
              through the build plan. Layout, theming, and navigation are already in place.
            </p>
          </div>
          {cta && (
            <Button asChild variant="primary">
              <Link to={cta.to}>
                <span>{cta.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
