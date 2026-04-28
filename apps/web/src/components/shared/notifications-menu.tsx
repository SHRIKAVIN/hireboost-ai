import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '@/features/notifications/hooks/use-notifications';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function NotificationsMenu() {
  const { data: items = [], isLoading } = useNotificationsQuery(25);
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,380px)] p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          {items.length > 0 && unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              loading={markAll.isPending}
              onClick={() => void markAll.mutateAsync()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[min(60vh,360px)] overflow-y-auto">
          {isLoading && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Loading…</p>
          )}
          {!isLoading && items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          )}
          {items.map((n) => {
            const jobId = n.metadata && typeof n.metadata === 'object' && 'jobAnalysisId' in n.metadata
              ? String((n.metadata as { jobAnalysisId?: string }).jobAnalysisId ?? '')
              : '';
            return (
              <div
                key={n.id}
                className={cn(
                  'border-b border-border px-3 py-2.5 text-left text-sm last:border-0',
                  !n.read && 'bg-primary/[0.04]',
                )}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    if (!n.read) void markRead.mutateAsync(n.id);
                  }}
                >
                  <p className="font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{formatTime(n.createdAt)}</p>
                </button>
                {jobId && (
                  <Link
                    to={ROUTES.app.atsReview}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary"
                    onClick={() => {
                      if (!n.read) void markRead.mutateAsync(n.id);
                    }}
                  >
                    Open ATS review <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
