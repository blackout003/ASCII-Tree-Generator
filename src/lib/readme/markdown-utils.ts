export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

/** Collapses any run of whitespace containing a line break into one space. */
export function singleLine(text: string): string {
  return normalizeNewlines(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');
}

/** Alt text goes between `[` and `]`: neutralize characters that would end it early. */
export function escapeAlt(text: string): string {
  return singleLine(text).replace(/[[\]\\]/g, '\\$&');
}

/**
 * Returns a URL safe to put in a Markdown link destination, or '' when it is
 * unusable. Rejects any scheme other than http(s) and any control character.
 * CommonMark decodes the destination after this check (entities, backslash
 * escapes, `<…>` wrapping), so those characters are neutralized here too:
 * `&` becomes `&amp;` (which decodes back to `&`), and `<`, `>`, `\`, spaces
 * and parentheses are percent-encoded. Relative URLs are kept as-is.
 */
export function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return '';
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/ /g, '%20')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\\/g, '%5C');
}

const WORD_CHARACTER = new RegExp('[\\p{L}\\p{N}]', 'u');

/**
 * Escapes one line of plain text so Markdown renders it literally: no emphasis,
 * links, raw HTML or comments, and no block syntax (heading, list, quote, rule).
 * Underscores inside a word are left alone, since CommonMark does not treat
 * them as emphasis.
 */
export function escapeMarkdownText(text: string): string {
  return singleLine(text)
    .replace(/[\\`*[\]<>|~]/g, '\\$&')
    .replace(/_/g, (match, offset: number, whole: string) => {
      const before = whole[offset - 1];
      const after = whole[offset + 1];
      const insideWord =
        before !== undefined && WORD_CHARACTER.test(before) && after !== undefined && WORD_CHARACTER.test(after);
      return insideWord ? match : '\\_';
    })
    .replace(/&(?=#?[A-Za-z0-9]+;)/g, '\\&')
    .replace(/(\s)(#+)$/, '$1\\$2')
    .replace(/^(#{1,6})(?=\s|$)/, '\\$1')
    .replace(/^([-+])(?=[\s-]|$)/, '\\$1')
    .replace(/^(\d+)([.)])(?=\s|$)/, '$1\\$2');
}

/**
 * A fenced code block. The fence is longer than the longest run of backticks in
 * the code, and the info string keeps only characters that cannot break out.
 */
export function codeFence(code: string, language = ''): string {
  const body = normalizeNewlines(code).replace(/^\n+/, '').trimEnd();
  const longestRun = (body.match(/`+/g) ?? []).reduce((longest, run) => Math.max(longest, run.length), 0);
  const fence = '`'.repeat(Math.max(3, longestRun + 1));
  const info = language.replace(/[^A-Za-z0-9_+#.-]/g, '');
  return `${fence}${info}\n${body}\n${fence}`;
}

/** ATX heading from plain text, or '' when the text is blank. */
export function atxHeading(level: 1 | 2 | 3, text: string): string {
  const plain = escapeMarkdownText(text);
  return plain === '' ? '' : `${'#'.repeat(level)} ${plain}`;
}

export function nonEmptyLines(text: string): string[] {
  return normalizeNewlines(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}
