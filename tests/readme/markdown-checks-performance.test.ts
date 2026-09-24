import { describe, expect, it } from 'vitest';
import { FREE_MARKDOWN_MAX_LENGTH } from '@/lib/readme/blocks/free-markdown';
import { checkMarkdownFragment } from '@/lib/readme/markdown-checks';

const MAX = FREE_MARKDOWN_MAX_LENGTH;
const LIMIT_MS = 500;

// Inputs a free Markdown block accepts (up to MAX characters) that used to make
// the validator's regular expressions backtrack for seconds. The validator runs
// on every render, so any of these would freeze the tab.
const HOSTILE: Record<string, string> = {
  'table separator followed by a long run of spaces': 'a|b\n' + ' '.repeat(MAX - 10) + '|x',
  'unterminated tag followed by a long run of spaces': '<a' + ' '.repeat(MAX - 10),
  'thousands of opening code fences': '```a\n'.repeat(MAX / 5),
  'thousands of unterminated <img tags': '<img '.repeat(MAX / 5),
  'thousands of opening tags then thousands of unmatched closing tags': '<x>'.repeat(16_000) + '</y>'.repeat(12_000),
  'one very long tag name': '<' + 'a'.repeat(MAX - 10),
  'thousands of unterminated HTML comments': '<!--'.repeat(MAX / 4),
};

describe('checkMarkdownFragment on hostile input of the maximum size', () => {
  it.each(Object.entries(HOSTILE))(`finishes in under ${LIMIT_MS} ms: %s`, (_name, text) => {
    expect(text.length).toBeLessThanOrEqual(MAX);
    const start = performance.now();
    checkMarkdownFragment(text);
    expect(performance.now() - start).toBeLessThan(LIMIT_MS);
  }, 30_000);
});
