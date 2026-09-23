# Arbre ASCII ↔ Commandes mkdir/touch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a new tool at `/tools/tree-to-commands` that converts a pasted ASCII tree into `mkdir -p`/`touch` shell commands (Mode A), and the reverse — commands into a rendered ASCII tree (Mode B) — fully wired into the site's routing, SEO, i18n and homepage showcase.

**Architecture:** Two pure functions in a new `src/lib/tree-commands-generator.ts` handle all parsing/generation logic (no React, fully unit-testable with vitest, which this repo already uses — see `tests/separators/generator.test.ts`). A new `src/components/tree-commands-generator/` folder holds the UI, modeled directly on `src/components/sparkline-generator/`. Mode B's tree rendering reuses the existing `generateASCIITree()` from `src/lib/tree-generator.ts` — no new tree-rendering logic is written.

**Tech Stack:** Next.js 16 App Router, TypeScript (strict), next-intl, Zod (not needed here — no persisted/imported JSON for this tool), Vitest (`tests/**/*.test.ts`, run via `npm test`).

**Spec:** [docs/superpowers/specs/2026-09-23-tree-to-commands-design.md](../specs/2026-09-23-tree-to-commands-design.md)

## Global Constraints

- Slug/route: `/tools/tree-to-commands`. Nav label / tool name: "Arbre ↔ Commandes" (fr).
- Mode A output format: one `mkdir -p <path>` or `touch <path>` command per line, no `&&` chaining (spec §"Format de sortie du Mode A").
- Mode B input format: only `mkdir -p <path>` / `touch <path>`, one per line — no `&&` chaining support (spec §"Parsing en Mode B").
- Connector styles to detect in Mode A parsing: unicode (`├── `, `└── `, `│   `) and ascii (`|-- `, `` `-- ``, `|   `), possibly mixed within the same pasted text (spec §"Parsing en Mode A").
- File vs folder heuristic (spec §"Parsing en Mode A", point 4): node with children → folder; leaf ending in `/` or `\` → folder (marker stripped); leaf with a dot not only at position 0, or starting with `.` (dotfiles) → file; otherwise → empty folder.
- Every `ParseResult` is `{ nodes: TreeNode[]; errors: string[]; warnings: string[] }` (spec §"Avertissements"): `errors` = unrecognized lines, `warnings` = dangerous paths (`..` segment, or absolute path starting with `/`).
- UI must show a permanent security notice in Mode A near the output (spec §"Avertissements" → "UI : rappel avant exécution").
- No test framework limitation applies here — the repo already runs **Vitest** (`npm test` → `vitest run`, config at `vitest.config.mts`, tests under `tests/**/*.test.ts`, alias `@` → `src`). All pure-logic tasks below follow real TDD with Vitest. There is no component-testing library in this repo (no test file anywhere touches a `.tsx` component) — UI tasks are verified manually via `npm run dev`, consistent with how every other tool in this codebase was built.
- i18n: all 8 locales (`fr, en, es, de, it, pt, ru, ja` — see `src/i18n/locales.ts`) must get every new key, non-empty (enforced by the i18n test in Task 6).
- Icon: use the already-available `TerminalIcon` from `@hugeicons/core-free-icons` (confirmed present in `node_modules`), wrapped as `Terminal` in `src/components/icons.tsx` exactly like the other icons there.

---

### Task 1: `generateShellCommands()` — tree → shell commands

**Files:**
- Create: `src/lib/tree-commands-types.ts`
- Create: `src/lib/tree-commands-generator.ts`
- Test: `tests/tree-commands/generate-shell-commands.test.ts`

**Interfaces:**
- Consumes: `TreeNode` from `@/lib/types` (`{ id, name, type: 'file' | 'folder', children？, isExpanded？ }`).
- Produces: `export type TreeCommandsMode = 'treeToCommands' | 'commandsToTree'` and `export interface ParseResult { nodes: TreeNode[]; errors: string[]; warnings: string[] }` from `tree-commands-types.ts` (used by Tasks 2 and 3). `export function generateShellCommands(nodes: TreeNode[]): string` from `tree-commands-generator.ts` (used by Task 4's UI container).

- [ ] **Step 1: Create the types file**

`src/lib/tree-commands-types.ts`:
```ts
export type TreeCommandsMode = 'treeToCommands' | 'commandsToTree';

export interface ParseResult {
  nodes: import('./types').TreeNode[];
  errors: string[];
  warnings: string[];
}
```

- [ ] **Step 2: Write the failing test**

`tests/tree-commands/generate-shell-commands.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { generateShellCommands } from '@/lib/tree-commands-generator';
import type { TreeNode } from '@/lib/types';

describe('generateShellCommands', () => {
  it('emits touch for a single root file', () => {
    const nodes: TreeNode[] = [{ id: '1', name: 'README.md', type: 'file' }];
    expect(generateShellCommands(nodes)).toBe('touch README.md');
  });

  it('emits mkdir -p for an empty folder', () => {
    const nodes: TreeNode[] = [{ id: '1', name: 'empty', type: 'folder', children: [] }];
    expect(generateShellCommands(nodes)).toBe('mkdir -p empty');
  });

  it('emits mkdir -p then touch for a folder with a file child, joined with /', () => {
    const nodes: TreeNode[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        children: [{ id: '2', name: 'index.ts', type: 'file' }],
      },
    ];
    expect(generateShellCommands(nodes)).toBe('mkdir -p src\ntouch src/index.ts');
  });

  it('walks nested folders depth-first, building the full path at each level', () => {
    const nodes: TreeNode[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        children: [
          {
            id: '2',
            name: 'lib',
            type: 'folder',
            children: [{ id: '3', name: 'utils.ts', type: 'file' }],
          },
        ],
      },
      { id: '4', name: 'README.md', type: 'file' },
    ];
    expect(generateShellCommands(nodes)).toBe(
      'mkdir -p src\nmkdir -p src/lib\ntouch src/lib/utils.ts\ntouch README.md'
    );
  });

  it('returns an empty string for no nodes', () => {
    expect(generateShellCommands([])).toBe('');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- tests/tree-commands/generate-shell-commands.test.ts`
Expected: FAIL — `generateShellCommands` is not exported from `@/lib/tree-commands-generator` (module doesn't exist yet).

- [ ] **Step 4: Write the minimal implementation**

`src/lib/tree-commands-generator.ts`:
```ts
import type { TreeNode } from './types';

export function generateShellCommands(nodes: TreeNode[]): string {
  const lines: string[] = [];

  function walk(node: TreeNode, parentPath: string) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === 'folder') {
      lines.push(`mkdir -p ${path}`);
      (node.children ?? []).forEach((child) => walk(child, path));
    } else {
      lines.push(`touch ${path}`);
    }
  }

  nodes.forEach((node) => walk(node, ''));
  return lines.join('\n');
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- tests/tree-commands/generate-shell-commands.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/lib/tree-commands-types.ts src/lib/tree-commands-generator.ts tests/tree-commands/generate-shell-commands.test.ts
git commit -m "feat(tree-commands): generate shell commands from a TreeNode tree"
```

---

### Task 2: `parseAsciiTreeText()` — ASCII tree text → TreeNode[]

**Files:**
- Modify: `src/lib/tree-commands-generator.ts`
- Test: `tests/tree-commands/parse-ascii-tree-text.test.ts`

**Interfaces:**
- Consumes: nothing beyond `TreeNode` (`@/lib/types`).
- Produces: `export function parseAsciiTreeText(text: string): ParseResult` (used by Task 4's UI container). `ParseResult` type from Task 1's `tree-commands-types.ts`.

- [ ] **Step 1: Write the failing tests**

`tests/tree-commands/parse-ascii-tree-text.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseAsciiTreeText } from '@/lib/tree-commands-generator';

describe('parseAsciiTreeText', () => {
  it('parses a simple unicode tree into a nested structure', () => {
    const text = ['├── src', '│   └── index.ts', '└── README.md'].join('\n');
    const { nodes, errors, warnings } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
    expect(nodes[1]).toMatchObject({ name: 'README.md', type: 'file' });
  });

  it('parses the equivalent ascii-style tree the same way', () => {
    const text = ['|-- src', '|   `-- index.ts', '`-- README.md'].join('\n');
    const { nodes, errors } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('accepts unicode and ascii connectors mixed in the same paste', () => {
    const text = ['├── src', '|   `-- index.ts'].join('\n');
    const { nodes, errors } = parseAsciiTreeText(text);

    expect(errors).toEqual([]);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('treats a leaf with no extension as an empty folder', () => {
    const { nodes } = parseAsciiTreeText('└── bin');
    expect(nodes[0]).toMatchObject({ name: 'bin', type: 'folder', children: undefined });
  });

  it('treats a dotfile leaf as a file', () => {
    const { nodes } = parseAsciiTreeText('└── .gitignore');
    expect(nodes[0]).toMatchObject({ name: '.gitignore', type: 'file' });
  });

  it('treats a leaf ending in / or \\\\ as an explicit empty folder and strips the marker', () => {
    const text = ['├── dist/', '└── build\\'].join('\n');
    const { nodes } = parseAsciiTreeText(text);
    expect(nodes[0]).toMatchObject({ name: 'dist', type: 'folder' });
    expect(nodes[1]).toMatchObject({ name: 'build', type: 'folder' });
  });

  it('is tolerant of a depth jump of more than one level, attaching to the deepest available parent', () => {
    // Malformed: index.ts should be depth 1 under src, but paste has depth 2.
    const text = ['├── src', '│       └── index.ts'].join('\n');
    const { nodes } = parseAsciiTreeText(text);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('collects unrecognized lines into errors without stopping the parse', () => {
    const text = ['├── src', 'not a tree line', '└── README.md'].join('\n');
    const { nodes, errors } = parseAsciiTreeText(text);
    expect(errors).toEqual(['not a tree line']);
    expect(nodes.map((n) => n.name)).toEqual(['src', 'README.md']);
  });

  it('warns on a ".." segment and on a name starting with "/"', () => {
    const text = ['├── ..', '└── /etc'].join('\n');
    const { warnings } = parseAsciiTreeText(text);
    expect(warnings).toEqual(['..', '/etc']);
  });

  it('ignores blank lines and returns empty results for empty input', () => {
    expect(parseAsciiTreeText('')).toEqual({ nodes: [], errors: [], warnings: [] });
    expect(parseAsciiTreeText('\n\n')).toEqual({ nodes: [], errors: [], warnings: [] });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/tree-commands/parse-ascii-tree-text.test.ts`
Expected: FAIL — `parseAsciiTreeText` is not exported yet.

- [ ] **Step 3: Write the minimal implementation**

Append to `src/lib/tree-commands-generator.ts` (keep the existing `generateShellCommands` above it):
```ts
import type { TreeNode } from './types';
import type { ParseResult } from './tree-commands-types';

const UNICODE_PIPE = '│   '; // '│   '
const ASCII_PIPE = '|   ';
const BLANK_INDENT = '    ';
const UNICODE_BRANCH = '├── '; // '├── '
const UNICODE_LAST = '└── '; // '└── '
const ASCII_BRANCH = '|-- ';
const ASCII_LAST = '`-- ';

function stripConnector(line: string): { depth: number; name: string } | null {
  let rest = line;
  let depth = 0;

  while (
    rest.startsWith(UNICODE_PIPE) ||
    rest.startsWith(ASCII_PIPE) ||
    rest.startsWith(BLANK_INDENT)
  ) {
    rest = rest.slice(4);
    depth += 1;
  }

  if (
    rest.startsWith(UNICODE_BRANCH) ||
    rest.startsWith(UNICODE_LAST) ||
    rest.startsWith(ASCII_BRANCH) ||
    rest.startsWith(ASCII_LAST)
  ) {
    return { depth, name: rest.slice(4).trim() };
  }

  return null;
}

function looksLikeFile(name: string): boolean {
  if (name.startsWith('.')) return true; // dotfiles: .gitignore, .env
  return /\.[^./\\]+$/.test(name); // has a trailing extension segment
}

function applyFileFolderHeuristic(nodes: TreeNode[]): void {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      node.type = 'folder';
      applyFileFolderHeuristic(node.children);
      continue;
    }
    node.children = undefined;
    if (node.name.endsWith('/') || node.name.endsWith('\\')) {
      node.name = node.name.slice(0, -1);
      node.type = 'folder';
      continue;
    }
    node.type = looksLikeFile(node.name) ? 'file' : 'folder';
  }
}

export function parseAsciiTreeText(text: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const root: TreeNode[] = [];
  const stack: { depth: number; node: TreeNode }[] = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (line.trim() === '') continue;

    const parsed = stripConnector(line);
    if (!parsed) {
      errors.push(line);
      continue;
    }

    const parentDepth = stack.length > 0 ? stack[stack.length - 1].depth : -1;
    const depth = parsed.depth > parentDepth + 1 ? parentDepth + 1 : parsed.depth;

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const name = parsed.name;
    if (name === '..' || name.startsWith('/')) {
      warnings.push(name);
    }

    const node: TreeNode = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      isExpanded: true,
    };

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    }

    stack.push({ depth, node });
  }

  applyFileFolderHeuristic(root);
  return { nodes: root, errors, warnings };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/tree-commands/parse-ascii-tree-text.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/tree-commands-generator.ts tests/tree-commands/parse-ascii-tree-text.test.ts
git commit -m "feat(tree-commands): parse pasted ASCII tree text into TreeNode[]"
```

---

### Task 3: `parseShellCommands()` — shell commands → TreeNode[]

**Files:**
- Modify: `src/lib/tree-commands-generator.ts`
- Test: `tests/tree-commands/parse-shell-commands.test.ts`

**Interfaces:**
- Consumes: `TreeNode` (`@/lib/types`), `ParseResult` (`@/lib/tree-commands-types`).
- Produces: `export function parseShellCommands(text: string): ParseResult` (used by Task 4's UI container, then piped into `generateASCIITree()` from `@/lib/tree-generator`).

- [ ] **Step 1: Write the failing tests**

`tests/tree-commands/parse-shell-commands.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseShellCommands } from '@/lib/tree-commands-generator';

describe('parseShellCommands', () => {
  it('builds a folder from a single mkdir -p', () => {
    const { nodes, errors, warnings } = parseShellCommands('mkdir -p src');
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(nodes).toEqual([expect.objectContaining({ name: 'src', type: 'folder' })]);
  });

  it('builds a file from a single touch', () => {
    const { nodes } = parseShellCommands('touch README.md');
    expect(nodes).toEqual([expect.objectContaining({ name: 'README.md', type: 'file' })]);
  });

  it('nests intermediate segments as folders for a multi-segment touch', () => {
    const { nodes } = parseShellCommands('touch src/lib/utils.ts');
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'lib',
          type: 'folder',
          children: [{ name: 'utils.ts', type: 'file' }],
        },
      ],
    });
  });

  it('merges mkdir -p and touch lines that share a parent folder', () => {
    const text = ['mkdir -p src', 'touch src/index.ts'].join('\n');
    const { nodes } = parseShellCommands(text);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      name: 'src',
      type: 'folder',
      children: [{ name: 'index.ts', type: 'file' }],
    });
  });

  it('collects lines that are neither mkdir -p nor touch into errors', () => {
    const text = ['mkdir -p src', 'rm -rf /', 'touch src/index.ts'].join('\n');
    const { nodes, errors } = parseShellCommands(text);
    expect(errors).toEqual(['rm -rf /']);
    expect(nodes[0].children).toHaveLength(1);
  });

  it('warns on an absolute path and on a ".." segment', () => {
    const text = ['mkdir -p /etc/app', 'touch ../secret.env'].join('\n');
    const { warnings } = parseShellCommands(text);
    expect(warnings).toEqual(['/etc/app', '../secret.env']);
  });

  it('returns empty results for empty input', () => {
    expect(parseShellCommands('')).toEqual({ nodes: [], errors: [], warnings: [] });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/tree-commands/parse-shell-commands.test.ts`
Expected: FAIL — `parseShellCommands` is not exported yet.

- [ ] **Step 3: Write the minimal implementation**

Append to `src/lib/tree-commands-generator.ts`:
```ts
function insertPath(level: TreeNode[], segments: string[], isFile: boolean): void {
  let currentLevel = level;

  segments.forEach((segment, index) => {
    const isLastSegment = index === segments.length - 1;
    const nodeType: 'file' | 'folder' = isLastSegment && isFile ? 'file' : 'folder';

    let node = currentLevel.find((n) => n.name === segment);
    if (!node) {
      node = {
        id: crypto.randomUUID(),
        name: segment,
        type: nodeType,
        children: nodeType === 'folder' ? [] : undefined,
      };
      currentLevel.push(node);
    } else if (nodeType === 'folder' && !node.children) {
      node.children = [];
    }

    if (nodeType === 'folder') {
      currentLevel = node.children!;
    }
  });
}

export function parseShellCommands(text: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const root: TreeNode[] = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line === '') continue;

    const mkdirMatch = line.match(/^mkdir\s+-p\s+(.+)$/);
    const touchMatch = line.match(/^touch\s+(.+)$/);

    if (!mkdirMatch && !touchMatch) {
      errors.push(line);
      continue;
    }

    const path = (mkdirMatch ? mkdirMatch[1] : touchMatch![1]).trim();
    const isFile = !mkdirMatch;
    const segments = path.split('/').filter((s) => s !== '');

    if (path.startsWith('/') || segments.includes('..')) {
      warnings.push(path);
    }

    insertPath(root, segments, isFile);
  }

  return { nodes: root, errors, warnings };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/tree-commands/parse-shell-commands.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Run the full tree-commands test suite together**

Run: `npm test -- tests/tree-commands`
Expected: PASS (22 tests across the 3 files)

- [ ] **Step 6: Commit**

```bash
git add src/lib/tree-commands-generator.ts tests/tree-commands/parse-shell-commands.test.ts
git commit -m "feat(tree-commands): parse mkdir/touch commands into TreeNode[]"
```

---

### Task 4: UI components

**Files:**
- Modify: `src/components/icons.tsx`
- Create: `src/components/tree-commands-generator/tree-commands-mode-toggle.tsx`
- Create: `src/components/tree-commands-generator/tree-commands-input.tsx`
- Create: `src/components/tree-commands-generator/tree-commands-preview.tsx`
- Create: `src/components/tree-commands-generator/tree-commands-options-panel.tsx`
- Create: `src/components/tree-commands-generator/tree-commands-generator.tsx`

**Interfaces:**
- Consumes: `generateShellCommands`, `parseAsciiTreeText`, `parseShellCommands` (`@/lib/tree-commands-generator`), `TreeCommandsMode` (`@/lib/tree-commands-types`), `ConnectorStyle` (`@/lib/types`), `generateASCIITree` (`@/lib/tree-generator`), `useRightSidebar` (`@/lib/contexts/right-sidebar-context`), `useToast` (`@/hooks/use-toast`), `trackEvent` (`@/lib/analytics-events`), `Terminal`/`Copy`/`Download`/`Trash2` icons (`@/components/icons`), translations under the `treeCommandsGenerator` namespace (added in Task 6).
- Produces: `export function TreeCommandsGenerator()` (used by Task 5's page route).

- [ ] **Step 1: Add the `Terminal` icon**

In `src/components/icons.tsx`, add `TerminalIcon` to the import block from `"@hugeicons/core-free-icons"`, right after `TableIcon as HugeTableIcon,`:
```ts
  TableIcon as HugeTableIcon,
  TerminalIcon,
  TextBoldIcon,
```
Then add the export, right after the `Table`/`TableIcon` exports and before `Trash2`:
```ts
export const Table = createIcon(HugeTableIcon, "Table");
export const TableIcon = createIcon(HugeTableIcon, "TableIcon");
export const Terminal = createIcon(TerminalIcon, "Terminal");
export const Trash2 = createIcon(Delete02Icon, "Trash2");
```

- [ ] **Step 2: Create the mode toggle**

`src/components/tree-commands-generator/tree-commands-mode-toggle.tsx`:
```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';

interface TreeCommandsModeToggleProps {
  mode: TreeCommandsMode;
  onModeChange: (mode: TreeCommandsMode) => void;
}

export function TreeCommandsModeToggle({ mode, onModeChange }: TreeCommandsModeToggleProps) {
  const t = useTranslations('treeCommandsGenerator');

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={mode === 'treeToCommands' ? 'default' : 'outline'}
        onClick={() => onModeChange('treeToCommands')}
      >
        {t('modes.treeToCommands')}
      </Button>
      <Button
        size="sm"
        variant={mode === 'commandsToTree' ? 'default' : 'outline'}
        onClick={() => onModeChange('commandsToTree')}
      >
        {t('modes.commandsToTree')}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create the input component**

`src/components/tree-commands-generator/tree-commands-input.tsx`:
```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Trash2 } from '@/components/icons';
import { useTranslations } from 'next-intl';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';

interface TreeCommandsInputProps {
  mode: TreeCommandsMode;
  input: string;
  errors: string[];
  warnings: string[];
  onInputChange: (value: string) => void;
  onClear: () => void;
}

export function TreeCommandsInput({
  mode,
  input,
  errors,
  warnings,
  onInputChange,
  onClear,
}: TreeCommandsInputProps) {
  const t = useTranslations('treeCommandsGenerator');
  const placeholder =
    mode === 'treeToCommands' ? t('input.placeholderTree') : t('input.placeholderCommands');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('input.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="font-mono min-h-[160px] resize-y"
        />
        {warnings.length > 0 && (
          <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-500">
            {warnings.map((path, i) => (
              <li key={i}>{t('warnings.dangerousPath', { path })}</li>
            ))}
          </ul>
        )}
        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-destructive">
            {errors.map((line, i) => (
              <li key={i}>{t('errors.unrecognizedLine', { line })}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create the preview component**

`src/components/tree-commands-generator/tree-commands-preview.tsx`:
```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Copy, Download } from '@/components/icons';
import { useTranslations } from 'next-intl';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';

interface TreeCommandsPreviewProps {
  mode: TreeCommandsMode;
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function TreeCommandsPreview({ mode, output, onCopy, onDownload }: TreeCommandsPreviewProps) {
  const t = useTranslations('treeCommandsGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
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
        {mode === 'treeToCommands' && (
          <p className="mt-3 text-xs text-muted-foreground">{t('preview.securityNotice')}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create the options panel**

`src/components/tree-commands-generator/tree-commands-options-panel.tsx`:
```tsx
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConnectorStyle } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface TreeCommandsOptionsPanelProps {
  connectorStyle: ConnectorStyle;
  onConnectorStyleChange: (style: ConnectorStyle) => void;
}

export function TreeCommandsOptionsPanel({
  connectorStyle,
  onConnectorStyleChange,
}: TreeCommandsOptionsPanelProps) {
  const t = useTranslations('treeCommandsGenerator');

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-2">
        <Label htmlFor="connectorStyle">{t('options.connectorStyle')}</Label>
        <Select value={connectorStyle} onValueChange={(v) => onConnectorStyleChange(v as ConnectorStyle)}>
          <SelectTrigger id="connectorStyle" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unicode">{t('options.styleUnicode')}</SelectItem>
            <SelectItem value="ascii">{t('options.styleAscii')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create the container**

`src/components/tree-commands-generator/tree-commands-generator.tsx`:
```tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics-events';
import { generateASCIITree } from '@/lib/tree-generator';
import { generateShellCommands, parseAsciiTreeText, parseShellCommands } from '@/lib/tree-commands-generator';
import type { ConnectorStyle } from '@/lib/types';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';
import { TreeCommandsModeToggle } from './tree-commands-mode-toggle';
import { TreeCommandsInput } from './tree-commands-input';
import { TreeCommandsPreview } from './tree-commands-preview';
import { TreeCommandsOptionsPanel } from './tree-commands-options-panel';

const DEFAULT_MODE: TreeCommandsMode = 'treeToCommands';

export function TreeCommandsGenerator() {
  const t = useTranslations('treeCommandsGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [mode, setMode] = useState<TreeCommandsMode>(DEFAULT_MODE);
  const [input, setInput] = useState('');
  const [connectorStyle, setConnectorStyle] = useState<ConnectorStyle>('unicode');

  const result = useMemo(() => {
    if (mode === 'treeToCommands') {
      const { nodes, errors, warnings } = parseAsciiTreeText(input);
      return { output: generateShellCommands(nodes), errors, warnings };
    }
    const { nodes, errors, warnings } = parseShellCommands(input);
    const output = generateASCIITree(nodes, {
      prefix: '',
      connector: '',
      lastConnector: '',
      indent: '',
      connectorStyle,
    });
    return { output, errors, warnings };
  }, [mode, input, connectorStyle]);

  useEffect(() => {
    if (mode === 'commandsToTree') {
      setContent(
        <TreeCommandsOptionsPanel connectorStyle={connectorStyle} onConnectorStyleChange={setConnectorStyle} />
      );
    } else {
      setContent(null);
    }
    return () => setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, connectorStyle]);

  const handleClear = useCallback(() => setInput(''), []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      trackEvent('Copy', { tool: 'tree-to-commands', mode });
      toast({ description: t('errors.copySuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [result.output, t, toast, mode]);

  const downloadOutput = useCallback(() => {
    try {
      const blob = new Blob([result.output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'treeToCommands' ? 'commands.sh' : 'tree.txt';
      a.click();
      URL.revokeObjectURL(url);
      trackEvent('Download', { tool: 'tree-to-commands', mode });
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [result.output, t, toast, mode]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <TreeCommandsModeToggle mode={mode} onModeChange={setMode} />
      <TreeCommandsInput
        mode={mode}
        input={input}
        errors={result.errors}
        warnings={result.warnings}
        onInputChange={setInput}
        onClear={handleClear}
      />
      <TreeCommandsPreview mode={mode} output={result.output} onCopy={copyToClipboard} onDownload={downloadOutput} />
    </div>
  );
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors related to the new files.

- [ ] **Step 8: Commit**

```bash
git add src/components/icons.tsx src/components/tree-commands-generator
git commit -m "feat(tree-commands): add the two-mode UI components"
```

---

### Task 5: Route, registries, homepage showcase and SEO

**Files:**
- Create: `src/app/[locale]/tools/tree-to-commands/page.tsx`
- Modify: `src/lib/tools.ts`
- Modify: `src/components/home/tools-showcase.tsx`
- Modify: `src/lib/seo-config.ts`
- Modify: `src/lib/tool-seo-content.ts`
- Test: `tests/seo/tree-to-commands-seo.test.ts`

**Interfaces:**
- Consumes: `TreeCommandsGenerator` (`@/components/tree-commands-generator/tree-commands-generator`), `buildToolMetadata`/`getToolMetadata` (`@/lib/seo-config`), `getToolContent` (`@/lib/tool-seo-content`), `ToolSeoSection` (`@/components/tools/tool-seo-section`), `AdSlot` (`@/components/ui/ad-slot`), `Terminal` icon (Task 4).
- Produces: the `'tree-to-commands'` key becomes a valid `ToolSlug` (used by Task 6's i18n keys and by this task's own SEO test).

- [ ] **Step 1: Create the page route**

`src/app/[locale]/tools/tree-to-commands/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { TreeCommandsGenerator } from '@/components/tree-commands-generator/tree-commands-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('tree-to-commands', locale);
}

export default async function TreeToCommandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <TreeCommandsGenerator />
      <AdSlot slot="tree-to-commands-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="tree-to-commands" locale={locale} />
    </>
  );
}
```

- [ ] **Step 2: Register the tool in `src/lib/tools.ts`**

Change the import line:
```ts
import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText, Edit3, QrCode, Minus, Terminal } from '@/components/icons';
```
Add to the `TOOLS` array, after the `separators` entry:
```ts
  {
    id: 'tree-to-commands',
    href: '/tools/tree-to-commands',
    icon: Terminal,
    nameKey: 'treeToCommands',
  },
```

- [ ] **Step 3: Register the tool on the homepage showcase**

In `src/components/home/tools-showcase.tsx`, add to `SHOWCASE_TOOLS`, after the `separators` entry:
```ts
  {
    id: 'tree-to-commands',
    href: '/tools/tree-to-commands',
    tag: 'MKDIR',
    nameKey: 'treeToCommands',
    descKey: 'home.tools.treeToCommands.desc',
    preview: `mkdir -p src
touch src/index.ts
touch README.md`,
  },
```

- [ ] **Step 4: Add the SEO metadata entry**

In `src/lib/seo-config.ts`, add to `TOOLS_SEO`, after the `'separators'` entry:
```ts
  'tree-to-commands': {
    titles: {
      fr: "Arbre ASCII → Commandes mkdir/touch | Générateur Gratuit",
      en: "ASCII Tree to mkdir/touch Commands Converter | Free",
      es: "Árbol ASCII a Comandos mkdir/touch | Generador Gratis",
      de: "ASCII-Baum zu mkdir/touch-Befehlen | Kostenloser Generator",
      it: "Albero ASCII in Comandi mkdir/touch | Generatore Gratis",
      pt: "Árvore ASCII para Comandos mkdir/touch | Gerador Grátis",
      ru: "ASCII-дерево в команды mkdir/touch | Бесплатный генератор",
      ja: "ASCIIツリー⇄mkdir/touchコマンド変換ツール | 無料",
    },
    descriptions: {
      fr: "Convertissez un arbre ASCII collé en commandes mkdir -p / touch prêtes à exécuter, ou reconstruisez un arbre lisible depuis des commandes shell. Gratuit, sans installation.",
      en: "Convert a pasted ASCII tree into ready-to-run mkdir -p / touch commands, or rebuild a readable tree from shell commands. Free, runs entirely in your browser.",
      es: "Convierte un árbol ASCII pegado en comandos mkdir -p / touch listos para ejecutar, o reconstruye un árbol legible a partir de comandos de shell. Gratis, sin instalación.",
      de: "Wandelt einen eingefügten ASCII-Baum in ausführbare mkdir -p / touch-Befehle um oder erstellt aus Shell-Befehlen wieder einen lesbaren Baum. Kostenlos, ohne Installation.",
      it: "Converte un albero ASCII incollato in comandi mkdir -p / touch pronti alluso, oppure ricostruisce un albero leggibile a partire da comandi shell. Gratis, senza installazione.",
      pt: "Converte uma árvore ASCII colada em comandos mkdir -p / touch prontos a executar, ou reconstrói uma árvore legível a partir de comandos de shell. Grátis, sem instalação.",
      ru: "Преобразует вставленное ASCII-дерево в готовые команды mkdir -p / touch, либо восстанавливает читаемое дерево из команд shell. Бесплатно, без установки.",
      ja: "貼り付けたASCIIツリーを実行可能なmkdir -p / touchコマンドに変換、または逆にシェルコマンドから見やすいツリーを再構築します。無料、ブラウザだけで動作します。",
    },
  },
```

- [ ] **Step 5: Add the SEO content entry**

In `src/lib/tool-seo-content.ts`, add to `CONTENT`, after the `'separators'` entry:
```ts
  'tree-to-commands': {
    en: {
      heading: 'About the ASCII Tree ↔ Commands Converter',
      intro:
        "This free tool converts a pasted ASCII tree (from this site's tree generator, or from the Unix `tree` command) into a list of `mkdir -p` and `touch` commands ready to paste into a terminal to recreate the folder structure on disk. It also works the other way: paste mkdir/touch commands to generate the matching ASCII tree.",
      faq: [
        { q: 'Are the generated commands executed automatically?', a: 'No. The tool only generates text to copy; you paste and run the commands yourself in your terminal, after reviewing them.' },
        { q: 'Which ASCII tree formats are supported?', a: 'Both unicode (├── └── │) and ascii (|-- `-- |) connector styles are detected automatically, even mixed within the same pasted text.' },
        { q: "What happens if a path contains '..' or starts with '/'?", a: 'The tool still generates it, but adds a visible warning since such a path could escape the target folder — review it before running the command.' },
      ],
    },
    fr: {
      heading: 'À propos du convertisseur Arbre ASCII ↔ Commandes',
      intro:
        "Cet outil gratuit convertit un arbre ASCII collé (sortie du générateur d'arbre du site, ou de la commande `tree` Unix) en une liste de commandes `mkdir -p` et `touch` prêtes à coller dans un terminal pour recréer l'arborescence sur disque. Il fait aussi l'inverse : coller des commandes mkdir/touch génère l'arbre ASCII correspondant.",
      faq: [
        { q: 'Les commandes générées sont-elles exécutées automatiquement ?', a: "Non. L'outil ne fait que générer du texte à copier ; c'est à vous de coller et d'exécuter les commandes dans votre terminal, après les avoir relues." },
        { q: "Quels formats d'arbre ASCII sont acceptés ?", a: 'Les styles unicode (├── └── │) et ascii (|-- `-- |) sont reconnus automatiquement, y compris mélangés dans le même texte collé.' },
        { q: "Que se passe-t-il si un chemin contient '..' ou commence par '/' ?", a: "L'outil l'affiche quand même, mais ajoute un avertissement visible car ce type de chemin peut sortir du dossier cible — à vérifier avant d'exécuter la commande." },
      ],
    },
    es: {
      heading: 'Acerca del convertidor Árbol ASCII ↔ Comandos',
      intro:
        "Esta herramienta gratuita convierte un árbol ASCII pegado (procedente del generador de árboles del sitio, o del comando `tree` de Unix) en una lista de comandos `mkdir -p` y `touch` listos para pegar en una terminal y recrear la estructura de carpetas en disco. También funciona al revés: pega comandos mkdir/touch para generar el árbol ASCII correspondiente.",
      faq: [
        { q: '¿Los comandos generados se ejecutan automáticamente?', a: 'No. La herramienta solo genera texto para copiar; tú pegas y ejecutas los comandos en tu terminal, después de revisarlos.' },
        { q: '¿Qué formatos de árbol ASCII se admiten?', a: 'Se detectan automáticamente los estilos unicode (├── └── │) y ascii (|-- `-- |), incluso mezclados en el mismo texto pegado.' },
        { q: "¿Qué ocurre si una ruta contiene '..' o empieza por '/'?", a: 'La herramienta la genera igualmente, pero añade una advertencia visible porque ese tipo de ruta puede salir de la carpeta destino — revísala antes de ejecutar el comando.' },
      ],
    },
    de: {
      heading: 'Über den ASCII-Baum-↔-Befehle-Konverter',
      intro:
        'Dieses kostenlose Tool wandelt einen eingefügten ASCII-Baum (aus dem Baumgenerator dieser Seite oder dem Unix-Befehl `tree`) in eine Liste von `mkdir -p`- und `touch`-Befehlen um, die Sie in ein Terminal einfügen können, um die Ordnerstruktur auf der Festplatte nachzubilden. Es funktioniert auch umgekehrt: mkdir/touch-Befehle einfügen erzeugt den passenden ASCII-Baum.',
      faq: [
        { q: 'Werden die erzeugten Befehle automatisch ausgeführt?', a: 'Nein. Das Tool erzeugt nur Text zum Kopieren; Sie fügen die Befehle selbst in Ihr Terminal ein und führen sie nach Prüfung aus.' },
        { q: 'Welche ASCII-Baum-Formate werden unterstützt?', a: 'Sowohl der Unicode-Stil (├── └── │) als auch der ASCII-Stil (|-- `-- |) werden automatisch erkannt, auch gemischt im selben eingefügten Text.' },
        { q: "Was passiert, wenn ein Pfad '..' enthält oder mit '/' beginnt?", a: 'Das Tool erzeugt ihn trotzdem, zeigt aber eine sichtbare Warnung, da ein solcher Pfad den Zielordner verlassen könnte — vor der Ausführung prüfen.' },
      ],
    },
    it: {
      heading: 'Informazioni sul convertitore Albero ASCII ↔ Comandi',
      intro:
        "Questo strumento gratuito converte un albero ASCII incollato (proveniente dal generatore di alberi del sito, o dal comando Unix `tree`) in un elenco di comandi `mkdir -p` e `touch` pronti da incollare in un terminale per ricreare la struttura di cartelle su disco. Funziona anche al contrario: incolla comandi mkdir/touch per generare l'albero ASCII corrispondente.",
      faq: [
        { q: 'I comandi generati vengono eseguiti automaticamente?', a: 'No. Lo strumento genera solo testo da copiare; sei tu a incollare ed eseguire i comandi nel terminale, dopo averli controllati.' },
        { q: 'Quali formati di albero ASCII sono supportati?', a: 'Vengono riconosciuti automaticamente sia lo stile unicode (├── └── │) sia lo stile ascii (|-- `-- |), anche mescolati nello stesso testo incollato.' },
        { q: "Cosa succede se un percorso contiene '..' o inizia con '/'?", a: "Lo strumento lo genera comunque, ma aggiunge un avviso visibile perché questo tipo di percorso potrebbe uscire dalla cartella di destinazione — controllalo prima di eseguire il comando." },
      ],
    },
    pt: {
      heading: 'Sobre o conversor Árvore ASCII ↔ Comandos',
      intro:
        "Esta ferramenta gratuita converte uma árvore ASCII colada (proveniente do gerador de árvores do site, ou do comando Unix `tree`) numa lista de comandos `mkdir -p` e `touch` prontos a colar num terminal para recriar a estrutura de pastas no disco. Também funciona ao contrário: cola comandos mkdir/touch para gerar a árvore ASCII correspondente.",
      faq: [
        { q: 'Os comandos gerados são executados automaticamente?', a: 'Não. A ferramenta apenas gera texto para copiar; é você quem cola e executa os comandos no terminal, depois de os rever.' },
        { q: 'Que formatos de árvore ASCII são suportados?', a: 'Os estilos unicode (├── └── │) e ascii (|-- `-- |) são detetados automaticamente, mesmo misturados no mesmo texto colado.' },
        { q: "O que acontece se um caminho contiver '..' ou começar por '/'?", a: 'A ferramenta gera-o na mesma, mas adiciona um aviso visível, pois esse tipo de caminho pode sair da pasta de destino — revê-o antes de executar o comando.' },
      ],
    },
    ru: {
      heading: 'О конвертере ASCII-дерево ↔ команды',
      intro:
        'Этот бесплатный инструмент преобразует вставленное ASCII-дерево (из генератора деревьев на этом сайте или из команды Unix `tree`) в список команд `mkdir -p` и `touch`, готовых для вставки в терминал для воссоздания структуры папок на диске. Работает и в обратную сторону: вставьте команды mkdir/touch, чтобы получить соответствующее ASCII-дерево.',
      faq: [
        { q: 'Выполняются ли сгенерированные команды автоматически?', a: 'Нет. Инструмент только создаёт текст для копирования; вы сами вставляете и выполняете команды в терминале после проверки.' },
        { q: 'Какие форматы ASCII-дерева поддерживаются?', a: 'Автоматически распознаются стили unicode (├── └── │) и ascii (|-- `-- |), даже смешанные в одном вставленном тексте.' },
        { q: "Что произойдёт, если путь содержит '..' или начинается с '/'?", a: 'Инструмент всё равно сгенерирует его, но добавит заметное предупреждение, так как такой путь может выйти за пределы целевой папки — проверьте перед выполнением.' },
      ],
    },
    ja: {
      heading: 'ASCIIツリー⇄コマンド変換ツールについて',
      intro:
        'この無料ツールは、貼り付けたASCIIツリー（本サイトのツリー生成ツールの出力、またはUnixの`tree`コマンドの出力）を、ターミナルに貼り付けて実行するだけでフォルダ構成を再現できる`mkdir -p`と`touch`コマンドのリストに変換します。逆方向にも対応しており、mkdir/touchコマンドを貼り付けると対応するASCIIツリーを生成します。',
      faq: [
        { q: '生成されたコマンドは自動的に実行されますか？', a: 'いいえ。このツールはコピー用のテキストを生成するだけです。内容を確認した上で、ご自身でターミナルに貼り付けて実行してください。' },
        { q: 'どのASCIIツリー形式に対応していますか？', a: 'unicode形式（├── └── │）とascii形式（|-- `-- |）の両方が自動検出され、同じテキスト内で混在していても認識されます。' },
        { q: "パスに'..'が含まれていたり'/'で始まっていたりする場合はどうなりますか？", a: 'その場合もコマンドは生成されますが、対象フォルダの外に出る可能性があるため目立つ警告が表示されます。実行前に必ず確認してください。' },
      ],
    },
  },
```

- [ ] **Step 6: Write the SEO test**

`tests/seo/tree-to-commands-seo.test.ts` (mirrors `tests/seo/separators-seo.test.ts`):
```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import { getToolMetadata } from '@/lib/seo-config';
import { getToolContent } from '@/lib/tool-seo-content';

const SLUG = 'tree-to-commands' as const;

describe('Tree-to-commands tool SEO', () => {
  it.each([...locales])('%s has its own title, description and copy', (locale) => {
    const meta = getToolMetadata(SLUG, locale);
    expect(meta.path).toBe(`/${locale}/tools/tree-to-commands`);
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

- [ ] **Step 7: Run the SEO test**

Run: `npm test -- tests/seo/tree-to-commands-seo.test.ts`
Expected: PASS (15 tests: 8 locales for the first `it.each` block, 7 for the second which excludes `'en'`). `getToolMetadata`/`getToolContent` only depend on `seo-config.ts`/`tool-seo-content.ts` added in this task, not on the i18n keys from Task 6, so it already passes at this point.

- [ ] **Step 8: Commit**

```bash
git add "src/app/[locale]/tools/tree-to-commands" src/lib/tools.ts src/components/home/tools-showcase.tsx src/lib/seo-config.ts src/lib/tool-seo-content.ts tests/seo/tree-to-commands-seo.test.ts
git commit -m "feat(tree-commands): register route, nav entry, homepage showcase and SEO content"
```

---

### Task 6: i18n — 8 locales

**Files:**
- Modify: `src/i18n/locales/fr.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/de.json`
- Modify: `src/i18n/locales/it.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/ru.json`
- Modify: `src/i18n/locales/ja.json`
- Test: `tests/i18n/tree-commands-locales.test.ts`

**Interfaces:**
- Consumes: nothing (leaf task).
- Produces: `nav.treeToCommands`, `home.tools.treeToCommands.desc` and the `treeCommandsGenerator.*` namespace consumed by every component created in Task 4.

For **each** of the 8 locale files, make these three edits:

1. Inside the `"nav"` object, add a new key right after `"separators"`.
2. Inside the `"home"."tools"` object, add a new key right after `"separators"`.
3. At the top level of the file, add a new `"treeCommandsGenerator"` object right after the existing `"separatorGenerator"` object closes.

- [ ] **Step 1: `fr.json`**

In `"nav"`, after `"separators": "Séparateurs & Badges",`:
```json
"treeToCommands": "Arbre ↔ Commandes",
```
In `"home"."tools"`, after the `"separators"` block:
```json
"treeToCommands": {
  "desc": "Convertissez un arbre ASCII en commandes mkdir/touch prêtes à exécuter, et inversement recréez un arbre depuis des commandes shell."
}
```
New top-level block, after `"separatorGenerator": { ... }`:
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Arbre → Commandes",
    "commandsToTree": "Commandes → Arbre"
  },
  "input": {
    "title": "Entrée",
    "clear": "Effacer",
    "placeholderTree": "Collez un arbre ASCII (unicode ou ascii)…",
    "placeholderCommands": "Collez des commandes mkdir -p / touch, une par ligne…"
  },
  "preview": {
    "title": "Résultat",
    "copy": "Copier",
    "download": "Télécharger",
    "placeholder": "Le résultat apparaîtra ici.",
    "securityNotice": "Les commandes ne sont pas exécutées automatiquement : relisez-les avant de les coller dans un terminal. Les noms avec espaces ou caractères spéciaux ne sont pas échappés."
  },
  "warnings": {
    "dangerousPath": "Chemin potentiellement dangereux détecté : {path} — vérifiez cette commande avant de l'exécuter."
  },
  "errors": {
    "unrecognizedLine": "Ligne ignorée (format non reconnu) : {line}",
    "copySuccess": "Copié dans le presse-papiers !",
    "copyError": "Échec de la copie.",
    "downloadError": "Échec du téléchargement."
  },
  "options": {
    "title": "Options",
    "connectorStyle": "Style de connecteur",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 2: `en.json`** (same three insertion points)

```json
"treeToCommands": "Tree ↔ Commands",
```
```json
"treeToCommands": {
  "desc": "Convert an ASCII tree into ready-to-run mkdir/touch commands, and rebuild a tree from shell commands."
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Tree → Commands",
    "commandsToTree": "Commands → Tree"
  },
  "input": {
    "title": "Input",
    "clear": "Clear",
    "placeholderTree": "Paste an ASCII tree (unicode or ascii)…",
    "placeholderCommands": "Paste mkdir -p / touch commands, one per line…"
  },
  "preview": {
    "title": "Result",
    "copy": "Copy",
    "download": "Download",
    "placeholder": "The result will appear here.",
    "securityNotice": "Commands are not executed automatically: review them before pasting into a terminal. Names with spaces or special characters are not escaped."
  },
  "warnings": {
    "dangerousPath": "Potentially dangerous path detected: {path} — review this command before running it."
  },
  "errors": {
    "unrecognizedLine": "Line ignored (unrecognized format): {line}",
    "copySuccess": "Copied to clipboard!",
    "copyError": "Copy failed.",
    "downloadError": "Download failed."
  },
  "options": {
    "title": "Options",
    "connectorStyle": "Connector style",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 3: `es.json`**

```json
"treeToCommands": "Árbol ↔ Comandos",
```
```json
"treeToCommands": {
  "desc": "Convierte un árbol ASCII en comandos mkdir/touch listos para ejecutar, y reconstruye un árbol a partir de comandos de shell."
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Árbol → Comandos",
    "commandsToTree": "Comandos → Árbol"
  },
  "input": {
    "title": "Entrada",
    "clear": "Borrar",
    "placeholderTree": "Pega un árbol ASCII (unicode o ascii)…",
    "placeholderCommands": "Pega comandos mkdir -p / touch, uno por línea…"
  },
  "preview": {
    "title": "Resultado",
    "copy": "Copiar",
    "download": "Descargar",
    "placeholder": "El resultado aparecerá aquí.",
    "securityNotice": "Los comandos no se ejecutan automáticamente: revísalos antes de pegarlos en una terminal. Los nombres con espacios o caracteres especiales no se escapan."
  },
  "warnings": {
    "dangerousPath": "Ruta potencialmente peligrosa detectada: {path} — revisa este comando antes de ejecutarlo."
  },
  "errors": {
    "unrecognizedLine": "Línea ignorada (formato no reconocido): {line}",
    "copySuccess": "¡Copiado al portapapeles!",
    "copyError": "Error al copiar.",
    "downloadError": "Error al descargar."
  },
  "options": {
    "title": "Opciones",
    "connectorStyle": "Estilo de conector",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 4: `de.json`**

```json
"treeToCommands": "Baum ↔ Befehle",
```
```json
"treeToCommands": {
  "desc": "Wandelt einen ASCII-Baum in ausführbare mkdir/touch-Befehle um und erstellt umgekehrt einen Baum aus Shell-Befehlen."
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Baum → Befehle",
    "commandsToTree": "Befehle → Baum"
  },
  "input": {
    "title": "Eingabe",
    "clear": "Leeren",
    "placeholderTree": "ASCII-Baum einfügen (unicode oder ascii)…",
    "placeholderCommands": "mkdir -p / touch-Befehle einfügen, einer pro Zeile…"
  },
  "preview": {
    "title": "Ergebnis",
    "copy": "Kopieren",
    "download": "Herunterladen",
    "placeholder": "Das Ergebnis erscheint hier.",
    "securityNotice": "Befehle werden nicht automatisch ausgeführt: prüfen Sie sie vor dem Einfügen in ein Terminal. Namen mit Leerzeichen oder Sonderzeichen werden nicht escaped."
  },
  "warnings": {
    "dangerousPath": "Potenziell gefährlicher Pfad erkannt: {path} — prüfen Sie diesen Befehl vor der Ausführung."
  },
  "errors": {
    "unrecognizedLine": "Zeile ignoriert (unbekanntes Format): {line}",
    "copySuccess": "In die Zwischenablage kopiert!",
    "copyError": "Kopieren fehlgeschlagen.",
    "downloadError": "Download fehlgeschlagen."
  },
  "options": {
    "title": "Optionen",
    "connectorStyle": "Verbindungsstil",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 5: `it.json`**

```json
"treeToCommands": "Albero ↔ Comandi",
```
```json
"treeToCommands": {
  "desc": "Converte un albero ASCII in comandi mkdir/touch pronti all'uso, e ricostruisce un albero a partire da comandi shell."
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Albero → Comandi",
    "commandsToTree": "Comandi → Albero"
  },
  "input": {
    "title": "Input",
    "clear": "Cancella",
    "placeholderTree": "Incolla un albero ASCII (unicode o ascii)…",
    "placeholderCommands": "Incolla comandi mkdir -p / touch, uno per riga…"
  },
  "preview": {
    "title": "Risultato",
    "copy": "Copia",
    "download": "Scarica",
    "placeholder": "Il risultato apparirà qui.",
    "securityNotice": "I comandi non vengono eseguiti automaticamente: controllali prima di incollarli in un terminale. I nomi con spazi o caratteri speciali non vengono sottoposti a escape."
  },
  "warnings": {
    "dangerousPath": "Percorso potenzialmente pericoloso rilevato: {path} — controlla questo comando prima di eseguirlo."
  },
  "errors": {
    "unrecognizedLine": "Riga ignorata (formato non riconosciuto): {line}",
    "copySuccess": "Copiato negli appunti!",
    "copyError": "Copia non riuscita.",
    "downloadError": "Download non riuscito."
  },
  "options": {
    "title": "Opzioni",
    "connectorStyle": "Stile connettore",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 6: `pt.json`**

```json
"treeToCommands": "Árvore ↔ Comandos",
```
```json
"treeToCommands": {
  "desc": "Converte uma árvore ASCII em comandos mkdir/touch prontos a executar, e reconstrói uma árvore a partir de comandos de shell."
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Árvore → Comandos",
    "commandsToTree": "Comandos → Árvore"
  },
  "input": {
    "title": "Entrada",
    "clear": "Limpar",
    "placeholderTree": "Cole uma árvore ASCII (unicode ou ascii)…",
    "placeholderCommands": "Cole comandos mkdir -p / touch, um por linha…"
  },
  "preview": {
    "title": "Resultado",
    "copy": "Copiar",
    "download": "Transferir",
    "placeholder": "O resultado aparecerá aqui.",
    "securityNotice": "Os comandos não são executados automaticamente: reveja-os antes de colar num terminal. Nomes com espaços ou caracteres especiais não são escapados."
  },
  "warnings": {
    "dangerousPath": "Caminho potencialmente perigoso detetado: {path} — reveja este comando antes de o executar."
  },
  "errors": {
    "unrecognizedLine": "Linha ignorada (formato não reconhecido): {line}",
    "copySuccess": "Copiado para a área de transferência!",
    "copyError": "Falha ao copiar.",
    "downloadError": "Falha ao transferir."
  },
  "options": {
    "title": "Opções",
    "connectorStyle": "Estilo de conector",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 7: `ru.json`**

```json
"treeToCommands": "Дерево ↔ Команды",
```
```json
"treeToCommands": {
  "desc": "Преобразует ASCII-дерево в готовые команды mkdir/touch и восстанавливает дерево из команд shell."
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "Дерево → Команды",
    "commandsToTree": "Команды → Дерево"
  },
  "input": {
    "title": "Ввод",
    "clear": "Очистить",
    "placeholderTree": "Вставьте ASCII-дерево (unicode или ascii)…",
    "placeholderCommands": "Вставьте команды mkdir -p / touch, по одной на строку…"
  },
  "preview": {
    "title": "Результат",
    "copy": "Копировать",
    "download": "Скачать",
    "placeholder": "Результат появится здесь.",
    "securityNotice": "Команды не выполняются автоматически: проверьте их перед вставкой в терминал. Имена с пробелами или спецсимволами не экранируются."
  },
  "warnings": {
    "dangerousPath": "Обнаружен потенциально опасный путь: {path} — проверьте эту команду перед выполнением."
  },
  "errors": {
    "unrecognizedLine": "Строка проигнорирована (формат не распознан): {line}",
    "copySuccess": "Скопировано в буфер обмена!",
    "copyError": "Не удалось скопировать.",
    "downloadError": "Не удалось скачать."
  },
  "options": {
    "title": "Настройки",
    "connectorStyle": "Стиль соединителя",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 8: `ja.json`**

```json
"treeToCommands": "ツリー ⇄ コマンド",
```
```json
"treeToCommands": {
  "desc": "ASCIIツリーを実行可能なmkdir/touchコマンドに変換し、逆にシェルコマンドからツリーを再構築します。"
}
```
```json
"treeCommandsGenerator": {
  "modes": {
    "treeToCommands": "ツリー → コマンド",
    "commandsToTree": "コマンド → ツリー"
  },
  "input": {
    "title": "入力",
    "clear": "クリア",
    "placeholderTree": "ASCIIツリーを貼り付け（unicodeまたはascii）…",
    "placeholderCommands": "mkdir -p / touch コマンドを1行ずつ貼り付け…"
  },
  "preview": {
    "title": "結果",
    "copy": "コピー",
    "download": "ダウンロード",
    "placeholder": "結果はここに表示されます。",
    "securityNotice": "コマンドは自動実行されません。ターミナルに貼り付ける前に内容を確認してください。スペースや特殊文字を含む名前はエスケープされません。"
  },
  "warnings": {
    "dangerousPath": "危険な可能性のあるパスを検出しました：{path} — 実行前にこのコマンドを確認してください。"
  },
  "errors": {
    "unrecognizedLine": "認識できない形式のため行を無視しました：{line}",
    "copySuccess": "クリップボードにコピーしました！",
    "copyError": "コピーに失敗しました。",
    "downloadError": "ダウンロードに失敗しました。"
  },
  "options": {
    "title": "オプション",
    "connectorStyle": "コネクタースタイル",
    "styleUnicode": "Unicode (├── └──)",
    "styleAscii": "ASCII (|-- `--)"
  }
}
```

- [ ] **Step 9: Write the i18n test**

`tests/i18n/tree-commands-locales.test.ts` (mirrors `tests/i18n/separator-locales.test.ts`):
```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';

const NAV_KEY = 'treeToCommands';
const REQUIRED_KEYS = [
  'modes.treeToCommands',
  'modes.commandsToTree',
  'input.title',
  'input.clear',
  'input.placeholderTree',
  'input.placeholderCommands',
  'preview.title',
  'preview.copy',
  'preview.download',
  'preview.placeholder',
  'preview.securityNotice',
  'warnings.dangerousPath',
  'errors.unrecognizedLine',
  'errors.copySuccess',
  'errors.copyError',
  'errors.downloadError',
  'options.title',
  'options.connectorStyle',
  'options.styleUnicode',
  'options.styleAscii',
] as const;

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('tree-commands generator translations', () => {
  it.each(locales)('%s has a non-empty nav.treeToCommands label', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    expect(typeof messages.nav[NAV_KEY]).toBe('string');
    expect(messages.nav[NAV_KEY].trim().length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every treeCommandsGenerator key, non-empty', async (locale) => {
    const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
    for (const key of REQUIRED_KEYS) {
      const value = getPath(messages.treeCommandsGenerator, key);
      expect(typeof value).toBe('string');
      expect((value as string).trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 10: Run the i18n test and validate every JSON file parses**

Run: `npm test -- tests/i18n/tree-commands-locales.test.ts`
Expected: PASS (16 tests: 8 locales × 2 `it.each` blocks). A JSON syntax error in any locale file surfaces here as an import failure — fix the offending file's trailing commas/brackets if so.

- [ ] **Step 11: Commit**

```bash
git add src/i18n/locales tests/i18n/tree-commands-locales.test.ts
git commit -m "feat(tree-commands): add i18n keys for all 8 locales"
```

---

### Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — every existing test plus all new ones added across Tasks 1, 2, 3, 5 and 6 (5 + 10 + 7 pure-logic tests, 15 SEO tests, 16 i18n tests).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors in any new/modified file.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, open `http://localhost:3000/en/tools/tree-to-commands` (and `/fr/...` to sanity-check French copy), then:
- Mode A: paste
  ```
  ├── src
  │   └── index.ts
  └── README.md
  ```
  into the input and confirm the output is:
  ```
  mkdir -p src
  touch src/index.ts
  touch README.md
  ```
  and that the permanent security notice is visible below the output.
- Mode A: paste a line containing `├── ..` and confirm the amber warning appears with the `{path}` interpolated correctly.
- Switch to Mode B, paste `mkdir -p src\ntouch src/index.ts\ntouch README.md`, confirm the rendered tree matches the unicode tree above, and confirm the right sidebar shows the connector-style option; switch it to ASCII and confirm the tree re-renders with `|--`/`` `-- ``.
- Confirm the new card appears on the homepage (`http://localhost:3000/en`) in the tools showcase grid, and that the nav/sidebar lists "Tree ↔ Commands" (or the locale equivalent) as a tool link.

- [ ] **Step 5: Commit if any lint/manual-check fixes were needed**

```bash
git add -A
git commit -m "fix(tree-commands): address lint/manual verification findings"
```

(Skip this step if nothing needed fixing.)
