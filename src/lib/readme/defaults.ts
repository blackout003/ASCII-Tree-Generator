import type { ReadmeMeta, ThemeOptions } from './types';

/** Maximum length of each `ReadmeMeta` text field, enforced when a file is imported. */
export const META_LIMITS = {
  name: 200,
  description: 1000,
  author: 200,
  license: 100,
  repoUrl: 2000,
  installCommand: 300,
} as const;

export const DEFAULT_THEME: ThemeOptions = { accentColor: '0969da' };

export const EMPTY_META: ReadmeMeta = {
  name: '',
  description: '',
  author: '',
  license: '',
  repoUrl: '',
  installCommand: '',
  language: 'en',
};
