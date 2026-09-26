import { describe, expect, it } from 'vitest';
import { META_LIMITS } from '@/lib/readme/defaults';
import { BLOCK_TYPES, getBlockDefinition } from '@/lib/readme/registry';
import type { ReadmeMeta } from '@/lib/readme/types';

const maximalMeta: ReadmeMeta = {
  name: 'x'.repeat(META_LIMITS.name),
  description: 'x'.repeat(META_LIMITS.description),
  author: 'x'.repeat(META_LIMITS.author),
  license: 'x'.repeat(META_LIMITS.license),
  repoUrl: 'x'.repeat(META_LIMITS.repoUrl),
  installCommand: 'x'.repeat(META_LIMITS.installCommand),
  username: 'x'.repeat(META_LIMITS.username),
  language: 'fr',
};

describe('block registry contract', () => {
  it.each(BLOCK_TYPES)('%s: default data built from the longest allowed meta passes its own schema', (type) => {
    const def = getBlockDefinition(type);
    expect(def.parseData(def.createData(maximalMeta)).success).toBe(true);
  });
});
