export type ReadmeMode = 'project' | 'profile';

/** Extended by later plans: add the literal here and an entry in `registry.ts`. */
export type BlockType = 'header' | 'freeMarkdown';

export interface Block {
  id: string;
  type: BlockType;
  enabled: boolean;
  /** Validated by the block definition's schema; shape depends on `type`. */
  data: unknown;
}

export interface ThemeOptions {
  /** Hex color without the leading '#', e.g. '0969da'. */
  accentColor: string;
}

export interface ReadmeMeta {
  name: string;
  description: string;
  author: string;
  license: string;
  repoUrl: string;
}

export interface ReadmeState {
  version: 1;
  mode: ReadmeMode;
  theme: ThemeOptions;
  meta: ReadmeMeta;
  blocks: Block[];
}

export interface GenerateContext {
  mode: ReadmeMode;
  theme: ThemeOptions;
  meta: ReadmeMeta;
}

export type WarningCode = 'imageMissingAlt' | 'htmlTagMismatch' | 'layoutTable';

export interface BlockWarning {
  code: WarningCode;
  params?: Record<string, string | number>;
}

export interface ValidationWarning extends BlockWarning {
  blockId: string;
}
