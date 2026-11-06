import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import { ASCII_EMOJI_CATEGORIES } from '@/lib/ascii-emoji-data';

const allEmojis = ASCII_EMOJI_CATEGORIES.flatMap((c) => c.emojis);

describe('ascii emoji data', () => {
  it('has unique category ids', () => {
    const ids = ASCII_EMOJI_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique label keys (they are used as React keys)', () => {
    const keys = allEmojis.map((e) => e.labelKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has unique, non-empty glyphs', () => {
    const values = allEmojis.map((e) => e.value);
    expect(values.every((v) => v.trim().length > 0)).toBe(true);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('ascii emoji translations', () => {
  it.each(locales)('%s translates every category title and description', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const cat of ASCII_EMOJI_CATEGORIES) {
      const entry = messages.asciiEmoji.categories[cat.id];
      expect(entry?.title?.trim(), `${locale}: categories.${cat.id}.title`).toBeTruthy();
      expect(entry?.desc?.trim(), `${locale}: categories.${cat.id}.desc`).toBeTruthy();
    }
  });

  it.each(locales)('%s translates every emoji label', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const emoji of allEmojis) {
      const label = messages.asciiEmoji.labels[emoji.labelKey];
      expect(typeof label === 'string' && label.trim().length > 0, `${locale}: labels.${emoji.labelKey}`).toBe(true);
    }
  });
});
