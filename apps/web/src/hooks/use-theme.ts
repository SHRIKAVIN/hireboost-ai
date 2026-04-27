import { useEffect, useState } from 'react';

import { resolveTheme, useThemeStore } from '@/store/theme-store';

/** Returns the concrete theme being applied right now ('light' | 'dark'). */
export function useResolvedTheme(): 'light' | 'dark' {
  const mode = useThemeStore((s) => s.mode);
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(mode));

  useEffect(() => {
    setResolved(resolveTheme(mode));
    if (mode !== 'system' || typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(resolveTheme('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return resolved;
}
