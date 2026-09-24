import { extractH2 } from './headings';
import { getBlockDefinition } from './registry';
import type { GenerateContext, ReadmeState } from './types';

/**
 * Pure: turns the editor state into the README Markdown. Disabled blocks and
 * blocks that render to nothing are skipped; the rest are joined by one blank line.
 * Two passes: blocks that need the headings of the others (the table of contents)
 * render after all the other blocks.
 */
export function generateReadme(state: ReadmeState): string {
  const base: GenerateContext = { mode: state.mode, theme: state.theme, meta: state.meta };
  const entries = state.blocks
    .filter((block) => block.enabled)
    .map((block) => ({ block, def: getBlockDefinition(block.type) }));

  const firstPass = entries.map(({ block, def }) =>
    def.usesHeadings ? null : def.toMarkdown(block.data, base).trim()
  );
  const others = firstPass.filter((part): part is string => part !== null).join('\n\n');
  const ctx: GenerateContext = { ...base, headings: extractH2(others) };

  const parts = entries
    .map(({ block, def }, index) => firstPass[index] ?? def.toMarkdown(block.data, ctx).trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? `${parts.join('\n\n')}\n` : '';
}
