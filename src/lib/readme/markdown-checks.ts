import type { BlockWarning } from './types';

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);

/** Closing tag is optional in HTML: skipped to avoid false positives. */
const OPTIONAL_CLOSE_TAGS = new Set(['p', 'li', 'dt', 'dd', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'option']);

const SEPARATOR_ROW = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

/** Removes fenced and inline code so their content is never analyzed. */
function stripCode(markdown: string): string {
  return markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
    .replace(/`[^`\n]*`/g, '');
}

export function countImagesMissingAlt(markdown: string): number {
  const source = stripCode(markdown);
  const emptyMarkdownAlt = (source.match(/!\[\s*\]\(/g) ?? []).length;
  const htmlWithoutAlt = (source.match(/<img\b[^>]*>/gi) ?? []).filter(
    (tag) => !/\balt\s*=\s*("[^"]+"|'[^']+')/i.test(tag)
  ).length;
  return emptyMarkdownAlt + htmlWithoutAlt;
}

/** Names of HTML tags that are opened but never closed, or closed but never opened. */
export function findUnclosedTags(markdown: string): string[] {
  const source = stripCode(markdown).replace(/<!--[\s\S]*?-->/g, '');
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)(\/?)>/g;
  const stack: string[] = [];
  const problems: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source)) !== null) {
    const closing = match[1] === '/';
    const name = match[2].toLowerCase();
    const selfClosing = match[4] === '/';
    if (VOID_TAGS.has(name) || OPTIONAL_CLOSE_TAGS.has(name) || selfClosing) continue;
    if (!closing) {
      stack.push(name);
      continue;
    }
    const index = stack.lastIndexOf(name);
    if (index === -1) {
      problems.push(name);
      continue;
    }
    problems.push(...stack.splice(index).slice(1));
  }
  problems.push(...stack);
  return [...new Set(problems)];
}

/** A table with an all-empty header row is a layout trick, not data. */
export function hasLayoutTable(markdown: string): boolean {
  const lines = stripCode(markdown).split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const row = lines[i];
    const separator = lines[i + 1];
    if (!row.includes('|') || !separator.includes('|') || !SEPARATOR_ROW.test(separator)) continue;
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
