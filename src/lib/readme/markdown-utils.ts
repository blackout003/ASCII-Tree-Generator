export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

/** Collapses any run of whitespace containing a line break into one space. */
export function singleLine(text: string): string {
  return normalizeNewlines(text).replace(/\s*\n\s*/g, ' ').trim();
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
