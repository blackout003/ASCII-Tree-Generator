import type { AnyBlockDefinition } from './block-definition';
import { alertBlock } from './blocks/alert';
import { architectureBlock } from './blocks/architecture';
import { badgesBlock } from './blocks/badges';
import { contributingBlock } from './blocks/contributing';
import { freeMarkdownBlock } from './blocks/free-markdown';
import { headerBlock } from './blocks/header';
import { installationBlock } from './blocks/installation';
import { licenseBlock } from './blocks/license';
import { tableOfContentsBlock } from './blocks/table-of-contents';
import { usageBlock } from './blocks/usage';
import { visualProofBlock } from './blocks/visual-proof';
import type { BlockType, ReadmeMode } from './types';

// Order is the display order of the "add a block" menu and of a new README.
const DEFINITIONS: Record<BlockType, AnyBlockDefinition> = {
  header: headerBlock,
  badges: badgesBlock,
  visualProof: visualProofBlock,
  tableOfContents: tableOfContentsBlock,
  installation: installationBlock,
  usage: usageBlock,
  architecture: architectureBlock,
  contributing: contributingBlock,
  license: licenseBlock,
  alert: alertBlock,
  freeMarkdown: freeMarkdownBlock,
};

export const BLOCK_TYPES = Object.keys(DEFINITIONS) as BlockType[];

export function isBlockType(value: string): value is BlockType {
  return Object.prototype.hasOwnProperty.call(DEFINITIONS, value);
}

export function getBlockDefinition(type: BlockType): AnyBlockDefinition {
  return DEFINITIONS[type];
}

/** Block definitions offered in the "add a block" menu for a mode, in display order. */
export function getCatalog(mode: ReadmeMode): AnyBlockDefinition[] {
  return BLOCK_TYPES.map((type) => DEFINITIONS[type]).filter((def) => def.modes.includes(mode));
}
