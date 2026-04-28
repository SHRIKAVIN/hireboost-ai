import type { Resume } from '@hireboost/shared';
import {
  ArrowRight,
  Award,
  Briefcase,
  Code2,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

import { resumeApi } from '../api/resume-api';
import { fileTypeLabel, formatFileSize } from '../lib/format';

interface ParsedResumePreviewProps {
  resume: Resume;
  onReset?: () => void;
  className?: string;
}

/**
 * Premium presentation of the structured data we parsed out of the resume.
 *
 * The layout intentionally mirrors `AnalysisResult` (Phase 5) so the user
 * sees a consistent "we extracted X, Y, Z" experience across each step.
 */
export function ParsedResumePreview({
  resume,
  onReset,
  className,
}: ParsedResumePreviewProps) {
  const { parsedData, originalFileName, mimeType, fileSize } = resume;
  const skillsEmpty = parsedData.skills.length === 0;
  const expEmpty = parsedData.experience.length === 0;
  const eduEmpty = parsedData.education.length === 0;
  const projEmpty = parsedData.projects.length === 0;
  const certEmpty = parsedData.certifications.length === 0;

  return (
    <div className={cn('space-y-5 animate-fade-in', className)}>
      {/* Summary bar */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                Parsed resume
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {parsedData.basics.fullName || 'Unnamed candidate'}
              </h3>
              <ContactStrip resume={resume} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="default" className="gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {parsedData.skills.length} skills
                </Badge>
                <Badge variant="secondary">
                  {parsedData.experience.length} roles
                </Badge>
                <Badge variant="outline">
                  {parsedData.education.length} education
                </Badge>
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {fileTypeLabel(mimeType)} · {formatFileSize(fileSize)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button asChild variant="ghost" size="sm">
              <a
                href={resumeApi.getOriginalFileUrl(resume.id)}
                target="_blank"
                rel="noreferrer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download {fileTypeLabel(mimeType)}</span>
              </a>
            </Button>
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Upload another
              </Button>
            )}
            <Button asChild variant="primary">
              <Link to={ROUTES.app.atsReview}>
                <span>Run ATS review</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Filename strip */}
        <div className="border-t border-border bg-secondary/30 px-6 py-2.5">
          <p className="truncate text-xs text-muted-foreground" title={originalFileName}>
            <span className="font-medium text-foreground/80">File:</span> {originalFileName}
          </p>
        </div>
      </Card>

      {/* Summary */}
      {parsedData.summary && (
        <Section icon={Sparkles} title="Summary" subtitle="Top of your resume.">
          <p className="text-sm leading-relaxed text-foreground/90">
            {parsedData.summary}
          </p>
        </Section>
      )}

      {/* Skills + Experience two-column on lg */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Section
          icon={Code2}
          title="Skills"
          subtitle="Tokens we pulled from your skills section."
          empty={skillsEmpty}
          emptyMessage="No skills section detected. Add a clear 'Skills' heading to improve parsing."
        >
          <div className="flex flex-wrap gap-1.5">
            {parsedData.skills.map((s) => (
              <Badge key={s} variant="default" className="font-normal">
                {s}
              </Badge>
            ))}
          </div>
        </Section>

        <Section
          icon={Briefcase}
          title="Experience"
          subtitle={`${parsedData.experience.length} role${
            parsedData.experience.length === 1 ? '' : 's'
          } detected.`}
          empty={expEmpty}
          emptyMessage="No work history could be detected."
        >
          <ol className="space-y-4">
            {parsedData.experience.map((exp, i) => (
              <li
                key={i}
                className="relative rounded-lg border border-border/60 bg-secondary/30 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {exp.role || 'Role'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[exp.company, exp.location].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {formatRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-foreground/85">
                    {exp.bullets.slice(0, 6).map((b, j) => (
                      <li key={j} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                    {exp.bullets.length > 6 && (
                      <li className="pl-3 text-[11px] italic text-muted-foreground">
                        +{exp.bullets.length - 6} more bullets
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* Education + Projects */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          icon={GraduationCap}
          title="Education"
          empty={eduEmpty}
          emptyMessage="No education entries detected."
        >
          <ul className="space-y-3">
            {parsedData.education.map((edu, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                <p className="text-sm font-semibold leading-tight">
                  {edu.institution || 'Institution'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[edu.degree, edu.field].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {formatRange(edu.startDate, edu.endDate, false)}
                </p>
                {edu.details && (
                  <p className="mt-2 text-xs text-foreground/80">{edu.details}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={Code2}
          title="Projects"
          empty={projEmpty}
          emptyMessage="No projects section detected."
        >
          <ul className="space-y-3">
            {parsedData.projects.map((p, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight">
                    {p.name || 'Project'}
                  </p>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Link</span>
                    </a>
                  )}
                </div>
                {p.description && (
                  <p className="mt-1 text-xs text-foreground/80">{p.description}</p>
                )}
                {p.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                    {p.bullets.slice(0, 4).map((b, j) => (
                      <li key={j} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary/70"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Certifications */}
      {!certEmpty && (
        <Section icon={Award} title="Certifications">
          <ul className="grid gap-2 sm:grid-cols-2">
            {parsedData.certifications.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Award className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  {c.issuer && (
                    <p className="truncate text-xs text-muted-foreground">{c.issuer}</p>
                  )}
                  {c.issueDate && (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {c.issueDate}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Internal pieces                               */
/* -------------------------------------------------------------------------- */

function ContactStrip({ resume }: { resume: Resume }) {
  const { basics } = resume.parsedData;
  const items: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [];

  if (basics.email) items.push({ icon: Mail, label: basics.email });
  if (basics.phone) items.push({ icon: Phone, label: basics.phone });
  if (basics.location) items.push({ icon: MapPin, label: basics.location });

  if (items.length === 0 && (basics.links?.length ?? 0) === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {items.map(({ icon: Icon, label }, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <Icon className="h-3 w-3" />
          <span>{label}</span>
        </span>
      ))}
      {(basics.links ?? []).map((link, i) => (
        <a
          key={`l-${i}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}

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

function formatRange(
  start: string | undefined,
  end: string | undefined,
  current: boolean | undefined,
): string {
  const left = start || '';
  const right = current ? 'Present' : end || '';
  if (left && right) return `${left} — ${right}`;
  return left || right || '—';
}
