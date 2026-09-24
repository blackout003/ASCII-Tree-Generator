import { getBlockDefinition } from './registry';
import type { GenerateContext, ReadmeState, ValidationWarning } from './types';

/** Non-blocking checks: each warning points at the block that caused it. */
export function validateReadme(state: ReadmeState): ValidationWarning[] {
  const ctx: GenerateContext = { mode: state.mode, theme: state.theme, meta: state.meta };
  const warnings: ValidationWarning[] = [];
  for (const block of state.blocks) {
    if (!block.enabled) continue;
    for (const warning of getBlockDefinition(block.type).validate(block.data, ctx)) {
      warnings.push({ ...warning, blockId: block.id });
    }
  }
  return warnings;
}
