import type {
  Resume as ResumePublic,
  ResumeBasics,
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeListItem,
  ResumeProject,
  ResumeStructuredData,
} from '@hireboost/shared';
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

export interface ResumeFields {
  userId: Types.ObjectId;
  /** Optional link to the job description analysis this upload was tied to. */
  jobAnalysisId?: Types.ObjectId;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  rawText: string;
  parsedData: ResumeStructuredData;
  latestATSScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeMethods {
  toPublic(): ResumePublic;
  toListItem(): ResumeListItem;
}

export type ResumeDocument = HydratedDocument<ResumeFields, ResumeMethods>;
export type ResumeModel = Model<ResumeFields, Record<string, never>, ResumeMethods>;

/* -------------------------------------------------------------------------- */
/*                              Subschemas                                    */
/* -------------------------------------------------------------------------- */

// Subdocs are stored as plain objects (`_id: false`) — we never query them
// individually and avoiding nested ObjectIds keeps the parsed payload clean.

const linkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const basicsSchema = new Schema<ResumeBasics>(
  {
    fullName: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    links: { type: [linkSchema], default: [] },
  },
  { _id: false },
);

const experienceSchema = new Schema<ResumeExperience>(
  {
    company: { type: String, default: '', trim: true },
    role: { type: String, default: '', trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
  },
  { _id: false },
);

const educationSchema = new Schema<ResumeEducation>(
  {
    institution: { type: String, default: '', trim: true },
    degree: { type: String, trim: true },
    field: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    details: { type: String, trim: true },
  },
  { _id: false },
);

const projectSchema = new Schema<ResumeProject>(
  {
    name: { type: String, default: '', trim: true },
    description: { type: String, trim: true },
    url: { type: String, trim: true },
    bullets: { type: [String], default: [] },
  },
  { _id: false },
);

const certificationSchema = new Schema<ResumeCertification>(
  {
    name: { type: String, default: '', trim: true },
    issuer: { type: String, trim: true },
    issueDate: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false },
);

const structuredDataSchema = new Schema<ResumeStructuredData>(
  {
    basics: { type: basicsSchema, default: () => ({}) },
    summary: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
  },
  { _id: false },
);

/* -------------------------------------------------------------------------- */
/*                             Top-level schema                               */
/* -------------------------------------------------------------------------- */

const resumeSchema = new Schema<ResumeFields, ResumeModel, ResumeMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'JobAnalysis',
      index: true,
      sparse: true,
    },
    originalFileName: { type: String, required: true, trim: true },
    storagePath: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 0 },
    rawText: { type: String, required: true, default: '' },
    parsedData: { type: structuredDataSchema, default: () => ({}) },
    latestATSScore: { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// "Give me this user's most recent resumes" — the dominant query pattern.
resumeSchema.index({ userId: 1, createdAt: -1 });

/* -------------------------------------------------------------------------- */
/*                                 Methods                                    */
/* -------------------------------------------------------------------------- */

resumeSchema.method('toPublic', function (this: ResumeDocument): ResumePublic {
  return {
    id: String(this._id),
    userId: String(this.userId),
    originalFileName: this.originalFileName,
    ...(this.jobAnalysisId && { jobAnalysisId: String(this.jobAnalysisId) }),
    mimeType: this.mimeType,
    fileSize: this.fileSize,
    rawText: this.rawText,
    parsedData: cloneStructuredData(this.parsedData),
    latestATSScore: this.latestATSScore,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
});

resumeSchema.method('toListItem', function (this: ResumeDocument): ResumeListItem {
  const basics = this.parsedData?.basics ?? { fullName: '', email: '' };
  const skills = this.parsedData?.skills ?? [];
  return {
    id: String(this._id),
    originalFileName: this.originalFileName,
    mimeType: this.mimeType,
    fileSize: this.fileSize,
    fullName: basics.fullName || '',
    email: basics.email || '',
    topSkills: skills.slice(0, 6),
    experienceCount: this.parsedData?.experience?.length ?? 0,
    educationCount: this.parsedData?.education?.length ?? 0,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
});

/**
 * Return a plain JS deep copy of a Mongoose-hydrated structured data
 * object. We don't want to leak Mongoose internal symbols / methods
 * to the API response.
 */
function cloneStructuredData(data: ResumeStructuredData): ResumeStructuredData {
  return {
    basics: {
      fullName: data.basics?.fullName ?? '',
      email: data.basics?.email ?? '',
      phone: data.basics?.phone,
      location: data.basics?.location,
      links: (data.basics?.links ?? []).map((l) => ({ label: l.label, url: l.url })),
    },
    summary: data.summary ?? '',
    skills: [...(data.skills ?? [])],
    experience: (data.experience ?? []).map((e) => ({
      company: e.company,
      role: e.role,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      bullets: [...(e.bullets ?? [])],
    })),
    education: (data.education ?? []).map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate,
      endDate: e.endDate,
      details: e.details,
    })),
    projects: (data.projects ?? []).map((p) => ({
      name: p.name,
      description: p.description,
      url: p.url,
      bullets: [...(p.bullets ?? [])],
    })),
    certifications: (data.certifications ?? []).map((c) => ({
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate,
      url: c.url,
    })),
  };
}

export const ResumeModelRef = model<ResumeFields, ResumeModel>('Resume', resumeSchema);
