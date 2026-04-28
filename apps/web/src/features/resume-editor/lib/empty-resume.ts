import type { ResumeStructuredData } from '@hireboost/shared';

export function emptyResumeStructuredData(): ResumeStructuredData {
  return {
    basics: { fullName: '', email: '', phone: '', location: '', links: [] },
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };
}
