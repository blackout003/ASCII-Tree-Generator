# Générateur de Séparateurs & Badges ASCII — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first of the 5 planned new tools — a generator for decorative separator lines, status badges, and boxed code-comment headers — as a new page at `/tools/separators`, following the codebase's existing tool pattern exactly.

**Architecture:** Pure-function generator (`separator-generator.ts` + `separator-types.ts`) driven by a `blockType` discriminator (`line` / `badge` / `comment`), rendered through the standard container→input/preview/options-panel component trio (mirrors `sparkline-generator`), registered in the tool nav, SEO config, sitemap, and all 8 locale files.

**Tech Stack:** Next.js 16 (App Router), TypeScript (strict), Tailwind + shadcn/ui, next-intl, Vitest (`environment: 'node'`, tests under `tests/**/*.test.ts`, `@` alias → `src/`).

**Spec:** `docs/superpowers/specs/2026-09-22-nouveaux-outils-suite-design.md` (tool #1 in the "Résumé fonctionnel de chaque outil" section: séparateurs & badges).

## Global Constraints

- 100% client-side — no backend, no new dependency.
- All 8 locales (`fr`, `en`, `es`, `de`, `it`, `pt`, `ru`, `ja`) must get real translations — never leave a locale falling back silently when the pattern in the codebase is to fill every locale.
- Never hardcode user-facing strings — everything goes through `useTranslations()`.
- Follow the existing `sparkline` tool's file layout and component boundaries exactly (it is the closest analog: single input, single preview, options panel in the right sidebar).
- No test framework gaps to work around — `vitest` is configured (`npm test` → `vitest run`); write real unit tests for every pure function, `tests/**/*.test.ts`, importing via the `@/` alias.

---

### Task 1: Core generator logic

**Files:**
- Create: `src/lib/separator-types.ts`
- Create: `src/lib/separator-generator.ts`
- Test: `tests/separators/generator.test.ts`

**Interfaces:**
- Produces: `BlockType = 'line' | 'badge' | 'comment'`, `BadgeStyle = 'brackets' | 'dashes' | 'block'`, `CommentLang = 'c' | 'hash'`, `LINE_CHARS: readonly string[]`, `WIDTH_OPTIONS: readonly number[]`, `SeparatorOptions { blockType, width, lineChar, badgeStyle, commentLang }` — all consumed by Task 3 (UI).
- Produces: `generateLine(char: string, width: number): string`, `generateBadge(label: string, style: BadgeStyle): string`, `generateCommentBlock(title: string, lang: CommentLang, width: number): string`, `generateBlock(label: string, options: SeparatorOptions): string` — consumed by Task 3's container component.

- [ ] **Step 1: Write the failing tests**

Create `tests/separators/generator.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateLine, generateBadge, generateCommentBlock, generateBlock } from '@/lib/separator-generator';
import type { SeparatorOptions } from '@/lib/separator-types';

describe('generateLine', () => {
  it('repeats the character to the given width', () => {
    expect(generateLine('=', 5)).toBe('=====');
  });

  it('returns an empty string for a zero or negative width', () => {
    expect(generateLine('=', 0)).toBe('');
    expect(generateLine('=', -3)).toBe('');
  });

  it('returns an empty string for an empty character', () => {
    expect(generateLine('', 10)).toBe('');
  });
});

describe('generateBadge', () => {
  it('wraps the label in brackets', () => {
    expect(generateBadge('STATUS: ACTIVE', 'brackets')).toBe('[ STATUS: ACTIVE ]');
  });

  it('wraps the label in dashes', () => {
    expect(generateBadge('v2.1.0', 'dashes')).toBe('-- v2.1.0 --');
  });

  it('wraps the label in solid blocks', () => {
    expect(generateBadge('DONE', 'block')).toBe('█ DONE █');
  });

  it('trims the label before wrapping', () => {
    expect(generateBadge('  DONE  ', 'brackets')).toBe('[ DONE ]');
  });

  it('returns an empty string for blank input', () => {
    expect(generateBadge('   ', 'brackets')).toBe('');
  });
});

describe('generateCommentBlock', () => {
  it('produces a C/JS-style boxed header', () => {
    const result = generateCommentBlock('AUTH CONTROLLER', 'c', 20);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(lines[2]);
    expect(lines[0].startsWith('/* -')).toBe(true);
    expect(lines[0].endsWith('- */')).toBe(true);
    expect(lines[1]).toContain('AUTH CONTROLLER');
  });

  it('produces a hash-style boxed header for Python/Bash', () => {
    const result = generateCommentBlock('config', 'hash', 10);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0].startsWith('# -')).toBe(true);
    expect(lines[1]).toContain('CONFIG');
  });

  it('widens the rule to fit a title longer than the requested width', () => {
    const result = generateCommentBlock('A VERY LONG SECTION TITLE', 'hash', 5);
    const lines = result.split('\n');
    expect(lines[0].length).toBeGreaterThanOrEqual('A VERY LONG SECTION TITLE'.length);
  });

  it('returns an empty string for blank input', () => {
    expect(generateCommentBlock('   ', 'c', 20)).toBe('');
  });
});

describe('generateBlock', () => {
  const base: SeparatorOptions = {
    blockType: 'line',
    width: 10,
    lineChar: '-',
    badgeStyle: 'brackets',
    commentLang: 'c',
  };

  it('dispatches to generateLine for the line type', () => {
    expect(generateBlock('ignored', base)).toBe('----------');
  });

  it('dispatches to generateBadge for the badge type', () => {
    expect(generateBlock('READY', { ...base, blockType: 'badge' })).toBe('[ READY ]');
  });

  it('dispatches to generateCommentBlock for the comment type', () => {
    const result = generateBlock('SETUP', { ...base, blockType: 'comment' });
    expect(result.split('\n')).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/separators/generator.test.ts`
Expected: FAIL — `Cannot find module '@/lib/separator-generator'` (and `@/lib/separator-types`).

- [ ] **Step 3: Create the types file**

Create `src/lib/separator-types.ts`:

```ts
export type BlockType = 'line' | 'badge' | 'comment';
export type BadgeStyle = 'brackets' | 'dashes' | 'block';
export type CommentLang = 'c' | 'hash';

export const LINE_CHARS = ['═', '─', '-', '=', '*', '#'] as const;
export const WIDTH_OPTIONS = [20, 30, 40, 50, 60, 80] as const;

export interface SeparatorOptions {
  blockType: BlockType;
  width: number;
  lineChar: string;
  badgeStyle: BadgeStyle;
  commentLang: CommentLang;
}
```

- [ ] **Step 4: Implement the generator functions**

Create `src/lib/separator-generator.ts`:

```ts
import { SeparatorOptions } from './separator-types';

export function generateLine(char: string, width: number): string {
  if (!char || width <= 0) return '';
  return char.repeat(width);
}

export function generateBadge(label: string, style: SeparatorOptions['badgeStyle']): string {
  const text = label.trim();
  if (!text) return '';
  switch (style) {
    case 'brackets':
      return `[ ${text} ]`;
    case 'dashes':
      return `-- ${text} --`;
    case 'block':
      return `█ ${text} █`;
  }
}

function centerText(text: string, width: number): string {
  const pad = Math.max(0, width - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export function generateCommentBlock(
  title: string,
  lang: SeparatorOptions['commentLang'],
  width: number
): string {
  const text = title.trim();
  if (!text) return '';
  const innerWidth = Math.max(text.length + 4, width);
  const rule = '-'.repeat(innerWidth);
  const centered = centerText(text.toUpperCase(), innerWidth);

  if (lang === 'c') {
    return [`/* ${rule} */`, `/* ${centered} */`, `/* ${rule} */`].join('\n');
  }
  return [`# ${rule}`, `# ${centered}`, `# ${rule}`].join('\n');
}

export function generateBlock(label: string, options: SeparatorOptions): string {
  switch (options.blockType) {
    case 'line':
      return generateLine(options.lineChar, options.width);
    case 'badge':
      return generateBadge(label, options.badgeStyle);
    case 'comment':
      return generateCommentBlock(label, options.commentLang, options.width);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- tests/separators/generator.test.ts`
Expected: PASS (14 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/separator-types.ts src/lib/separator-generator.ts tests/separators/generator.test.ts
git commit -m "feat(separators): add pure generator logic for lines, badges and comment blocks"
```

---

### Task 2: i18n — nav label + `separatorGenerator` namespace, all 8 locales

**Files:**
- Modify: `src/i18n/locales/fr.json:138` (nav) and `:266` (after `sparklineGenerator` block)
- Modify: `src/i18n/locales/en.json:138` and `:266` (same anchors, en content)
- Modify: `src/i18n/locales/es.json:138` and `:266`
- Modify: `src/i18n/locales/de.json:138` and `:266`
- Modify: `src/i18n/locales/it.json:138` and `:266`
- Modify: `src/i18n/locales/pt.json:138` and `:266`
- Modify: `src/i18n/locales/ru.json:138` and `:266`
- Modify: `src/i18n/locales/ja.json:138` and `:266`
- Test: `tests/i18n/separator-locales.test.ts`

**Interfaces:**
- Produces: translation keys `nav.separators`, and namespace `separatorGenerator.{input,preview,options,errors}.*` in every locale — consumed by Task 3's components via `useTranslations('separatorGenerator')` and by the nav registry's `nameKey: 'separators'` (Task 5).

All 8 locale files share an identical structure (verified: `"banner":` nav key is on line 138 and the `sparklineGenerator` block ends identically at the same relative position in every file). Two edits per file: (a) add `"separators"` right after `"banner"` in the `nav` object, (b) add a new top-level `"separatorGenerator"` object right after the `sparklineGenerator` block closes.

- [ ] **Step 1: fr.json**

Edit `src/i18n/locales/fr.json`, in the `nav` object:

```json
    "banner": "Bannières Texte",
```
→
```json
    "banner": "Bannières Texte",
    "separators": "Séparateurs & Badges",
```

Edit `src/i18n/locales/fr.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Erreur lors du téléchargement."
    }
  },
```
→
```json
      "downloadError": "Erreur lors du téléchargement."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Texte",
      "placeholder": "Entrez le texte du badge ou du titre...",
      "lineHint": "Ce style n'a pas besoin de texte — ajustez le caractère et la largeur dans les options.",
      "clear": "Effacer"
    },
    "preview": {
      "title": "Prévisualisation",
      "copy": "Copier",
      "download": "Télécharger",
      "placeholder": "Votre bloc ASCII apparaîtra ici..."
    },
    "options": {
      "title": "Options",
      "blockType": "Type de bloc",
      "typeLine": "Ligne décorative",
      "typeBadge": "Badge",
      "typeComment": "Bloc de commentaire",
      "lineChar": "Caractère",
      "width": "Largeur",
      "badgeStyle": "Style de badge",
      "badgeBrackets": "Crochets [ ]",
      "badgeDashes": "Tirets -- --",
      "badgeBlock": "Bloc plein █ █",
      "commentLang": "Langage",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "Copié dans le presse-papiers !",
      "copyError": "Échec de la copie",
      "downloadError": "Échec du téléchargement"
    }
  },
```

- [ ] **Step 2: en.json**

Edit `src/i18n/locales/en.json`, in the `nav` object:

```json
    "banner": "Text Banners",
```
→
```json
    "banner": "Text Banners",
    "separators": "Separators & Badges",
```

Edit `src/i18n/locales/en.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Failed to download."
    }
  },
```
→
```json
      "downloadError": "Failed to download."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Text",
      "placeholder": "Enter the badge text or block title...",
      "lineHint": "This style needs no text — adjust the character and width in the options.",
      "clear": "Clear"
    },
    "preview": {
      "title": "Preview",
      "copy": "Copy",
      "download": "Download",
      "placeholder": "Your ASCII block will appear here..."
    },
    "options": {
      "title": "Options",
      "blockType": "Block type",
      "typeLine": "Decorative line",
      "typeBadge": "Badge",
      "typeComment": "Comment block",
      "lineChar": "Character",
      "width": "Width",
      "badgeStyle": "Badge style",
      "badgeBrackets": "Brackets [ ]",
      "badgeDashes": "Dashes -- --",
      "badgeBlock": "Solid block █ █",
      "commentLang": "Language",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "Copied to clipboard!",
      "copyError": "Copy failed",
      "downloadError": "Download failed"
    }
  },
```

- [ ] **Step 3: es.json**

Edit `src/i18n/locales/es.json`, in the `nav` object:

```json
    "banner": "Banners de Texto",
```
→
```json
    "banner": "Banners de Texto",
    "separators": "Separadores e Insignias",
```

Edit `src/i18n/locales/es.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Error al descargar."
    }
  },
```
→
```json
      "downloadError": "Error al descargar."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Texto",
      "placeholder": "Introduce el texto de la insignia o el título del bloque...",
      "lineHint": "Este estilo no necesita texto — ajusta el carácter y el ancho en las opciones.",
      "clear": "Borrar"
    },
    "preview": {
      "title": "Vista previa",
      "copy": "Copiar",
      "download": "Descargar",
      "placeholder": "Tu bloque ASCII aparecerá aquí..."
    },
    "options": {
      "title": "Opciones",
      "blockType": "Tipo de bloque",
      "typeLine": "Línea decorativa",
      "typeBadge": "Insignia",
      "typeComment": "Bloque de comentario",
      "lineChar": "Carácter",
      "width": "Ancho",
      "badgeStyle": "Estilo de insignia",
      "badgeBrackets": "Corchetes [ ]",
      "badgeDashes": "Guiones -- --",
      "badgeBlock": "Bloque sólido █ █",
      "commentLang": "Lenguaje",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "¡Copiado al portapapeles!",
      "copyError": "Error al copiar",
      "downloadError": "Error al descargar"
    }
  },
```

- [ ] **Step 4: de.json**

Edit `src/i18n/locales/de.json`, in the `nav` object:

```json
    "banner": "Textbanner",
```
→
```json
    "banner": "Textbanner",
    "separators": "Trenner & Badges",
```

Edit `src/i18n/locales/de.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Fehler beim Herunterladen."
    }
  },
```
→
```json
      "downloadError": "Fehler beim Herunterladen."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Text",
      "placeholder": "Geben Sie den Badge-Text oder den Blocktitel ein...",
      "lineHint": "Für diesen Stil wird kein Text benötigt — passen Sie Zeichen und Breite in den Optionen an.",
      "clear": "Löschen"
    },
    "preview": {
      "title": "Vorschau",
      "copy": "Kopieren",
      "download": "Herunterladen",
      "placeholder": "Ihr ASCII-Block erscheint hier..."
    },
    "options": {
      "title": "Optionen",
      "blockType": "Blocktyp",
      "typeLine": "Dekorative Linie",
      "typeBadge": "Badge",
      "typeComment": "Kommentarblock",
      "lineChar": "Zeichen",
      "width": "Breite",
      "badgeStyle": "Badge-Stil",
      "badgeBrackets": "Klammern [ ]",
      "badgeDashes": "Striche -- --",
      "badgeBlock": "Vollblock █ █",
      "commentLang": "Sprache",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "In die Zwischenablage kopiert!",
      "copyError": "Kopieren fehlgeschlagen",
      "downloadError": "Download fehlgeschlagen"
    }
  },
```

- [ ] **Step 5: it.json**

Edit `src/i18n/locales/it.json`, in the `nav` object:

```json
    "banner": "Banner di Testo",
```
→
```json
    "banner": "Banner di Testo",
    "separators": "Separatori e Badge",
```

Edit `src/i18n/locales/it.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Errore durante il download."
    }
  },
```
→
```json
      "downloadError": "Errore durante il download."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Testo",
      "placeholder": "Inserisci il testo del badge o il titolo del blocco...",
      "lineHint": "Questo stile non richiede testo — regola il carattere e la larghezza nelle opzioni.",
      "clear": "Cancella"
    },
    "preview": {
      "title": "Anteprima",
      "copy": "Copia",
      "download": "Scarica",
      "placeholder": "Il tuo blocco ASCII apparirà qui..."
    },
    "options": {
      "title": "Opzioni",
      "blockType": "Tipo di blocco",
      "typeLine": "Linea decorativa",
      "typeBadge": "Badge",
      "typeComment": "Blocco di commento",
      "lineChar": "Carattere",
      "width": "Larghezza",
      "badgeStyle": "Stile badge",
      "badgeBrackets": "Parentesi [ ]",
      "badgeDashes": "Trattini -- --",
      "badgeBlock": "Blocco pieno █ █",
      "commentLang": "Linguaggio",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "Copiato negli appunti!",
      "copyError": "Copia non riuscita",
      "downloadError": "Download non riuscito"
    }
  },
```

- [ ] **Step 6: pt.json**

Edit `src/i18n/locales/pt.json`, in the `nav` object:

```json
    "banner": "Banners de Texto",
```
→
```json
    "banner": "Banners de Texto",
    "separators": "Separadores e Selos",
```

Edit `src/i18n/locales/pt.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Erro ao baixar."
    }
  },
```
→
```json
      "downloadError": "Erro ao baixar."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Texto",
      "placeholder": "Insira o texto do selo ou o título do bloco...",
      "lineHint": "Este estilo não precisa de texto — ajuste o carácter e a largura nas opções.",
      "clear": "Limpar"
    },
    "preview": {
      "title": "Pré-visualização",
      "copy": "Copiar",
      "download": "Transferir",
      "placeholder": "O seu bloco ASCII aparecerá aqui..."
    },
    "options": {
      "title": "Opções",
      "blockType": "Tipo de bloco",
      "typeLine": "Linha decorativa",
      "typeBadge": "Selo",
      "typeComment": "Bloco de comentário",
      "lineChar": "Carácter",
      "width": "Largura",
      "badgeStyle": "Estilo do selo",
      "badgeBrackets": "Colchetes [ ]",
      "badgeDashes": "Traços -- --",
      "badgeBlock": "Bloco sólido █ █",
      "commentLang": "Linguagem",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "Copiado para a área de transferência!",
      "copyError": "Falha ao copiar",
      "downloadError": "Falha ao transferir"
    }
  },
```

- [ ] **Step 7: ru.json**

Edit `src/i18n/locales/ru.json`, in the `nav` object:

```json
    "banner": "Текстовые баннеры",
```
→
```json
    "banner": "Текстовые баннеры",
    "separators": "Разделители и бейджи",
```

Edit `src/i18n/locales/ru.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "Ошибка при скачивании."
    }
  },
```
→
```json
      "downloadError": "Ошибка при скачивании."
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "Текст",
      "placeholder": "Введите текст бейджа или заголовок блока...",
      "lineHint": "Для этого стиля текст не нужен — настройте символ и ширину в параметрах.",
      "clear": "Очистить"
    },
    "preview": {
      "title": "Предпросмотр",
      "copy": "Копировать",
      "download": "Скачать",
      "placeholder": "Ваш ASCII-блок появится здесь..."
    },
    "options": {
      "title": "Настройки",
      "blockType": "Тип блока",
      "typeLine": "Декоративная линия",
      "typeBadge": "Бейдж",
      "typeComment": "Блок комментария",
      "lineChar": "Символ",
      "width": "Ширина",
      "badgeStyle": "Стиль бейджа",
      "badgeBrackets": "Скобки [ ]",
      "badgeDashes": "Дефисы -- --",
      "badgeBlock": "Сплошной блок █ █",
      "commentLang": "Язык",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "Скопировано в буфер обмена!",
      "copyError": "Не удалось скопировать",
      "downloadError": "Не удалось скачать"
    }
  },
```

- [ ] **Step 8: ja.json**

Edit `src/i18n/locales/ja.json`, in the `nav` object:

```json
    "banner": "テキストバナー",
```
→
```json
    "banner": "テキストバナー",
    "separators": "区切り線＆バッジ",
```

Edit `src/i18n/locales/ja.json`, right after the `sparklineGenerator` block:

```json
      "downloadError": "ダウンロードに失敗しました。"
    }
  },
```
→
```json
      "downloadError": "ダウンロードに失敗しました。"
    }
  },
  "separatorGenerator": {
    "input": {
      "title": "テキスト",
      "placeholder": "バッジのテキストまたはブロックのタイトルを入力...",
      "lineHint": "このスタイルはテキスト不要です。オプションで文字と幅を調整してください。",
      "clear": "クリア"
    },
    "preview": {
      "title": "プレビュー",
      "copy": "コピー",
      "download": "ダウンロード",
      "placeholder": "ASCIIブロックがここに表示されます..."
    },
    "options": {
      "title": "オプション",
      "blockType": "ブロックの種類",
      "typeLine": "装飾ライン",
      "typeBadge": "バッジ",
      "typeComment": "コメントブロック",
      "lineChar": "文字",
      "width": "幅",
      "badgeStyle": "バッジスタイル",
      "badgeBrackets": "角括弧 [ ]",
      "badgeDashes": "ダッシュ -- --",
      "badgeBlock": "ブロック █ █",
      "commentLang": "言語",
      "commentC": "C / JS (/* */)",
      "commentHash": "Python / Bash (#)"
    },
    "errors": {
      "copySuccess": "クリップボードにコピーしました！",
      "copyError": "コピーに失敗しました",
      "downloadError": "ダウンロードに失敗しました"
    }
  },
```

- [ ] **Step 9: Write a locale-completeness test**

Create `tests/i18n/separator-locales.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const NAV_KEY = 'separators';
const REQUIRED_KEYS = [
  'input.title',
  'input.placeholder',
  'input.lineHint',
  'input.clear',
  'preview.title',
  'preview.copy',
  'preview.download',
  'preview.placeholder',
  'options.title',
  'options.blockType',
  'options.typeLine',
  'options.typeBadge',
  'options.typeComment',
  'options.lineChar',
  'options.width',
  'options.badgeStyle',
  'options.badgeBrackets',
  'options.badgeDashes',
  'options.badgeBlock',
  'options.commentLang',
  'options.commentC',
  'options.commentHash',
  'errors.copySuccess',
  'errors.copyError',
  'errors.downloadError',
] as const;

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('separator generator translations', () => {
  it.each(locales)('%s has a non-empty nav.separators label', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    expect(typeof messages.nav[NAV_KEY]).toBe('string');
    expect(messages.nav[NAV_KEY].trim().length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every separatorGenerator key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.separatorGenerator, key);
      expect(typeof value).toBe('string');
      expect((value as string).trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `npm test -- tests/i18n/separator-locales.test.ts`
Expected: PASS (16 tests: 8 locales × 2 checks).

- [ ] **Step 11: Commit**

```bash
git add src/i18n/locales/fr.json src/i18n/locales/en.json src/i18n/locales/es.json \
  src/i18n/locales/de.json src/i18n/locales/it.json src/i18n/locales/pt.json \
  src/i18n/locales/ru.json src/i18n/locales/ja.json tests/i18n/separator-locales.test.ts
git commit -m "feat(separators): add nav label and separatorGenerator translations for all 8 locales"
```

---

### Task 3: UI components

**Files:**
- Create: `src/components/separator-generator/separator-input.tsx`
- Create: `src/components/separator-generator/separator-preview.tsx`
- Create: `src/components/separator-generator/separator-options-panel.tsx`
- Create: `src/components/separator-generator/separator-generator.tsx`

**Interfaces:**
- Consumes: `SeparatorOptions`, `BlockType`, `BadgeStyle`, `CommentLang`, `LINE_CHARS`, `WIDTH_OPTIONS` from `@/lib/separator-types` (Task 1); `generateBlock` from `@/lib/separator-generator` (Task 1); `separatorGenerator.*` translation keys (Task 2).
- Produces: `SeparatorGenerator` component, consumed by the route in Task 5 as `@/components/separator-generator/separator-generator`.

- [ ] **Step 1: Create the input card**

Create `src/components/separator-generator/separator-input.tsx`:

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Trash2 } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { BlockType } from '@/lib/separator-types';

interface SeparatorInputProps {
  label: string;
  blockType: BlockType;
  onLabelChange: (value: string) => void;
  onClear: () => void;
}

export function SeparatorInput({ label, blockType, onLabelChange, onClear }: SeparatorInputProps) {
  const t = useTranslations('separatorGenerator');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Minus className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('input.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {blockType === 'line' ? (
          <p className="text-sm text-muted-foreground">{t('input.lineHint')}</p>
        ) : (
          <Input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder={t('input.placeholder')}
            className="font-mono"
          />
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create the preview card**

Create `src/components/separator-generator/separator-preview.tsx`:

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Copy, Download } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface SeparatorPreviewProps {
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function SeparatorPreview({ output, onCopy, onDownload }: SeparatorPreviewProps) {
  const t = useTranslations('separatorGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minus className="w-5 h-5" />
          {t('preview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button onClick={onCopy} size="sm">
            <Copy className="w-4 h-4 mr-1" />
            {t('preview.copy')}
          </Button>
          <Button onClick={onDownload} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" />
            {t('preview.download')}
          </Button>
        </div>
        <pre className="font-mono text-sm bg-muted rounded-md p-4 min-h-[120px] overflow-x-auto whitespace-pre leading-tight">
          {output || t('preview.placeholder')}
        </pre>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create the options panel**

Create `src/components/separator-generator/separator-options-panel.tsx`:

```tsx
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SeparatorOptions,
  BlockType,
  BadgeStyle,
  CommentLang,
  LINE_CHARS,
  WIDTH_OPTIONS,
} from '@/lib/separator-types';
import { useTranslations } from 'next-intl';

interface SeparatorOptionsPanelProps {
  options: SeparatorOptions;
  onOptionsChange: (options: SeparatorOptions) => void;
}

export function SeparatorOptionsPanel({ options, onOptionsChange }: SeparatorOptionsPanelProps) {
  const t = useTranslations('separatorGenerator');

  const set = <K extends keyof SeparatorOptions>(key: K, value: SeparatorOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">
        <div className="space-y-2">
          <Label htmlFor="blockType">{t('options.blockType')}</Label>
          <Select value={options.blockType} onValueChange={(v) => set('blockType', v as BlockType)}>
            <SelectTrigger id="blockType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">{t('options.typeLine')}</SelectItem>
              <SelectItem value="badge">{t('options.typeBadge')}</SelectItem>
              <SelectItem value="comment">{t('options.typeComment')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {options.blockType === 'line' && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lineChar">{t('options.lineChar')}</Label>
                <Select value={options.lineChar} onValueChange={(v) => set('lineChar', v)}>
                  <SelectTrigger id="lineChar" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_CHARS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.repeat(6)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">{t('options.width')}</Label>
                <Select value={String(options.width)} onValueChange={(v) => set('width', Number(v))}>
                  <SelectTrigger id="width" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDTH_OPTIONS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {options.blockType === 'badge' && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="badgeStyle">{t('options.badgeStyle')}</Label>
              <Select value={options.badgeStyle} onValueChange={(v) => set('badgeStyle', v as BadgeStyle)}>
                <SelectTrigger id="badgeStyle" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brackets">{t('options.badgeBrackets')}</SelectItem>
                  <SelectItem value="dashes">{t('options.badgeDashes')}</SelectItem>
                  <SelectItem value="block">{t('options.badgeBlock')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {options.blockType === 'comment' && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commentLang">{t('options.commentLang')}</Label>
                <Select value={options.commentLang} onValueChange={(v) => set('commentLang', v as CommentLang)}>
                  <SelectTrigger id="commentLang" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c">{t('options.commentC')}</SelectItem>
                    <SelectItem value="hash">{t('options.commentHash')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentWidth">{t('options.width')}</Label>
                <Select value={String(options.width)} onValueChange={(v) => set('width', Number(v))}>
                  <SelectTrigger id="commentWidth" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDTH_OPTIONS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the container component**

Create `src/components/separator-generator/separator-generator.tsx`:

```tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { SeparatorOptions } from '@/lib/separator-types';
import { generateBlock } from '@/lib/separator-generator';
import { SeparatorInput } from './separator-input';
import { SeparatorPreview } from './separator-preview';
import { SeparatorOptionsPanel } from './separator-options-panel';

const DEFAULT_LABEL = 'STATUS: ACTIVE';

const DEFAULT_OPTIONS: SeparatorOptions = {
  blockType: 'line',
  width: 40,
  lineChar: '─',
  badgeStyle: 'brackets',
  commentLang: 'c',
};

export function SeparatorGenerator() {
  const t = useTranslations('separatorGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [options, setOptions] = useState<SeparatorOptions>(DEFAULT_OPTIONS);

  const output = useMemo(() => generateBlock(label, options), [label, options]);

  useEffect(() => {
    setContent(
      <SeparatorOptionsPanel options={options} onOptionsChange={setOptions} />
    );
    return () => setContent(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => {
    setLabel('');
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({ description: t('errors.copySuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  const downloadOutput = useCallback(() => {
    try {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'separator.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <SeparatorInput
        label={label}
        blockType={options.blockType}
        onLabelChange={setLabel}
        onClear={handleClear}
      />
      <SeparatorPreview
        output={output}
        onCopy={copyToClipboard}
        onDownload={downloadOutput}
      />
    </div>
  );
}
```

- [ ] **Step 5: Type-check and lint**

Run: `npm run lint`
Expected: no errors in the 4 new files (there is no component-level test runner in this repo — `tests/**/*.test.ts` only covers `environment: 'node'` logic, so this task's verification is lint + the manual smoke test in Task 5 once the route exists).

- [ ] **Step 6: Commit**

```bash
git add src/components/separator-generator/
git commit -m "feat(separators): add input, preview, options panel and container components"
```

---

### Task 4: SEO metadata & content

**Files:**
- Modify: `src/lib/seo-config.ts:248` (add `'separators'` to `TOOLS_SEO`, right before the closing `}` of the object)
- Modify: `src/lib/tool-seo-content.ts:682` (add `'separators'` to `CONTENT`, right before the closing `}` of the object)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ToolSlug` now includes `'separators'` (it is `keyof typeof TOOLS_SEO`), which Task 5's `page.tsx` and `tools.ts` will reference as the literal `'separators'`. `TOOLS_SEO['separators']` and `CONTENT['separators']` (via `getToolContent`) are consumed by `buildToolMetadata` and `ToolSeoSection`, both already generic — no changes needed there.

- [ ] **Step 1: Register the tool in `seo-config.ts`**

Edit `src/lib/seo-config.ts`. Find the `'markdown-guide'` entry (the last one in `TOOLS_SEO`, currently followed by `} satisfies Record<string, ToolMeta>;`) and insert a new `'separators'` entry right after it closes:

```ts
      it: "Impara la sintassi Markdown con un cheat sheet chiaro e ricco di esempi: titoli, elenchi, tabelle, codice, link e altro. Vedi il risultato affiancato. Gratis.",
      pt: "Aprenda a sintaxe Markdown com uma folha de consulta clara e cheia de exemplos: títulos, listas, tabelas, código, links e mais. Veja o resultado lado a lado. Grátis.",
      ru: "Изучите синтаксис Markdown с наглядной шпаргалкой с примерами: заголовки, списки, таблицы, код, ссылки и другое. Результат отображается рядом. Бесплатно.",
      ja: "見出し・リスト・表・コード・リンクなど、例が豊富な分かりやすいチートシートでMarkdown記法を習得。レンダリング結果を横並びで確認。無料。",
    },
  },
} satisfies Record<string, ToolMeta>;
```
→
```ts
      it: "Impara la sintassi Markdown con un cheat sheet chiaro e ricco di esempi: titoli, elenchi, tabelle, codice, link e altro. Vedi il risultato affiancato. Gratis.",
      pt: "Aprenda a sintaxe Markdown com uma folha de consulta clara e cheia de exemplos: títulos, listas, tabelas, código, links e mais. Veja o resultado lado a lado. Grátis.",
      ru: "Изучите синтаксис Markdown с наглядной шпаргалкой с примерами: заголовки, списки, таблицы, код, ссылки и другое. Результат отображается рядом. Бесплатно.",
      ja: "見出し・リスト・表・コード・リンクなど、例が豊富な分かりやすいチートシートでMarkdown記法を習得。レンダリング結果を横並びで確認。無料。",
    },
  },
  'separators': {
    titles: {
      fr: "Générateur de Séparateurs & Badges ASCII — Pour README | Gratuit",
      en: "ASCII Separator & Badge Generator — For README & Code | Free Online",
      es: "Generador de Separadores e Insignias ASCII — Para README | Gratis",
      de: "ASCII-Trenner- & Badge-Generator — Für README & Code | Kostenlos Online",
      it: "Generatore di Separatori e Badge ASCII — Per README | Online Gratis",
      pt: "Gerador de Separadores e Selos ASCII — Para README | Online Grátis",
      ru: "Генератор ASCII-разделителей и бейджей — для README | Онлайн бесплатно",
      ja: "ASCII区切り線＆バッジ生成 — README・コード向け｜無料オンライン",
    },
    descriptions: {
      fr: "Générez des lignes décoratives, badges et blocs de commentaires ASCII pour structurer vos README et fichiers de code. Styles C/JS, Python, Bash. Gratuit, copie en un clic.",
      en: "Generate decorative lines, badges and comment blocks in ASCII to structure your README and source files. C/JS, Python and Bash styles. Free, one-click copy.",
      es: "Genera líneas decorativas, insignias y bloques de comentarios ASCII para estructurar tu README y archivos de código. Estilos C/JS, Python y Bash. Gratis, copia con un clic.",
      de: "Erzeugen Sie dekorative Linien, Badges und Kommentarblöcke in ASCII, um README und Quellcode zu strukturieren. Stile für C/JS, Python und Bash. Kostenlos, Kopie per Klick.",
      it: "Genera linee decorative, badge e blocchi di commento ASCII per strutturare il tuo README e i file di codice. Stili C/JS, Python e Bash. Gratis, copia con un clic.",
      pt: "Gere linhas decorativas, selos e blocos de comentários em ASCII para estruturar o seu README e ficheiros de código. Estilos C/JS, Python e Bash. Grátis, cópia com um clique.",
      ru: "Создавайте декоративные линии, бейджи и блоки комментариев в ASCII для структурирования README и файлов кода. Стили C/JS, Python и Bash. Бесплатно, копирование в один клик.",
      ja: "READMEやソースファイルを整理するための装飾ライン、バッジ、コメントブロックをASCIIで生成。C/JS、Python、Bashスタイル対応。無料、ワンクリックコピー。",
    },
  },
} satisfies Record<string, ToolMeta>;
```

- [ ] **Step 2: Register the tool's FAQ content in `tool-seo-content.ts`**

Edit `src/lib/tool-seo-content.ts`. Find the last entry in `CONTENT` (the `'markdown-guide'` block, currently followed by the closing `};` of the `CONTENT` object) and insert a new `'separators'` entry right after it closes:

```ts
      ],
    },
  },
};
```
→
```ts
      ],
    },
  },
  'separators': {
    en: {
      heading: 'About the ASCII Separator & Badge Generator',
      intro:
        'This free tool generates decorative lines, status badges and plain-text comment blocks to structure your READMEs, source files and documentation. Pick a style, type your text and copy the result — no installation required.',
      faq: [
        { q: 'What are ASCII comment blocks for?', a: 'They visually mark the major sections of a code file (controllers, modules, configuration) with a boxed header, more readable than a single-line comment.' },
        { q: 'Can I use these badges in a GitHub README?', a: 'Yes. Paste the badge or line inside a fenced code block (```) in your README.md so the characters stay aligned on GitHub.' },
        { q: 'Is the ASCII separator generator free?', a: 'Yes, it is completely free, runs entirely in your browser, and requires no account. Nothing you create is uploaded to a server.' },
      ],
    },
    fr: {
      heading: 'À propos du générateur de séparateurs & badges ASCII',
      intro:
        "Cet outil gratuit génère des lignes décoratives, des badges de statut et des blocs de commentaires en texte brut pour structurer vos README, vos fichiers source et votre documentation. Choisissez un style, tapez votre texte et copiez le résultat — aucune installation requise.",
      faq: [
        { q: 'À quoi servent les blocs de commentaires ASCII ?', a: 'Ils marquent visuellement les grandes sections d\'un fichier de code (contrôleurs, modules, configuration) avec un en-tête encadré, plus lisible qu\'un simple commentaire sur une ligne.' },
        { q: 'Puis-je utiliser ces badges dans un fichier README GitHub ?', a: 'Oui. Collez le badge ou la ligne dans un bloc de code (```) de votre README.md pour conserver l\'alignement des caractères sur GitHub.' },
        { q: "L'outil de séparateurs ASCII est-il gratuit ?", a: 'Oui, il est entièrement gratuit, fonctionne dans votre navigateur et ne nécessite aucun compte. Rien de ce que vous créez n\'est envoyé sur un serveur.' },
      ],
    },
    es: {
      heading: 'Acerca del generador de separadores e insignias ASCII',
      intro:
        'Esta herramienta gratuita genera líneas decorativas, insignias de estado y bloques de comentarios en texto plano para estructurar tus README, archivos fuente y documentación. Elige un estilo, escribe tu texto y copia el resultado — sin instalación.',
      faq: [
        { q: '¿Para qué sirven los bloques de comentarios ASCII?', a: 'Marcan visualmente las secciones principales de un archivo de código (controladores, módulos, configuración) con un encabezado enmarcado, más legible que un comentario de una sola línea.' },
        { q: '¿Puedo usar estas insignias en un README de GitHub?', a: 'Sí. Pega la insignia o la línea dentro de un bloque de código (```) en tu README.md para mantener la alineación de los caracteres en GitHub.' },
        { q: '¿Es gratuito el generador de separadores ASCII?', a: 'Sí, es completamente gratuito, funciona en tu navegador y no requiere cuenta. Nada de lo que crees se sube a un servidor.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Trenner- & Badge-Generator',
      intro:
        'Dieses kostenlose Tool erzeugt dekorative Linien, Status-Badges und Kommentarblöcke aus reinem Text, um README-Dateien, Quellcode und Dokumentation zu strukturieren. Stil wählen, Text eingeben, Ergebnis kopieren — ohne Installation.',
      faq: [
        { q: 'Wofür sind ASCII-Kommentarblöcke gedacht?', a: 'Sie markieren die wichtigsten Abschnitte einer Codedatei (Controller, Module, Konfiguration) visuell mit einer umrahmten Überschrift — besser lesbar als ein einzeiliger Kommentar.' },
        { q: 'Kann ich diese Badges in einer GitHub-README verwenden?', a: 'Ja. Fügen Sie das Badge oder die Linie in einen Codeblock (```) Ihrer README.md ein, damit die Zeichen auf GitHub ausgerichtet bleiben.' },
        { q: 'Ist der ASCII-Trenner-Generator kostenlos?', a: 'Ja, er ist völlig kostenlos, läuft vollständig in Ihrem Browser und erfordert kein Konto. Nichts, was Sie erstellen, wird auf einen Server hochgeladen.' },
      ],
    },
    it: {
      heading: 'Informazioni sul generatore di separatori e badge ASCII',
      intro:
        'Questo strumento gratuito genera linee decorative, badge di stato e blocchi di commento in puro testo per strutturare i tuoi README, file sorgente e documentazione. Scegli uno stile, digita il testo e copia il risultato — nessuna installazione richiesta.',
      faq: [
        { q: 'A cosa servono i blocchi di commento ASCII?', a: 'Segnano visivamente le sezioni principali di un file di codice (controller, moduli, configurazione) con un\'intestazione riquadrata, più leggibile di un commento su una riga.' },
        { q: 'Posso usare questi badge in un README di GitHub?', a: 'Sì. Incolla il badge o la linea all\'interno di un blocco di codice (```) nel tuo README.md per mantenere l\'allineamento dei caratteri su GitHub.' },
        { q: 'Il generatore di separatori ASCII è gratuito?', a: 'Sì, è completamente gratuito, funziona interamente nel browser e non richiede un account. Nulla di ciò che crei viene caricato su un server.' },
      ],
    },
    pt: {
      heading: 'Sobre o gerador de separadores e selos ASCII',
      intro:
        'Esta ferramenta gratuita gera linhas decorativas, selos de estado e blocos de comentários em texto simples para estruturar os seus READMEs, ficheiros de código e documentação. Escolha um estilo, escreva o texto e copie o resultado — sem instalação.',
      faq: [
        { q: 'Para que servem os blocos de comentários ASCII?', a: 'Marcam visualmente as secções principais de um ficheiro de código (controladores, módulos, configuração) com um cabeçalho emoldurado, mais legível do que um comentário de uma linha.' },
        { q: 'Posso usar estes selos num README do GitHub?', a: 'Sim. Cole o selo ou a linha dentro de um bloco de código (```) no seu README.md para manter o alinhamento dos caracteres no GitHub.' },
        { q: 'O gerador de separadores ASCII é gratuito?', a: 'Sim, é totalmente gratuito, funciona inteiramente no seu navegador e não requer conta. Nada do que criar é enviado para um servidor.' },
      ],
    },
    ru: {
      heading: 'О генераторе ASCII-разделителей и бейджей',
      intro:
        'Этот бесплатный инструмент создаёт декоративные линии, статусные бейджи и блоки комментариев в виде обычного текста для структурирования README, исходных файлов и документации. Выберите стиль, введите текст и скопируйте результат — установка не требуется.',
      faq: [
        { q: 'Для чего нужны блоки комментариев ASCII?', a: 'Они визуально выделяют основные разделы файла кода (контроллеры, модули, конфигурация) рамкой с заголовком — это читается лучше, чем однострочный комментарий.' },
        { q: 'Можно ли использовать эти бейджи в README на GitHub?', a: 'Да. Вставьте бейдж или линию внутрь блока кода (```) в вашем README.md, чтобы символы сохранили выравнивание на GitHub.' },
        { q: 'Бесплатен ли генератор ASCII-разделителей?', a: 'Да, он полностью бесплатен, работает прямо в браузере и не требует аккаунта. Ничего из созданного вами не отправляется на сервер.' },
      ],
    },
    ja: {
      heading: 'ASCII区切り線＆バッジ生成ツールについて',
      intro:
        'この無料ツールは、READMEやソースファイル、ドキュメントを整理するための装飾ライン、ステータスバッジ、プレーンテキストのコメントブロックを生成します。スタイルを選んでテキストを入力し、結果をコピーするだけ。インストール不要。',
      faq: [
        { q: 'ASCIIコメントブロックは何のためにあるのですか？', a: 'コードファイルの主要セクション（コントローラー、モジュール、設定など）を枠で囲んだ見出しで視覚的に区切ります。1行コメントより読みやすくなります。' },
        { q: 'これらのバッジをGitHubのREADMEで使えますか？', a: 'はい。README.md内のコードブロック（```）の中に貼り付ければ、GitHub上でも文字の位置が崩れません。' },
        { q: 'ASCII区切り線ジェネレーターは無料ですか？', a: 'はい、完全無料で、すべてブラウザ内で動作し、アカウントも不要です。作成した内容がサーバーにアップロードされることはありません。' },
      ],
    },
  },
};
```

- [ ] **Step 3: Verify the build type-checks**

Run: `npm run build`
Expected: succeeds. This is the real test for this task — `ToolSlug` is `keyof typeof TOOLS_SEO`, and `CONTENT` is typed `Record<ToolSlug, LocalizedToolContent>`, so a missing or mistyped `'separators'` entry in either file fails TypeScript compilation.

- [ ] **Step 4: Commit**

```bash
git add src/lib/seo-config.ts src/lib/tool-seo-content.ts
git commit -m "feat(separators): register SEO metadata and FAQ content for the separators tool"
```

---

### Task 5: Routing, nav registration, sitemap

**Files:**
- Create: `src/app/[locale]/tools/separators/page.tsx`
- Modify: `src/lib/tools.ts:1-49`
- Modify: `src/app/sitemap.ts:6-19`

**Interfaces:**
- Consumes: `SeparatorGenerator` from `@/components/separator-generator/separator-generator` (Task 3); `buildToolMetadata`, `'separators'` `ToolSlug` from `@/lib/seo-config` (Task 4); `ToolSeoSection` (existing, generic).

- [ ] **Step 1: Create the route**

Create `src/app/[locale]/tools/separators/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { SeparatorGenerator } from '@/components/separator-generator/separator-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('separators', locale);
}

export default async function SeparatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <SeparatorGenerator />
      <AdSlot slot="separators-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="separators" locale={locale} />
    </>
  );
}
```

- [ ] **Step 2: Register the tool in the nav**

Edit `src/lib/tools.ts`. Update the icon import:

```ts
import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText, Edit3, QrCode } from '@/components/icons';
```
→
```ts
import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText, Edit3, QrCode, Minus } from '@/components/icons';
```

Add the new entry at the end of the `TOOLS` array:

```ts
  {
    id: 'markdown-editor',
    href: '/tools/markdown-editor',
    icon: Edit3,
    nameKey: 'markdownEditor',
  },
];
```
→
```ts
  {
    id: 'markdown-editor',
    href: '/tools/markdown-editor',
    icon: Edit3,
    nameKey: 'markdownEditor',
  },
  {
    id: 'separators',
    href: '/tools/separators',
    icon: Minus,
    nameKey: 'separators',
  },
];
```

- [ ] **Step 3: Add the route to the sitemap**

Edit `src/app/sitemap.ts`:

```ts
  { path: '/tools/markdown-editor', priority: 0.8 },
  { path: '/tools/ascii-emoji', priority: 0.8 },
```
→
```ts
  { path: '/tools/markdown-editor', priority: 0.8 },
  { path: '/tools/ascii-emoji', priority: 0.8 },
  { path: '/tools/separators', priority: 0.8 },
```

- [ ] **Step 4: Run the full test suite and build**

Run: `npm test`
Expected: all tests pass, including the new `tests/separators/generator.test.ts` and `tests/i18n/separator-locales.test.ts`.

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: succeeds, `/tools/separators` is statically generated for all 8 locales.

- [ ] **Step 5: Manual smoke test in the browser**

Run: `npm run dev`, then open `http://localhost:3000/tools/separators`.

Verify:
- The nav shows "Séparateurs & Badges" and links to the page.
- The page loads with a default 40-character `─` line already in the preview.
- Switching "Type de bloc" to "Badge" hides the line-only options, shows the text input, and produces `[ STATUS: ACTIVE ]` (or the current input) in the preview.
- Switching to "Bloc de commentaire" with C/JS produces a 3-line `/* ... */` boxed header; switching the language to Python/Bash produces the `#`-style version.
- Copy and download buttons work (copy shows a toast; download saves a `.txt` file).
- Switching the locale (e.g. `/en/tools/separators`) shows the English strings.

- [ ] **Step 6: Commit**

```bash
git add src/app/\[locale\]/tools/separators/page.tsx src/lib/tools.ts src/app/sitemap.ts
git commit -m "feat(separators): add route, nav entry and sitemap registration"
```

---

### Task 6: Changelog & version bump

**Files:**
- Modify: `CHANGELOG.md:1-8`
- Modify: `src/lib/changelog.ts:1-27`
- Modify: `package.json:3`

**Interfaces:**
- Consumes: nothing (documentation-only task, run last since it describes the finished feature).

- [ ] **Step 1: Add the CHANGELOG.md entry**

Edit `CHANGELOG.md`:

```md
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [2.2.3] - 2026-09-20
```
→
```md
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [2.3.0] - 2026-09-22

Ajout d'un nouvel outil : générateur de séparateurs & badges ASCII.

### Ajouté

- **Générateur de séparateurs & badges ASCII** (`/tools/separators`) : lignes
  décoratives, badges de statut et blocs de commentaires encadrés (C/JS,
  Python/Bash) pour structurer README et fichiers de code.

## [2.2.3] - 2026-09-20
```

- [ ] **Step 2: Add the `changelog.ts` entry and bump `APP_VERSION`**

Edit `src/lib/changelog.ts`:

```ts
export const APP_VERSION = '2.2.3';
```
→
```ts
export const APP_VERSION = '2.3.0';
```

```ts
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.2.3',
```
→
```ts
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.3.0',
    date: '2026-09-22',
    summary: 'Nouvel outil : générateur de séparateurs & badges ASCII.',
    sections: [
      {
        title: 'Ajouté',
        items: [
          'Générateur de séparateurs & badges ASCII (/tools/separators) : lignes décoratives, badges de statut et blocs de commentaires encadrés (C/JS, Python/Bash) pour structurer README et fichiers de code.',
        ],
      },
    ],
  },
  {
    version: '2.2.3',
```

- [ ] **Step 3: Bump `package.json`**

Edit `package.json`:

```json
  "version": "2.2.3",
```
→
```json
  "version": "2.3.0",
```

- [ ] **Step 4: Verify the changelog dialog renders the new entry**

Run: `npm run dev`, open the app, click the version number in the sidebar footer to open the changelog dialog, and confirm the "2.3.0" entry appears at the top with the new item.

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md src/lib/changelog.ts package.json
git commit -m "chore(release): bump version to 2.3.0 for the separators & badges tool"
```
