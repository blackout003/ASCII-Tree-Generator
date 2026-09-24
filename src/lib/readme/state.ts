import { DEFAULT_THEME, EMPTY_META } from './defaults';
import { isDefaultText } from './default-texts';
import { getBlockDefinition, getCatalog } from './registry';
import type { Block, BlockType, ReadmeMeta, ReadmeMode, ReadmeState } from './types';

export function createBlockId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function createBlock(type: BlockType, meta: ReadmeMeta, id: string = createBlockId()): Block {
  return { id, type, enabled: true, data: getBlockDefinition(type).createData(meta) };
}

function getDefaultBlocks(mode: ReadmeMode, meta: ReadmeMeta): Block[] {
  return getCatalog(mode)
    .filter((def) => def.defaultOnCreate)
    .map((def) => createBlock(def.type, meta));
}

export function createInitialState(mode: ReadmeMode = 'project'): ReadmeState {
  const meta = { ...EMPTY_META };
  return { version: 1, mode, theme: { ...DEFAULT_THEME }, meta, blocks: getDefaultBlocks(mode, meta) };
}

export function canAddBlock(state: ReadmeState, type: BlockType): boolean {
  const def = getBlockDefinition(type);
  if (!def.modes.includes(state.mode)) return false;
  return !(def.singleton && state.blocks.some((block) => block.type === type));
}

export function addBlock(state: ReadmeState, type: BlockType): ReadmeState {
  if (!canAddBlock(state, type)) return state;
  return { ...state, blocks: [...state.blocks, createBlock(type, state.meta)] };
}

export function removeBlock(state: ReadmeState, id: string): ReadmeState {
  return { ...state, blocks: state.blocks.filter((block) => block.id !== id) };
}

export function toggleBlock(state: ReadmeState, id: string): ReadmeState {
  return {
    ...state,
    blocks: state.blocks.map((block) => (block.id === id ? { ...block, enabled: !block.enabled } : block)),
  };
}

export function updateBlockData(state: ReadmeState, id: string, data: unknown): ReadmeState {
  return {
    ...state,
    blocks: state.blocks.map((block) => (block.id === id ? { ...block, data } : block)),
  };
}

export function moveBlock(state: ReadmeState, id: string, delta: -1 | 1): ReadmeState {
  const from = state.blocks.findIndex((block) => block.id === id);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= state.blocks.length) return state;
  const blocks = [...state.blocks];
  [blocks[from], blocks[to]] = [blocks[to], blocks[from]];
  return { ...state, blocks };
}

/** Drag and drop: moves `fromId` to the position currently held by `toId`. */
export function reorderBlock(state: ReadmeState, fromId: string, toId: string): ReadmeState {
  if (fromId === toId) return state;
  const from = state.blocks.findIndex((block) => block.id === fromId);
  const to = state.blocks.findIndex((block) => block.id === toId);
  if (from === -1 || to === -1) return state;
  const blocks = [...state.blocks];
  const [moved] = blocks.splice(from, 1);
  blocks.splice(to, 0, moved);
  return { ...state, blocks };
}

/**
 * Switches mode, keeping only the blocks the new mode's catalog offers.
 * `dropped` counts the blocks removed so the UI can tell the user.
 */
export function switchMode(state: ReadmeState, mode: ReadmeMode): { state: ReadmeState; dropped: number } {
  if (state.mode === mode) return { state, dropped: 0 };
  const kept = state.blocks.filter((block) => getBlockDefinition(block.type).modes.includes(mode));
  const blocks = kept.length > 0 ? kept : getDefaultBlocks(mode, state.meta);
  return { state: { ...state, mode, blocks }, dropped: state.blocks.length - kept.length };
}

/**
 * Applies the wizard's "Sections" choice: keeps the existing blocks of the
 * selected types (order and data untouched), drops the others, and creates one
 * block, seeded from `state.meta`, for each selected type that has none yet.
 */
export function applySelection(state: ReadmeState, selected: readonly BlockType[]): ReadmeState {
  const wanted = new Set(selected);
  const kept = state.blocks.filter((block) => wanted.has(block.type));
  const present = new Set(kept.map((block) => block.type));
  const added = getCatalog(state.mode)
    .filter((def) => wanted.has(def.type) && !present.has(def.type))
    .map((def) => createBlock(def.type, state.meta));
  return { ...state, blocks: [...kept, ...added] };
}

export function updateMeta(state: ReadmeState, patch: Partial<ReadmeMeta>): ReadmeState {
  return { ...state, meta: { ...state.meta, ...patch } };
}

/** Sets the badge accent color; anything but six hex digits leaves the state untouched. */
export function setAccentColor(state: ReadmeState, color: string): ReadmeState {
  const hex = color.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return state;
  return { ...state, theme: { ...state.theme, accentColor: hex.toLowerCase() } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Brings a block's data in line with the meta the wizard collected, without
 * touching anything the user wrote: empty fields are filled from `fresh`, and a
 * heading that is still an untouched default text follows the README language.
 */
function refreshData(current: unknown, fresh: unknown): unknown {
  if (typeof current === 'string' && typeof fresh === 'string') {
    if (current.trim() === '' && fresh !== '') return fresh;
    if (current !== fresh && isDefaultText(current) && isDefaultText(fresh)) return fresh;
    return current;
  }
  if (Array.isArray(current) && Array.isArray(fresh)) return current.length === 0 ? fresh : current;
  if (isRecord(current) && isRecord(fresh)) {
    return Object.fromEntries(
      Object.entries(current).map(([key, value]) => [key, key in fresh ? refreshData(value, fresh[key]) : value])
    );
  }
  return current;
}

function refreshBlock(block: Block, meta: ReadmeMeta): Block {
  const def = getBlockDefinition(block.type);
  const refreshed = refreshData(block.data, def.createData(meta));
  return def.parseData(refreshed).success ? { ...block, data: refreshed } : block;
}

export interface WizardChoice {
  mode: ReadmeMode;
  selected: readonly BlockType[];
  /** True for a first README, whose blocks do not exist yet. */
  isNew: boolean;
}

/**
 * Applies everything the wizard collected, at once, when it ends. The mode is
 * only switched here, never while the wizard is open: clicking through the mode
 * cards changes nothing, so it cannot drop or recreate the user's blocks.
 */
export function applyWizard(state: ReadmeState, choice: WizardChoice): ReadmeState {
  const base =
    choice.mode === state.mode
      ? state
      : choice.isNew
        ? { ...state, mode: choice.mode, blocks: [] }
        : switchMode(state, choice.mode).state;
  const selected = applySelection(base, choice.selected);
  const existing = new Set(base.blocks.map((block) => block.id));
  return {
    ...selected,
    blocks: selected.blocks.map((block) => (existing.has(block.id) ? refreshBlock(block, selected.meta) : block)),
  };
}
