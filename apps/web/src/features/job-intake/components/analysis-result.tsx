import type { JobAnalysis, SeniorityLevel } from '@hireboost/shared';
import { SeniorityLevel as SeniorityLevelEnum } from '@hireboost/shared';
import {
  ArrowRight,
  Briefcase,
  Hash,
  ListChecks,
  Star,
  Target,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

const SENIORITY_LABEL: Record<SeniorityLevel, string> = {
  [SeniorityLevelEnum.Intern]: 'Intern',
  [SeniorityLevelEnum.Junior]: 'Junior',
  [SeniorityLevelEnum.Mid]: 'Mid-level',
  [SeniorityLevelEnum.Senior]: 'Senior',
  [SeniorityLevelEnum.Lead]: 'Lead',
  [SeniorityLevelEnum.Principal]: 'Principal / Staff',
  [SeniorityLevelEnum.Director]: 'Director',
};

interface AnalysisResultProps {
  analysis: JobAnalysis;
  onReset?: () => void;
  className?: string;
}

/**
 * Visual rendering of a `JobAnalysis`. Designed so every extracted
 * dimension gets its own labelled section — easy to scan, easy to
 * extend in later phases (Phase 7 ATS + Phase 8 AI suggestions will
 * append additional cards under the same layout).
 */
export function AnalysisResult({ analysis, onReset, className }: AnalysisResultProps) {
  const noSkills = analysis.extractedSkills.length === 0;
  const noKeywords = analysis.extractedKeywords.length === 0;
  const noTools = (analysis.toolsAndTechnologies ?? []).length === 0;
  const noResp = analysis.responsibilities.length === 0;
  const noPref = (analysis.preferredQualifications ?? []).length === 0;

  return (
    <div className={cn('space-y-5 animate-fade-in', className)}>
      {/* Summary bar */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                Detected role
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {analysis.extractedRole}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="default" className="gap-1.5">
                  <Star className="h-3 w-3" />
                  {SENIORITY_LABEL[analysis.seniorityLevel]}
                </Badge>
                <Badge variant="secondary">
                  {analysis.extractedSkills.length} skills
                </Badge>
                <Badge variant="outline">
                  {analysis.extractedKeywords.length} keywords
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Analyze another
              </Button>
            )}
            <Button asChild variant="primary">
              <Link to={ROUTES.app.resumeUpload}>
                <span>Upload resume</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Two-column extraction grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          icon={Target}
          title="Must-have skills"
          subtitle="Matched against our skills dictionary."
          empty={noSkills}
          emptyMessage="No skills detected — try a more detailed JD."
        >
          <ChipList items={analysis.extractedSkills} variant="default" />
        </Section>

        <Section
          icon={Wrench}
          title="Tools & technologies"
          subtitle="Subset of skills that map to specific products or platforms."
          empty={noTools}
          emptyMessage="No specific tools mentioned in this JD."
        >
          <ChipList items={analysis.toolsAndTechnologies ?? []} variant="secondary" />
        </Section>

        <Section
          icon={ListChecks}
          title="Key responsibilities"
          subtitle="What this role does day-to-day."
          empty={noResp}
          emptyMessage="No clear responsibilities section detected."
        >
          <ul className="space-y-2 text-sm">
            {analysis.responsibilities.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                />
                <span className="leading-relaxed text-foreground/90">{r}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={Star}
          title="Nice to have"
          subtitle="Preferred qualifications & bonus skills."
          empty={noPref}
          emptyMessage="No 'nice to have' section detected."
        >
          <ul className="space-y-2 text-sm">
            {(analysis.preferredQualifications ?? []).map((r, i) => (
              <li key={i} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                />
                <span className="leading-relaxed text-foreground/90">{r}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Keywords ribbon */}
      <Section
        icon={Hash}
        title="ATS keywords"
        subtitle="The exact terms an ATS will scan for in your resume."
        empty={noKeywords}
        emptyMessage="No keywords could be extracted."
      >
        <ChipList items={analysis.extractedKeywords} variant="outline" max={40} />
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Section                                   */
/* -------------------------------------------------------------------------- */

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  empty,
  emptyMessage,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-sm font-semibold leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {empty ? (
          <p className="text-xs italic text-muted-foreground">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Chip list                                  */
/* -------------------------------------------------------------------------- */

function ChipList({
  items,
  variant = 'default',
  max,
}: {
  items: string[];
  variant?: 'default' | 'secondary' | 'outline';
  max?: number;
}) {
  const visible = max ? items.slice(0, max) : items;
  const hidden = max ? items.length - visible.length : 0;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item) => (
        <Badge key={item} variant={variant} className="font-normal">
          {item}
        </Badge>
      ))}
      {hidden > 0 && (
        <Badge variant="outline" className="font-normal text-muted-foreground">
          +{hidden} more
        </Badge>
      )}
    </div>
  );
}
