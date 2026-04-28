import type {
  ResumeBasics,
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeStructuredData,
} from '@hireboost/shared';

/* -------------------------------------------------------------------------- */
/*                              Section detection                             */
/* -------------------------------------------------------------------------- */

/**
 * Section label aliases. Order matters: the longest / most specific labels
 * are listed first so that "WORK EXPERIENCE" matches before "EXPERIENCE".
 *
 * Each canonical section name maps to a list of aliases. We strip
 * surrounding punctuation/colons before comparing.
 */
const SECTION_ALIASES: Record<CanonicalSection, string[]> = {
  summary: [
    'professional summary',
    'career summary',
    'executive summary',
    'summary',
    'profile',
    'professional profile',
    'objective',
    'career objective',
    'about me',
    'about',
  ],
  skills: [
    'technical skills',
    'core skills',
    'core competencies',
    'key skills',
    'skills & abilities',
    'skills and abilities',
    'skills',
    'technologies',
    'tech stack',
    'tools',
    'tools & technologies',
    'expertise',
  ],
  experience: [
    'professional experience',
    'work experience',
    'employment history',
    'work history',
    'experience',
    'employment',
    'career history',
    'relevant experience',
  ],
  education: ['education', 'academic background', 'academic qualifications', 'qualifications'],
  projects: ['projects', 'personal projects', 'side projects', 'selected projects', 'portfolio'],
  certifications: [
    'certifications',
    'certificates',
    'licenses & certifications',
    'licenses and certifications',
    'professional certifications',
  ],
  awards: ['awards', 'honors', 'awards & honors', 'awards and honors', 'achievements'],
  languages: ['languages'],
  interests: ['interests', 'hobbies'],
  publications: ['publications', 'papers'],
  references: ['references'],
};

type CanonicalSection =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'languages'
  | 'interests'
  | 'publications'
  | 'references';

/**
 * Try to match a single line against a known section heading.
 *
 * A heading is recognized when the entire normalized line is an alias —
 * we never match a substring, otherwise body sentences like "I have skills
 * in TypeScript" would falsely terminate a section.
 */
function detectSectionHeading(line: string): CanonicalSection | null {
  const normalized = line
    .trim()
    .replace(/[:•·\-—–]+\s*$/u, '')
    .replace(/^[•·\-—–]+\s*/u, '')
    .toLowerCase();

  if (normalized.length === 0 || normalized.length > 40) return null;

  for (const [canonical, aliases] of Object.entries(SECTION_ALIASES) as [
    CanonicalSection,
    string[],
  ][]) {
    for (const alias of aliases) {
      if (normalized === alias) return canonical;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*                                   Regex                                    */
/* -------------------------------------------------------------------------- */

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
// Reasonably permissive phone matcher. Strips spaces/dashes/parens around digits.
// Requires 7+ digits to avoid matching ZIP codes / dates.
const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{0,4})?/;

const URL_REGEX = /\bhttps?:\/\/[^\s)]+/i;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[^\s)]+/i;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+(?:\/[^\s)]*)?/i;
const LOCATION_REGEX =
  /\b([A-Z][A-Za-z.\-' ]{1,30}),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/;

const MONTHS =
  '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const YEAR = '(19|20)\\d{2}';

// Matches a "date range" like "Jan 2021 - Present", "2020-2023", "Mar 2019 – May 2021"
const DATE_RANGE_REGEX = new RegExp(
  // start
  `(?:${MONTHS}\\.?\\s+)?${YEAR}` +
    // separator
    `\\s*(?:[-–—]|to)\\s*` +
    // end
    `(?:present|current|now|(?:${MONTHS}\\.?\\s+)?${YEAR})`,
  'i',
);

const SINGLE_DATE_REGEX = new RegExp(`(?:${MONTHS}\\.?\\s+)?${YEAR}`, 'i');

const BULLET_PREFIX_REGEX = /^[\s]*[•·▪◦▫–—\-*►‣✓◆\u25cb\u25aa]\s+/u;

const DEGREE_REGEX =
  /\b(b\.?\s?s\.?c?|b\.?\s?a\.?|b\.?\s?tech|m\.?\s?s\.?c?|m\.?\s?a\.?|m\.?\s?tech|m\.?\s?b\.?a|ph\.?\s?d|associate|bachelor(?:'?s)?|master(?:'?s)?|doctorate|diploma)\b/i;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function splitLines(text: string): string[] {
  return text.split('\n');
}

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function stripBullet(line: string): string {
  return line.replace(BULLET_PREFIX_REGEX, '').trim();
}

function isBullet(line: string): boolean {
  return BULLET_PREFIX_REGEX.test(line);
}

/**
 * Split a comma/pipe/bullet-separated list of skills into clean tokens.
 * We deliberately keep multi-word phrases together (e.g. "machine learning").
 */
function splitListLine(line: string): string[] {
  return line
    .split(/[,;|·•/]| {2,}|\u2022|\t/g)
    .map((s) =>
      s
        .replace(BULLET_PREFIX_REGEX, '')
        .replace(/^[\s\-:]+/, '')
        .replace(/[\s.;]+$/, '')
        .trim(),
    )
    .filter((s) => s.length > 1 && s.length < 60);
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

/* -------------------------------------------------------------------------- */
/*                              Section splitter                              */
/* -------------------------------------------------------------------------- */

interface SectionedResume {
  /** The lines before the first detected section heading. */
  header: string[];
  sections: Map<CanonicalSection, string[]>;
}

function segmentSections(text: string): SectionedResume {
  const lines = splitLines(text);
  const header: string[] = [];
  const sections = new Map<CanonicalSection, string[]>();

  let current: CanonicalSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00A0/g, ' '); // safety net
    const heading = detectSectionHeading(line);

    if (heading) {
      current = heading;
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }

    if (current === null) {
      header.push(line);
    } else {
      sections.get(current)!.push(line);
    }
  }

  // Different extractors emit different paragraph spacing: PDFs are usually
  // single-spaced, mammoth's DOCX output puts a blank line after every
  // paragraph. We normalize each section to "no internal blanks" so the
  // entry grouper gets a consistent signal regardless of source.
  for (const [key, sectionLines] of sections) {
    sections.set(key, dropInternalBlanks(sectionLines));
  }

  return { header, sections };
}

function dropInternalBlanks(lines: string[]): string[] {
  return lines.filter((l) => l.trim().length > 0);
}

/* -------------------------------------------------------------------------- */
/*                                  Basics                                    */
/* -------------------------------------------------------------------------- */

function parseBasics(headerLines: string[], fullText: string): ResumeBasics {
  const header = headerLines.join('\n');

  const email = EMAIL_REGEX.exec(header)?.[0] ?? EMAIL_REGEX.exec(fullText)?.[0] ?? '';

  // Phone: prefer matches in the header, fall back to anywhere — but reject
  // numbers that look like dates / years.
  const phoneMatch = PHONE_REGEX.exec(header) ?? PHONE_REGEX.exec(fullText);
  let phone: string | undefined;
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 16) {
      phone = phoneMatch[0].trim();
    }
  }

  const locationMatch = LOCATION_REGEX.exec(header);
  const location = locationMatch ? `${locationMatch[1]?.trim()}, ${locationMatch[2]?.trim()}` : undefined;

  // Name: first non-empty header line that isn't an email/phone/url/location.
  let fullName = '';
  for (const candidate of headerLines.map((l) => l.trim()).filter(Boolean)) {
    if (
      EMAIL_REGEX.test(candidate) ||
      PHONE_REGEX.test(candidate) ||
      URL_REGEX.test(candidate) ||
      LOCATION_REGEX.test(candidate)
    ) {
      continue;
    }
    // Real names are short and don't contain obvious sentence punctuation.
    if (candidate.length > 60) continue;
    if (/[.!?]\s|@/.test(candidate)) continue;
    if (/[A-Za-z]/.test(candidate)) {
      fullName = candidate;
      break;
    }
  }

  // Links: linkedin / github / any URL — preserve order, avoid duplicates.
  const links: { label: string; url: string }[] = [];
  const seen = new Set<string>();
  const tryPush = (label: string, url: string | undefined): void => {
    if (!url) return;
    const normalized = url.replace(/[),.\];]+$/, '');
    if (seen.has(normalized)) return;
    seen.add(normalized);
    links.push({ label, url: normalized });
  };

  tryPush('LinkedIn', LINKEDIN_REGEX.exec(header)?.[0] ?? LINKEDIN_REGEX.exec(fullText)?.[0]);
  tryPush('GitHub', GITHUB_REGEX.exec(header)?.[0] ?? GITHUB_REGEX.exec(fullText)?.[0]);
  // Generic URLs in header that aren't already captured.
  const headerUrls = header.match(new RegExp(URL_REGEX.source, 'gi')) ?? [];
  for (const url of headerUrls) tryPush('Website', url);

  return {
    fullName,
    email,
    phone,
    location,
    links,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Summary                                   */
/* -------------------------------------------------------------------------- */

function parseSummary(lines: string[] | undefined): string {
  if (!lines || lines.length === 0) return '';
  const text = lines.join('\n').trim();
  // Cap to first paragraph(s) — most resumes have a 2-4 sentence summary.
  return text.split(/\n{2,}/)[0]?.replace(/\s+/g, ' ').trim().slice(0, 1000) ?? '';
}

/* -------------------------------------------------------------------------- */
/*                                   Skills                                   */
/* -------------------------------------------------------------------------- */

function parseSkills(lines: string[] | undefined): string[] {
  if (!lines || lines.length === 0) return [];
  const tokens: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Lines like "Languages: TypeScript, Python, Go"
    const colonIdx = line.indexOf(':');
    const body = colonIdx > 0 && colonIdx < 30 ? line.slice(colonIdx + 1) : line;
    tokens.push(...splitListLine(body));
  }
  return dedupe(tokens.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean));
}

/* -------------------------------------------------------------------------- */
/*                                Experience                                  */
/* -------------------------------------------------------------------------- */

/**
 * Group lines of an experience-like section into entries. The strategy:
 * a new entry begins on the first non-bullet, non-blank line *after* we've
 * already seen at least one non-bullet line (a "title-ish" line) and have
 * collected something (so consecutive title lines belong together).
 *
 * We also start a new entry when we hit a line that contains a date range
 * after the entry already has one — that's usually a new job.
 */
interface EntryBlock {
  titleLines: string[];
  bullets: string[];
}

function groupEntries(lines: string[]): EntryBlock[] {
  const entries: EntryBlock[] = [];
  let current: EntryBlock | null = null;
  let titleLineCount = 0;

  for (const rawLine of lines) {
    if (isBlank(rawLine)) continue; // blanks already stripped at the section level

    if (isBullet(rawLine)) {
      if (!current) {
        current = { titleLines: [], bullets: [] };
        titleLineCount = 0;
      }
      const text = stripBullet(rawLine);
      if (text) current.bullets.push(text);
      continue;
    }

    // Non-blank, non-bullet line — title-ish.
    if (!current) {
      current = { titleLines: [rawLine.trim()], bullets: [] };
      titleLineCount = 1;
      continue;
    }

    // If we already gathered bullets for this entry, a new title line means a new entry.
    if (current.bullets.length > 0) {
      entries.push(current);
      current = { titleLines: [rawLine.trim()], bullets: [] };
      titleLineCount = 1;
      continue;
    }

    // Otherwise we're still collecting title lines (e.g. company on one line, dates on next).
    // Cap how many title lines we accept before assuming a new entry.
    if (titleLineCount < 4) {
      current.titleLines.push(rawLine.trim());
      titleLineCount++;
    } else {
      entries.push(current);
      current = { titleLines: [rawLine.trim()], bullets: [] };
      titleLineCount = 1;
    }
  }

  if (current && (current.titleLines.length > 0 || current.bullets.length > 0)) {
    entries.push(current);
  }
  return entries;
}

/**
 * Heuristically split an experience entry's "title lines" into role / company /
 * location / dates. Real-world layouts vary wildly, so this trades precision
 * for not throwing data away.
 */
function parseExperienceEntry(block: EntryBlock): ResumeExperience {
  const joinedTitle = block.titleLines.join(' \u2022 ');

  // Pull dates out first — they're the most reliable signal.
  const dateRange = DATE_RANGE_REGEX.exec(joinedTitle);
  let startDate: string | undefined;
  let endDate: string | undefined;
  let current = false;

  if (dateRange) {
    const [start, end] = splitDateRange(dateRange[0]);
    startDate = start;
    if (/present|current|now/i.test(end)) {
      current = true;
    } else {
      endDate = end;
    }
  }

  // Strip dates from the title lines for cleaner role/company extraction.
  const cleanedLines = block.titleLines.map((l) =>
    l
      .replace(DATE_RANGE_REGEX, '')
      .replace(SINGLE_DATE_REGEX, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*[•·|–—-]\s*$/u, '')
      .trim(),
  );

  // Find a location like "City, ST" within the title block.
  let location: string | undefined;
  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i] ?? '';
    const match = LOCATION_REGEX.exec(line);
    if (match) {
      location = `${match[1]?.trim()}, ${match[2]?.trim()}`;
      cleanedLines[i] = line.replace(match[0], '').replace(/\s*[•·|–—-]\s*$/u, '').trim();
      break;
    }
  }

  // Now interpret the remaining 1-3 lines.
  // - Single line  "Senior Engineer, Acme Corp"  → split on " at ", " - ", " — ", "@"
  // - Two lines    line1=role, line2=company (or vice versa)
  const filtered = cleanedLines.filter(Boolean);
  let role = '';
  let company = '';

  if (filtered.length === 1) {
    const split = filtered[0]?.split(/\s+(?:at|@|-|–|—|,)\s+/) ?? [];
    if (split.length >= 2) {
      role = split[0]?.trim() ?? '';
      company = split.slice(1).join(' ').trim();
    } else {
      role = filtered[0] ?? '';
    }
  } else if (filtered.length >= 2) {
    // Lines that look like a company name (Inc., LLC, Ltd, Corp, capitalized)
    // become the company; the other becomes the role.
    const [first, second] = [filtered[0] ?? '', filtered[1] ?? ''];
    if (/\b(inc\.?|llc|ltd\.?|corp\.?|gmbh|labs|technologies|solutions|systems|group)\b/i.test(second)) {
      role = first;
      company = second;
    } else if (/\b(inc\.?|llc|ltd\.?|corp\.?|gmbh|labs|technologies|solutions|systems|group)\b/i.test(first)) {
      company = first;
      role = second;
    } else {
      // Best effort: assume "Role" is the more job-titley one (engineer / manager / etc.)
      const roleish = /\b(engineer|developer|manager|designer|analyst|scientist|consultant|architect|director|lead|intern|specialist|officer|coordinator|administrator|owner|founder)\b/i;
      if (roleish.test(first)) {
        role = first;
        company = second;
      } else if (roleish.test(second)) {
        role = second;
        company = first;
      } else {
        role = first;
        company = second;
      }
    }
  }

  return {
    company: company.trim(),
    role: role.trim(),
    location,
    startDate,
    endDate,
    current,
    bullets: block.bullets,
  };
}

function splitDateRange(range: string): [string, string] {
  const parts = range.split(/\s*(?:[-–—]|to)\s*/i);
  return [parts[0]?.trim() ?? '', parts[1]?.trim() ?? ''];
}

function parseExperience(lines: string[] | undefined): ResumeExperience[] {
  if (!lines || lines.length === 0) return [];
  return groupEntries(lines)
    .map(parseExperienceEntry)
    .filter((e) => e.role || e.company || e.bullets.length > 0);
}

/* -------------------------------------------------------------------------- */
/*                                Education                                   */
/* -------------------------------------------------------------------------- */

function parseEducationEntry(block: EntryBlock): ResumeEducation {
  const joined = block.titleLines.join(' \u2022 ');
  const dateRange = DATE_RANGE_REGEX.exec(joined);
  const single = SINGLE_DATE_REGEX.exec(joined);

  let startDate: string | undefined;
  let endDate: string | undefined;
  if (dateRange) {
    const [s, e] = splitDateRange(dateRange[0]);
    startDate = s;
    endDate = e;
  } else if (single) {
    endDate = single[0];
  }

  const cleaned = block.titleLines.map((l) =>
    l
      .replace(DATE_RANGE_REGEX, '')
      .replace(SINGLE_DATE_REGEX, '')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  );

  const degreeMatch = DEGREE_REGEX.exec(joined);
  const degree = degreeMatch?.[0];

  // Try to pull "field of study" via regex like "in Computer Science"
  const fieldMatch = /\bin\s+([A-Z][A-Za-z& ]{2,40})/.exec(joined);
  const field = fieldMatch?.[1]?.trim();

  // Institution = the line that doesn't look like a degree string.
  let institution = '';
  for (const line of cleaned) {
    if (!line) continue;
    if (DEGREE_REGEX.test(line) && line.length < 80) continue;
    institution = line;
    break;
  }
  if (!institution && cleaned.length > 0) institution = cleaned[0] ?? '';

  return {
    institution,
    degree,
    field,
    startDate,
    endDate,
    details: block.bullets.length > 0 ? block.bullets.join(' • ') : undefined,
  };
}

function parseEducation(lines: string[] | undefined): ResumeEducation[] {
  if (!lines || lines.length === 0) return [];
  return groupEntries(lines)
    .map(parseEducationEntry)
    .filter((e) => e.institution || e.degree);
}

/* -------------------------------------------------------------------------- */
/*                                  Projects                                  */
/* -------------------------------------------------------------------------- */

function parseProjectEntry(block: EntryBlock): ResumeProject {
  const titleLine = block.titleLines[0]?.trim() ?? '';
  const description = block.titleLines.slice(1).join(' ').trim();
  const url = URL_REGEX.exec(titleLine)?.[0] ?? URL_REGEX.exec(description)?.[0];
  // Strip URL from the visible name.
  const name = titleLine.replace(URL_REGEX, '').replace(/[\s|–—-]+$/u, '').trim();

  return {
    name,
    description: description || undefined,
    url,
    bullets: block.bullets,
  };
}

function parseProjects(lines: string[] | undefined): ResumeProject[] {
  if (!lines || lines.length === 0) return [];
  return groupEntries(lines).map(parseProjectEntry).filter((p) => p.name || p.bullets.length > 0);
}

/* -------------------------------------------------------------------------- */
/*                              Certifications                                */
/* -------------------------------------------------------------------------- */

function parseCertifications(lines: string[] | undefined): ResumeCertification[] {
  if (!lines || lines.length === 0) return [];
  const out: ResumeCertification[] = [];

  for (const raw of lines) {
    const line = stripBullet(raw).trim();
    if (!line) continue;
    // Skip page artifacts ("-- 1 of 2 --", "Page 2 of 5", etc.) and any
    // line that has no real letters in it.
    if (!/[A-Za-z]{2,}/.test(line)) continue;
    if (/^-{2,}\s*\d+\s*of\s*\d+\s*-{2,}$/i.test(line)) continue;
    if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(line)) continue;

    const url = URL_REGEX.exec(line)?.[0];
    const dateMatch = SINGLE_DATE_REGEX.exec(line);

    // Common shapes: "AWS Certified Solutions Architect — Amazon (2023)"
    //                "Google Cloud Professional Architect, Google, 2022"
    const cleaned = line
      .replace(URL_REGEX, '')
      .replace(SINGLE_DATE_REGEX, '')
      .replace(/[(),]+$/g, '')
      .trim();

    // Issuer separators: " - ", " — ", " | ", ", "
    const parts = cleaned.split(/\s+[-–—|]\s+|\s*,\s*/).filter(Boolean);
    const name = parts[0]?.trim() ?? cleaned;
    const issuer = parts.length > 1 ? parts.slice(1).join(', ').trim() : undefined;

    out.push({
      name,
      issuer,
      issueDate: dateMatch?.[0],
      url,
    });
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/*                                 Public API                                 */
/* -------------------------------------------------------------------------- */

export function parseResume(rawText: string): ResumeStructuredData {
  const segmented = segmentSections(rawText);

  const basics = parseBasics(segmented.header, rawText);
  const summary = parseSummary(segmented.sections.get('summary'));
  const skills = parseSkills(segmented.sections.get('skills'));
  const experience = parseExperience(segmented.sections.get('experience'));
  const education = parseEducation(segmented.sections.get('education'));
  const projects = parseProjects(segmented.sections.get('projects'));
  const certifications = parseCertifications(segmented.sections.get('certifications'));

  return {
    basics,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
  };
}
