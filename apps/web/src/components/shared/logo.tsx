import { Link } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

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

export function Logo({ className, to = ROUTES.marketing.home, showWordmark = true, size = 'md' }: LogoProps) {
  const s = sizeMap[size];
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg',
          'bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white',
          'shadow-glow transition-transform duration-300 group-hover:scale-[1.04]',
          s.box,
        )}
      >
        <svg viewBox="0 0 32 32" className="h-3/5 w-3/5 fill-white">
          <path d="M9 22V10h2.6v4.7h5.3V10H19.5v12h-2.6v-5H11.6v5z" />
          <circle cx="24" cy="10" r="2" className="fill-yellow-300" />
        </svg>
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
