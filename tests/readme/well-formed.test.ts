import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { toWellFormed } from '@/lib/readme/markdown-utils';
import { shieldsText } from '@/lib/readme/shields';
import { block, stateWith } from './helpers';

const LONE_HIGH = '\ud800';
const LONE_LOW = '\udc00';

const banner = (lines: string) =>
  block('b', 'banner', {
    lines,
    font: 'Fira Code',
    size: 24,
    width: 500,
    align: 'left',
    color: '',
    baseUrl: '',
  });

describe('toWellFormed', () => {
  it('replaces unpaired surrogates and keeps valid pairs', () => {
    expect(toWellFormed(`a${LONE_HIGH}b${LONE_LOW}c`)).toBe('a�b�c');
    expect(toWellFormed('a😀b')).toBe('a😀b');
    expect(toWellFormed('😀'.slice(0, 1))).toBe('�');
    expect(toWellFormed('')).toBe('');
  });

  it('runs in linear time on a long input', () => {
    const start = performance.now();
    toWellFormed(LONE_HIGH.repeat(100_000));
    expect(performance.now() - start).toBeLessThan(300);
  });
});

describe('text going into a URL never throws', () => {
  it('cuts a banner line by characters, not by UTF-16 units', () => {
    const markdown = generateReadme(stateWith([banner(`${'a'.repeat(99)}😀`)], 'profile'));
    expect(markdown).toContain(`${'a'.repeat(99)}%F0%9F%98%80`);
  });

  it('accepts a banner line with an unpaired surrogate (imported file)', () => {
    expect(() => generateReadme(stateWith([banner(`x${LONE_HIGH}`)], 'profile'))).not.toThrow();
    expect(generateReadme(stateWith([banner(`x${LONE_HIGH}`)], 'profile'))).toContain('x%EF%BF%BD');
  });

  it('accepts an unpaired surrogate in badge text', () => {
    expect(() => shieldsText(`a${LONE_LOW}`)).not.toThrow();
    expect(shieldsText(`a${LONE_LOW}`)).toBe('a%EF%BF%BD');
  });
});
