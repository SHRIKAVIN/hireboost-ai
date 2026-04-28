import type { AiProvider, ResumeEnhancementResult, ResumeStructuredData } from '@hireboost/shared';
import { AiProvider as AiProviderEnum, resumeEnhancementResponseSchema } from '@hireboost/shared';

import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { getAiClient } from '../../providers/ai/index.js';
import {
  isAiProviderRateLimited,
  parseRetryAfterSecondsFromAiError,
} from '../../providers/ai/provider-errors.js';
import { ApiError } from '../../utils/api-error.js';
import { findJobAnalysisById } from '../job-intake/job-analysis.repository.js';
import { findResumeById } from '../resumes/resume.repository.js';
import { buildEnhanceSystemPrompt, buildEnhanceUserPrompt } from './prompts/enhance-resume.prompt.js';
import { parseJsonFromModelText, preserveContactBasics } from './ai.utils.js';

const JD_EXCERPT_MAX = 12_000;

export async function enhanceResumeForUser(input: {
  userId: string;
  jobAnalysisId: string;
  resumeId?: string;
}): Promise<ResumeEnhancementResult> {
  const analysisDoc = await findJobAnalysisById(input.userId, input.jobAnalysisId);
  if (!analysisDoc) throw ApiError.notFound('Job analysis not found');

  const resumeId =
    input.resumeId ??
    (analysisDoc.resumeId ? String(analysisDoc.resumeId) : undefined);

  if (!resumeId) {
    throw ApiError.badRequest(
      'No resume linked to this job analysis. Upload a resume for this workflow first.',
    );
  }

  const resumeDoc = await findResumeById(input.userId, resumeId);
  if (!resumeDoc) throw ApiError.notFound('Resume not found');

  const client = getAiClient();
  const system = buildEnhanceSystemPrompt();
  const jd = analysisDoc.jobDescription.slice(0, JD_EXCERPT_MAX);
  const userPrompt = buildEnhanceUserPrompt({
    job: {
      extractedRole: analysisDoc.extractedRole,
      extractedSkills: analysisDoc.extractedSkills,
      extractedKeywords: analysisDoc.extractedKeywords,
      toolsAndTechnologies: analysisDoc.toolsAndTechnologies ?? [],
      seniorityLevel: analysisDoc.seniorityLevel,
      responsibilities: analysisDoc.responsibilities,
      preferredQualifications: analysisDoc.preferredQualifications ?? [],
      missingKeywords: analysisDoc.missingKeywords ?? [],
      skillGaps: analysisDoc.skillGaps ?? [],
      weakBullets: analysisDoc.weakBullets ?? [],
    },
    jobDescriptionExcerpt: jd,
    resume: resumeDoc.parsedData as ResumeStructuredData,
  });

  let raw: string;
  try {
    raw = await client.generateStructuredJson({ system, user: userPrompt });
  } catch (err) {
    if (isAiProviderRateLimited(err)) {
      const retryAfterSec = parseRetryAfterSecondsFromAiError(err);
      logger.warn({ err, retryAfterSec }, '[ai] provider rate limited');
      throw ApiError.tooManyRequests(
        'The AI provider rate or quota limit was reached (often free-tier daily/minute caps). Wait and retry, review billing and quotas in Google AI Studio, or set AI_PROVIDER=openai with OPENAI_API_KEY.',
        retryAfterSec !== undefined ? { retryAfterSec } : undefined,
      );
    }
    logger.error({ err }, '[ai] provider call failed');
    throw ApiError.serviceUnavailable(
      `AI provider error: ${err instanceof Error ? err.message : 'unknown'}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = parseJsonFromModelText(raw);
  } catch (err) {
    logger.warn({ err, raw: raw.slice(0, 500) }, '[ai] failed to parse model JSON');
    throw ApiError.unprocessable('AI returned invalid JSON');
  }

  const validated = resumeEnhancementResponseSchema.safeParse(parsed);
  if (!validated.success) {
    logger.warn(
      { issues: validated.error.flatten(), sample: JSON.stringify(parsed).slice(0, 400) },
      '[ai] response failed schema validation',
    );
    throw ApiError.unprocessable('AI response did not match the expected resume shape');
  }

  const merged = preserveContactBasics(
    resumeDoc.parsedData as ResumeStructuredData,
    validated.data.enhancedStructuredData,
  );

  const provider: AiProvider =
    env.AI_PROVIDER === 'openai' ? AiProviderEnum.OpenAi : AiProviderEnum.Gemini;
  const model = env.AI_PROVIDER === 'openai' ? env.OPENAI_MODEL : env.GEMINI_MODEL;

  return {
    enhancedStructuredData: merged,
    highlights: validated.data.highlights,
    provider,
    model,
  };
}
