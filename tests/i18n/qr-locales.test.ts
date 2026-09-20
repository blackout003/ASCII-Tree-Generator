import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import en from '@/i18n/locales/en.json';

type Json = { [key: string]: string | Json };

function flatten(obj: Json, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') acc[path] = value;
    else Object.assign(acc, flatten(value, path));
    return acc;
  }, {});
}

const tokens = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

const pick = (messages: Json): Record<string, string> => ({
  ...flatten({ qrGenerator: messages.qrGenerator }),
  'nav.qrCode': (messages.nav as Json).qrCode as string,
  'home.tools.qrCode.desc': (((messages.home as Json).tools as Json).qrCode as Json).desc as string,
});

const reference = pick(en as unknown as Json);

describe('QR tool translations', () => {
  it('the English reference has the expected shape', () => {
    expect(Object.keys(reference)).toContain('qrGenerator.input.counter');
    expect(tokens(reference['qrGenerator.input.counter'])).toEqual(['{count}', '{max}']);
  });

  it.each([...locales])('%s has exactly the same keys and placeholders as en', async (locale) => {
    const messages = (await import(`../../src/i18n/locales/${locale}.json`)).default as Json;
    const translated = pick(messages);

    expect(Object.keys(translated).sort()).toEqual(Object.keys(reference).sort());
    for (const [key, value] of Object.entries(translated)) {
      expect(value.trim(), `${locale}: ${key} is empty`).not.toBe('');
      expect(tokens(value), `${locale}: ${key} placeholders`).toEqual(tokens(reference[key]));
    }
  });
});
