import type { ResumeStructuredData } from '@hireboost/shared';

/**
 * Deterministic ATS-style analyzer (Phase 7). No AI — keyword coverage,
 * structure, and bullet heuristics only. Phase 8 can layer LLM suggestions
 * on top without changing this contract.
 */

export interface AtsJobContext {
  extractedSkills: string[];
  extractedKeywords: string[];
  toolsAndTechnologies: string[];
}

export interface AtsResumeContext {
  rawText: string;
  parsedData: ResumeStructuredData;
}

export interface AtsEngineResult {
  atsScore: number;
  matchPercent: number;
  missingKeywords: string[];
  weakBullets: string[];
  formattingSuggestions: string[];
  aiSuggestions: string[];
  skillGaps: string[];
}

const WEAK_OPENERS =
  /^(responsible for|helped with|worked on|duties included|tasked with|involved in)\b/i;

export function runAtsEngine(job: AtsJobContext, resume: AtsResumeContext): AtsEngineResult {
  const haystack = buildHaystack(resume);
  const keywordUniverse = buildKeywordUniverse(job);

  const missingKeywords: string[] = [];
  let matched = 0;
  for (const term of keywordUniverse) {
    if (termInHaystack(term, haystack)) matched++;
    else missingKeywords.push(term);
  }

  const matchPercent =
    keywordUniverse.length === 0 ? 100 : Math.round((100 * matched) / keywordUniverse.length);

  const skillGaps = job.extractedSkills.filter((s) => !termInHaystack(s, haystack));

  const weakBullets = collectWeakBullets(resume.parsedData);
  const formattingSuggestions = collectFormattingIssues(resume);

  const structureScore = scoreStructure(resume.parsedData);
  const bulletQuality = Math.max(35, 100 - Math.min(60, weakBullets.length * 10));

  const atsScore = clamp(
    Math.round(0.45 * matchPercent + 0.28 * structureScore + 0.27 * bulletQuality),
    0,
    100,
  );

  const aiSuggestions = buildDeterministicTips(missingKeywords, skillGaps, weakBullets.length);

  return {
    atsScore,
    matchPercent,
    missingKeywords: missingKeywords.slice(0, 40),
    weakBullets: weakBullets.slice(0, 15),
    formattingSuggestions: formattingSuggestions.slice(0, 12),
    aiSuggestions,
    skillGaps: skillGaps.slice(0, 20),
  };
}

function buildKeywordUniverse(job: AtsJobContext): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (label: string) => {
    const t = label.trim();
    if (t.length < 2) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  };

  for (const s of job.extractedSkills) push(s);
  for (const t of job.toolsAndTechnologies) push(t);
  for (const k of job.extractedKeywords.slice(0, 35)) push(k);

  return out;
}

function buildHaystack(resume: AtsResumeContext): string {
  const p = resume.parsedData;
  const parts: string[] = [resume.rawText, p.summary ?? ''];
  parts.push((p.skills ?? []).join(' '));
  for (const e of p.experience ?? []) {
    parts.push(e.company, e.role, ...(e.bullets ?? []));
  }
  for (const ed of p.education ?? []) {
    parts.push(ed.institution, ed.degree ?? '', ed.field ?? '', ed.details ?? '');
  }
  for (const pr of p.projects ?? []) {
    parts.push(pr.name, pr.description ?? '', ...(pr.bullets ?? []));
  }
  for (const c of p.certifications ?? []) {
    parts.push(c.name, c.issuer ?? '');
  }
  const basics = p.basics;
  if (basics) {
    parts.push(basics.fullName, basics.email, basics.phone ?? '', basics.location ?? '');
    for (const l of basics.links ?? []) parts.push(l.url, l.label);
  }
  return parts.join('\n').toLowerCase();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termInHaystack(term: string, haystack: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  if (t.includes(' ')) return haystack.includes(t);
  if (t.length <= 3) {
    const re = new RegExp(`\\b${escapeRegex(t)}\\b`, 'i');
    return re.test(haystack);
  }
  return haystack.includes(t);
}

function scoreStructure(p: ResumeStructuredData): number {
  let s = 0;
  if ((p.summary ?? '').trim().length >= 50) s += 30;
  else if ((p.summary ?? '').trim().length >= 20) s += 15;

  const skillCount = p.skills?.length ?? 0;
  if (skillCount >= 6) s += 25;
  else if (skillCount >= 3) s += 18;
  else if (skillCount >= 1) s += 10;

  const expCount = p.experience?.length ?? 0;
  if (expCount >= 2) s += 25;
  else if (expCount === 1) s += 18;
  if ((p.basics?.email ?? '').includes('@')) s += 12;
  if ((p.education?.length ?? 0) > 0) s += 8;
  return clamp(s, 0, 100);
}

function collectWeakBullets(p: ResumeStructuredData): string[] {
  const out: string[] = [];

  const check = (bullet: string) => {
    const b = bullet.replace(/\s+/g, ' ').trim();
    if (b.length < 25) {
      out.push(`Too short: "${truncate(b, 90)}"`);
      return;
    }
    if (WEAK_OPENERS.test(b)) {
      out.push(`Weak opener — lead with impact: "${truncate(b, 90)}"`);
      return;
    }
    const words = b.split(/\s+/).length;
    if (words < 10 && !/\d/.test(b)) {
      out.push(`Add metrics or scope: "${truncate(b, 90)}"`);
    } else if (!/\d|%|\$|k\b|m\b|million|billion|x\s/i.test(b) && words < 14) {
      out.push(`Consider quantifying: "${truncate(b, 90)}"`);
    }
  };

  for (const e of p.experience ?? []) {
    for (const bullet of e.bullets ?? []) check(bullet);
  }
  for (const pr of p.projects ?? []) {
    for (const bullet of pr.bullets ?? []) check(bullet);
  }

  return out;
}

function collectFormattingIssues(resume: AtsResumeContext): string[] {
  const p = resume.parsedData;
  const issues: string[] = [];
  const textLen = resume.rawText.trim().length;

  if (textLen < 400) {
    issues.push('Resume text is very short — ATS systems and recruiters expect richer detail.');
  }
  if (!(p.basics?.email ?? '').includes('@')) {
    issues.push('No email detected in the header — ensure contact info is machine-readable.');
  }
  if (!(p.summary ?? '').trim()) {
    issues.push('Add a 2–4 sentence professional summary targeting the role.');
  }
  if ((p.skills?.length ?? 0) < 4) {
    issues.push('Skills section looks thin — list hard skills that mirror the job posting.');
  }
  if ((p.experience?.length ?? 0) === 0) {
    issues.push('No work experience blocks detected — check section headings (e.g. "Experience").');
  }

  let bulletCount = 0;
  for (const e of p.experience ?? []) bulletCount += e.bullets?.length ?? 0;
  if ((p.experience?.length ?? 0) > 0 && bulletCount < 3) {
    issues.push('Few accomplishment bullets — expand with action → scope → result.');
  }

  return issues;
}

function buildDeterministicTips(
  missing: string[],
  skillGaps: string[],
  weakCount: number,
): string[] {
  const tips: string[] = [];
  if (missing.length > 0) {
    const sample = missing.slice(0, 5).join(', ');
    tips.push(`Weave these missing keywords into your bullets (naturally): ${sample}.`);
  }
  if (skillGaps.length > 0) {
    tips.push(
      `Close skill gaps called out in the JD: ${skillGaps.slice(0, 5).join(', ')} — add proof in experience.`,
    );
  }
  if (weakCount > 0) {
    tips.push(
      `Strengthen ${weakCount} bullet(s) with stronger verbs, numbers, and business outcomes.`,
    );
  }
  if (tips.length === 0) {
    tips.push('Strong baseline match — fine-tune wording to mirror the job title and seniority.');
  }
  return tips.slice(0, 6);
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
