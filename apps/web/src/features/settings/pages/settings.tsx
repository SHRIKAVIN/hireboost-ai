import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Settings as SettingsIcon, Share } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePatchMeMutation } from '@/features/account/hooks/use-patch-me';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { formatApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const prefsSchema = z.object({
  emailAnalysisReady: z.boolean(),
  emailProductTips: z.boolean(),
  inAppAnalysisReady: z.boolean(),
});

type PrefsForm = z.infer<typeof prefsSchema>;

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const patchMe = usePatchMeMutation();
  const { canPrompt, promptInstall, isStandalone } = usePwaInstall();

  const form = useForm<PrefsForm>({
    resolver: zodResolver(prefsSchema),
    defaultValues: {
      emailAnalysisReady: true,
      emailProductTips: false,
      inAppAnalysisReady: true,
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset(user.preferences);
  }, [user, form]);

  const onSubmit = form.handleSubmit(async (prefs) => {
    try {
      await patchMe.mutateAsync({ preferences: prefs });
      toast.success('Preferences saved');
    } catch (err) {
      toast.error('Could not save settings', { description: formatApiError(err) });
    }
  });

  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in to manage settings.</p>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <SettingsIcon className="h-3 w-3 text-primary" />
          Settings
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Account & preferences</h1>
        <p className="text-sm text-muted-foreground">
          Control notifications. Theme follows your device — use the toggle in the header.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <img
              src="/app-logo.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full bg-muted/50 object-contain ring-1 ring-border/60"
              decoding="async"
            />
            <div className="min-w-0 space-y-2">
              <h2 className="text-sm font-semibold">Install HireBoost AI</h2>
              {isStandalone ? (
                <p className="text-sm text-muted-foreground">You&apos;re already using the installed app.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Chrome and Edge can install this site as an app. There is usually{' '}
                    <strong>no automatic popup</strong> — use the banner on this site or the install icon in the
                    address bar when it appears.
                  </p>
                  {canPrompt ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => void promptInstall()}
                    >
                      <Download className="h-4 w-4" />
                      Install now
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      If you don&apos;t see an install option, use a production build (
                      <code className="rounded bg-muted px-1 py-0.5 text-[11px]">npm run preview</code>) on{' '}
                      <strong>localhost</strong> or <strong>HTTPS</strong>, then interact with the site for a moment.
                    </p>
                  )}
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <strong>iPhone / iPad (Safari):</strong> tap Share → <em>Add to Home Screen</em>. This uses the
                      same logo as above.
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Account</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sign-in</dt>
              <dd className="font-medium capitalize">{user.provider}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold">Notifications</h2>
            <p className="text-xs text-muted-foreground mt-1">
              In-app alerts work today. Email delivery is wired for when outbound mail ships.
            </p>
          </div>
          <Separator />
          <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
            <label className="flex cursor-pointer items-start gap-3">
              <Controller
                control={form.control}
                name="inAppAnalysisReady"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <span>
                <span className="font-medium text-sm">In-app: analysis ready</span>
                <span className="block text-xs text-muted-foreground">
                  When ATS or similar jobs finish, add an entry to your notification list.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <Controller
                control={form.control}
                name="emailAnalysisReady"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <span>
                <span className="font-medium text-sm">Email: analysis summaries</span>
                <span className="block text-xs text-muted-foreground">
                  Preference stored for future transactional email (not sent yet).
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <Controller
                control={form.control}
                name="emailProductTips"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <span>
                <span className="font-medium text-sm">Email: product tips</span>
                <span className="block text-xs text-muted-foreground">
                  Occasional feature updates and best practices (opt-in).
                </span>
              </span>
            </label>

            <Button type="submit" variant="primary" loading={patchMe.isPending}>
              Save preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
