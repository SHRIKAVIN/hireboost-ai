import { useEffect } from 'react';

import { useResolvedTheme } from '@/hooks/use-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Mounts the `class="dark"` toggle on <html> based on the resolved theme.
 * Lives once at the App root.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const resolved = useResolvedTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  }, [resolved]);

  return <>{children}</>;
}
