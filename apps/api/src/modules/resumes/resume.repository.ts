import type { ResumeStructuredData } from '@hireboost/shared';
import type { Types } from 'mongoose';

import { ResumeModelRef, type ResumeDocument } from './resume.model.js';

export interface CreateResumeInput {
  userId: string | Types.ObjectId;
  jobAnalysisId?: string | Types.ObjectId;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  rawText: string;
  parsedData: ResumeStructuredData;
}

export async function createResume(input: CreateResumeInput): Promise<ResumeDocument> {
  return ResumeModelRef.create(input);
}

export async function findResumeById(
  userId: string | Types.ObjectId,
  id: string,
): Promise<ResumeDocument | null> {
  if (!isObjectId(id)) return null;
  return ResumeModelRef.findOne({ _id: id, userId });
}

export async function listResumesForUser(
  userId: string | Types.ObjectId,
  limit: number,
): Promise<ResumeDocument[]> {
  return ResumeModelRef.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function deleteResume(
  userId: string | Types.ObjectId,
  id: string,
): Promise<ResumeDocument | null> {
  if (!isObjectId(id)) return null;
  // Return the deleted doc so the caller can clean up the file on disk.
  return ResumeModelRef.findOneAndDelete({ _id: id, userId });
}

function isObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value);
}
