import type { ResumeListItem } from '@hireboost/shared';
import { Clock, FileText, History, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { formatApiError } from '@/lib/api-client';

import { fileTypeLabel, formatFileSize, formatRelative } from '../lib/format';
import { useDeleteResume, useResumesList } from '../hooks/use-resume';

interface RecentResumesListProps {
  selectedId: string | null;
  onSelect: (item: ResumeListItem) => void;
}

export function RecentResumesList({ selectedId, onSelect }: RecentResumesListProps) {
  const { data, isLoading, isError, error } = useResumesList(10);
  const deleteMutation = useDeleteResume();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) return <SkeletonList />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-destructive">
            Couldn't load your resumes.
            <span className="block text-xs text-muted-foreground">
              {formatApiError(error)}
            </span>
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
          <p className="text-sm font-medium">No resumes yet</p>
          <p className="text-xs text-muted-foreground">
            Drop in your first resume to get started. We keep your last 10 here.
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
      toast.success('Resume removed');
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
                isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border',
                isDeleting && 'pointer-events-none opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.fullName || item.originalFileName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.originalFileName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Delete resume"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(e, item.id)}
                  loading={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {fileTypeLabel(item.mimeType)}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {formatFileSize(item.fileSize)}
                </Badge>
                {item.experienceCount > 0 && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {item.experienceCount} role{item.experienceCount === 1 ? '' : 's'}
                  </Badge>
                )}
                {item.topSkills.slice(0, 2).map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] font-normal">
                    {s}
                  </Badge>
                ))}
                {item.topSkills.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal text-muted-foreground"
                  >
                    +{item.topSkills.length - 2}
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
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-4 w-2/3" />
              </div>
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
