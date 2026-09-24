import { META_LIMITS } from './defaults';
import { singleLine } from './markdown-utils';
import type { ReadmeMeta } from './types';

export const EXTRACTED_KEYS = ['name', 'description', 'license', 'repoUrl', 'author', 'installCommand'] as const;
export type ExtractedKey = (typeof EXTRACTED_KEYS)[number];
export type ExtractedMeta = Partial<Record<ExtractedKey, string>>;

export type ExtractErrorCode =
  | 'unsupportedFile'
  | 'invalidFile'
  | 'invalidUrl'
  | 'rateLimit'
  | 'notFound'
  | 'network'
  | 'invalidResponse';

export type ExtractResult = { ok: true; meta: ExtractedMeta } | { ok: false; error: ExtractErrorCode };

export interface GithubRef {
  owner: string;
  repo: string;
}

export const MAX_MANIFEST_BYTES = 1_000_000;

// Everything read from a file or from the network is untrusted: values are cut to
// this length before any regex runs on them, so no input can make one backtrack.
const CLEAN_MAX_LENGTH = 2000;
const MAX_TOML_LINE_LENGTH = 20_000;
const SAFE_PACKAGE_NAME = /^[A-Za-z0-9@._/-]+$/;

/** One line of text from an untrusted value, '' for anything that is not a string. */
export function clean(value: unknown): string {
  return typeof value === 'string' ? singleLine(value.slice(0, CLEAN_MAX_LENGTH)) : '';
}

export function compact(meta: ExtractedMeta): ExtractedMeta {
  const result: ExtractedMeta = {};
  for (const key of EXTRACTED_KEYS) {
    const value = meta[key];
    if (value) result[key] = value;
  }
  return result;
}

/** "Jane Doe <jane@x.io> (https://x.io)" becomes "Jane Doe". */
function authorName(value: string): string {
  return value.replace(/<[^>]*>|\([^)]*\)/g, '').trim();
}

/** A web address for the repository, or '' when the value is not one. */
export function normalizeRepoUrl(value: string): string {
  const text = value.trim().replace(/^git\+/, '').replace(/\.git$/, '').replace(/\/+$/, '');
  const scp = /^git@([^:]+):(.+)$/.exec(text);
  if (scp) return `https://${scp[1]}/${scp[2]}`;
  const shorthand = /^(?:github:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/.exec(text);
  if (shorthand) return `https://github.com/${shorthand[1]}`;
  return /^(?:https?|git):\/\//i.test(text) ? text.replace(/^git:\/\//i, 'https://') : '';
}

function installCommandFor(command: string, name: string): string {
  return SAFE_PACKAGE_NAME.test(name) ? `${command} ${name}` : '';
}

function field(value: unknown, key: string): unknown {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;
}

export function parsePackageJson(text: string): ExtractResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalidFile' };
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'invalidFile' };
  const pkg = data as Record<string, unknown>;
  const name = clean(pkg.name);
  const repository = typeof pkg.repository === 'string' ? pkg.repository : field(pkg.repository, 'url');
  const license = typeof pkg.license === 'string' ? pkg.license : field(pkg.license, 'type');
  const author = typeof pkg.author === 'string' ? pkg.author : field(pkg.author, 'name');
  return {
    ok: true,
    meta: compact({
      name,
      description: clean(pkg.description),
      license: clean(license),
      repoUrl: normalizeRepoUrl(clean(repository)),
      author: authorName(clean(author)),
      installCommand: installCommandFor('npm install', name),
    }),
  };
}

// ---- Minimal TOML reader: bare `key = value` lines inside `[section]` headers. ----

type TomlSections = Map<string, Map<string, string>>;

function stripTomlComment(line: string): string {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote !== null) {
      if (char === '\\' && quote === '"') i++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '#') {
      return line.slice(0, i);
    }
  }
  return line;
}

function readToml(text: string): TomlSections {
  const sections: TomlSections = new Map();
  let current = new Map<string, string>();
  for (const rawLine of text.split(/\r?\n/)) {
    if (rawLine.length > MAX_TOML_LINE_LENGTH) continue;
    const line = stripTomlComment(rawLine).trim();
    if (line === '') continue;
    const header = /^\[([^[\]]+)\]$/.exec(line);
    if (header) {
      const name = header[1].trim();
      current = sections.get(name) ?? new Map<string, string>();
      sections.set(name, current);
      continue;
    }
    if (line.startsWith('[[')) {
      current = new Map<string, string>();
      continue;
    }
    const pair = /^([A-Za-z0-9_-]+)\s*=\s*(.+)$/.exec(line);
    if (pair && !current.has(pair[1])) current.set(pair[1], pair[2].trim());
  }
  return sections;
}

const QUOTED = '"((?:[^"\\\\]|\\\\.)*)"';

function tomlString(raw: string | undefined): string {
  if (raw === undefined) return '';
  const basic = new RegExp(`^${QUOTED}$`).exec(raw);
  if (basic) return clean(basic[1].replace(/\\(["\\])/g, '$1'));
  const literal = /^'([^']*)'$/.exec(raw);
  return literal ? clean(literal[1]) : '';
}

/** First author of `["Jane <j@x>", …]` or `[{ name = "Jane", … }]`. */
function firstAuthor(raw: string | undefined): string {
  if (raw === undefined) return '';
  const named = new RegExp(`name\\s*=\\s*${QUOTED}`).exec(raw);
  const quoted = named ?? new RegExp(QUOTED).exec(raw);
  return quoted ? authorName(clean(quoted[1])) : '';
}

export function parseCargoToml(text: string): ExtractResult {
  const section = readToml(text).get('package');
  if (!section) return { ok: false, error: 'invalidFile' };
  const name = tomlString(section.get('name'));
  return {
    ok: true,
    meta: compact({
      name,
      description: tomlString(section.get('description')),
      license: tomlString(section.get('license')),
      repoUrl: normalizeRepoUrl(tomlString(section.get('repository'))),
      author: firstAuthor(section.get('authors')),
      installCommand: installCommandFor('cargo add', name),
    }),
  };
}

const PYPROJECT_URL_KEYS = ['Repository', 'repository', 'Source', 'source', 'Homepage', 'homepage'];

export function parsePyproject(text: string): ExtractResult {
  const sections = readToml(text);
  const project = sections.get('project') ?? sections.get('tool.poetry');
  if (!project) return { ok: false, error: 'invalidFile' };
  const urls = sections.get('project.urls');
  const name = tomlString(project.get('name'));
  const licenseRaw = project.get('license');
  const licenseText = new RegExp(`text\\s*=\\s*${QUOTED}`).exec(licenseRaw ?? '');
  const linkedUrl = PYPROJECT_URL_KEYS.map((key) => tomlString(urls?.get(key))).find((value) => value !== '');
  return {
    ok: true,
    meta: compact({
      name,
      description: tomlString(project.get('description')),
      license: tomlString(licenseRaw) || clean(licenseText?.[1]),
      repoUrl: normalizeRepoUrl(linkedUrl ?? tomlString(project.get('repository'))),
      author: firstAuthor(project.get('authors')),
      installCommand: installCommandFor('pip install', name),
    }),
  };
}

export function parseManifestFile(fileName: string, text: string): ExtractResult {
  if (text.length > MAX_MANIFEST_BYTES) return { ok: false, error: 'invalidFile' };
  const baseName = fileName.trim().toLowerCase().split(/[\\/]/).pop();
  switch (baseName) {
    case 'package.json':
      return parsePackageJson(text);
    case 'cargo.toml':
      return parseCargoToml(text);
    case 'pyproject.toml':
      return parsePyproject(text);
    default:
      return { ok: false, error: 'unsupportedFile' };
  }
}

/** `github.com/{owner}/{repo}` only, with an optional scheme, `www.`, `.git` and trailing slash. */
export function parseGithubUrl(input: string): GithubRef | null {
  const match =
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]{1,100})\/([A-Za-z0-9_.-]{1,100}?)(?:\.git)?\/?$/i.exec(
      input.trim().slice(0, 500)
    );
  if (!match) return null;
  const [, owner, repo] = match;
  if (/^\.+$/.test(owner) || /^\.+$/.test(repo)) return null;
  return { owner, repo };
}

/**
 * Fills the fields of `current` that are empty, never overwriting anything the
 * user typed. Each value is cut to `META_LIMITS`, so the blocks later seeded
 * from the meta always satisfy their own schema.
 */
export function mergeMeta(
  current: ReadmeMeta,
  extracted: ExtractedMeta
): { meta: ReadmeMeta; filled: ExtractedKey[] } {
  const meta = { ...current };
  const filled: ExtractedKey[] = [];
  for (const key of EXTRACTED_KEYS) {
    if (current[key].trim() !== '') continue;
    const value = singleLine(extracted[key] ?? '').slice(0, META_LIMITS[key]);
    if (value === '') continue;
    meta[key] = value;
    filled.push(key);
  }
  return { meta, filled };
}
