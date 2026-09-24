import { describe, expect, it } from 'vitest';
import { atxHeading, codeFence, escapeAlt, escapeMarkdownText, nonEmptyLines, normalizeNewlines, safeUrl, singleLine } from '@/lib/readme/markdown-utils';

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

describe('escapeMarkdownText', () => {
  it.each([
    ['<!-- wip', '\\<!-- wip'],
    ['1. Fast', '1\\. Fast'],
    ['2026) done', '2026\\) done'],
    ['---', '\\---'],
    ['Lib #', 'Lib \\#'],
    ['C#', 'C#'],
    ['# title', '\\# title'],
    ['> quote', '\\> quote'],
    ['+ item', '\\+ item'],
    ['*bold* and `code`', '\\*bold\\* and \\`code\\`'],
    ['_private', '\\_private'],
    ['snake_case_name', 'snake_case_name'],
    ['a _b_ c', 'a \\_b\\_ c'],
    ['[link](x)', '\\[link\\](x)'],
    ['&copy; 2026', '\\&copy; 2026'],
    ['R&D', 'R&D'],
    ['a | b', 'a \\| b'],
    ['1.5 version', '1.5 version'],
  ])('escapes %j as %j', (input, expected) => {
    expect(escapeMarkdownText(input)).toBe(expected);
  });

  it('flattens line breaks and trims', () => {
    expect(escapeMarkdownText('  a\r\nb  ')).toBe('a b');
  });
});

describe('codeFence', () => {
  it('wraps code in a three-backtick fence with its language', () => {
    expect(codeFence('npm start', 'bash')).toBe('```bash\nnpm start\n```');
  });

  it('uses a fence longer than any backtick run inside the code', () => {
    expect(codeFence('a\n```\nb', '')).toBe('````\na\n```\nb\n````');
    expect(codeFence('x ````` y')).toBe('``````\nx ````` y\n``````');
  });

  it('keeps only safe characters in the info string', () => {
    expect(codeFence('x', 'js x\n`')).toBe('```jsx\nx\n```');
  });

  it('drops leading blank lines and trailing whitespace but keeps indentation', () => {
    expect(codeFence('\n\n  a\n  b  \n\n')).toBe('```\n  a\n  b\n```');
  });
});

describe('atxHeading', () => {
  it('builds an escaped heading', () => {
    expect(atxHeading(2, '1. Start')).toBe('## 1\\. Start');
    expect(atxHeading(3, 'Q&A')).toBe('### Q&A');
  });

  it('returns an empty string for blank text', () => {
    expect(atxHeading(2, '  \n ')).toBe('');
  });
});

describe('nonEmptyLines', () => {
  it('returns trimmed non-empty lines', () => {
    expect(nonEmptyLines(' a \r\n\n  \n b')).toEqual(['a', 'b']);
  });
});

// These helpers also run on values read from imported files, so none may
// backtrack on a long run of whitespace.
describe('linear-time guarantees on long whitespace', () => {
  it.each([
    ['singleLine', (text: string) => singleLine(text)],
    ['escapeAlt', (text: string) => escapeAlt(text)],
    ['escapeMarkdownText', (text: string) => escapeMarkdownText(text)],
    ['codeFence', (text: string) => codeFence(text)],
  ])('%s handles 100,000 spaces between two letters', (_name, run) => {
    const text = 'a' + ' '.repeat(100_000) + 'b';
    const start = performance.now();
    run(text);
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe('singleLine', () => {
  it('collapses blank lines and whitespace around line breaks', () => {
    expect(singleLine('a \n\n\t b')).toBe('a b');
    expect(singleLine('a   b')).toBe('a   b');
  });
});
