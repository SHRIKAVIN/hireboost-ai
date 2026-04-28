import { Link } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/auth-store';

interface LogoProps {
  className?: string;
  to?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: 'h-7 w-7', text: 'text-base' },
  md: { box: 'h-9 w-9', text: 'text-lg' },
  lg: { box: 'h-11 w-11', text: 'text-xl' },
} as const;

export function Logo({ className, to, showWordmark = true, size = 'md' }: LogoProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const resolvedTo =
    to ?? (isAuthenticated ? ROUTES.app.dashboard : ROUTES.marketing.home);
  const s = sizeMap[size];
  return (
    <Link to={resolvedTo} className={cn('group inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-muted/45 ring-1 ring-border/55 shadow-soft',
          'transition-transform duration-300 group-hover:scale-[1.04]',
          s.box,
        )}
      >
        <img
          src="/app-logo.png"
          alt=""
          className="h-full w-full object-contain p-px"
          width={44}
          height={44}
          decoding="async"
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            'font-display font-semibold tracking-tight text-foreground',
            s.text,
          )}
        >
          HireBoost<span className="text-primary"> AI</span>
        </span>
      )}
    </Link>
  );
}
