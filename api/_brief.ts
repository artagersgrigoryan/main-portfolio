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

/** MarkdownV2 reserves these; Telegram rejects the whole message if any is bare. */
const escMd = (s: string) => s.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');

const str = (v: unknown) => String(v ?? '').trim();

/** Empty passes — the caller decides whether a field is required. */
const inList = (value: string, allowed: readonly string[]) =>
  value === '' || allowed.includes(value);

export function validateBrief(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Missing required fields' };
  }

  const b = body as Record<string, unknown>;
  const brief: Brief = {
    name: str(b.name),
    email: str(b.email),
    projectType: str(b.projectType),
    need: str(b.need),
    timeline: str(b.timeline),
    budget: str(b.budget),
    links: str(b.links),
    message: str(b.message),
  };

  if (!brief.name || !brief.email || !brief.projectType || !brief.need || !brief.message) {
    return { ok: false, error: 'Missing required fields' };
  }

  if (
    brief.name.length > 100 ||
    brief.email.length > 200 ||
    brief.links.length > 500 ||
    brief.message.length > 3900
  ) {
    return { ok: false, error: 'Input too long' };
  }

  if (
    !inList(brief.projectType, PROJECT_TYPES) ||
    !inList(brief.need, NEEDS) ||
    !inList(brief.timeline, TIMELINES) ||
    !inList(brief.budget, BUDGETS)
  ) {
    return { ok: false, error: 'Invalid selection' };
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
