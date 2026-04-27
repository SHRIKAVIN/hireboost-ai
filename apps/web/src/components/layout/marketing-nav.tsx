import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

const navLinks = [
  { to: ROUTES.marketing.home, label: 'Home' },
  { to: ROUTES.marketing.pricing, label: 'Pricing' },
  { to: ROUTES.marketing.testimonials, label: 'Testimonials' },
  { to: ROUTES.marketing.contact, label: 'Contact' },
] as const;

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === ROUTES.marketing.home}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {label}
    </NavLink>
  );
}

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border surface-glass">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.auth.login}>Log in</Link>
            </Button>
            <Button asChild size="sm" variant="primary">
              <Link to={ROUTES.auth.register}>Get started</Link>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88%] max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <Logo size="sm" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavItem key={link.to} {...link} onClick={() => setOpen(false)} />
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to={ROUTES.auth.login} onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button asChild variant="primary">
                  <Link to={ROUTES.auth.register} onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
