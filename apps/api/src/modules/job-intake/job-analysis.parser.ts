import type { SeniorityLevel } from '@hireboost/shared';
import { SeniorityLevel as SeniorityLevelEnum } from '@hireboost/shared';

/**
 * Deterministic Job Description parser.
 *
 * Phase 5 ships a fully offline analyzer (no AI calls) so the rest of
 * the workflow can be exercised end-to-end without external keys. The
 * AI provider abstraction in Phase 8 will *augment* — never replace —
 * this output (see ARCHITECTURE.md §6, "graceful degradation").
 *
 * Design goals:
 *   1. Cheap and fast (no I/O).
 *   2. Reasonable defaults — never throw on weird input.
 *   3. Output shape compatible with `JobAnalysis` in @hireboost/shared.
 *   4. Easy to extend: dictionaries are the only knobs.
 */

/* -------------------------------------------------------------------------- */
/*                               Dictionaries                                 */
/* -------------------------------------------------------------------------- */

/**
 * Canonical skills/tools dictionary. Each entry maps a *canonical label*
 * (used in the output) to a list of case-insensitive aliases that match
 * inside the JD text. Order matters only when canonicals overlap.
 *
 * Each entry can opt into the `tool` flag — these surface in the
 * `toolsAndTechnologies` bucket in addition to `extractedSkills`.
 */
interface SkillEntry {
  label: string;
  aliases: string[];
  tool?: boolean;
}

const SKILL_DICTIONARY: SkillEntry[] = [
  // Languages
  { label: 'JavaScript', aliases: ['javascript', 'js'] },
  { label: 'TypeScript', aliases: ['typescript', 'ts'] },
  { label: 'Python', aliases: ['python'] },
  { label: 'Java', aliases: ['java'] },
  { label: 'Go', aliases: ['golang', 'go lang', ' go '] },
  { label: 'Rust', aliases: ['rust'] },
  { label: 'C++', aliases: ['c\\+\\+', 'cpp'] },
  { label: 'C#', aliases: ['c#', 'csharp'] },
  { label: 'Ruby', aliases: ['ruby'] },
  { label: 'PHP', aliases: ['php'] },
  { label: 'Kotlin', aliases: ['kotlin'] },
  { label: 'Swift', aliases: ['swift'] },
  { label: 'Scala', aliases: ['scala'] },
  { label: 'SQL', aliases: ['sql'] },
  { label: 'Bash', aliases: ['bash', 'shell scripting'] },

  // Frontend
  { label: 'React', aliases: ['react', 'react.js', 'reactjs'], tool: true },
  { label: 'Next.js', aliases: ['next.js', 'nextjs'], tool: true },
  { label: 'Vue', aliases: ['vue', 'vue.js', 'vuejs'], tool: true },
  { label: 'Angular', aliases: ['angular', 'angularjs'], tool: true },
  { label: 'Svelte', aliases: ['svelte', 'sveltekit'], tool: true },
  { label: 'Redux', aliases: ['redux'], tool: true },
  { label: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'], tool: true },
  { label: 'HTML', aliases: ['html', 'html5'] },
  { label: 'CSS', aliases: ['css', 'css3'] },
  { label: 'SASS', aliases: ['sass', 'scss'] },

  // Backend / API
  { label: 'Node.js', aliases: ['node.js', 'nodejs', 'node'], tool: true },
  { label: 'Express', aliases: ['express', 'express.js'], tool: true },
  { label: 'NestJS', aliases: ['nestjs', 'nest.js'], tool: true },
  { label: 'Django', aliases: ['django'], tool: true },
  { label: 'Flask', aliases: ['flask'], tool: true },
  { label: 'FastAPI', aliases: ['fastapi'], tool: true },
  { label: 'Spring Boot', aliases: ['spring boot', 'spring-boot'], tool: true },
  { label: 'Rails', aliases: ['ruby on rails', 'rails'], tool: true },
  { label: 'GraphQL', aliases: ['graphql'], tool: true },
  { label: 'REST', aliases: ['rest api', 'restful', ' rest '] },
  { label: 'gRPC', aliases: ['grpc'] },
  { label: 'WebSockets', aliases: ['websocket', 'websockets'] },

  // Data
  { label: 'PostgreSQL', aliases: ['postgres', 'postgresql'], tool: true },
  { label: 'MySQL', aliases: ['mysql'], tool: true },
  { label: 'MongoDB', aliases: ['mongodb', 'mongo'], tool: true },
  { label: 'Redis', aliases: ['redis'], tool: true },
  { label: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search'], tool: true },
  { label: 'Kafka', aliases: ['kafka'], tool: true },
  { label: 'RabbitMQ', aliases: ['rabbitmq'], tool: true },
  { label: 'Snowflake', aliases: ['snowflake'], tool: true },
  { label: 'BigQuery', aliases: ['bigquery'], tool: true },
  { label: 'Airflow', aliases: ['airflow'], tool: true },
  { label: 'Spark', aliases: ['apache spark', 'spark'], tool: true },
  { label: 'dbt', aliases: ['dbt'], tool: true },

  // Cloud / Infra / DevOps
  { label: 'AWS', aliases: ['aws', 'amazon web services'], tool: true },
  { label: 'GCP', aliases: ['gcp', 'google cloud'], tool: true },
  { label: 'Azure', aliases: ['azure', 'microsoft azure'], tool: true },
  { label: 'Docker', aliases: ['docker'], tool: true },
  { label: 'Kubernetes', aliases: ['kubernetes', 'k8s'], tool: true },
  { label: 'Terraform', aliases: ['terraform'], tool: true },
  { label: 'Ansible', aliases: ['ansible'], tool: true },
  { label: 'CI/CD', aliases: ['ci/cd', 'continuous integration', 'continuous delivery'] },
  { label: 'GitHub Actions', aliases: ['github actions'], tool: true },
  { label: 'CircleCI', aliases: ['circleci', 'circle ci'], tool: true },
  { label: 'Jenkins', aliases: ['jenkins'], tool: true },
  { label: 'Linux', aliases: ['linux'] },
  { label: 'Nginx', aliases: ['nginx'], tool: true },

  // Testing
  { label: 'Jest', aliases: ['jest'], tool: true },
  { label: 'Vitest', aliases: ['vitest'], tool: true },
  { label: 'Cypress', aliases: ['cypress'], tool: true },
  { label: 'Playwright', aliases: ['playwright'], tool: true },
  { label: 'Selenium', aliases: ['selenium'], tool: true },

  // Mobile
  { label: 'React Native', aliases: ['react native'], tool: true },
  { label: 'Flutter', aliases: ['flutter'], tool: true },
  { label: 'iOS', aliases: ['ios development', 'ios app'] },
  { label: 'Android', aliases: ['android development', 'android app'] },

  // Data science / ML / AI
  { label: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { label: 'Deep Learning', aliases: ['deep learning'] },
  { label: 'NLP', aliases: ['natural language processing', 'nlp'] },
  { label: 'Computer Vision', aliases: ['computer vision'] },
  { label: 'TensorFlow', aliases: ['tensorflow'], tool: true },
  { label: 'PyTorch', aliases: ['pytorch'], tool: true },
  { label: 'scikit-learn', aliases: ['scikit-learn', 'sklearn'], tool: true },
  { label: 'pandas', aliases: ['pandas'], tool: true },
  { label: 'NumPy', aliases: ['numpy'], tool: true },
  { label: 'LangChain', aliases: ['langchain'], tool: true },
  { label: 'LLMs', aliases: ['llm', 'llms', 'large language model'] },
  { label: 'OpenAI', aliases: ['openai'], tool: true },

  // Tools / collaboration
  { label: 'Git', aliases: ['git'], tool: true },
  { label: 'GitHub', aliases: ['github'], tool: true },
  { label: 'GitLab', aliases: ['gitlab'], tool: true },
  { label: 'Jira', aliases: ['jira'], tool: true },
  { label: 'Figma', aliases: ['figma'], tool: true },
  { label: 'Confluence', aliases: ['confluence'], tool: true },
  { label: 'Slack', aliases: ['slack'], tool: true },

  // Methodologies / soft
  { label: 'Agile', aliases: ['agile', 'scrum', 'kanban'] },
  { label: 'TDD', aliases: ['test-driven development', 'tdd'] },
  { label: 'Microservices', aliases: ['microservices', 'micro-services'] },
  { label: 'Serverless', aliases: ['serverless', 'lambda functions'] },
  { label: 'OAuth', aliases: ['oauth', 'oauth2', 'oauth 2.0'] },
  { label: 'JWT', aliases: ['jwt', 'json web token'] },

  // Soft skills
  { label: 'Communication', aliases: ['communication skills', 'verbal communication'] },
  { label: 'Leadership', aliases: ['leadership', 'team leadership'] },
  { label: 'Mentoring', aliases: ['mentoring', 'mentorship'] },
  { label: 'Problem Solving', aliases: ['problem solving', 'problem-solving'] },
  { label: 'Collaboration', aliases: ['cross-functional', 'collaboration'] },
];

/**
 * Common English stopwords. Used during keyword extraction to discard
 * "the / and / with" style noise so the top-N keywords are signal.
 */
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'between', 'both', 'but', 'by', 'can', 'come', 'could', 'did', 'do', 'does',
  'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
  'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves',
  // JD boilerplate words that aren't useful as ATS keywords
  'job', 'role', 'team', 'company', 'work', 'working', 'experience', 'years',
  'year', 'ability', 'strong', 'good', 'great', 'excellent', 'looking',
  'someone', 'candidate', 'candidates', 'applicant', 'applicants', 'must',
  'including', 'etc', 'eg', 'ie', 'plus', 'preferred', 'required',
  'requirements', 'responsibilities', 'qualifications', 'desired', 'role',
  'us', 'will', 'across', 'within', 'using', 'use', 'used', 'high', 'level',
  'levels', 'including', 'across',
]);

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWhitespace(s: string): string {
  return s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ');
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/* -------------------------------------------------------------------------- */
/*                                Extractors                                  */
/* -------------------------------------------------------------------------- */

/**
 * Generic section / heading lines that look like role titles but
 * aren't. We exclude these from the "title-cased top line" pattern.
 *
 * Patterns are matched against the line with trailing `:` already
 * stripped, so they don't need to handle it themselves.
 */
const SECTION_HEADING_PATTERNS: RegExp[] = [
  /^about\s+(the\s+role|us|the\s+team|the\s+company|the\s+job)\s*$/i,
  /^(the\s+role|the\s+team|the\s+company|the\s+job)\s*$/i,
  /^(job\s+description|overview|summary|introduction)\s*$/i,
  /^(responsibilities|requirements|qualifications|benefits|nice\s+to\s+have|preferred(?:\s+qualifications)?)\s*$/i,
  /^(what\s+you[’']ll\s+do|what\s+you\s+will\s+do|what\s+we[’']re\s+looking\s+for|what\s+we\s+offer|who\s+you\s+are|about\s+you)\s*$/i,
];

function looksLikeSectionHeading(line: string): boolean {
  const stripped = line.trim().replace(/[:\-–]+\s*$/, '');
  return SECTION_HEADING_PATTERNS.some((re) => re.test(stripped));
}

/** Best-effort role title detection. Walks lines top-down. */
function extractRole(text: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Pattern 1: explicit "Role: <title>" / "Position: <title>" / "Job Title: <title>"
  const labelRegex = /^(role|position|job\s*title|title)\s*[:\-–]\s*(.+)$/i;
  for (const line of lines.slice(0, 20)) {
    const m = labelRegex.exec(line);
    if (m && m[2]) {
      return cleanRole(m[2]);
    }
  }

  // Pattern 2: the first short, title-cased line is usually the role.
  // Skip section headings, lines that end in punctuation, and lines that
  // end with `:` (those are sub-section headers like "What you'll do:").
  for (const line of lines.slice(0, 6)) {
    if (looksLikeSectionHeading(line)) continue;
    if (/[.!?:]$/.test(line)) continue;
    if (line.length > 80 || line.length < 4) continue;
    if (!/[A-Za-z]/.test(line)) continue;
    const wordCount = line.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 10) {
      return cleanRole(line);
    }
  }

  // Pattern 3: "We are hiring a <title>" / "We're looking for a <title>" / "Hiring: <title>"
  // Capture stops at sentence breakers AND common connectives like
  // "to", "with", "who", "that", "for" so we don't gobble whole sentences.
  const phraseRegex =
    /(?:we\s+are\s+(?:hiring|seeking|looking\s+for)|we['’]re\s+(?:hiring|looking\s+for)|seeking|hiring)\s+(?:an?\s+)?([^.\n,]{2,80}?)(?:\s+(?:to|with|who|that|for|in|on|at|and)\b|[.,!?\n])/i;
  for (const line of lines.slice(0, 25)) {
    const m = phraseRegex.exec(line);
    if (m && m[1]) {
      return cleanRole(m[1]);
    }
  }

  return 'Untitled role';
}

function cleanRole(raw: string): string {
  return raw
    .replace(/[\.\,\;\:\(\)\[\]\{\}]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

/**
 * Map JD text → seniority level.
 *
 * Strategy:
 *   1. Inspect the *role title* first (most authoritative — "Senior X"
 *      always means Senior, even if the body says "lead architecture").
 *   2. Fall back to title-context patterns in the body
 *      ("tech lead", "lead engineer") to avoid catching the verb "lead".
 *   3. Finally, derive from "X+ years of experience".
 */
function extractSeniority(text: string, role: string): SeniorityLevel {
  const fromRole = seniorityFromTitle(role);
  if (fromRole) return fromRole;

  const lower = text.toLowerCase();

  if (/\b(staff|principal)\b/.test(lower)) return SeniorityLevelEnum.Principal;
  if (/\b(director|head\s+of|vp\s+of|vice\s+president)\b/.test(lower)) {
    return SeniorityLevelEnum.Director;
  }
  // Only treat "lead" as a seniority signal when it's clearly a title.
  if (
    /\b(tech\s+lead|engineering\s+manager|lead\s+(engineer|developer|designer|architect|scientist|analyst))\b/.test(
      lower,
    )
  ) {
    return SeniorityLevelEnum.Lead;
  }
  if (/\b(sr\.?|senior|snr)\b/.test(lower)) return SeniorityLevelEnum.Senior;
  if (/\b(intern|internship)\b/.test(lower)) return SeniorityLevelEnum.Intern;
  if (/\b(junior|entry[-\s]?level|graduate|new\s+grad|jr\.?)\b/.test(lower)) {
    return SeniorityLevelEnum.Junior;
  }

  // Fall back to "X+ years of experience" heuristics.
  const yearsMatch = /(\d{1,2})\+?\s*(?:to\s*\d{1,2}\s*)?years?(?:\s+of)?\s+(?:experience|exp)/i.exec(text);
  if (yearsMatch) {
    const years = Number(yearsMatch[1]);
    if (Number.isFinite(years)) {
      if (years <= 1) return SeniorityLevelEnum.Junior;
      if (years <= 4) return SeniorityLevelEnum.Mid;
      if (years <= 7) return SeniorityLevelEnum.Senior;
      if (years <= 10) return SeniorityLevelEnum.Lead;
      return SeniorityLevelEnum.Principal;
    }
  }

  return SeniorityLevelEnum.Mid;
}

function seniorityFromTitle(role: string): SeniorityLevel | null {
  const lower = role.toLowerCase();
  if (/\bdirector\b|\bhead\s+of\b|\bvp\b|\bvice\s+president\b/.test(lower)) {
    return SeniorityLevelEnum.Director;
  }
  if (/\b(staff|principal|distinguished)\b/.test(lower)) {
    return SeniorityLevelEnum.Principal;
  }
  if (/\b(tech\s+lead|lead|manager|engineering\s+manager)\b/.test(lower)) {
    return SeniorityLevelEnum.Lead;
  }
  if (/\b(sr\.?|senior|snr)\b/.test(lower)) return SeniorityLevelEnum.Senior;
  if (/\b(jr\.?|junior|associate|graduate|entry[-\s]?level)\b/.test(lower)) {
    return SeniorityLevelEnum.Junior;
  }
  if (/\b(intern|internship)\b/.test(lower)) return SeniorityLevelEnum.Intern;
  return null;
}

/** Find canonical skills + the subset that count as "tools". */
function extractSkillsAndTools(text: string): {
  skills: string[];
  tools: string[];
} {
  const haystack = ` ${text.toLowerCase()} `; // pad so word boundaries always work
  const skills: string[] = [];
  const tools: string[] = [];

  for (const entry of SKILL_DICTIONARY) {
    const matched = entry.aliases.some((alias) => {
      // Aliases are already designed to be regex-safe (we curated them);
      // anything dangerous would have been escaped at definition time.
      const re = new RegExp(`(^|[^a-z0-9_])${alias}([^a-z0-9_]|$)`, 'i');
      return re.test(haystack);
    });
    if (matched) {
      skills.push(entry.label);
      if (entry.tool) tools.push(entry.label);
    }
  }

  return { skills: unique(skills), tools: unique(tools) };
}

/** Section detector. Returns the text under a heading like "Responsibilities:". */
function extractSection(text: string, headings: RegExp): string | null {
  const lines = text.split('\n');
  let captured: string[] = [];
  let inSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!inSection) {
      if (headings.test(line)) inSection = true;
      continue;
    }
    // Stop at next heading-ish line (mostly Title Case + colon, or all-caps line).
    if (
      /^[A-Z][\w\s/&-]{2,40}:$/.test(line) ||
      /^[A-Z][A-Z\s/&-]{3,40}$/.test(line) ||
      /^(qualifications|requirements|responsibilities|what\s+you[’']ll\s+do|what\s+we[’']re\s+looking\s+for|nice\s+to\s+have|preferred|about\s+you|about\s+us|benefits)\b/i.test(line)
    ) {
      // …but only stop if we're past the actual heading we matched on.
      if (line && !headings.test(line)) break;
    }
    captured.push(rawLine);
  }

  if (!inSection || captured.length === 0) return null;
  return captured.join('\n').trim() || null;
}

/** Split a section (or whole doc) into bullet-style items. */
function splitIntoBullets(section: string, max = 10): string[] {
  const lines = section
    .split('\n')
    .map((l) => l.replace(/^\s*[•\-\*\u2022\u25E6\d+\.\)\u00B7]+\s*/, '').trim())
    .filter((l) => l.length > 0);

  // Keep lines that look like proper bullets (8+ chars, ends in something other than colon).
  const bullets: string[] = [];
  for (const line of lines) {
    if (line.length < 8) continue;
    if (/[:]$/.test(line)) continue; // sub-heading
    bullets.push(line.replace(/\s+/g, ' '));
    if (bullets.length >= max) break;
  }

  return bullets;
}

function extractResponsibilities(text: string): string[] {
  const section = extractSection(
    text,
    /^(responsibilities|what\s+you[’']ll\s+do|the\s+role|what\s+you\s+will\s+do)\s*[:\-–]?$/i,
  );
  if (section) return splitIntoBullets(section, 10);

  // Fallback: take action-verb leading sentences from the first ~600 chars.
  const verbRegex =
    /(?:^|[\n\.])\s*((?:Build|Design|Develop|Lead|Drive|Own|Architect|Implement|Ship|Deliver|Collaborate|Partner|Mentor|Define|Improve|Maintain|Optimize|Scale|Support)[^.\n]{8,160})/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = verbRegex.exec(text)) && out.length < 6) {
    const captured = m[1];
    if (!captured) continue;
    out.push(captured.trim().replace(/\s+/g, ' '));
  }
  return out;
}

function extractPreferredQualifications(text: string): string[] {
  const section = extractSection(
    text,
    /^(nice\s+to\s+have|preferred(?:\s+qualifications)?|bonus|good\s+to\s+have|preferred\s+experience)\s*[:\-–]?$/i,
  );
  if (!section) return [];
  return splitIntoBullets(section, 8);
}

/** TF-style top-N keywords, with stopword filtering and skill priority. */
function extractKeywords(text: string, skills: string[], topN = 25): string[] {
  // Multi-word phrase candidates first ("data structures", "system design")
  const phraseFreq = new Map<string, number>();
  const phraseRegex = /\b([a-z][a-z\-]+\s+[a-z][a-z\-]+(?:\s+[a-z][a-z\-]+)?)\b/gi;
  const lower = text.toLowerCase();
  let m: RegExpExecArray | null;
  while ((m = phraseRegex.exec(lower))) {
    const captured = m[1];
    if (!captured) continue;
    const phrase = captured.trim();
    const words = phrase.split(/\s+/);
    if (words.every((w) => STOPWORDS.has(w))) continue;
    if (words.some((w) => w.length < 3)) continue;
    phraseFreq.set(phrase, (phraseFreq.get(phrase) ?? 0) + 1);
  }

  const wordFreq = new Map<string, number>();
  const wordRegex = /\b([a-z][a-z\-+#./]{2,})\b/gi;
  while ((m = wordRegex.exec(lower))) {
    const w = m[1];
    if (!w) continue;
    if (STOPWORDS.has(w)) continue;
    if (w.length < 3) continue;
    wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  }

  const sortedPhrases = [...phraseFreq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([p]) => p);

  const sortedWords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);

  // Title-case for display, then prepend skills (already canonical) so the
  // most important keywords surface first.
  const normalize = (s: string): string =>
    s
      .split(/\s+/)
      .map((part) => (part.length === 0 ? part : part[0]!.toUpperCase() + part.slice(1)))
      .join(' ');

  const merged = [...skills, ...sortedPhrases.map(normalize), ...sortedWords.map(normalize)];
  return unique(
    merged.map((k) => k.replace(/\s+/g, ' ').trim()).filter((k) => k.length > 0),
  ).slice(0, topN);
}

/* -------------------------------------------------------------------------- */
/*                                   Public                                   */
/* -------------------------------------------------------------------------- */

export interface ParsedJobDescription {
  extractedRole: string;
  extractedSkills: string[];
  extractedKeywords: string[];
  seniorityLevel: SeniorityLevel;
  responsibilities: string[];
  preferredQualifications: string[];
  toolsAndTechnologies: string[];
}

/**
 * Run the full deterministic pipeline against a raw JD string.
 * Always returns a complete shape — never throws on edge inputs.
 */
export function parseJobDescription(rawJd: string): ParsedJobDescription {
  const text = normalizeWhitespace(rawJd ?? '').trim();
  if (text.length === 0) {
    return {
      extractedRole: 'Untitled role',
      extractedSkills: [],
      extractedKeywords: [],
      seniorityLevel: SeniorityLevelEnum.Mid,
      responsibilities: [],
      preferredQualifications: [],
      toolsAndTechnologies: [],
    };
  }

  const role = extractRole(text);
  const seniority = extractSeniority(text, role);
  const { skills, tools } = extractSkillsAndTools(text);
  const responsibilities = extractResponsibilities(text);
  const preferredQualifications = extractPreferredQualifications(text);
  const keywords = extractKeywords(text, skills);

  return {
    extractedRole: role,
    extractedSkills: skills,
    extractedKeywords: keywords,
    seniorityLevel: seniority,
    responsibilities,
    preferredQualifications,
    toolsAndTechnologies: tools,
  };
}

// Exported only for unit tests / debugging.
export const __internals = {
  escapeRegex,
  extractRole,
  extractSeniority,
  extractSkillsAndTools,
  extractResponsibilities,
  extractPreferredQualifications,
  extractKeywords,
};
