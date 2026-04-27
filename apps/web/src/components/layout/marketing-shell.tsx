import { Outlet } from 'react-router-dom';

import { Footer } from './footer';
import { MarketingNav } from './marketing-nav';

export function MarketingShell() {
  return (
    <div className="flex min-h-full flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
