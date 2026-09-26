import type { Locale } from '@/i18n/locales';

export type ReadmeMode = 'project' | 'profile';

/** Language of the generated README, independent of the interface language. */
export type ReadmeLanguage = Locale;

/** Extended by later tasks: add the literal here and an entry in `registry.ts`. */
export type BlockType =
  | 'header'
  | 'badges'
  | 'visualProof'
  | 'tableOfContents'
  | 'installation'
  | 'usage'
  | 'architecture'
  | 'contributing'
  | 'license'
  | 'alert'
  | 'banner'
  | 'bio'
  | 'skills'
  | 'contact'
  | 'stats'
  | 'trophies'
  | 'blog'
  | 'freeMarkdown';

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
  installCommand: string;
  language: ReadmeLanguage;
  /** GitHub username, used by the profile blocks (stats, trophies). */
  username: string;
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
  /** Level-2 headings of the other blocks, as written; set for blocks that use them. */
  headings?: string[];
}

export type WarningCode =
  | 'imageMissingAlt'
  | 'htmlTagMismatch'
  | 'layoutTable'
  | 'tooManyBadges'
  | 'missingUsername'
  | 'missingBaseUrl'
  | 'invalidBaseUrl'
  | 'invalidFeed';

export interface BlockWarning {
  code: WarningCode;
  params?: Record<string, string | number>;
}

export interface ValidationWarning extends BlockWarning {
  blockId: string;
}
