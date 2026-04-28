import type {
  JobAnalysis as JobAnalysisPublic,
  JobAnalysisListItem,
  SeniorityLevel,
} from '@hireboost/shared';
import { SeniorityLevel as SeniorityLevelEnum } from '@hireboost/shared';
import {
  Schema,
  Types,
  model,
  type HydratedDocument,
  type Model,
} from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface JobAnalysisFields {
  userId: Types.ObjectId;
  resumeId?: Types.ObjectId;
  jobDescription: string;
  extractedRole: string;
  extractedSkills: string[];
  extractedKeywords: string[];
  seniorityLevel: SeniorityLevel;
  responsibilities: string[];
  preferredQualifications: string[];
  toolsAndTechnologies: string[];
  /** Filled by Phase 7 ATS engine after `POST /ats/analyze`. */
  atsScore?: number;
  matchPercent?: number;
  missingKeywords?: string[];
  weakBullets?: string[];
  formattingSuggestions?: string[];
  aiSuggestions?: string[];
  skillGaps?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JobAnalysisMethods {
  toPublic(): JobAnalysisPublic;
  toListItem(): JobAnalysisListItem;
}

export type JobAnalysisDocument = HydratedDocument<JobAnalysisFields, JobAnalysisMethods>;
export type JobAnalysisModel = Model<
  JobAnalysisFields,
  Record<string, never>,
  JobAnalysisMethods
>;

/* -------------------------------------------------------------------------- */
/*                                  Schema                                    */
/* -------------------------------------------------------------------------- */

const jobAnalysisSchema = new Schema<JobAnalysisFields, JobAnalysisModel, JobAnalysisMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jobDescription: { type: String, required: true, trim: true },
    extractedRole: { type: String, required: true, trim: true, default: '' },
    extractedSkills: { type: [String], default: [] },
    extractedKeywords: { type: [String], default: [] },
    seniorityLevel: {
      type: String,
      enum: Object.values(SeniorityLevelEnum),
      default: SeniorityLevelEnum.Mid,
      required: true,
    },
    responsibilities: { type: [String], default: [] },
    preferredQualifications: { type: [String], default: [] },
    toolsAndTechnologies: { type: [String], default: [] },
    atsScore: { type: Number, min: 0, max: 100 },
    matchPercent: { type: Number, min: 0, max: 100 },
    missingKeywords: { type: [String], default: [] },
    weakBullets: { type: [String], default: [] },
    formattingSuggestions: { type: [String], default: [] },
    aiSuggestions: { type: [String], default: [] },
    skillGaps: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Most queries are "give me the user's latest analyses".
jobAnalysisSchema.index({ userId: 1, createdAt: -1 });

/* -------------------------------------------------------------------------- */
/*                                 Methods                                    */
/* -------------------------------------------------------------------------- */

jobAnalysisSchema.method('toPublic', function (this: JobAnalysisDocument): JobAnalysisPublic {
  return {
    id: String(this._id),
    userId: String(this.userId),
    resumeId: this.resumeId ? String(this.resumeId) : undefined,
    jobDescription: this.jobDescription,
    extractedRole: this.extractedRole,
    extractedSkills: [...this.extractedSkills],
    extractedKeywords: [...this.extractedKeywords],
    seniorityLevel: this.seniorityLevel,
    responsibilities: [...this.responsibilities],
    preferredQualifications: [...this.preferredQualifications],
    toolsAndTechnologies: [...this.toolsAndTechnologies],
    ...(this.atsScore !== undefined
      ? {
          atsScore: this.atsScore,
          matchPercent: this.matchPercent ?? 0,
          missingKeywords: [...(this.missingKeywords ?? [])],
          weakBullets: [...(this.weakBullets ?? [])],
          formattingSuggestions: [...(this.formattingSuggestions ?? [])],
          aiSuggestions: [...(this.aiSuggestions ?? [])],
          skillGaps: [...(this.skillGaps ?? [])],
        }
      : {}),
    createdAt: this.createdAt.toISOString(),
  };
});

jobAnalysisSchema.method('toListItem', function (this: JobAnalysisDocument): JobAnalysisListItem {
  const preview = this.jobDescription.slice(0, 180).replace(/\s+/g, ' ').trim();
  return {
    id: String(this._id),
    extractedRole: this.extractedRole || 'Untitled role',
    seniorityLevel: this.seniorityLevel,
    topSkills: this.extractedSkills.slice(0, 6),
    jobDescriptionPreview: preview + (this.jobDescription.length > 180 ? '…' : ''),
    createdAt: this.createdAt.toISOString(),
  };
});

export const JobAnalysisModelRef = model<JobAnalysisFields, JobAnalysisModel>(
  'JobAnalysis',
  jobAnalysisSchema,
);
