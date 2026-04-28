import type { JobAnalysis, JobAnalysisListItem } from '@hireboost/shared';

import { ApiError } from '../../utils/api-error.js';
import { parseJobDescription } from './job-analysis.parser.js';
import {
  createJobAnalysis,
  deleteJobAnalysis,
  findJobAnalysisById,
  listJobAnalysesForUser,
} from './job-analysis.repository.js';

/* -------------------------------------------------------------------------- */
/*                                  Analyze                                   */
/* -------------------------------------------------------------------------- */

/**
 * Parse a JD with the deterministic engine and persist the resulting
 * analysis under the authenticated user. Returns the public DTO.
 *
 * Phase 8 will compose this service behind the AI provider so we get
 * AI-enriched suggestions, but the deterministic baseline always wins
 * if AI is unavailable (graceful degradation, ARCHITECTURE.md §6).
 */
export async function analyzeJobDescription(input: {
  userId: string;
  jobDescription: string;
}): Promise<JobAnalysis> {
  const parsed = parseJobDescription(input.jobDescription);

  const doc = await createJobAnalysis({
    userId: input.userId,
    jobDescription: input.jobDescription,
    extractedRole: parsed.extractedRole,
    extractedSkills: parsed.extractedSkills,
    extractedKeywords: parsed.extractedKeywords,
    seniorityLevel: parsed.seniorityLevel,
    responsibilities: parsed.responsibilities,
    preferredQualifications: parsed.preferredQualifications,
    toolsAndTechnologies: parsed.toolsAndTechnologies,
  });

  return doc.toPublic();
}

/* -------------------------------------------------------------------------- */
/*                                    Get                                     */
/* -------------------------------------------------------------------------- */

export async function getJobAnalysis(userId: string, id: string): Promise<JobAnalysis> {
  const doc = await findJobAnalysisById(userId, id);
  if (!doc) throw ApiError.notFound('Job analysis not found');
  return doc.toPublic();
}

/* -------------------------------------------------------------------------- */
/*                                   List                                     */
/* -------------------------------------------------------------------------- */

export async function listJobAnalyses(
  userId: string,
  limit: number,
): Promise<JobAnalysisListItem[]> {
  const docs = await listJobAnalysesForUser(userId, limit);
  return docs.map((d) => d.toListItem());
}

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export async function removeJobAnalysis(userId: string, id: string): Promise<void> {
  const ok = await deleteJobAnalysis(userId, id);
  if (!ok) throw ApiError.notFound('Job analysis not found');
}
