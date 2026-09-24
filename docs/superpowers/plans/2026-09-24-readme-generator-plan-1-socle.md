# Générateur de README — Plan 1 : socle

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer le socle du générateur de README : modèle de blocs, registre, génération Markdown pure, validation, persistance, éditeur, aperçu GFM assaini et route, avec deux blocs témoins (En-tête et Markdown libre).

**Architecture:** Un registre de blocs (`AnyBlockDefinition`) que le générateur, le validateur et la persistance parcourent sans connaître chaque bloc. Toute la logique vit dans `src/lib/readme/` sans React, donc testable sous `vitest` en environnement `node`. Un unique conteneur React (`readme-generator.tsx`) possède l'état et applique des fonctions pures (`state.ts`).

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, React 19, Zod 4, next-intl 4, `react-markdown` 10 + `remark-gfm` + `rehype-highlight` (existants), `rehype-raw` 7, `rehype-sanitize` 6, `remark-github-blockquote-alert` 2 (nouveaux), vitest 4.

**Spec:** `docs/superpowers/specs/2026-09-24-readme-generator-design.md`

**Périmètre de ce plan :** sections 4, 8 (sauf workflow), 11, 12 et 13 (plan 1) de la spec. Le wizard, l'extraction, les catalogues Projet/Profil complets, le thème global, le bloc Blog et le workflow sont dans les plans 2 et 3. L'outil est créé en `noindex`, avec l'entrée de navigation marquée `comingSoon`, jusqu'à ce que le plan 3 l'ouvre au public.

## Global Constraints

- Aucune chaîne visible par l'utilisateur en dur : tout passe par `useTranslations('readmeGenerator')`, avec les 8 locales `fr`, `en`, `es`, `de`, `it`, `pt`, `ru`, `ja`.
- Pas de backend : aucune donnée n'est envoyée à un serveur.
- `generateReadme` est une fonction pure ; l'aperçu rend exactement sa sortie.
- Aucune nouvelle bibliothèque de drag-drop : mécanisme HTML5 natif, comme `src/components/generator/tree-view.tsx`.
- Nouvelles dépendances autorisées, et seulement celles-ci : `rehype-raw@^7.0.0`, `rehype-sanitize@^6.0.0`, `remark-github-blockquote-alert@^2.1.0`.
- Tout accès à `localStorage` est dans un `try/catch` ; l'outil fonctionne sans.
- TypeScript strict, Zod 4, alias `@/*` → `src/*`. Pas d'état global : l'état vit dans `readme-generator.tsx` par hooks React.
- `vitest` ne lance que `tests/**/*.test.ts` en environnement `node` : pas de test de composant React, la logique testable reste dans `src/lib/readme/`.
- Analytics via `trackEvent` de `@/lib/analytics-events` (déjà conditionné à l'opt-out).
- Messages de commit en français, terminés par `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Review Focus

Entrées que la spec implique sans que les tâches nominales les couvrent ; chacune a son test dans la tâche indiquée.

1. HTML hostile collé dans le Markdown libre (`<script>`, `onerror`, `javascript:`, `<iframe>`, `style`, classes arbitraires) : rien d'actif ne doit atteindre le DOM de l'aperçu. Test : Tâche 1.
2. Fichier JSON importé malformé ou hostile (type de bloc inconnu, données invalides, identifiants en double, deux En-têtes, plus de 200 blocs, JSON qui n'est pas un objet) : l'import garde les blocs valides et signale le nombre de blocs ignorés ; un fichier dont l'enveloppe est invalide ou qui dépasse 200 blocs est refusé en entier, sans planter. Test : Tâche 5.
3. `localStorage` indisponible, plein ou contenant du JSON corrompu : l'outil démarre avec un état neuf et ne plante pas. Test : Tâche 5.
4. Texte alternatif ou URL de logo contenant `[`, `]`, `(`, `)`, des espaces ou un schéma `javascript:` : le Markdown produit reste syntaxiquement valide et n'embarque pas d'URL dangereuse. Test : Tâche 2.
5. Contenu Markdown libre avec fins de ligne Windows (CRLF), vide ou fait uniquement d'espaces : pas de ligne vide parasite dans le README. Test : Tâche 2.

En plus : le changement de mode retire les blocs incompatibles, l'utilisateur en est informé (Tâche 3 pour la logique, Tâche 7 pour le message).

---

## Structure des fichiers

```
src/lib/readme/
  types.ts               types partagés (ReadmeState, Block, GenerateContext, warnings)
  defaults.ts            DEFAULT_THEME, EMPTY_META
  markdown-utils.ts      normalizeNewlines, singleLine, escapeAlt, safeUrl
  markdown-checks.ts     checkMarkdownFragment : alt manquant, balises HTML, tableau de mise en page
  block-definition.ts    BlockDefinition, AnyBlockDefinition, defineBlock
  blocks/header.ts       bloc En-tête
  blocks/free-markdown.ts bloc Markdown libre
  registry.ts            DEFINITIONS, getBlockDefinition, getCatalog, isBlockType
  generate.ts            generateReadme(state) : string
  state.ts               fonctions pures d'édition de l'état
  validate.ts            validateReadme(state) : ValidationWarning[]
  persistence.ts         parse/serialize JSON, loadState/saveState
  markdown-pipeline.ts   plugins react-markdown + schéma d'assainissement
src/components/readme-generator/
  readme-generator.tsx   conteneur (état, effets, actions)
  readme-toolbar.tsx     mode, copier, télécharger, export/import JSON, réinitialiser
  block-list.tsx         liste de blocs, drag-drop, boutons, menu d'ajout
  block-forms.tsx        formulaires par type de bloc
  readme-preview.tsx     aperçu clair/sombre
  readme-preview.css     styles des alertes et de l'aperçu
  warnings-panel.tsx     liste d'avertissements
src/app/[locale]/tools/readme-generator/page.tsx
tests/readme/            helpers.ts, sanitize, markdown-utils, generate, state, validate, persistence
tests/i18n/readme-generator-locales.test.ts
tests/seo/readme-generator-seo.test.ts
```

Contrat d'extension pour les plans 2 et 3 : ajouter un bloc = ajouter un module dans `blocks/`, un littéral dans `BlockType` (`types.ts`), une entrée dans `DEFINITIONS` (`registry.ts`), un cas dans `BlockForm` (`block-forms.tsx`) et les clés `blocks.<type>` dans les 8 locales.

---

### Task 1: Pipeline Markdown assaini

**Files:**
- Modify: `package.json`, `package-lock.json` (dépendances)
- Create: `src/lib/readme/markdown-pipeline.ts`
- Test: `tests/readme/sanitize.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `README_SANITIZE_SCHEMA` (schéma `rehype-sanitize`) et `README_MARKDOWN_PROPS` (props à étaler sur `<ReactMarkdown>` : `remarkPlugins`, `remarkRehypeOptions`, `rehypePlugins`). Utilisés par `readme-preview.tsx` (Tâche 7) et par le test.

- [ ] **Step 1: Installer les dépendances**

Run: `npm install rehype-raw@^7.0.0 rehype-sanitize@^6.0.0 remark-github-blockquote-alert@^2.1.0`
Expected: installation sans erreur ; `package.json` gagne trois lignes dans `dependencies`.

- [ ] **Step 2: Écrire le test qui échoue**

Create `tests/readme/sanitize.test.ts` :

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';

function render(source: string): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, README_MARKDOWN_PROPS, source));
}

describe('README preview sanitization', () => {
  it('removes <script> elements and their content', () => {
    const html = render('a <script>alert(1)</script> b');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert');
  });

  it('strips event-handler attributes but keeps the element', () => {
    const html = render('<img src="x" onerror="alert(1)" alt="ok">');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<img');
  });

  it('neutralizes javascript: links', () => {
    expect(render('[x](javascript:alert(1))')).not.toContain('javascript:');
  });

  it('removes <iframe>', () => {
    expect(render('<iframe src="https://evil.example"></iframe>')).not.toContain('<iframe');
  });

  it('removes inline styles', () => {
    const html = render('<div style="position:fixed">x</div>');
    expect(html).not.toContain('style=');
    expect(html).toContain('<div>x</div>');
  });

  it('drops arbitrary class names', () => {
    expect(render('<div class="hidden-evil">x</div>')).not.toContain('hidden-evil');
  });

  it('strips event handlers from inline svg', () => {
    const html = render('<svg onload="alert(1)" viewBox="0 0 1 1"><path d="M0 0" onclick="x()"/></svg>');
    expect(html).not.toContain('onload');
    expect(html).not.toContain('onclick');
  });

  it('keeps <picture> with a dark-mode <source>', () => {
    const html = render(
      '<picture>\n<source media="(prefers-color-scheme: dark)" srcset="https://x.example/d.png">\n<img alt="Logo" src="https://x.example/l.png" width="100">\n</picture>'
    );
    expect(html).toContain('<picture>');
    expect(html).toContain('<source');
    expect(html).toContain('srcSet="https://x.example/d.png"');
    expect(html).toContain('width="100"');
  });

  it('keeps align on block elements', () => {
    expect(render('<div align="center">\n\n# Hi\n\n</div>')).toContain('<div align="center">');
  });

  it('keeps <details> and <summary>', () => {
    const html = render('<details><summary>More</summary>\n\ntext\n\n</details>');
    expect(html).toContain('<details>');
    expect(html).toContain('<summary>More</summary>');
  });

  it('renders GitHub alerts', () => {
    const note = render('> [!NOTE]\n> Useful info');
    expect(note).toContain('markdown-alert-note');
    expect(note).toContain('NOTE');
    expect(render('> [!WARNING]\n> Careful')).toContain('markdown-alert-warning');
  });

  it('renders GFM tables', () => {
    expect(render('| a | b |\n|---|---|\n| 1 | 2 |')).toContain('<table>');
  });

  it('highlights fenced code', () => {
    expect(render('```js\nconst a = 1;\n```')).toContain('hljs-keyword');
  });
});
```

- [ ] **Step 3: Vérifier que le test échoue**

Run: `npx vitest run tests/readme/sanitize.test.ts`
Expected: FAIL, `Failed to resolve import "@/lib/readme/markdown-pipeline"`.

- [ ] **Step 4: Écrire l'implémentation**

Create `src/lib/readme/markdown-pipeline.ts` :

```ts
import type { Options as ReactMarkdownOptions } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';

const attributes = defaultSchema.attributes ?? {};

/**
 * GitHub's default sanitization rules, extended with what README files rely on:
 * `<picture>`/`<source>` for light/dark images, and the markup produced by the
 * alert plugin (`div.markdown-alert-*`, `p.markdown-alert-title`, a small inline
 * `<svg>` icon). Only the exact class names and attributes used are allowed.
 */
export const README_SANITIZE_SCHEMA: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'picture', 'source', 'svg', 'path'],
  attributes: {
    ...attributes,
    div: [...(attributes.div ?? []), 'align', ['className', /^markdown-alert(-[a-z]+)?$/]],
    p: [...(attributes.p ?? []), 'align', ['className', 'markdown-alert-title']],
    img: [...(attributes.img ?? []), 'width', 'height', 'align'],
    source: ['media', 'srcSet', 'type'],
    svg: ['viewBox', 'width', 'height', 'ariaHidden', ['className', 'octicon']],
    path: ['d'],
  },
};

/**
 * Props spread on `<ReactMarkdown>`. Order matters: raw HTML is parsed first,
 * then sanitized, then code blocks are highlighted (highlight classes are added
 * after sanitizing, so they survive).
 */
export const README_MARKDOWN_PROPS: Pick<
  ReactMarkdownOptions,
  'remarkPlugins' | 'remarkRehypeOptions' | 'rehypePlugins'
> = {
  remarkPlugins: [remarkGfm, remarkAlert],
  remarkRehypeOptions: { allowDangerousHtml: true },
  rehypePlugins: [rehypeRaw, [rehypeSanitize, README_SANITIZE_SCHEMA], rehypeHighlight],
};
```

- [ ] **Step 5: Vérifier que le test passe**

Run: `npx vitest run tests/readme/sanitize.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 6: Vérifier les types**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/readme/markdown-pipeline.ts tests/readme/sanitize.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute le pipeline Markdown assaini pour l'aperçu

Étend react-markdown avec rehype-raw, rehype-sanitize (schéma GitHub
élargi à <picture> et aux alertes) et remark-github-blockquote-alert.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Types, registre de blocs et génération Markdown

**Files:**
- Create: `src/lib/readme/types.ts`, `src/lib/readme/defaults.ts`, `src/lib/readme/markdown-utils.ts`, `src/lib/readme/block-definition.ts`, `src/lib/readme/blocks/header.ts`, `src/lib/readme/blocks/free-markdown.ts`, `src/lib/readme/registry.ts`, `src/lib/readme/generate.ts`
- Test: `tests/readme/helpers.ts`, `tests/readme/markdown-utils.test.ts`, `tests/readme/generate.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces (utilisés par toutes les tâches suivantes) :
  - `types.ts` : `ReadmeMode = 'project' | 'profile'`, `BlockType = 'header' | 'freeMarkdown'`, `Block { id: string; type: BlockType; enabled: boolean; data: unknown }`, `ThemeOptions { accentColor: string }`, `ReadmeMeta { name; description; author; license; repoUrl: string }`, `ReadmeState { version: 1; mode; theme; meta; blocks: Block[] }`, `GenerateContext { mode; theme; meta }`, `WarningCode = 'imageMissingAlt' | 'htmlTagMismatch' | 'layoutTable'`, `BlockWarning { code; params?: Record<string, string | number> }`, `ValidationWarning extends BlockWarning { blockId: string }`.
  - `defaults.ts` : `DEFAULT_THEME`, `EMPTY_META`.
  - `markdown-utils.ts` : `normalizeNewlines(text)`, `singleLine(text)`, `escapeAlt(text)`, `safeUrl(url)`, toutes `string → string`.
  - `block-definition.ts` : `BlockDefinition<T>`, `AnyBlockDefinition`, `defineBlock<T>(def)`.
  - `blocks/header.ts` : `headerBlock`, `HeaderData`, `HEADER_LIMITS { title: 200; tagline: 500; logoUrl: 2000; logoAlt: 200 }`.
  - `blocks/free-markdown.ts` : `freeMarkdownBlock`, `FreeMarkdownData`, `FREE_MARKDOWN_MAX_LENGTH = 100_000`.
  - `registry.ts` : `BLOCK_TYPES: BlockType[]`, `isBlockType(value: string): value is BlockType`, `getBlockDefinition(type): AnyBlockDefinition`, `getCatalog(mode): AnyBlockDefinition[]`.
  - `generate.ts` : `generateReadme(state: ReadmeState): string`.

- [ ] **Step 1: Créer les types et les valeurs par défaut**

Create `src/lib/readme/types.ts` :

```ts
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
```

Create `src/lib/readme/defaults.ts` :

```ts
import type { ReadmeMeta, ThemeOptions } from './types';

export const DEFAULT_THEME: ThemeOptions = { accentColor: '0969da' };

export const EMPTY_META: ReadmeMeta = {
  name: '',
  description: '',
  author: '',
  license: '',
  repoUrl: '',
};
```

- [ ] **Step 2: Écrire le test des utilitaires (échoue)**

Create `tests/readme/markdown-utils.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { escapeAlt, normalizeNewlines, safeUrl, singleLine } from '@/lib/readme/markdown-utils';

describe('normalizeNewlines', () => {
  it('converts CRLF and lone CR to LF', () => {
    expect(normalizeNewlines('a\r\nb\rc')).toBe('a\nb\nc');
  });
});

describe('singleLine', () => {
  it('collapses line breaks into single spaces and trims', () => {
    expect(singleLine('  a \n b  ')).toBe('a b');
  });

  it('returns an empty string for whitespace only', () => {
    expect(singleLine(' \n\t ')).toBe('');
  });
});

describe('escapeAlt', () => {
  it('escapes brackets and backslashes so alt text cannot close the image', () => {
    expect(escapeAlt('a [b] c\\d')).toBe('a \\[b\\] c\\\\d');
  });
});

describe('safeUrl', () => {
  it('keeps http(s) and relative URLs', () => {
    expect(safeUrl('https://x.io/logo.png')).toBe('https://x.io/logo.png');
    expect(safeUrl('./logo.png')).toBe('./logo.png');
  });

  it('percent-encodes spaces and parentheses', () => {
    expect(safeUrl('https://x.io/a b(1).png')).toBe('https://x.io/a%20b%281%29.png');
  });

  it('rejects non-http schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('JaVaScRiPt:alert(1)')).toBe('');
    expect(safeUrl('data:text/html,x')).toBe('');
  });

  it('returns an empty string for blank input', () => {
    expect(safeUrl('   ')).toBe('');
  });
});
```

- [ ] **Step 3: Vérifier l'échec, puis implémenter les utilitaires**

Run: `npx vitest run tests/readme/markdown-utils.test.ts`
Expected: FAIL, module introuvable.

Create `src/lib/readme/markdown-utils.ts` :

```ts
export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

/** Collapses any run of whitespace containing a line break into one space. */
export function singleLine(text: string): string {
  return normalizeNewlines(text).replace(/\s*\n\s*/g, ' ').trim();
}

/** Alt text goes between `[` and `]`: neutralize characters that would end it early. */
export function escapeAlt(text: string): string {
  return singleLine(text).replace(/[[\]\\]/g, '\\$&');
}

/**
 * Returns a URL safe to put in a Markdown link destination, or '' when the
 * scheme is anything other than http(s). Relative URLs are kept as-is.
 */
export function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return '';
  return trimmed.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
}
```

Run: `npx vitest run tests/readme/markdown-utils.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 4: Écrire les helpers de test et le test de génération (échoue)**

Create `tests/readme/helpers.ts` :

```ts
import { DEFAULT_THEME, EMPTY_META } from '@/lib/readme/defaults';
import type { Block, BlockType, ReadmeMode, ReadmeState } from '@/lib/readme/types';

export function stateWith(blocks: Block[], mode: ReadmeMode = 'project'): ReadmeState {
  return { version: 1, mode, theme: { ...DEFAULT_THEME }, meta: { ...EMPTY_META }, blocks };
}

export function block(id: string, type: BlockType, data: unknown, enabled = true): Block {
  return { id, type, enabled, data };
}

export function header(id: string, data: Partial<Record<'title' | 'tagline' | 'logoUrl' | 'logoAlt', string>> = {}): Block {
  return block(id, 'header', { title: '', tagline: '', logoUrl: '', logoAlt: '', ...data });
}

export function freeMarkdown(id: string, content: string, enabled = true): Block {
  return block(id, 'freeMarkdown', { content }, enabled);
}
```

Create `tests/readme/generate.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { generateReadme } from '@/lib/readme/generate';
import { freeMarkdown, header, stateWith } from './helpers';

describe('generateReadme', () => {
  it('returns an empty string when there are no blocks', () => {
    expect(generateReadme(stateWith([]))).toBe('');
  });

  it('renders the header block: logo, title, tagline', () => {
    const state = stateWith([
      header('h', { title: 'Demo', tagline: 'Une lib', logoUrl: 'https://x.io/l.png', logoAlt: 'Logo de Demo' }),
    ]);
    expect(generateReadme(state)).toBe('![Logo de Demo](https://x.io/l.png)\n\n# Demo\n\nUne lib\n');
  });

  it('falls back to the title, then to "Logo", for the logo alt text', () => {
    const withTitle = stateWith([header('h', { title: 'Demo', logoUrl: 'https://x.io/l.png' })]);
    expect(generateReadme(withTitle)).toContain('![Demo](https://x.io/l.png)');
    const bare = stateWith([header('h', { logoUrl: 'https://x.io/l.png' })]);
    expect(generateReadme(bare)).toBe('![Logo](https://x.io/l.png)\n');
  });

  it('produces valid Markdown when alt text and URL contain brackets, parentheses and spaces', () => {
    const state = stateWith([
      header('h', { logoUrl: 'https://x.io/my logo (v2).png', logoAlt: 'a [b] c' }),
    ]);
    expect(generateReadme(state)).toBe('![a \\[b\\] c](https://x.io/my%20logo%20%28v2%29.png)\n');
  });

  it('drops a javascript: logo URL instead of embedding it', () => {
    const state = stateWith([header('h', { title: 'Demo', logoUrl: 'javascript:alert(1)' })]);
    expect(generateReadme(state)).toBe('# Demo\n');
  });

  it('flattens multi-line titles and taglines to one line', () => {
    const state = stateWith([header('h', { title: 'Demo\nApp', tagline: 'a\r\nb' })]);
    expect(generateReadme(state)).toBe('# Demo App\n\na b\n');
  });

  it('skips a header with nothing filled in', () => {
    expect(generateReadme(stateWith([header('h')]))).toBe('');
  });

  it('omits disabled blocks', () => {
    const state = stateWith([header('h', { title: 'Demo' }), freeMarkdown('f', 'hidden', false)]);
    expect(generateReadme(state)).toBe('# Demo\n');
  });

  it('keeps block order and separates blocks with one blank line', () => {
    const state = stateWith([freeMarkdown('a', 'first'), header('h', { title: 'Demo' }), freeMarkdown('b', 'last')]);
    expect(generateReadme(state)).toBe('first\n\n# Demo\n\nlast\n');
  });

  it('normalizes CRLF in free Markdown', () => {
    const state = stateWith([freeMarkdown('f', 'line one\r\nline two')]);
    expect(generateReadme(state)).toBe('line one\nline two\n');
  });

  it('skips empty and whitespace-only free Markdown without leaving blank lines', () => {
    const state = stateWith([
      freeMarkdown('a', 'before'),
      freeMarkdown('b', '   \n\t\n'),
      freeMarkdown('c', ''),
      freeMarkdown('d', 'after'),
    ]);
    expect(generateReadme(state)).toBe('before\n\nafter\n');
  });
});
```

Run: `npx vitest run tests/readme/generate.test.ts`
Expected: FAIL, module introuvable.

- [ ] **Step 5: Implémenter la définition de bloc, les deux blocs, le registre et le générateur**

Create `src/lib/readme/block-definition.ts` :

```ts
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
```

Create `src/lib/readme/blocks/header.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { escapeAlt, safeUrl, singleLine } from '../markdown-utils';

export const HEADER_LIMITS = { title: 200, tagline: 500, logoUrl: 2000, logoAlt: 200 } as const;

const schema = z.object({
  title: z.string().max(HEADER_LIMITS.title),
  tagline: z.string().max(HEADER_LIMITS.tagline),
  logoUrl: z.string().max(HEADER_LIMITS.logoUrl),
  logoAlt: z.string().max(HEADER_LIMITS.logoAlt),
});

export type HeaderData = z.infer<typeof schema>;

export const headerBlock = defineBlock<HeaderData>({
  type: 'header',
  modes: ['project'],
  singleton: true,
  defaultOnCreate: true,
  schema,
  createData: (meta) => ({ title: meta.name, tagline: meta.description, logoUrl: '', logoAlt: '' }),
  toMarkdown: (data) => {
    const title = singleLine(data.title);
    const tagline = singleLine(data.tagline);
    const logo = safeUrl(data.logoUrl);
    const lines: string[] = [];
    if (logo) lines.push(`![${escapeAlt(data.logoAlt) || escapeAlt(title) || 'Logo'}](${logo})`);
    if (title) lines.push(`# ${title}`);
    if (tagline) lines.push(tagline);
    return lines.join('\n\n');
  },
});
```

Create `src/lib/readme/blocks/free-markdown.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { normalizeNewlines } from '../markdown-utils';

export const FREE_MARKDOWN_MAX_LENGTH = 100_000;

const schema = z.object({ content: z.string().max(FREE_MARKDOWN_MAX_LENGTH) });

export type FreeMarkdownData = z.infer<typeof schema>;

export const freeMarkdownBlock = defineBlock<FreeMarkdownData>({
  type: 'freeMarkdown',
  modes: ['project', 'profile'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: () => ({ content: '' }),
  toMarkdown: (data) => normalizeNewlines(data.content).trim(),
});
```

Create `src/lib/readme/registry.ts` :

```ts
import type { AnyBlockDefinition } from './block-definition';
import { freeMarkdownBlock } from './blocks/free-markdown';
import { headerBlock } from './blocks/header';
import type { BlockType, ReadmeMode } from './types';

const DEFINITIONS: Record<BlockType, AnyBlockDefinition> = {
  header: headerBlock,
  freeMarkdown: freeMarkdownBlock,
};

export const BLOCK_TYPES = Object.keys(DEFINITIONS) as BlockType[];

export function isBlockType(value: string): value is BlockType {
  return Object.prototype.hasOwnProperty.call(DEFINITIONS, value);
}

export function getBlockDefinition(type: BlockType): AnyBlockDefinition {
  return DEFINITIONS[type];
}

/** Block definitions offered in the "add a block" menu for a mode, in display order. */
export function getCatalog(mode: ReadmeMode): AnyBlockDefinition[] {
  return BLOCK_TYPES.map((type) => DEFINITIONS[type]).filter((def) => def.modes.includes(mode));
}
```

Create `src/lib/readme/generate.ts` :

```ts
import { getBlockDefinition } from './registry';
import type { GenerateContext, ReadmeState } from './types';

/**
 * Pure: turns the editor state into the README Markdown. Disabled blocks and
 * blocks that render to nothing are skipped; the rest are joined by one blank line.
 */
export function generateReadme(state: ReadmeState): string {
  const ctx: GenerateContext = { mode: state.mode, theme: state.theme, meta: state.meta };
  const parts = state.blocks
    .filter((block) => block.enabled)
    .map((block) => getBlockDefinition(block.type).toMarkdown(block.data, ctx).trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? `${parts.join('\n\n')}\n` : '';
}
```

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS (sanitize, markdown-utils, generate) ; aucune erreur de types.

- [ ] **Step 7: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute le registre de blocs et la génération Markdown

Types partagés, définition de bloc type-erased, blocs En-tête et
Markdown libre, registre par mode et generateReadme pure. Les URL et
textes alternatifs sont échappés, les schémas non http(s) rejetés.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Opérations d'état pures

**Files:**
- Create: `src/lib/readme/state.ts`
- Test: `tests/readme/state.test.ts`

**Interfaces:**
- Consumes: `getBlockDefinition`, `getCatalog` (`registry.ts`) ; `DEFAULT_THEME`, `EMPTY_META` (`defaults.ts`) ; types de `types.ts`.
- Produces (utilisés par `persistence.ts` et le conteneur) : `createBlockId(): string`, `createBlock(type, meta, id?): Block`, `createInitialState(mode?): ReadmeState`, `canAddBlock(state, type): boolean`, `addBlock(state, type): ReadmeState`, `removeBlock(state, id)`, `toggleBlock(state, id)`, `updateBlockData(state, id, data: unknown)`, `moveBlock(state, id, delta: -1 | 1)`, `reorderBlock(state, fromId, toId)`, `switchMode(state, mode): { state: ReadmeState; dropped: number }`. Toutes retournent la **même référence** quand rien ne change.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/state.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import {
  addBlock,
  canAddBlock,
  createInitialState,
  moveBlock,
  removeBlock,
  reorderBlock,
  switchMode,
  toggleBlock,
  updateBlockData,
} from '@/lib/readme/state';
import { freeMarkdown, header, stateWith } from './helpers';

const ids = (state: { blocks: { id: string }[] }) => state.blocks.map((b) => b.id);

describe('createInitialState', () => {
  it('starts a project README with the default header block', () => {
    const state = createInitialState('project');
    expect(state.mode).toBe('project');
    expect(state.blocks.map((b) => b.type)).toEqual(['header']);
    expect(state.blocks[0].enabled).toBe(true);
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
    expect(result.state.blocks.map((b) => b.type)).toEqual(['header']);
    expect(result.dropped).toBe(0);
  });

  it('is a no-op for the same mode', () => {
    const state = stateWith([header('h')]);
    const result = switchMode(state, 'project');
    expect(result.state).toBe(state);
    expect(result.dropped).toBe(0);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/state.test.ts`
Expected: FAIL, module `@/lib/readme/state` introuvable.

- [ ] **Step 3: Implémenter**

Create `src/lib/readme/state.ts` :

```ts
import { DEFAULT_THEME, EMPTY_META } from './defaults';
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
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readme/state.ts tests/readme/state.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les opérations d'état pures de l'éditeur

Ajout, suppression, activation, déplacement, réordonnancement par
glisser-déposer et changement de mode, avec comptage des blocs retirés.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```


---

### Task 4: Validation

**Files:**
- Create: `src/lib/readme/markdown-checks.ts`, `src/lib/readme/validate.ts`
- Modify: `src/lib/readme/blocks/free-markdown.ts`
- Test: `tests/readme/markdown-checks.test.ts`, `tests/readme/validate.test.ts`

**Interfaces:**
- Consumes: `BlockWarning`, `ValidationWarning`, `GenerateContext`, `ReadmeState` (`types.ts`) ; `getBlockDefinition` (`registry.ts`) ; `freeMarkdownBlock` (`blocks/free-markdown.ts`).
- Produces : `checkMarkdownFragment(markdown: string): BlockWarning[]`, `findUnclosedTags(markdown: string): string[]`, `countImagesMissingAlt(markdown: string): number`, `hasLayoutTable(markdown: string): boolean` (`markdown-checks.ts`) ; `validateReadme(state: ReadmeState): ValidationWarning[]` (`validate.ts`). Le bloc Markdown libre expose désormais `validate`.

- [ ] **Step 1: Écrire le test des contrôles (échoue)**

Create `tests/readme/markdown-checks.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import {
  checkMarkdownFragment,
  countImagesMissingAlt,
  findUnclosedTags,
  hasLayoutTable,
} from '@/lib/readme/markdown-checks';

describe('countImagesMissingAlt', () => {
  it('counts Markdown images with empty alt text', () => {
    expect(countImagesMissingAlt('![](a.png) and ![ ](b.png) and ![ok](c.png)')).toBe(2);
  });

  it('counts <img> tags without a non-empty alt attribute', () => {
    const html = '<img src="a.png"> <img src="b.png" alt=""> <img src="c.png" alt="ok"> <img src="d.png" alt=\'ok\'>';
    expect(countImagesMissingAlt(html)).toBe(2);
  });

  it('ignores images inside code', () => {
    expect(countImagesMissingAlt('`![](a.png)`\n\n```md\n![](b.png)\n```')).toBe(0);
  });
});

describe('findUnclosedTags', () => {
  it('accepts balanced markup with void elements and self-closing tags', () => {
    expect(findUnclosedTags('<div align="center"><img src="x" alt="y"><br><hr/></div>')).toEqual([]);
  });

  it('reports a tag that is never closed', () => {
    expect(findUnclosedTags('<details><summary>More</summary>text')).toEqual(['details']);
  });

  it('reports a tag left open inside a closed parent', () => {
    expect(findUnclosedTags('<div><span>hi</div>')).toEqual(['span']);
  });

  it('reports a closing tag that was never opened', () => {
    expect(findUnclosedTags('text</div>')).toEqual(['div']);
  });

  it('ignores optional-closing tags, comments, autolinks and code', () => {
    const md = '<p>one\n<li>two\n<!-- <div> -->\n<https://x.io> and <me@x.io>\n`<b>`\n```\n<div>\n```';
    expect(findUnclosedTags(md)).toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(findUnclosedTags('<DIV></div>')).toEqual([]);
  });
});

describe('hasLayoutTable', () => {
  it('flags a table whose header cells are all empty', () => {
    expect(hasLayoutTable('| | |\n|---|---|\n| a | b |')).toBe(true);
  });

  it('accepts a normal data table', () => {
    expect(hasLayoutTable('| a | b |\n|---|---|\n| 1 | 2 |')).toBe(false);
  });

  it('does not mistake a thematic break or code for a table', () => {
    expect(hasLayoutTable('text\n\n---\n\nmore')).toBe(false);
    expect(hasLayoutTable('```\n| |\n|-|\n```')).toBe(false);
  });
});

describe('checkMarkdownFragment', () => {
  it('returns no warning for clean Markdown', () => {
    expect(checkMarkdownFragment('# Title\n\n![logo](a.png)\n\ntext')).toEqual([]);
  });

  it('reports every kind of problem with parameters', () => {
    const md = '![](a.png)\n\n<div>\n\n| | |\n|-|-|\n| a | b |';
    expect(checkMarkdownFragment(md)).toEqual([
      { code: 'imageMissingAlt', params: { count: 1 } },
      { code: 'htmlTagMismatch', params: { tags: 'div' } },
      { code: 'layoutTable' },
    ]);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/markdown-checks.test.ts`
Expected: FAIL, module `@/lib/readme/markdown-checks` introuvable.

- [ ] **Step 3: Implémenter les contrôles**

Create `src/lib/readme/markdown-checks.ts` :

```ts
import type { BlockWarning } from './types';

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);

/** Closing tag is optional in HTML: skipped to avoid false positives. */
const OPTIONAL_CLOSE_TAGS = new Set(['p', 'li', 'dt', 'dd', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'option']);

const SEPARATOR_ROW = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

/** Removes fenced and inline code so their content is never analyzed. */
function stripCode(markdown: string): string {
  return markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
    .replace(/`[^`\n]*`/g, '');
}

export function countImagesMissingAlt(markdown: string): number {
  const source = stripCode(markdown);
  const emptyMarkdownAlt = (source.match(/!\[\s*\]\(/g) ?? []).length;
  const htmlWithoutAlt = (source.match(/<img\b[^>]*>/gi) ?? []).filter(
    (tag) => !/\balt\s*=\s*("[^"]+"|'[^']+')/i.test(tag)
  ).length;
  return emptyMarkdownAlt + htmlWithoutAlt;
}

/** Names of HTML tags that are opened but never closed, or closed but never opened. */
export function findUnclosedTags(markdown: string): string[] {
  const source = stripCode(markdown).replace(/<!--[\s\S]*?-->/g, '');
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)(\/?)>/g;
  const stack: string[] = [];
  const problems: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source)) !== null) {
    const closing = match[1] === '/';
    const name = match[2].toLowerCase();
    const selfClosing = match[4] === '/';
    if (VOID_TAGS.has(name) || OPTIONAL_CLOSE_TAGS.has(name) || selfClosing) continue;
    if (!closing) {
      stack.push(name);
      continue;
    }
    const index = stack.lastIndexOf(name);
    if (index === -1) {
      problems.push(name);
      continue;
    }
    problems.push(...stack.splice(index).slice(1));
  }
  problems.push(...stack);
  return [...new Set(problems)];
}

/** A table with an all-empty header row is a layout trick, not data. */
export function hasLayoutTable(markdown: string): boolean {
  const lines = stripCode(markdown).split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const row = lines[i];
    const separator = lines[i + 1];
    if (!row.includes('|') || !separator.includes('|') || !SEPARATOR_ROW.test(separator)) continue;
    const cells = row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
    if (cells.every((cell) => cell.trim() === '')) return true;
  }
  return false;
}

export function checkMarkdownFragment(markdown: string): BlockWarning[] {
  const warnings: BlockWarning[] = [];
  const missingAlt = countImagesMissingAlt(markdown);
  if (missingAlt > 0) warnings.push({ code: 'imageMissingAlt', params: { count: missingAlt } });
  const tags = findUnclosedTags(markdown);
  if (tags.length > 0) warnings.push({ code: 'htmlTagMismatch', params: { tags: tags.join(', ') } });
  if (hasLayoutTable(markdown)) warnings.push({ code: 'layoutTable' });
  return warnings;
}
```

Run: `npx vitest run tests/readme/markdown-checks.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 4: Brancher la validation sur le bloc Markdown libre**

Modify `src/lib/readme/blocks/free-markdown.ts` : ajouter l'import et la propriété `validate`.

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { checkMarkdownFragment } from '../markdown-checks';
import { normalizeNewlines } from '../markdown-utils';

export const FREE_MARKDOWN_MAX_LENGTH = 100_000;

const schema = z.object({ content: z.string().max(FREE_MARKDOWN_MAX_LENGTH) });

export type FreeMarkdownData = z.infer<typeof schema>;

export const freeMarkdownBlock = defineBlock<FreeMarkdownData>({
  type: 'freeMarkdown',
  modes: ['project', 'profile'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: () => ({ content: '' }),
  toMarkdown: (data) => normalizeNewlines(data.content).trim(),
  validate: (data) => checkMarkdownFragment(data.content),
});
```

- [ ] **Step 5: Écrire le test de `validateReadme` (échoue), puis implémenter**

Create `tests/readme/validate.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { validateReadme } from '@/lib/readme/validate';
import { freeMarkdown, header, stateWith } from './helpers';

describe('validateReadme', () => {
  it('returns no warning for a clean README', () => {
    const state = stateWith([header('h', { title: 'Demo' }), freeMarkdown('f', 'Some text')]);
    expect(validateReadme(state)).toEqual([]);
  });

  it('attaches each warning to the block that caused it', () => {
    const state = stateWith([freeMarkdown('a', 'ok'), freeMarkdown('b', '![](x.png)')]);
    expect(validateReadme(state)).toEqual([
      { code: 'imageMissingAlt', params: { count: 1 }, blockId: 'b' },
    ]);
  });

  it('ignores disabled blocks', () => {
    const state = stateWith([freeMarkdown('a', '![](x.png)', false)]);
    expect(validateReadme(state)).toEqual([]);
  });
});
```

Run: `npx vitest run tests/readme/validate.test.ts`
Expected: FAIL, module `@/lib/readme/validate` introuvable.

Create `src/lib/readme/validate.ts` :

```ts
import { getBlockDefinition } from './registry';
import type { GenerateContext, ReadmeState, ValidationWarning } from './types';

/** Non-blocking checks: each warning points at the block that caused it. */
export function validateReadme(state: ReadmeState): ValidationWarning[] {
  const ctx: GenerateContext = { mode: state.mode, theme: state.theme, meta: state.meta };
  const warnings: ValidationWarning[] = [];
  for (const block of state.blocks) {
    if (!block.enabled) continue;
    for (const warning of getBlockDefinition(block.type).validate(block.data, ctx)) {
      warnings.push({ ...warning, blockId: block.id });
    }
  }
  return warnings;
}
```

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 7: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute le validateur non bloquant

Détecte les images sans alt, les balises HTML non appariées et les
tableaux de mise en page. Chaque avertissement est relié à son bloc.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Persistance et import/export JSON

**Files:**
- Create: `src/lib/readme/persistence.ts`
- Test: `tests/readme/persistence.test.ts`

**Interfaces:**
- Consumes: `getBlockDefinition`, `isBlockType` (`registry.ts`) ; `createBlockId` (`state.ts`) ; `EMPTY_META` (`defaults.ts`) ; types de `types.ts`.
- Produces : `STORAGE_KEY = 'readme-generator:v1'`, `MAX_BLOCKS = 200`, `StorageLike { getItem(key): string | null; setItem(key, value): void }`, `ParseResult = { ok: true; state: ReadmeState; dropped: number } | { ok: false }`, `parseReadmeState(input: unknown): ParseResult`, `serializeReadmeState(state): string`, `loadState(storage?: StorageLike | null): ReadmeState | null`, `saveState(state, storage?: StorageLike | null): boolean`. Utilisés par le conteneur (Tâche 7).

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/persistence.test.ts` :

```ts
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/persistence.test.ts`
Expected: FAIL, module `@/lib/readme/persistence` introuvable.

- [ ] **Step 3: Implémenter**

Create `src/lib/readme/persistence.ts` :

```ts
import { z } from 'zod';
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
    name: z.string().max(200),
    description: z.string().max(1000),
    author: z.string().max(200),
    license: z.string().max(100),
    repoUrl: z.string().max(2000),
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
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readme/persistence.ts tests/readme/persistence.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute la persistance locale et l'import/export JSON

Validation Zod de l'enveloppe, abandon compté des blocs invalides,
inconnus, hors mode ou en doublon, sauvegarde localStorage sans jamais
lever d'exception.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Traductions (8 locales)

**Files:**
- Modify: `src/i18n/locales/{fr,en,es,de,it,pt,ru,ja}.json`
- Test: `tests/i18n/readme-generator-locales.test.ts`

**Interfaces:**
- Consumes: `locales` (`@/i18n/locales`).
- Produces : dans chaque locale, `nav.readmeGenerator`, `home.tools.readmeGenerator.desc` et le namespace `readmeGenerator` avec les clés listées dans `REQUIRED_KEYS`. Utilisés par l'UI (Tâche 7), `tools.ts` (Tâche 8) et la page d'accueil (plan 3).

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/i18n/readme-generator-locales.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'modes.project',
  'modes.profile',
  'toolbar.mode',
  'toolbar.copy',
  'toolbar.download',
  'toolbar.exportJson',
  'toolbar.importJson',
  'toolbar.reset',
  'blocks.title',
  'blocks.add',
  'blocks.empty',
  'blocks.enabled',
  'blocks.moveUp',
  'blocks.moveDown',
  'blocks.remove',
  'blocks.drag',
  'blocks.header',
  'blocks.freeMarkdown',
  'fields.title',
  'fields.tagline',
  'fields.logoUrl',
  'fields.logoAlt',
  'fields.content',
  'placeholders.title',
  'placeholders.tagline',
  'placeholders.logoUrl',
  'placeholders.logoAlt',
  'placeholders.content',
  'preview.title',
  'preview.light',
  'preview.dark',
  'preview.empty',
  'warnings.title',
  'warnings.none',
  'warnings.imageMissingAlt',
  'warnings.htmlTagMismatch',
  'warnings.layoutTable',
  'messages.copySuccess',
  'messages.copyError',
  'messages.downloadError',
  'messages.importSuccess',
  'messages.importError',
  'messages.importDropped',
  'messages.modeSwitchDropped',
  'messages.resetDone',
  'messages.storageUnavailable',
] as const;

const PLACEHOLDERS: Record<string, string> = {
  'warnings.imageMissingAlt': '{count}',
  'warnings.htmlTagMismatch': '{tags}',
  'messages.importDropped': '{count}',
  'messages.modeSwitchDropped': '{count}',
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator translations', () => {
  it.each(locales)('%s has non-empty nav and home labels', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    expect(typeof messages.nav.readmeGenerator).toBe('string');
    expect(messages.nav.readmeGenerator.trim().length).toBeGreaterThan(0);
    expect(typeof messages.home.tools.readmeGenerator.desc).toBe('string');
    expect(messages.home.tools.readmeGenerator.desc.trim().length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every readmeGenerator key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.readmeGenerator, key);
      expect(typeof value, `${locale}:${key}`).toBe('string');
      expect((value as string).trim().length, `${locale}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s keeps the ICU placeholders of parameterized messages', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const [key, placeholder] of Object.entries(PLACEHOLDERS)) {
      expect(getPath(messages.readmeGenerator, key) as string, `${locale}:${key}`).toContain(placeholder);
    }
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/i18n/readme-generator-locales.test.ts`
Expected: FAIL (`messages.nav.readmeGenerator` est `undefined`).

- [ ] **Step 3: Ajouter les traductions aux 8 fichiers**

Run le script suivant depuis la racine du dépôt. Il est idempotent : il remplace les trois clés à chaque exécution et laisse le reste des fichiers intact (les JSON sont ré-écrits avec `JSON.stringify(_, null, 2)` + saut de ligne final, ce qui est le format actuel).

```bash
node --input-type=module - <<'EOF'
import fs from 'node:fs';

const T = {
  fr: {
    nav: 'Générateur de README',
    desc: 'Créez un README de projet ou de profil GitHub avec un éditeur de blocs et un aperçu fidèle à GitHub.',
    ns: {
      modes: { project: 'Projet', profile: 'Profil GitHub' },
      toolbar: { mode: 'Type de README', copy: 'Copier', download: 'Télécharger', exportJson: 'Exporter (JSON)', importJson: 'Importer (JSON)', reset: 'Réinitialiser' },
      blocks: { title: 'Blocs', add: 'Ajouter un bloc', empty: 'Aucun bloc pour le moment. Ajoutez-en un pour commencer.', enabled: 'Bloc activé', moveUp: 'Monter', moveDown: 'Descendre', remove: 'Supprimer', drag: 'Glisser pour réordonner', header: 'En-tête', freeMarkdown: 'Markdown libre' },
      fields: { title: 'Titre', tagline: 'Accroche', logoUrl: 'URL du logo', logoAlt: 'Texte alternatif du logo', content: 'Contenu Markdown' },
      placeholders: { title: 'Mon super projet', tagline: 'Une phrase qui explique ce que fait le projet.', logoUrl: 'https://exemple.com/logo.png', logoAlt: 'Logo de Mon super projet', content: '## Une section\n\nÉcrivez votre Markdown ici…' },
      preview: { title: 'Aperçu', light: 'Clair', dark: 'Sombre', empty: "L'aperçu du README apparaîtra ici." },
      warnings: { title: 'Avertissements', none: 'Aucun avertissement.', imageMissingAlt: 'Images sans texte alternatif (alt) : {count}.', htmlTagMismatch: 'Balises HTML non appariées : {tags}.', layoutTable: 'Tableau utilisé pour la mise en page : réservez les tableaux aux données.' },
      messages: { copySuccess: 'README copié dans le presse-papiers.', copyError: 'Impossible de copier le README.', downloadError: 'Impossible de télécharger le README.', importSuccess: 'Fichier importé.', importError: 'Fichier invalide : import impossible.', importDropped: 'Blocs ignorés : {count}.', modeSwitchDropped: 'Blocs retirés (incompatibles avec ce mode) : {count}.', resetDone: 'Éditeur réinitialisé.', storageUnavailable: 'Sauvegarde automatique indisponible dans ce navigateur.' },
    },
  },
  en: {
    nav: 'README Generator',
    desc: 'Build a project or GitHub profile README with a block editor and a GitHub-accurate preview.',
    ns: {
      modes: { project: 'Project', profile: 'GitHub profile' },
      toolbar: { mode: 'README type', copy: 'Copy', download: 'Download', exportJson: 'Export (JSON)', importJson: 'Import (JSON)', reset: 'Reset' },
      blocks: { title: 'Blocks', add: 'Add a block', empty: 'No blocks yet. Add one to get started.', enabled: 'Block enabled', moveUp: 'Move up', moveDown: 'Move down', remove: 'Remove', drag: 'Drag to reorder', header: 'Header', freeMarkdown: 'Free Markdown' },
      fields: { title: 'Title', tagline: 'Tagline', logoUrl: 'Logo URL', logoAlt: 'Logo alt text', content: 'Markdown content' },
      placeholders: { title: 'My awesome project', tagline: 'One sentence explaining what the project does.', logoUrl: 'https://example.com/logo.png', logoAlt: 'My awesome project logo', content: '## A section\n\nWrite your Markdown here…' },
      preview: { title: 'Preview', light: 'Light', dark: 'Dark', empty: 'The README preview will appear here.' },
      warnings: { title: 'Warnings', none: 'No warnings.', imageMissingAlt: 'Images without alt text: {count}.', htmlTagMismatch: 'Mismatched HTML tags: {tags}.', layoutTable: 'Table used for layout: keep tables for data.' },
      messages: { copySuccess: 'README copied to the clipboard.', copyError: 'Could not copy the README.', downloadError: 'Could not download the README.', importSuccess: 'File imported.', importError: 'Invalid file: import failed.', importDropped: 'Blocks ignored: {count}.', modeSwitchDropped: 'Blocks removed (not available in this mode): {count}.', resetDone: 'Editor reset.', storageUnavailable: 'Automatic saving is unavailable in this browser.' },
    },
  },
  es: {
    nav: 'Generador de README',
    desc: 'Crea un README de proyecto o de perfil de GitHub con un editor de bloques y una vista previa fiel a GitHub.',
    ns: {
      modes: { project: 'Proyecto', profile: 'Perfil de GitHub' },
      toolbar: { mode: 'Tipo de README', copy: 'Copiar', download: 'Descargar', exportJson: 'Exportar (JSON)', importJson: 'Importar (JSON)', reset: 'Restablecer' },
      blocks: { title: 'Bloques', add: 'Añadir un bloque', empty: 'Aún no hay bloques. Añade uno para empezar.', enabled: 'Bloque activado', moveUp: 'Subir', moveDown: 'Bajar', remove: 'Eliminar', drag: 'Arrastra para reordenar', header: 'Encabezado', freeMarkdown: 'Markdown libre' },
      fields: { title: 'Título', tagline: 'Eslogan', logoUrl: 'URL del logotipo', logoAlt: 'Texto alternativo del logotipo', content: 'Contenido Markdown' },
      placeholders: { title: 'Mi proyecto genial', tagline: 'Una frase que explique qué hace el proyecto.', logoUrl: 'https://ejemplo.com/logo.png', logoAlt: 'Logotipo de Mi proyecto genial', content: '## Una sección\n\nEscribe aquí tu Markdown…' },
      preview: { title: 'Vista previa', light: 'Claro', dark: 'Oscuro', empty: 'La vista previa del README aparecerá aquí.' },
      warnings: { title: 'Advertencias', none: 'Sin advertencias.', imageMissingAlt: 'Imágenes sin texto alternativo (alt): {count}.', htmlTagMismatch: 'Etiquetas HTML sin emparejar: {tags}.', layoutTable: 'Tabla usada para maquetar: reserva las tablas para datos.' },
      messages: { copySuccess: 'README copiado al portapapeles.', copyError: 'No se pudo copiar el README.', downloadError: 'No se pudo descargar el README.', importSuccess: 'Archivo importado.', importError: 'Archivo no válido: no se pudo importar.', importDropped: 'Bloques ignorados: {count}.', modeSwitchDropped: 'Bloques eliminados (no disponibles en este modo): {count}.', resetDone: 'Editor restablecido.', storageUnavailable: 'El guardado automático no está disponible en este navegador.' },
    },
  },
  de: {
    nav: 'README-Generator',
    desc: 'Erstellen Sie ein Projekt- oder GitHub-Profil-README mit Block-Editor und GitHub-getreuer Vorschau.',
    ns: {
      modes: { project: 'Projekt', profile: 'GitHub-Profil' },
      toolbar: { mode: 'README-Typ', copy: 'Kopieren', download: 'Herunterladen', exportJson: 'Exportieren (JSON)', importJson: 'Importieren (JSON)', reset: 'Zurücksetzen' },
      blocks: { title: 'Blöcke', add: 'Block hinzufügen', empty: 'Noch keine Blöcke. Fügen Sie einen hinzu, um zu beginnen.', enabled: 'Block aktiviert', moveUp: 'Nach oben', moveDown: 'Nach unten', remove: 'Entfernen', drag: 'Zum Umsortieren ziehen', header: 'Kopfbereich', freeMarkdown: 'Freies Markdown' },
      fields: { title: 'Titel', tagline: 'Slogan', logoUrl: 'Logo-URL', logoAlt: 'Alternativtext des Logos', content: 'Markdown-Inhalt' },
      placeholders: { title: 'Mein tolles Projekt', tagline: 'Ein Satz, der erklärt, was das Projekt macht.', logoUrl: 'https://beispiel.de/logo.png', logoAlt: 'Logo von Mein tolles Projekt', content: '## Ein Abschnitt\n\nSchreiben Sie hier Ihr Markdown…' },
      preview: { title: 'Vorschau', light: 'Hell', dark: 'Dunkel', empty: 'Die README-Vorschau erscheint hier.' },
      warnings: { title: 'Warnungen', none: 'Keine Warnungen.', imageMissingAlt: 'Bilder ohne Alternativtext (alt): {count}.', htmlTagMismatch: 'Nicht zusammenpassende HTML-Tags: {tags}.', layoutTable: 'Tabelle für das Layout verwendet: Tabellen sind für Daten gedacht.' },
      messages: { copySuccess: 'README in die Zwischenablage kopiert.', copyError: 'README konnte nicht kopiert werden.', downloadError: 'README konnte nicht heruntergeladen werden.', importSuccess: 'Datei importiert.', importError: 'Ungültige Datei: Import nicht möglich.', importDropped: 'Ignorierte Blöcke: {count}.', modeSwitchDropped: 'Entfernte Blöcke (in diesem Modus nicht verfügbar): {count}.', resetDone: 'Editor zurückgesetzt.', storageUnavailable: 'Automatisches Speichern ist in diesem Browser nicht verfügbar.' },
    },
  },
  it: {
    nav: 'Generatore di README',
    desc: "Crea un README di progetto o di profilo GitHub con un editor a blocchi e un'anteprima fedele a GitHub.",
    ns: {
      modes: { project: 'Progetto', profile: 'Profilo GitHub' },
      toolbar: { mode: 'Tipo di README', copy: 'Copia', download: 'Scarica', exportJson: 'Esporta (JSON)', importJson: 'Importa (JSON)', reset: 'Reimposta' },
      blocks: { title: 'Blocchi', add: 'Aggiungi un blocco', empty: 'Ancora nessun blocco. Aggiungine uno per iniziare.', enabled: 'Blocco attivato', moveUp: 'Sposta su', moveDown: 'Sposta giù', remove: 'Rimuovi', drag: 'Trascina per riordinare', header: 'Intestazione', freeMarkdown: 'Markdown libero' },
      fields: { title: 'Titolo', tagline: 'Slogan', logoUrl: 'URL del logo', logoAlt: 'Testo alternativo del logo', content: 'Contenuto Markdown' },
      placeholders: { title: 'Il mio fantastico progetto', tagline: 'Una frase che spiega cosa fa il progetto.', logoUrl: 'https://esempio.it/logo.png', logoAlt: 'Logo di Il mio fantastico progetto', content: '## Una sezione\n\nScrivi qui il tuo Markdown…' },
      preview: { title: 'Anteprima', light: 'Chiaro', dark: 'Scuro', empty: "L'anteprima del README apparirà qui." },
      warnings: { title: 'Avvisi', none: 'Nessun avviso.', imageMissingAlt: 'Immagini senza testo alternativo (alt): {count}.', htmlTagMismatch: 'Tag HTML non appaiati: {tags}.', layoutTable: "Tabella usata per l'impaginazione: riserva le tabelle ai dati." },
      messages: { copySuccess: 'README copiato negli appunti.', copyError: 'Impossibile copiare il README.', downloadError: 'Impossibile scaricare il README.', importSuccess: 'File importato.', importError: 'File non valido: importazione impossibile.', importDropped: 'Blocchi ignorati: {count}.', modeSwitchDropped: 'Blocchi rimossi (non disponibili in questa modalità): {count}.', resetDone: 'Editor reimpostato.', storageUnavailable: 'Il salvataggio automatico non è disponibile in questo browser.' },
    },
  },
  pt: {
    nav: 'Gerador de README',
    desc: 'Crie um README de projeto ou de perfil do GitHub com um editor de blocos e uma pré-visualização fiel ao GitHub.',
    ns: {
      modes: { project: 'Projeto', profile: 'Perfil do GitHub' },
      toolbar: { mode: 'Tipo de README', copy: 'Copiar', download: 'Transferir', exportJson: 'Exportar (JSON)', importJson: 'Importar (JSON)', reset: 'Repor' },
      blocks: { title: 'Blocos', add: 'Adicionar um bloco', empty: 'Ainda não há blocos. Adicione um para começar.', enabled: 'Bloco ativado', moveUp: 'Mover para cima', moveDown: 'Mover para baixo', remove: 'Remover', drag: 'Arraste para reordenar', header: 'Cabeçalho', freeMarkdown: 'Markdown livre' },
      fields: { title: 'Título', tagline: 'Slogan', logoUrl: 'URL do logótipo', logoAlt: 'Texto alternativo do logótipo', content: 'Conteúdo Markdown' },
      placeholders: { title: 'O meu projeto incrível', tagline: 'Uma frase que explica o que o projeto faz.', logoUrl: 'https://exemplo.pt/logo.png', logoAlt: 'Logótipo de O meu projeto incrível', content: '## Uma secção\n\nEscreva aqui o seu Markdown…' },
      preview: { title: 'Pré-visualização', light: 'Claro', dark: 'Escuro', empty: 'A pré-visualização do README aparecerá aqui.' },
      warnings: { title: 'Avisos', none: 'Sem avisos.', imageMissingAlt: 'Imagens sem texto alternativo (alt): {count}.', htmlTagMismatch: 'Etiquetas HTML não emparelhadas: {tags}.', layoutTable: 'Tabela usada para paginação: reserve as tabelas para dados.' },
      messages: { copySuccess: 'README copiado para a área de transferência.', copyError: 'Não foi possível copiar o README.', downloadError: 'Não foi possível transferir o README.', importSuccess: 'Ficheiro importado.', importError: 'Ficheiro inválido: importação impossível.', importDropped: 'Blocos ignorados: {count}.', modeSwitchDropped: 'Blocos removidos (indisponíveis neste modo): {count}.', resetDone: 'Editor reposto.', storageUnavailable: 'A gravação automática não está disponível neste navegador.' },
    },
  },
  ru: {
    nav: 'Генератор README',
    desc: 'Создайте README проекта или профиля GitHub в блочном редакторе с предпросмотром, точным как на GitHub.',
    ns: {
      modes: { project: 'Проект', profile: 'Профиль GitHub' },
      toolbar: { mode: 'Тип README', copy: 'Копировать', download: 'Скачать', exportJson: 'Экспорт (JSON)', importJson: 'Импорт (JSON)', reset: 'Сбросить' },
      blocks: { title: 'Блоки', add: 'Добавить блок', empty: 'Блоков пока нет. Добавьте первый, чтобы начать.', enabled: 'Блок включён', moveUp: 'Вверх', moveDown: 'Вниз', remove: 'Удалить', drag: 'Перетащите для изменения порядка', header: 'Заголовок', freeMarkdown: 'Свободный Markdown' },
      fields: { title: 'Название', tagline: 'Слоган', logoUrl: 'URL логотипа', logoAlt: 'Альтернативный текст логотипа', content: 'Содержимое Markdown' },
      placeholders: { title: 'Мой замечательный проект', tagline: 'Одно предложение о том, что делает проект.', logoUrl: 'https://example.com/logo.png', logoAlt: 'Логотип проекта «Мой замечательный проект»', content: '## Раздел\n\nНапишите здесь свой Markdown…' },
      preview: { title: 'Предпросмотр', light: 'Светлая', dark: 'Тёмная', empty: 'Здесь появится предпросмотр README.' },
      warnings: { title: 'Предупреждения', none: 'Предупреждений нет.', imageMissingAlt: 'Изображения без альтернативного текста (alt): {count}.', htmlTagMismatch: 'Непарные HTML-теги: {tags}.', layoutTable: 'Таблица используется для вёрстки: таблицы предназначены для данных.' },
      messages: { copySuccess: 'README скопирован в буфер обмена.', copyError: 'Не удалось скопировать README.', downloadError: 'Не удалось скачать README.', importSuccess: 'Файл импортирован.', importError: 'Недопустимый файл: импорт невозможен.', importDropped: 'Пропущено блоков: {count}.', modeSwitchDropped: 'Удалено блоков (недоступны в этом режиме): {count}.', resetDone: 'Редактор сброшен.', storageUnavailable: 'Автосохранение недоступно в этом браузере.' },
    },
  },
  ja: {
    nav: 'README生成',
    desc: 'ブロックエディタとGitHubそっくりのプレビューで、プロジェクトやGitHubプロフィールのREADMEを作成できます。',
    ns: {
      modes: { project: 'プロジェクト', profile: 'GitHubプロフィール' },
      toolbar: { mode: 'READMEの種類', copy: 'コピー', download: 'ダウンロード', exportJson: 'エクスポート（JSON）', importJson: 'インポート（JSON）', reset: 'リセット' },
      blocks: { title: 'ブロック', add: 'ブロックを追加', empty: 'ブロックはまだありません。追加して始めましょう。', enabled: 'ブロックを有効化', moveUp: '上へ移動', moveDown: '下へ移動', remove: '削除', drag: 'ドラッグして並べ替え', header: 'ヘッダー', freeMarkdown: '自由なMarkdown' },
      fields: { title: 'タイトル', tagline: 'キャッチコピー', logoUrl: 'ロゴのURL', logoAlt: 'ロゴの代替テキスト', content: 'Markdownの内容' },
      placeholders: { title: '私のすてきなプロジェクト', tagline: 'プロジェクトが何をするのかを一文で説明します。', logoUrl: 'https://example.com/logo.png', logoAlt: '私のすてきなプロジェクトのロゴ', content: '## セクション\n\nここにMarkdownを書きます…' },
      preview: { title: 'プレビュー', light: 'ライト', dark: 'ダーク', empty: 'READMEのプレビューがここに表示されます。' },
      warnings: { title: '警告', none: '警告はありません。', imageMissingAlt: '代替テキスト（alt）のない画像：{count}件。', htmlTagMismatch: '対応していないHTMLタグ：{tags}。', layoutTable: 'レイアウトのために表が使われています。表はデータ用にしましょう。' },
      messages: { copySuccess: 'READMEをクリップボードにコピーしました。', copyError: 'READMEをコピーできませんでした。', downloadError: 'READMEをダウンロードできませんでした。', importSuccess: 'ファイルをインポートしました。', importError: '無効なファイルのためインポートできません。', importDropped: '無視したブロック：{count}件。', modeSwitchDropped: 'このモードで使えないため削除したブロック：{count}件。', resetDone: 'エディタをリセットしました。', storageUnavailable: 'このブラウザでは自動保存を利用できません。' },
    },
  },
};

for (const [locale, t] of Object.entries(T)) {
  const file = `src/i18n/locales/${locale}.json`;
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
  messages.nav.readmeGenerator = t.nav;
  messages.home.tools.readmeGenerator = { desc: t.desc };
  messages.readmeGenerator = t.ns;
  fs.writeFileSync(file, JSON.stringify(messages, null, 2) + '\n');
  console.log('updated', file);
}
EOF
```

Expected: huit lignes `updated src/i18n/locales/<locale>.json`.

- [ ] **Step 4: Vérifier que le test passe et que les diffs ne touchent que les ajouts**

Run: `npx vitest run tests/i18n && git diff --stat src/i18n/locales`
Expected: PASS (tous les tests i18n, dont ceux de `tree-commands`, `qr`, `separators`) ; chaque locale n'affiche que des lignes ajoutées (`+`), aucune suppression.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/locales tests/i18n/readme-generator-locales.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les traductions du générateur dans les 8 locales

Clés nav, home et namespace readmeGenerator (éditeur, blocs, aperçu,
avertissements, messages), avec contrôle des paramètres ICU.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```


---

### Task 7: Interface de l'éditeur

Les composants React ne sont pas couverts par `vitest` (environnement `node`, voir Global Constraints) ; toute leur logique métier vit déjà dans `src/lib/readme/` et est testée. Cette tâche se vérifie par le typage, le lint et un contrôle manuel dans le navigateur.

**Files:**
- Modify: `src/components/icons.tsx` (icône `FileCode`, utilisée en Tâche 8)
- Create: `src/components/readme-generator/readme-preview.css`, `readme-preview.tsx`, `warnings-panel.tsx`, `block-forms.tsx`, `block-list.tsx`, `readme-toolbar.tsx`, `readme-generator.tsx`

**Interfaces:**
- Consumes: `generateReadme`, `validateReadme`, `getCatalog`, `canAddBlock`, `addBlock`, `removeBlock`, `toggleBlock`, `updateBlockData`, `moveBlock`, `reorderBlock`, `switchMode`, `createInitialState`, `loadState`, `saveState`, `parseReadmeState`, `serializeReadmeState`, `README_MARKDOWN_PROPS`, `HEADER_LIMITS`, `FREE_MARKDOWN_MAX_LENGTH`, `HeaderData`, `FreeMarkdownData`, `trackEvent`, `useToast`.
- Produces : `ReadmeGenerator` (composant sans props), consommé par la page (Tâche 8).

- [ ] **Step 1: Ajouter l'icône `FileCode`**

Modify `src/components/icons.tsx`. Dans la liste d'imports depuis `@hugeicons/core-free-icons`, ajouter `DocumentCodeIcon` :

```tsx
  Tick02Icon,
  Upload01Icon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
```

Puis remplacer la ligne `export const Terminal = createIcon(TerminalIcon, "Terminal");` par :

```tsx
export const FileCode = createIcon(DocumentCodeIcon, "FileCode");
export const Terminal = createIcon(TerminalIcon, "Terminal");
```

- [ ] **Step 2: Styles de l'aperçu**

Create `src/components/readme-generator/readme-preview.css` :

```css
/* GitHub-style alerts rendered by remark-github-blockquote-alert. */
.readme-preview .markdown-alert {
  --alert-color: #0969da;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  border-left: 0.25em solid var(--alert-color);
}

.readme-preview .markdown-alert > :last-child {
  margin-bottom: 0;
}

.readme-preview .markdown-alert-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: var(--alert-color);
}

.readme-preview .markdown-alert-title svg {
  fill: currentColor;
}

.readme-preview .markdown-alert-note { --alert-color: #0969da; }
.readme-preview .markdown-alert-tip { --alert-color: #1a7f37; }
.readme-preview .markdown-alert-important { --alert-color: #8250df; }
.readme-preview .markdown-alert-warning { --alert-color: #9a6700; }
.readme-preview .markdown-alert-caution { --alert-color: #d1242f; }

.readme-preview[data-theme='dark'] .markdown-alert-note { --alert-color: #4493f8; }
.readme-preview[data-theme='dark'] .markdown-alert-tip { --alert-color: #3fb950; }
.readme-preview[data-theme='dark'] .markdown-alert-important { --alert-color: #ab7df8; }
.readme-preview[data-theme='dark'] .markdown-alert-warning { --alert-color: #d29922; }
.readme-preview[data-theme='dark'] .markdown-alert-caution { --alert-color: #f85149; }

.readme-preview img {
  display: inline-block;
  max-width: 100%;
}
```

- [ ] **Step 3: Aperçu**

Create `src/components/readme-generator/readme-preview.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Moon, Sun } from '@/components/icons';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';
import { cn } from '@/lib/utils';
// Single highlight.js theme, same as the Markdown editor's preview.
import 'highlight.js/styles/github-dark.css';
import './readme-preview.css';

type PreviewImageProps = React.ComponentPropsWithoutRef<'img'> & { node?: unknown };

/** Shows the alt text when an external image (badge, stats card…) fails to load. */
function PreviewImage({ node, src, alt, ...rest }: PreviewImageProps) {
  void node;
  const [failed, setFailed] = useState(false);
  if (typeof src !== 'string' || failed) {
    return <span className="italic opacity-70">{alt}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} src={src} alt={alt ?? ''} onError={() => setFailed(true)} />;
}

const COMPONENTS: Components = {
  img: (props) => <PreviewImage key={String(props.src)} {...props} />,
};

interface ReadmePreviewProps {
  markdown: string;
}

export function ReadmePreview({ markdown }: ReadmePreviewProps) {
  const t = useTranslations('readmeGenerator');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          {t('preview.title')}
        </CardTitle>
        <div className="flex gap-2" role="group" aria-label={t('preview.title')}>
          <Button size="sm" variant={theme === 'light' ? 'default' : 'outline'} aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
            <Sun className="w-4 h-4 mr-1" />
            {t('preview.light')}
          </Button>
          <Button size="sm" variant={theme === 'dark' ? 'default' : 'outline'} aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
            <Moon className="w-4 h-4 mr-1" />
            {t('preview.dark')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          data-theme={theme}
          className={cn(
            'readme-preview prose max-w-none min-h-[200px] rounded-md border p-6',
            theme === 'dark' ? 'prose-invert bg-[#0d1117]' : 'bg-white'
          )}
        >
          {markdown ? (
            <ReactMarkdown {...README_MARKDOWN_PROPS} components={COMPONENTS}>
              {markdown}
            </ReactMarkdown>
          ) : (
            <p className="opacity-60">{t('preview.empty')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Panneau d'avertissements**

Create `src/components/readme-generator/warnings-panel.tsx` :

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ValidationWarning } from '@/lib/readme/types';

interface WarningsPanelProps {
  warnings: ValidationWarning[];
  /** Display name of each block, keyed by block id. */
  blockLabels: Record<string, string>;
}

export function WarningsPanel({ warnings, blockLabels }: WarningsPanelProps) {
  const t = useTranslations('readmeGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('warnings.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('warnings.none')}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {warnings.map((warning, index) => (
              <li key={`${warning.blockId}-${warning.code}-${index}`}>
                <span className="font-medium">{blockLabels[warning.blockId]}</span>
                {' — '}
                {t(`warnings.${warning.code}`, warning.params ?? {})}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Formulaires de blocs**

Create `src/components/readme-generator/block-forms.tsx` :

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FREE_MARKDOWN_MAX_LENGTH, type FreeMarkdownData } from '@/lib/readme/blocks/free-markdown';
import { HEADER_LIMITS, type HeaderData } from '@/lib/readme/blocks/header';
import type { Block } from '@/lib/readme/types';

interface FormProps<T> {
  idPrefix: string;
  data: T;
  onChange: (data: T) => void;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function HeaderForm({ idPrefix, data, onChange }: FormProps<HeaderData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<HeaderData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-3">
      <Field id={`${idPrefix}-title`} label={t('fields.title')}>
        <Input
          id={`${idPrefix}-title`}
          value={data.title}
          maxLength={HEADER_LIMITS.title}
          placeholder={t('placeholders.title')}
          onChange={(e) => set({ title: e.target.value })}
        />
      </Field>
      <Field id={`${idPrefix}-tagline`} label={t('fields.tagline')}>
        <Input
          id={`${idPrefix}-tagline`}
          value={data.tagline}
          maxLength={HEADER_LIMITS.tagline}
          placeholder={t('placeholders.tagline')}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </Field>
      <Field id={`${idPrefix}-logoUrl`} label={t('fields.logoUrl')}>
        <Input
          id={`${idPrefix}-logoUrl`}
          value={data.logoUrl}
          maxLength={HEADER_LIMITS.logoUrl}
          placeholder={t('placeholders.logoUrl')}
          onChange={(e) => set({ logoUrl: e.target.value })}
        />
      </Field>
      <Field id={`${idPrefix}-logoAlt`} label={t('fields.logoAlt')}>
        <Input
          id={`${idPrefix}-logoAlt`}
          value={data.logoAlt}
          maxLength={HEADER_LIMITS.logoAlt}
          placeholder={t('placeholders.logoAlt')}
          onChange={(e) => set({ logoAlt: e.target.value })}
        />
      </Field>
    </div>
  );
}

function FreeMarkdownForm({ idPrefix, data, onChange }: FormProps<FreeMarkdownData>) {
  const t = useTranslations('readmeGenerator');

  return (
    <Field id={`${idPrefix}-content`} label={t('fields.content')}>
      <Textarea
        id={`${idPrefix}-content`}
        className="min-h-[220px] font-mono text-sm"
        value={data.content}
        maxLength={FREE_MARKDOWN_MAX_LENGTH}
        placeholder={t('placeholders.content')}
        onChange={(e) => onChange({ content: e.target.value })}
      />
    </Field>
  );
}

interface BlockFormProps {
  block: Block;
  onChange: (data: unknown) => void;
}

/** Picks the form for a block type. Add one case per new block type. */
export function BlockForm({ block, onChange }: BlockFormProps) {
  switch (block.type) {
    case 'header':
      return <HeaderForm idPrefix={block.id} data={block.data as HeaderData} onChange={onChange} />;
    case 'freeMarkdown':
      return <FreeMarkdownForm idPrefix={block.id} data={block.data as FreeMarkdownData} onChange={onChange} />;
    default:
      return null;
  }
}
```

- [ ] **Step 6: Liste de blocs (drag-drop natif et boutons)**

Create `src/components/readme-generator/block-list.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Move, Plus, Trash2 } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Block, BlockType } from '@/lib/readme/types';

interface BlockListProps {
  blocks: Block[];
  selectedId: string | null;
  catalog: { type: BlockType; disabled: boolean }[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, delta: -1 | 1) => void;
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onAdd: (type: BlockType) => void;
}

export function BlockList({
  blocks,
  selectedId,
  catalog,
  onSelect,
  onToggle,
  onMove,
  onRemove,
  onReorder,
  onAdd,
}: BlockListProps) {
  const t = useTranslations('readmeGenerator');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{t('blocks.title')}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              {t('blocks.add')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {catalog.map(({ type, disabled }) => (
              <DropdownMenuItem key={type} disabled={disabled} onSelect={() => onAdd(type)}>
                {t(`blocks.${type}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 && <p className="text-sm text-muted-foreground">{t('blocks.empty')}</p>}
        <ul className="space-y-2">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              draggable
              onDragStart={(e) => {
                setDragId(block.id);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', block.id);
              }}
              onDragEnd={endDrag}
              onDragOver={(e) => {
                if (dragId && dragId !== block.id) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setOverId(block.id);
                }
              }}
              onDragLeave={() => setOverId((current) => (current === block.id ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) onReorder(dragId, block.id);
                endDrag();
              }}
              className={cn(
                'flex items-center gap-2 rounded-md border p-2',
                selectedId === block.id && 'border-primary',
                overId === block.id && 'ring-2 ring-primary/50',
                dragId === block.id && 'opacity-50'
              )}
            >
              <span className="cursor-grab text-muted-foreground" title={t('blocks.drag')}>
                <Move className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{t('blocks.drag')}</span>
              </span>
              <button
                type="button"
                className={cn('flex-1 truncate text-left text-sm', !block.enabled && 'text-muted-foreground line-through')}
                aria-current={selectedId === block.id}
                onClick={() => onSelect(block.id)}
              >
                {t(`blocks.${block.type}`)}
              </button>
              <Switch
                checked={block.enabled}
                onCheckedChange={() => onToggle(block.id)}
                aria-label={t('blocks.enabled')}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={index === 0}
                onClick={() => onMove(block.id, -1)}
                aria-label={t('blocks.moveUp')}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={index === blocks.length - 1}
                onClick={() => onMove(block.id, 1)}
                aria-label={t('blocks.moveDown')}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onRemove(block.id)}
                aria-label={t('blocks.remove')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 7: Barre d'outils**

Create `src/components/readme-generator/readme-toolbar.tsx` :

```tsx
'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash2, Upload } from '@/components/icons';
import type { ReadmeMode } from '@/lib/readme/types';

const MODES: ReadmeMode[] = ['project', 'profile'];

interface ReadmeToolbarProps {
  mode: ReadmeMode;
  onModeChange: (mode: ReadmeMode) => void;
  onCopy: () => void;
  onDownload: () => void;
  onExportJson: () => void;
  onImportFile: (file: File) => void;
  onReset: () => void;
}

export function ReadmeToolbar({
  mode,
  onModeChange,
  onCopy,
  onDownload,
  onExportJson,
  onImportFile,
  onReset,
}: ReadmeToolbarProps) {
  const t = useTranslations('readmeGenerator');
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('toolbar.mode')}>
        {MODES.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={mode === value ? 'default' : 'outline'}
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
          >
            {t(`modes.${value}`)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onCopy}>
          <Copy className="w-4 h-4 mr-1" />
          {t('toolbar.copy')}
        </Button>
        <Button size="sm" variant="outline" onClick={onDownload}>
          <Download className="w-4 h-4 mr-1" />
          {t('toolbar.download')}
        </Button>
        <Button size="sm" variant="outline" onClick={onExportJson}>
          <Save className="w-4 h-4 mr-1" />
          {t('toolbar.exportJson')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
          <Upload className="w-4 h-4 mr-1" />
          {t('toolbar.importJson')}
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          <Trash2 className="w-4 h-4 mr-1" />
          {t('toolbar.reset')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Conteneur**

Create `src/components/readme-generator/readme-generator.tsx` :

```tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics-events';
import { generateReadme } from '@/lib/readme/generate';
import {
  loadState,
  parseReadmeState,
  saveState,
  serializeReadmeState,
} from '@/lib/readme/persistence';
import { getCatalog } from '@/lib/readme/registry';
import {
  addBlock,
  canAddBlock,
  createInitialState,
  moveBlock,
  removeBlock,
  reorderBlock,
  switchMode,
  toggleBlock,
  updateBlockData,
} from '@/lib/readme/state';
import type { BlockType, ReadmeMode, ReadmeState } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { cn } from '@/lib/utils';
import { BlockForm } from './block-forms';
import { BlockList } from './block-list';
import { ReadmePreview } from './readme-preview';
import { ReadmeToolbar } from './readme-toolbar';
import { WarningsPanel } from './warnings-panel';

const MAX_IMPORT_BYTES = 1_000_000;

function downloadFile(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReadmeGenerator() {
  const t = useTranslations('readmeGenerator');
  const { toast } = useToast();

  // `null` until mounted: the saved state is only known in the browser.
  const [state, setState] = useState<ReadmeState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const storageWarned = useRef(false);

  useEffect(() => {
    setState(loadState() ?? createInitialState('project'));
  }, []);

  useEffect(() => {
    if (!state) return;
    if (!saveState(state) && !storageWarned.current) {
      storageWarned.current = true;
      toast({ description: t('messages.storageUnavailable') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const markdown = useMemo(() => (state ? generateReadme(state) : ''), [state]);
  const warnings = useMemo(() => (state ? validateReadme(state) : []), [state]);

  const update = useCallback((change: (current: ReadmeState) => ReadmeState) => {
    setState((current) => (current ? change(current) : current));
  }, []);

  if (!state) {
    return <div className="mx-auto max-w-6xl p-6" aria-busy="true" />;
  }

  const selected = state.blocks.find((block) => block.id === selectedId) ?? state.blocks[0] ?? null;
  const catalog = getCatalog(state.mode).map((def) => ({
    type: def.type,
    disabled: !canAddBlock(state, def.type),
  }));
  const blockLabels = Object.fromEntries(state.blocks.map((block) => [block.id, t(`blocks.${block.type}`)]));

  const handleModeChange = (mode: ReadmeMode) => {
    const result = switchMode(state, mode);
    setState(result.state);
    setSelectedId(null);
    if (result.dropped > 0) {
      toast({ description: t('messages.modeSwitchDropped', { count: result.dropped }) });
    }
  };

  const handleAdd = (type: BlockType) => {
    const next = addBlock(state, type);
    if (next === state) return;
    setState(next);
    setSelectedId(next.blocks[next.blocks.length - 1].id);
    setTab('edit');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      trackEvent('Copy', { tool: 'readme-generator', mode: state.mode });
      toast({ description: t('messages.copySuccess') });
    } catch {
      toast({ description: t('messages.copyError'), variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    try {
      downloadFile(markdown, 'README.md', 'text/markdown');
      trackEvent('Download', { tool: 'readme-generator', mode: state.mode });
    } catch {
      toast({ description: t('messages.downloadError'), variant: 'destructive' });
    }
  };

  const handleExportJson = () => {
    try {
      downloadFile(serializeReadmeState(state), `readme-${state.mode}.json`, 'application/json');
    } catch {
      toast({ description: t('messages.downloadError'), variant: 'destructive' });
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('file too large');
      const result = parseReadmeState(JSON.parse(await file.text()));
      if (!result.ok) throw new Error('invalid file');
      setState(result.state);
      setSelectedId(null);
      const description =
        result.dropped > 0
          ? `${t('messages.importSuccess')} ${t('messages.importDropped', { count: result.dropped })}`
          : t('messages.importSuccess');
      toast({ description });
    } catch {
      toast({ description: t('messages.importError'), variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setState(createInitialState(state.mode));
    setSelectedId(null);
    toast({ description: t('messages.resetDone') });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <ReadmeToolbar
        mode={state.mode}
        onModeChange={handleModeChange}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onExportJson={handleExportJson}
        onImportFile={handleImportFile}
        onReset={handleReset}
      />

      <div className="flex gap-2 lg:hidden" role="group">
        <Button size="sm" variant={tab === 'edit' ? 'default' : 'outline'} aria-pressed={tab === 'edit'} onClick={() => setTab('edit')}>
          {t('blocks.title')}
        </Button>
        <Button size="sm" variant={tab === 'preview' ? 'default' : 'outline'} aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>
          {t('preview.title')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn('space-y-6', tab === 'preview' && 'hidden lg:block lg:space-y-6')}>
          <BlockList
            blocks={state.blocks}
            selectedId={selected?.id ?? null}
            catalog={catalog}
            onSelect={setSelectedId}
            onToggle={(id) => update((current) => toggleBlock(current, id))}
            onMove={(id, delta) => update((current) => moveBlock(current, id, delta))}
            onRemove={(id) => update((current) => removeBlock(current, id))}
            onReorder={(fromId, toId) => update((current) => reorderBlock(current, fromId, toId))}
            onAdd={handleAdd}
          />
          {selected && (
            <Card>
              <CardHeader>
                <CardTitle>{t(`blocks.${selected.type}`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockForm
                  block={selected}
                  onChange={(data) => update((current) => updateBlockData(current, selected.id, data))}
                />
              </CardContent>
            </Card>
          )}
          <WarningsPanel warnings={warnings} blockLabels={blockLabels} />
        </div>
        <div className={cn(tab === 'edit' && 'hidden lg:block')}>
          <ReadmePreview markdown={markdown} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Vérifier types et lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: aucune erreur de types ni de lint. Si `Components['img']` ou l'expansion `{...props}` signale un écart de type sur `node`, conserver la destructuration `node` de `PreviewImage` (elle existe pour ça) ; ne pas ajouter de `any`.

- [ ] **Step 10: Commit**

```bash
git add src/components/icons.tsx src/components/readme-generator
git commit -m "$(cat <<'EOF'
feat(readme): ajoute l'interface de l'éditeur de README

Conteneur d'état, barre d'outils (mode, copie, téléchargement, export
et import JSON), liste de blocs avec drag-drop natif et boutons,
formulaires, aperçu GFM clair/sombre et panneau d'avertissements.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Route, navigation et contenu SEO

L'outil est créé mais **pas encore public** : la page est `noindex`, l'entrée de navigation est marquée `comingSoon` (désactivée dans la barre latérale), et l'outil n'apparaît ni dans le sitemap ni dans la vitrine d'accueil. Le plan 3 lève ces restrictions.

**Files:**
- Modify: `src/lib/tools.ts`, `src/lib/seo-config.ts`, `src/lib/tool-seo-content.ts`
- Create: `src/app/[locale]/tools/readme-generator/page.tsx`
- Test: `tests/seo/readme-generator-seo.test.ts`

**Interfaces:**
- Consumes: `ReadmeGenerator` (Tâche 7) ; `FileCode` (Tâche 7, Step 1) ; clés `nav.readmeGenerator` (Tâche 6) ; `buildToolMetadata`, `getToolMetadata`, `getToolContent`.
- Produces : slug SEO `'readme-generator'` (`ToolSlug`), route `/[locale]/tools/readme-generator`.

- [ ] **Step 1: Écrire le test SEO (échoue)**

Create `tests/seo/readme-generator-seo.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import { getToolMetadata } from '@/lib/seo-config';
import { getToolContent } from '@/lib/tool-seo-content';

const SLUG = 'readme-generator' as const;

describe('README generator tool SEO', () => {
  it.each([...locales])('%s has its own title, description and copy', (locale) => {
    const meta = getToolMetadata(SLUG, locale);
    expect(meta.path).toBe(`/${locale}/tools/readme-generator`);
    expect(meta.title.length).toBeGreaterThan(10);
    expect(meta.title.length).toBeLessThanOrEqual(80);
    expect(meta.description.length).toBeGreaterThan(50);
    expect(meta.description.length).toBeLessThanOrEqual(180);

    const content = getToolContent(SLUG, locale);
    expect(content.heading).not.toBe('');
    expect(content.intro.length).toBeGreaterThan(80);
    expect(content.faq).toHaveLength(3);
    for (const { q, a } of content.faq) {
      expect(q).not.toBe('');
      expect(a).not.toBe('');
    }
  });

  it.each([...locales].filter((l) => l !== 'en'))('%s is not the English fallback', (locale) => {
    expect(getToolMetadata(SLUG, locale).title).not.toBe(getToolMetadata(SLUG, 'en').title);
    expect(getToolContent(SLUG, locale)).not.toBe(getToolContent(SLUG, 'en'));
  });
});
```

Run: `npx vitest run tests/seo/readme-generator-seo.test.ts`
Expected: FAIL (erreur de type ou `undefined` : le slug n'existe pas).

- [ ] **Step 2: Ajouter les métadonnées SEO**

Modify `src/lib/seo-config.ts` : remplacer la ligne finale de `TOOLS_SEO`

```ts
} satisfies Record<string, ToolMeta>;
```

par l'entrée suivante suivie de cette même ligne :

```ts
  'readme-generator': {
    titles: {
      fr: "Générateur de README GitHub (projet & profil) | Gratuit",
      en: "GitHub README Generator (Project & Profile) | Free",
      es: "Generador de README para GitHub (proyecto y perfil) | Gratis",
      de: "GitHub-README-Generator (Projekt & Profil) | Kostenlos",
      it: "Generatore di README GitHub (progetto e profilo) | Gratis",
      pt: "Gerador de README do GitHub (projeto e perfil) | Grátis",
      ru: "Генератор README для GitHub (проект и профиль) | Бесплатно",
      ja: "GitHub README生成ツール（プロジェクト＆プロフィール）｜無料",
    },
    descriptions: {
      fr: "Créez un README de projet ou de profil GitHub avec un éditeur de blocs et un aperçu fidèle à GitHub. Gratuit, sans inscription, tout reste dans votre navigateur.",
      en: "Build a project or GitHub profile README with a block editor and a GitHub-accurate preview. Free, no sign-up, everything stays in your browser.",
      es: "Crea un README de proyecto o de perfil de GitHub con un editor de bloques y una vista previa fiel a GitHub. Gratis, sin registro, todo se queda en tu navegador.",
      de: "Erstellen Sie ein Projekt- oder GitHub-Profil-README mit Block-Editor und GitHub-getreuer Vorschau. Kostenlos, ohne Anmeldung, alles bleibt in Ihrem Browser.",
      it: "Crea un README di progetto o di profilo GitHub con un editor a blocchi e un'anteprima fedele a GitHub. Gratis, senza registrazione, tutto resta nel tuo browser.",
      pt: "Crie um README de projeto ou de perfil do GitHub com um editor de blocos e uma pré-visualização fiel ao GitHub. Grátis, sem registo, tudo fica no seu navegador.",
      ru: "Создайте README проекта или профиля GitHub в блочном редакторе с точным предпросмотром как на GitHub. Бесплатно, без регистрации, всё остаётся в браузере.",
      ja: "ブロックエディタとGitHubそっくりのプレビューで、プロジェクトやGitHubプロフィールのREADMEを作成。無料・登録不要、すべてブラウザ内で完結します。",
    },
  },
} satisfies Record<string, ToolMeta>;
```

- [ ] **Step 3: Ajouter le contenu SEO et la FAQ**

Modify `src/lib/tool-seo-content.ts` : remplacer

```ts
};

export function getToolContent(tool: ToolSlug, locale: string): ToolContent {
```

par l'entrée suivante, suivie du même texte :

```ts
  'readme-generator': {
    en: {
      heading: 'About the README Generator',
      intro:
        'This free README generator helps you write a project README or a GitHub profile README from reusable blocks. Add, reorder and edit sections in the editor, check the result in a GitHub-accurate preview, then copy or download the Markdown. Everything runs in your browser and your work is saved locally.',
      faq: [
        { q: 'Is my README sent to a server?', a: 'No. The editor runs entirely in your browser and saves your work in local storage on your device. You can also export it as a JSON file to continue on another computer.' },
        { q: 'Can I start without importing anything?', a: 'Yes. You can start from a blank editor and fill in each block by hand; nothing has to be imported.' },
        { q: 'Does the preview match what GitHub displays?', a: 'It is very close: GitHub Flavored Markdown, alerts such as [!NOTE], tables, code highlighting and common HTML like <picture> or align are supported. Unsafe HTML such as scripts is always removed, as on GitHub.' },
      ],
    },
    fr: {
      heading: 'À propos du générateur de README',
      intro:
        "Ce générateur de README gratuit vous aide à écrire le README d'un projet ou d'un profil GitHub à partir de blocs réutilisables. Ajoutez, réordonnez et modifiez les sections dans l'éditeur, vérifiez le résultat dans un aperçu fidèle à GitHub, puis copiez ou téléchargez le Markdown. Tout fonctionne dans votre navigateur et votre travail est enregistré localement.",
      faq: [
        { q: 'Mon README est-il envoyé à un serveur ?', a: "Non. L'éditeur fonctionne entièrement dans votre navigateur et enregistre votre travail dans le stockage local de votre appareil. Vous pouvez aussi l'exporter en fichier JSON pour le reprendre sur un autre ordinateur." },
        { q: 'Puis-je commencer sans rien importer ?', a: "Oui. Vous pouvez partir d'un éditeur vide et remplir chaque bloc à la main ; rien n'est à importer." },
        { q: "L'aperçu correspond-il à ce que GitHub affiche ?", a: "Il en est très proche : Markdown GitHub (GFM), alertes comme [!NOTE], tableaux, coloration du code et HTML courant comme <picture> ou align sont pris en charge. Le HTML dangereux, comme les scripts, est toujours retiré, comme sur GitHub." },
      ],
    },
    es: {
      heading: 'Acerca del generador de README',
      intro:
        'Este generador de README gratuito te ayuda a escribir el README de un proyecto o de un perfil de GitHub a partir de bloques reutilizables. Añade, reordena y edita secciones en el editor, comprueba el resultado en una vista previa fiel a GitHub y copia o descarga el Markdown. Todo funciona en tu navegador y tu trabajo se guarda localmente.',
      faq: [
        { q: '¿Se envía mi README a un servidor?', a: 'No. El editor funciona por completo en tu navegador y guarda tu trabajo en el almacenamiento local de tu dispositivo. También puedes exportarlo como archivo JSON para continuar en otro ordenador.' },
        { q: '¿Puedo empezar sin importar nada?', a: 'Sí. Puedes empezar con un editor vacío y rellenar cada bloque a mano; no hace falta importar nada.' },
        { q: '¿La vista previa coincide con lo que muestra GitHub?', a: 'Se parece mucho: se admiten Markdown de GitHub (GFM), alertas como [!NOTE], tablas, resaltado de código y HTML habitual como <picture> o align. El HTML peligroso, como los scripts, siempre se elimina, igual que en GitHub.' },
      ],
    },
    de: {
      heading: 'Über den README-Generator',
      intro:
        'Dieser kostenlose README-Generator hilft Ihnen, das README eines Projekts oder eines GitHub-Profils aus wiederverwendbaren Blöcken zu schreiben. Fügen Sie Abschnitte im Editor hinzu, ordnen Sie sie um und bearbeiten Sie sie, prüfen Sie das Ergebnis in einer GitHub-getreuen Vorschau und kopieren oder laden Sie das Markdown herunter. Alles läuft in Ihrem Browser, Ihre Arbeit wird lokal gespeichert.',
      faq: [
        { q: 'Wird mein README an einen Server gesendet?', a: 'Nein. Der Editor läuft vollständig in Ihrem Browser und speichert Ihre Arbeit im lokalen Speicher Ihres Geräts. Sie können sie auch als JSON-Datei exportieren, um auf einem anderen Computer weiterzuarbeiten.' },
        { q: 'Kann ich beginnen, ohne etwas zu importieren?', a: 'Ja. Sie können mit einem leeren Editor starten und jeden Block von Hand ausfüllen; es muss nichts importiert werden.' },
        { q: 'Entspricht die Vorschau dem, was GitHub anzeigt?', a: 'Sie kommt sehr nah heran: GitHub Flavored Markdown (GFM), Hinweise wie [!NOTE], Tabellen, Code-Hervorhebung und gängiges HTML wie <picture> oder align werden unterstützt. Gefährliches HTML wie Skripte wird immer entfernt, genau wie bei GitHub.' },
      ],
    },
    it: {
      heading: 'Informazioni sul generatore di README',
      intro:
        "Questo generatore di README gratuito ti aiuta a scrivere il README di un progetto o di un profilo GitHub a partire da blocchi riutilizzabili. Aggiungi, riordina e modifica le sezioni nell'editor, controlla il risultato in un'anteprima fedele a GitHub, poi copia o scarica il Markdown. Tutto funziona nel tuo browser e il tuo lavoro viene salvato localmente.",
      faq: [
        { q: 'Il mio README viene inviato a un server?', a: "No. L'editor funziona interamente nel tuo browser e salva il tuo lavoro nella memoria locale del dispositivo. Puoi anche esportarlo come file JSON per riprenderlo su un altro computer." },
        { q: 'Posso iniziare senza importare nulla?', a: "Sì. Puoi partire da un editor vuoto e compilare ogni blocco a mano; non c'è nulla da importare." },
        { q: "L'anteprima corrisponde a ciò che mostra GitHub?", a: "Ci si avvicina molto: sono supportati il Markdown di GitHub (GFM), gli avvisi come [!NOTE], le tabelle, l'evidenziazione del codice e l'HTML comune come <picture> o align. L'HTML pericoloso, come gli script, viene sempre rimosso, come su GitHub." },
      ],
    },
    pt: {
      heading: 'Sobre o gerador de README',
      intro:
        'Este gerador de README gratuito ajuda-o a escrever o README de um projeto ou de um perfil do GitHub a partir de blocos reutilizáveis. Adicione, reordene e edite secções no editor, confira o resultado numa pré-visualização fiel ao GitHub e copie ou transfira o Markdown. Tudo funciona no seu navegador e o seu trabalho fica guardado localmente.',
      faq: [
        { q: 'O meu README é enviado para um servidor?', a: 'Não. O editor funciona inteiramente no seu navegador e guarda o seu trabalho no armazenamento local do dispositivo. Também pode exportá-lo como ficheiro JSON para o retomar noutro computador.' },
        { q: 'Posso começar sem importar nada?', a: 'Sim. Pode começar com um editor vazio e preencher cada bloco à mão; não é preciso importar nada.' },
        { q: 'A pré-visualização corresponde ao que o GitHub mostra?', a: 'É muito próxima: são suportados o Markdown do GitHub (GFM), alertas como [!NOTE], tabelas, realce de código e HTML comum como <picture> ou align. O HTML perigoso, como scripts, é sempre removido, tal como no GitHub.' },
      ],
    },
    ru: {
      heading: 'О генераторе README',
      intro:
        'Этот бесплатный генератор README помогает написать README проекта или профиля GitHub из повторно используемых блоков. Добавляйте, переставляйте и редактируйте разделы в редакторе, проверяйте результат в предпросмотре, точном как на GitHub, а затем копируйте или скачивайте Markdown. Всё работает в вашем браузере, а ваша работа сохраняется локально.',
      faq: [
        { q: 'Отправляется ли мой README на сервер?', a: 'Нет. Редактор полностью работает в вашем браузере и сохраняет вашу работу в локальном хранилище устройства. Вы также можете экспортировать её в файл JSON, чтобы продолжить на другом компьютере.' },
        { q: 'Можно ли начать, ничего не импортируя?', a: 'Да. Можно начать с пустого редактора и заполнить каждый блок вручную; импортировать ничего не нужно.' },
        { q: 'Совпадает ли предпросмотр с тем, что показывает GitHub?', a: 'Очень близко: поддерживаются Markdown GitHub (GFM), уведомления вроде [!NOTE], таблицы, подсветка кода и распространённый HTML, например <picture> или align. Опасный HTML, такой как скрипты, всегда удаляется — так же, как на GitHub.' },
      ],
    },
    ja: {
      heading: 'README生成ツールについて',
      intro:
        'この無料ツールは、再利用できるブロックを組み合わせて、プロジェクトやGitHubプロフィールのREADMEを作成できます。エディタでセクションを追加・並べ替え・編集し、GitHubそっくりのプレビューで確認してから、Markdownをコピーまたはダウンロードできます。すべてブラウザ内で動作し、作業内容は端末に保存されます。',
      faq: [
        { q: 'READMEはサーバーに送信されますか？', a: 'いいえ。エディタはすべてブラウザ内で動作し、作業内容は端末のローカルストレージに保存されます。JSONファイルとして書き出せば、別のパソコンで続きから作業できます。' },
        { q: '何もインポートせずに始められますか？', a: 'はい。空のエディタから始めて、各ブロックを手で入力できます。インポートは必要ありません。' },
        { q: 'プレビューはGitHubの表示と同じですか？', a: 'とても近い表示になります。GitHub Flavored Markdown（GFM）、[!NOTE]などのアラート、表、コードのハイライト、<picture>やalignなどの一般的なHTMLに対応しています。スクリプトなど危険なHTMLは、GitHubと同様に常に取り除かれます。' },
      ],
    },
  },
};

export function getToolContent(tool: ToolSlug, locale: string): ToolContent {
```

- [ ] **Step 4: Enregistrer l'outil dans la navigation (désactivé)**

Modify `src/lib/tools.ts`. Remplacer la ligne d'import

```ts
import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText, Edit3, QrCode, Minus, Terminal } from '@/components/icons';
```

par

```ts
import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText, Edit3, QrCode, Minus, Terminal, FileCode } from '@/components/icons';
```

Puis remplacer

```ts
    nameKey: 'treeToCommands',
  },
];
```

par

```ts
    nameKey: 'treeToCommands',
  },
  {
    id: 'readme-generator',
    href: '/tools/readme-generator',
    icon: FileCode,
    nameKey: 'readmeGenerator',
    comingSoon: true,
  },
];
```

- [ ] **Step 5: Créer la page (non indexée)**

Create `src/app/[locale]/tools/readme-generator/page.tsx` :

```tsx
import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { ReadmeGenerator } from '@/components/readme-generator/readme-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // Hidden from search engines until the profile mode ships (plan 3).
  return { ...buildToolMetadata('readme-generator', locale), robots: { index: false, follow: false } };
}

export default async function ReadmeGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <ReadmeGenerator />
      <AdSlot slot="readme-generator-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="readme-generator" locale={locale} />
    </>
  );
}
```

- [ ] **Step 6: Vérifier**

Run: `npx vitest run && npx tsc --noEmit && npm run lint`
Expected: tous les tests passent (dont `tests/seo/readme-generator-seo.test.ts`, 8 + 7 cas) ; aucune erreur de types ni de lint.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tools.ts src/lib/seo-config.ts src/lib/tool-seo-content.ts "src/app/[locale]/tools/readme-generator/page.tsx" tests/seo/readme-generator-seo.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): enregistre la route, le contenu SEO et l'entrée de navigation

Page non indexée et entrée « Bientôt » tant que le mode profil n'est
pas livré ; métadonnées et FAQ localisées dans les 8 langues.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Documentation du dépôt et vérification finale

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: tout le plan.
- Produces : une base vérifiée et documentée pour les plans 2 et 3.

- [ ] **Step 1: Corriger et compléter `CLAUDE.md`**

Modify `CLAUDE.md`, section `## Commands` : dans le bloc de commandes, ajouter après la ligne `npm run lint     # Run ESLint` la ligne suivante :

```
npm test         # Run vitest once
```

Puis remplacer la phrase `No test framework is configured.` par :

```
Tests use vitest (`tests/**/*.test.ts`, Node environment): pure logic under `src/lib/` is tested; React components are not.
```

Puis, dans le tableau « Key files », ajouter après la ligne `src/lib/validation.ts` :

```
| [src/lib/readme/](src/lib/readme/) | README generator core: block registry, pure Markdown generation, validation, persistence |
| [src/components/readme-generator/](src/components/readme-generator/) | README generator UI (state container, block list, preview) |
```

- [ ] **Step 2: Lancer toute la suite de vérifications**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: tests verts, aucune erreur de types, lint propre, build de production réussi (la route `/[locale]/tools/readme-generator` figure dans la liste des routes).

- [ ] **Step 3: Contrôle manuel dans le navigateur**

Run: `npm run dev`, puis ouvrir `http://localhost:3000/fr/tools/readme-generator`.

Vérifier, dans l'ordre :
1. La page se charge avec un bloc « En-tête » et un aperçu vide.
2. Saisir un titre et une accroche : l'aperçu affiche `# titre` rendu et le texte.
3. « Ajouter un bloc » propose En-tête (désactivé, déjà présent) et Markdown libre ; en ajouter deux.
4. Dans un bloc libre, coller `> [!NOTE]\n> Test` : l'alerte colorée s'affiche ; coller `<script>alert(1)</script>` : rien ne s'exécute et aucun `<script>` n'apparaît.
5. Glisser un bloc au-dessus d'un autre, puis utiliser les flèches ↑ / ↓ : l'ordre change dans la liste et dans l'aperçu.
6. Désactiver un bloc avec l'interrupteur : son contenu disparaît de l'aperçu.
7. Coller `![](a.png)` dans un bloc libre : un avertissement « Images sans texte alternatif » apparaît sous le nom du bloc.
8. Recharger la page : le contenu est conservé.
9. « Exporter (JSON) », « Réinitialiser », puis « Importer (JSON) » avec le fichier : l'état revient.
10. Passer en « Profil GitHub » : le bloc En-tête est retiré et un message l'indique.
11. Réduire la fenêtre sous 1024 px : les onglets Blocs / Aperçu apparaissent.
12. Changer la langue dans le sélecteur : les libellés changent et la page ne plante pas.
13. Dans la barre latérale : « Générateur de README » est grisé (« Bientôt »).

Expected: les 13 points conformes. Arrêter le serveur ensuite.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: corrige la section tests du CLAUDE.md et référence le générateur de README

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Suite : plans 2 et 3

Ce plan livre un outil fonctionnel mais volontairement caché. Les plans suivants s'appuient sur le contrat d'extension décrit plus haut.

- **Plan 2 (mode Projet)** : catalogue projet complet (badges, preuve visuelle, table des matières, installation, utilisation, architecture, contribution, licence, alerte), wizard en cinq étapes avec « Partir de zéro » mis en avant, extraction facultative (`package.json`, `Cargo.toml`, `pyproject.toml`, URL GitHub), règle « plus de 5 badges ».
- **Plan 3 (mode Profil et ouverture)** : catalogue profil (bannière, bio, compétences, statistiques avec URL de base réglable, trophées, blog, contact), thème global, workflow blog épinglé, avertissements de fragilité des services tiers ; puis retrait de `comingSoon` et de `noindex`, ajout à la vitrine d'accueil (`tools-showcase.tsx`) et au sitemap, entrée `CHANGELOG.md` / `changelog.ts`, version 2.5.0.
