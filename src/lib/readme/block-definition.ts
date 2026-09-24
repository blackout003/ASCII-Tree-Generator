import type { z } from 'zod';
import type { BlockType, BlockWarning, GenerateContext, ReadmeMeta, ReadmeMode } from './types';

export interface BlockDefinition<TData> {
  type: BlockType;
  /** Modes whose catalog offers this block. */
  modes: readonly ReadmeMode[];
  /** At most one block of this type per README. */
  singleton: boolean;
  /** Added automatically when a README of a compatible mode is created. */
  defaultOnCreate: boolean;
  schema: z.ZodType<TData>;
  createData: (meta: ReadmeMeta) => TData;
  toMarkdown: (data: TData, ctx: GenerateContext) => string;
  validate?: (data: TData, ctx: GenerateContext) => BlockWarning[];
}

export type ParsedData = { success: true; data: unknown } | { success: false };

/** Type-erased view used by the registry, generator, validator and persistence. */
export interface AnyBlockDefinition {
  type: BlockType;
  modes: readonly ReadmeMode[];
  singleton: boolean;
  defaultOnCreate: boolean;
  createData: (meta: ReadmeMeta) => unknown;
  parseData: (input: unknown) => ParsedData;
  toMarkdown: (data: unknown, ctx: GenerateContext) => string;
  validate: (data: unknown, ctx: GenerateContext) => BlockWarning[];
}

export function defineBlock<TData>(def: BlockDefinition<TData>): AnyBlockDefinition {
  return {
    type: def.type,
    modes: def.modes,
    singleton: def.singleton,
    defaultOnCreate: def.defaultOnCreate,
    createData: def.createData,
    parseData: (input) => {
      const result = def.schema.safeParse(input);
      return result.success ? { success: true, data: result.data } : { success: false };
    },
    toMarkdown: (data, ctx) => def.toMarkdown(data as TData, ctx),
    validate: (data, ctx) => (def.validate ? def.validate(data as TData, ctx) : []),
  };
}
