import { describe, it, expect } from 'vitest';
import { validateBrief, formatBriefMessage, briefFieldIssues, toBrief } from './_brief';

const valid = {
  name: 'Jane Founder',
  email: 'jane@startup.com',
  projectType: 'Web3 / crypto',
  need: 'Design → Built',
  timeline: '1–3 months',
  budget: '$5–15k',
  links: 'https://startup.com',
  message: 'We need a token dashboard designed and shipped.',
};

describe('validateBrief', () => {
  it('accepts a complete valid brief', () => {
    const result = validateBrief(valid);
    expect(result.ok).toBe(true);
  });

  it('accepts a brief with the optional fields omitted', () => {
    const { timeline, budget, links, ...required } = valid;
    const result = validateBrief(required);
    expect(result.ok).toBe(true);
  });

  it('rejects a missing required field', () => {
    const result = validateBrief({ ...valid, message: '   ' });
    expect(result).toEqual({ ok: false, error: 'Missing required fields' });
  });

  it('rejects a message over the Telegram-safe limit', () => {
    const result = validateBrief({ ...valid, message: 'x'.repeat(3901) });
    expect(result).toEqual({ ok: false, error: 'Input too long' });
  });

  it('rejects a projectType outside the allowed list', () => {
    const result = validateBrief({ ...valid, projectType: 'Weapons' });
    expect(result).toEqual({ ok: false, error: 'Invalid selection' });
  });

  it('rejects a budget outside the allowed list', () => {
    const result = validateBrief({ ...valid, budget: 'a trillion' });
    expect(result).toEqual({ ok: false, error: 'Invalid selection' });
  });

  it('rejects a non-object body', () => {
    expect(validateBrief(null)).toEqual({ ok: false, error: 'Missing required fields' });
  });

  it('rejects a brief whose formatted message would exceed the Telegram limit', () => {
    // Each field sits exactly at (or under) its own individual cap — name<=100,
    // email<=200, links<=500, message<=3900 — so the earlier per-field length
    // check passes and this exercises the new combined-length check instead.
    const result = validateBrief({
      ...valid,
      name: 'x'.repeat(100),
      email: `${'x'.repeat(188)}@example.com`,
      links: 'x'.repeat(500),
      message: 'x'.repeat(3900),
    });
    expect(result).toEqual({ ok: false, error: 'Brief too long — please shorten it' });
  });

  it('accepts a realistically long brief', () => {
    const result = validateBrief({
      ...valid,
      links: 'https://example.com '.repeat(5),
      message: 'x'.repeat(2500),
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a malformed email address', () => {
    expect(validateBrief({ ...valid, email: 'john@' })).toEqual({
      ok: false,
      error: 'Invalid email address',
    });
  });

  it('reports a missing field before a malformed email', () => {
    // Precedence matters: a visitor who left the form blank should be told
    // that, not lectured about email syntax.
    const result = validateBrief({ ...valid, name: '', email: 'nope' });
    expect(result).toEqual({ ok: false, error: 'Missing required fields' });
  });
});

describe('briefFieldIssues', () => {
  it('finds no issues in a valid brief', () => {
    expect(briefFieldIssues(toBrief(valid))).toEqual({});
  });

  it('keys every issue by the field that owns it', () => {
    const issues = briefFieldIssues(toBrief({ ...valid, name: '', email: 'john@', need: '' }));
    expect(Object.keys(issues).sort()).toEqual(['email', 'name', 'need']);
    expect(issues.name?.kind).toBe('required');
    expect(issues.email?.kind).toBe('format');
    expect(issues.need?.kind).toBe('required');
  });

  it('reports a required field once, not also as malformed', () => {
    const issues = briefFieldIssues(toBrief({ ...valid, email: '   ' }));
    expect(issues.email).toEqual({ kind: 'required', message: 'Email address is required' });
  });

  it('flags an over-length field with its own cap', () => {
    const issues = briefFieldIssues(toBrief({ ...valid, message: 'x'.repeat(3901) }));
    expect(issues.message).toEqual({
      kind: 'tooLong',
      message: 'Keep this under 3900 characters',
    });
  });

  it('flags a value outside an allowed list', () => {
    const issues = briefFieldIssues(toBrief({ ...valid, budget: 'a trillion' }));
    expect(issues.budget?.kind).toBe('invalid');
  });

  it('leaves optional fields alone when empty', () => {
    const { timeline, budget, links, ...required } = valid;
    expect(briefFieldIssues(toBrief(required))).toEqual({});
  });
});

describe('formatBriefMessage', () => {
  it('escapes MarkdownV2 reserved characters', () => {
    const result = validateBrief({ ...valid, name: 'A. Founder-Smith' });
    if (!result.ok) throw new Error('fixture should validate');
    const text = formatBriefMessage(result.value);
    expect(text).toContain('A\\. Founder\\-Smith');
  });

  it('omits optional fields that were not supplied', () => {
    const { timeline, budget, links, ...required } = valid;
    const result = validateBrief(required);
    if (!result.ok) throw new Error('fixture should validate');
    const text = formatBriefMessage(result.value);
    expect(text).not.toContain('Timeline');
    expect(text).not.toContain('Budget');
  });

  it('escapes every MarkdownV2 reserved character', () => {
    const reserved = '_*[]()~`>#+-=|{}.!\\';
    const result = validateBrief({ ...valid, message: reserved });
    if (!result.ok) throw new Error('fixture should validate');
    const text = formatBriefMessage(result.value);
    for (const ch of reserved) {
      expect(text).toContain(`\\${ch}`);
    }
  });
});
