import type { ResumeBasics, ResumeStructuredData } from '@hireboost/shared';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

import {
  type BulletChange,
  type TextChange,
  buildStructuredResumeDiff,
  countStructuralChanges,
} from '../lib/build-resume-diff';

function DiffText({ change, className }: { change: TextChange; className?: string }) {
  if (change.status === 'unchanged') {
    return <p className={cn('text-sm', className)}>{change.value || '—'}</p>;
  }
  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <p className="rounded-md border border-rose-500/25 bg-rose-500/[0.06] px-2 py-1.5 line-through decoration-rose-500/50">
        {change.before || '—'}
      </p>
      <p className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] px-2 py-1.5">
        {change.after || '—'}
      </p>
    </div>
  );
}

function BulletList({ bullets }: { bullets: BulletChange[] }) {
  if (bullets.length === 0) return <p className="text-xs text-muted-foreground">No bullets</p>;
  return (
    <ul className="space-y-2">
      {bullets.map((b, i) => {
        if (b.status === 'same') {
          return (
            <li key={i} className="text-sm text-foreground">
              {b.text}
            </li>
          );
        }
        if (b.status === 'removed') {
          return (
            <li
              key={i}
              className="text-sm line-through decoration-rose-500/50 text-muted-foreground border-l-2 border-rose-500/40 pl-2"
            >
              {b.text}
            </li>
          );
        }
        if (b.status === 'added') {
          return (
            <li
              key={i}
              className="text-sm border-l-2 border-emerald-500/50 pl-2 bg-emerald-500/[0.04] rounded-r"
            >
              {b.text}
            </li>
          );
        }
        return (
          <li key={i} className="space-y-1.5">
            <p className="text-sm line-through decoration-rose-500/40 text-muted-foreground">{b.before}</p>
            <p className="text-sm text-foreground">{b.after}</p>
          </li>
        );
      })}
    </ul>
  );
}

function LinksDiff({ before, after, equal }: { before: ResumeBasics['links']; after: ResumeBasics['links']; equal: boolean }) {
  const b = before ?? [];
  const a = after ?? [];
  if (equal) {
    if (a.length === 0) return <p className="text-xs text-muted-foreground">No links</p>;
    return (
      <ul className="text-sm space-y-1">
        {a.map((l, i) => (
          <li key={i}>
            <span className="font-medium">{l.label}</span>{' '}
            <span className="text-muted-foreground break-all">{l.url}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-sm">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Before</p>
        <ul className="space-y-1 opacity-80">
          {b.length === 0 && <li className="text-muted-foreground">—</li>}
          {b.map((l, i) => (
            <li key={i} className="line-through decoration-rose-500/40">
              {l.label}: {l.url}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">After</p>
        <ul className="space-y-1">
          {a.length === 0 && <li className="text-muted-foreground">—</li>}
          {a.map((l, i) => (
            <li key={i} className="text-emerald-700 dark:text-emerald-400">
              {l.label}: {l.url}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {badge}
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open && <CardContent className="border-t border-border px-4 pb-4 pt-3">{children}</CardContent>}
    </Card>
  );
}

export interface StructuredResumeDiffViewProps {
  before: ResumeStructuredData;
  after: ResumeStructuredData;
}

export function StructuredResumeDiffView({ before, after }: StructuredResumeDiffViewProps) {
  const diff = useMemo(() => buildStructuredResumeDiff(before, after), [before, after]);
  const changeCount = useMemo(() => countStructuralChanges(diff), [diff]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        About <span className="font-semibold text-foreground">{changeCount}</span> structural edits detected
        (normalized text comparison). Green highlights additions, strikethrough shows removals.
      </p>

      <CollapsibleSection title="Contact & links" badge={!diff.basics.linksEqual ? 'Links' : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Name</p>
            <DiffText change={diff.basics.fullName} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Email</p>
            <DiffText change={diff.basics.email} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Phone</p>
            <DiffText change={diff.basics.phone} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Location</p>
            <DiffText change={diff.basics.location} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Links</p>
          <LinksDiff before={diff.basics.links.before} after={diff.basics.links.after} equal={diff.basics.linksEqual} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Professional summary" badge={diff.summary.status === 'changed' ? 'Edited' : undefined}>
        <DiffText change={diff.summary} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Skills"
        badge={
          diff.skills.added.length + diff.skills.removed.length > 0
            ? `+${diff.skills.added.length} / −${diff.skills.removed.length}`
            : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {diff.skills.removed.map((s) => (
            <span
              key={`r-${s}`}
              className="rounded-md border border-rose-500/30 bg-rose-500/[0.07] px-2 py-0.5 text-xs line-through decoration-rose-500/50"
            >
              {s}
            </span>
          ))}
          {diff.skills.unchanged.map((s) => (
            <span key={`k-${s}`} className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs">
              {s}
            </span>
          ))}
          {diff.skills.added.map((s) => (
            <span
              key={`a-${s}`}
              className="rounded-md border border-emerald-500/35 bg-emerald-500/[0.08] px-2 py-0.5 text-xs font-medium"
            >
              + {s}
            </span>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={`Experience (${diff.experience.length})`}>
        <div className="space-y-6">
          {diff.experience.map((row) => (
            <div
              key={row.index}
              className={cn(
                'rounded-lg border p-3',
                row.rowKind === 'added' && 'border-emerald-500/30 bg-emerald-500/[0.04]',
                row.rowKind === 'removed' && 'border-rose-500/30 bg-rose-500/[0.04]',
                row.rowKind === 'paired' && 'border-border',
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {row.rowKind === 'added' && (
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                    New role
                  </span>
                )}
                {row.rowKind === 'removed' && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-700 dark:text-rose-400">
                    Removed
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Role</p>
                  <DiffText change={row.role} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Company</p>
                  <DiffText change={row.company} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Location</p>
                  <DiffText change={row.location} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Start</p>
                    <DiffText change={row.startDate} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">End</p>
                    <DiffText change={row.endDate} />
                  </div>
                </div>
              </div>
              {!row.current.equal && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  “Current role” flag changed between versions.
                </p>
              )}
              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Bullets</p>
                <BulletList bullets={row.bullets} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={`Education (${diff.education.length})`} defaultOpen={false}>
        <div className="space-y-4">
          {diff.education.map((row) => (
            <div
              key={row.index}
              className={cn(
                'rounded-lg border p-3 text-sm',
                row.rowKind === 'added' && 'border-emerald-500/30',
                row.rowKind === 'removed' && 'border-rose-500/30',
              )}
            >
              <DiffText change={row.institution} />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <DiffText change={row.degree} />
                <DiffText change={row.field} />
                <DiffText change={row.startDate} />
                <DiffText change={row.endDate} />
              </div>
              <div className="mt-2">
                <DiffText change={row.details} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={`Projects (${diff.projects.length})`} defaultOpen={false}>
        <div className="space-y-4">
          {diff.projects.map((row) => (
            <div key={row.index} className="rounded-lg border border-border p-3">
              <DiffText change={row.name} />
              <div className="mt-2">
                <DiffText change={row.description} />
              </div>
              <div className="mt-2">
                <DiffText change={row.url} />
              </div>
              <div className="mt-2">
                <BulletList bullets={row.bullets} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={`Certifications (${diff.certifications.length})`} defaultOpen={false}>
        <div className="space-y-3">
          {diff.certifications.map((row) => (
            <div key={row.index} className="rounded-lg border border-border p-3 text-sm space-y-2">
              <DiffText change={row.name} />
              <div className="grid sm:grid-cols-2 gap-2">
                <DiffText change={row.issuer} />
                <DiffText change={row.issueDate} />
              </div>
              <DiffText change={row.url} />
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
