import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';

function render(source: string): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, README_MARKDOWN_PROPS, source));
}

describe('README preview sanitization', () => {
  it('removes <script> elements and their content', () => {
    const html = render('a <script>alert(1)</script> b');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert');
  });

  it('strips event-handler attributes but keeps the element', () => {
    const html = render('<img src="x" onerror="alert(1)" alt="ok">');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<img');
  });

  it('neutralizes javascript: links', () => {
    expect(render('[x](javascript:alert(1))')).not.toContain('javascript:');
  });

  it('removes <iframe>', () => {
    expect(render('<iframe src="https://evil.example"></iframe>')).not.toContain('<iframe');
  });

  it('removes inline styles', () => {
    const html = render('<div style="position:fixed">x</div>');
    expect(html).not.toContain('style=');
    expect(html).toContain('<div>x</div>');
  });

  it('drops arbitrary class names', () => {
    expect(render('<div class="hidden-evil">x</div>')).not.toContain('hidden-evil');
  });

  it('strips event handlers from inline svg', () => {
    const html = render('<svg onload="alert(1)" viewBox="0 0 1 1"><path d="M0 0" onclick="x()"/></svg>');
    expect(html).not.toContain('onload');
    expect(html).not.toContain('onclick');
  });

  it('keeps <picture> with a dark-mode <source>', () => {
    const html = render(
      '<picture>\n<source media="(prefers-color-scheme: dark)" srcset="https://x.example/d.png">\n<img alt="Logo" src="https://x.example/l.png" width="100">\n</picture>'
    );
    expect(html).toContain('<picture>');
    expect(html).toContain('<source');
    expect(html).toContain('srcSet="https://x.example/d.png"');
    expect(html).toContain('width="100"');
  });

  it('keeps align on block elements', () => {
    expect(render('<div align="center">\n\n# Hi\n\n</div>')).toContain('<div align="center">');
  });

  it('keeps <details> and <summary>', () => {
    const html = render('<details><summary>More</summary>\n\ntext\n\n</details>');
    expect(html).toContain('<details>');
    expect(html).toContain('<summary>More</summary>');
  });

  it('renders GitHub alerts', () => {
    const note = render('> [!NOTE]\n> Useful info');
    expect(note).toContain('markdown-alert-note');
    expect(note).toContain('NOTE');
    expect(render('> [!WARNING]\n> Careful')).toContain('markdown-alert-warning');
  });

  it('renders GFM tables', () => {
    expect(render('| a | b |\n|---|---|\n| 1 | 2 |')).toContain('<table>');
  });

  it('highlights fenced code', () => {
    expect(render('```js\nconst a = 1;\n```')).toContain('hljs-keyword');
  });
});
