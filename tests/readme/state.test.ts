import { describe, expect, it } from 'vitest';
import {
  addBlock,
  applySelection,
  canAddBlock,
  createInitialState,
  moveBlock,
  removeBlock,
  reorderBlock,
  setAccentColor,
  switchMode,
  toggleBlock,
  updateBlockData,
  updateMeta,
} from '@/lib/readme/state';
import { getRecommendedTypes } from '@/lib/readme/registry';
import { EMPTY_META } from '@/lib/readme/defaults';
import { freeMarkdown, header, stateWith } from './helpers';

const ids = (state: { blocks: { id: string }[] }) => state.blocks.map((b) => b.id);

describe('createInitialState', () => {
  it('starts a project README with the critical blocks', () => {
    const state = createInitialState('project');
    expect(state.mode).toBe('project');
    expect(state.blocks.map((b) => b.type)).toEqual(['header', 'installation', 'usage', 'license']);
    expect(state.blocks.every((b) => b.enabled)).toBe(true);
  });

  it('starts a profile README empty', () => {
    expect(createInitialState('profile').blocks).toEqual([]);
  });

  it('generates unique block ids', () => {
    const a = createInitialState('project').blocks[0].id;
    const b = createInitialState('project').blocks[0].id;
    expect(a).not.toBe(b);
  });
});

describe('addBlock / canAddBlock', () => {
  it('appends a block and allows duplicates of non-singleton types', () => {
    let state = stateWith([]);
    state = addBlock(state, 'freeMarkdown');
    state = addBlock(state, 'freeMarkdown');
    expect(state.blocks.map((b) => b.type)).toEqual(['freeMarkdown', 'freeMarkdown']);
    expect(new Set(ids(state)).size).toBe(2);
  });

  it('refuses a second singleton block and returns the same state', () => {
    const state = stateWith([header('h')]);
    expect(canAddBlock(state, 'header')).toBe(false);
    expect(addBlock(state, 'header')).toBe(state);
  });

  it('refuses a block outside the current mode catalog', () => {
    const state = stateWith([], 'profile');
    expect(canAddBlock(state, 'header')).toBe(false);
    expect(addBlock(state, 'header')).toBe(state);
  });
});

describe('removeBlock / toggleBlock / updateBlockData', () => {
  const base = stateWith([header('h'), freeMarkdown('f', 'x')]);

  it('removes by id', () => {
    expect(ids(removeBlock(base, 'h'))).toEqual(['f']);
  });

  it('toggles enabled', () => {
    const toggled = toggleBlock(base, 'f');
    expect(toggled.blocks[1].enabled).toBe(false);
    expect(toggleBlock(toggled, 'f').blocks[1].enabled).toBe(true);
  });

  it('replaces the data of one block only', () => {
    const next = updateBlockData(base, 'f', { content: 'y' });
    expect(next.blocks[1].data).toEqual({ content: 'y' });
    expect(next.blocks[0]).toBe(base.blocks[0]);
  });

  it('does not mutate the previous state', () => {
    removeBlock(base, 'h');
    expect(ids(base)).toEqual(['h', 'f']);
  });
});

describe('moveBlock', () => {
  const base = stateWith([freeMarkdown('a', ''), freeMarkdown('b', ''), freeMarkdown('c', '')]);

  it('moves a block down and up', () => {
    expect(ids(moveBlock(base, 'a', 1))).toEqual(['b', 'a', 'c']);
    expect(ids(moveBlock(base, 'c', -1))).toEqual(['a', 'c', 'b']);
  });

  it('is a no-op at the edges and for unknown ids', () => {
    expect(moveBlock(base, 'a', -1)).toBe(base);
    expect(moveBlock(base, 'c', 1)).toBe(base);
    expect(moveBlock(base, 'zzz', 1)).toBe(base);
  });
});

describe('reorderBlock (drag and drop)', () => {
  const base = stateWith([freeMarkdown('a', ''), freeMarkdown('b', ''), freeMarkdown('c', '')]);

  it('drops a block onto a later target: it lands after it', () => {
    expect(ids(reorderBlock(base, 'a', 'c'))).toEqual(['b', 'c', 'a']);
    expect(ids(reorderBlock(base, 'b', 'c'))).toEqual(['a', 'c', 'b']);
  });

  it('drops a block onto an earlier target: it lands before it', () => {
    expect(ids(reorderBlock(base, 'c', 'a'))).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op for the same or unknown ids', () => {
    expect(reorderBlock(base, 'a', 'a')).toBe(base);
    expect(reorderBlock(base, 'a', 'zzz')).toBe(base);
  });
});

describe('switchMode', () => {
  it('keeps blocks valid in both modes and drops the others', () => {
    const state = stateWith([header('h', { title: 'X' }), freeMarkdown('f', 'keep')]);
    const result = switchMode(state, 'profile');
    expect(result.state.mode).toBe('profile');
    expect(ids(result.state)).toEqual(['f']);
    expect(result.dropped).toBe(1);
  });

  it('reports every block dropped when nothing is compatible', () => {
    const result = switchMode(stateWith([header('h')]), 'profile');
    expect(result.state.blocks).toEqual([]);
    expect(result.dropped).toBe(1);
  });

  it('seeds the default blocks when switching an empty README to project', () => {
    const result = switchMode(stateWith([], 'profile'), 'project');
    expect(result.state.blocks.map((b) => b.type)).toEqual(['header', 'installation', 'usage', 'license']);
    expect(result.dropped).toBe(0);
  });

  it('is a no-op for the same mode', () => {
    const state = stateWith([header('h')]);
    const result = switchMode(state, 'project');
    expect(result.state).toBe(state);
    expect(result.dropped).toBe(0);
  });
});

describe('getRecommendedTypes', () => {
  it('lists the critical and recommended blocks of the project catalog, in catalog order', () => {
    expect(getRecommendedTypes('project')).toEqual(['header', 'badges', 'visualProof', 'installation', 'usage', 'license']);
  });

  it('recommends the profile intro blocks first, in catalog order', () => {
    expect(getRecommendedTypes('profile').slice(0, 2)).toEqual(['banner', 'bio']);
  });
});

describe('applySelection', () => {
  const fresh = { ...stateWith([]), meta: { ...EMPTY_META, name: 'Demo' } };

  it('creates the selected blocks in catalog order, seeded from the meta', () => {
    const result = applySelection(fresh, ['usage', 'header']);
    expect(result.blocks.map((b) => b.type)).toEqual(['header', 'usage']);
    expect((result.blocks[0].data as { title: string }).title).toBe('Demo');
  });

  it('keeps existing blocks with their data, drops deselected types and appends new ones', () => {
    const base = stateWith([header('h', { title: 'Mine' }), freeMarkdown('f', 'keep'), freeMarkdown('g', 'also')]);
    const kept = applySelection(base, ['header', 'freeMarkdown', 'usage']);
    expect(kept.blocks.map((b) => b.id).slice(0, 3)).toEqual(['h', 'f', 'g']);
    expect(kept.blocks[0].data).toEqual(base.blocks[0].data);
    expect(kept.blocks[3].type).toBe('usage');
    expect(ids(applySelection(base, ['freeMarkdown']))).toEqual(['f', 'g']);
  });

  it('ignores types outside the mode catalog', () => {
    expect(applySelection(stateWith([], 'profile'), ['header']).blocks).toEqual([]);
  });

  it('does not mutate the previous state', () => {
    const base = stateWith([header('h')]);
    applySelection(base, []);
    expect(ids(base)).toEqual(['h']);
  });
});

describe('updateMeta / setAccentColor', () => {
  it('merges a patch into the meta only', () => {
    const base = stateWith([]);
    const next = updateMeta(base, { name: 'Demo', language: 'fr' });
    expect(next.meta).toEqual({ ...base.meta, name: 'Demo', language: 'fr' });
    expect(next.blocks).toBe(base.blocks);
  });

  it('accepts a hex color with or without #, in any case', () => {
    const base = stateWith([]);
    expect(setAccentColor(base, '#FF0000').theme.accentColor).toBe('ff0000');
    expect(setAccentColor(base, '00aa11').theme.accentColor).toBe('00aa11');
  });

  it('ignores anything that is not six hex digits and returns the same state', () => {
    const base = stateWith([]);
    for (const bad of ['red', '#12345', '1234567', '', 'gg0000']) {
      expect(setAccentColor(base, bad)).toBe(base);
    }
  });
});
