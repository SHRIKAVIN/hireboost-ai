import type { JobAnalysis } from '@hireboost/shared';
import { NotificationType } from '@hireboost/shared';

import { ApiError } from '../../utils/api-error.js';
import { createNotificationForUser } from '../notifications/notification.service.js';
import { findUserById } from '../users/user.service.js';
import {
  findJobAnalysisById,
  updateJobAnalysisAts,
} from '../job-intake/job-analysis.repository.js';
import { ResumeModelRef } from '../resumes/resume.model.js';
import { findResumeById } from '../resumes/resume.repository.js';
import { runAtsEngine } from './ats.engine.js';

export async function analyzeAtsForUser(input: {
  userId: string;
  jobAnalysisId: string;
  resumeId?: string;
}): Promise<JobAnalysis> {
  const analysisDoc = await findJobAnalysisById(input.userId, input.jobAnalysisId);
  if (!analysisDoc) throw ApiError.notFound('Job analysis not found');

  const resumeId =
    input.resumeId ??
    (analysisDoc.resumeId ? String(analysisDoc.resumeId) : undefined);

  if (!resumeId) {
    throw ApiError.badRequest(
      'No resume linked to this job analysis. Upload a resume from the workflow (Step 2) first.',
    );
  }

  const resumeDoc = await findResumeById(input.userId, resumeId);
  if (!resumeDoc) throw ApiError.notFound('Resume not found');

  const result = runAtsEngine(
    {
      extractedSkills: analysisDoc.extractedSkills,
      extractedKeywords: analysisDoc.extractedKeywords,
      toolsAndTechnologies: analysisDoc.toolsAndTechnologies ?? [],
    },
    {
      rawText: resumeDoc.rawText,
      parsedData: resumeDoc.parsedData,
    },
  );

  const updated = await updateJobAnalysisAts(input.userId, input.jobAnalysisId, {
    atsScore: result.atsScore,
    matchPercent: result.matchPercent,
    missingKeywords: result.missingKeywords,
    weakBullets: result.weakBullets,
    formattingSuggestions: result.formattingSuggestions,
    aiSuggestions: result.aiSuggestions,
    skillGaps: result.skillGaps,
  });

  if (!updated) throw ApiError.notFound('Job analysis not found');

  await ResumeModelRef.updateOne(
    { _id: resumeId, userId: input.userId },
    { $set: { latestATSScore: result.atsScore } },
  );

  const analysis = updated.toPublic();

  const owner = await findUserById(input.userId);
  if (owner?.preferences?.inAppAnalysisReady !== false) {
    void createNotificationForUser({
      userId: input.userId,
      type: NotificationType.AnalysisCompleted,
      title: 'ATS analysis ready',
      message: `Match score ${result.matchPercent}% for "${analysis.extractedRole}".`,
      metadata: { jobAnalysisId: input.jobAnalysisId },
    }).catch(() => {});
  }

  return analysis;
}
