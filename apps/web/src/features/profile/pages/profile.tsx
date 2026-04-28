import { zodResolver } from '@hookform/resolvers/zod';
import { UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePatchMeMutation } from '@/features/account/hooks/use-patch-me';
import { formatApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  skillsText: z.string(),
  experienceYears: z.coerce.number().int().min(0).max(80),
  preferredRolesText: z.string(),
  preferredLocationsText: z.string(),
  summary: z.string().max(8000),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const patchMe = usePatchMeMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      skillsText: '',
      experienceYears: 0,
      preferredRolesText: '',
      preferredLocationsText: '',
      summary: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      name: user.name,
      skillsText: user.profile.skills.join('\n'),
      experienceYears: user.profile.experienceYears,
      preferredRolesText: user.profile.preferredRoles.join('\n'),
      preferredLocationsText: user.profile.preferredLocations.join('\n'),
      summary: user.profile.summary,
    });
  }, [user, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await patchMe.mutateAsync({
        name: values.name,
        profile: {
          skills: values.skillsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          experienceYears: values.experienceYears,
          preferredRoles: values.preferredRolesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          preferredLocations: values.preferredLocationsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          summary: values.summary,
        },
      });
      toast.success('Profile saved');
    } catch (err) {
      toast.error('Could not save profile', { description: formatApiError(err) });
    }
  });

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">Sign in to edit your profile.</p>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <UserRound className="h-3 w-3 text-primary" />
          Profile
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your professional defaults</h1>
        <p className="text-sm text-muted-foreground">
          These fields seed suggestions across the workflow. They don&apos;t replace your uploaded resume.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
            <div>
              <Label htmlFor="name">Display name</Label>
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => <Input id="name" className="mt-1.5" {...field} />}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="summary">Professional summary</Label>
              <Controller
                control={form.control}
                name="summary"
                render={({ field }) => <Textarea id="summary" rows={4} className="mt-1.5" {...field} />}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (one per line)</Label>
              <Controller
                control={form.control}
                name="skillsText"
                render={({ field }) => <Textarea id="skills" rows={5} className="mt-1.5 font-mono text-sm" {...field} />}
              />
            </div>

            <div>
              <Label htmlFor="expYrs">Years of experience</Label>
              <Controller
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <Input id="expYrs" type="number" min={0} max={80} className="mt-1.5 w-32" {...field} />
                )}
              />
            </div>

            <div>
              <Label htmlFor="roles">Preferred roles (one per line)</Label>
              <Controller
                control={form.control}
                name="preferredRolesText"
                render={({ field }) => <Textarea id="roles" rows={3} className="mt-1.5" {...field} />}
              />
            </div>

            <div>
              <Label htmlFor="locs">Preferred locations (one per line)</Label>
              <Controller
                control={form.control}
                name="preferredLocationsText"
                render={({ field }) => <Textarea id="locs" rows={3} className="mt-1.5" {...field} />}
              />
            </div>

            <Button type="submit" variant="primary" loading={patchMe.isPending}>
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
