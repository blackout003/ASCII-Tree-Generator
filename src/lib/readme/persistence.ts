import { z } from 'zod';
import { locales } from '@/i18n/locales';
import { META_LIMITS } from './defaults';
import { getBlockDefinition, isBlockType } from './registry';
import { createBlockId } from './state';
import type { Block, ReadmeState } from './types';

export const STORAGE_KEY = 'readme-generator:v1';
export const MAX_BLOCKS = 200;

const envelopeSchema = z.object({
  version: z.literal(1),
  mode: z.enum(['project', 'profile']),
  theme: z.object({ accentColor: z.string().regex(/^[0-9a-fA-F]{6}$/) }),
  meta: z.object({
    name: z.string().max(META_LIMITS.name),
    description: z.string().max(META_LIMITS.description),
    author: z.string().max(META_LIMITS.author),
    license: z.string().max(META_LIMITS.license),
    repoUrl: z.string().max(META_LIMITS.repoUrl),
    installCommand: z.string().max(META_LIMITS.installCommand).default(''),
    language: z.enum(locales).default('en'),
    username: z.string().max(META_LIMITS.username).default(''),
  }),
  blocks: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        type: z.string(),
        enabled: z.boolean(),
        data: z.unknown(),
      })
    )
    .max(MAX_BLOCKS),
});

export type ParseResult = { ok: true; state: ReadmeState; dropped: number } | { ok: false };

/**
 * Validates an untrusted value (imported file or stored JSON). The envelope must
 * be valid; blocks that are unknown, invalid, out of mode or duplicate singletons
 * are dropped and counted, and duplicate ids are replaced.
 */
export function parseReadmeState(input: unknown): ParseResult {
  const envelope = envelopeSchema.safeParse(input);
  if (!envelope.success) return { ok: false };
  const { mode, theme, meta } = envelope.data;

  const seenIds = new Set<string>();
  const seenSingletons = new Set<string>();
  const blocks: Block[] = [];
  let dropped = 0;

  for (const raw of envelope.data.blocks) {
    if (!isBlockType(raw.type)) {
      dropped++;
      continue;
    }
    const def = getBlockDefinition(raw.type);
    const parsed = def.parseData(raw.data);
    if (!parsed.success || !def.modes.includes(mode) || (def.singleton && seenSingletons.has(raw.type))) {
      dropped++;
      continue;
    }
    if (def.singleton) seenSingletons.add(raw.type);
    const id = seenIds.has(raw.id) ? createBlockId() : raw.id;
    seenIds.add(id);
    blocks.push({ id, type: raw.type, enabled: raw.enabled, data: parsed.data });
  }

  return { ok: true, state: { version: 1, mode, theme, meta, blocks }, dropped };
}

export function serializeReadmeState(state: ReadmeState): string {
  return JSON.stringify(state, null, 2);
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Never throws: returns null when storage is unavailable, empty or corrupted. */
export function loadState(storage: StorageLike | null = browserStorage()): ReadmeState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const result = parseReadmeState(JSON.parse(raw));
    return result.ok ? result.state : null;
  } catch {
    return null;
  }
}

/** Never throws: returns false when storage is unavailable or full. */
export function saveState(state: ReadmeState, storage: StorageLike | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, serializeReadmeState(state));
    return true;
  } catch {
    return false;
  }
}
