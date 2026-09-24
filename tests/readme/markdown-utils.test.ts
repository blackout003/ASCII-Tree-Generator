import { describe, expect, it } from 'vitest';
import { escapeAlt, normalizeNewlines, safeUrl, singleLine } from '@/lib/readme/markdown-utils';

describe('normalizeNewlines', () => {
  it('converts CRLF and lone CR to LF', () => {
    expect(normalizeNewlines('a\r\nb\rc')).toBe('a\nb\nc');
  });
});

describe('singleLine', () => {
  it('collapses line breaks into single spaces and trims', () => {
    expect(singleLine('  a \n b  ')).toBe('a b');
  });

  it('returns an empty string for whitespace only', () => {
    expect(singleLine(' \n\t ')).toBe('');
  });
});

describe('escapeAlt', () => {
  it('escapes brackets and backslashes so alt text cannot close the image', () => {
    expect(escapeAlt('a [b] c\\d')).toBe('a \\[b\\] c\\\\d');
  });
});

describe('safeUrl', () => {
  it('keeps http(s) and relative URLs', () => {
    expect(safeUrl('https://x.io/logo.png')).toBe('https://x.io/logo.png');
    expect(safeUrl('./logo.png')).toBe('./logo.png');
  });

  it('percent-encodes spaces and parentheses', () => {
    expect(safeUrl('https://x.io/a b(1).png')).toBe('https://x.io/a%20b%281%29.png');
  });

  it('rejects non-http schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('JaVaScRiPt:alert(1)')).toBe('');
    expect(safeUrl('data:text/html,x')).toBe('');
  });

  it('returns an empty string for blank input', () => {
    expect(safeUrl('   ')).toBe('');
  });
});
