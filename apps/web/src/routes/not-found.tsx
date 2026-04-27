import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="font-display text-5xl font-semibold tracking-tight text-primary">404</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        We couldn&rsquo;t find that page.
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The link may be broken or the page may have moved. Head back home and try again.
      </p>
      <Button asChild variant="primary">
        <Link to={ROUTES.marketing.home}>
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
