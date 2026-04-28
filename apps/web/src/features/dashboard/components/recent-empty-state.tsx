import { FilePlus2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RecentEmptyStateProps {
  title: string;
  description: string;
  cta: { label: string; to: string };
}

export function RecentEmptyState({ title, description, cta }: RecentEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FilePlus2 className="h-5 w-5" />
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="primary" size="sm">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
