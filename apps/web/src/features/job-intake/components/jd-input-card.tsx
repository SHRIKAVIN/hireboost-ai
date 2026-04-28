import {
  MAX_JOB_DESCRIPTION_LENGTH,
  MIN_JOB_DESCRIPTION_LENGTH,
  jobDescriptionSchema,
  type JobDescriptionInput,
} from '@hireboost/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardPaste, FileText, Sparkles, Wand2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';

const SAMPLE_JD = `Senior Full Stack Engineer

We are hiring a Senior Full Stack Engineer to help us build the next generation of our SaaS platform.

What you'll do:
- Design and build product features end-to-end across React, TypeScript, and Node.js.
- Own backend services using Express, PostgreSQL, and Redis on AWS.
- Lead architecture decisions and mentor mid-level engineers.
- Partner with design and product to ship polished, accessible UI with Tailwind CSS.
- Drive performance, observability, and CI/CD improvements with GitHub Actions and Docker.

What we're looking for:
- 5+ years of experience building production web applications.
- Strong TypeScript, React, and Node.js skills.
- Comfort with PostgreSQL, REST and GraphQL APIs, and AWS services.
- Experience with Docker, Kubernetes, and infrastructure-as-code (Terraform a plus).

Nice to have:
- Experience with Next.js, GraphQL, or event-driven architectures.
- Open source contributions.`;

interface JdInputCardProps {
  onAnalyze: (input: JobDescriptionInput) => Promise<void>;
  isAnalyzing: boolean;
  defaultValue?: string;
  className?: string;
}

/**
 * Premium JD input card with:
 * - Live char count + min/max guidance
 * - Sample JD filler (great for first-time users)
 * - "Paste from clipboard" affordance
 * - Inline validation via shared zod schema
 */
export function JdInputCard({
  onAnalyze,
  isAnalyzing,
  defaultValue = '',
  className,
}: JdInputCardProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobDescriptionInput>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: { jobDescription: defaultValue },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (defaultValue) setValue('jobDescription', defaultValue);
  }, [defaultValue, setValue]);

  const value = watch('jobDescription') ?? '';
  const length = value.length;
  const tooShort = length > 0 && length < MIN_JOB_DESCRIPTION_LENGTH;
  const tooLong = length > MAX_JOB_DESCRIPTION_LENGTH;
  const valid = length >= MIN_JOB_DESCRIPTION_LENGTH && !tooLong;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error('Clipboard is empty');
        return;
      }
      setValue('jobDescription', text, { shouldValidate: true, shouldDirty: true });
      toast.success('Pasted from clipboard');
    } catch {
      toast.error('Clipboard access blocked', {
        description: 'Use ⌘/Ctrl + V to paste into the field.',
      });
    }
  };

  const handleFillSample = () => {
    setValue('jobDescription', SAMPLE_JD, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (input) => {
    await onAnalyze(input);
  });

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-br from-primary/[0.06] to-transparent px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Paste the job description</h2>
            <p className="text-xs text-muted-foreground">
              We'll extract the role, seniority, must-have skills, tools, and keywords.
            </p>
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handlePaste}
            disabled={isAnalyzing}
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span>Paste</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleFillSample}
            disabled={isAnalyzing}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>Try a sample</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Textarea
              {...register('jobDescription')}
              placeholder="Paste the entire job description here — the more context, the better the analysis…"
              rows={14}
              maxLength={MAX_JOB_DESCRIPTION_LENGTH}
              aria-invalid={!!errors.jobDescription}
              aria-describedby="jd-helper"
              className="min-h-[260px] resize-y font-mono text-[13px] leading-relaxed"
              disabled={isAnalyzing}
            />
            <div
              id="jd-helper"
              className="flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <span
                className={cn(
                  'text-muted-foreground',
                  tooShort && 'text-warning',
                  tooLong && 'text-destructive',
                  valid && 'text-success',
                )}
              >
                {length === 0
                  ? `Aim for ${MIN_JOB_DESCRIPTION_LENGTH}+ characters`
                  : tooShort
                    ? `Add ${MIN_JOB_DESCRIPTION_LENGTH - length} more characters`
                    : tooLong
                      ? 'Job description is too long'
                      : 'Looks good — ready to analyze'}
              </span>
              <span className="font-mono text-muted-foreground/80">
                {length.toLocaleString()} / {MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()}
              </span>
            </div>
            {errors.jobDescription && (
              <p className="text-xs text-destructive">{errors.jobDescription.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handlePaste}
                disabled={isAnalyzing}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Paste</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleFillSample}
                disabled={isAnalyzing}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Try a sample</span>
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isAnalyzing}
              disabled={isAnalyzing || !valid}
              className="sm:ml-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAnalyzing ? 'Analyzing…' : 'Analyze job description'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
