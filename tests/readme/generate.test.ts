import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { freeMarkdown, header, stateWith } from './helpers';

describe('generateReadme', () => {
  it('returns an empty string when there are no blocks', () => {
    expect(generateReadme(stateWith([]))).toBe('');
  });

  it('renders the header block: logo, title, tagline', () => {
    const state = stateWith([
      header('h', { title: 'Demo', tagline: 'Une lib', logoUrl: 'https://x.io/l.png', logoAlt: 'Logo de Demo' }),
    ]);
    expect(generateReadme(state)).toBe('![Logo de Demo](https://x.io/l.png)\n\n# Demo\n\nUne lib\n');
  });

  it('falls back to the title, then to "Logo", for the logo alt text', () => {
    const withTitle = stateWith([header('h', { title: 'Demo', logoUrl: 'https://x.io/l.png' })]);
    expect(generateReadme(withTitle)).toContain('![Demo](https://x.io/l.png)');
    const bare = stateWith([header('h', { logoUrl: 'https://x.io/l.png' })]);
    expect(generateReadme(bare)).toBe('![Logo](https://x.io/l.png)\n');
  });

  it('produces valid Markdown when alt text and URL contain brackets, parentheses and spaces', () => {
    const state = stateWith([
      header('h', { logoUrl: 'https://x.io/my logo (v2).png', logoAlt: 'a [b] c' }),
    ]);
    expect(generateReadme(state)).toBe('![a \\[b\\] c](https://x.io/my%20logo%20%28v2%29.png)\n');
  });

  it('drops a javascript: logo URL instead of embedding it', () => {
    const state = stateWith([header('h', { title: 'Demo', logoUrl: 'javascript:alert(1)' })]);
    expect(generateReadme(state)).toBe('# Demo\n');
  });

  it('flattens multi-line titles and taglines to one line', () => {
    const state = stateWith([header('h', { title: 'Demo\nApp', tagline: 'a\r\nb' })]);
    expect(generateReadme(state)).toBe('# Demo App\n\na b\n');
  });

  it('skips a header with nothing filled in', () => {
    expect(generateReadme(stateWith([header('h')]))).toBe('');
  });

  it('omits disabled blocks', () => {
    const state = stateWith([header('h', { title: 'Demo' }), freeMarkdown('f', 'hidden', false)]);
    expect(generateReadme(state)).toBe('# Demo\n');
  });

  it('keeps block order and separates blocks with one blank line', () => {
    const state = stateWith([freeMarkdown('a', 'first'), header('h', { title: 'Demo' }), freeMarkdown('b', 'last')]);
    expect(generateReadme(state)).toBe('first\n\n# Demo\n\nlast\n');
  });

  it('normalizes CRLF in free Markdown', () => {
    const state = stateWith([freeMarkdown('f', 'line one\r\nline two')]);
    expect(generateReadme(state)).toBe('line one\nline two\n');
  });

  it('skips empty and whitespace-only free Markdown without leaving blank lines', () => {
    const state = stateWith([
      freeMarkdown('a', 'before'),
      freeMarkdown('b', '   \n\t\n'),
      freeMarkdown('c', ''),
      freeMarkdown('d', 'after'),
    ]);
    expect(generateReadme(state)).toBe('before\n\nafter\n');
  });

  it('renders header text literally: an HTML comment opener cannot hide the blocks after it', () => {
    const state = stateWith([header('h', { tagline: '<!-- wip' }), freeMarkdown('f', '## Install')]);
    expect(generateReadme(state)).toBe('\\<!-- wip\n\n## Install\n');
  });

  it('escapes block-start characters in the title and tagline', () => {
    const state = stateWith([header('h', { title: '1. Demo #', tagline: '- fast' })]);
    expect(generateReadme(state)).toBe('# 1\\. Demo \\#\n\n\\- fast\n');
  });
});
