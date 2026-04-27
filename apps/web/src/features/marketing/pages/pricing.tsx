import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/paths';

interface Plan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'forever',
    description: 'Test the workflow on a single job description.',
    features: [
      '1 job description analysis',
      '1 ATS review per month',
      'Basic AI suggestions',
      'PDF export',
    ],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    price: '$19',
    cadence: 'per month',
    description: 'For active job seekers iterating fast.',
    features: [
      'Unlimited JD analyses',
      'Unlimited ATS reviews',
      'Premium AI rewrites',
      'Resume diff + version history',
      'All resume templates',
      'Priority email support',
    ],
    cta: 'Start 7-day trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$49',
    cadence: 'per seat / month',
    description: 'For career coaches and recruiting teams.',
    features: [
      'Everything in Pro',
      'Up to 10 team seats',
      'Shared workspaces',
      'Bulk resume reviews',
      'Custom branding',
      'Dedicated success manager',
    ],
    cta: 'Talk to sales',
  },
];

export function PricingPage() {
  return (
    <div className="container py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="default" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Simple, honest pricing</span>
        </Badge>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Plans that scale with your job search
        </h1>
        <p className="mt-4 text-muted-foreground">
          Start free, upgrade when you&rsquo;re actively interviewing. Cancel any time.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative flex flex-col border-border',
              plan.highlight && 'border-primary/40 shadow-glow',
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="px-3 py-1">
                  Most popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
              <div>
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>{' '}
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              </div>

              <ul className="flex flex-1 flex-col gap-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant={plan.highlight ? 'primary' : 'outline'} className="w-full">
                <Link to={ROUTES.auth.register}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
        All plans include encrypted storage, GDPR-friendly data handling, and no resale of your data.
      </p>
    </div>
  );
}

export default PricingPage;
