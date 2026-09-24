import type { BlockWarning } from './types';

// Every pattern below runs on user text of up to 100,000 characters on each
// render, so none may backtrack: no two adjacent quantifiers can match the same
// characters, and fenced code is stripped with a line scan rather than a lazy
// multi-line regex.

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);

/** Closing tag is optional in HTML: skipped to avoid false positives. */
const OPTIONAL_CLOSE_TAGS = new Set(['p', 'li', 'dt', 'dd', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'option']);

/** Matches a trimmed table separator row such as `|---|:-:|`. */
const SEPARATOR_ROW = /^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?$/;

/**
 * Lines that are not inside a fenced code block. A fence closes only on a line
 * made of the same character, at least as long as the opening one.
 */
export function linesOutsideFences(markdown: string): string[] {
  const kept: string[] = [];
  let open: { char: string; length: number } | null = null;
  for (const line of markdown.split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (open === null) {
      if (marker) {
        open = { char: marker[1][0], length: marker[1].length };
        continue;
      }
      kept.push(line);
    } else if (
      marker &&
      marker[1][0] === open.char &&
      marker[1].length >= open.length &&
      line.slice(marker[0].length).trim() === ''
    ) {
      open = null;
    }
  }
  return kept;
}

/** Removes fenced and inline code so their content is never analyzed. */
function stripCode(markdown: string): string {
  return linesOutsideFences(markdown)
    .map((line) => line.replace(/`[^`\n]*`/g, ''))
    .join('\n');
}

/** Removes `<!-- … -->` comments; an unterminated one hides the rest, as on GitHub. */
function stripComments(text: string): string {
  let result = '';
  let position = 0;
  for (;;) {
    const start = text.indexOf('<!--', position);
    if (start === -1) return result + text.slice(position);
    result += text.slice(position, start);
    const end = text.indexOf('-->', start + 4);
    if (end === -1) return result;
    position = end + 3;
  }
}

export function countImagesMissingAlt(markdown: string): number {
  const source = stripCode(markdown);
  const emptyMarkdownAlt = (source.match(/!\[\s*\]\(/g) ?? []).length;
  const htmlWithoutAlt = (source.match(/<img\b[^<>]*>/gi) ?? []).filter(
    (tag) => !/\balt\s*=\s*("[^"]+"|'[^']+')/i.test(tag)
  ).length;
  return emptyMarkdownAlt + htmlWithoutAlt;
}

/** Names of HTML tags that are opened but never closed, or closed but never opened. */
export function findUnclosedTags(markdown: string): string[] {
  const source = stripComments(stripCode(markdown));
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s[^<>]*?)?)(\/?)>/g;
  const stack: string[] = [];
  const open = new Map<string, number>();
  const problems = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source)) !== null) {
    const closing = match[1] === '/';
    const name = match[2].toLowerCase();
    const selfClosing = match[4] === '/';
    if (VOID_TAGS.has(name) || OPTIONAL_CLOSE_TAGS.has(name) || selfClosing) continue;
    if (!closing) {
      stack.push(name);
      open.set(name, (open.get(name) ?? 0) + 1);
      continue;
    }
    if (!open.get(name)) {
      problems.add(name);
      continue;
    }
    const removed = stack.splice(stack.lastIndexOf(name));
    for (const tag of removed) open.set(tag, (open.get(tag) ?? 1) - 1);
    for (const tag of removed.slice(1)) problems.add(tag);
  }
  for (const tag of stack) problems.add(tag);
  return [...problems];
}

/** A table with an all-empty header row is a layout trick, not data. */
export function hasLayoutTable(markdown: string): boolean {
  const lines = stripCode(markdown).split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const row = lines[i];
    const separator = lines[i + 1];
    if (!row.includes('|') || !separator.includes('|') || !SEPARATOR_ROW.test(separator.trim())) continue;
    const cells = row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
    if (cells.every((cell) => cell.trim() === '')) return true;
  }
  return false;
}

export function checkMarkdownFragment(markdown: string): BlockWarning[] {
  const warnings: BlockWarning[] = [];
  const missingAlt = countImagesMissingAlt(markdown);
  if (missingAlt > 0) warnings.push({ code: 'imageMissingAlt', params: { count: missingAlt } });
  const tags = findUnclosedTags(markdown);
  if (tags.length > 0) warnings.push({ code: 'htmlTagMismatch', params: { tags: tags.join(', ') } });
  if (hasLayoutTable(markdown)) warnings.push({ code: 'layoutTable' });
  return warnings;
}
