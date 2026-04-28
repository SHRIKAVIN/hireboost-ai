import { z } from 'zod';

import {
  MAX_JOB_DESCRIPTION_LENGTH,
  MIN_JOB_DESCRIPTION_LENGTH,
} from '../constants/index.js';

/**
 * Schemas exported from the shared package can be reused by:
 *   - apps/web (React Hook Form + zodResolver)
 *   - apps/api (request validation middleware)
 *
 * Keep these schemas framework-agnostic. Do NOT import Express,
 * React, or anything app-specific from here.
 */

/* -------------------------- Auth -------------------------- */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type RegisterInput = z.infer<typeof registerSchema>;

/* ---------------------- Job Description ------------------- */

export const jobDescriptionSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(MIN_JOB_DESCRIPTION_LENGTH, 'Please paste a longer job description')
    .max(MAX_JOB_DESCRIPTION_LENGTH, 'Job description is too long'),
});
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;

/**
 * Query params for listing recent job analyses. The defaults give the
 * UI a sane "last 10 analyses" feed without any explicit params.
 */
export const jobAnalysisListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type JobAnalysisListQuery = z.infer<typeof jobAnalysisListQuerySchema>;

/* ---------------------- Resumes -------------------------- */

/**
 * Query params for listing the current user's resumes.
 * Mirrors `jobAnalysisListQuerySchema` so the UI can use the same
 * "recent items sidebar" pattern across features.
 */
export const resumeListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type ResumeListQuery = z.infer<typeof resumeListQuerySchema>;

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

/* ---------------------- ATS (Phase 7) -------------------- */

export const atsAnalyzeSchema = z.object({
  jobAnalysisId: objectIdString,
  /** When omitted, the resume linked on the job analysis (`resumeId`) is used. */
  resumeId: objectIdString.optional(),
});
export type AtsAnalyzeInput = z.infer<typeof atsAnalyzeSchema>;

/** Same shape as ATS analyze — job + optional explicit resume id. */
export const resumeEnhanceRequestSchema = atsAnalyzeSchema;
export type ResumeEnhanceInput = z.infer<typeof resumeEnhanceRequestSchema>;

/* ---------------------- Resume JSON (AI parse) ------------ */

const resumeLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const resumeBasicsSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(resumeLinkSchema).optional(),
});

const resumeExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  bullets: z.array(z.string()).default([]),
});

const resumeEducationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  details: z.string().optional(),
});

const resumeProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

const resumeCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  url: z.string().optional(),
});

export const resumeStructuredDataSchema = z.object({
  basics: resumeBasicsSchema,
  summary: z.string(),
  skills: z.array(z.string()).default([]),
  experience: z.array(resumeExperienceSchema).default([]),
  education: z.array(resumeEducationSchema).default([]),
  projects: z.array(resumeProjectSchema).default([]),
  certifications: z.array(resumeCertificationSchema).default([]),
});

export const resumeEnhancementResponseSchema = z.object({
  enhancedStructuredData: resumeStructuredDataSchema,
  highlights: z.array(z.string()).max(25).default([]),
});

/* ---------------------- Contact form ---------------------- */

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message is too short').max(5000, 'Message is too long'),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
