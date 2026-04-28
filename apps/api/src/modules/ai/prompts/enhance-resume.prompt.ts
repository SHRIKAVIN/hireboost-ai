import type { JobAnalysis, ResumeStructuredData } from '@hireboost/shared';

export interface EnhancePromptContext {
  job: Pick<
    JobAnalysis,
    | 'extractedRole'
    | 'extractedSkills'
    | 'extractedKeywords'
    | 'toolsAndTechnologies'
    | 'seniorityLevel'
    | 'responsibilities'
    | 'preferredQualifications'
    | 'missingKeywords'
    | 'skillGaps'
    | 'weakBullets'
  >;
  jobDescriptionExcerpt: string;
  resume: ResumeStructuredData;
}

export function buildEnhanceSystemPrompt(): string {
  return [
    'You are an expert resume writer and ATS strategist.',
    'You receive structured resume JSON and job context. Return ONLY valid JSON (no markdown) matching this shape:',
    '{"enhancedStructuredData": { same shape as the input resume object with keys basics, summary, skills, experience, education, projects, certifications },',
    '"highlights": string[] }',
    '',
    'Rules:',
    '- Keep facts truthful: strengthen wording and alignment, do not invent employers, degrees, dates, or metrics.',
    '- Mirror the target role title and seniority in the summary and experience bullets where natural.',
    '- Weave missing keywords and tools from the job context into bullets and skills when honestly applicable.',
    '- Use strong action verbs; prefer concise, scannable bullets (1–2 lines each).',
    '- Preserve the candidate contact identity: keep the same person; you may polish company/role titles.',
    '- Output must be strictly parseable JSON.',
  ].join('\n');
}

export function buildEnhanceUserPrompt(ctx: EnhancePromptContext): string {
  const jobJson = JSON.stringify(
    {
      extractedRole: ctx.job.extractedRole,
      seniorityLevel: ctx.job.seniorityLevel,
      extractedSkills: ctx.job.extractedSkills,
      extractedKeywords: ctx.job.extractedKeywords.slice(0, 40),
      toolsAndTechnologies: ctx.job.toolsAndTechnologies ?? [],
      responsibilities: ctx.job.responsibilities,
      preferredQualifications: ctx.job.preferredQualifications ?? [],
      missingKeywords: ctx.job.missingKeywords ?? [],
      skillGaps: ctx.job.skillGaps ?? [],
      weakBullets: (ctx.job.weakBullets ?? []).slice(0, 12),
    },
    null,
    2,
  );

  const resumeJson = JSON.stringify(ctx.resume, null, 2);

  return [
    '## Job description (excerpt)',
    ctx.jobDescriptionExcerpt,
    '',
    '## Job analysis (structured)',
    jobJson,
    '',
    '## Current resume (structured JSON — improve this)',
    resumeJson,
  ].join('\n');
}
