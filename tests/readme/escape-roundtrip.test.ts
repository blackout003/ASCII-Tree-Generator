import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import { escapeMarkdownText } from '@/lib/readme/markdown-utils';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, README_MARKDOWN_PROPS, markdown));
}

// Whatever a user types in a single-line field, the real Markdown renderer
// must show exactly that text, as one paragraph and nothing else.
const SAMPLES = [
  '<!-- wip', '<script>alert(1)</script>', '<b>x</b>', '1. Fast', '2026) done', '---', '- - -', '===',
  'Lib #', 'C#', '#hashtag', '# title', '## two', '> quote', '+ item', '- item', '-x', '*bold*', '**', '***',
  '_private', 'foo_', '___', 'a_b_c', 'a _b_ c', '`code`', '~~strike~~', '[link](x)', '![img](u)', '[x]',
  '&copy; 2026', '&#35;', 'R&D', 'A & B', 'a | b', 'Dr. Who?', '1.5 version', '\\', 'back\\slash', '2*3=6',
];

describe('escapeMarkdownText renders literally', () => {
  it.each(SAMPLES)('%j', (sample) => {
    expect(render(escapeMarkdownText(sample))).toBe(`<p>${escapeHtml(sample)}</p>`);
  });
});
