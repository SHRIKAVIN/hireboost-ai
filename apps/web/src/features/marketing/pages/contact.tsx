import { contactFormSchema, type ContactFormInput } from '@hireboost/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';

const contactChannels = [
  {
    icon: Mail,
    label: 'Email us',
    value: 'hello@hireboost.ai',
    href: 'mailto:hello@hireboost.ai',
  },
  {
    icon: Phone,
    label: 'Call sales',
    value: '+1 (415) 555-0143',
    href: 'tel:+14155550143',
  },
  {
    icon: MessageSquare,
    label: 'In-app chat',
    value: 'Mon–Fri · 9am–6pm PT',
    href: '#',
  },
];

export function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', company: '', message: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    // Phase 2 has no backend. Phase 3+ will POST to /api/v1/contact (or similar).
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Message sent', {
      description: `Thanks ${values.name.split(' ')[0]}, we'll be in touch shortly.`,
    });
    reset();
  });

  return (
    <div className="container py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Talk to the team
            </h1>
            <p className="mt-4 text-muted-foreground">
              Questions, demos, partnerships, or feedback — we read everything and reply within
              one business day.
            </p>
          </div>

          <Card>
            <CardContent className="grid gap-1 divide-y divide-border p-2">
              {contactChannels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {c.label}
                      </p>
                      <p className="text-sm font-medium">{c.value}</p>
                    </div>
                  </a>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@company.com"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" placeholder="Acme, Inc." {...register('company')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us what you're working on…"
                  aria-invalid={!!errors.message}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className={cn('w-full sm:w-auto')}
              >
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ContactPage;
