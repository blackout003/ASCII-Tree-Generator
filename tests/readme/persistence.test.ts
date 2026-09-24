import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import {
  MAX_BLOCKS,
  STORAGE_KEY,
  loadState,
  parseReadmeState,
  saveState,
  serializeReadmeState,
  type StorageLike,
} from '@/lib/readme/persistence';
import { block, freeMarkdown, header, stateWith } from './helpers';

function fileWith(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    mode: 'project',
    theme: { accentColor: '0969da' },
    meta: { ...EMPTY_META },
    blocks: [],
    ...overrides,
  };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  const storage: StorageLike & { data: Record<string, string> } = {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
  return storage;
}

describe('parseReadmeState', () => {
  it('round-trips a serialized state', () => {
    const state = stateWith([header('h', { title: 'Demo' }), freeMarkdown('f', 'text', false)]);
    const result = parseReadmeState(JSON.parse(serializeReadmeState(state)));
    expect(result).toEqual({ ok: true, state, dropped: 0 });
  });

  it.each([null, 'text', 42, [], {}])('rejects a file that is not a valid state (%j)', (input) => {
    expect(parseReadmeState(input)).toEqual({ ok: false });
  });

  it('rejects a wrong version, an unknown mode and a bad accent color', () => {
    expect(parseReadmeState(fileWith({ version: 2 })).ok).toBe(false);
    expect(parseReadmeState(fileWith({ mode: 'org' })).ok).toBe(false);
    expect(parseReadmeState(fileWith({ theme: { accentColor: 'red' } })).ok).toBe(false);
  });

  it('drops blocks of an unknown type and counts them', () => {
    const result = parseReadmeState(
      fileWith({ blocks: [{ id: 'x', type: 'nope', enabled: true, data: {} }, freeMarkdown('f', 'ok')] })
    );
    expect(result.ok && result.dropped).toBe(1);
    expect(result.ok && result.state.blocks.map((b) => b.id)).toEqual(['f']);
  });

  it('drops blocks whose data does not match their schema', () => {
    const result = parseReadmeState(
      fileWith({
        blocks: [
          block('a', 'header', { title: 'x'.repeat(201), tagline: '', logoUrl: '', logoAlt: '' }),
          block('b', 'freeMarkdown', { content: 42 }),
          freeMarkdown('c', 'ok'),
        ],
      })
    );
    expect(result.ok && result.dropped).toBe(2);
    expect(result.ok && result.state.blocks.map((b) => b.id)).toEqual(['c']);
  });

  it('gives a fresh id to a block whose id is already taken', () => {
    const result = parseReadmeState(fileWith({ blocks: [freeMarkdown('same', 'a'), freeMarkdown('same', 'b')] }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.blocks).toHaveLength(2);
    expect(new Set(result.state.blocks.map((b) => b.id)).size).toBe(2);
    expect(result.dropped).toBe(0);
  });

  it('keeps only the first block of a singleton type', () => {
    const result = parseReadmeState(fileWith({ blocks: [header('h1', { title: 'A' }), header('h2', { title: 'B' })] }));
    expect(result.ok && result.state.blocks.map((b) => b.id)).toEqual(['h1']);
    expect(result.ok && result.dropped).toBe(1);
  });

  it('drops blocks the file mode does not offer', () => {
    const result = parseReadmeState(fileWith({ mode: 'profile', blocks: [header('h'), freeMarkdown('f', 'ok')] }));
    expect(result.ok && result.state.blocks.map((b) => b.id)).toEqual(['f']);
    expect(result.ok && result.dropped).toBe(1);
  });

  it('accepts exactly MAX_BLOCKS blocks and rejects one more', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => freeMarkdown(`b${i}`, ''));
    expect(parseReadmeState(fileWith({ blocks: many(MAX_BLOCKS) })).ok).toBe(true);
    expect(parseReadmeState(fileWith({ blocks: many(MAX_BLOCKS + 1) })).ok).toBe(false);
  });
});

describe('saveState / loadState', () => {
  const state = stateWith([header('h', { title: 'Demo' })]);

  it('saves under the storage key and loads the same state back', () => {
    const storage = memoryStorage();
    expect(saveState(state, storage)).toBe(true);
    expect(Object.keys(storage.data)).toEqual([STORAGE_KEY]);
    expect(loadState(storage)).toEqual(state);
  });

  it('returns null when nothing is stored', () => {
    expect(loadState(memoryStorage())).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toBeNull();
  });

  it('returns null for JSON that is not a valid state', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: '{"version":1}' }))).toBeNull();
  });

  it('returns null when reading throws', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {},
    };
    expect(loadState(storage)).toBeNull();
  });

  it('returns false when the quota is exceeded', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(saveState(state, storage)).toBe(false);
  });

  it('works without any storage', () => {
    expect(loadState(null)).toBeNull();
    expect(saveState(state, null)).toBe(false);
  });
});
