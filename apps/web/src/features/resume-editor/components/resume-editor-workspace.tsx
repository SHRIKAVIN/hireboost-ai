import { zodResolver } from '@hookform/resolvers/zod';
import type { ResumeStructuredData } from '@hireboost/shared';
import { resumeStructuredDataSchema } from '@hireboost/shared';
import { Download, LayoutTemplate, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  type Control,
  type FieldArrayPath,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';

import { downloadResumePdf } from '../lib/build-resume-pdf';
import { ResumePreviewPane, type ResumeTemplateId } from './resume-preview-pane';

type FormValues = z.infer<typeof resumeStructuredDataSchema>;

function ExperienceBulletsEditor({
  control,
  nestIndex,
}: {
  control: Control<FormValues>;
  nestIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `experience.${nestIndex}.bullets` as FieldArrayPath<FormValues>,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Bullets</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => (append as unknown as (line: string) => void)('')}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <ul className="space-y-2">
        {fields.map((field, i) => (
          <li key={field.id} className="flex gap-2">
            <Controller
              control={control}
              name={`experience.${nestIndex}.bullets.${i}`}
              render={({ field: f }) => (
                <Textarea {...f} rows={2} className="min-h-0 flex-1 text-sm" placeholder="Achievement or responsibility…" />
              )}
            />
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectBulletsEditor({ control, nestIndex }: { control: Control<FormValues>; nestIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `projects.${nestIndex}.bullets` as FieldArrayPath<FormValues>,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Bullets</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => (append as unknown as (line: string) => void)('')}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2">
          <Controller
            control={control}
            name={`projects.${nestIndex}.bullets.${i}`}
            render={({ field: f }) => <Input {...f} placeholder="Bullet" />}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

interface ResumeEditorWorkspaceProps {
  seed: ResumeStructuredData;
}

export function ResumeEditorWorkspace({ seed }: ResumeEditorWorkspaceProps) {
  const [template, setTemplate] = useState<ResumeTemplateId>('classic');

  const form = useForm<FormValues>({
    resolver: zodResolver(resumeStructuredDataSchema),
    defaultValues: seed,
    mode: 'onChange',
  });

  const { control, handleSubmit, reset, formState } = form;

  useEffect(() => {
    reset(structuredClone(seed));
  }, [seed, reset]);

  const watched = useWatch({ control }) as FormValues | undefined;
  const previewData: ResumeStructuredData = useMemo(() => {
    if (watched && typeof watched === 'object') {
      return watched as ResumeStructuredData;
    }
    return seed;
  }, [watched, seed]);

  const onExportPdf = handleSubmit(
    (data) => {
      const base = data.basics.fullName.trim() || 'resume';
      downloadResumePdf(data, `${base}-hireboost`);
      toast.success('PDF downloaded', { description: 'Plain text layout — friendly for ATS parsers.' });
    },
    () => {
      toast.error('Fix validation errors before exporting');
    },
  );

  const expArray = useFieldArray({ control, name: 'experience' });
  const eduArray = useFieldArray({ control, name: 'education' });
  const projArray = useFieldArray({ control, name: 'projects' });
  const certArray = useFieldArray({ control, name: 'certifications' });
  const linkArray = useFieldArray({ control, name: 'basics.links' });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <div className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
        <Card>
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Preview template
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Affects on-screen preview only. PDF export always uses a simple ATS-safe layout.
              </p>
            </div>
            <div className="flex rounded-lg border border-border p-0.5 bg-muted/40">
              {(['classic', 'minimal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemplate(t)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    template === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Controller
                  control={control}
                  name="basics.fullName"
                  render={({ field }) => <Input id="fullName" {...field} />}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Controller
                  control={control}
                  name="basics.email"
                  render={({ field }) => <Input id="email" type="email" {...field} />}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Controller control={control} name="basics.phone" render={({ field }) => <Input id="phone" {...field} />} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Controller
                  control={control}
                  name="basics.location"
                  render={({ field }) => <Input id="location" {...field} />}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Links</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => linkArray.append({ label: '', url: '' })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add link
                </Button>
              </div>
              {linkArray.fields.map((field, i) => (
                <div key={field.id} className="flex flex-col gap-2 sm:flex-row">
                  <Controller
                    control={control}
                    name={`basics.links.${i}.label`}
                    render={({ field: f }) => <Input {...f} placeholder="Label" />}
                  />
                  <Controller
                    control={control}
                    name={`basics.links.${i}.url`}
                    render={({ field: f }) => <Input {...f} placeholder="https://…" className="flex-1" />}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => linkArray.remove(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <Label htmlFor="summary">Professional summary</Label>
            <Controller
              control={control}
              name="summary"
              render={({ field }) => <Textarea id="summary" rows={5} {...field} />}
            />
          </section>

          <Separator />

          <section className="space-y-2">
            <Label htmlFor="skills">Skills (one per line)</Label>
            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <Textarea
                  id="skills"
                  rows={6}
                  value={field.value.join('\n')}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Experience</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  expArray.append({
                    company: '',
                    role: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    bullets: [],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add role
              </Button>
            </div>
            {expArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => expArray.remove(index)}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Role</Label>
                      <Controller
                        control={control}
                        name={`experience.${index}.role`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Controller
                        control={control}
                        name={`experience.${index}.company`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Controller
                        control={control}
                        name={`experience.${index}.location`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label>Start</Label>
                        <Controller
                          control={control}
                          name={`experience.${index}.startDate`}
                          render={({ field: f }) => <Input {...f} placeholder="e.g. Jan 2020" />}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>End</Label>
                        <Controller
                          control={control}
                          name={`experience.${index}.endDate`}
                          render={({ field: f }) => <Input {...f} placeholder="or leave if current" />}
                        />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Controller
                      control={control}
                      name={`experience.${index}.current`}
                      render={({ field: f }) => (
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input"
                          checked={Boolean(f.value)}
                          onChange={(e) => f.onChange(e.target.checked)}
                        />
                      )}
                    />
                    Current role
                  </label>
                  <ExperienceBulletsEditor control={control} nestIndex={index} />
                </CardContent>
              </Card>
            ))}
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Education</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  eduArray.append({
                    institution: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: '',
                    details: '',
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            {eduArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => eduArray.remove(index)}>
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Controller
                      control={control}
                      name={`education.${index}.institution`}
                      render={({ field: f }) => <Input {...f} />}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Degree</Label>
                      <Controller
                        control={control}
                        name={`education.${index}.degree`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>Field</Label>
                      <Controller
                        control={control}
                        name={`education.${index}.field`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>Start</Label>
                      <Controller
                        control={control}
                        name={`education.${index}.startDate`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>End</Label>
                      <Controller
                        control={control}
                        name={`education.${index}.endDate`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Details</Label>
                    <Controller
                      control={control}
                      name={`education.${index}.details`}
                      render={({ field: f }) => <Textarea rows={2} {...f} />}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Projects</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  projArray.append({ name: '', description: '', url: '', bullets: [] })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            {projArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => projArray.remove(index)}>
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Controller
                      control={control}
                      name={`projects.${index}.name`}
                      render={({ field: f }) => <Input {...f} />}
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Controller
                      control={control}
                      name={`projects.${index}.url`}
                      render={({ field: f }) => <Input {...f} />}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Controller
                      control={control}
                      name={`projects.${index}.description`}
                      render={({ field: f }) => <Textarea rows={2} {...f} />}
                    />
                  </div>
                  <ProjectBulletsEditor control={control} nestIndex={index} />
                </CardContent>
              </Card>
            ))}
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Certifications</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => certArray.append({ name: '', issuer: '', issueDate: '', url: '' })}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            {certArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => certArray.remove(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Controller
                        control={control}
                        name={`certifications.${index}.name`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>Issuer</Label>
                      <Controller
                        control={control}
                        name={`certifications.${index}.issuer`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>Issue date</Label>
                      <Controller
                        control={control}
                        name={`certifications.${index}.issueDate`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <Controller
                        control={control}
                        name={`certifications.${index}.url`}
                        render={({ field: f }) => <Input {...f} />}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="primary" onClick={() => void onExportPdf()}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            {formState.isDirty && (
              <span className="text-xs text-muted-foreground self-center">Unsaved edits (browser only)</span>
            )}
          </div>
        </form>
      </div>

      <div className="xl:sticky xl:top-20 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
        <ResumePreviewPane data={previewData} template={template} />
      </div>
    </div>
  );
}
