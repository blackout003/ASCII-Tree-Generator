import { DEFAULT_THEME, EMPTY_META } from '@/lib/readme/defaults';
import type { Block, BlockType, ReadmeMode, ReadmeState } from '@/lib/readme/types';

export function stateWith(blocks: Block[], mode: ReadmeMode = 'project'): ReadmeState {
  return { version: 1, mode, theme: { ...DEFAULT_THEME }, meta: { ...EMPTY_META }, blocks };
}

export function block(id: string, type: BlockType, data: unknown, enabled = true): Block {
  return { id, type, enabled, data };
}

export function header(id: string, data: Partial<Record<'title' | 'tagline' | 'logoUrl' | 'logoAlt', string>> = {}): Block {
  return block(id, 'header', { title: '', tagline: '', logoUrl: '', logoAlt: '', ...data });
}

export function freeMarkdown(id: string, content: string, enabled = true): Block {
  return block(id, 'freeMarkdown', { content }, enabled);
}
