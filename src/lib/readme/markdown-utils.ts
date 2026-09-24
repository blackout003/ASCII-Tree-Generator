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
 * Returns a URL safe to put in a Markdown link destination, or '' when the
 * scheme is anything other than http(s). Relative URLs are kept as-is.
 */
export function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return '';
  return trimmed.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
}
