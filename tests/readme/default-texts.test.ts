import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/locales';
import { DEFAULT_TEXTS, getDefaultText, isDefaultText, type TextKey } from '@/lib/readme/default-texts';

const KEYS: TextKey[] = [
  'toc', 'installation', 'prerequisites', 'usage', 'architecture', 'roadmap',
  'contributing', 'license', 'acknowledgements', 'screenshot', 'licenseSentence',
  'greeting', 'bio', 'bioAnonymous', 'skills', 'stats', 'trophies', 'blog', 'contact',
  'statsAlt', 'languagesAlt', 'trophiesAlt',
];

describe('default README texts', () => {
  it.each(locales)('%s has every key, non-empty', (language) => {
    for (const key of KEYS) {
      expect(DEFAULT_TEXTS[language][key].trim().length, `${language}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s license sentence carries the {license} placeholder', (language) => {
    expect(DEFAULT_TEXTS[language].licenseSentence).toContain('{license}');
  });

  it('returns the text of the requested language', () => {
    expect(getDefaultText('fr', 'installation')).toBe('Installation');
    expect(getDefaultText('fr', 'prerequisites')).toBe('Prérequis');
  });

  it('falls back to English for an unknown language', () => {
    expect(getDefaultText('xx' as never, 'usage')).toBe('Usage');
  });

  it('recognizes an untouched default heading in any language, but not the license sentence or custom text', () => {
    expect(isDefaultText('Installation')).toBe(true);
    expect(isDefaultText('Utilisation')).toBe(true);
    expect(isDefaultText('使い方')).toBe(true);
    expect(isDefaultText('Getting started')).toBe(false);
    expect(isDefaultText(DEFAULT_TEXTS.en.licenseSentence)).toBe(false);
    expect(isDefaultText('')).toBe(false);
  });
  it.each(locales)('%s templates carry their placeholders', (language) => {
    const texts = DEFAULT_TEXTS[language];
    expect(texts.greeting).toContain('{name}');
    expect(texts.bio).toContain('{name}');
    for (const key of ['statsAlt', 'languagesAlt', 'trophiesAlt'] as const) {
      expect(texts[key], `${language}:${key}`).toContain('{username}');
    }
  });

  it('treats templates as custom text, not as an untouched default heading', () => {
    expect(isDefaultText('Skills')).toBe(true);
    expect(isDefaultText('Compétences')).toBe(true);
    expect(isDefaultText(DEFAULT_TEXTS.en.bio)).toBe(false);
    expect(isDefaultText(DEFAULT_TEXTS.fr.statsAlt)).toBe(false);
  });
});
