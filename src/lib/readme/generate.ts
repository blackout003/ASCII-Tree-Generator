import { getBlockDefinition } from './registry';
import type { GenerateContext, ReadmeState } from './types';

/**
 * Pure: turns the editor state into the README Markdown. Disabled blocks and
 * blocks that render to nothing are skipped; the rest are joined by one blank line.
 */
export function generateReadme(state: ReadmeState): string {
  const ctx: GenerateContext = { mode: state.mode, theme: state.theme, meta: state.meta };
  const parts = state.blocks
    .filter((block) => block.enabled)
    .map((block) => getBlockDefinition(block.type).toMarkdown(block.data, ctx).trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? `${parts.join('\n\n')}\n` : '';
}
