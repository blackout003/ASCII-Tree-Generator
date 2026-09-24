import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/locales';
import { DEFAULT_TEXTS, getDefaultText, type TextKey } from '@/lib/readme/default-texts';

const KEYS: TextKey[] = [
  'toc', 'installation', 'prerequisites', 'usage', 'architecture', 'roadmap',
  'contributing', 'license', 'acknowledgements', 'screenshot', 'licenseSentence',
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
});
