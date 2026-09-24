import { linesOutsideFences } from './markdown-checks';

const SLUG_FORBIDDEN = new RegExp('[^\\p{L}\\p{N}\\p{M}_ -]', 'gu');

/** Removes an ATX closing sequence (`## Title ##`) without regex backtracking. */
function stripClosingHashes(text: string): string {
  let end = text.length;
  while (end > 0 && text[end - 1] === '#') end--;
  if (end < text.length && (end === 0 || text[end - 1] === ' ' || text[end - 1] === '\t')) {
    return text.slice(0, end).trimEnd();
  }
  return text;
}

/** Level-2 headings outside code fences, as written (backslash escapes kept). */
export function extractH2(markdown: string): string[] {
  const headings: string[] = [];
  for (const line of linesOutsideFences(markdown)) {
    const match = /^##[ \t]+(\S.*)$/.exec(line);
    if (!match) continue;
    const text = stripClosingHashes(match[1].trimEnd());
    if (text !== '') headings.push(text);
  }
  return headings;
}

/** GitHub's anchor for a heading: lowercase, punctuation removed, spaces to hyphens. */
export function githubSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\\(.)/g, '$1')
    .replace(SLUG_FORBIDDEN, '')
    .replace(/ /g, '-');
}

/** Anchors for a list of headings; repeated ones get `-1`, `-2`… as on GitHub. */
export function githubSlugs(texts: string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((text) => {
    const base = githubSlug(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  });
}
