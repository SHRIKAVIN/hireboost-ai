import type { JobAnalysis } from '@hireboost/shared';
import type { ComponentType } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Lightbulb,
  ListX,
  Target,
  Type,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface AtsResultsPanelProps {
  analysis: JobAnalysis;
  className?: string;
}

export function AtsResultsPanel({ analysis, className }: AtsResultsPanelProps) {
  const hasRun = analysis.atsScore !== undefined;

  if (!hasRun) return null;

  const score = analysis.atsScore ?? 0;
  const match = analysis.matchPercent ?? 0;

  return (
    <div className={cn('space-y-5 animate-fade-in', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreTile label="ATS score" value={score} hint="Keyword fit, structure, bullets" />
        <ScoreTile label="Keyword match" value={match} hint="JD terms found in your resume" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListCard
          icon={ListX}
          title="Missing keywords"
          subtitle="From the job description — add naturally in context."
          items={analysis.missingKeywords ?? []}
          empty="No obvious gaps — great keyword coverage."
          variant="warning"
        />
        <ListCard
          icon={Target}
          title="Skill gaps"
          subtitle="Must-have skills from the JD not clearly reflected."
          items={analysis.skillGaps ?? []}
          empty="Core skills appear covered."
          variant="destructive"
        />
        <ListCard
          icon={FileWarning}
          title="Weak bullets"
          subtitle="Heuristic flags — shorten, quantify, or strengthen."
          items={analysis.weakBullets ?? []}
          empty="No major bullet issues detected."
          variant="default"
        />
        <ListCard
          icon={Type}
          title="Formatting & structure"
          subtitle="ATS-friendly layout signals."
          items={analysis.formattingSuggestions ?? []}
          empty="Structure looks solid."
          variant="secondary"
        />
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex gap-3 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div className="min-w-0 space-y-2">
            <h3 className="text-sm font-semibold">Suggestions</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {(analysis.aiSuggestions ?? []).map((t, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  const tone =
    value >= 75 ? 'text-success' : value >= 50 ? 'text-warning' : 'text-destructive';
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn('font-display text-4xl font-bold tabular-nums', tone)}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ListCard({
  icon: Icon,
  title,
  subtitle,
  items,
  empty,
  variant,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  items: string[];
  empty: string;
  variant: 'default' | 'secondary' | 'warning' | 'destructive';
}) {
  const isEmpty = items.length === 0;
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-sm font-semibold leading-tight">{title}</h4>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {isEmpty ? (
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {empty}
          </p>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2 leading-snug">
                <AlertTriangle
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                    variant === 'destructive' && 'text-destructive',
                    variant === 'warning' && 'text-warning',
                    variant === 'default' && 'text-primary',
                    variant === 'secondary' && 'text-muted-foreground',
                  )}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
