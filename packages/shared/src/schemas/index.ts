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

/* ---------------------- Contact form ---------------------- */

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message is too short').max(5000, 'Message is too long'),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
