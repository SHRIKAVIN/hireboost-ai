import type { JobAnalysisListItem, SeniorityLevel } from '@hireboost/shared';
import { SeniorityLevel as SeniorityLevelEnum } from '@hireboost/shared';
import { Clock, History, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { formatApiError } from '@/lib/api-client';

import { useDeleteJobAnalysis, useJobAnalysesList } from '../hooks/use-job-intake';

const SENIORITY_LABEL: Record<SeniorityLevel, string> = {
  [SeniorityLevelEnum.Intern]: 'Intern',
  [SeniorityLevelEnum.Junior]: 'Junior',
  [SeniorityLevelEnum.Mid]: 'Mid',
  [SeniorityLevelEnum.Senior]: 'Senior',
  [SeniorityLevelEnum.Lead]: 'Lead',
  [SeniorityLevelEnum.Principal]: 'Principal',
  [SeniorityLevelEnum.Director]: 'Director',
};

interface RecentAnalysesListProps {
  selectedId: string | null;
  onSelect: (item: JobAnalysisListItem) => void;
}

export function RecentAnalysesList({ selectedId, onSelect }: RecentAnalysesListProps) {
  const { data, isLoading, isError, error } = useJobAnalysesList(10);
  const deleteMutation = useDeleteJobAnalysis();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) return <SkeletonList />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-destructive">
            Couldn't load recent analyses.
            <span className="block text-xs text-muted-foreground">{formatApiError(error)}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <History className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium">No analyses yet</p>
          <p className="text-xs text-muted-foreground">
            Paste a JD to start your first analysis. We'll keep your last 10 here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Analysis removed');
    } catch (err) {
      toast.error('Could not delete', { description: formatApiError(err) });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isDeleting = deletingId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'group block w-full rounded-xl border bg-card p-4 text-left shadow-soft transition-all',
                'hover:-translate-y-0.5 hover:shadow-elevated',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-border',
                isDeleting && 'pointer-events-none opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {item.extractedRole}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.jobDescriptionPreview}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Delete analysis"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(e, item.id)}
                  loading={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {SENIORITY_LABEL[item.seniorityLevel]}
                </Badge>
                {item.topSkills.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] font-normal">
                    {s}
                  </Badge>
                ))}
                {item.topSkills.length > 3 && (
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                    +{item.topSkills.length - 3}
                  </Badge>
                )}
              </div>

              <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatRelative(item.createdAt)}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Card>
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-1.5">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

/** Lightweight relative-time formatter — avoids pulling in date-fns. */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
