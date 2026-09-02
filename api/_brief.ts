/**
 * Brief validation and Telegram formatting.
 *
 * Kept separate from the handler so it can be unit-tested without a request
 * object — this is the only branching logic in the repo that can silently
 * drop a lead. The `_` prefix keeps Vercel from treating the file as an
 * endpoint.
 */

export const PROJECT_TYPES = [
  'iGaming / casino',
  'Web3 / crypto',
  'Dashboard / SaaS',
  'Mobile app',
  'Website / landing',
  'Other',
] as const;

export const NEEDS = ['Design only', 'Design → Built', 'Not sure yet'] as const;

export const TIMELINES = ['ASAP', '1–3 months', '3+ months', 'Just exploring'] as const;

export const BUDGETS = ['Under $2k', '$2–5k', '$5–15k', '$15k+', 'Not sure yet'] as const;

/** Telegram rejects any sendMessage payload over this length outright. */
export const TELEGRAM_MAX_CHARS = 4096;

export interface Brief {
  name: string;
  email: string;
  projectType: string;
  need: string;
  timeline: string;
  budget: string;
  links: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: Brief }
  | { ok: false; error: string };

/** Per-field caps. Shared so the form and the handler cannot disagree. */
export const MAX_LENGTHS = {
  name: 100,
  email: 200,
  links: 500,
  message: 3900,
} as const;

/** Deliberately loose: reject obvious typos, never a legitimate address. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS = ['name', 'email', 'projectType', 'need', 'message'] as const;

export interface FieldIssue {
  kind: 'required' | 'tooLong' | 'format' | 'invalid';
  /** Written for the visitor. The form uppercases it in CSS. */
  message: string;
}

export type FieldIssues = Partial<Record<keyof Brief, FieldIssue>>;

const REQUIRED_MESSAGES: Record<(typeof REQUIRED_FIELDS)[number], string> = {
  name: 'Your name is required',
  email: 'Email address is required',
  projectType: 'Choose a project type',
  need: 'Choose what you need',
  message: 'Tell me about the project',
};

/** MarkdownV2 reserves these; Telegram rejects the whole message if any is bare. */
const escMd = (s: string) => s.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');

const str = (v: unknown) => String(v ?? '').trim();

/** Empty passes — the caller decides whether a field is required. */
const inList = (value: string, allowed: readonly string[]) =>
  value === '' || allowed.includes(value);

/** Trims every field, so callers never have to think about whitespace. */
export function toBrief(body: unknown): Brief {
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  return {
    name: str(b.name),
    email: str(b.email),
    projectType: str(b.projectType),
    need: str(b.need),
    timeline: str(b.timeline),
    budget: str(b.budget),
    links: str(b.links),
    message: str(b.message),
  };
}

/**
 * Every problem with a brief, keyed by the field that owns it.
 *
 * This is the single source of validation truth: the form renders these
 * messages under the offending fields, and `validateBrief` collapses them into
 * the coarse error the API returns. One list of rules, two audiences.
 */
export function briefFieldIssues(brief: Brief): FieldIssues {
  const issues: FieldIssues = {};

  for (const field of REQUIRED_FIELDS) {
    if (!brief[field]) issues[field] = { kind: 'required', message: REQUIRED_MESSAGES[field] };
  }

  for (const [field, max] of Object.entries(MAX_LENGTHS) as [
    keyof typeof MAX_LENGTHS,
    number,
  ][]) {
    if (!issues[field] && brief[field].length > max) {
      issues[field] = { kind: 'tooLong', message: `Keep this under ${max} characters` };
    }
  }

  if (!issues.email && !EMAIL_PATTERN.test(brief.email)) {
    issues.email = { kind: 'format', message: 'Enter a valid email address' };
  }

  const lists = [
    ['projectType', PROJECT_TYPES],
    ['need', NEEDS],
    ['timeline', TIMELINES],
    ['budget', BUDGETS],
  ] as const;

  for (const [field, allowed] of lists) {
    if (!issues[field] && !inList(brief[field], allowed)) {
      issues[field] = { kind: 'invalid', message: 'Choose one of the listed options' };
    }
  }

  return issues;
}

/** Coarse API errors, in the order the handler has always reported them. */
const ERROR_BY_KIND: Record<FieldIssue['kind'], string> = {
  required: 'Missing required fields',
  tooLong: 'Input too long',
  format: 'Invalid email address',
  invalid: 'Invalid selection',
};

const KIND_PRECEDENCE: FieldIssue['kind'][] = ['required', 'tooLong', 'format', 'invalid'];

export function validateBrief(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Missing required fields' };
  }

  const brief = toBrief(body);
  const issues = briefFieldIssues(brief);
  const kinds = Object.values(issues).map((issue) => issue.kind);

  for (const kind of KIND_PRECEDENCE) {
    if (kinds.includes(kind)) return { ok: false, error: ERROR_BY_KIND[kind] };
  }

  // The per-field caps can sum past Telegram's limit once MarkdownV2 escaping
  // adds backslashes, so check the message we will actually send rather than
  // its parts. Without this, a brief validates, Telegram rejects it, and the
  // visitor sees only a generic error — a silently lost lead.
  if (formatBriefMessage(brief).length > TELEGRAM_MAX_CHARS) {
    return { ok: false, error: 'Brief too long — please shorten it' };
  }

  return { ok: true, value: brief };
}

/** Optional fields are omitted rather than rendered blank, so the message stays scannable. */
export function formatBriefMessage(brief: Brief): string {
  const lines = [
    '📬 *New project brief*',
    '',
    `*Name:* ${escMd(brief.name)}`,
    `*Email:* ${escMd(brief.email)}`,
    `*Project:* ${escMd(brief.projectType)}`,
    `*Needs:* ${escMd(brief.need)}`,
  ];

  if (brief.timeline) lines.push(`*Timeline:* ${escMd(brief.timeline)}`);
  if (brief.budget) lines.push(`*Budget:* ${escMd(brief.budget)}`);
  if (brief.links) lines.push(`*Links:* ${escMd(brief.links)}`);

  lines.push('', '*Message:*', escMd(brief.message));

  return lines.join('\n');
}
