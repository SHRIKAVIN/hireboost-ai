import type {
  ResumeBasics,
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeStructuredData,
} from '@hireboost/shared';

export type TextChange =
  | { status: 'unchanged'; value: string }
  | { status: 'changed'; before: string; after: string };

export interface BasicsDiff {
  fullName: TextChange;
  email: TextChange;
  phone: TextChange;
  location: TextChange;
  links: { before: ResumeBasics['links']; after: ResumeBasics['links'] };
  linksEqual: boolean;
}

export interface SkillsDiff {
  added: string[];
  removed: string[];
  unchanged: string[];
}

export type BulletChange =
  | { status: 'same'; text: string }
  | { status: 'removed'; text: string }
  | { status: 'added'; text: string }
  | { status: 'changed'; before: string; after: string };

export interface ExperienceDiffRow {
  index: number;
  company: TextChange;
  role: TextChange;
  location: TextChange;
  startDate: TextChange;
  endDate: TextChange;
  current: { before: boolean | undefined; after: boolean | undefined; equal: boolean };
  bullets: BulletChange[];
  /** New row entirely in enhanced (split from prior row count). */
  rowKind: 'paired' | 'added' | 'removed';
}

export interface EducationDiffRow {
  index: number;
  institution: TextChange;
  degree: TextChange;
  field: TextChange;
  startDate: TextChange;
  endDate: TextChange;
  details: TextChange;
  rowKind: 'paired' | 'added' | 'removed';
}

export interface ProjectDiffRow {
  index: number;
  name: TextChange;
  description: TextChange;
  url: TextChange;
  bullets: BulletChange[];
  rowKind: 'paired' | 'added' | 'removed';
}

export interface CertificationDiffRow {
  index: number;
  name: TextChange;
  issuer: TextChange;
  issueDate: TextChange;
  url: TextChange;
  rowKind: 'paired' | 'added' | 'removed';
}

export interface StructuredResumeDiff {
  basics: BasicsDiff;
  summary: TextChange;
  skills: SkillsDiff;
  experience: ExperienceDiffRow[];
  education: EducationDiffRow[];
  projects: ProjectDiffRow[];
  certifications: CertificationDiffRow[];
}

function norm(s: string | undefined): string {
  return (s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function textChange(before: string | undefined, after: string | undefined): TextChange {
  const b = before ?? '';
  const a = after ?? '';
  if (norm(b) === norm(a)) return { status: 'unchanged', value: b };
  return { status: 'changed', before: b, after: a };
}

function linksEqual(
  a: ResumeBasics['links'] | undefined,
  b: ResumeBasics['links'] | undefined,
): boolean {
  const left = a ?? [];
  const right = b ?? [];
  if (left.length !== right.length) return false;
  const ser = (x: NonNullable<ResumeBasics['links']>) =>
    [...x]
      .map((l) => `${norm(l.label)}|${norm(l.url)}`)
      .sort()
      .join(';;');
  return ser(left) === ser(right);
}

export function buildBasicsDiff(before: ResumeBasics, after: ResumeBasics): BasicsDiff {
  return {
    fullName: textChange(before.fullName, after.fullName),
    email: textChange(before.email, after.email),
    phone: textChange(before.phone, after.phone),
    location: textChange(before.location, after.location),
    links: { before: before.links, after: after.links },
    linksEqual: linksEqual(before.links, after.links),
  };
}

export function buildSkillsDiff(before: string[], after: string[]): SkillsDiff {
  const map = (xs: string[]) => new Map(xs.map((s) => [norm(s), s.trim()]));
  const bMap = map(before);
  const aMap = map(after);
  const unchanged: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  for (const [k, v] of aMap) {
    if (bMap.has(k)) unchanged.push(v);
    else added.push(v);
  }
  for (const [k, v] of bMap) {
    if (!aMap.has(k)) removed.push(v);
  }
  return { added, removed, unchanged };
}

function diffBullets(before: string[], after: string[]): BulletChange[] {
  const max = Math.max(before.length, after.length);
  const out: BulletChange[] = [];
  for (let i = 0; i < max; i++) {
    const b = before[i];
    const a = after[i];
    if (b === undefined && a !== undefined) {
      out.push({ status: 'added', text: a });
      continue;
    }
    if (a === undefined && b !== undefined) {
      out.push({ status: 'removed', text: b });
      continue;
    }
    if (b !== undefined && a !== undefined) {
      if (norm(b) === norm(a)) out.push({ status: 'same', text: b });
      else out.push({ status: 'changed', before: b, after: a });
    }
  }
  return out;
}

export function buildExperienceDiff(
  before: ResumeExperience[],
  after: ResumeExperience[],
): ExperienceDiffRow[] {
  const max = Math.max(before.length, after.length);
  const rows: ExperienceDiffRow[] = [];
  for (let i = 0; i < max; i++) {
    const b = before[i];
    const a = after[i];
    let rowKind: ExperienceDiffRow['rowKind'] = 'paired';
    if (!b && a) rowKind = 'added';
    if (b && !a) rowKind = 'removed';

    const eb = b ?? ({} as ResumeExperience);
    const ea = a ?? ({} as ResumeExperience);

    rows.push({
      index: i,
      company: textChange(eb.company, ea.company),
      role: textChange(eb.role, ea.role),
      location: textChange(eb.location, ea.location),
      startDate: textChange(eb.startDate, ea.startDate),
      endDate: textChange(eb.endDate, ea.endDate),
      current: {
        before: eb.current,
        after: ea.current,
        equal: Boolean(eb.current) === Boolean(ea.current),
      },
      bullets: diffBullets(b?.bullets ?? [], a?.bullets ?? []),
      rowKind,
    });
  }
  return rows;
}

export function buildEducationDiff(
  before: ResumeEducation[],
  after: ResumeEducation[],
): EducationDiffRow[] {
  const max = Math.max(before.length, after.length);
  const rows: EducationDiffRow[] = [];
  for (let i = 0; i < max; i++) {
    const b = before[i];
    const a = after[i];
    let rowKind: EducationDiffRow['rowKind'] = 'paired';
    if (!b && a) rowKind = 'added';
    if (b && !a) rowKind = 'removed';
    const eb = b ?? ({} as ResumeEducation);
    const ea = a ?? ({} as ResumeEducation);
    rows.push({
      index: i,
      institution: textChange(eb.institution, ea.institution),
      degree: textChange(eb.degree, ea.degree),
      field: textChange(eb.field, ea.field),
      startDate: textChange(eb.startDate, ea.startDate),
      endDate: textChange(eb.endDate, ea.endDate),
      details: textChange(eb.details, ea.details),
      rowKind,
    });
  }
  return rows;
}

export function buildProjectsDiff(before: ResumeProject[], after: ResumeProject[]): ProjectDiffRow[] {
  const max = Math.max(before.length, after.length);
  const rows: ProjectDiffRow[] = [];
  for (let i = 0; i < max; i++) {
    const b = before[i];
    const a = after[i];
    let rowKind: ProjectDiffRow['rowKind'] = 'paired';
    if (!b && a) rowKind = 'added';
    if (b && !a) rowKind = 'removed';
    const eb = b ?? ({} as ResumeProject);
    const ea = a ?? ({} as ResumeProject);
    rows.push({
      index: i,
      name: textChange(eb.name, ea.name),
      description: textChange(eb.description, ea.description),
      url: textChange(eb.url, ea.url),
      bullets: diffBullets(b?.bullets ?? [], a?.bullets ?? []),
      rowKind,
    });
  }
  return rows;
}

export function buildCertificationsDiff(
  before: ResumeCertification[],
  after: ResumeCertification[],
): CertificationDiffRow[] {
  const max = Math.max(before.length, after.length);
  const rows: CertificationDiffRow[] = [];
  for (let i = 0; i < max; i++) {
    const b = before[i];
    const a = after[i];
    let rowKind: CertificationDiffRow['rowKind'] = 'paired';
    if (!b && a) rowKind = 'added';
    if (b && !a) rowKind = 'removed';
    const eb = b ?? ({} as ResumeCertification);
    const ea = a ?? ({} as ResumeCertification);
    rows.push({
      index: i,
      name: textChange(eb.name, ea.name),
      issuer: textChange(eb.issuer, ea.issuer),
      issueDate: textChange(eb.issueDate, ea.issueDate),
      url: textChange(eb.url, ea.url),
      rowKind,
    });
  }
  return rows;
}

export function buildStructuredResumeDiff(
  before: ResumeStructuredData,
  after: ResumeStructuredData,
): StructuredResumeDiff {
  return {
    basics: buildBasicsDiff(before.basics, after.basics),
    summary: textChange(before.summary, after.summary),
    skills: buildSkillsDiff(before.skills, after.skills),
    experience: buildExperienceDiff(before.experience, after.experience),
    education: buildEducationDiff(before.education, after.education),
    projects: buildProjectsDiff(before.projects, after.projects),
    certifications: buildCertificationsDiff(before.certifications, after.certifications),
  };
}

export function countStructuralChanges(d: StructuredResumeDiff): number {
  let n = 0;
  const bumpText = (t: TextChange) => {
    if (t.status === 'changed') n += 1;
  };
  bumpText(d.summary);
  bumpText(d.basics.fullName);
  bumpText(d.basics.email);
  bumpText(d.basics.phone);
  bumpText(d.basics.location);
  if (!d.basics.linksEqual) n += 1;
  n += d.skills.added.length + d.skills.removed.length;

  for (const row of d.experience) {
    if (row.rowKind !== 'paired') n += 1;
    bumpText(row.company);
    bumpText(row.role);
    bumpText(row.location);
    bumpText(row.startDate);
    bumpText(row.endDate);
    if (!row.current.equal) n += 1;
    for (const b of row.bullets) {
      if (b.status !== 'same') n += 1;
    }
  }
  for (const row of d.education) {
    if (row.rowKind !== 'paired') n += 1;
    bumpText(row.institution);
    bumpText(row.degree);
    bumpText(row.field);
    bumpText(row.startDate);
    bumpText(row.endDate);
    bumpText(row.details);
  }
  for (const row of d.projects) {
    if (row.rowKind !== 'paired') n += 1;
    bumpText(row.name);
    bumpText(row.description);
    bumpText(row.url);
    for (const b of row.bullets) {
      if (b.status !== 'same') n += 1;
    }
  }
  for (const row of d.certifications) {
    if (row.rowKind !== 'paired') n += 1;
    bumpText(row.name);
    bumpText(row.issuer);
    bumpText(row.issueDate);
    bumpText(row.url);
  }
  return n;
}
