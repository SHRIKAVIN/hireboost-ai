import type { ResumeStructuredData } from '@hireboost/shared';
import { Briefcase, GraduationCap, Link2, Mail, MapPin, Phone, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export type ResumeTemplateId = 'classic' | 'minimal';

interface ResumePreviewPaneProps {
  data: ResumeStructuredData;
  template: ResumeTemplateId;
  className?: string;
}

export function ResumePreviewPane({ data, template, className }: ResumePreviewPaneProps) {
  const minimal = template === 'minimal';

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-soft overflow-hidden',
        minimal ? 'text-[13px] leading-relaxed' : 'text-[13px] leading-snug',
        className,
      )}
    >
      <div
        className={cn(
          'border-b border-border px-6 py-5',
          minimal ? 'bg-muted/30' : 'bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent',
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              minimal ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary',
            )}
          >
            <User className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Live preview
            </p>
            <h2
              className={cn(
                'font-bold tracking-tight text-foreground mt-0.5',
                minimal ? 'text-xl' : 'font-display text-2xl',
              )}
            >
              {data.basics.fullName.trim() || 'Your name'}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {data.basics.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {data.basics.email}
                </span>
              )}
              {data.basics.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {data.basics.phone}
                </span>
              )}
              {data.basics.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {data.basics.location}
                </span>
              )}
            </div>
            {data.basics.links && data.basics.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.basics.links.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs text-primary">
                    <Link2 className="h-3 w-3" />
                    {l.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{data.skills.length} skills</Badge>
          <Badge variant="outline">{data.experience.length} roles</Badge>
          <Badge variant="outline">{data.education.length} education</Badge>
        </div>
      </div>

      <div className="space-y-6 px-6 py-5 max-h-[min(70vh,720px)] overflow-y-auto">
        {data.summary.trim() && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Summary
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{data.summary}</p>
          </section>
        )}

        {data.skills.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              <Briefcase className="h-3.5 w-3.5" />
              Experience
            </h3>
            <div className="space-y-5">
              {data.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-primary/25 pl-3">
                  <p className="font-semibold text-sm">
                    {exp.role}
                    {exp.company ? ` · ${exp.company}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  {exp.bullets.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-foreground">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              <GraduationCap className="h-3.5 w-3.5" />
              Education
            </h3>
            <div className="space-y-3 text-sm">
              {data.education.map((ed, i) => (
                <div key={i}>
                  <p className="font-medium">{ed.institution}</p>
                  <p className="text-muted-foreground text-xs">
                    {[ed.degree, ed.field].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                  </p>
                  {ed.details && <p className="mt-1 text-sm">{ed.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Projects
            </h3>
            <div className="space-y-4 text-sm">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <p className="font-semibold">{p.name}</p>
                  {p.url && <p className="text-xs text-primary break-all">{p.url}</p>}
                  {p.description && <p className="text-muted-foreground mt-1">{p.description}</p>}
                  {p.bullets.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      {p.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.certifications.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Certifications
            </h3>
            <ul className="space-y-2 text-sm">
              {data.certifications.map((c, i) => (
                <li key={i}>
                  <span className="font-medium">{c.name}</span>
                  {c.issuer && <span className="text-muted-foreground"> · {c.issuer}</span>}
                  {c.issueDate && <span className="text-xs text-muted-foreground"> ({c.issueDate})</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
