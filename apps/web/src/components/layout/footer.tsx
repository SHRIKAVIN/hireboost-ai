import { Link } from 'react-router-dom';

import { Logo } from '@/components/shared/logo';
import { ROUTES } from '@/routes/paths';

const footerSections = [
  {
    title: 'Product',
    links: [
      { to: ROUTES.marketing.pricing, label: 'Pricing' },
      { to: ROUTES.marketing.testimonials, label: 'Testimonials' },
      { to: ROUTES.auth.register, label: 'Get started' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: ROUTES.marketing.contact, label: 'Contact' },
      { to: '#', label: 'About' },
      { to: '#', label: 'Careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '#', label: 'Privacy' },
      { to: '#', label: 'Terms' },
      { to: '#', label: 'Security' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Tailor your resume to any job in minutes. ATS scoring, AI improvements, and a
              recruiter-ready editor in one place.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <Link
                      to={link.to}
                      className="text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} HireBoost AI. All rights reserved.</p>
          <p>Built for candidates and recruiters who care about quality.</p>
        </div>
      </div>
    </footer>
  );
}
