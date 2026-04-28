import type { NotificationType, ResumeSourceType, SeniorityLevel, UserRole } from '../enums/index.js';

/* -------------------------------------------------------------------------- */
/*                              API envelope types                            */
/* -------------------------------------------------------------------------- */

/** Successful response envelope used by every backend route. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

/** Error response envelope used by every backend route. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/* -------------------------------------------------------------------------- */
/*                                  Domain                                    */
/* -------------------------------------------------------------------------- */

export interface UserProfile {
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  preferredLocations: string[];
  summary: string;
}

export type AuthProvider = 'local' | 'google';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  provider: AuthProvider;
  emailVerified: boolean;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

/** Successful login / register / refresh response. */
export interface AuthSession {
  user: User;
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface ResumeBasics {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  links?: { label: string; url: string }[];
}

export interface ResumeExperience {
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  details?: string;
}

export interface ResumeProject {
  name: string;
  description?: string;
  url?: string;
  bullets: string[];
}

export interface ResumeCertification {
  name: string;
  issuer?: string;
  issueDate?: string;
  url?: string;
}

export interface ResumeStructuredData {
  basics: ResumeBasics;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
}

export interface Resume {
  id: string;
  userId: string;
  originalFileName: string;
  fileUrl?: string;
  /** Present when this resume was uploaded in the context of a JD analysis. */
  jobAnalysisId?: string;
  mimeType: string;
  fileSize: number;
  rawText: string;
  parsedData: ResumeStructuredData;
  latestATSScore?: number;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight projection used by the "your resumes" list. */
export interface ResumeListItem {
  id: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  fullName: string;
  email: string;
  topSkills: string[];
  experienceCount: number;
  educationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  userId: string;
  resumeId: string;
  sourceType: ResumeSourceType;
  structuredData: ResumeStructuredData;
  pdfUrl?: string;
  createdAt: string;
}

export interface JobAnalysis {
  id: string;
  userId: string;
  resumeId?: string;
  jobDescription: string;
  extractedRole: string;
  extractedSkills: string[];
  extractedKeywords: string[];
  seniorityLevel: SeniorityLevel;
  responsibilities: string[];
  preferredQualifications?: string[];
  toolsAndTechnologies?: string[];
  atsScore?: number;
  matchPercent?: number;
  missingKeywords?: string[];
  weakBullets?: string[];
  formattingSuggestions?: string[];
  aiSuggestions?: string[];
  skillGaps?: string[];
  createdAt: string;
}

/**
 * Lightweight projection of {@link JobAnalysis} returned by the list
 * endpoint. Heavy fields (full JD text, full keyword list) are omitted
 * to keep the payload small for sidebars / "recent" views.
 */
export interface JobAnalysisListItem {
  id: string;
  extractedRole: string;
  seniorityLevel: SeniorityLevel;
  topSkills: string[];
  jobDescriptionPreview: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
