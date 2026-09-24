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

  // CommonMark decodes the link destination after we check it, so each of these
  // used to come out of the parser as a javascript: URL.
  it('does not let angle brackets, entities or backslash escapes rebuild a javascript: URL', () => {
    expect(safeUrl('<javascript:alert(1)>')).toBe('%3Cjavascript:alert%281%29%3E');
    expect(safeUrl('javascript&#58;alert(1)')).toBe('javascript&amp;#58;alert%281%29');
    expect(safeUrl('javascript\\:alert(1)')).toBe('javascript%5C:alert%281%29');
  });

  it('keeps a query string intact by escaping the ampersand the Markdown way', () => {
    expect(safeUrl('https://x.io/?a=1&b=2')).toBe('https://x.io/?a=1&amp;b=2');
  });

  it('rejects a URL containing a tab, a line break or another control character', () => {
    expect(safeUrl('https://x.io/a\tb')).toBe('');
    expect(safeUrl('https://x.io/a\nb')).toBe('');
    expect(safeUrl('https://x.io/a\u0000b')).toBe('');
  });
});
