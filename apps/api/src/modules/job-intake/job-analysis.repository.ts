import type { Types } from 'mongoose';

import { JobAnalysisModelRef, type JobAnalysisDocument } from './job-analysis.model.js';

export interface CreateJobAnalysisInput {
  userId: string | Types.ObjectId;
  jobDescription: string;
  extractedRole: string;
  extractedSkills: string[];
  extractedKeywords: string[];
  seniorityLevel: JobAnalysisDocument['seniorityLevel'];
  responsibilities: string[];
  preferredQualifications: string[];
  toolsAndTechnologies: string[];
}

export async function createJobAnalysis(
  input: CreateJobAnalysisInput,
): Promise<JobAnalysisDocument> {
  return JobAnalysisModelRef.create(input);
}

export async function findJobAnalysisById(
  userId: string | Types.ObjectId,
  id: string,
): Promise<JobAnalysisDocument | null> {
  if (!isObjectId(id)) return null;
  return JobAnalysisModelRef.findOne({ _id: id, userId });
}

export async function listJobAnalysesForUser(
  userId: string | Types.ObjectId,
  limit: number,
): Promise<JobAnalysisDocument[]> {
  return JobAnalysisModelRef.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function deleteJobAnalysis(
  userId: string | Types.ObjectId,
  id: string,
): Promise<boolean> {
  if (!isObjectId(id)) return false;
  const res = await JobAnalysisModelRef.deleteOne({ _id: id, userId });
  return res.deletedCount === 1;
}

/**
 * Attach a resume to a job analysis (user-scoped). Called after a successful
 * resume ingest when the client supplied `jobAnalysisId` on upload.
 */
export async function setJobAnalysisResumeId(
  userId: string | Types.ObjectId,
  jobAnalysisId: string,
  resumeId: string | Types.ObjectId,
): Promise<boolean> {
  if (!isObjectId(jobAnalysisId) || !isObjectId(String(resumeId))) return false;
  const res = await JobAnalysisModelRef.updateOne(
    { _id: jobAnalysisId, userId },
    { $set: { resumeId } },
  );
  return res.matchedCount === 1;
}

function isObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value);
}
