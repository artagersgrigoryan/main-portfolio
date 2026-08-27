import { describe, it, expect } from 'vitest';
import { validateBrief, formatBriefMessage } from './_brief';

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
