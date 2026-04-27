import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

import { useResolvedTheme } from '@/hooks/use-theme';

export function Toaster(props: ToasterProps) {
  const theme = useResolvedTheme();
  return (
    <SonnerToaster
      theme={theme}
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-elevated',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}
