# Générateur de README — Plan 2 : mode Projet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter le mode Projet du générateur de README : catalogue de blocs complet, assistant en cinq étapes (avec « Partir de zéro » mis en avant), extraction facultative de métadonnées (fichiers manifest et URL GitHub), langue du README, couleur d'accent des badges.

**Architecture:** On étend le registre de blocs du plan 1 : neuf nouveaux modules dans `src/lib/readme/blocks/`, tous purs et testés sous `vitest`. L'extraction (`extract.ts`, `github.ts`) est elle aussi pure, avec `fetch` injectable. L'interface ajoute les formulaires des blocs, un assistant (`readme-wizard.tsx`) et un panneau d'extraction, branchés sur le même conteneur d'état.

**Tech Stack:** identique au plan 1 (Next.js 16, React 19, TypeScript strict, Zod 4, next-intl 4, vitest 4). Aucune nouvelle dépendance.

**Spec:** `docs/superpowers/specs/2026-09-24-readme-generator-design.md` (sections 5, 6, 7 et 13, plan 2). Plan précédent : `docs/superpowers/plans/2026-09-24-readme-generator-plan-1-socle.md`.

**Périmètre :** catalogue Projet, assistant, extraction. Hors périmètre (plan 3) : catalogue Profil, bloc Blog et workflow, ouverture publique (retrait de `noindex` et de `comingSoon`, vitrine d'accueil, sitemap, changelog, version 2.5.0).

**Écarts assumés par rapport à la spec** (chacun est un choix, pas un oubli) :
- L'extraction GitHub n'appelle que `GET /repos/{owner}/{repo}`. `/languages` est écarté : aucun bloc du catalogue n'utilise les langages, et chaque appel consomme une partie des 60 requêtes horaires sans jeton.
- L'étape « Style » de l'assistant se limite à une **couleur d'accent** appliquée à tous les badges. Le thème global des cartes de statistiques arrive avec le mode Profil (plan 3).
- Les champs sur **une seule ligne** (titre, accroche, intitulés, éléments de liste) sont du **texte brut** : ils sont échappés à la génération et s'affichent tels quels. Les champs **multi-lignes** (description, contenu, texte) sont du **Markdown** brut, assaini à l'aperçu. Cela répond au mineur n° 7 de la revue du plan 1 : une valeur extraite d'un fichier ne peut plus injecter de Markdown ou de HTML.

## Global Constraints

- Aucune chaîne visible par l'utilisateur en dur dans les composants : tout passe par `useTranslations('readmeGenerator')`, avec les 8 locales `fr`, `en`, `es`, `de`, `it`, `pt`, `ru`, `ja`.
- Le texte produit **dans le README** (intitulés « Installation », phrase de licence…) vient de `DEFAULT_TEXTS` (`src/lib/readme/default-texts.ts`) selon `meta.language`, jamais de next-intl : la langue du README est indépendante de celle de l'interface.
- Pas de backend. Le seul appel réseau est `GET https://api.github.com/repos/{owner}/{repo}`, déclenché par un clic de l'utilisateur, jamais automatiquement.
- Les fichiers importés restent dans le navigateur (lus avec `File.text()`), taille limitée à 1 000 000 octets.
- Toute regex appliquée à du texte utilisateur doit être **sans retour arrière quadratique** (leçon du plan 1) : chaque tâche qui en ajoute a un test de durée sur l'entrée maximale.
- Chaque donnée qu'un bloc reçoit d'une source externe (`meta`) doit rester **valide pour son propre schéma** : `META_LIMITS` est la source unique des longueurs, et le test de contrat du registre le vérifie pour chaque bloc.
- `generateReadme` reste pure ; l'aperçu rend exactement sa sortie.
- Aucune nouvelle dépendance. TypeScript strict, Zod 4, alias `@/*` → `src/*`.
- `vitest` ne lance que `tests/**/*.test.ts` en environnement `node` : la logique testable reste dans `src/lib/readme/`.
- Messages de commit en français, terminés par `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Contrat d'extension du registre (défini au plan 1) : un nouveau bloc = un module dans `blocks/`, un littéral dans `BlockType`, une entrée dans `DEFINITIONS` (`registry.ts`), un cas dans `BlockForm` (`block-forms.tsx`) et les clés `blocks.<type>` dans les 8 locales.

## Review Focus

Entrées que la spec implique sans que les tâches nominales les couvrent ; chacune a son test dans la tâche indiquée.

1. Texte hostile ou ambigu dans un champ sur une seule ligne (`<!-- wip`, `1. Rapide`, `---`, `Lib #`, `*gras*`, `&copy;`) : il s'affiche tel quel et n'avale jamais les blocs suivants. Test : Tâche 1 (aller-retour par le vrai rendu).
2. Fichier manifest atypique (JSON invalide, JSON qui n'est pas un objet, TOML avec chaînes multi-lignes ou tableaux de tables, valeurs qui ne sont pas des chaînes, valeurs de plus de 100 000 caractères) : l'extraction renvoie une erreur ou ignore le champ, ne lève jamais d'exception et respecte `META_LIMITS`. Test : Tâche 8.
3. URL et réponses GitHub anormales (`github.com/../x`, `owner/repo` avec des points, limite de débit 403 avec `x-ratelimit-remaining: 0`, 404, JSON invalide, réponse sans `name`, `fetch` qui rejette) : chaque cas a un code d'erreur précis et aucun ne bloque l'assistant. Test : Tâche 9.
4. Code contenant lui-même des barrières de code (```` ``` ````) ou un langage saisi avec espaces et retours à la ligne, dans Usage et Installation : la barrière s'allonge, l'info-string reste sûre, et la détection de code du validateur comprend les barrières de plus de trois accents graves. Test : Tâches 1 et 4.
5. Valeurs de `meta` à leur longueur maximale, puis blocs créés à partir d'elles : aucun bloc ne doit échouer à son propre schéma, sinon il disparaîtrait au rechargement. Test : Tâche 2 (contrat du registre, étendu à chaque nouveau bloc).

En plus : intitulés en double et non ASCII dans la table des matières (Tâche 6) ; annulation après application de l'assistant sur une base existante (Tâche 11).

---

## Structure des fichiers

```
src/lib/readme/
  markdown-utils.ts       + escapeMarkdownText, codeFence, atxHeading, nonEmptyLines
  markdown-checks.ts      + linesOutsideFences (barrières de longueur variable)
  default-texts.ts        DEFAULT_TEXTS par langue du README, getDefaultText
  headings.ts             extractH2, githubSlug, githubSlugs
  shields.ts              shieldsText, shieldsBadgeUrl
  extract.ts              parseurs de manifest, parseGithubUrl, mergeMeta
  github.ts               fetchGithubMeta (fetch injectable)
  blocks/badges.ts, visual-proof.ts, table-of-contents.ts, installation.ts,
         usage.ts, architecture.ts, contributing.ts, license.ts, alert.ts
  (modifiés) types.ts, defaults.ts, block-definition.ts, registry.ts, generate.ts,
             state.ts, persistence.ts, blocks/header.ts
src/components/readme-generator/
  block-forms.tsx         (réécrit) onze formulaires
  readme-wizard.tsx       assistant en cinq étapes
  extraction-panel.tsx    import de fichier et URL GitHub
  (modifiés) readme-generator.tsx, readme-toolbar.tsx
tests/readme/             escape-roundtrip, default-texts, blocks-content, blocks-extra,
                          toc, extract, github + extensions des tests existants
tests/i18n/readme-generator-wizard-locales.test.ts
```

---

### Task 1: Texte sûr, barrières de code et titres

**Files:**
- Modify: `src/lib/readme/markdown-utils.ts`, `src/lib/readme/markdown-checks.ts`, `src/lib/readme/blocks/header.ts`
- Test: `tests/readme/markdown-utils.test.ts`, `tests/readme/markdown-checks.test.ts`, `tests/readme/generate.test.ts`, `tests/readme/escape-roundtrip.test.ts`

**Interfaces:**
- Consumes: `singleLine`, `normalizeNewlines`, `escapeAlt`, `safeUrl` (déjà dans `markdown-utils.ts`).
- Produces (utilisés par toutes les tâches de blocs) :
  - `escapeMarkdownText(text: string): string` : texte brut sur une ligne, échappé pour s'afficher tel quel.
  - `codeFence(code: string, language?: string): string` : bloc de code dont la barrière est plus longue que toute suite d'accents graves du code ; info-string réduite à `[A-Za-z0-9_+#.-]`.
  - `atxHeading(level: 1 | 2 | 3, text: string): string` : `## Texte` échappé, ou `''` si le texte est vide.
  - `nonEmptyLines(text: string): string[]` : lignes non vides, rognées.
  - `linesOutsideFences(markdown: string): string[]` (dans `markdown-checks.ts`) : lignes hors barrières de code.

- [ ] **Step 1: Écrire les tests qui échouent**

Modify `tests/readme/markdown-utils.test.ts` : changer la ligne d'import et ajouter, à la fin du fichier, les blocs suivants.

```ts
import { atxHeading, codeFence, escapeAlt, escapeMarkdownText, nonEmptyLines, normalizeNewlines, safeUrl, singleLine } from '@/lib/readme/markdown-utils';
```

```ts
describe('escapeMarkdownText', () => {
  it.each([
    ['<!-- wip', '\\<!-- wip'],
    ['1. Fast', '1\\. Fast'],
    ['2026) done', '2026\\) done'],
    ['---', '\\---'],
    ['Lib #', 'Lib \\#'],
    ['C#', 'C#'],
    ['# title', '\\# title'],
    ['> quote', '\\> quote'],
    ['+ item', '\\+ item'],
    ['*bold* and `code`', '\\*bold\\* and \\`code\\`'],
    ['_private', '\\_private'],
    ['snake_case_name', 'snake_case_name'],
    ['a _b_ c', 'a \\_b\\_ c'],
    ['[link](x)', '\\[link\\](x)'],
    ['&copy; 2026', '\\&copy; 2026'],
    ['R&D', 'R&D'],
    ['a | b', 'a \\| b'],
    ['1.5 version', '1.5 version'],
  ])('escapes %j as %j', (input, expected) => {
    expect(escapeMarkdownText(input)).toBe(expected);
  });

  it('flattens line breaks and trims', () => {
    expect(escapeMarkdownText('  a\r\nb  ')).toBe('a b');
  });
});

describe('codeFence', () => {
  it('wraps code in a three-backtick fence with its language', () => {
    expect(codeFence('npm start', 'bash')).toBe('```bash\nnpm start\n```');
  });

  it('uses a fence longer than any backtick run inside the code', () => {
    expect(codeFence('a\n```\nb', '')).toBe('````\na\n```\nb\n````');
    expect(codeFence('x ````` y')).toBe('``````\nx ````` y\n``````');
  });

  it('keeps only safe characters in the info string', () => {
    expect(codeFence('x', 'js x\n`')).toBe('```jsx\nx\n```');
  });

  it('drops leading blank lines and trailing whitespace but keeps indentation', () => {
    expect(codeFence('\n\n  a\n  b  \n\n')).toBe('```\n  a\n  b\n```');
  });
});

describe('atxHeading', () => {
  it('builds an escaped heading', () => {
    expect(atxHeading(2, '1. Start')).toBe('## 1\\. Start');
    expect(atxHeading(3, 'Q&A')).toBe('### Q&A');
  });

  it('returns an empty string for blank text', () => {
    expect(atxHeading(2, '  \n ')).toBe('');
  });
});

describe('nonEmptyLines', () => {
  it('returns trimmed non-empty lines', () => {
    expect(nonEmptyLines(' a \r\n\n  \n b')).toEqual(['a', 'b']);
  });
});

// These helpers also run on values read from imported files, so none may
// backtrack on a long run of whitespace.
describe('linear-time guarantees on long whitespace', () => {
  it.each([
    ['singleLine', (text: string) => singleLine(text)],
    ['escapeAlt', (text: string) => escapeAlt(text)],
    ['escapeMarkdownText', (text: string) => escapeMarkdownText(text)],
    ['codeFence', (text: string) => codeFence(text)],
  ])('%s handles 100,000 spaces between two letters', (_name, run) => {
    const text = 'a' + ' '.repeat(100_000) + 'b';
    const start = performance.now();
    run(text);
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe('singleLine', () => {
  it('collapses blank lines and whitespace around line breaks', () => {
    expect(singleLine('a \n\n\t b')).toBe('a b');
    expect(singleLine('a   b')).toBe('a   b');
  });
});
```

Modify `tests/readme/markdown-checks.test.ts` : ajouter dans `describe('countImagesMissingAlt', …)` le test suivant.

```ts
  it('understands fences longer than three backticks', () => {
    const md = '````md\n```\n![](i1.png)\n![](i2.png)\n```\n````\n![](outer.png)';
    expect(countImagesMissingAlt(md)).toBe(1);
  });
```

Modify `tests/readme/generate.test.ts` : ajouter dans `describe('generateReadme', …)` le test suivant.

```ts
  it('renders header text literally: an HTML comment opener cannot hide the blocks after it', () => {
    const state = stateWith([header('h', { tagline: '<!-- wip' }), freeMarkdown('f', '## Install')]);
    expect(generateReadme(state)).toBe('\\<!-- wip\n\n## Install\n');
  });

  it('escapes block-start characters in the title and tagline', () => {
    const state = stateWith([header('h', { title: '1. Demo #', tagline: '- fast' })]);
    expect(generateReadme(state)).toBe('# 1\\. Demo \\#\n\n\\- fast\n');
  });
```

Create `tests/readme/escape-roundtrip.test.ts` :

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { describe, expect, it } from 'vitest';
import { escapeMarkdownText } from '@/lib/readme/markdown-utils';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, README_MARKDOWN_PROPS, markdown));
}

// Whatever a user types in a single-line field, the real Markdown renderer
// must show exactly that text, as one paragraph and nothing else.
const SAMPLES = [
  '<!-- wip', '<script>alert(1)</script>', '<b>x</b>', '1. Fast', '2026) done', '---', '- - -', '===',
  'Lib #', 'C#', '#hashtag', '# title', '## two', '> quote', '+ item', '- item', '-x', '*bold*', '**', '***',
  '_private', 'foo_', '___', 'a_b_c', 'a _b_ c', '`code`', '~~strike~~', '[link](x)', '![img](u)', '[x]',
  '&copy; 2026', '&#35;', 'R&D', 'A & B', 'a | b', 'Dr. Who?', '1.5 version', '\\', 'back\\slash', '2*3=6',
];

describe('escapeMarkdownText renders literally', () => {
  it.each(SAMPLES)('%j', (sample) => {
    expect(render(escapeMarkdownText(sample))).toBe(`<p>${escapeHtml(sample)}</p>`);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/markdown-utils.test.ts tests/readme/markdown-checks.test.ts tests/readme/generate.test.ts tests/readme/escape-roundtrip.test.ts`
Expected: FAIL. Les importations `escapeMarkdownText`, `codeFence`, `atxHeading`, `nonEmptyLines` sont `undefined`, le test des barrières longues compte 2 au lieu de 1, les deux tests d'en-tête reçoivent le texte non échappé, et le test de durée sur 100 000 espaces échoue pour `singleLine` et `escapeAlt` (plusieurs secondes avec l'ancienne regex).

- [ ] **Step 3: Implémenter les utilitaires**

Modify `src/lib/readme/markdown-utils.ts` : remplacer d'abord la fonction `singleLine` du plan 1 (sa regex `\s*\n\s*` est quadratique sur un long espace sans retour à la ligne) par une version linéaire, de même comportement.

```ts
/** Collapses any run of whitespace containing a line break into one space. */
export function singleLine(text: string): string {
  return normalizeNewlines(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');
}
```

Puis ajouter à la fin du fichier.

```ts
const WORD_CHARACTER = new RegExp('[\\p{L}\\p{N}]', 'u');

/**
 * Escapes one line of plain text so Markdown renders it literally: no emphasis,
 * links, raw HTML or comments, and no block syntax (heading, list, quote, rule).
 * Underscores inside a word are left alone, since CommonMark does not treat
 * them as emphasis.
 */
export function escapeMarkdownText(text: string): string {
  return singleLine(text)
    .replace(/[\\`*[\]<>|~]/g, '\\$&')
    .replace(/_/g, (match, offset: number, whole: string) => {
      const before = whole[offset - 1];
      const after = whole[offset + 1];
      const insideWord =
        before !== undefined && WORD_CHARACTER.test(before) && after !== undefined && WORD_CHARACTER.test(after);
      return insideWord ? match : '\\_';
    })
    .replace(/&(?=#?[A-Za-z0-9]+;)/g, '\\&')
    .replace(/(\s)(#+)$/, '$1\\$2')
    .replace(/^(#{1,6})(?=\s|$)/, '\\$1')
    .replace(/^([-+])(?=[\s-]|$)/, '\\$1')
    .replace(/^(\d+)([.)])(?=\s|$)/, '$1\\$2');
}

/**
 * A fenced code block. The fence is longer than the longest run of backticks in
 * the code, and the info string keeps only characters that cannot break out.
 */
export function codeFence(code: string, language = ''): string {
  const body = normalizeNewlines(code).replace(/^\n+/, '').trimEnd();
  const longestRun = (body.match(/`+/g) ?? []).reduce((longest, run) => Math.max(longest, run.length), 0);
  const fence = '`'.repeat(Math.max(3, longestRun + 1));
  const info = language.replace(/[^A-Za-z0-9_+#.-]/g, '');
  return `${fence}${info}\n${body}\n${fence}`;
}

/** ATX heading from plain text, or '' when the text is blank. */
export function atxHeading(level: 1 | 2 | 3, text: string): string {
  const plain = escapeMarkdownText(text);
  return plain === '' ? '' : `${'#'.repeat(level)} ${plain}`;
}

export function nonEmptyLines(text: string): string[] {
  return normalizeNewlines(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}
```

- [ ] **Step 4: Rendre la détection de code sensible à la longueur des barrières**

Modify `src/lib/readme/markdown-checks.ts` : remplacer la fonction `stripCode` par les deux fonctions suivantes.

```ts
/**
 * Lines that are not inside a fenced code block. A fence closes only on a line
 * made of the same character, at least as long as the opening one.
 */
export function linesOutsideFences(markdown: string): string[] {
  const kept: string[] = [];
  let open: { char: string; length: number } | null = null;
  for (const line of markdown.split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (open === null) {
      if (marker) {
        open = { char: marker[1][0], length: marker[1].length };
        continue;
      }
      kept.push(line);
    } else if (
      marker &&
      marker[1][0] === open.char &&
      marker[1].length >= open.length &&
      line.slice(marker[0].length).trim() === ''
    ) {
      open = null;
    }
  }
  return kept;
}

/** Removes fenced and inline code so their content is never analyzed. */
function stripCode(markdown: string): string {
  return linesOutsideFences(markdown)
    .map((line) => line.replace(/`[^`\n]*`/g, ''))
    .join('\n');
}
```

- [ ] **Step 5: Échapper le texte de l'en-tête**

Modify `src/lib/readme/blocks/header.ts` : remplacer l'import et la fonction `toMarkdown`.

```ts
import { atxHeading, escapeAlt, escapeMarkdownText, safeUrl } from '../markdown-utils';
```

```ts
  toMarkdown: (data) => {
    const logo = safeUrl(data.logoUrl);
    const lines: string[] = [];
    if (logo) lines.push(`![${escapeAlt(data.logoAlt) || escapeAlt(data.title) || 'Logo'}](${logo})`);
    lines.push(atxHeading(1, data.title), escapeMarkdownText(data.tagline));
    return lines.filter((line) => line !== '').join('\n\n');
  },
```

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS (les tests existants du plan 1 restent verts) ; aucune erreur de types. Si `tsc` signale une syntaxe de regex non disponible pour la cible `ES2017`, ne pas modifier `tsconfig.json` : les regex Unicode sont déjà construites avec `new RegExp('…', 'u')` dans `escapeMarkdownText` pour cette raison.

- [ ] **Step 7: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute l'échappement du texte brut et les barrières de code

escapeMarkdownText (vérifié par aller-retour dans le vrai rendu),
codeFence à barrière adaptative, atxHeading et nonEmptyLines. La
détection de code du validateur comprend les barrières de plus de trois
accents graves. L'en-tête n'émet plus son texte comme du Markdown brut.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Langue du README, textes par défaut et contrat des blocs

**Files:**
- Create: `src/lib/readme/default-texts.ts`
- Modify: `src/lib/readme/types.ts`, `src/lib/readme/defaults.ts`, `src/lib/readme/block-definition.ts`, `src/lib/readme/persistence.ts`
- Test: `tests/readme/default-texts.test.ts`, `tests/readme/persistence.test.ts`, `tests/readme/registry.test.ts`

**Interfaces:**
- Consumes: `locales`, `Locale` (`@/i18n/locales`).
- Produces :
  - `types.ts` : `ReadmeLanguage = Locale` ; `ReadmeMeta` gagne `installCommand: string` et `language: ReadmeLanguage` ; `GenerateContext` gagne `headings?: string[]` (intitulés de niveau 2 des autres blocs, pour la table des matières).
  - `defaults.ts` : `EMPTY_META` gagne `installCommand: ''` et `language: 'en'` ; `META_LIMITS` gagne `installCommand: 300`.
  - `default-texts.ts` : `TextKey`, `DEFAULT_TEXTS: Record<ReadmeLanguage, Record<TextKey, string>>`, `getDefaultText(language: ReadmeLanguage, key: TextKey): string`.
  - `block-definition.ts` : `BlockDefinition` et `AnyBlockDefinition` gagnent `recommended: boolean` (optionnel dans `BlockDefinition`, défaut `false`) et `usesHeadings: boolean` (optionnel dans `BlockDefinition`, défaut `false`).
  - `persistence.ts` : l'enveloppe accepte un fichier sans `installCommand` ni `language` (valeurs par défaut `''` et `'en'`), donc les fichiers du plan 1 restent lisibles.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `tests/readme/default-texts.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/locales';
import { DEFAULT_TEXTS, getDefaultText, type TextKey } from '@/lib/readme/default-texts';

const KEYS: TextKey[] = [
  'toc', 'installation', 'prerequisites', 'usage', 'architecture', 'roadmap',
  'contributing', 'license', 'acknowledgements', 'screenshot', 'licenseSentence',
];

describe('default README texts', () => {
  it.each(locales)('%s has every key, non-empty', (language) => {
    for (const key of KEYS) {
      expect(DEFAULT_TEXTS[language][key].trim().length, `${language}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s license sentence carries the {license} placeholder', (language) => {
    expect(DEFAULT_TEXTS[language].licenseSentence).toContain('{license}');
  });

  it('returns the text of the requested language', () => {
    expect(getDefaultText('fr', 'installation')).toBe('Installation');
    expect(getDefaultText('fr', 'prerequisites')).toBe('Prérequis');
  });

  it('falls back to English for an unknown language', () => {
    expect(getDefaultText('xx' as never, 'usage')).toBe('Usage');
  });
});
```

Modify `tests/readme/persistence.test.ts` : ajouter dans `describe('parseReadmeState', …)` les deux tests suivants.

```ts
  it('accepts a file saved before meta.language and meta.installCommand existed', () => {
    const legacyMeta = { name: '', description: '', author: '', license: '', repoUrl: '' };
    const result = parseReadmeState(fileWith({ meta: legacyMeta }));
    expect(result.ok && result.state.meta).toEqual({ ...legacyMeta, installCommand: '', language: 'en' });
  });

  it('rejects an unknown README language and an install command that is too long', () => {
    const meta = { ...EMPTY_META };
    expect(parseReadmeState(fileWith({ meta: { ...meta, language: 'xx' } })).ok).toBe(false);
    expect(parseReadmeState(fileWith({ meta: { ...meta, installCommand: 'x'.repeat(301) } })).ok).toBe(false);
  });
```

Modify `tests/readme/registry.test.ts` : remplacer la constante `maximalMeta` par la suivante (les deux nouveaux champs sont obligatoires pour le typage).

```ts
const maximalMeta: ReadmeMeta = {
  name: 'x'.repeat(META_LIMITS.name),
  description: 'x'.repeat(META_LIMITS.description),
  author: 'x'.repeat(META_LIMITS.author),
  license: 'x'.repeat(META_LIMITS.license),
  repoUrl: 'x'.repeat(META_LIMITS.repoUrl),
  installCommand: 'x'.repeat(META_LIMITS.installCommand),
  language: 'fr',
};
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/default-texts.test.ts tests/readme/persistence.test.ts tests/readme/registry.test.ts`
Expected: FAIL (`default-texts` introuvable ; `META_LIMITS.installCommand` est `undefined` donc `'x'.repeat(undefined)` donne `''` sans échec, mais le test `persistence` sur `installCommand` de 301 caractères et le test `language` échouent).

- [ ] **Step 3: Étendre les types et les valeurs par défaut**

Replace `src/lib/readme/types.ts` par :

```ts
import type { Locale } from '@/i18n/locales';

export type ReadmeMode = 'project' | 'profile';

/** Language of the generated README, independent of the interface language. */
export type ReadmeLanguage = Locale;

/** Extended by later tasks: add the literal here and an entry in `registry.ts`. */
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
  installCommand: string;
  language: ReadmeLanguage;
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

export type WarningCode = 'imageMissingAlt' | 'htmlTagMismatch' | 'layoutTable';

export interface BlockWarning {
  code: WarningCode;
  params?: Record<string, string | number>;
}

export interface ValidationWarning extends BlockWarning {
  blockId: string;
}
```

Replace `src/lib/readme/defaults.ts` par :

```ts
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
```

- [ ] **Step 4: Créer les textes par défaut**

Create `src/lib/readme/default-texts.ts` :

```ts
import type { ReadmeLanguage } from './types';

export type TextKey =
  | 'toc'
  | 'installation'
  | 'prerequisites'
  | 'usage'
  | 'architecture'
  | 'roadmap'
  | 'contributing'
  | 'license'
  | 'acknowledgements'
  | 'screenshot'
  | 'licenseSentence';

/**
 * Text that ends up inside the generated README (section headings, the license
 * sentence). It follows `meta.language`, not the interface language, so it lives
 * here rather than in the next-intl messages. `{license}` is replaced at render.
 */
export const DEFAULT_TEXTS: Record<ReadmeLanguage, Record<TextKey, string>> = {
  fr: {
    toc: 'Table des matières',
    installation: 'Installation',
    prerequisites: 'Prérequis',
    usage: 'Utilisation',
    architecture: 'Architecture',
    roadmap: 'Feuille de route',
    contributing: 'Contribuer',
    license: 'Licence',
    acknowledgements: 'Remerciements',
    screenshot: "Capture d'écran",
    licenseSentence: "Distribué sous licence {license}. Voir [LICENSE](LICENSE) pour plus d'informations.",
  },
  en: {
    toc: 'Table of contents',
    installation: 'Installation',
    prerequisites: 'Prerequisites',
    usage: 'Usage',
    architecture: 'Architecture',
    roadmap: 'Roadmap',
    contributing: 'Contributing',
    license: 'License',
    acknowledgements: 'Acknowledgements',
    screenshot: 'Screenshot',
    licenseSentence: 'Distributed under the {license} license. See [LICENSE](LICENSE) for more information.',
  },
  es: {
    toc: 'Tabla de contenidos',
    installation: 'Instalación',
    prerequisites: 'Requisitos previos',
    usage: 'Uso',
    architecture: 'Arquitectura',
    roadmap: 'Hoja de ruta',
    contributing: 'Contribuir',
    license: 'Licencia',
    acknowledgements: 'Agradecimientos',
    screenshot: 'Captura de pantalla',
    licenseSentence: 'Distribuido bajo la licencia {license}. Consulta [LICENSE](LICENSE) para más información.',
  },
  de: {
    toc: 'Inhaltsverzeichnis',
    installation: 'Installation',
    prerequisites: 'Voraussetzungen',
    usage: 'Verwendung',
    architecture: 'Architektur',
    roadmap: 'Roadmap',
    contributing: 'Mitwirken',
    license: 'Lizenz',
    acknowledgements: 'Danksagungen',
    screenshot: 'Screenshot',
    licenseSentence: 'Veröffentlicht unter der {license}-Lizenz. Weitere Informationen in [LICENSE](LICENSE).',
  },
  it: {
    toc: 'Indice',
    installation: 'Installazione',
    prerequisites: 'Prerequisiti',
    usage: 'Utilizzo',
    architecture: 'Architettura',
    roadmap: 'Roadmap',
    contributing: 'Contribuire',
    license: 'Licenza',
    acknowledgements: 'Ringraziamenti',
    screenshot: 'Schermata',
    licenseSentence: 'Distribuito con licenza {license}. Vedi [LICENSE](LICENSE) per maggiori informazioni.',
  },
  pt: {
    toc: 'Índice',
    installation: 'Instalação',
    prerequisites: 'Pré-requisitos',
    usage: 'Utilização',
    architecture: 'Arquitetura',
    roadmap: 'Roteiro',
    contributing: 'Contribuir',
    license: 'Licença',
    acknowledgements: 'Agradecimentos',
    screenshot: 'Captura de ecrã',
    licenseSentence: 'Distribuído sob a licença {license}. Consulte [LICENSE](LICENSE) para mais informações.',
  },
  ru: {
    toc: 'Содержание',
    installation: 'Установка',
    prerequisites: 'Требования',
    usage: 'Использование',
    architecture: 'Архитектура',
    roadmap: 'Дорожная карта',
    contributing: 'Участие в разработке',
    license: 'Лицензия',
    acknowledgements: 'Благодарности',
    screenshot: 'Снимок экрана',
    licenseSentence: 'Распространяется по лицензии {license}. Подробности см. в [LICENSE](LICENSE).',
  },
  ja: {
    toc: '目次',
    installation: 'インストール',
    prerequisites: '前提条件',
    usage: '使い方',
    architecture: 'アーキテクチャ',
    roadmap: 'ロードマップ',
    contributing: 'コントリビューション',
    license: 'ライセンス',
    acknowledgements: '謝辞',
    screenshot: 'スクリーンショット',
    licenseSentence: '{license}ライセンスの下で配布されています。詳細は[LICENSE](LICENSE)をご覧ください。',
  },
};

export function getDefaultText(language: ReadmeLanguage, key: TextKey): string {
  return (DEFAULT_TEXTS[language] ?? DEFAULT_TEXTS.en)[key];
}
```

- [ ] **Step 5: Étendre la définition de bloc et la persistance**

Modify `src/lib/readme/block-definition.ts` : dans `BlockDefinition<TData>`, ajouter après `defaultOnCreate: boolean;` :

```ts
  /** Pre-ticked in the wizard's "Sections" step (critical and recommended blocks). */
  recommended?: boolean;
  /** True when `toMarkdown` needs `ctx.headings` (the table of contents). */
  usesHeadings?: boolean;
```

Dans `AnyBlockDefinition`, ajouter après `defaultOnCreate: boolean;` :

```ts
  recommended: boolean;
  usesHeadings: boolean;
```

Dans `defineBlock`, ajouter après `defaultOnCreate: def.defaultOnCreate,` :

```ts
    recommended: def.recommended ?? false,
    usesHeadings: def.usesHeadings ?? false,
```

Modify `src/lib/readme/persistence.ts` : ajouter l'import `import { locales } from '@/i18n/locales';` sous `import { z } from 'zod';`, puis remplacer l'objet `meta` de `envelopeSchema` par :

```ts
  meta: z.object({
    name: z.string().max(META_LIMITS.name),
    description: z.string().max(META_LIMITS.description),
    author: z.string().max(META_LIMITS.author),
    license: z.string().max(META_LIMITS.license),
    repoUrl: z.string().max(META_LIMITS.repoUrl),
    installCommand: z.string().max(META_LIMITS.installCommand).default(''),
    language: z.enum(locales).default('en'),
  }),
```

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 7: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute la langue du README, les textes par défaut et le contrat de bloc

meta gagne language et installCommand (les fichiers du plan 1 restent
lisibles), les textes insérés dans le README suivent meta.language, et
les définitions de bloc déclarent recommended et usesHeadings.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Traductions du mode Projet (8 locales)

**Files:**
- Modify: `src/i18n/locales/{fr,en,es,de,it,pt,ru,ja}.json`
- Create (temporaire, non commité) : `tmp-i18n-readme-plan2.mjs`
- Test: `tests/i18n/readme-generator-wizard-locales.test.ts`

**Interfaces:**
- Consumes: le namespace `readmeGenerator` du plan 1.
- Produces : les clés suivantes dans chaque locale, sous `readmeGenerator` : `blocks.{badges,visualProof,tableOfContents,installation,usage,architecture,contributing,license,alert}`, `modes.{projectDesc,profileDesc}`, `toolbar.wizard`, `fields.*`, `hints.*`, `placeholders.{repoUrl,packageName}`, `warnings.tooManyBadges`, `wizard.*`, `meta.*`, `extraction.*`, `messages.wizardRemoved`. Utilisées par les Tâches 10 et 11.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/i18n/readme-generator-wizard-locales.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const REQUIRED_KEYS = [
  'blocks.badges', 'blocks.visualProof', 'blocks.tableOfContents', 'blocks.installation', 'blocks.usage',
  'blocks.architecture', 'blocks.contributing', 'blocks.license', 'blocks.alert',
  'modes.projectDesc', 'modes.profileDesc', 'toolbar.wizard',
  'fields.heading', 'fields.prerequisites', 'fields.packageManager', 'fields.packageName', 'fields.commands',
  'fields.description', 'fields.code', 'fields.codeLanguage', 'fields.url', 'fields.alt', 'fields.caption',
  'fields.text', 'fields.linkUrl', 'fields.linkLabel', 'fields.license', 'fields.holder', 'fields.year',
  'fields.credits', 'fields.alertType', 'fields.badgeLabel', 'fields.badgeMessage', 'fields.badgeColor',
  'fields.badgeLink', 'fields.addBadge', 'fields.removeBadge', 'fields.architecture', 'fields.roadmap',
  'fields.roadmapHeading',
  'hints.prerequisites', 'hints.commands', 'hints.credits', 'hints.roadmap', 'hints.badgeColor',
  'placeholders.repoUrl', 'placeholders.packageName', 'warnings.tooManyBadges',
  'wizard.title', 'wizard.step', 'wizard.next', 'wizard.back', 'wizard.finish', 'wizard.skip',
  'wizard.stepMode', 'wizard.stepStart', 'wizard.stepInfos', 'wizard.stepSections', 'wizard.stepStyle',
  'wizard.modeHint', 'wizard.scratch', 'wizard.scratchDesc', 'wizard.prefill', 'wizard.prefillDesc',
  'wizard.infosHint', 'wizard.sectionsHint', 'wizard.styleHint', 'wizard.accent', 'wizard.accentCustom',
  'wizard.accentInvalid',
  'meta.name', 'meta.description', 'meta.author', 'meta.license', 'meta.repoUrl', 'meta.installCommand',
  'meta.language', 'meta.autoFilled',
  'extraction.file', 'extraction.url', 'extraction.fetch', 'extraction.choose', 'extraction.success',
  'extraction.nothing', 'extraction.privacy', 'extraction.unsupportedFile', 'extraction.invalidFile',
  'extraction.invalidUrl', 'extraction.rateLimit', 'extraction.notFound', 'extraction.network',
  'extraction.invalidResponse',
  'messages.wizardRemoved',
] as const;

const PLACEHOLDERS: Record<string, string[]> = {
  'warnings.tooManyBadges': ['{count}'],
  'wizard.step': ['{current}', '{total}'],
  'extraction.success': ['{fields}'],
  'messages.wizardRemoved': ['{count}'],
};

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('readme generator project-mode translations', () => {
  it.each(locales)('%s has every key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.readmeGenerator, key);
      expect(typeof value, `${locale}:${key}`).toBe('string');
      expect((value as string).trim().length, `${locale}:${key}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)('%s keeps the ICU placeholders', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const [key, placeholders] of Object.entries(PLACEHOLDERS)) {
      for (const placeholder of placeholders) {
        expect(getPath(messages.readmeGenerator, key) as string, `${locale}:${key}`).toContain(placeholder);
      }
    }
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/i18n/readme-generator-wizard-locales.test.ts`
Expected: FAIL, 16 échecs (2 tests × 8 locales) : les clés n'existent pas.

- [ ] **Step 3: Créer le script de traductions**

Create `tmp-i18n-readme-plan2.mjs` à la racine (fichier temporaire, jamais commité). Chaque ligne du tableau est `clé => fr | en | es | de | it | pt | ru | ja` ; le script refuse toute ligne qui n'a pas exactement huit traductions.

```js
import fs from 'node:fs';

const ORDER = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'ja'];

const TABLE = `
blocks.badges => Badges | Badges | Insignias | Badges | Badge | Emblemas | Бейджи | バッジ
blocks.visualProof => Preuve visuelle | Visual proof | Prueba visual | Visueller Beleg | Prova visiva | Prova visual | Визуальное подтверждение | ビジュアルデモ
blocks.tableOfContents => Table des matières | Table of contents | Tabla de contenidos | Inhaltsverzeichnis | Indice | Índice | Содержание | 目次
blocks.installation => Installation | Installation | Instalación | Installation | Installazione | Instalação | Установка | インストール
blocks.usage => Utilisation | Usage | Uso | Verwendung | Utilizzo | Utilização | Использование | 使い方
blocks.architecture => Architecture et feuille de route | Architecture and roadmap | Arquitectura y hoja de ruta | Architektur und Roadmap | Architettura e roadmap | Arquitetura e roteiro | Архитектура и дорожная карта | アーキテクチャとロードマップ
blocks.contributing => Contribution | Contributing | Contribución | Mitwirken | Contributi | Contribuição | Участие в разработке | コントリビューション
blocks.license => Licence et remerciements | License and credits | Licencia y agradecimientos | Lizenz und Danksagungen | Licenza e ringraziamenti | Licença e agradecimentos | Лицензия и благодарности | ライセンスと謝辞
blocks.alert => Alerte | Alert | Alerta | Hinweis | Avviso | Alerta | Уведомление | アラート
modes.projectDesc => Documentation d'un dépôt logiciel : installation, utilisation, licence. | Documentation for a software repository: installation, usage, license. | Documentación de un repositorio: instalación, uso, licencia. | Dokumentation eines Software-Repositorys: Installation, Verwendung, Lizenz. | Documentazione di un repository: installazione, utilizzo, licenza. | Documentação de um repositório: instalação, utilização, licença. | Документация репозитория: установка, использование, лицензия. | ソフトウェアリポジトリの文書：インストール、使い方、ライセンス。
modes.profileDesc => Page de présentation de votre profil GitHub. | Introduction page for your GitHub profile. | Página de presentación de tu perfil de GitHub. | Vorstellungsseite für Ihr GitHub-Profil. | Pagina di presentazione del tuo profilo GitHub. | Página de apresentação do seu perfil do GitHub. | Страница-визитка вашего профиля GitHub. | GitHubプロフィールの紹介ページ。
toolbar.wizard => Assistant | Wizard | Asistente | Assistent | Procedura guidata | Assistente | Мастер | ウィザード
fields.heading => Titre de la section | Section heading | Título de la sección | Abschnittsüberschrift | Titolo della sezione | Título da secção | Заголовок раздела | セクション見出し
fields.prerequisites => Prérequis | Prerequisites | Requisitos previos | Voraussetzungen | Prerequisiti | Pré-requisitos | Требования | 前提条件
fields.packageManager => Gestionnaire de paquets | Package manager | Gestor de paquetes | Paketmanager | Gestore di pacchetti | Gestor de pacotes | Менеджер пакетов | パッケージマネージャー
fields.packageName => Nom du paquet | Package name | Nombre del paquete | Paketname | Nome del pacchetto | Nome do pacote | Название пакета | パッケージ名
fields.commands => Commandes | Commands | Comandos | Befehle | Comandi | Comandos | Команды | コマンド
fields.description => Description | Description | Descripción | Beschreibung | Descrizione | Descrição | Описание | 説明
fields.code => Exemple de code | Code example | Ejemplo de código | Codebeispiel | Esempio di codice | Exemplo de código | Пример кода | コード例
fields.codeLanguage => Langage du code | Code language | Lenguaje del código | Codesprache | Linguaggio del codice | Linguagem do código | Язык кода | コードの言語
fields.url => URL de l'image | Image URL | URL de la imagen | Bild-URL | URL dell'immagine | URL da imagem | URL изображения | 画像のURL
fields.alt => Texte alternatif | Alt text | Texto alternativo | Alternativtext | Testo alternativo | Texto alternativo | Альтернативный текст | 代替テキスト
fields.caption => Légende | Caption | Leyenda | Bildunterschrift | Didascalia | Legenda | Подпись | キャプション
fields.text => Texte | Text | Texto | Text | Testo | Texto | Текст | テキスト
fields.linkUrl => URL du lien | Link URL | URL del enlace | Link-URL | URL del link | URL da ligação | URL ссылки | リンクのURL
fields.linkLabel => Texte du lien | Link text | Texto del enlace | Linktext | Testo del link | Texto da ligação | Текст ссылки | リンクのテキスト
fields.license => Licence | License | Licencia | Lizenz | Licenza | Licença | Лицензия | ライセンス
fields.holder => Titulaire des droits | Copyright holder | Titular de los derechos | Rechteinhaber | Titolare dei diritti | Titular dos direitos | Правообладатель | 著作権者
fields.year => Année | Year | Año | Jahr | Anno | Ano | Год | 年
fields.credits => Remerciements | Acknowledgements | Agradecimientos | Danksagungen | Ringraziamenti | Agradecimentos | Благодарности | 謝辞
fields.alertType => Type d'alerte | Alert type | Tipo de alerta | Hinweistyp | Tipo di avviso | Tipo de alerta | Тип уведомления | アラートの種類
fields.badgeLabel => Libellé | Label | Etiqueta | Bezeichnung | Etichetta | Rótulo | Метка | ラベル
fields.badgeMessage => Valeur | Value | Valor | Wert | Valore | Valor | Значение | 値
fields.badgeColor => Couleur | Color | Color | Farbe | Colore | Cor | Цвет | 色
fields.badgeLink => Lien du badge | Badge link | Enlace de la insignia | Badge-Link | Link del badge | Ligação do emblema | Ссылка бейджа | バッジのリンク
fields.addBadge => Ajouter un badge | Add a badge | Añadir una insignia | Badge hinzufügen | Aggiungi un badge | Adicionar um emblema | Добавить бейдж | バッジを追加
fields.removeBadge => Retirer le badge | Remove the badge | Quitar la insignia | Badge entfernen | Rimuovi il badge | Remover o emblema | Удалить бейдж | バッジを削除
fields.architecture => Description de l'architecture | Architecture description | Descripción de la arquitectura | Architekturbeschreibung | Descrizione dell'architettura | Descrição da arquitetura | Описание архитектуры | アーキテクチャの説明
fields.roadmap => Feuille de route | Roadmap | Hoja de ruta | Roadmap | Roadmap | Roteiro | Дорожная карта | ロードマップ
fields.roadmapHeading => Titre de la feuille de route | Roadmap heading | Título de la hoja de ruta | Roadmap-Überschrift | Titolo della roadmap | Título do roteiro | Заголовок дорожной карты | ロードマップの見出し
hints.prerequisites => Un prérequis par ligne. | One prerequisite per line. | Un requisito por línea. | Eine Voraussetzung pro Zeile. | Un prerequisito per riga. | Um pré-requisito por linha. | Одно требование на строку. | 1行に1つ入力します。
hints.commands => Une commande par ligne, ajoutée après la commande du gestionnaire. | One command per line, added after the package manager command. | Un comando por línea, añadido tras el comando del gestor. | Ein Befehl pro Zeile, nach dem Paketmanager-Befehl angefügt. | Un comando per riga, aggiunto dopo il comando del gestore. | Um comando por linha, adicionado após o comando do gestor. | Одна команда на строку, добавляется после команды менеджера пакетов. | 1行に1つのコマンド。パッケージマネージャーのコマンドの後に追加されます。
hints.credits => Un remerciement par ligne. | One acknowledgement per line. | Un agradecimiento por línea. | Eine Danksagung pro Zeile. | Un ringraziamento per riga. | Um agradecimento por linha. | Одна благодарность на строку. | 1行に1つ入力します。
hints.roadmap => Une étape par ligne, affichée comme case à cocher. | One step per line, shown as a checkbox. | Un paso por línea, mostrado como casilla. | Ein Schritt pro Zeile, als Kontrollkästchen dargestellt. | Un passaggio per riga, mostrato come casella. | Um passo por linha, mostrado como caixa de seleção. | Один шаг на строку, отображается как флажок. | 1行に1ステップ。チェックボックスとして表示されます。
hints.badgeColor => Code hexadécimal sans #. Vide : couleur d'accent du style. | Hex code without #. Empty: the style accent color. | Código hexadecimal sin #. Vacío: el color de acento del estilo. | Hex-Code ohne #. Leer: die Akzentfarbe des Stils. | Codice esadecimale senza #. Vuoto: colore di accento dello stile. | Código hexadecimal sem #. Vazio: a cor de destaque do estilo. | HEX-код без #. Пусто — акцентный цвет стиля. | #なしの16進コード。空欄の場合はスタイルのアクセント色。
placeholders.repoUrl => https://github.com/utilisateur/depot | https://github.com/owner/repo | https://github.com/usuario/repositorio | https://github.com/nutzer/repository | https://github.com/utente/repository | https://github.com/utilizador/repositorio | https://github.com/owner/repo | https://github.com/owner/repo
placeholders.packageName => mon-paquet | my-package | mi-paquete | mein-paket | mio-pacchetto | meu-pacote | my-package | my-package
warnings.tooManyBadges => Trop de badges ({count}) : gardez les 5 plus utiles. | Too many badges ({count}): keep the 5 most useful. | Demasiadas insignias ({count}): conserva las 5 más útiles. | Zu viele Badges ({count}): behalten Sie die 5 nützlichsten. | Troppi badge ({count}): mantieni i 5 più utili. | Demasiados emblemas ({count}): mantenha os 5 mais úteis. | Слишком много бейджей ({count}): оставьте 5 самых полезных. | バッジが多すぎます（{count}個）。役立つ5個までに絞りましょう。
wizard.title => Assistant de création | Setup wizard | Asistente de creación | Einrichtungsassistent | Procedura guidata | Assistente de criação | Мастер создания | 作成ウィザード
wizard.step => Étape {current} sur {total} | Step {current} of {total} | Paso {current} de {total} | Schritt {current} von {total} | Passo {current} di {total} | Passo {current} de {total} | Шаг {current} из {total} | ステップ {current}/{total}
wizard.next => Suivant | Next | Siguiente | Weiter | Avanti | Seguinte | Далее | 次へ
wizard.back => Retour | Back | Atrás | Zurück | Indietro | Voltar | Назад | 戻る
wizard.finish => Terminer | Finish | Terminar | Fertig | Fine | Concluir | Готово | 完了
wizard.skip => Passer à l'éditeur | Skip to the editor | Ir al editor | Zum Editor springen | Vai all'editor | Ir para o editor | Перейти к редактору | エディタへ進む
wizard.stepMode => Type de README | README type | Tipo de README | README-Typ | Tipo di README | Tipo de README | Тип README | READMEの種類
wizard.stepStart => Point de départ | Starting point | Punto de partida | Ausgangspunkt | Punto di partenza | Ponto de partida | Отправная точка | 開始方法
wizard.stepInfos => Informations | Information | Información | Informationen | Informazioni | Informações | Информация | 情報
wizard.stepSections => Sections | Sections | Secciones | Abschnitte | Sezioni | Secções | Разделы | セクション
wizard.stepStyle => Style | Style | Estilo | Stil | Stile | Estilo | Стиль | スタイル
wizard.modeHint => Choisissez le type de README à créer. | Choose the kind of README to create. | Elige el tipo de README que quieres crear. | Wählen Sie, welches README Sie erstellen möchten. | Scegli il tipo di README da creare. | Escolha o tipo de README a criar. | Выберите, какой README создать. | 作成するREADMEの種類を選びます。
wizard.scratch => Partir de zéro | Start from scratch | Empezar desde cero | Bei null anfangen | Partire da zero | Começar do zero | Начать с нуля | ゼロから始める
wizard.scratchDesc => Remplissez chaque information à la main. Rien à importer. | Fill in each detail by hand. Nothing to import. | Rellena cada dato a mano. No hay que importar nada. | Füllen Sie jede Angabe von Hand aus. Es muss nichts importiert werden. | Compila ogni dato a mano. Non serve importare nulla. | Preencha cada informação à mão. Não é preciso importar nada. | Заполните всё вручную. Ничего импортировать не нужно. | すべて手入力で進めます。インポートは不要です。
wizard.prefill => Pré-remplir depuis un dépôt | Pre-fill from a repository | Rellenar desde un repositorio | Aus einem Repository vorausfüllen | Precompila da un repository | Preencher a partir de um repositório | Заполнить из репозитория | リポジトリから自動入力
wizard.prefillDesc => Facultatif : importez un fichier manifest ou indiquez une URL GitHub publique. | Optional: import a manifest file or enter a public GitHub URL. | Opcional: importa un archivo de manifiesto o indica una URL pública de GitHub. | Optional: Importieren Sie eine Manifest-Datei oder geben Sie eine öffentliche GitHub-URL an. | Facoltativo: importa un file manifest o indica un URL GitHub pubblico. | Opcional: importe um ficheiro de manifesto ou indique um URL público do GitHub. | По желанию: импортируйте файл манифеста или укажите публичный URL GitHub. | 任意：マニフェストファイルをインポートするか、公開GitHubのURLを入力します。
wizard.infosHint => Tous les champs sont facultatifs. | Every field is optional. | Todos los campos son opcionales. | Alle Felder sind optional. | Tutti i campi sono facoltativi. | Todos os campos são opcionais. | Все поля необязательны. | すべての項目は任意です。
wizard.sectionsHint => Cochez les sections à inclure. Vous pourrez les modifier ensuite. | Tick the sections to include. You can change them later. | Marca las secciones que quieres incluir. Podrás cambiarlas después. | Wählen Sie die Abschnitte aus. Sie können sie später ändern. | Seleziona le sezioni da includere. Potrai modificarle dopo. | Marque as secções a incluir. Poderá alterá-las depois. | Отметьте разделы для включения. Позже их можно изменить. | 含めるセクションを選びます。後から変更できます。
wizard.styleHint => Une seule couleur d'accent sera appliquée à tous les badges. | A single accent color is applied to every badge. | Se aplica un único color de acento a todas las insignias. | Eine Akzentfarbe wird auf alle Badges angewendet. | Un unico colore di accento viene applicato a tutti i badge. | Uma única cor de destaque é aplicada a todos os emblemas. | Один акцентный цвет применяется ко всем бейджам. | 1つのアクセント色がすべてのバッジに適用されます。
wizard.accent => Couleur d'accent | Accent color | Color de acento | Akzentfarbe | Colore di accento | Cor de destaque | Акцентный цвет | アクセント色
wizard.accentCustom => Autre couleur (hex) | Other color (hex) | Otro color (hex) | Andere Farbe (Hex) | Altro colore (hex) | Outra cor (hex) | Другой цвет (HEX) | その他の色（16進）
wizard.accentInvalid => Code invalide : 6 caractères hexadécimaux attendus. | Invalid code: 6 hexadecimal characters expected. | Código no válido: se esperan 6 caracteres hexadecimales. | Ungültiger Code: 6 Hexadezimalzeichen erwartet. | Codice non valido: servono 6 caratteri esadecimali. | Código inválido: são esperados 6 caracteres hexadecimais. | Неверный код: нужно 6 шестнадцатеричных символов. | 無効なコードです。16進数6文字で入力してください。
meta.name => Nom | Name | Nombre | Name | Nome | Nome | Название | 名前
meta.description => Description courte | Short description | Descripción corta | Kurzbeschreibung | Descrizione breve | Descrição curta | Краткое описание | 短い説明
meta.author => Auteur | Author | Autor | Autor | Autore | Autor | Автор | 作者
meta.license => Licence | License | Licencia | Lizenz | Licenza | Licença | Лицензия | ライセンス
meta.repoUrl => URL du dépôt | Repository URL | URL del repositorio | Repository-URL | URL del repository | URL do repositório | URL репозитория | リポジトリのURL
meta.installCommand => Commande d'installation | Install command | Comando de instalación | Installationsbefehl | Comando di installazione | Comando de instalação | Команда установки | インストールコマンド
meta.language => Langue du README | README language | Idioma del README | README-Sprache | Lingua del README | Idioma do README | Язык README | READMEの言語
meta.autoFilled => Rempli automatiquement | Filled automatically | Rellenado automáticamente | Automatisch ausgefüllt | Compilato automaticamente | Preenchido automaticamente | Заполнено автоматически | 自動入力
extraction.file => Fichier manifest (package.json, Cargo.toml, pyproject.toml) | Manifest file (package.json, Cargo.toml, pyproject.toml) | Archivo de manifiesto (package.json, Cargo.toml, pyproject.toml) | Manifest-Datei (package.json, Cargo.toml, pyproject.toml) | File manifest (package.json, Cargo.toml, pyproject.toml) | Ficheiro de manifesto (package.json, Cargo.toml, pyproject.toml) | Файл манифеста (package.json, Cargo.toml, pyproject.toml) | マニフェストファイル（package.json、Cargo.toml、pyproject.toml）
extraction.url => URL d'un dépôt GitHub public | Public GitHub repository URL | URL de un repositorio público de GitHub | URL eines öffentlichen GitHub-Repositorys | URL di un repository GitHub pubblico | URL de um repositório público do GitHub | URL публичного репозитория GitHub | 公開GitHubリポジトリのURL
extraction.fetch => Récupérer | Fetch | Obtener | Abrufen | Recupera | Obter | Получить | 取得
extraction.choose => Choisir un fichier | Choose a file | Elegir un archivo | Datei auswählen | Scegli un file | Escolher um ficheiro | Выбрать файл | ファイルを選択
extraction.success => Champs remplis : {fields}. | Fields filled: {fields}. | Campos rellenados: {fields}. | Ausgefüllte Felder: {fields}. | Campi compilati: {fields}. | Campos preenchidos: {fields}. | Заполнены поля: {fields}. | 入力した項目：{fields}。
extraction.nothing => Rien à remplir : les champs concernés sont déjà remplis ou absents. | Nothing to fill: the matching fields are already filled or missing. | Nada que rellenar: los campos ya están rellenos o no existen. | Nichts auszufüllen: Die Felder sind bereits gefüllt oder fehlen. | Niente da compilare: i campi sono già compilati o assenti. | Nada a preencher: os campos já estão preenchidos ou não existem. | Заполнять нечего: поля уже заполнены или отсутствуют. | 入力する項目がありません。該当する項目は入力済み、または存在しません。
extraction.privacy => Les fichiers restent dans votre navigateur. | Files stay in your browser. | Los archivos se quedan en tu navegador. | Dateien bleiben in Ihrem Browser. | I file restano nel tuo browser. | Os ficheiros ficam no seu navegador. | Файлы остаются в вашем браузере. | ファイルはブラウザ内に留まります。
extraction.unsupportedFile => Fichier non pris en charge. Utilisez package.json, Cargo.toml ou pyproject.toml. | Unsupported file. Use package.json, Cargo.toml or pyproject.toml. | Archivo no admitido. Usa package.json, Cargo.toml o pyproject.toml. | Nicht unterstützte Datei. Verwenden Sie package.json, Cargo.toml oder pyproject.toml. | File non supportato. Usa package.json, Cargo.toml o pyproject.toml. | Ficheiro não suportado. Use package.json, Cargo.toml ou pyproject.toml. | Файл не поддерживается. Используйте package.json, Cargo.toml или pyproject.toml. | 非対応のファイルです。package.json、Cargo.toml、pyproject.tomlを使ってください。
extraction.invalidFile => Fichier illisible : rien n'a été rempli. | Unreadable file: nothing was filled. | Archivo ilegible: no se ha rellenado nada. | Datei nicht lesbar: Es wurde nichts ausgefüllt. | File illeggibile: non è stato compilato nulla. | Ficheiro ilegível: nada foi preenchido. | Файл не читается: ничего не заполнено. | ファイルを読み取れないため、何も入力されませんでした。
extraction.invalidUrl => URL invalide : indiquez une adresse de la forme github.com/utilisateur/depot. | Invalid URL: use an address like github.com/owner/repo. | URL no válida: usa una dirección como github.com/usuario/repositorio. | Ungültige URL: Verwenden Sie eine Adresse wie github.com/nutzer/repository. | URL non valido: usa un indirizzo come github.com/utente/repository. | URL inválido: use um endereço como github.com/utilizador/repositorio. | Неверный URL: укажите адрес вида github.com/owner/repo. | 無効なURLです。github.com/owner/repo の形式で入力してください。
extraction.rateLimit => Limite de requêtes GitHub atteinte. Réessayez plus tard ou saisissez les informations à la main. | GitHub request limit reached. Try again later or enter the details by hand. | Se alcanzó el límite de solicitudes de GitHub. Inténtalo más tarde o introduce los datos a mano. | GitHub-Anfragelimit erreicht. Versuchen Sie es später erneut oder geben Sie die Angaben von Hand ein. | Limite di richieste GitHub raggiunto. Riprova più tardi o inserisci i dati a mano. | Limite de pedidos do GitHub atingido. Tente mais tarde ou introduza os dados à mão. | Достигнут лимит запросов GitHub. Повторите позже или введите данные вручную. | GitHubのリクエスト上限に達しました。しばらくしてから再試行するか、手入力してください。
extraction.notFound => Dépôt introuvable ou privé. Vous pouvez saisir les informations à la main. | Repository not found or private. You can enter the details by hand. | Repositorio no encontrado o privado. Puedes introducir los datos a mano. | Repository nicht gefunden oder privat. Sie können die Angaben von Hand eingeben. | Repository non trovato o privato. Puoi inserire i dati a mano. | Repositório não encontrado ou privado. Pode introduzir os dados à mão. | Репозиторий не найден или закрыт. Вы можете ввести данные вручную. | リポジトリが見つからないか、非公開です。手入力もできます。
extraction.network => Connexion impossible. Vérifiez votre réseau ou saisissez les informations à la main. | Could not connect. Check your network or enter the details by hand. | No se pudo conectar. Revisa tu red o introduce los datos a mano. | Verbindung nicht möglich. Prüfen Sie Ihr Netzwerk oder geben Sie die Angaben von Hand ein. | Connessione impossibile. Controlla la rete o inserisci i dati a mano. | Não foi possível ligar. Verifique a rede ou introduza os dados à mão. | Не удалось подключиться. Проверьте сеть или введите данные вручную. | 接続できませんでした。ネットワークを確認するか、手入力してください。
extraction.invalidResponse => Réponse inattendue de GitHub. Vous pouvez saisir les informations à la main. | Unexpected response from GitHub. You can enter the details by hand. | Respuesta inesperada de GitHub. Puedes introducir los datos a mano. | Unerwartete Antwort von GitHub. Sie können die Angaben von Hand eingeben. | Risposta inattesa da GitHub. Puoi inserire i dati a mano. | Resposta inesperada do GitHub. Pode introduzir os dados à mão. | Неожиданный ответ GitHub. Вы можете ввести данные вручную. | GitHubから予期しない応答がありました。手入力もできます。
messages.wizardRemoved => Sections retirées : {count}. | Sections removed: {count}. | Secciones eliminadas: {count}. | Entfernte Abschnitte: {count}. | Sezioni rimosse: {count}. | Secções removidas: {count}. | Удалено разделов: {count}. | 削除したセクション：{count}件。
`;

function setPath(target, path, value) {
  const keys = path.split('.');
  let node = target;
  for (const key of keys.slice(0, -1)) {
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {};
    node = node[key];
  }
  node[keys[keys.length - 1]] = value;
}

const rows = TABLE.trim().split('\n').map((line) => {
  const [key, rest] = line.split(' => ');
  const values = rest.split(' | ');
  if (values.length !== ORDER.length) throw new Error(`${key}: expected ${ORDER.length} translations, got ${values.length}`);
  return { key, values };
});

for (const [index, locale] of ORDER.entries()) {
  const file = `src/i18n/locales/${locale}.json`;
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const { key, values } of rows) setPath(messages.readmeGenerator, key, values[index]);
  fs.writeFileSync(file, JSON.stringify(messages, null, 2) + '\n');
  console.log('updated', file, rows.length, 'keys');
}
```

- [ ] **Step 4: Exécuter le script, puis le supprimer**

Run: `node tmp-i18n-readme-plan2.mjs`
Expected: huit lignes `updated src/i18n/locales/<locale>.json 93 keys`.

Run: `rm tmp-i18n-readme-plan2.mjs`

- [ ] **Step 5: Vérifier que les tests passent et que les diffs sont propres**

Run: `npx vitest run tests/i18n`
Expected: PASS (tous les tests i18n, dont les 16 nouveaux).

Run: `git diff --stat src/i18n/locales`
Expected: huit fichiers modifiés, uniquement des lignes ajoutées (hors la virgule ajoutée à l'ancienne dernière entrée de chaque objet).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/locales tests/i18n/readme-generator-wizard-locales.test.ts
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les traductions du mode Projet dans les 8 locales

Noms et formulaires des nouveaux blocs, assistant, extraction, messages
d'erreur GitHub et avertissement sur le nombre de badges, avec contrôle
des paramètres ICU.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```


---

### Task 4: Blocs Alerte, Utilisation, Installation et Preuve visuelle

**Files:**
- Create: `src/lib/readme/blocks/alert.ts`, `usage.ts`, `installation.ts`, `visual-proof.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`), `src/lib/readme/registry.ts`, `src/lib/readme/blocks/header.ts` (`recommended`)
- Test: `tests/readme/blocks-content.test.ts`

**Interfaces:**
- Consumes: `defineBlock` ; `escapeAlt`, `escapeMarkdownText`, `safeUrl`, `singleLine`, `normalizeNewlines`, `codeFence`, `atxHeading`, `nonEmptyLines` (`markdown-utils.ts`) ; `getDefaultText` (`default-texts.ts`).
- Produces :
  - `alert.ts` : `alertBlock`, `ALERT_KINDS = ['NOTE','TIP','IMPORTANT','WARNING','CAUTION']`, `ALERT_TEXT_MAX = 2000`, `AlertData { kind; text }`.
  - `usage.ts` : `usageBlock`, `USAGE_LIMITS { heading: 200; description: 2000; code: 20000; language: 30 }`, `UsageData { heading; description; code; language }`.
  - `installation.ts` : `installationBlock`, `INSTALL_MANAGERS = ['none','npm','yarn','pnpm','bun','pip','cargo','go','composer']`, `InstallManager`, `INSTALL_LIMITS { heading: 200; prerequisites: 2000; packageName: 200; commands: 5000 }`, `InstallationData { heading; prerequisites; manager; packageName; commands }`.
  - `visual-proof.ts` : `visualProofBlock`, `VISUAL_PROOF_LIMITS { url: 2000; alt: 200; caption: 500 }`, `VisualProofData { url; alt; caption }`.
  - `BlockType` gagne `'visualProof' | 'installation' | 'usage' | 'alert'`. Les blocs Installation et Utilisation sont `defaultOnCreate: true` et `recommended: true` ; Preuve visuelle est `recommended: true` ; l'En-tête devient `recommended: true`.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/blocks-content.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import type { Block, ReadmeLanguage } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { block, stateWith } from './helpers';

function inLanguage(language: ReadmeLanguage, blocks: Block[]) {
  return { ...stateWith(blocks), meta: { ...EMPTY_META, language } };
}

describe('alert block', () => {
  it('renders a GitHub alert and keeps blank lines inside the quote', () => {
    const state = stateWith([block('a', 'alert', { kind: 'WARNING', text: 'Careful\n\nSecond line' })]);
    expect(generateReadme(state)).toBe('> [!WARNING]\n> Careful\n>\n> Second line\n');
  });

  it('renders nothing without text', () => {
    expect(generateReadme(stateWith([block('a', 'alert', { kind: 'NOTE', text: '  \n ' })]))).toBe('');
  });
});

describe('usage block', () => {
  it('renders heading, description and a fenced example', () => {
    const state = stateWith([
      block('u', 'usage', { heading: 'Usage', description: 'Run it.', code: 'npm start', language: 'bash' }),
    ]);
    expect(generateReadme(state)).toBe('## Usage\n\nRun it.\n\n```bash\nnpm start\n```\n');
  });

  it('renders nothing when only the heading is filled', () => {
    const state = stateWith([block('u', 'usage', { heading: 'Usage', description: '', code: '', language: '' })]);
    expect(generateReadme(state)).toBe('');
  });

  it('lengthens the fence when the example contains one', () => {
    const state = stateWith([block('u', 'usage', { heading: 'U', description: '', code: 'a\n```\nb', language: '' })]);
    expect(generateReadme(state)).toBe('## U\n\n````\na\n```\nb\n````\n');
  });

  it('keeps only safe characters of the language and escapes the heading', () => {
    const state = stateWith([block('u', 'usage', { heading: '1. Start', description: '', code: 'x', language: 'js x\n' })]);
    expect(generateReadme(state)).toBe('## 1\\. Start\n\n```jsx\nx\n```\n');
  });
});

describe('installation block', () => {
  const full = {
    heading: 'Installation',
    prerequisites: 'Node 20\n\nGit',
    manager: 'npm',
    packageName: 'left-pad',
    commands: 'npm run build',
  };

  it('renders prerequisites and the install commands', () => {
    expect(generateReadme(stateWith([block('i', 'installation', full)]))).toBe(
      '## Installation\n\n### Prerequisites\n\n- Node 20\n- Git\n\n```bash\nnpm install left-pad\nnpm run build\n```\n'
    );
  });

  it('follows the README language for the prerequisites heading', () => {
    const state = inLanguage('fr', [block('i', 'installation', { ...full, manager: 'none', commands: '' })]);
    expect(generateReadme(state)).toBe('## Installation\n\n### Prérequis\n\n- Node 20\n- Git\n');
  });

  it('ignores the package name when no package manager is chosen', () => {
    const data = { ...full, prerequisites: '', manager: 'none', commands: '' };
    expect(generateReadme(stateWith([block('i', 'installation', data)]))).toBe('');
  });

  it('escapes prerequisites as plain text', () => {
    const data = { ...full, prerequisites: '- first\n<b>x</b>', manager: 'none', commands: '' };
    expect(generateReadme(stateWith([block('i', 'installation', data)]))).toContain('- \\- first\n- \\<b\\>x\\</b\\>');
  });
});

describe('visual proof block', () => {
  const image = { url: 'https://x.io/a.png', alt: 'Demo screen', caption: 'A *caption*' };

  it('renders the image and its caption', () => {
    expect(generateReadme(stateWith([block('v', 'visualProof', image)]))).toBe(
      '![Demo screen](https://x.io/a.png)\n\n*A \\*caption\\**\n'
    );
  });

  it('falls back to the caption, then to a localized word, for the alt text', () => {
    const noAlt = { ...image, alt: '', caption: 'Hello' };
    expect(generateReadme(stateWith([block('v', 'visualProof', noAlt)]))).toBe('![Hello](https://x.io/a.png)\n\n*Hello*\n');
    const bare = { ...image, alt: '', caption: '' };
    expect(generateReadme(stateWith([block('v', 'visualProof', bare)]))).toBe('![Screenshot](https://x.io/a.png)\n');
    expect(generateReadme(inLanguage('fr', [block('v', 'visualProof', bare)]))).toBe(
      "![Capture d'écran](https://x.io/a.png)\n"
    );
  });

  it('renders nothing for a missing or dangerous URL', () => {
    expect(generateReadme(stateWith([block('v', 'visualProof', { ...image, url: '' })]))).toBe('');
    expect(generateReadme(stateWith([block('v', 'visualProof', { ...image, url: 'javascript:alert(1)' })]))).toBe('');
  });

  it('warns when the image has no alt text', () => {
    const state = stateWith([block('v', 'visualProof', { ...image, alt: ' ' })]);
    expect(validateReadme(state)).toEqual([{ code: 'imageMissingAlt', params: { count: 1 }, blockId: 'v' }]);
    expect(validateReadme(stateWith([block('v', 'visualProof', image)]))).toEqual([]);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blocks-content.test.ts`
Expected: FAIL. `getBlockDefinition('alert')` est `undefined` : `TypeError: Cannot read properties of undefined (reading 'toMarkdown')`.

- [ ] **Step 3: Écrire les quatre blocs**

Create `src/lib/readme/blocks/alert.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { normalizeNewlines } from '../markdown-utils';

export const ALERT_KINDS = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
export const ALERT_TEXT_MAX = 2000;

const schema = z.object({
  kind: z.enum(ALERT_KINDS),
  text: z.string().max(ALERT_TEXT_MAX),
});

export type AlertData = z.infer<typeof schema>;

export const alertBlock = defineBlock<AlertData>({
  type: 'alert',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: () => ({ kind: 'NOTE', text: '' }),
  toMarkdown: (data) => {
    const body = normalizeNewlines(data.text).trim();
    if (body === '') return '';
    const quoted = body.split('\n').map((line) => (line.trim() === '' ? '>' : `> ${line}`));
    return [`> [!${data.kind}]`, ...quoted].join('\n');
  },
});
```

Create `src/lib/readme/blocks/usage.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, codeFence, normalizeNewlines } from '../markdown-utils';

export const USAGE_LIMITS = { heading: 200, description: 2000, code: 20_000, language: 30 } as const;

const schema = z.object({
  heading: z.string().max(USAGE_LIMITS.heading),
  description: z.string().max(USAGE_LIMITS.description),
  code: z.string().max(USAGE_LIMITS.code),
  language: z.string().max(USAGE_LIMITS.language),
});

export type UsageData = z.infer<typeof schema>;

export const usageBlock = defineBlock<UsageData>({
  type: 'usage',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: true,
  recommended: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'usage'), description: '', code: '', language: '' }),
  toMarkdown: (data) => {
    const description = normalizeNewlines(data.description).trim();
    const hasCode = data.code.trim() !== '';
    if (description === '' && !hasCode) return '';
    return [atxHeading(2, data.heading), description, hasCode ? codeFence(data.code, data.language) : '']
      .filter((part) => part !== '')
      .join('\n\n');
  },
});
```

Create `src/lib/readme/blocks/installation.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, codeFence, escapeMarkdownText, nonEmptyLines, singleLine } from '../markdown-utils';

export const INSTALL_MANAGERS = ['none', 'npm', 'yarn', 'pnpm', 'bun', 'pip', 'cargo', 'go', 'composer'] as const;
export type InstallManager = (typeof INSTALL_MANAGERS)[number];

const INSTALL_COMMANDS: Record<InstallManager, string> = {
  none: '',
  npm: 'npm install',
  yarn: 'yarn add',
  pnpm: 'pnpm add',
  bun: 'bun add',
  pip: 'pip install',
  cargo: 'cargo add',
  go: 'go get',
  composer: 'composer require',
};

export const INSTALL_LIMITS = { heading: 200, prerequisites: 2000, packageName: 200, commands: 5000 } as const;

const schema = z.object({
  heading: z.string().max(INSTALL_LIMITS.heading),
  prerequisites: z.string().max(INSTALL_LIMITS.prerequisites),
  manager: z.enum(INSTALL_MANAGERS),
  packageName: z.string().max(INSTALL_LIMITS.packageName),
  commands: z.string().max(INSTALL_LIMITS.commands),
});

export type InstallationData = z.infer<typeof schema>;

export const installationBlock = defineBlock<InstallationData>({
  type: 'installation',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: true,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'installation'),
    prerequisites: '',
    manager: 'none',
    packageName: '',
    commands: meta.installCommand,
  }),
  toMarkdown: (data, ctx) => {
    const prerequisites = nonEmptyLines(data.prerequisites);
    const packageName = singleLine(data.packageName);
    const managerCommand =
      data.manager !== 'none' && packageName !== '' ? `${INSTALL_COMMANDS[data.manager]} ${packageName}` : '';
    const commands = [managerCommand, ...nonEmptyLines(data.commands)].filter((line) => line !== '');
    if (prerequisites.length === 0 && commands.length === 0) return '';

    const parts = [atxHeading(2, data.heading)];
    if (prerequisites.length > 0) {
      parts.push(
        atxHeading(3, getDefaultText(ctx.meta.language, 'prerequisites')),
        prerequisites.map((item) => `- ${escapeMarkdownText(item)}`).join('\n')
      );
    }
    if (commands.length > 0) parts.push(codeFence(commands.join('\n'), 'bash'));
    return parts.filter((part) => part !== '').join('\n\n');
  },
});
```

Create `src/lib/readme/blocks/visual-proof.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { escapeAlt, escapeMarkdownText, safeUrl, singleLine } from '../markdown-utils';

export const VISUAL_PROOF_LIMITS = { url: 2000, alt: 200, caption: 500 } as const;

const schema = z.object({
  url: z.string().max(VISUAL_PROOF_LIMITS.url),
  alt: z.string().max(VISUAL_PROOF_LIMITS.alt),
  caption: z.string().max(VISUAL_PROOF_LIMITS.caption),
});

export type VisualProofData = z.infer<typeof schema>;

export const visualProofBlock = defineBlock<VisualProofData>({
  type: 'visualProof',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: () => ({ url: '', alt: '', caption: '' }),
  toMarkdown: (data, ctx) => {
    const url = safeUrl(data.url);
    if (url === '') return '';
    const alt =
      escapeAlt(data.alt) || escapeAlt(data.caption) || escapeAlt(getDefaultText(ctx.meta.language, 'screenshot'));
    const caption = escapeMarkdownText(data.caption);
    return [`![${alt}](${url})`, caption === '' ? '' : `*${caption}*`].filter((part) => part !== '').join('\n\n');
  },
  validate: (data) =>
    safeUrl(data.url) !== '' && singleLine(data.alt) === '' ? [{ code: 'imageMissingAlt', params: { count: 1 } }] : [],
});
```

- [ ] **Step 4: Enregistrer les blocs**

Modify `src/lib/readme/types.ts` : remplacer la ligne de `BlockType`.

```ts
export type BlockType = 'header' | 'visualProof' | 'installation' | 'usage' | 'alert' | 'freeMarkdown';
```

Modify `src/lib/readme/blocks/header.ts` : ajouter `recommended: true,` après `defaultOnCreate: true,`.

Replace `src/lib/readme/registry.ts` par :

```ts
import type { AnyBlockDefinition } from './block-definition';
import { alertBlock } from './blocks/alert';
import { freeMarkdownBlock } from './blocks/free-markdown';
import { headerBlock } from './blocks/header';
import { installationBlock } from './blocks/installation';
import { usageBlock } from './blocks/usage';
import { visualProofBlock } from './blocks/visual-proof';
import type { BlockType, ReadmeMode } from './types';

// Order is the display order of the "add a block" menu and of a new README.
const DEFINITIONS: Record<BlockType, AnyBlockDefinition> = {
  header: headerBlock,
  visualProof: visualProofBlock,
  installation: installationBlock,
  usage: usageBlock,
  alert: alertBlock,
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

- [ ] **Step 5: Mettre à jour les tests du plan 1 qui supposaient un En-tête seul**

Un README Projet neuf contient maintenant les blocs critiques (En-tête, Installation, Utilisation) : mettre à jour `tests/readme/state.test.ts`.

Remplacer le test `starts a project README with the default header block` par :

```ts
  it('starts a project README with the critical blocks', () => {
    const state = createInitialState('project');
    expect(state.mode).toBe('project');
    expect(state.blocks.map((b) => b.type)).toEqual(['header', 'installation', 'usage']);
    expect(state.blocks.every((b) => b.enabled)).toBe(true);
  });
```

Remplacer, dans `describe('switchMode', …)`, la ligne `expect(result.state.blocks.map((b) => b.type)).toEqual(['header']);` par :

```ts
    expect(result.state.blocks.map((b) => b.type)).toEqual(['header', 'installation', 'usage']);
```

(Le bloc Licence, aussi critique, est ajouté à la Tâche 5, qui remet ces deux attentes à jour.)

- [ ] **Step 6: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS, y compris le test de contrat du registre (`registry.test.ts`), qui vérifie maintenant aussi les quatre nouveaux blocs avec des métadonnées de longueur maximale ; aucune erreur de types.

- [ ] **Step 7: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les blocs Alerte, Utilisation, Installation et Preuve visuelle

Champs sur une ligne échappés en texte brut, exemples de code à barrière
adaptative, textes par défaut selon la langue du README, avertissement
d'alt manquant sur la preuve visuelle.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Blocs Badges, Architecture, Contribution et Licence

**Files:**
- Create: `src/lib/readme/shields.ts`, `src/lib/readme/blocks/badges.ts`, `architecture.ts`, `contributing.ts`, `license.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`, `WarningCode`), `src/lib/readme/registry.ts`
- Test: `tests/readme/blocks-extra.test.ts`, `tests/readme/state.test.ts`

**Interfaces:**
- Consumes: mêmes utilitaires qu'à la Tâche 4 ; `DEFAULT_THEME` (`defaults.ts`).
- Produces :
  - `shields.ts` : `shieldsText(text: string): string`, `shieldsBadgeUrl(label: string, message: string, color: string): string`.
  - `badges.ts` : `badgesBlock`, `BADGE_LIMITS { label: 50; message: 100; link: 2000; maxItems: 20 }`, `BadgeItem { label; message; color; link }`, `BadgesData { items: BadgeItem[] }`. `color` est `''` (couleur d'accent du thème) ou six chiffres hexadécimaux.
  - `architecture.ts` : `architectureBlock`, `ARCHITECTURE_LIMITS { heading: 200; content: 20000; roadmapHeading: 200; roadmap: 5000 }`, `ArchitectureData { heading; content; roadmapHeading; roadmap }`.
  - `contributing.ts` : `contributingBlock`, `CONTRIBUTING_LIMITS { heading: 200; text: 5000; linkUrl: 2000; linkLabel: 100 }`, `ContributingData { heading; text; linkUrl; linkLabel }`.
  - `license.ts` : `licenseBlock` (singleton, `defaultOnCreate`, `recommended`), `LICENSE_LIMITS { heading: 200; license: 100; holder: 200; year: 20; credits: 3000 }`, `LicenseData { heading; license; holder; year; credits }`.
  - `BlockType` gagne `'badges' | 'architecture' | 'contributing' | 'license'` ; `WarningCode` gagne `'tooManyBadges'` (paramètre `count`).

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/blocks-extra.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { shieldsBadgeUrl, shieldsText } from '@/lib/readme/shields';
import { createBlock } from '@/lib/readme/state';
import type { Block, ReadmeLanguage } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { block, stateWith } from './helpers';

function inLanguage(language: ReadmeLanguage, blocks: Block[]) {
  return { ...stateWith(blocks), meta: { ...EMPTY_META, language } };
}

describe('shields helpers', () => {
  it('escapes dashes, underscores and spaces the way Shields expects', () => {
    expect(shieldsText('my-label_x y')).toBe('my--label__x_y');
    expect(shieldsText('a/b?c')).toBe('a%2Fb%3Fc');
  });

  it('builds a static badge URL', () => {
    expect(shieldsBadgeUrl('license', 'MIT', '0969da')).toBe('https://img.shields.io/badge/license-MIT-0969da');
  });
});

describe('badges block', () => {
  const item = (over: Partial<Record<'label' | 'message' | 'color' | 'link', string>> = {}) => ({
    label: 'license',
    message: 'MIT',
    color: '',
    link: '',
    ...over,
  });

  it('uses the theme accent color when the badge has none', () => {
    const state = stateWith([block('b', 'badges', { items: [item()] })]);
    expect(generateReadme(state)).toBe('![license: MIT](https://img.shields.io/badge/license-MIT-0969da)\n');
    const themed = { ...state, theme: { accentColor: 'ff0000' } };
    expect(generateReadme(themed)).toBe('![license: MIT](https://img.shields.io/badge/license-MIT-ff0000)\n');
  });

  it('puts badges on one line and links the ones that have a link', () => {
    const items = [item({ label: 'build', message: 'passing', color: '44cc11', link: 'https://ci.example.com/run' }), item()];
    expect(generateReadme(stateWith([block('b', 'badges', { items })]))).toBe(
      '[![build: passing](https://img.shields.io/badge/build-passing-44cc11)](https://ci.example.com/run) ' +
        '![license: MIT](https://img.shields.io/badge/license-MIT-0969da)\n'
    );
  });

  it('skips badges without a label or a value, and a dangerous link', () => {
    const items = [item({ label: '' }), item({ message: ' ' }), item({ link: 'javascript:alert(1)' })];
    expect(generateReadme(stateWith([block('b', 'badges', { items })]))).toBe(
      '![license: MIT](https://img.shields.io/badge/license-MIT-0969da)\n'
    );
  });

  it('seeds a license badge from the meta, and none without a license', () => {
    const seeded = createBlock('badges', { ...EMPTY_META, license: 'Apache-2.0' });
    expect((seeded.data as { items: unknown[] }).items).toEqual([
      { label: 'license', message: 'Apache-2.0', color: '', link: '' },
    ]);
    expect((createBlock('badges', EMPTY_META).data as { items: unknown[] }).items).toEqual([]);
  });

  it('warns above five badges', () => {
    const five = { items: Array.from({ length: 5 }, () => item()) };
    const six = { items: Array.from({ length: 6 }, () => item()) };
    expect(validateReadme(stateWith([block('b', 'badges', five)]))).toEqual([]);
    expect(validateReadme(stateWith([block('b', 'badges', six)]))).toEqual([
      { code: 'tooManyBadges', params: { count: 6 }, blockId: 'b' },
    ]);
  });
});

describe('architecture block', () => {
  const data = { heading: 'Architecture', content: 'Two modules.', roadmapHeading: 'Roadmap', roadmap: 'Ship v1\n- Fast' };

  it('renders the description and the roadmap as an unchecked list', () => {
    expect(generateReadme(stateWith([block('a', 'architecture', data)]))).toBe(
      '## Architecture\n\nTwo modules.\n\n## Roadmap\n\n- [ ] Ship v1\n- [ ] \\- Fast\n'
    );
  });

  it('renders only the section that has content', () => {
    expect(generateReadme(stateWith([block('a', 'architecture', { ...data, roadmap: '' })]))).toBe(
      '## Architecture\n\nTwo modules.\n'
    );
    expect(generateReadme(stateWith([block('a', 'architecture', { ...data, content: '' })]))).toBe(
      '## Roadmap\n\n- [ ] Ship v1\n- [ ] \\- Fast\n'
    );
    expect(generateReadme(stateWith([block('a', 'architecture', { ...data, content: '', roadmap: '' })]))).toBe('');
  });
});

describe('contributing block', () => {
  const data = { heading: 'Contributing', text: 'PRs welcome.', linkUrl: 'https://x.io/CONTRIBUTING.md', linkLabel: 'CONTRIBUTING.md' };

  it('renders the text and a link', () => {
    expect(generateReadme(stateWith([block('c', 'contributing', data)]))).toBe(
      '## Contributing\n\nPRs welcome.\n\n[CONTRIBUTING.md](https://x.io/CONTRIBUTING.md)\n'
    );
  });

  it('uses the URL as link text when there is no label, and drops a dangerous link', () => {
    const noLabel = { ...data, text: '', linkLabel: '' };
    expect(generateReadme(stateWith([block('c', 'contributing', noLabel)]))).toContain('[https://x.io/CONTRIBUTING.md](');
    const bad = { ...data, text: '', linkUrl: 'javascript:alert(1)' };
    expect(generateReadme(stateWith([block('c', 'contributing', bad)]))).toBe('');
  });
});

describe('license block', () => {
  const data = { heading: 'License', license: 'MIT', holder: 'Jane Doe', year: '2026', credits: 'Contributors\nThe community' };

  it('renders the sentence, the copyright line and the acknowledgements', () => {
    expect(generateReadme(stateWith([block('l', 'license', data)]))).toBe(
      '## License\n\nDistributed under the MIT license. See [LICENSE](LICENSE) for more information.\n\n' +
        '© 2026 Jane Doe\n\n### Acknowledgements\n\n- Contributors\n- The community\n'
    );
  });

  it('follows the README language', () => {
    expect(generateReadme(inLanguage('fr', [block('l', 'license', { ...data, holder: '', year: '', credits: '' })]))).toBe(
      "## License\n\nDistribué sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.\n"
    );
  });

  it('does not let a license name inject Markdown or replacement patterns', () => {
    const tricky = { ...data, license: '$& <b>x</b>', holder: '', year: '', credits: '' };
    expect(generateReadme(stateWith([block('l', 'license', tricky)]))).toContain('the $& \\<b\\>x\\</b\\> license.');
  });

  it('renders nothing when every field is empty', () => {
    const empty = { heading: 'License', license: '', holder: '', year: '', credits: '' };
    expect(generateReadme(stateWith([block('l', 'license', empty)]))).toBe('');
  });
});
```

Modify `tests/readme/state.test.ts` : dans le test `starts a project README with the critical blocks`, remplacer la liste attendue par `['header', 'installation', 'usage', 'license']`, et faire de même dans le test `seeds the default blocks when switching an empty README to project` de `describe('switchMode', …)`.

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/blocks-extra.test.ts tests/readme/state.test.ts`
Expected: FAIL. Le module `@/lib/readme/shields` est introuvable ; les deux attentes de `state.test.ts` ne trouvent pas encore `license`.

- [ ] **Step 3: Écrire les utilitaires Shields et les quatre blocs**

Create `src/lib/readme/shields.ts` :

```ts
/** Text of a static Shields badge: `-` and `_` are doubled, spaces become `_`. */
export function shieldsText(text: string): string {
  return encodeURIComponent(text.trim().replace(/_/g, '__').replace(/-/g, '--').replace(/ /g, '_'));
}

export function shieldsBadgeUrl(label: string, message: string, color: string): string {
  return `https://img.shields.io/badge/${shieldsText(label)}-${shieldsText(message)}-${color}`;
}
```

Create `src/lib/readme/blocks/badges.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { DEFAULT_THEME } from '../defaults';
import { escapeAlt, safeUrl, singleLine } from '../markdown-utils';
import { shieldsBadgeUrl } from '../shields';

export const BADGE_LIMITS = { label: 50, message: 100, link: 2000, maxItems: 20 } as const;

const itemSchema = z.object({
  label: z.string().max(BADGE_LIMITS.label),
  message: z.string().max(BADGE_LIMITS.message),
  /** Six hex digits, or '' to use the theme accent color. */
  color: z.string().regex(/^([0-9a-fA-F]{6})?$/),
  link: z.string().max(BADGE_LIMITS.link),
});

const schema = z.object({ items: z.array(itemSchema).max(BADGE_LIMITS.maxItems) });

export type BadgeItem = z.infer<typeof itemSchema>;
export type BadgesData = z.infer<typeof schema>;

/** More than this many badges hurts readability. */
const RECOMMENDED_MAX = 5;

export const badgesBlock = defineBlock<BadgesData>({
  type: 'badges',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  recommended: true,
  schema,
  createData: (meta) => ({
    items: meta.license ? [{ label: 'license', message: meta.license, color: '', link: '' }] : [],
  }),
  toMarkdown: (data, ctx) =>
    data.items
      .map((item) => {
        const label = singleLine(item.label);
        const message = singleLine(item.message);
        if (label === '' || message === '') return '';
        const color = item.color !== '' ? item.color : ctx.theme.accentColor || DEFAULT_THEME.accentColor;
        const image = `![${escapeAlt(`${label}: ${message}`)}](${safeUrl(shieldsBadgeUrl(label, message, color))})`;
        const link = safeUrl(item.link);
        return link === '' ? image : `[${image}](${link})`;
      })
      .filter((badge) => badge !== '')
      .join(' '),
  validate: (data) =>
    data.items.length > RECOMMENDED_MAX ? [{ code: 'tooManyBadges', params: { count: data.items.length } }] : [],
});
```

Create `src/lib/readme/blocks/architecture.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, nonEmptyLines, normalizeNewlines } from '../markdown-utils';

export const ARCHITECTURE_LIMITS = { heading: 200, content: 20_000, roadmapHeading: 200, roadmap: 5000 } as const;

const schema = z.object({
  heading: z.string().max(ARCHITECTURE_LIMITS.heading),
  content: z.string().max(ARCHITECTURE_LIMITS.content),
  roadmapHeading: z.string().max(ARCHITECTURE_LIMITS.roadmapHeading),
  roadmap: z.string().max(ARCHITECTURE_LIMITS.roadmap),
});

export type ArchitectureData = z.infer<typeof schema>;

export const architectureBlock = defineBlock<ArchitectureData>({
  type: 'architecture',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'architecture'),
    content: '',
    roadmapHeading: getDefaultText(meta.language, 'roadmap'),
    roadmap: '',
  }),
  toMarkdown: (data) => {
    const content = normalizeNewlines(data.content).trim();
    const steps = nonEmptyLines(data.roadmap);
    const sections: string[] = [];
    if (content !== '') sections.push([atxHeading(2, data.heading), content].filter((p) => p !== '').join('\n\n'));
    if (steps.length > 0) {
      const list = steps.map((step) => `- [ ] ${escapeMarkdownText(step)}`).join('\n');
      sections.push([atxHeading(2, data.roadmapHeading), list].filter((p) => p !== '').join('\n\n'));
    }
    return sections.join('\n\n');
  },
});
```

Create `src/lib/readme/blocks/contributing.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, normalizeNewlines, safeUrl } from '../markdown-utils';

export const CONTRIBUTING_LIMITS = { heading: 200, text: 5000, linkUrl: 2000, linkLabel: 100 } as const;

const schema = z.object({
  heading: z.string().max(CONTRIBUTING_LIMITS.heading),
  text: z.string().max(CONTRIBUTING_LIMITS.text),
  linkUrl: z.string().max(CONTRIBUTING_LIMITS.linkUrl),
  linkLabel: z.string().max(CONTRIBUTING_LIMITS.linkLabel),
});

export type ContributingData = z.infer<typeof schema>;

export const contributingBlock = defineBlock<ContributingData>({
  type: 'contributing',
  modes: ['project'],
  singleton: false,
  defaultOnCreate: false,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'contributing'),
    text: '',
    linkUrl: '',
    linkLabel: 'CONTRIBUTING.md',
  }),
  toMarkdown: (data) => {
    const text = normalizeNewlines(data.text).trim();
    const url = safeUrl(data.linkUrl);
    const label = escapeMarkdownText(data.linkLabel) || escapeMarkdownText(data.linkUrl);
    const link = url !== '' && label !== '' ? `[${label}](${url})` : '';
    if (text === '' && link === '') return '';
    return [atxHeading(2, data.heading), text, link].filter((part) => part !== '').join('\n\n');
  },
});
```

Create `src/lib/readme/blocks/license.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { atxHeading, escapeMarkdownText, nonEmptyLines } from '../markdown-utils';

export const LICENSE_LIMITS = { heading: 200, license: 100, holder: 200, year: 20, credits: 3000 } as const;

const schema = z.object({
  heading: z.string().max(LICENSE_LIMITS.heading),
  license: z.string().max(LICENSE_LIMITS.license),
  holder: z.string().max(LICENSE_LIMITS.holder),
  year: z.string().max(LICENSE_LIMITS.year),
  credits: z.string().max(LICENSE_LIMITS.credits),
});

export type LicenseData = z.infer<typeof schema>;

export const licenseBlock = defineBlock<LicenseData>({
  type: 'license',
  modes: ['project'],
  singleton: true,
  defaultOnCreate: true,
  recommended: true,
  schema,
  createData: (meta) => ({
    heading: getDefaultText(meta.language, 'license'),
    license: meta.license,
    holder: meta.author,
    year: '',
    credits: '',
  }),
  toMarkdown: (data, ctx) => {
    const license = escapeMarkdownText(data.license);
    const sentence = license === '' ? '' : getDefaultText(ctx.meta.language, 'licenseSentence').replace('{license}', () => license);
    const owner = escapeMarkdownText([data.year, data.holder].filter((part) => part.trim() !== '').join(' '));
    const credits = nonEmptyLines(data.credits);
    if (sentence === '' && owner === '' && credits.length === 0) return '';

    const parts = [atxHeading(2, data.heading), sentence, owner === '' ? '' : `© ${owner}`];
    if (credits.length > 0) {
      parts.push(
        atxHeading(3, getDefaultText(ctx.meta.language, 'acknowledgements')),
        credits.map((credit) => `- ${escapeMarkdownText(credit)}`).join('\n')
      );
    }
    return parts.filter((part) => part !== '').join('\n\n');
  },
});
```

- [ ] **Step 4: Enregistrer les blocs et le nouvel avertissement**

Modify `src/lib/readme/types.ts` : remplacer les lignes de `BlockType` et de `WarningCode`.

```ts
export type BlockType =
  | 'header'
  | 'badges'
  | 'visualProof'
  | 'installation'
  | 'usage'
  | 'architecture'
  | 'contributing'
  | 'license'
  | 'alert'
  | 'freeMarkdown';
```

```ts
export type WarningCode = 'imageMissingAlt' | 'htmlTagMismatch' | 'layoutTable' | 'tooManyBadges';
```

Replace `src/lib/readme/registry.ts` par :

```ts
import type { AnyBlockDefinition } from './block-definition';
import { alertBlock } from './blocks/alert';
import { architectureBlock } from './blocks/architecture';
import { badgesBlock } from './blocks/badges';
import { contributingBlock } from './blocks/contributing';
import { freeMarkdownBlock } from './blocks/free-markdown';
import { headerBlock } from './blocks/header';
import { installationBlock } from './blocks/installation';
import { licenseBlock } from './blocks/license';
import { usageBlock } from './blocks/usage';
import { visualProofBlock } from './blocks/visual-proof';
import type { BlockType, ReadmeMode } from './types';

// Order is the display order of the "add a block" menu and of a new README.
const DEFINITIONS: Record<BlockType, AnyBlockDefinition> = {
  header: headerBlock,
  badges: badgesBlock,
  visualProof: visualProofBlock,
  installation: installationBlock,
  usage: usageBlock,
  architecture: architectureBlock,
  contributing: contributingBlock,
  license: licenseBlock,
  alert: alertBlock,
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

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS (le contrat du registre couvre maintenant huit blocs) ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les blocs Badges, Architecture, Contribution et Licence

Badges Shields harmonisés sur la couleur d'accent du thème avec
avertissement au-delà de cinq, feuille de route en cases à cocher,
phrase de licence selon la langue du README, aucune valeur libre
interprétée comme du Markdown.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Table des matières

**Files:**
- Create: `src/lib/readme/headings.ts`, `src/lib/readme/blocks/table-of-contents.ts`
- Modify: `src/lib/readme/types.ts` (`BlockType`), `src/lib/readme/registry.ts`, `src/lib/readme/generate.ts`
- Test: `tests/readme/toc.test.ts`

**Interfaces:**
- Consumes: `linesOutsideFences` (`markdown-checks.ts`) ; `atxHeading` ; `getDefaultText` ; `GenerateContext.headings` et `AnyBlockDefinition.usesHeadings` (Tâche 2).
- Produces :
  - `headings.ts` : `extractH2(markdown: string): string[]` (intitulés de niveau 2 hors barrières, tels qu'écrits), `githubSlug(text: string): string`, `githubSlugs(texts: string[]): string[]` (suffixes `-1`, `-2` pour les doublons, comme GitHub).
  - `table-of-contents.ts` : `tableOfContentsBlock`, `TOC_HEADING_MAX = 200`, `TocData { heading }`.
  - `generateReadme` fait maintenant deux passes : les blocs ordinaires d'abord, puis la table des matières avec `ctx.headings`.
  - `BlockType` gagne `'tableOfContents'`, placé après `'visualProof'` dans le registre.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/toc.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { extractH2, githubSlug, githubSlugs } from '@/lib/readme/headings';
import { createBlock } from '@/lib/readme/state';
import { block, freeMarkdown, header, stateWith } from './helpers';

const toc = (heading = 'Table of contents') => block('t', 'tableOfContents', { heading });

describe('extractH2', () => {
  it('returns level-2 headings as written, ignoring other levels and code', () => {
    const md = '# T\n## A\n### B\n## C ##\n```\n## in code\n```\n#### D\n##NoSpace\n## ';
    expect(extractH2(md)).toEqual(['A', 'C']);
  });

  it('understands fences longer than three backticks', () => {
    expect(extractH2('````\n```\n## inner\n```\n````\n## outer')).toEqual(['outer']);
  });

  it('runs in linear time on hostile lines', () => {
    const hostile = ['## a' + ' '.repeat(50_000) + 'b', '## ' + '#'.repeat(50_000) + 'x', '##' + ' '.repeat(50_000)];
    for (const text of hostile) {
      const start = performance.now();
      extractH2(text);
      expect(performance.now() - start).toBeLessThan(200);
    }
  });
});

describe('githubSlug / githubSlugs', () => {
  it.each([
    ['Hello, World!', 'hello-world'],
    ['Créer & partager', 'créer--partager'],
    ['C++ / Rust', 'c--rust'],
    ['日本語 見出し', '日本語-見出し'],
    ['snake_case', 'snake_case'],
    ['1\\. Start', '1-start'],
    ['a\\_b', 'a_b'],
  ])('slug of %j is %j', (text, slug) => {
    expect(githubSlug(text)).toBe(slug);
  });

  it('numbers duplicates like GitHub does', () => {
    expect(githubSlugs(['Notes', 'Notes', 'Other', 'Notes'])).toEqual(['notes', 'notes-1', 'other', 'notes-2']);
  });
});

describe('table of contents block', () => {
  it('lists the level-2 headings of the other blocks, wherever the block is placed', () => {
    const state = stateWith([
      header('h', { title: 'Demo' }),
      toc(),
      block('i', 'installation', { heading: 'Installation', prerequisites: '', manager: 'none', packageName: '', commands: 'npm i' }),
      block('u', 'usage', { heading: '1. Start', description: 'Run', code: '', language: '' }),
      block('l', 'license', { heading: 'License', license: 'MIT', holder: '', year: '', credits: '' }),
    ]);
    const output = generateReadme(state);
    expect(output).toContain('## Table of contents\n\n- [Installation](#installation)\n- [1\\. Start](#1-start)\n- [License](#license)\n');
    expect(output).not.toContain('[Table of contents]');
  });

  it('numbers duplicate headings, handles non-ASCII text and ignores code and disabled blocks', () => {
    const state = stateWith([
      freeMarkdown('a', '## Notes\n\n```\n## not a heading\n```'),
      freeMarkdown('b', '## Notes\n\n## Créer & partager'),
      freeMarkdown('c', '## Hidden', false),
      toc(),
    ]);
    expect(generateReadme(state)).toContain(
      '## Table of contents\n\n- [Notes](#notes)\n- [Notes](#notes-1)\n- [Créer & partager](#créer--partager)\n'
    );
    expect(generateReadme(state)).not.toContain('Hidden](');
  });

  it('renders nothing when there is no heading to list', () => {
    expect(generateReadme(stateWith([header('h', { title: 'Demo' }), toc()]))).toBe('# Demo\n');
  });

  it('is created with a heading in the README language', () => {
    const created = createBlock('tableOfContents', { ...EMPTY_META, language: 'fr' });
    expect(created.data).toEqual({ heading: 'Table des matières' });
    const state = stateWith([freeMarkdown('a', '## A'), created]);
    expect(generateReadme(state)).toContain('## Table des matières\n\n- [A](#a)\n');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/toc.test.ts`
Expected: FAIL, module `@/lib/readme/headings` introuvable.

- [ ] **Step 3: Écrire les intitulés, le bloc et la génération en deux passes**

Create `src/lib/readme/headings.ts` :

```ts
import { linesOutsideFences } from './markdown-checks';

const SLUG_FORBIDDEN = new RegExp('[^\\p{L}\\p{N}\\p{M}_ -]', 'gu');

/** Removes an ATX closing sequence (`## Title ##`) without regex backtracking. */
function stripClosingHashes(text: string): string {
  let end = text.length;
  while (end > 0 && text[end - 1] === '#') end--;
  if (end < text.length && (end === 0 || text[end - 1] === ' ' || text[end - 1] === '\t')) {
    return text.slice(0, end).trimEnd();
  }
  return text;
}

/** Level-2 headings outside code fences, as written (backslash escapes kept). */
export function extractH2(markdown: string): string[] {
  const headings: string[] = [];
  for (const line of linesOutsideFences(markdown)) {
    const match = /^##[ \t]+(\S.*)$/.exec(line);
    if (!match) continue;
    const text = stripClosingHashes(match[1].trimEnd());
    if (text !== '') headings.push(text);
  }
  return headings;
}

/** GitHub's anchor for a heading: lowercase, punctuation removed, spaces to hyphens. */
export function githubSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\\(.)/g, '$1')
    .replace(SLUG_FORBIDDEN, '')
    .replace(/ /g, '-');
}

/** Anchors for a list of headings; repeated ones get `-1`, `-2`… as on GitHub. */
export function githubSlugs(texts: string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((text) => {
    const base = githubSlug(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  });
}
```

Create `src/lib/readme/blocks/table-of-contents.ts` :

```ts
import { z } from 'zod';
import { defineBlock } from '../block-definition';
import { getDefaultText } from '../default-texts';
import { githubSlugs } from '../headings';
import { atxHeading } from '../markdown-utils';

export const TOC_HEADING_MAX = 200;

const schema = z.object({ heading: z.string().max(TOC_HEADING_MAX) });

export type TocData = z.infer<typeof schema>;

export const tableOfContentsBlock = defineBlock<TocData>({
  type: 'tableOfContents',
  modes: ['project'],
  singleton: true,
  defaultOnCreate: false,
  usesHeadings: true,
  schema,
  createData: (meta) => ({ heading: getDefaultText(meta.language, 'toc') }),
  toMarkdown: (data, ctx) => {
    const headings = ctx.headings ?? [];
    if (headings.length === 0) return '';
    const anchors = githubSlugs(headings);
    const list = headings.map((text, index) => `- [${text}](#${anchors[index]})`).join('\n');
    return [atxHeading(2, data.heading), list].filter((part) => part !== '').join('\n\n');
  },
});
```

Replace `src/lib/readme/generate.ts` par :

```ts
import { extractH2 } from './headings';
import { getBlockDefinition } from './registry';
import type { GenerateContext, ReadmeState } from './types';

/**
 * Pure: turns the editor state into the README Markdown. Disabled blocks and
 * blocks that render to nothing are skipped; the rest are joined by one blank line.
 * Two passes: blocks that need the headings of the others (the table of contents)
 * render after all the other blocks.
 */
export function generateReadme(state: ReadmeState): string {
  const base: GenerateContext = { mode: state.mode, theme: state.theme, meta: state.meta };
  const entries = state.blocks
    .filter((block) => block.enabled)
    .map((block) => ({ block, def: getBlockDefinition(block.type) }));

  const firstPass = entries.map(({ block, def }) =>
    def.usesHeadings ? null : def.toMarkdown(block.data, base).trim()
  );
  const others = firstPass.filter((part): part is string => part !== null).join('\n\n');
  const ctx: GenerateContext = { ...base, headings: extractH2(others) };

  const parts = entries
    .map(({ block, def }, index) => firstPass[index] ?? def.toMarkdown(block.data, ctx).trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? `${parts.join('\n\n')}\n` : '';
}
```

- [ ] **Step 4: Enregistrer le bloc**

Modify `src/lib/readme/types.ts` : ajouter `| 'tableOfContents'` dans `BlockType`, juste après `| 'visualProof'`.

Modify `src/lib/readme/registry.ts` : ajouter l'import `import { tableOfContentsBlock } from './blocks/table-of-contents';` (après l'import de `licenseBlock`) et l'entrée `tableOfContents: tableOfContentsBlock,` dans `DEFINITIONS`, juste après `visualProof: visualProofBlock,`.

- [ ] **Step 5: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS (le contrat du registre couvre neuf blocs) ; aucune erreur de types.

- [ ] **Step 6: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute la table des matières générée

Génération en deux passes : la table liste les intitulés de niveau 2 des
autres blocs actifs, hors code, avec les ancres GitHub (doublons
numérotés, texte non ASCII). Extraction des intitulés en temps linéaire.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Opérations d'état de l'assistant

**Files:**
- Modify: `src/lib/readme/state.ts`, `src/lib/readme/registry.ts`
- Test: `tests/readme/state.test.ts`

**Interfaces:**
- Consumes: `getCatalog`, `getBlockDefinition` (`registry.ts`) ; `createBlock` (`state.ts`).
- Produces (utilisés par l'assistant, Tâche 11) :
  - `registry.ts` : `getRecommendedTypes(mode: ReadmeMode): BlockType[]` (blocs `recommended` du catalogue du mode, dans l'ordre du catalogue).
  - `state.ts` : `applySelection(state, selected: readonly BlockType[]): ReadmeState` (garde les blocs existants des types cochés, dans l'ordre, avec leurs données ; retire ceux des types décochés ; crée, à partir de `state.meta`, un bloc pour chaque type coché absent ; ignore les types hors du catalogue du mode), `updateMeta(state, patch: Partial<ReadmeMeta>): ReadmeState`, `setAccentColor(state, color: string): ReadmeState` (accepte `#` initial et majuscules ; ignore une valeur qui n'est pas de six chiffres hexadécimaux, en renvoyant le même état).

- [ ] **Step 1: Écrire les tests qui échouent**

Modify `tests/readme/state.test.ts` : remplacer **uniquement** l'import `import { addBlock, … } from '@/lib/readme/state';` (garder la première ligne, `import { describe, expect, it } from 'vitest';`) par :

```ts
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
```

Ajouter à la fin du fichier :

```ts
describe('getRecommendedTypes', () => {
  it('lists the critical and recommended blocks of the project catalog, in catalog order', () => {
    expect(getRecommendedTypes('project')).toEqual(['header', 'badges', 'visualProof', 'installation', 'usage', 'license']);
  });

  it('is empty for the profile catalog, which has no recommended block yet', () => {
    expect(getRecommendedTypes('profile')).toEqual([]);
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/state.test.ts`
Expected: FAIL (`applySelection`, `updateMeta`, `setAccentColor` et `getRecommendedTypes` sont `undefined` : `TypeError … is not a function`).

- [ ] **Step 3: Implémenter**

Modify `src/lib/readme/registry.ts` : ajouter à la fin du fichier.

```ts
/** Blocks pre-ticked in the wizard's "Sections" step for a mode, in catalog order. */
export function getRecommendedTypes(mode: ReadmeMode): BlockType[] {
  return getCatalog(mode)
    .filter((def) => def.recommended)
    .map((def) => def.type);
}
```

Modify `src/lib/readme/state.ts` : ajouter à la fin du fichier.

```ts
/**
 * Applies the wizard's "Sections" choice: keeps the existing blocks of the
 * selected types (order and data untouched), drops the others, and creates one
 * block, seeded from `state.meta`, for each selected type that has none yet.
 */
export function applySelection(state: ReadmeState, selected: readonly BlockType[]): ReadmeState {
  const wanted = new Set(selected);
  const kept = state.blocks.filter((block) => wanted.has(block.type));
  const present = new Set(kept.map((block) => block.type));
  const added = getCatalog(state.mode)
    .filter((def) => wanted.has(def.type) && !present.has(def.type))
    .map((def) => createBlock(def.type, state.meta));
  return { ...state, blocks: [...kept, ...added] };
}

export function updateMeta(state: ReadmeState, patch: Partial<ReadmeMeta>): ReadmeState {
  return { ...state, meta: { ...state.meta, ...patch } };
}

/** Sets the badge accent color; anything but six hex digits leaves the state untouched. */
export function setAccentColor(state: ReadmeState, color: string): ReadmeState {
  const hex = color.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return state;
  return { ...state, theme: { ...state.theme, accentColor: hex.toLowerCase() } };
}
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les opérations d'état de l'assistant

applySelection conserve les blocs existants des types cochés et crée les
autres depuis les métadonnées ; updateMeta et setAccentColor ; liste des
blocs recommandés par mode.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```


---

### Task 8: Extraction depuis un fichier manifest

**Files:**
- Create: `src/lib/readme/extract.ts`
- Test: `tests/readme/extract.test.ts`

**Interfaces:**
- Consumes: `META_LIMITS` (`defaults.ts`) ; `singleLine` (`markdown-utils.ts`) ; `ReadmeMeta` (`types.ts`).
- Produces (utilisés par `github.ts` et l'interface) :
  - Types : `ExtractedMeta { name?; description?; license?; repoUrl?; author?; installCommand?: string }`, `ExtractedKey` (ses six clés), `ExtractErrorCode = 'unsupportedFile' | 'invalidFile' | 'invalidUrl' | 'rateLimit' | 'notFound' | 'network' | 'invalidResponse'`, `ExtractResult = { ok: true; meta: ExtractedMeta } | { ok: false; error: ExtractErrorCode }`, `GithubRef { owner: string; repo: string }`.
  - `MAX_MANIFEST_BYTES = 1_000_000`, `EXTRACTED_KEYS`.
  - `clean(value: unknown): string` (texte d'une ligne, au plus 2 000 caractères, `''` si ce n'est pas une chaîne), `compact(meta): ExtractedMeta` (retire les champs vides), `normalizeRepoUrl(value: string): string` (`''` si l'adresse n'est pas http(s), git ou un raccourci `owner/repo`).
  - `parsePackageJson`, `parseCargoToml`, `parsePyproject` : `(text: string) => ExtractResult`. `parseManifestFile(fileName: string, text: string): ExtractResult`.
  - `parseGithubUrl(input: string): GithubRef | null`.
  - `mergeMeta(current: ReadmeMeta, extracted: ExtractedMeta): { meta: ReadmeMeta; filled: ExtractedKey[] }` : ne remplit que les champs vides, tronque à `META_LIMITS`.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/extract.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_META, META_LIMITS } from '@/lib/readme/defaults';
import {
  MAX_MANIFEST_BYTES,
  mergeMeta,
  parseCargoToml,
  parseGithubUrl,
  parseManifestFile,
  parsePackageJson,
  parsePyproject,
} from '@/lib/readme/extract';

const toml = (...lines: string[]) => lines.join('\n');

describe('parsePackageJson', () => {
  it('reads the fields and builds an install command', () => {
    const text = JSON.stringify({
      name: '@scope/demo',
      description: 'A demo',
      license: 'MIT',
      repository: { type: 'git', url: 'git+https://github.com/o/r.git' },
      author: 'Jane Doe <jane@x.io> (https://x.io)',
    });
    expect(parsePackageJson(text)).toEqual({
      ok: true,
      meta: {
        name: '@scope/demo',
        description: 'A demo',
        license: 'MIT',
        repoUrl: 'https://github.com/o/r',
        author: 'Jane Doe',
        installCommand: 'npm install @scope/demo',
      },
    });
  });

  it('accepts shorthand repositories, author objects and license objects', () => {
    const result = parsePackageJson(
      JSON.stringify({ name: 'a', repository: 'github:o/r', author: { name: 'Jane' }, license: { type: 'ISC' } })
    );
    expect(result).toEqual({
      ok: true,
      meta: { name: 'a', repoUrl: 'https://github.com/o/r', author: 'Jane', license: 'ISC', installCommand: 'npm install a' },
    });
    expect(parsePackageJson(JSON.stringify({ repository: 'o/r' }))).toEqual({
      ok: true,
      meta: { repoUrl: 'https://github.com/o/r' },
    });
  });

  it('ignores values of the wrong type and non-web repository addresses', () => {
    const text = JSON.stringify({
      name: 42,
      description: ['x'],
      license: { type: 'ISC' },
      repository: 'javascript:alert(1)',
      author: { name: 5 },
    });
    expect(parsePackageJson(text)).toEqual({ ok: true, meta: { license: 'ISC' } });
  });

  it('flattens line breaks and does not build a command from an unsafe name', () => {
    const result = parsePackageJson(JSON.stringify({ name: 'a b; rm -rf', description: 'x\ny' }));
    expect(result).toEqual({ ok: true, meta: { name: 'a b; rm -rf', description: 'x y' } });
  });

  it.each(['not json', 'null', '[]', '42', '"text"', ''])('rejects %j as an invalid file', (text) => {
    expect(parsePackageJson(text)).toEqual({ ok: false, error: 'invalidFile' });
  });
});

describe('parseCargoToml', () => {
  it('reads the [package] section, ignoring comments and other sections', () => {
    const text = toml(
      '[package]',
      'name = "demo"   # a comment',
      'version = "0.1.0"',
      'description = "A demo # not a comment"',
      'license = "MIT OR Apache-2.0"',
      'repository = "https://github.com/o/r"',
      'authors = ["Jane Doe <jane@x.io>", "Bob"]',
      '',
      '[dependencies]',
      'serde = "1"'
    );
    expect(parseCargoToml(text)).toEqual({
      ok: true,
      meta: {
        name: 'demo',
        description: 'A demo # not a comment',
        license: 'MIT OR Apache-2.0',
        repoUrl: 'https://github.com/o/r',
        author: 'Jane Doe',
        installCommand: 'cargo add demo',
      },
    });
  });

  it('unescapes quotes, skips multi-line strings and array-of-tables entries', () => {
    const text = toml(
      '[package]',
      'name = "demo"',
      'description = "say \\"hi\\""',
      '[[bin]]',
      'name = "not-the-package"',
      '[other]',
      'license = "GPL"'
    );
    expect(parseCargoToml(text)).toEqual({
      ok: true,
      meta: { name: 'demo', description: 'say "hi"', installCommand: 'cargo add demo' },
    });
    const multiline = toml('[package]', 'name = "demo"', 'description = """', 'long', '"""');
    expect(parseCargoToml(multiline)).toEqual({ ok: true, meta: { name: 'demo', installCommand: 'cargo add demo' } });
  });

  it('rejects a file without a [package] section', () => {
    expect(parseCargoToml('[workspace]\nmembers = []')).toEqual({ ok: false, error: 'invalidFile' });
    expect(parseCargoToml('')).toEqual({ ok: false, error: 'invalidFile' });
  });
});

describe('parsePyproject', () => {
  it('reads a PEP 621 [project] table', () => {
    const text = toml(
      '[project]',
      'name = "demo-pkg"',
      'description = "A demo"',
      'license = { text = "MIT" }',
      'authors = [{ name = "Jane Doe", email = "jane@x.io" }]',
      '',
      '[project.urls]',
      'Homepage = "https://demo.example"',
      'Repository = "https://github.com/o/r"'
    );
    expect(parsePyproject(text)).toEqual({
      ok: true,
      meta: {
        name: 'demo-pkg',
        description: 'A demo',
        license: 'MIT',
        repoUrl: 'https://github.com/o/r',
        author: 'Jane Doe',
        installCommand: 'pip install demo-pkg',
      },
    });
  });

  it('reads a Poetry [tool.poetry] table', () => {
    const text = toml(
      '[tool.poetry]',
      'name = "poet"',
      'description = "P"',
      'license = "Apache-2.0"',
      'authors = ["Jane <j@x.io>"]',
      'repository = "https://github.com/o/p"'
    );
    expect(parsePyproject(text)).toEqual({
      ok: true,
      meta: {
        name: 'poet',
        description: 'P',
        license: 'Apache-2.0',
        repoUrl: 'https://github.com/o/p',
        author: 'Jane',
        installCommand: 'pip install poet',
      },
    });
  });

  it('rejects a file with neither table', () => {
    expect(parsePyproject('[build-system]\nrequires = []')).toEqual({ ok: false, error: 'invalidFile' });
  });
});

describe('parseManifestFile', () => {
  it('picks the parser from the file name, ignoring the folder and the case', () => {
    expect(parseManifestFile('package.json', '{"name":"a"}').ok).toBe(true);
    expect(parseManifestFile('my/dir/Cargo.TOML', '[package]\nname = "a"').ok).toBe(true);
    expect(parseManifestFile('C:\\x\\pyproject.toml', '[project]\nname = "a"').ok).toBe(true);
  });

  it('rejects other files and oversized ones', () => {
    expect(parseManifestFile('README.md', '# x')).toEqual({ ok: false, error: 'unsupportedFile' });
    expect(parseManifestFile('package.json', ' '.repeat(MAX_MANIFEST_BYTES + 1))).toEqual({
      ok: false,
      error: 'invalidFile',
    });
  });

  it('handles very large hostile values quickly', () => {
    const huge = 900_000;
    const cases: [string, string][] = [
      ['package.json', JSON.stringify({ name: 'a', author: '<'.repeat(huge), description: ' '.repeat(huge) })],
      ['Cargo.toml', toml('[package]', `name = "${'a'.repeat(huge)}"`, `description = ${' '.repeat(50_000)}x`)],
      ['pyproject.toml', toml('[project]', `authors = [${'{ name = "x" ,'.repeat(50_000)}]`, `name = "ok"`)],
    ];
    for (const [file, text] of cases) {
      const start = performance.now();
      parseManifestFile(file, text);
      expect(performance.now() - start, file).toBeLessThan(500);
    }
  });
});

describe('parseGithubUrl', () => {
  it.each([
    ['https://github.com/o/r', { owner: 'o', repo: 'r' }],
    ['github.com/o/r.git', { owner: 'o', repo: 'r' }],
    ['http://www.github.com/o/r/', { owner: 'o', repo: 'r' }],
    ['  https://github.com/my.org/my.repo  ', { owner: 'my.org', repo: 'my.repo' }],
  ])('accepts %j', (input, expected) => {
    expect(parseGithubUrl(input)).toEqual(expected);
  });

  it.each([
    '',
    'https://github.com/o',
    'https://evil.example/github.com/o/r',
    'https://github.com/../r',
    'https://github.com/o/..',
    'https://github.com/o/r/tree/main',
    'https://github.com/o/r?x=1',
    'ftp://github.com/o/r',
    'javascript:alert(1)',
    `https://github.com/${'a'.repeat(101)}/r`,
  ])('rejects %j', (input) => {
    expect(parseGithubUrl(input)).toBeNull();
  });
});

describe('mergeMeta', () => {
  it('fills only the empty fields and reports them in order', () => {
    const current = { ...EMPTY_META, name: 'Typed', description: '   ' };
    const { meta, filled } = mergeMeta(current, { name: 'Other', description: 'From file', license: 'MIT' });
    expect(meta).toEqual({ ...current, description: 'From file', license: 'MIT' });
    expect(filled).toEqual(['description', 'license']);
  });

  it('flattens line breaks and skips empty values', () => {
    const { meta, filled } = mergeMeta(EMPTY_META, { name: 'a\nb', author: '  ', repoUrl: '' });
    expect(meta.name).toBe('a b');
    expect(filled).toEqual(['name']);
  });

  it('truncates every value to its META_LIMITS so blocks seeded from it stay valid', () => {
    const long = 'x'.repeat(5000);
    const { meta } = mergeMeta(EMPTY_META, {
      name: long, description: long, license: long, repoUrl: long, author: long, installCommand: long,
    });
    expect(meta.name).toHaveLength(META_LIMITS.name);
    expect(meta.description).toHaveLength(META_LIMITS.description);
    expect(meta.license).toHaveLength(META_LIMITS.license);
    expect(meta.repoUrl).toHaveLength(META_LIMITS.repoUrl);
    expect(meta.author).toHaveLength(META_LIMITS.author);
    expect(meta.installCommand).toHaveLength(META_LIMITS.installCommand);
  });

  it('never touches the README language', () => {
    expect(mergeMeta({ ...EMPTY_META, language: 'fr' }, { name: 'a' }).meta.language).toBe('fr');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/extract.test.ts`
Expected: FAIL, module `@/lib/readme/extract` introuvable.

- [ ] **Step 3: Écrire l'extraction**

Create `src/lib/readme/extract.ts` :

```ts
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
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute l'extraction depuis package.json, Cargo.toml et pyproject.toml

Lecteurs purs et tolérants (aucune exception, valeurs coupées avant toute
regex), lecteur TOML minimal, validation stricte de l'URL GitHub et
fusion qui ne remplit que les champs vides en respectant META_LIMITS.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Client GitHub

**Files:**
- Create: `src/lib/readme/github.ts`
- Test: `tests/readme/github.test.ts`

**Interfaces:**
- Consumes: `clean`, `compact`, `normalizeRepoUrl`, `ExtractResult`, `GithubRef` (`extract.ts`).
- Produces: `GITHUB_API = 'https://api.github.com'` ; `fetchGithubMeta(ref: GithubRef, fetchFn?: typeof fetch, timeoutMs?: number): Promise<ExtractResult>`. Une seule requête, `GET /repos/{owner}/{repo}`. Codes d'erreur : `notFound` (404), `rateLimit` (429, ou 403 avec `x-ratelimit-remaining: 0`), `network` (`fetch` rejette, y compris sur délai dépassé), `invalidResponse` (autre statut d'erreur, JSON illisible ou sans `name`). Ne lève jamais d'exception.

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/readme/github.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { fetchGithubMeta, GITHUB_API } from '@/lib/readme/github';

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

function fakeFetch(handler: Handler): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)) as typeof fetch;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const ref = { owner: 'octo', repo: 'hello.world' };

describe('fetchGithubMeta', () => {
  it('makes one request to the repository endpoint and maps the fields', async () => {
    const calls: { url: string; accept: string | null }[] = [];
    const result = await fetchGithubMeta(
      ref,
      fakeFetch((url, init) => {
        calls.push({ url, accept: new Headers(init?.headers).get('accept') });
        return json({
          name: 'hello.world',
          description: 'Desc',
          html_url: 'https://github.com/octo/hello.world',
          license: { spdx_id: 'MIT' },
          owner: { login: 'octo' },
        });
      })
    );
    expect(calls).toEqual([{ url: `${GITHUB_API}/repos/octo/hello.world`, accept: 'application/vnd.github+json' }]);
    expect(result).toEqual({
      ok: true,
      meta: {
        name: 'hello.world',
        description: 'Desc',
        license: 'MIT',
        repoUrl: 'https://github.com/octo/hello.world',
        author: 'octo',
      },
    });
  });

  it('copes with null fields and a license GitHub could not identify', async () => {
    const result = await fetchGithubMeta(
      ref,
      fakeFetch(() => json({ name: 'x', description: null, license: { spdx_id: 'NOASSERTION' }, owner: { login: 'o' } }))
    );
    expect(result).toEqual({ ok: true, meta: { name: 'x', author: 'o' } });
    const noLicense = await fetchGithubMeta(ref, fakeFetch(() => json({ name: 'x', license: null })));
    expect(noLicense).toEqual({ ok: true, meta: { name: 'x' } });
  });

  it('encodes the owner and repository in the URL', async () => {
    let requested = '';
    await fetchGithubMeta(
      { owner: 'a b', repo: 'c/d' },
      fakeFetch((url) => {
        requested = url;
        return json({ name: 'x' });
      })
    );
    expect(requested).toBe(`${GITHUB_API}/repos/a%20b/c%2Fd`);
  });

  it.each([
    ['a missing repository', () => new Response('{}', { status: 404 }), 'notFound'],
    ['HTTP 429', () => new Response('', { status: 429 }), 'rateLimit'],
    [
      'HTTP 403 with no request left',
      () => new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
      'rateLimit',
    ],
    ['HTTP 403 for another reason', () => new Response('{}', { status: 403 }), 'invalidResponse'],
    ['a server error', () => new Response('oops', { status: 500 }), 'invalidResponse'],
    ['a body that is not JSON', () => new Response('<html>', { status: 200 }), 'invalidResponse'],
    ['a body without a name', () => json({ description: 'x' }), 'invalidResponse'],
    ['a body that is not an object', () => json([1, 2]), 'invalidResponse'],
  ])('reports %s', async (_label, respond, error) => {
    expect(await fetchGithubMeta(ref, fakeFetch(respond))).toEqual({ ok: false, error });
  });

  it('reports a network failure without throwing', async () => {
    const failing = fakeFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    expect(await fetchGithubMeta(ref, failing)).toEqual({ ok: false, error: 'network' });
  });

  it('cuts oversized values', async () => {
    const result = await fetchGithubMeta(ref, fakeFetch(() => json({ name: 'x', description: 'y'.repeat(100_000) })));
    expect(result.ok && result.meta.description?.length).toBe(2000);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run tests/readme/github.test.ts`
Expected: FAIL, module `@/lib/readme/github` introuvable.

- [ ] **Step 3: Écrire le client**

Create `src/lib/readme/github.ts` :

```ts
import { z } from 'zod';
import { clean, compact, normalizeRepoUrl, type ExtractResult, type GithubRef } from './extract';

export const GITHUB_API = 'https://api.github.com';

const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  html_url: z.string().nullish(),
  license: z.object({ spdx_id: z.string().nullish() }).nullish(),
  owner: z.object({ login: z.string() }).nullish(),
});

/** SPDX ids GitHub returns when it could not identify a license. */
const NOT_A_LICENSE = new Set(['NOASSERTION', 'OTHER']);

/**
 * Public repository metadata: a single unauthenticated request, so it uses at
 * most one of the 60 requests per hour GitHub allows per address. `fetchFn` is
 * injectable for tests. Never throws: every failure becomes an error code.
 */
export async function fetchGithubMeta(
  ref: GithubRef,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 8000
): Promise<ExtractResult> {
  let response: Response;
  try {
    response = await fetchFn(`${GITHUB_API}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, error: 'network' };
  }

  if (response.status === 404) return { ok: false, error: 'notFound' };
  if (response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')) {
    return { ok: false, error: 'rateLimit' };
  }
  if (!response.ok) return { ok: false, error: 'invalidResponse' };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, error: 'invalidResponse' };
  }
  const parsed = repoSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: 'invalidResponse' };

  const repo = parsed.data;
  const spdx = clean(repo.license?.spdx_id);
  return {
    ok: true,
    meta: compact({
      name: clean(repo.name),
      description: clean(repo.description),
      license: NOT_A_LICENSE.has(spdx) ? '' : spdx,
      repoUrl: normalizeRepoUrl(clean(repo.html_url)),
      author: clean(repo.owner?.login),
    }),
  };
}
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `npx vitest run tests/readme && npx tsc --noEmit`
Expected: PASS ; aucune erreur de types.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readme tests/readme
git commit -m "$(cat <<'EOF'
feat(readme): ajoute le client GitHub pour l'extraction

Une seule requête sur l'API publique, fetch injectable, codes d'erreur
distincts (introuvable, limite de débit, réseau, réponse invalide) et
aucune exception.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Formulaires de blocs

Les composants React ne sont pas couverts par `vitest` (environnement `node`). Toute leur logique vit déjà dans `src/lib/readme/` ; cette tâche se vérifie par le typage, le lint et le contrôle manuel de la Tâche 12.

**Files:**
- Modify (réécriture complète): `src/components/readme-generator/block-forms.tsx`

**Interfaces:**
- Consumes: les schémas, limites et types de données de chaque bloc (Tâches 4 à 6) ; clés `blocks.*`, `fields.*`, `hints.*`, `placeholders.*` (Tâche 3).
- Produces: `BlockForm({ block, onChange })`, inchangé pour l'appelant, avec un cas par type de bloc (onze).

- [ ] **Step 1: Réécrire `block-forms.tsx`**

Replace `src/components/readme-generator/block-forms.tsx` par :

```tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from '@/components/icons';
import { ALERT_KINDS, ALERT_TEXT_MAX, type AlertData } from '@/lib/readme/blocks/alert';
import { ARCHITECTURE_LIMITS, type ArchitectureData } from '@/lib/readme/blocks/architecture';
import { BADGE_LIMITS, type BadgeItem, type BadgesData } from '@/lib/readme/blocks/badges';
import { CONTRIBUTING_LIMITS, type ContributingData } from '@/lib/readme/blocks/contributing';
import { FREE_MARKDOWN_MAX_LENGTH, type FreeMarkdownData } from '@/lib/readme/blocks/free-markdown';
import { HEADER_LIMITS, type HeaderData } from '@/lib/readme/blocks/header';
import {
  INSTALL_LIMITS,
  INSTALL_MANAGERS,
  type InstallManager,
  type InstallationData,
} from '@/lib/readme/blocks/installation';
import { LICENSE_LIMITS, type LicenseData } from '@/lib/readme/blocks/license';
import { TOC_HEADING_MAX, type TocData } from '@/lib/readme/blocks/table-of-contents';
import { USAGE_LIMITS, type UsageData } from '@/lib/readme/blocks/usage';
import { VISUAL_PROOF_LIMITS, type VisualProofData } from '@/lib/readme/blocks/visual-proof';
import type { Block } from '@/lib/readme/types';
import { cn } from '@/lib/utils';

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const LICENSE_SUGGESTIONS = [
  'MIT', 'Apache-2.0', 'GPL-3.0', 'LGPL-3.0', 'AGPL-3.0', 'BSD-3-Clause', 'BSD-2-Clause',
  'MPL-2.0', 'ISC', 'Unlicense', 'CC0-1.0',
];

interface FormProps<T> {
  idPrefix: string;
  data: T;
  onChange: (data: T) => void;
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  list?: string;
}

function TextField({ id, label, value, max, onChange, placeholder, hint, list }: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        list={list}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

interface AreaFieldProps extends Omit<TextFieldProps, 'list'> {
  rows?: number;
  mono?: boolean;
}

function AreaField({ id, label, value, max, onChange, placeholder, hint, rows = 4, mono = false }: AreaFieldProps) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        className={cn(mono && 'font-mono text-sm')}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Field id={id} label={label}>
      <select id={id} className={SELECT_CLASS} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * A hex color input that only reports values the schema accepts (empty or six
 * digits), so a half-typed color never reaches the state and never gets saved.
 */
function ColorField({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={draft}
        maxLength={6}
        placeholder="0969da"
        aria-invalid={draft.length !== 0 && draft.length !== 6}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9a-fA-F]/g, '');
          setDraft(next);
          if (next.length === 0 || next.length === 6) onChange(next.toLowerCase());
        }}
      />
    </Field>
  );
}

function HeaderForm({ idPrefix, data, onChange }: FormProps<HeaderData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<HeaderData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-title`} label={t('fields.title')} value={data.title} max={HEADER_LIMITS.title} placeholder={t('placeholders.title')} onChange={(title) => set({ title })} />
      <TextField id={`${idPrefix}-tagline`} label={t('fields.tagline')} value={data.tagline} max={HEADER_LIMITS.tagline} placeholder={t('placeholders.tagline')} onChange={(tagline) => set({ tagline })} />
      <TextField id={`${idPrefix}-logoUrl`} label={t('fields.logoUrl')} value={data.logoUrl} max={HEADER_LIMITS.logoUrl} placeholder={t('placeholders.logoUrl')} onChange={(logoUrl) => set({ logoUrl })} />
      <TextField id={`${idPrefix}-logoAlt`} label={t('fields.logoAlt')} value={data.logoAlt} max={HEADER_LIMITS.logoAlt} placeholder={t('placeholders.logoAlt')} onChange={(logoAlt) => set({ logoAlt })} />
    </div>
  );
}

function BadgesForm({ idPrefix, data, onChange }: FormProps<BadgesData>) {
  const t = useTranslations('readmeGenerator');
  const setItem = (index: number, patch: Partial<BadgeItem>) =>
    onChange({ items: data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  return (
    <div className="space-y-4">
      {data.items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id={`${idPrefix}-${index}-label`} label={t('fields.badgeLabel')} value={item.label} max={BADGE_LIMITS.label} onChange={(label) => setItem(index, { label })} />
            <TextField id={`${idPrefix}-${index}-message`} label={t('fields.badgeMessage')} value={item.message} max={BADGE_LIMITS.message} onChange={(message) => setItem(index, { message })} />
            <ColorField id={`${idPrefix}-${index}-color`} label={t('fields.badgeColor')} hint={t('hints.badgeColor')} value={item.color} onChange={(color) => setItem(index, { color })} />
            <TextField id={`${idPrefix}-${index}-link`} label={t('fields.badgeLink')} value={item.link} max={BADGE_LIMITS.link} onChange={(link) => setItem(index, { link })} />
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ items: data.items.filter((_, i) => i !== index) })}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('fields.removeBadge')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={data.items.length >= BADGE_LIMITS.maxItems}
        onClick={() => onChange({ items: [...data.items, { label: '', message: '', color: '', link: '' }] })}
      >
        <Plus className="w-4 h-4 mr-1" />
        {t('fields.addBadge')}
      </Button>
    </div>
  );
}

function VisualProofForm({ idPrefix, data, onChange }: FormProps<VisualProofData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<VisualProofData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-url`} label={t('fields.url')} value={data.url} max={VISUAL_PROOF_LIMITS.url} placeholder={t('placeholders.logoUrl')} onChange={(url) => set({ url })} />
      <TextField id={`${idPrefix}-alt`} label={t('fields.alt')} value={data.alt} max={VISUAL_PROOF_LIMITS.alt} onChange={(alt) => set({ alt })} />
      <TextField id={`${idPrefix}-caption`} label={t('fields.caption')} value={data.caption} max={VISUAL_PROOF_LIMITS.caption} onChange={(caption) => set({ caption })} />
    </div>
  );
}

function TocForm({ idPrefix, data, onChange }: FormProps<TocData>) {
  const t = useTranslations('readmeGenerator');
  return <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={TOC_HEADING_MAX} onChange={(heading) => onChange({ heading })} />;
}

function InstallationForm({ idPrefix, data, onChange }: FormProps<InstallationData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<InstallationData>) => onChange({ ...data, ...patch });
  const managers = INSTALL_MANAGERS.map((manager) => ({ value: manager, label: manager === 'none' ? '—' : manager }));
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={INSTALL_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-prerequisites`} label={t('fields.prerequisites')} hint={t('hints.prerequisites')} value={data.prerequisites} max={INSTALL_LIMITS.prerequisites} rows={3} onChange={(prerequisites) => set({ prerequisites })} />
      <SelectField<InstallManager> id={`${idPrefix}-manager`} label={t('fields.packageManager')} value={data.manager} options={managers} onChange={(manager) => set({ manager })} />
      <TextField id={`${idPrefix}-packageName`} label={t('fields.packageName')} value={data.packageName} max={INSTALL_LIMITS.packageName} placeholder={t('placeholders.packageName')} onChange={(packageName) => set({ packageName })} />
      <AreaField id={`${idPrefix}-commands`} label={t('fields.commands')} hint={t('hints.commands')} value={data.commands} max={INSTALL_LIMITS.commands} rows={3} mono onChange={(commands) => set({ commands })} />
    </div>
  );
}

function UsageForm({ idPrefix, data, onChange }: FormProps<UsageData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<UsageData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={USAGE_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-description`} label={t('fields.description')} value={data.description} max={USAGE_LIMITS.description} rows={3} onChange={(description) => set({ description })} />
      <AreaField id={`${idPrefix}-code`} label={t('fields.code')} value={data.code} max={USAGE_LIMITS.code} rows={6} mono onChange={(code) => set({ code })} />
      <TextField id={`${idPrefix}-language`} label={t('fields.codeLanguage')} value={data.language} max={USAGE_LIMITS.language} placeholder="js" onChange={(language) => set({ language })} />
    </div>
  );
}

function ArchitectureForm({ idPrefix, data, onChange }: FormProps<ArchitectureData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<ArchitectureData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={ARCHITECTURE_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-content`} label={t('fields.architecture')} value={data.content} max={ARCHITECTURE_LIMITS.content} rows={5} onChange={(content) => set({ content })} />
      <TextField id={`${idPrefix}-roadmapHeading`} label={t('fields.roadmapHeading')} value={data.roadmapHeading} max={ARCHITECTURE_LIMITS.roadmapHeading} onChange={(roadmapHeading) => set({ roadmapHeading })} />
      <AreaField id={`${idPrefix}-roadmap`} label={t('fields.roadmap')} hint={t('hints.roadmap')} value={data.roadmap} max={ARCHITECTURE_LIMITS.roadmap} rows={4} onChange={(roadmap) => set({ roadmap })} />
    </div>
  );
}

function ContributingForm({ idPrefix, data, onChange }: FormProps<ContributingData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<ContributingData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={CONTRIBUTING_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-text`} label={t('fields.text')} value={data.text} max={CONTRIBUTING_LIMITS.text} rows={4} onChange={(text) => set({ text })} />
      <TextField id={`${idPrefix}-linkUrl`} label={t('fields.linkUrl')} value={data.linkUrl} max={CONTRIBUTING_LIMITS.linkUrl} onChange={(linkUrl) => set({ linkUrl })} />
      <TextField id={`${idPrefix}-linkLabel`} label={t('fields.linkLabel')} value={data.linkLabel} max={CONTRIBUTING_LIMITS.linkLabel} onChange={(linkLabel) => set({ linkLabel })} />
    </div>
  );
}

function LicenseForm({ idPrefix, data, onChange }: FormProps<LicenseData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<LicenseData>) => onChange({ ...data, ...patch });
  const listId = `${idPrefix}-license-list`;
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={LICENSE_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-license`} label={t('fields.license')} value={data.license} max={LICENSE_LIMITS.license} list={listId} onChange={(license) => set({ license })} />
      <datalist id={listId}>
        {LICENSE_SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField id={`${idPrefix}-holder`} label={t('fields.holder')} value={data.holder} max={LICENSE_LIMITS.holder} onChange={(holder) => set({ holder })} />
        <TextField id={`${idPrefix}-year`} label={t('fields.year')} value={data.year} max={LICENSE_LIMITS.year} placeholder={String(new Date().getFullYear())} onChange={(year) => set({ year })} />
      </div>
      <AreaField id={`${idPrefix}-credits`} label={t('fields.credits')} hint={t('hints.credits')} value={data.credits} max={LICENSE_LIMITS.credits} rows={3} onChange={(credits) => set({ credits })} />
    </div>
  );
}

function AlertForm({ idPrefix, data, onChange }: FormProps<AlertData>) {
  const t = useTranslations('readmeGenerator');
  const kinds = ALERT_KINDS.map((kind) => ({ value: kind, label: kind }));
  return (
    <div className="space-y-3">
      <SelectField id={`${idPrefix}-kind`} label={t('fields.alertType')} value={data.kind} options={kinds} onChange={(kind) => onChange({ ...data, kind })} />
      <AreaField id={`${idPrefix}-text`} label={t('fields.text')} value={data.text} max={ALERT_TEXT_MAX} rows={3} onChange={(text) => onChange({ ...data, text })} />
    </div>
  );
}

function FreeMarkdownForm({ idPrefix, data, onChange }: FormProps<FreeMarkdownData>) {
  const t = useTranslations('readmeGenerator');
  return (
    <AreaField
      id={`${idPrefix}-content`}
      label={t('fields.content')}
      value={data.content}
      max={FREE_MARKDOWN_MAX_LENGTH}
      rows={10}
      mono
      placeholder={t('placeholders.content')}
      onChange={(content) => onChange({ content })}
    />
  );
}

interface BlockFormProps {
  block: Block;
  onChange: (data: unknown) => void;
}

/** Picks the form for a block type. Add one case per new block type. */
export function BlockForm({ block, onChange }: BlockFormProps) {
  const common = { idPrefix: block.id, onChange };
  switch (block.type) {
    case 'header':
      return <HeaderForm {...common} data={block.data as HeaderData} />;
    case 'badges':
      return <BadgesForm {...common} data={block.data as BadgesData} />;
    case 'visualProof':
      return <VisualProofForm {...common} data={block.data as VisualProofData} />;
    case 'tableOfContents':
      return <TocForm {...common} data={block.data as TocData} />;
    case 'installation':
      return <InstallationForm {...common} data={block.data as InstallationData} />;
    case 'usage':
      return <UsageForm {...common} data={block.data as UsageData} />;
    case 'architecture':
      return <ArchitectureForm {...common} data={block.data as ArchitectureData} />;
    case 'contributing':
      return <ContributingForm {...common} data={block.data as ContributingData} />;
    case 'license':
      return <LicenseForm {...common} data={block.data as LicenseData} />;
    case 'alert':
      return <AlertForm {...common} data={block.data as AlertData} />;
    case 'freeMarkdown':
      return <FreeMarkdownForm {...common} data={block.data as FreeMarkdownData} />;
    default:
      return null;
  }
}
```

- [ ] **Step 2: Vérifier types et lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: aucune erreur de types ni de lint. Si `tsc` signale que le paramètre `onChange: (data: unknown) => void` n'est pas assignable à `(data: HeaderData) => void`, ne pas ajouter de `any` : `(data: unknown) => void` accepte tout argument, l'assignation est valide ; l'erreur viendrait d'une faute de frappe dans un nom de champ.

- [ ] **Step 3: Commit**

```bash
git add src/components/readme-generator/block-forms.tsx
git commit -m "$(cat <<'EOF'
feat(readme): ajoute les formulaires des onze blocs

Champs limités aux longueurs du schéma, couleur de badge validée avant
d'atteindre l'état, aides de saisie et suggestions de licence.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Assistant, panneau d'extraction et intégration

Comme la Tâche 10, cette tâche est de l'interface : vérifiée par le typage, le lint et le contrôle manuel de la Tâche 12.

**Files:**
- Create: `src/components/readme-generator/extraction-panel.tsx`, `src/components/readme-generator/readme-wizard.tsx`
- Modify (réécriture complète): `src/components/readme-generator/readme-toolbar.tsx`, `src/components/readme-generator/readme-generator.tsx`

**Interfaces:**
- Consumes: `parseManifestFile`, `parseGithubUrl`, `mergeMeta`, `MAX_MANIFEST_BYTES`, `ExtractedKey`, `ExtractedMeta`, `ExtractResult` (`extract.ts`) ; `fetchGithubMeta` (`github.ts`) ; `applySelection`, `updateMeta`, `setAccentColor` (`state.ts`) ; `getCatalog`, `getRecommendedTypes` (`registry.ts`) ; `META_LIMITS` ; `locales`, `localeNames` ; clés `wizard.*`, `meta.*`, `extraction.*`, `modes.*Desc`, `toolbar.wizard`, `messages.wizardRemoved` (Tâche 3).
- Produces: `ExtractionPanel({ onExtracted })`, `ReadmeWizard(props)`, et un conteneur qui démarre sur l'assistant pour un premier passage (aucun état sauvegardé), sur l'éditeur sinon, avec un bouton « Assistant » pour rouvrir l'assistant.

- [ ] **Step 1: Panneau d'extraction**

Create `src/components/readme-generator/extraction-panel.tsx` :

```tsx
'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MAX_MANIFEST_BYTES,
  parseGithubUrl,
  parseManifestFile,
  type ExtractedKey,
  type ExtractedMeta,
  type ExtractResult,
} from '@/lib/readme/extract';
import { fetchGithubMeta } from '@/lib/readme/github';

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done'; failed: boolean; message: string };

interface ExtractionPanelProps {
  /** Merges the extracted values into the README and returns the fields it filled. */
  onExtracted: (extracted: ExtractedMeta) => ExtractedKey[];
}

export function ExtractionPanel({ onExtracted }: ExtractionPanelProps) {
  const t = useTranslations('readmeGenerator');
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const finish = (result: ExtractResult) => {
    if (!result.ok) {
      setStatus({ kind: 'done', failed: true, message: t(`extraction.${result.error}`) });
      return;
    }
    const filled = onExtracted(result.meta);
    const message =
      filled.length > 0
        ? t('extraction.success', { fields: filled.map((key) => t(`meta.${key}`)).join(', ') })
        : t('extraction.nothing');
    setStatus({ kind: 'done', failed: false, message });
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_MANIFEST_BYTES) {
      finish({ ok: false, error: 'invalidFile' });
      return;
    }
    try {
      finish(parseManifestFile(file.name, await file.text()));
    } catch {
      finish({ ok: false, error: 'invalidFile' });
    }
  };

  const handleFetch = async () => {
    const ref = parseGithubUrl(url);
    if (!ref) {
      finish({ ok: false, error: 'invalidUrl' });
      return;
    }
    setStatus({ kind: 'loading' });
    finish(await fetchGithubMeta(ref));
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <Label>{t('extraction.file')}</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload className="w-4 h-4 mr-1" />
            {t('extraction.choose')}
          </Button>
          <span className="text-xs text-muted-foreground">{t('extraction.privacy')}</span>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json,.toml,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="extraction-url">{t('extraction.url')}</Label>
        <div className="flex gap-2">
          <Input
            id="extraction-url"
            value={url}
            maxLength={300}
            placeholder={t('placeholders.repoUrl')}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleFetch();
            }}
          />
          <Button type="button" size="sm" disabled={url.trim() === '' || status.kind === 'loading'} onClick={() => void handleFetch()}>
            {t('extraction.fetch')}
          </Button>
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={status.kind === 'done' && status.failed ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
      >
        {status.kind === 'done' ? status.message : ''}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Assistant**

Create `src/components/readme-generator/readme-wizard.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { localeNames, locales } from '@/i18n/locales';
import { META_LIMITS } from '@/lib/readme/defaults';
import type { ExtractedKey, ExtractedMeta } from '@/lib/readme/extract';
import { getCatalog, getRecommendedTypes } from '@/lib/readme/registry';
import type { BlockType, ReadmeLanguage, ReadmeMode, ReadmeState } from '@/lib/readme/types';
import { cn } from '@/lib/utils';
import { ExtractionPanel } from './extraction-panel';

const STEP_COUNT = 5;
const STEP_KEYS = ['stepMode', 'stepStart', 'stepInfos', 'stepSections', 'stepStyle'] as const;
const ACCENT_PRESETS = ['0969da', '1a7f37', '8250df', 'bf3989', 'd1242f', '9a6700'];
const MODES: ReadmeMode[] = ['project', 'profile'];
const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

type MetaField = 'name' | 'description' | 'author' | 'license' | 'repoUrl' | 'installCommand';
const PROJECT_FIELDS: MetaField[] = ['name', 'description', 'author', 'license', 'repoUrl', 'installCommand'];
const PROFILE_FIELDS: MetaField[] = ['name', 'description'];

interface ReadmeWizardProps {
  state: ReadmeState;
  /** True for a first README: its blocks are created when the wizard ends. */
  isNew: boolean;
  onModeChange: (mode: ReadmeMode) => void;
  onMetaChange: (patch: Partial<ReadmeState['meta']>) => void;
  onAccentChange: (color: string) => void;
  onExtracted: (extracted: ExtractedMeta) => ExtractedKey[];
  onFinish: (selected: BlockType[]) => void;
}

export function ReadmeWizard({
  state,
  isNew,
  onModeChange,
  onMetaChange,
  onAccentChange,
  onExtracted,
  onFinish,
}: ReadmeWizardProps) {
  const t = useTranslations('readmeGenerator');
  const [step, setStep] = useState(1);
  const [showPrefill, setShowPrefill] = useState(false);
  const [filled, setFilled] = useState<ExtractedKey[]>([]);
  const [selected, setSelected] = useState<Set<BlockType>>(
    () => new Set(isNew ? getRecommendedTypes(state.mode) : state.blocks.map((block) => block.type))
  );
  const [accentDraft, setAccentDraft] = useState(state.theme.accentColor);
  const catalog = getCatalog(state.mode);
  const fields = state.mode === 'project' ? PROJECT_FIELDS : PROFILE_FIELDS;
  const accentValid = /^#?[0-9a-fA-F]{6}$/.test(accentDraft.trim());

  const chooseMode = (mode: ReadmeMode) => {
    onModeChange(mode);
    const allowed = new Set(getCatalog(mode).map((def) => def.type));
    setSelected((previous) =>
      isNew ? new Set(getRecommendedTypes(mode)) : new Set([...previous].filter((type) => allowed.has(type)))
    );
  };

  const toggle = (type: BlockType) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  const handleExtracted = (extracted: ExtractedMeta) => {
    const keys = onExtracted(extracted);
    setFilled((previous) => [...new Set([...previous, ...keys])]);
    return keys;
  };

  const finish = () => onFinish([...selected]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t('wizard.title')} · {t('wizard.step', { current: step, total: STEP_COUNT })}
          </p>
          <CardTitle>{t(`wizard.${STEP_KEYS[step - 1]}`)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('wizard.modeHint')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={state.mode === mode}
                    onClick={() => chooseMode(mode)}
                    className={cn(
                      'rounded-md border p-4 text-left transition-colors',
                      state.mode === mode ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                    )}
                  >
                    <span className="block font-medium">{t(`modes.${mode}`)}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{t(`modes.${mode}Desc`)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowPrefill(false);
                  setStep(3);
                }}
                className="w-full rounded-md border border-primary bg-primary/5 p-4 text-left"
              >
                <span className="block font-medium">{t('wizard.scratch')}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{t('wizard.scratchDesc')}</span>
              </button>
              <button
                type="button"
                aria-expanded={showPrefill}
                onClick={() => setShowPrefill((open) => !open)}
                className="w-full rounded-md border p-4 text-left hover:bg-muted"
              >
                <span className="block font-medium">{t('wizard.prefill')}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{t('wizard.prefillDesc')}</span>
              </button>
              {showPrefill && <ExtractionPanel onExtracted={handleExtracted} />}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('wizard.infosHint')}</p>
              {fields.map((field) => (
                <div key={field} className="space-y-1">
                  <Label htmlFor={`wizard-${field}`}>
                    {t(`meta.${field}`)}
                    {filled.includes(field) && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">({t('meta.autoFilled')})</span>
                    )}
                  </Label>
                  <Input
                    id={`wizard-${field}`}
                    value={state.meta[field]}
                    maxLength={META_LIMITS[field]}
                    placeholder={field === 'name' ? t('placeholders.title') : field === 'repoUrl' ? t('placeholders.repoUrl') : undefined}
                    onChange={(e) => onMetaChange({ [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label htmlFor="wizard-language">{t('meta.language')}</Label>
                <select
                  id="wizard-language"
                  className={SELECT_CLASS}
                  value={state.meta.language}
                  onChange={(e) => onMetaChange({ language: e.target.value as ReadmeLanguage })}
                >
                  {locales.map((locale) => (
                    <option key={locale} value={locale}>
                      {localeNames[locale]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('wizard.sectionsHint')}</p>
              <ul className="space-y-2">
                {catalog.map((def) => (
                  <li key={def.type}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selected.has(def.type)}
                        onChange={() => toggle(def.type)}
                      />
                      <span>{t(`blocks.${def.type}`)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('wizard.styleHint')}</p>
              <div className="space-y-2">
                <Label>{t('wizard.accent')}</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`#${hex}`}
                      aria-pressed={state.theme.accentColor === hex}
                      onClick={() => {
                        setAccentDraft(hex);
                        onAccentChange(hex);
                      }}
                      className={cn(
                        'h-8 w-8 rounded-full border',
                        state.theme.accentColor === hex && 'ring-2 ring-primary ring-offset-2'
                      )}
                      style={{ backgroundColor: `#${hex}` }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="wizard-accent">{t('wizard.accentCustom')}</Label>
                <Input
                  id="wizard-accent"
                  value={accentDraft}
                  maxLength={7}
                  aria-invalid={accentDraft.trim() !== '' && !accentValid}
                  onChange={(e) => {
                    setAccentDraft(e.target.value);
                    onAccentChange(e.target.value);
                  }}
                />
                {accentDraft.trim() !== '' && !accentValid && (
                  <p className="text-xs text-destructive">{t('wizard.accentInvalid')}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={finish}>
          {t('wizard.skip')}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
            {t('wizard.back')}
          </Button>
          {step < STEP_COUNT ? (
            <Button type="button" size="sm" onClick={() => setStep((s) => s + 1)}>
              {t('wizard.next')}
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={finish}>
              {t('wizard.finish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Barre d'outils avec le bouton « Assistant »**

Replace `src/components/readme-generator/readme-toolbar.tsx` par :

```tsx
'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Sparkles, Trash2, Upload } from '@/components/icons';
import type { ReadmeMode } from '@/lib/readme/types';

const MODES: ReadmeMode[] = ['project', 'profile'];

interface ReadmeToolbarProps {
  mode: ReadmeMode;
  onModeChange: (mode: ReadmeMode) => void;
  onOpenWizard: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onExportJson: () => void;
  onImportFile: (file: File) => void;
  onReset: () => void;
}

export function ReadmeToolbar({
  mode,
  onModeChange,
  onOpenWizard,
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
        <Button size="sm" variant="ghost" onClick={onOpenWizard}>
          <Sparkles className="w-4 h-4 mr-1" />
          {t('toolbar.wizard')}
        </Button>
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

- [ ] **Step 4: Conteneur : assistant au premier passage, éditeur ensuite**

Replace `src/components/readme-generator/readme-generator.tsx` par :

```tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics-events';
import { mergeMeta, type ExtractedKey, type ExtractedMeta } from '@/lib/readme/extract';
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
import type { BlockType, ReadmeMode, ReadmeState } from '@/lib/readme/types';
import { validateReadme } from '@/lib/readme/validate';
import { cn } from '@/lib/utils';
import { BlockForm } from './block-forms';
import { BlockList } from './block-list';
import { ReadmePreview } from './readme-preview';
import { ReadmeToolbar } from './readme-toolbar';
import { ReadmeWizard } from './readme-wizard';
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
  const [view, setView] = useState<'wizard' | 'editor'>('editor');
  // A first README has no block yet: the wizard creates them, seeded from what it collected.
  const [wizardIsNew, setWizardIsNew] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const storageWarned = useRef(false);
  const latestState = useRef<ReadmeState | null>(null);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(saved);
      return;
    }
    setState({ ...createInitialState('project'), blocks: [] });
    setWizardIsNew(true);
    setView('wizard');
  }, []);

  useEffect(() => {
    latestState.current = state;
  }, [state]);

  useEffect(() => {
    if (!state || (view === 'wizard' && wizardIsNew)) return;
    if (!saveState(state) && !storageWarned.current) {
      storageWarned.current = true;
      toast({ description: t('messages.storageUnavailable') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, view, wizardIsNew]);

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

  // Actions that replace the whole work (mode switch, import, reset, wizard) offer
  // to restore the state they replaced: the autosave would otherwise overwrite the
  // only copy.
  const undoAction = (previous: ReadmeState) => (
    <ToastAction
      altText={t('messages.undo')}
      onClick={() => {
        setState(previous);
        setSelectedId(null);
      }}
    >
      {t('messages.undo')}
    </ToastAction>
  );

  const handleModeChange = (mode: ReadmeMode) => {
    const result = switchMode(state, mode);
    setState(result.state);
    setSelectedId(null);
    if (result.dropped > 0) {
      toast({
        description: t('messages.modeSwitchDropped', { count: result.dropped }),
        action: undoAction(state),
      });
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
      toast({ description, action: undoAction(state) });
    } catch {
      toast({ description: t('messages.importError'), variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setState(createInitialState(state.mode));
    setSelectedId(null);
    toast({ description: t('messages.resetDone'), action: undoAction(state) });
  };

  const handleOpenWizard = () => {
    setWizardIsNew(false);
    setView('wizard');
  };

  const handleWizardMode = (mode: ReadmeMode) => {
    if (wizardIsNew) update((current) => ({ ...current, mode, blocks: [] }));
    else handleModeChange(mode);
  };

  // Reads the latest committed state so a slow request never overwrites what was typed meanwhile.
  const handleExtracted = (extracted: ExtractedMeta): ExtractedKey[] => {
    const current = latestState.current;
    if (!current) return [];
    const { filled } = mergeMeta(current.meta, extracted);
    update((latest) => ({ ...latest, meta: mergeMeta(latest.meta, extracted).meta }));
    return filled;
  };

  const handleWizardFinish = (selectedTypes: BlockType[]) => {
    const next = applySelection(state, selectedTypes);
    const removed = state.blocks.filter((block) => !next.blocks.some((kept) => kept.id === block.id)).length;
    setState(next);
    setSelectedId(null);
    setTab('edit');
    setView('editor');
    setWizardIsNew(false);
    if (removed > 0) {
      toast({ description: t('messages.wizardRemoved', { count: removed }), action: undoAction(state) });
    }
  };

  if (view === 'wizard') {
    return (
      <ReadmeWizard
        key={wizardIsNew ? 'new' : 'edit'}
        state={state}
        isNew={wizardIsNew}
        onModeChange={handleWizardMode}
        onMetaChange={(patch) => update((current) => updateMeta(current, patch))}
        onAccentChange={(color) => update((current) => setAccentColor(current, color))}
        onExtracted={handleExtracted}
        onFinish={handleWizardFinish}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <ReadmeToolbar
        mode={state.mode}
        onModeChange={handleModeChange}
        onOpenWizard={handleOpenWizard}
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
                  key={selected.id}
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

- [ ] **Step 5: Vérifier types et lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: aucune erreur de types ni de lint. Le `key={selected.id}` sur `BlockForm` réinitialise l'état local des champs de couleur quand on change de bloc.

- [ ] **Step 6: Commit**

```bash
git add src/components/readme-generator
git commit -m "$(cat <<'EOF'
feat(readme): ajoute l'assistant en cinq étapes et le panneau d'extraction

L'assistant démarre au premier passage, met en avant « Partir de zéro »,
propose l'import facultatif (fichier ou URL GitHub) sans jamais bloquer,
et applique la sélection de sections avec annulation. Le bouton
« Assistant » le rouvre depuis l'éditeur.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Vérification finale

**Files:**
- Aucun fichier de code nouveau.

**Interfaces:**
- Consumes: tout le plan.
- Produces: un mode Projet vérifié de bout en bout, toujours caché du public.

- [ ] **Step 1: Suite complète**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: tous les tests passent, aucune erreur de types, lint propre, build de production réussi (la route `/[locale]/tools/readme-generator` figure dans la liste des routes).

- [ ] **Step 2: Contrôle manuel dans le navigateur**

Run: `npm run dev`, puis ouvrir `http://localhost:3000/fr/tools/readme-generator` **avec un stockage vide** (fenêtre privée, ou `localStorage.removeItem('readme-generator:v1')` puis rechargement).

Créer un fichier `package.json` de test contenant `{"name":"demo-lib","description":"Une bibliothèque de démonstration","license":"MIT","author":"Jane Doe <jane@example.com>","repository":"github:jane/demo-lib"}`.

Vérifier, dans l'ordre :
1. Le premier passage ouvre l'**assistant** à l'étape 1 sur 5 ; « Passer à l'éditeur » est visible à toutes les étapes.
2. Étape 1 : choisir Projet. Étape 2 : « Partir de zéro » est le bouton mis en avant ; le cliquer saute à l'étape 3.
3. Revenir à l'étape 2 avec « Retour », ouvrir « Pré-remplir depuis un dépôt » : le message « Les fichiers restent dans votre navigateur » est visible. Importer le `package.json` de test : « Champs remplis : Nom, Description courte, Licence, URL du dépôt, Auteur, Commande d'installation. » s'affiche, et à l'étape 3 les champs concernés sont remplis avec la mention « (Rempli automatiquement) ».
4. Importer ensuite un fichier `.txt` : le message « Fichier non pris en charge » s'affiche, aucun champ n'est modifié. Saisir `n'importe quoi` dans l'URL puis « Récupérer » : message « URL invalide ». Saisir `github.com/jane/demo-lib` : soit les champs se remplissent, soit un message de limite de débit ou d'introuvable s'affiche ; dans tous les cas l'assistant reste utilisable.
5. Étape 3 : choisir la langue du README « English ». Étape 4 : les sections critiques et recommandées sont cochées (En-tête, Badges, Preuve visuelle, Installation, Utilisation, Licence) ; cocher aussi « Table des matières » et « Alerte ». Étape 5 : choisir une couleur d'accent, puis saisir `zzz` : le message « Code invalide » s'affiche et la couleur précédente est conservée. Cliquer « Terminer ».
6. L'éditeur s'ouvre : le titre de l'En-tête est « demo-lib », le badge de licence « MIT » est présent, les intitulés des sections sont en anglais (« Installation », « Usage », « License »).
7. Ouvrir chaque bloc : le formulaire s'affiche sans erreur. Saisir dans le bloc Utilisation un exemple de code contenant ```` ``` ```` : l'aperçu l'affiche correctement (barrière plus longue). Dans un badge, taper une couleur de trois chiffres : rien n'est enregistré tant qu'il n'y en a pas six ; en saisir six : le badge change de couleur.
8. La table des matières de l'aperçu liste les sections actives et ses liens correspondent aux intitulés ; ajouter un sixième badge : l'avertissement « Trop de badges (6) » apparaît sous le nom du bloc.
9. Dans le titre de l'En-tête, saisir `<!-- wip` : le texte s'affiche tel quel dans l'aperçu et les sections suivantes restent visibles.
10. Bouton « Assistant » : rouvrir l'assistant, décocher « Alerte » et terminer : un message « Sections retirées : 1 » avec « Annuler » s'affiche ; « Annuler » restaure le bloc.
11. Recharger la page : l'éditeur s'ouvre directement (pas l'assistant), avec tout le contenu.
12. Passer en « Profil GitHub » puis rouvrir l'assistant : seul « Markdown libre » est proposé à l'étape 4.
13. Le README reste caché : la page a `noindex`, l'entrée de la barre latérale est « Bientôt » et le pied de page ne la liste pas.

Expected: les 13 points conformes. Arrêter le serveur ensuite.

- [ ] **Step 3: Rien à commiter si tout est conforme**

Si un point échoue, corriger avec un test qui échoue d'abord quand la cause est dans `src/lib/readme/`, puis relancer les étapes 1 et 2.

---

## Suite : plan 3

Ce plan livre le mode Projet complet mais toujours caché. Le plan 3 s'appuie sur le même registre :

- **Catalogue Profil** : bannière (typing SVG), bio, compétences (skill-icons), statistiques (github-readme-stats, URL de base réglable, avertissement de fragilité), trophées, contact, plus la couleur d'accent déjà en place.
- **Bloc Blog et workflow** : balises d'ancrage HTML, `.github/workflows/blog-post-workflow.yml` avec action épinglée, guide en trois étapes sur `contents: write`.
- **Ouverture publique** : retrait de `noindex` et de `comingSoon`, entrée d'accueil (`tools-showcase.tsx`), sitemap, `CHANGELOG.md`, `changelog.ts` et version 2.5.0.
- **Mineurs différés du plan 1** encore ouverts : pré-visualisation différée (`useDeferredValue`) et sauvegarde temporisée, `clobberPrefix` des notes de bas de page, bascule clair/sombre des `<picture>`, taille maximale des `<svg>`, libellés d'accessibilité de la liste de blocs, avertissement de barrière de code non fermée, migration de schéma du stockage local.
