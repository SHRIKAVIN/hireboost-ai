export const UserRole = {
  User: 'user',
  Admin: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ResumeSourceType = {
  Uploaded: 'uploaded',
  AiEnhanced: 'ai-enhanced',
  EditorUpdated: 'editor-updated',
} as const;
export type ResumeSourceType = (typeof ResumeSourceType)[keyof typeof ResumeSourceType];

export const SeniorityLevel = {
  Intern: 'intern',
  Junior: 'junior',
  Mid: 'mid',
  Senior: 'senior',
  Lead: 'lead',
  Principal: 'principal',
  Director: 'director',
} as const;
export type SeniorityLevel = (typeof SeniorityLevel)[keyof typeof SeniorityLevel];

export const NotificationType = {
  ResumeAnalyzed: 'resume-analyzed',
  ChangesReady: 'changes-ready',
  ProfileIncomplete: 'profile-incomplete',
  AnalysisCompleted: 'analysis-completed',
  System: 'system',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const AiProvider = {
  Gemini: 'gemini',
  OpenAi: 'openai',
} as const;
export type AiProvider = (typeof AiProvider)[keyof typeof AiProvider];
