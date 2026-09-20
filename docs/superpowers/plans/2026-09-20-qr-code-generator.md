# QR Code ASCII Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 6th tool, `/tools/qr-code-generator`, that renders scannable QR codes as text (Unicode half-blocks, Unicode full blocks, or pure 7-bit ASCII), with PNG export, in 8 languages.

**Architecture:** A pure, framework-free core in `src/lib/qr-*.ts` (payload templates → module matrix via `uqr` → text renderers → PNG raster) that is fully unit-tested, including a real decode round-trip with `jsqr`. A thin React layer in `src/components/qr-generator/` follows the sparkline tool's pattern (state container + input card + preview card + options panel in the right sidebar). Integration touches the same registries every other tool touches.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, next-intl 4, Tailwind 3 + shadcn/ui, `uqr@0.1.3` (QR encoder, zero deps, runtime), `jsqr@1.4.0` + `vitest` (dev, tests).

**Spec:** No spec file exists. The spec is the design summary validated by the user in the grill-me session, reproduced in *Global Constraints* below. Where this plan refines it, the refinement is marked **[refinement]**.

## Global Constraints

- **Scan by a real phone is mandatory.** Every output the tool produces must decode back to the exact input payload (enforced by `jsqr` tests for each style × invert × ECC level).
- **Three text styles, presets only (no free characters):** `half` = Unicode half-blocks `▀ ▄ █` (default), `blocks` = Unicode full blocks `██` (2 chars per module), `ascii` = pure ASCII `##` (2 chars per module, only 7-bit characters).
- **Quiet zone = 4 modules, locked.** Never exposed as an option.
- **Error correction exposed: `L` `M` `Q` `H`, default `M`.**
- **Option "Invert" (default off):** prints the *light* modules as ink so the code reads correctly when pasted on a dark background.
- **Preview:** forced colors independent of the app theme. White background / black text when Invert is off. **[refinement]** black background / white text when Invert is on, otherwise the inverted output would be shown with the wrong polarity and could not be scanned from the screen.
- **100 % client-side.** No network call with the user's content.
- **Content:** free text mode + 7 templates: URL, Text, Wi-Fi, Email, Phone, SMS, vCard (simple: first name, last name, company, phone, email). Limit **300 characters on the final encoded string**, counted in characters (code points, `Array.from(s).length`), not bytes. Above the limit: show an error, generate nothing (never truncate). 300 code points × 4 bytes = 1 200 bytes ≤ 1 273 (capacity of version 40, level H, byte mode), so the encoder can never overflow.
- **Live generation** with a light debounce (150 ms). Counter displayed as `n/300`.
- **Outputs:** copy text, copy as Markdown code block, download `.txt`, download PNG. **PNG = true raster drawn from the module matrix** (never a screenshot of the text), fixed target size 1 024 px snapped down to an integer multiple of the module count, always dark on white regardless of Invert. Filename `qr-code.txt` / `qr-code.png`.
- **Note under the preview:** "paste in a monospace font".
- **Accessibility:** the preview `<pre>` has `role="img"` and an `aria-label`.
- **Route / slug:** `/tools/qr-code-generator`; `TOOLS_SEO` key `qr-code-generator`; nav key `qrCode`; i18n namespace `qrGenerator`.
- **i18n:** all 8 locales (`fr en es de it pt ru ja`) from day one. Never hardcode user-facing strings; use `useTranslations()`.
- **Project rules (CLAUDE.md):** path alias `@/*` → `src/*`; changelog must be updated in `CHANGELOG.md` **and** `src/lib/changelog.ts` (`APP_VERSION`) **and** `package.json`; changelog UI is French-only. This feature bumps `2.1.0` → `2.2.0`, dated `2026-09-20`.
- **Commits:** conventional style (`feat:`, `test:`, `chore:`); every commit message ends with the trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- **Verified facts about the libraries (probed on 2026-09-20, do not re-derive):**
  - `uqr`: `import { encode } from 'uqr'`. `encode(text, { ecc: 'L'|'M'|'Q'|'H', border: 0 })` returns an **object** `{ version, size, maskPattern, data: boolean[][] }`, **not** a matrix. Use `.data`. `ecc` takes the single letter (`'MEDIUM'` throws). `true` = dark module. UTF-8 (accents, emoji, CJK) round-trips correctly.
  - `jsqr`: `jsQR(rgbaData, width, height)` requires `data.length === width * height * 4`, returns `{ data: string } | null`.
  - A 300-character accented string at level H is 125×125 modules → 133 columns×2 = **266 characters wide** in `ascii`/`blocks` mode. This is expected; the preview scrolls horizontally.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `vitest.config.ts` | create | Vitest config with the `@` alias |
| `package.json` | modify | `test` script, deps, version `2.2.0` |
| `tests/qr/uqr-contract.test.ts` | create | Pins the `uqr` / `jsqr` API assumptions |
| `tests/qr/helpers.ts` | create | Parse rendered text back to a grid, decode with jsqr |
| `tests/qr/templates.test.ts` | create | Payload builder tests |
| `tests/qr/generator.test.ts` | create | Matrix, renderers, scan round-trips |
| `tests/qr/png.test.ts` | create | PNG layout + raster scan |
| `tests/i18n/qr-locales.test.ts` | create | Key parity across the 8 locale files |
| `tests/seo/qr-seo.test.ts` | create | SEO metadata/content exist in all 8 locales |
| `src/lib/qr-types.ts` | create | Types and constants (`QR_MAX_LENGTH`, `QR_QUIET_ZONE`) |
| `src/lib/qr-templates.ts` | create | `buildPayload`, `countChars`, `DEFAULT_FIELDS` |
| `src/lib/qr-generator.ts` | create | `generateMatrix`, `toInkGrid`, `renderQr`, `toMarkdown` |
| `src/lib/qr-png.ts` | create | `computePngLayout`, `matrixToRgba`, `renderPngBlob` |
| `src/hooks/use-debounced-value.ts` | create | Generic debounce hook |
| `src/components/qr-generator/qr-generator.tsx` | create | State container |
| `src/components/qr-generator/qr-input.tsx` | create | Template select + fields + counter |
| `src/components/qr-generator/qr-preview.tsx` | create | Preview + 4 export buttons |
| `src/components/qr-generator/qr-options-panel.tsx` | create | Style / ECC / Invert (right sidebar) |
| `src/app/[locale]/tools/qr-code-generator/page.tsx` | create | Route |
| `src/components/icons.tsx` | modify | Export `QrCode` icon |
| `src/lib/tools.ts` | modify | Register the tool in the nav |
| `src/lib/seo-config.ts` | modify | `TOOLS_SEO['qr-code-generator']` |
| `src/lib/tool-seo-content.ts` | modify | SEO copy + FAQ ×8 locales |
| `src/app/sitemap.ts` | modify | Add the route |
| `src/components/home/tools-showcase.tsx` | modify | Home card |
| `src/i18n/locales/*.json` (×8) | modify | `qrGenerator`, `nav.qrCode`, `home.tools.qrCode.desc` |
| `CHANGELOG.md`, `src/lib/changelog.ts` | modify | 2.2.0 entry |

Boundaries: `src/lib/qr-*.ts` never imports React or the DOM at module top level (only `renderPngBlob` touches the DOM, inside its body). Components never contain QR logic.

---

### Task 1: Test tooling and dependency contract

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Test: `tests/qr/uqr-contract.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` (runs `vitest run`, includes `tests/**/*.test.ts`), alias `@` → `src`, deps `uqr` (runtime), `jsqr` + `vitest` (dev).

- [ ] **Step 0: Create the feature branch**

```bash
git switch -c feat/qr-code-generator
```

- [ ] **Step 1: Install dependencies**

```bash
npm install uqr
npm install -D vitest jsqr
```

Expected: `package.json` gains `uqr` under `dependencies`, `vitest` and `jsqr` under `devDependencies`. `postinstall` (`patch-package`) runs without error.

- [ ] **Step 2: Add the `test` script**

In `package.json`, inside `"scripts"`, add after `"lint": "eslint",`:

```json
    "test": "vitest run",
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Write the contract test**

Create `tests/qr/uqr-contract.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { encode } from 'uqr';
import jsQR from 'jsqr';

describe('uqr / jsqr contract', () => {
  it('encode() returns an object whose .data is a square boolean matrix', () => {
    const qr = encode('hello', { ecc: 'M', border: 0 });
    expect(qr.size).toBe(21);
    expect(qr.data).toHaveLength(21);
    expect(qr.data[0]).toHaveLength(21);
    expect(typeof qr.data[0][0]).toBe('boolean');
  });

  it('jsQR is callable and rejects a buffer of the wrong length', () => {
    expect(() => jsQR(new Uint8ClampedArray(3), 10, 10)).toThrow();
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/qr/uqr-contract.test.ts
git commit -m "chore: add vitest, jsqr and uqr for the QR code tool" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Types and payload templates

**Files:**
- Create: `src/lib/qr-types.ts`
- Create: `src/lib/qr-templates.ts`
- Test: `tests/qr/templates.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (exact):
  - `qr-types.ts`:
    ```ts
    export type QrTemplate = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard';
    export type QrEcc = 'L' | 'M' | 'Q' | 'H';
    export type QrStyle = 'half' | 'blocks' | 'ascii';
    export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';
    export interface QrFields { text: string; url: string; ssid: string; password: string; security: WifiSecurity; hidden: boolean; emailTo: string; emailSubject: string; emailBody: string; phone: string; smsNumber: string; smsMessage: string; firstName: string; lastName: string; org: string; vcardPhone: string; vcardEmail: string; }
    export type QrTextFieldKey = Exclude<keyof QrFields, 'security' | 'hidden'>;
    export interface QrOptions { style: QrStyle; ecc: QrEcc; invert: boolean; }
    export const QR_MAX_LENGTH = 300;
    export const QR_QUIET_ZONE = 4;
    ```
  - `qr-templates.ts`: `countChars(s: string): number`, `buildPayload(template: QrTemplate, fields: QrFields): string` (returns `''` when required fields are empty), `DEFAULT_FIELDS: QrFields`.

- [ ] **Step 1: Create `src/lib/qr-types.ts`**

```ts
export type QrTemplate = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard';
export type QrEcc = 'L' | 'M' | 'Q' | 'H';
export type QrStyle = 'half' | 'blocks' | 'ascii';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

export interface QrFields {
  text: string;
  url: string;
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  smsNumber: string;
  smsMessage: string;
  firstName: string;
  lastName: string;
  org: string;
  vcardPhone: string;
  vcardEmail: string;
}

/** Keys of QrFields that hold free text (everything except the select and the switch). */
export type QrTextFieldKey = Exclude<keyof QrFields, 'security' | 'hidden'>;

export interface QrOptions {
  style: QrStyle;
  ecc: QrEcc;
  invert: boolean;
}

/** Maximum length of the final encoded string, in characters (code points). */
export const QR_MAX_LENGTH = 300;

/** Width of the blank margin required around a QR code, in modules. Not user-configurable. */
export const QR_QUIET_ZONE = 4;
```

- [ ] **Step 2: Write the failing tests**

Create `tests/qr/templates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildPayload, countChars, DEFAULT_FIELDS } from '@/lib/qr-templates';
import type { QrFields } from '@/lib/qr-types';

const f = (over: Partial<QrFields>): QrFields => ({ ...DEFAULT_FIELDS, ...over });

describe('countChars', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(countChars('a😀é')).toBe(3);
    expect(countChars('')).toBe(0);
  });
});

describe('buildPayload', () => {
  it('text: returns the text as typed, empty when blank', () => {
    expect(buildPayload('text', f({ text: 'hello' }))).toBe('hello');
    expect(buildPayload('text', f({ text: '   ' }))).toBe('');
  });

  it('url: trims, empty when blank', () => {
    expect(buildPayload('url', f({ url: '  https://asciitree.fr  ' }))).toBe('https://asciitree.fr');
    expect(buildPayload('url', f({ url: '' }))).toBe('');
  });

  it('wifi: escapes \\ ; , : " in ssid and password', () => {
    expect(buildPayload('wifi', f({ ssid: 'My;Net', password: 'p:a"ss', security: 'WPA' }))).toBe(
      'WIFI:T:WPA;S:My\\;Net;P:p\\:a\\"ss;;'
    );
  });

  it('wifi: hidden flag, open network ignores the password, empty ssid gives empty payload', () => {
    expect(buildPayload('wifi', f({ ssid: 'Net', password: 'pw', security: 'WPA', hidden: true }))).toBe(
      'WIFI:T:WPA;S:Net;P:pw;H:true;;'
    );
    expect(buildPayload('wifi', f({ ssid: 'Open', password: 'ignored', security: 'nopass' }))).toBe(
      'WIFI:T:nopass;S:Open;;'
    );
    expect(buildPayload('wifi', f({ ssid: '' }))).toBe('');
  });

  it('email: mailto with URL-encoded subject and body', () => {
    expect(buildPayload('email', f({ emailTo: 'a@b.fr' }))).toBe('mailto:a@b.fr');
    expect(buildPayload('email', f({ emailTo: 'a@b.fr', emailSubject: 'Hi there', emailBody: 'a&b' }))).toBe(
      'mailto:a@b.fr?subject=Hi%20there&body=a%26b'
    );
    expect(buildPayload('email', f({ emailTo: '' }))).toBe('');
  });

  it('phone: keeps digits and +, drops everything else', () => {
    expect(buildPayload('phone', f({ phone: '+33 6 12-34.56.78' }))).toBe('tel:+33612345678');
    expect(buildPayload('phone', f({ phone: 'abc' }))).toBe('');
  });

  it('sms: SMSTO with cleaned number and message', () => {
    expect(buildPayload('sms', f({ smsNumber: '06 12 34 56 78', smsMessage: 'Salut' }))).toBe(
      'SMSTO:0612345678:Salut'
    );
    expect(buildPayload('sms', f({ smsNumber: '' }))).toBe('');
  });

  it('vcard: builds a 3.0 card, escapes ; , \\ and skips empty lines', () => {
    expect(
      buildPayload(
        'vcard',
        f({ firstName: 'Ada', lastName: 'Lovelace', org: 'Analytical; Co', vcardPhone: '+44 1', vcardEmail: 'ada@x.org' })
      )
    ).toBe(
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Lovelace;Ada;;;',
        'FN:Ada Lovelace',
        'ORG:Analytical\\; Co',
        'TEL:+44 1',
        'EMAIL:ada@x.org',
        'END:VCARD',
      ].join('\n')
    );
    expect(buildPayload('vcard', f({ firstName: 'Ada' }))).toBe(
      ['BEGIN:VCARD', 'VERSION:3.0', 'N:;Ada;;;', 'FN:Ada', 'END:VCARD'].join('\n')
    );
    expect(buildPayload('vcard', f({}))).toBe('');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/qr/templates.test.ts`
Expected: FAIL — cannot resolve `@/lib/qr-templates`.

- [ ] **Step 4: Implement `src/lib/qr-templates.ts`**

```ts
import type { QrFields, QrTemplate } from './qr-types';

export const DEFAULT_FIELDS: QrFields = {
  text: '',
  url: '',
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false,
  emailTo: '',
  emailSubject: '',
  emailBody: '',
  phone: '',
  smsNumber: '',
  smsMessage: '',
  firstName: '',
  lastName: '',
  org: '',
  vcardPhone: '',
  vcardEmail: '',
};

/** Length in characters (code points), so an emoji counts as one. */
export function countChars(s: string): number {
  return Array.from(s).length;
}

const escapeWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
const escapeVcard = (s: string) => s.replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n');
const cleanNumber = (s: string) => s.replace(/[^\d+]/g, '');

/**
 * Builds the exact string that gets encoded in the QR code.
 * Returns '' while the required fields of the template are still empty.
 */
export function buildPayload(template: QrTemplate, f: QrFields): string {
  switch (template) {
    case 'text':
      return f.text.trim() === '' ? '' : f.text;

    case 'url':
      return f.url.trim();

    case 'wifi': {
      if (!f.ssid) return '';
      const parts = [`T:${f.security}`, `S:${escapeWifi(f.ssid)}`];
      if (f.security !== 'nopass' && f.password) parts.push(`P:${escapeWifi(f.password)}`);
      if (f.hidden) parts.push('H:true');
      return `WIFI:${parts.join(';')};;`;
    }

    case 'email': {
      const to = f.emailTo.trim();
      if (!to) return '';
      const params: string[] = [];
      if (f.emailSubject) params.push(`subject=${encodeURIComponent(f.emailSubject)}`);
      if (f.emailBody) params.push(`body=${encodeURIComponent(f.emailBody)}`);
      return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
    }

    case 'phone': {
      const number = cleanNumber(f.phone);
      return number ? `tel:${number}` : '';
    }

    case 'sms': {
      const number = cleanNumber(f.smsNumber);
      return number ? `SMSTO:${number}:${f.smsMessage}` : '';
    }

    case 'vcard': {
      const first = f.firstName.trim();
      const last = f.lastName.trim();
      if (!first && !last) return '';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVcard(last)};${escapeVcard(first)};;;`,
        `FN:${escapeVcard([first, last].filter(Boolean).join(' '))}`,
      ];
      if (f.org.trim()) lines.push(`ORG:${escapeVcard(f.org.trim())}`);
      if (f.vcardPhone.trim()) lines.push(`TEL:${escapeVcard(f.vcardPhone.trim())}`);
      if (f.vcardEmail.trim()) lines.push(`EMAIL:${escapeVcard(f.vcardEmail.trim())}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/qr/templates.test.ts`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/qr-types.ts src/lib/qr-templates.ts tests/qr/templates.test.ts
git commit -m "feat(qr): add payload templates (text, url, wifi, email, phone, sms, vcard)" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Matrix generation and text renderers (scan-verified)

**Files:**
- Create: `src/lib/qr-generator.ts`
- Create: `tests/qr/helpers.ts`
- Test: `tests/qr/generator.test.ts`

**Interfaces:**
- Consumes: `QrEcc`, `QrStyle`, `QR_QUIET_ZONE` from `@/lib/qr-types`; `encode` from `uqr`.
- Produces (exact):
  - `generateMatrix(text: string, ecc: QrEcc): boolean[][]` — module matrix, no border, `[]` for empty text. `true` = dark. Caller guarantees `countChars(text) <= QR_MAX_LENGTH`.
  - `toInkGrid(matrix: boolean[][], invert: boolean): boolean[][]` — matrix + 4-module quiet zone, where `true` = "a glyph is printed here". With `invert`, ink = light module.
  - `renderQr(matrix: boolean[][], style: QrStyle, invert: boolean): string` — lines joined by `\n`, `''` for an empty matrix.
  - `toMarkdown(text: string): string` — ```` ```text\n…\n``` ````.
- Test helpers (`tests/qr/helpers.ts`): `parseRendered(text, style): boolean[][]` (ink grid, all rows), `decodeInk(ink, invert, scale?): string | null`.

- [ ] **Step 1: Create the test helpers**

Create `tests/qr/helpers.ts`:

```ts
import jsQR from 'jsqr';
import type { QrStyle } from '@/lib/qr-types';

const GLYPH: Record<'blocks' | 'ascii', string> = { blocks: '██', ascii: '##' };

/** Reads rendered text back into an "ink" grid (true = a glyph is printed). Returns every row. */
export function parseRendered(text: string, style: QrStyle): boolean[][] {
  const lines = text.split('\n');

  if (style === 'half') {
    const rows: boolean[][] = [];
    for (const line of lines) {
      const top: boolean[] = [];
      const bottom: boolean[] = [];
      for (const ch of line) {
        if (!' ▀▄█'.includes(ch)) throw new Error(`Unexpected character "${ch}" in half-block output`);
        top.push(ch === '█' || ch === '▀');
        bottom.push(ch === '█' || ch === '▄');
      }
      rows.push(top, bottom);
    }
    return rows;
  }

  const glyph = GLYPH[style];
  return lines.map((line) => {
    const row: boolean[] = [];
    for (let i = 0; i < line.length; i += 2) {
      const cell = line.slice(i, i + 2);
      if (cell !== '  ' && cell !== glyph) throw new Error(`Unexpected cell "${cell}" in ${style} output`);
      row.push(cell !== '  ');
    }
    return row;
  });
}

/**
 * Turns an ink grid into pixels the way a phone would see it (dark modules black on light),
 * then decodes it with jsQR. `invert` says whether ink means "light module".
 * The grid must include the quiet zone. Only the first `width` rows are used (half-block
 * output can carry one extra padding row).
 */
export function decodeInk(ink: boolean[][], invert: boolean, scale = 4): string | null {
  const size = ink[0].length;
  const grid = ink.slice(0, size);
  const width = size * scale;
  const data = new Uint8ClampedArray(width * width * 4).fill(255);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dark = invert ? !grid[r][c] : grid[r][c];
      if (!dark) continue;
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          const i = ((r * scale + y) * width + (c * scale + x)) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
  }

  const result = jsQR(data, width, width);
  return result ? result.data : null;
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/qr/generator.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateMatrix, toInkGrid, renderQr, toMarkdown } from '@/lib/qr-generator';
import { QR_QUIET_ZONE, type QrEcc, type QrStyle } from '@/lib/qr-types';
import { parseRendered, decodeInk } from './helpers';

const STYLES: QrStyle[] = ['half', 'blocks', 'ascii'];
const ECCS: QrEcc[] = ['L', 'M', 'Q', 'H'];
const PAYLOADS: Record<string, string> = {
  url: 'https://asciitree.fr',
  unicode: 'héllo 😀 日本語',
  wifi: 'WIFI:T:WPA;S:My\\;Net;P:p\\:a\\"ss;;',
  max300: 'é'.repeat(300),
};

describe('generateMatrix', () => {
  it('returns [] for empty text', () => {
    expect(generateMatrix('', 'M')).toEqual([]);
  });

  it('returns a square matrix of module booleans', () => {
    const m = generateMatrix('hello', 'M');
    expect(m).toHaveLength(21);
    expect(m.every((row) => row.length === 21)).toBe(true);
  });

  it('a higher error-correction level needs a bigger code for the same text', () => {
    const text = 'x'.repeat(100);
    expect(generateMatrix(text, 'H').length).toBeGreaterThan(generateMatrix(text, 'L').length);
  });

  it('never overflows at the 300-character limit, even with 4-byte characters at level H', () => {
    const text = '😀'.repeat(300);
    const m = generateMatrix(text, 'H');
    expect(decodeInk(toInkGrid(m, false), false)).toBe(text);
  });
});

describe('toInkGrid', () => {
  const m = generateMatrix('hello', 'M');

  it('adds a 4-module quiet zone of light modules', () => {
    const grid = toInkGrid(m, false);
    expect(grid).toHaveLength(m.length + 2 * QR_QUIET_ZONE);
    expect(grid[0].every((v) => v === false)).toBe(true);
    expect(grid[QR_QUIET_ZONE + 3][QR_QUIET_ZONE + 3]).toBe(m[3][3]);
  });

  it('with invert, the ink is the light modules (quiet zone included)', () => {
    const grid = toInkGrid(m, true);
    expect(grid[0].every((v) => v === true)).toBe(true);
    expect(grid[QR_QUIET_ZONE + 3][QR_QUIET_ZONE + 3]).toBe(!m[3][3]);
  });
});

describe('renderQr shape', () => {
  const m = generateMatrix('hello', 'M');
  const size = m.length + 2 * QR_QUIET_ZONE; // 29

  it('returns "" for an empty matrix', () => {
    expect(renderQr([], 'half', false)).toBe('');
  });

  it('blocks: one line per module row, two characters per module', () => {
    const lines = renderQr(m, 'blocks', false).split('\n');
    expect(lines).toHaveLength(size);
    expect(lines.every((l) => l.length === size * 2)).toBe(true);
  });

  it('ascii: only 7-bit characters, two per module', () => {
    const out = renderQr(m, 'ascii', false);
    expect(out).toMatch(/^[ #\n]+$/);
    expect(out.split('\n').every((l) => l.length === size * 2)).toBe(true);
  });

  it('half: two module rows per line, only " ▀▄█"', () => {
    const out = renderQr(m, 'half', false);
    expect(out).toMatch(/^[ ▀▄█\n]+$/);
    const lines = out.split('\n');
    expect(lines).toHaveLength(Math.ceil(size / 2));
    expect(lines.every((l) => l.length === size)).toBe(true);
  });

  it.each([false, true])('half: the padding row of an odd size is background (invert=%s)', (invert) => {
    const rows = parseRendered(renderQr(m, 'half', invert), 'half');
    expect(rows).toHaveLength(size + 1);
    expect(rows[size].every((v) => v === invert)).toBe(true);
  });
});

describe('scan round-trip: rendered text decodes to the original payload', () => {
  const cases = STYLES.flatMap((style) =>
    [false, true].flatMap((invert) =>
      ECCS.flatMap((ecc) =>
        Object.entries(PAYLOADS).map(([name, payload]) => ({ style, invert, ecc, name, payload }))
      )
    )
  );

  it.each(cases)('$style invert=$invert ecc=$ecc $name', ({ style, invert, ecc, payload }) => {
    const text = renderQr(generateMatrix(payload, ecc), style, invert);
    expect(decodeInk(parseRendered(text, style), invert)).toBe(payload);
  });
});

describe('toMarkdown', () => {
  it('wraps the text in a fenced code block', () => {
    expect(toMarkdown('▀▄')).toBe('```text\n▀▄\n```');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/qr/generator.test.ts`
Expected: FAIL — cannot resolve `@/lib/qr-generator`.

- [ ] **Step 4: Implement `src/lib/qr-generator.ts`**

```ts
import { encode } from 'uqr';
import { QR_QUIET_ZONE, type QrEcc, type QrStyle } from './qr-types';

/**
 * Encodes `text` and returns the raw module matrix (true = dark), without any border.
 * The caller must keep `text` within QR_MAX_LENGTH characters; that bound guarantees the
 * data fits in a version-40 code at every error-correction level.
 */
export function generateMatrix(text: string, ecc: QrEcc): boolean[][] {
  if (!text) return [];
  return encode(text, { ecc, border: 0 }).data;
}

/**
 * Adds the quiet zone and converts modules into "ink" (true = a glyph is printed).
 * Normally ink = dark module. With `invert` (dark terminals print light text on a dark
 * background) ink = light module, quiet zone included, so the result keeps the right polarity.
 */
export function toInkGrid(matrix: boolean[][], invert: boolean): boolean[][] {
  const size = matrix.length + 2 * QR_QUIET_ZONE;
  const grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(invert));
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix.length; c++) {
      grid[r + QR_QUIET_ZONE][c + QR_QUIET_ZONE] = invert ? !matrix[r][c] : matrix[r][c];
    }
  }
  return grid;
}

/** Renders the matrix as text. `half` packs two module rows per line; the others use two characters per module. */
export function renderQr(matrix: boolean[][], style: QrStyle, invert: boolean): string {
  if (!matrix.length) return '';
  const grid = toInkGrid(matrix, invert);
  const size = grid.length;
  const lines: string[] = [];

  if (style === 'half') {
    for (let r = 0; r < size; r += 2) {
      let line = '';
      for (let c = 0; c < size; c++) {
        const top = grid[r][c];
        // Odd size: the last line has no bottom row; pad it with a background (light) module.
        const bottom = r + 1 < size ? grid[r + 1][c] : invert;
        line += top ? (bottom ? '█' : '▀') : bottom ? '▄' : ' ';
      }
      lines.push(line);
    }
  } else {
    const ink = style === 'ascii' ? '##' : '██';
    for (const row of grid) lines.push(row.map((v) => (v ? ink : '  ')).join(''));
  }

  return lines.join('\n');
}

export function toMarkdown(text: string): string {
  return `\`\`\`text\n${text}\n\`\`\``;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/qr/generator.test.ts`
Expected: all PASS (the round-trip block runs 3 × 2 × 4 × 4 = 96 decodes; expect a few seconds).

- [ ] **Step 6: Commit**

```bash
git add src/lib/qr-generator.ts tests/qr/helpers.ts tests/qr/generator.test.ts
git commit -m "feat(qr): add matrix generation and text renderers, verified by a jsqr decode" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: PNG raster export

**Files:**
- Create: `src/lib/qr-png.ts`
- Test: `tests/qr/png.test.ts`

**Interfaces:**
- Consumes: `QR_QUIET_ZONE` from `@/lib/qr-types`; `generateMatrix` from `@/lib/qr-generator` (tests only).
- Produces (exact):
  - `PNG_TARGET_SIZE = 1024`
  - `computePngLayout(matrixSize: number): { moduleSize: number; modules: number; size: number }` — `modules = matrixSize + 8`, `moduleSize = max(1, floor(1024 / modules))`, `size = modules * moduleSize`.
  - `matrixToRgba(matrix: boolean[][]): { data: Uint8ClampedArray<ArrayBuffer>; width: number; height: number }` — dark modules black, everything else opaque white, quiet zone included.
  - `renderPngBlob(matrix: boolean[][]): Promise<Blob>` — DOM only (canvas); rejects on failure.

- [ ] **Step 1: Write the failing tests**

Create `tests/qr/png.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import jsQR from 'jsqr';
import { generateMatrix } from '@/lib/qr-generator';
import { computePngLayout, matrixToRgba, PNG_TARGET_SIZE } from '@/lib/qr-png';

describe('computePngLayout', () => {
  it('snaps the size down to an integer multiple of the module count', () => {
    expect(computePngLayout(21)).toEqual({ moduleSize: 35, modules: 29, size: 1015 });
    expect(computePngLayout(125)).toEqual({ moduleSize: 7, modules: 133, size: 931 });
  });

  it('never exceeds the target and is always a whole number of modules, for every QR version', () => {
    for (let version = 1; version <= 40; version++) {
      const { moduleSize, modules, size } = computePngLayout(17 + 4 * version);
      expect(size).toBeLessThanOrEqual(PNG_TARGET_SIZE);
      expect(size % modules).toBe(0);
      expect(moduleSize).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('matrixToRgba', () => {
  it('draws an opaque white quiet zone', () => {
    const { data } = matrixToRgba(generateMatrix('hello', 'M'));
    expect(Array.from(data.slice(0, 4))).toEqual([255, 255, 255, 255]);
  });

  it.each(['https://asciitree.fr', 'héllo 😀 日本語', 'é'.repeat(300)])('decodes back to %#', (payload) => {
    const { data, width, height } = matrixToRgba(generateMatrix(payload, 'M'));
    expect(jsQR(data, width, height)?.data).toBe(payload);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/qr/png.test.ts`
Expected: FAIL — cannot resolve `@/lib/qr-png`.

- [ ] **Step 3: Implement `src/lib/qr-png.ts`**

```ts
import { QR_QUIET_ZONE } from './qr-types';

/** Target edge of the exported PNG, in pixels. The real size is snapped to a whole number of modules. */
export const PNG_TARGET_SIZE = 1024;

export function computePngLayout(matrixSize: number): { moduleSize: number; modules: number; size: number } {
  const modules = matrixSize + 2 * QR_QUIET_ZONE;
  const moduleSize = Math.max(1, Math.floor(PNG_TARGET_SIZE / modules));
  return { moduleSize, modules, size: modules * moduleSize };
}

/** Rasterizes the module matrix: black modules on an opaque white background, quiet zone included. */
export function matrixToRgba(matrix: boolean[][]): {
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
} {
  const { moduleSize, size } = computePngLayout(matrix.length);
  const data = new Uint8ClampedArray(size * size * 4).fill(255);

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix.length; c++) {
      if (!matrix[r][c]) continue;
      const x0 = (c + QR_QUIET_ZONE) * moduleSize;
      const y0 = (r + QR_QUIET_ZONE) * moduleSize;
      for (let y = 0; y < moduleSize; y++) {
        for (let x = 0; x < moduleSize; x++) {
          const i = ((y0 + y) * size + (x0 + x)) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
  }

  return { data, width: size, height: size };
}

/** Browser only. Encodes the raster as a PNG blob through a canvas. */
export function renderPngBlob(matrix: boolean[][]): Promise<Blob> {
  const { data, width, height } = matrixToRgba(matrix);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable'));
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/qr/png.test.ts`
Expected: all PASS.

- [ ] **Step 5: Type-check the ImageData typing**

Run: `npx tsc --noEmit`
Expected: no errors. (If `new ImageData(data, …)` complains about `ArrayBufferLike`, keep the explicit `Uint8ClampedArray<ArrayBuffer>` return type above; do not cast.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/qr-png.ts tests/qr/png.test.ts
git commit -m "feat(qr): add PNG raster export drawn from the module matrix" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: i18n — 8 locales

**Files:**
- Modify: `src/i18n/locales/{fr,en,es,de,it,pt,ru,ja}.json`
- Test: `tests/i18n/qr-locales.test.ts`

**Interfaces:**
- Consumes: `locales` from `@/i18n/locales`.
- Produces (exact key set, identical in the 8 files):
  - top-level `qrGenerator` with: `input.{title,templateLabel,counter,tooLong,clear,empty}`, `templates.{url,text,wifi,email,phone,sms,vcard}`, `fields.{text,textPlaceholder,url,urlPlaceholder,ssid,password,security,securityWpa,securityWep,securityNone,hidden,emailTo,emailSubject,emailBody,phone,smsNumber,smsMessage,firstName,lastName,org,vcardPhone,vcardEmail}`, `options.{title,style,styleHalf,styleBlocks,styleAscii,ecc,eccL,eccM,eccQ,eccH,invert,invertHint,quietZoneNote}`, `preview.{title,copy,copyMarkdown,download,downloadPng,placeholder,monospaceNote,pngNote,ariaLabel}`, `errors.{copySuccess,copyMarkdownSuccess,copyError,downloadError,pngError}`
  - `nav.qrCode`
  - `home.tools.qrCode.desc`
  - ICU placeholders: `input.counter` and `input.tooLong` use `{count}` and `{max}`.

- [ ] **Step 1: Write the failing parity test**

Create `tests/i18n/qr-locales.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import en from '@/i18n/locales/en.json';

type Json = { [key: string]: string | Json };

function flatten(obj: Json, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') acc[path] = value;
    else Object.assign(acc, flatten(value, path));
    return acc;
  }, {});
}

const tokens = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

const pick = (messages: Json) => ({
  ...flatten({ qrGenerator: messages.qrGenerator }),
  'nav.qrCode': (messages.nav as Json).qrCode as string,
  'home.tools.qrCode.desc': (((messages.home as Json).tools as Json).qrCode as Json).desc as string,
});

const reference = pick(en as unknown as Json);

describe('QR tool translations', () => {
  it('the English reference has the expected shape', () => {
    expect(Object.keys(reference)).toContain('qrGenerator.input.counter');
    expect(tokens(reference['qrGenerator.input.counter'])).toEqual(['{count}', '{max}']);
  });

  it.each([...locales])('%s has exactly the same keys and placeholders as en', async (locale) => {
    const messages = (await import(`../../src/i18n/locales/${locale}.json`)).default as Json;
    const translated = pick(messages);

    expect(Object.keys(translated).sort()).toEqual(Object.keys(reference).sort());
    for (const [key, value] of Object.entries(translated)) {
      expect(value.trim(), `${locale}: ${key} is empty`).not.toBe('');
      expect(tokens(value), `${locale}: ${key} placeholders`).toEqual(tokens(reference[key]));
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/i18n/qr-locales.test.ts`
Expected: FAIL — `qrGenerator` / `nav.qrCode` undefined.

- [ ] **Step 3: Add the English block (source of truth)**

In `src/i18n/locales/en.json` make three insertions (keep 2-space indentation and trailing commas correct):

(a) In `"nav"`, right after the line `"sparkline": "ASCII Charts",` add:
```json
    "qrCode": "QR Code",
```

(b) In `"home"` → `"tools"`, right after the closing `},` of the `"sparkline": { "desc": ... }` object add:
```json
      "qrCode": {
        "desc": "Turn any text, link or Wi-Fi network into a scannable QR code made of text characters."
      },
```

(c) As a new top-level key, immediately **before** the line `  "home": {`, add:
```json
  "qrGenerator": {
    "input": {
      "title": "Content",
      "templateLabel": "Type",
      "counter": "{count}/{max} characters",
      "tooLong": "Content too long: {count}/{max} characters. Shorten it to generate the QR code.",
      "clear": "Clear",
      "empty": "Fill in the form to generate your QR code."
    },
    "templates": {
      "url": "URL",
      "text": "Text",
      "wifi": "Wi-Fi",
      "email": "Email",
      "phone": "Phone",
      "sms": "SMS",
      "vcard": "Contact (vCard)"
    },
    "fields": {
      "text": "Text",
      "textPlaceholder": "Type or paste your text...",
      "url": "Web address",
      "urlPlaceholder": "https://example.com",
      "ssid": "Network name (SSID)",
      "password": "Password",
      "security": "Security",
      "securityWpa": "WPA/WPA2/WPA3",
      "securityWep": "WEP",
      "securityNone": "No password",
      "hidden": "Hidden network",
      "emailTo": "Recipient",
      "emailSubject": "Subject",
      "emailBody": "Message",
      "phone": "Phone number",
      "smsNumber": "Phone number",
      "smsMessage": "Message",
      "firstName": "First name",
      "lastName": "Last name",
      "org": "Company",
      "vcardPhone": "Phone",
      "vcardEmail": "Email"
    },
    "options": {
      "title": "Options",
      "style": "Style",
      "styleHalf": "Unicode half-blocks (compact)",
      "styleBlocks": "Unicode full blocks",
      "styleAscii": "Pure ASCII (#)",
      "ecc": "Error correction",
      "eccL": "L — 7%",
      "eccM": "M — 15% (recommended)",
      "eccQ": "Q — 25%",
      "eccH": "H — 30%",
      "invert": "Invert (dark background)",
      "invertHint": "Turn it on if you paste the result into a dark terminal or editor.",
      "quietZoneNote": "A 4-module margin is always added: it is required for scanning."
    },
    "preview": {
      "title": "Preview",
      "copy": "Copy",
      "copyMarkdown": "Copy as Markdown",
      "download": "Download .txt",
      "downloadPng": "Download PNG",
      "placeholder": "Your QR code will appear here...",
      "monospaceNote": "Paste it in a monospace font, otherwise the QR code will be distorted.",
      "pngNote": "The PNG is always dark on white, whatever the Invert option.",
      "ariaLabel": "QR code drawn with text characters"
    },
    "errors": {
      "copySuccess": "QR code copied to clipboard!",
      "copyMarkdownSuccess": "Markdown copied to clipboard!",
      "copyError": "Failed to copy.",
      "downloadError": "Failed to download.",
      "pngError": "Failed to generate the PNG."
    }
  },
```

- [ ] **Step 4: Add the French block**

Same three insertion points in `src/i18n/locales/fr.json` (anchor (a) is the `"sparkline":` line inside `nav`):

(a)
```json
    "qrCode": "QR Code",
```

(b)
```json
      "qrCode": {
        "desc": "Transformez un texte, un lien ou un Wi-Fi en QR code scannable dessiné avec des caractères texte."
      },
```

(c)
```json
  "qrGenerator": {
    "input": {
      "title": "Contenu",
      "templateLabel": "Type",
      "counter": "{count}/{max} caractères",
      "tooLong": "Contenu trop long : {count}/{max} caractères. Raccourcissez-le pour générer le QR code.",
      "clear": "Effacer",
      "empty": "Remplissez le formulaire pour générer votre QR code."
    },
    "templates": {
      "url": "URL",
      "text": "Texte",
      "wifi": "Wi-Fi",
      "email": "E-mail",
      "phone": "Téléphone",
      "sms": "SMS",
      "vcard": "Contact (vCard)"
    },
    "fields": {
      "text": "Texte",
      "textPlaceholder": "Saisissez ou collez votre texte...",
      "url": "Adresse web",
      "urlPlaceholder": "https://exemple.com",
      "ssid": "Nom du réseau (SSID)",
      "password": "Mot de passe",
      "security": "Sécurité",
      "securityWpa": "WPA/WPA2/WPA3",
      "securityWep": "WEP",
      "securityNone": "Sans mot de passe",
      "hidden": "Réseau masqué",
      "emailTo": "Destinataire",
      "emailSubject": "Objet",
      "emailBody": "Message",
      "phone": "Numéro de téléphone",
      "smsNumber": "Numéro de téléphone",
      "smsMessage": "Message",
      "firstName": "Prénom",
      "lastName": "Nom",
      "org": "Société",
      "vcardPhone": "Téléphone",
      "vcardEmail": "E-mail"
    },
    "options": {
      "title": "Options",
      "style": "Style",
      "styleHalf": "Demi-blocs Unicode (compact)",
      "styleBlocks": "Blocs pleins Unicode",
      "styleAscii": "ASCII pur (#)",
      "ecc": "Correction d'erreur",
      "eccL": "L — 7 %",
      "eccM": "M — 15 % (recommandé)",
      "eccQ": "Q — 25 %",
      "eccH": "H — 30 %",
      "invert": "Inverser (fond sombre)",
      "invertHint": "Activez-le si vous collez le résultat dans un terminal ou un éditeur sombre.",
      "quietZoneNote": "Une marge de 4 modules est toujours ajoutée : elle est indispensable au scan."
    },
    "preview": {
      "title": "Aperçu",
      "copy": "Copier",
      "copyMarkdown": "Copier en Markdown",
      "download": "Télécharger .txt",
      "downloadPng": "Télécharger PNG",
      "placeholder": "Votre QR code apparaîtra ici...",
      "monospaceNote": "À coller dans une police à chasse fixe, sinon le QR code sera déformé.",
      "pngNote": "Le PNG est toujours noir sur blanc, quelle que soit l'option Inverser.",
      "ariaLabel": "QR code dessiné avec des caractères texte"
    },
    "errors": {
      "copySuccess": "QR code copié dans le presse-papiers !",
      "copyMarkdownSuccess": "Markdown copié dans le presse-papiers !",
      "copyError": "Échec de la copie.",
      "downloadError": "Échec du téléchargement.",
      "pngError": "Échec de la génération du PNG."
    }
  },
```

- [ ] **Step 5: Add the six other locales**

For each of `es`, `de`, `it`, `pt`, `ru`, `ja`: apply the same three insertions (a), (b), (c) at the same anchors, **translating the English values** (keys and `{count}`/`{max}` placeholders stay untouched). Keep the tone of the surrounding file (look at that file's `sparklineGenerator` block for vocabulary: "Copy", "Download", "Options", "Preview"). Keep `URL`, `SMS`, `Wi-Fi`, `WEP`, `WPA/WPA2/WPA3`, `vCard`, `PNG`, `.txt`, `Markdown`, `ASCII`, `Unicode` as-is. Keep `"qrCode": "QR Code"` in `nav` for every locale (`ja`: `"QRコード"`, `ru`: `"QR-код"`).

- [ ] **Step 6: Run the parity test**

Run: `npx vitest run tests/i18n/qr-locales.test.ts`
Expected: all 9 tests PASS. If a locale fails, the message names the exact missing/extra key or the mismatched placeholder.

- [ ] **Step 7: Validate the JSON files still parse**

Run: `for l in fr en es de it pt ru ja; do node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/$l.json','utf8'))" && echo "$l ok"; done`
Expected: 8 lines `<locale> ok`.

- [ ] **Step 8: Commit**

```bash
git add src/i18n/locales tests/i18n/qr-locales.test.ts
git commit -m "feat(qr): add translations for the QR code tool in 8 locales" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: SEO metadata and content

**Files:**
- Modify: `src/lib/seo-config.ts` (add the `'qr-code-generator'` entry inside `TOOLS_SEO`, after the `'sparkline'` entry)
- Modify: `src/lib/tool-seo-content.ts` (add the `'qr-code-generator'` entry inside `CONTENT`, after the `'sparkline'` entry)
- Test: `tests/seo/qr-seo.test.ts`

**Interfaces:**
- Consumes: `TOOLS_SEO`, `getToolMetadata`, `ToolSlug` from `@/lib/seo-config`; `getToolContent` from `@/lib/tool-seo-content`.
- Produces: `ToolSlug` now includes `'qr-code-generator'` (Task 7 and 8 use it). `TOOLS_SEO[...]` has `titles` and `descriptions` for all 8 locales; `CONTENT[...]` has `{ heading, intro, faq: 3 items }` for all 8 locales.

- [ ] **Step 1: Write the failing test**

Create `tests/seo/qr-seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { locales } from '@/i18n/locales';
import { getToolMetadata } from '@/lib/seo-config';
import { getToolContent } from '@/lib/tool-seo-content';

const SLUG = 'qr-code-generator' as const;

describe('QR tool SEO', () => {
  it.each([...locales])('%s has its own title, description and copy', (locale) => {
    const meta = getToolMetadata(SLUG, locale);
    expect(meta.path).toBe(`/${locale}/tools/qr-code-generator`);
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

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/seo/qr-seo.test.ts`
Expected: FAIL (the entry does not exist, so `entry.titles` is undefined).

- [ ] **Step 3: Add the SEO metadata (`seo-config.ts`)**

Inside `TOOLS_SEO`, after the closing `},` of `'sparkline': { ... }`, add. Write the `fr` and `en` keys exactly as below; the six other locales are added right after (see the paragraph following the snippet):

```ts
  'qr-code-generator': {
    titles: {
      fr: "Générateur de QR Code ASCII — QR Code en Texte Scannable | Gratuit",
      en: "ASCII QR Code Generator — Scannable Text QR Codes | Free Online",
    },
    descriptions: {
      fr: "Générez des QR codes scannables en caractères texte (blocs Unicode ou ASCII pur) pour README, terminaux et docs. Wi-Fi, URL, vCard, SMS. Gratuit, 100 % dans votre navigateur.",
      en: "Generate scannable QR codes made of text characters (Unicode blocks or pure ASCII) for READMEs, terminals and docs. Wi-Fi, URL, vCard, SMS. Free, 100% in your browser.",
    },
  },
```

Then, in **both** `titles` and `descriptions`, add the six missing keys `es`, `de`, `it`, `pt`, `ru`, `ja` (same order as the `sparkline` entry above it), each a faithful translation of the English string. Title keeps the words "QR" and "ASCII"; description ≤ 180 characters. None may equal the English text (the test enforces it).

- [ ] **Step 4: Add the SEO copy (`tool-seo-content.ts`)**

Inside `CONTENT`, after the closing `},` of `'sparkline': { ... }`, add. `en` and `fr` verbatim; the other six locales are translations of the `en` entry with the same structure (`heading`, `intro`, and exactly 3 `faq` items):

```ts
  'qr-code-generator': {
    en: {
      heading: 'About the ASCII QR Code Generator',
      intro:
        'Turn any text, link, Wi-Fi network or contact card into a QR code drawn with text characters. Pick Unicode half-blocks for a compact result or pure ASCII for maximum compatibility, then paste it into a README, a terminal, a code comment or a plain-text email. Everything runs in your browser: your content is never sent to a server.',
      faq: [
        { q: 'Can an ASCII QR code really be scanned?', a: 'Yes. The tool always adds the 4-module quiet zone required by the QR standard and uses a real error-correction level (M by default). Display it in a monospace font at a readable size and any phone camera can read it.' },
        { q: 'What is the difference between the three styles?', a: 'Half-blocks (▀▄█) are the most compact and closest to square. Full blocks (██) are simple and robust. Pure ASCII (##) uses only 7-bit characters, so it survives any text channel, but it is much wider.' },
        { q: 'Why is there an Invert option?', a: 'Terminals and dark editors show light text on a dark background, which reverses the QR code. Turn on Invert to print the light modules instead, so the code reads correctly on a dark background.' },
      ],
    },
    fr: {
      heading: 'À propos du générateur de QR code ASCII',
      intro:
        'Transformez un texte, un lien, un réseau Wi-Fi ou une carte de contact en QR code dessiné avec des caractères texte. Choisissez les demi-blocs Unicode pour un résultat compact ou l’ASCII pur pour une compatibilité maximale, puis collez-le dans un README, un terminal, un commentaire de code ou un e-mail en texte brut. Tout fonctionne dans votre navigateur : votre contenu n’est jamais envoyé à un serveur.',
      faq: [
        { q: 'Un QR code ASCII est-il vraiment scannable ?', a: 'Oui. L’outil ajoute toujours la marge de 4 modules exigée par la norme QR et utilise un vrai niveau de correction d’erreur (M par défaut). Affichez-le dans une police à chasse fixe, à une taille lisible, et n’importe quel appareil photo de téléphone le lit.' },
        { q: 'Quelle différence entre les trois styles ?', a: 'Les demi-blocs (▀▄█) sont les plus compacts et les plus proches d’un carré. Les blocs pleins (██) sont simples et robustes. L’ASCII pur (##) n’utilise que des caractères 7 bits et passe donc par tous les canaux texte, mais il est beaucoup plus large.' },
        { q: 'À quoi sert l’option Inverser ?', a: 'Les terminaux et éditeurs sombres affichent du texte clair sur fond sombre, ce qui inverse le QR code. Activez Inverser pour imprimer les modules clairs à la place : le code se lit alors correctement sur fond sombre.' },
      ],
    },
  },
```

Then add the six missing locale keys `es`, `de`, `it`, `pt`, `ru`, `ja` **inside the same `'qr-code-generator'` object, after `fr`** (same order as the `sparkline` entry). Each is `{ heading, intro, faq: [3 × { q, a }] }`, a faithful translation of the `en` entry (48 strings in total). Keep the glyphs `▀▄█`, `██`, `##`, `M`, and the numbers (`4-module`, `7-bit`) unchanged. The test in the next steps fails if any locale is missing, empty, or falls back to English.

- [ ] **Step 5: Run the SEO test**

Run: `npx vitest run tests/seo/qr-seo.test.ts`
Expected: 15 tests PASS (8 locales in the first block + 7 non-English locales in the second).

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (`ToolSlug` now includes `'qr-code-generator'`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo-config.ts src/lib/tool-seo-content.ts tests/seo/qr-seo.test.ts
git commit -m "feat(qr): add SEO metadata and FAQ content in 8 locales" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: UI components and route

**Files:**
- Modify: `src/components/icons.tsx`
- Create: `src/hooks/use-debounced-value.ts`
- Create: `src/components/qr-generator/qr-generator.tsx`
- Create: `src/components/qr-generator/qr-input.tsx`
- Create: `src/components/qr-generator/qr-preview.tsx`
- Create: `src/components/qr-generator/qr-options-panel.tsx`
- Create: `src/app/[locale]/tools/qr-code-generator/page.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2–6 (`buildPayload`, `countChars`, `DEFAULT_FIELDS`, `generateMatrix`, `renderQr`, `toMarkdown`, `renderPngBlob`, `QR_MAX_LENGTH`, types, the `qrGenerator` i18n namespace, `buildToolMetadata('qr-code-generator', …)`, `ToolSeoSection tool="qr-code-generator"`).
- Produces: route `/[locale]/tools/qr-code-generator`; icon `QrCode` exported from `@/components/icons` (used by Task 8).

There is no UI test framework in the project; this task is verified by `tsc`, `lint`, and a manual check (Task 9).

- [ ] **Step 1: Export the `QrCode` icon**

In `src/components/icons.tsx`, add `QrCodeIcon,` to the import list from `"@hugeicons/core-free-icons"` (keep it alphabetical, after `PlusSignIcon,`), and add after the `Quote` export line:

```tsx
export const QrCode = createIcon(QrCodeIcon, "QrCode");
```

- [ ] **Step 2: Create the debounce hook**

`src/hooks/use-debounced-value.ts`:

```ts
import { useEffect, useState } from 'react';

/** Returns `value` after it has stopped changing for `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
```

- [ ] **Step 3: Create the options panel**

`src/components/qr-generator/qr-options-panel.tsx`:

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { QrEcc, QrOptions, QrStyle } from '@/lib/qr-types';

interface QrOptionsPanelProps {
  options: QrOptions;
  onOptionsChange: (options: QrOptions) => void;
}

export function QrOptionsPanel({ options, onOptionsChange }: QrOptionsPanelProps) {
  const t = useTranslations('qrGenerator');

  const set = <K extends keyof QrOptions>(key: K, value: QrOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">
        <div className="space-y-2">
          <Label htmlFor="qrStyle">{t('options.style')}</Label>
          <Select value={options.style} onValueChange={(v) => set('style', v as QrStyle)}>
            <SelectTrigger id="qrStyle" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="half">{t('options.styleHalf')}</SelectItem>
              <SelectItem value="blocks">{t('options.styleBlocks')}</SelectItem>
              <SelectItem value="ascii">{t('options.styleAscii')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrEcc">{t('options.ecc')}</Label>
          <Select value={options.ecc} onValueChange={(v) => set('ecc', v as QrEcc)}>
            <SelectTrigger id="qrEcc" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">{t('options.eccL')}</SelectItem>
              <SelectItem value="M">{t('options.eccM')}</SelectItem>
              <SelectItem value="Q">{t('options.eccQ')}</SelectItem>
              <SelectItem value="H">{t('options.eccH')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="qrInvert">{t('options.invert')}</Label>
            <Switch
              id="qrInvert"
              checked={options.invert}
              onCheckedChange={(v) => set('invert', v)}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('options.invertHint')}</p>
        </div>

        <p className="text-xs text-muted-foreground">{t('options.quietZoneNote')}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the input card**

`src/components/qr-generator/qr-input.tsx`:

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Trash2 } from '@/components/icons';
import {
  QR_MAX_LENGTH,
  type QrFields,
  type QrTemplate,
  type QrTextFieldKey,
  type WifiSecurity,
} from '@/lib/qr-types';

const TEMPLATES: QrTemplate[] = ['url', 'text', 'wifi', 'email', 'phone', 'sms', 'vcard'];

interface QrInputProps {
  template: QrTemplate;
  fields: QrFields;
  charCount: number;
  onTemplateChange: (template: QrTemplate) => void;
  onFieldsChange: (fields: QrFields) => void;
  onClear: () => void;
}

export function QrInput({
  template,
  fields,
  charCount,
  onTemplateChange,
  onFieldsChange,
  onClear,
}: QrInputProps) {
  const t = useTranslations('qrGenerator');
  const tooLong = charCount > QR_MAX_LENGTH;

  const textField = (
    key: QrTextFieldKey,
    labelKey: string,
    opts: { type?: string; placeholder?: string } = {}
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`qr-${key}`}>{t(`fields.${labelKey}`)}</Label>
      <Input
        id={`qr-${key}`}
        type={opts.type ?? 'text'}
        value={fields[key]}
        placeholder={opts.placeholder}
        onChange={(e) => onFieldsChange({ ...fields, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('input.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-template">{t('input.templateLabel')}</Label>
          <Select value={template} onValueChange={(v) => onTemplateChange(v as QrTemplate)}>
            <SelectTrigger id="qr-template" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`templates.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {template === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="qr-text">{t('fields.text')}</Label>
            <Textarea
              id="qr-text"
              value={fields.text}
              placeholder={t('fields.textPlaceholder')}
              onChange={(e) => onFieldsChange({ ...fields, text: e.target.value })}
              className="font-mono min-h-[100px] resize-y"
            />
          </div>
        )}

        {template === 'url' &&
          textField('url', 'url', { type: 'url', placeholder: t('fields.urlPlaceholder') })}

        {template === 'wifi' && (
          <>
            {textField('ssid', 'ssid')}
            <div className="space-y-2">
              <Label htmlFor="qr-security">{t('fields.security')}</Label>
              <Select
                value={fields.security}
                onValueChange={(v) => onFieldsChange({ ...fields, security: v as WifiSecurity })}
              >
                <SelectTrigger id="qr-security" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">{t('fields.securityWpa')}</SelectItem>
                  <SelectItem value="WEP">{t('fields.securityWep')}</SelectItem>
                  <SelectItem value="nopass">{t('fields.securityNone')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {fields.security !== 'nopass' && textField('password', 'password')}
            <div className="flex items-center justify-between">
              <Label htmlFor="qr-hidden">{t('fields.hidden')}</Label>
              <Switch
                id="qr-hidden"
                checked={fields.hidden}
                onCheckedChange={(v) => onFieldsChange({ ...fields, hidden: v })}
              />
            </div>
          </>
        )}

        {template === 'email' && (
          <>
            {textField('emailTo', 'emailTo', { type: 'email' })}
            {textField('emailSubject', 'emailSubject')}
            <div className="space-y-2">
              <Label htmlFor="qr-emailBody">{t('fields.emailBody')}</Label>
              <Textarea
                id="qr-emailBody"
                value={fields.emailBody}
                onChange={(e) => onFieldsChange({ ...fields, emailBody: e.target.value })}
                className="min-h-[80px] resize-y"
              />
            </div>
          </>
        )}

        {template === 'phone' && textField('phone', 'phone', { type: 'tel' })}

        {template === 'sms' && (
          <>
            {textField('smsNumber', 'smsNumber', { type: 'tel' })}
            <div className="space-y-2">
              <Label htmlFor="qr-smsMessage">{t('fields.smsMessage')}</Label>
              <Textarea
                id="qr-smsMessage"
                value={fields.smsMessage}
                onChange={(e) => onFieldsChange({ ...fields, smsMessage: e.target.value })}
                className="min-h-[80px] resize-y"
              />
            </div>
          </>
        )}

        {template === 'vcard' && (
          <>
            {textField('firstName', 'firstName')}
            {textField('lastName', 'lastName')}
            {textField('org', 'org')}
            {textField('vcardPhone', 'vcardPhone', { type: 'tel' })}
            {textField('vcardEmail', 'vcardEmail', { type: 'email' })}
          </>
        )}

        <div className="text-sm">
          <span className={tooLong ? 'text-destructive' : 'text-muted-foreground'}>
            {t('input.counter', { count: charCount, max: QR_MAX_LENGTH })}
          </span>
          {tooLong && (
            <p role="alert" className="mt-1 text-destructive">
              {t('input.tooLong', { count: charCount, max: QR_MAX_LENGTH })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create the preview card**

`src/components/qr-generator/qr-preview.tsx`:

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Download, FileText, Image } from '@/components/icons';
import { cn } from '@/lib/utils';

interface QrPreviewProps {
  output: string;
  invert: boolean;
  onCopy: () => void;
  onCopyMarkdown: () => void;
  onDownload: () => void;
  onDownloadPng: () => void;
}

export function QrPreview({
  output,
  invert,
  onCopy,
  onCopyMarkdown,
  onDownload,
  onDownloadPng,
}: QrPreviewProps) {
  const t = useTranslations('qrGenerator');
  const empty = !output;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          {t('preview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={onCopy} size="sm" disabled={empty}>
            <Copy className="w-4 h-4 mr-1" />
            {t('preview.copy')}
          </Button>
          <Button onClick={onCopyMarkdown} size="sm" variant="outline" disabled={empty}>
            <FileText className="w-4 h-4 mr-1" />
            {t('preview.copyMarkdown')}
          </Button>
          <Button onClick={onDownload} size="sm" variant="outline" disabled={empty}>
            <Download className="w-4 h-4 mr-1" />
            {t('preview.download')}
          </Button>
          <Button onClick={onDownloadPng} size="sm" variant="outline" disabled={empty}>
            <Image className="w-4 h-4 mr-1" />
            {t('preview.downloadPng')}
          </Button>
        </div>

        {empty ? (
          <div className="rounded-md bg-muted p-4 min-h-[120px] text-sm text-muted-foreground">
            {t('preview.placeholder')}
          </div>
        ) : (
          // Colors are forced (not theme-dependent): a QR code is only scannable with the
          // right polarity. Inverted output is drawn on black so it keeps that polarity.
          <pre
            role="img"
            aria-label={t('preview.ariaLabel')}
            className={cn(
              'font-mono text-[10px] leading-[1] rounded-md p-4 min-h-[120px] overflow-x-auto whitespace-pre',
              invert ? 'bg-black text-white' : 'bg-white text-black'
            )}
          >
            {output}
          </pre>
        )}

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>{t('preview.monospaceNote')}</p>
          <p>{t('preview.pngNote')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Create the state container**

`src/components/qr-generator/qr-generator.tsx`:

```tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { QR_MAX_LENGTH, type QrFields, type QrOptions, type QrTemplate } from '@/lib/qr-types';
import { buildPayload, countChars, DEFAULT_FIELDS } from '@/lib/qr-templates';
import { generateMatrix, renderQr, toMarkdown } from '@/lib/qr-generator';
import { renderPngBlob } from '@/lib/qr-png';
import { QrInput } from './qr-input';
import { QrPreview } from './qr-preview';
import { QrOptionsPanel } from './qr-options-panel';

const EXAMPLE_URL = 'https://asciitree.fr';

const DEFAULT_OPTIONS: QrOptions = { style: 'half', ecc: 'M', invert: false };

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function QrGenerator() {
  const t = useTranslations('qrGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [template, setTemplate] = useState<QrTemplate>('url');
  const [fields, setFields] = useState<QrFields>({ ...DEFAULT_FIELDS, url: EXAMPLE_URL });
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);

  const payload = useMemo(() => buildPayload(template, fields), [template, fields]);
  const charCount = countChars(payload);

  // The counter reacts instantly; the (cheap) generation follows after a short pause.
  // The length is re-checked on the debounced value: it can lag behind and still be too long,
  // and feeding an over-long string to the encoder would throw.
  const debouncedPayload = useDebouncedValue(payload, 150);
  const safePayload = countChars(debouncedPayload) <= QR_MAX_LENGTH ? debouncedPayload : '';

  const matrix = useMemo(() => generateMatrix(safePayload, options.ecc), [safePayload, options.ecc]);
  const output = useMemo(
    () => renderQr(matrix, options.style, options.invert),
    [matrix, options.style, options.invert]
  );

  useEffect(() => {
    setContent(<QrOptionsPanel options={options} onOptionsChange={setOptions} />);
    return () => setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => setFields(DEFAULT_FIELDS), []);

  const copyText = useCallback(
    async (text: string, successKey: 'errors.copySuccess' | 'errors.copyMarkdownSuccess') => {
      try {
        await navigator.clipboard.writeText(text);
        toast({ description: t(successKey) });
      } catch {
        toast({ description: t('errors.copyError'), variant: 'destructive' });
      }
    },
    [t, toast]
  );

  const handleCopy = useCallback(() => copyText(output, 'errors.copySuccess'), [copyText, output]);
  const handleCopyMarkdown = useCallback(
    () => copyText(toMarkdown(output), 'errors.copyMarkdownSuccess'),
    [copyText, output]
  );

  const handleDownload = useCallback(() => {
    try {
      saveBlob(new Blob([output], { type: 'text/plain' }), 'qr-code.txt');
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  const handleDownloadPng = useCallback(async () => {
    try {
      saveBlob(await renderPngBlob(matrix), 'qr-code.png');
    } catch {
      toast({ description: t('errors.pngError'), variant: 'destructive' });
    }
  }, [matrix, t, toast]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <QrInput
        template={template}
        fields={fields}
        charCount={charCount}
        onTemplateChange={setTemplate}
        onFieldsChange={setFields}
        onClear={handleClear}
      />
      <QrPreview
        output={output}
        invert={options.invert}
        onCopy={handleCopy}
        onCopyMarkdown={handleCopyMarkdown}
        onDownload={handleDownload}
        onDownloadPng={handleDownloadPng}
      />
    </div>
  );
}
```

- [ ] **Step 7: Create the page**

`src/app/[locale]/tools/qr-code-generator/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { QrGenerator } from '@/components/qr-generator/qr-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('qr-code-generator', locale);
}

export default async function QrCodeGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <QrGenerator />
      <AdSlot slot="qr-code-generator-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="qr-code-generator" locale={locale} />
    </>
  );
}
```

- [ ] **Step 8: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. If `tsc` reports an error on `onFieldsChange({ ...fields, [key]: e.target.value })` in `qr-input.tsx`, keep the object shape but write it as `onFieldsChange({ ...fields, [key]: e.target.value } as QrFields)`; do not weaken the `QrTextFieldKey` type.

- [ ] **Step 9: Commit**

```bash
git add src/components/icons.tsx src/hooks/use-debounced-value.ts src/components/qr-generator "src/app/[locale]/tools/qr-code-generator"
git commit -m "feat(qr): add the QR code generator UI and route" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Register the tool, sitemap, home card, release notes

**Files:**
- Modify: `src/lib/tools.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/components/home/tools-showcase.tsx`
- Modify: `CHANGELOG.md`
- Modify: `src/lib/changelog.ts`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `QrCode` icon (Task 7), route (Task 7), `nav.qrCode` + `home.tools.qrCode.desc` (Task 5).
- Produces: the tool visible in the sidebar, sitemap, home page, changelog dialog, version `2.2.0`.

- [ ] **Step 1: Register in `src/lib/tools.ts`**

Change the import line to add `QrCode`:

```ts
import { FolderTree, Table, BarChart2, Type, BookMarked, Smile, FileText, Edit3, QrCode } from '@/components/icons';
```

In `TOOLS`, add after the `banner` entry:

```ts
  {
    id: 'qr-code',
    href: '/tools/qr-code-generator',
    icon: QrCode,
    nameKey: 'qrCode',
  },
```

- [ ] **Step 2: Add to the sitemap**

In `src/app/sitemap.ts`, in `localizedRoutes`, after `{ path: '/tools/sparkline', priority: 0.8 },` add:

```ts
  { path: '/tools/qr-code-generator', priority: 0.8 },
```

- [ ] **Step 3: Add the home card**

In `src/components/home/tools-showcase.tsx`, in `SHOWCASE_TOOLS`, after the `banner` entry (the one ending with the `╚═╝  ╚═╝╚═╝` preview) add:

```tsx
  {
    id: 'qr-code',
    href: '/tools/qr-code-generator',
    tag: 'QR',
    nameKey: 'qrCode',
    descKey: 'home.tools.qrCode.desc',
    preview: `█▀▀▀█ ▄▀█ █▀▀▀█
█ ▄ █ ▀▄▀ █ ▄ █
█▄▄▄█ █▄▀ █▄▄▄█`,
  },
```

(This thumbnail is decorative, not a scannable code.)

- [ ] **Step 4: Update `CHANGELOG.md`**

Insert directly above the line `## [2.1.0] - 2026-07-18`:

```markdown
## [2.2.0] - 2026-09-20

Ajout d'un **générateur de QR code ASCII**.

### Ajouté

- **Générateur de QR code ASCII** (`/tools/qr-code-generator`) : QR codes
  scannables dessinés avec des caractères texte.
- Trois styles : demi-blocs Unicode, blocs pleins Unicode et ASCII 7 bits pur,
  avec option « Inverser » pour les fonds sombres.
- Modèles guidés : texte, URL, Wi-Fi, e-mail, téléphone, SMS et vCard, dans la
  limite de 300 caractères.
- Niveau de correction d'erreur réglable (M par défaut).
- Export : copie, bloc Markdown, fichier `.txt` et image PNG.
- Génération 100 % dans le navigateur : le contenu n'est jamais envoyé à un serveur.
- Premiers tests automatisés (Vitest) : les QR codes générés sont relus par un
  décodeur (jsQR) pour garantir qu'ils restent scannables.

```

- [ ] **Step 5: Update `src/lib/changelog.ts`**

Change `export const APP_VERSION = '2.1.0';` to `'2.2.0'`, and add this entry at the top of the `CHANGELOG` array (before the `version: '2.1.0'` entry):

```ts
  {
    version: '2.2.0',
    date: '2026-09-20',
    summary:
      'Ajout d’un générateur de QR code ASCII : QR codes scannables dessinés en caractères texte, avec export texte, Markdown et PNG.',
    sections: [
      {
        title: 'Ajouté',
        items: [
          'Générateur de QR code ASCII : trois styles (demi-blocs Unicode, blocs pleins, ASCII pur) et option « Inverser » pour les fonds sombres.',
          'Modèles guidés : texte, URL, Wi-Fi, e-mail, téléphone, SMS et vCard (300 caractères maximum).',
          'Niveau de correction d’erreur réglable (M par défaut).',
          'Export : copie, bloc Markdown, fichier .txt et image PNG.',
          'Génération 100 % dans le navigateur : le contenu n’est jamais envoyé à un serveur.',
          'Premiers tests automatisés : les QR codes générés sont relus par un décodeur pour garantir leur lisibilité.',
        ],
      },
    ],
  },
```

- [ ] **Step 6: Bump the package version**

```bash
npm pkg set version=2.2.0
npm install --package-lock-only
```

Expected: `package.json` shows `"version": "2.2.0"`; `package-lock.json` root versions updated; no dependency changes.

- [ ] **Step 7: Type-check, lint, test**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: no type or lint errors; all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/tools.ts src/app/sitemap.ts src/components/home/tools-showcase.tsx CHANGELOG.md src/lib/changelog.ts package.json package-lock.json
git commit -m "feat(qr): register the QR code tool in nav, sitemap and home, release 2.2.0" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Final verification (build + real phone scan)

**Files:** none (verification only; fix in the owning task's files if something fails).

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds; the output lists `/[locale]/tools/qr-code-generator` for the 8 locales. Any type error in `tests/` or `vitest.config.ts` (they are included by `tsconfig.json`) must be fixed, not excluded.

- [ ] **Step 2: Full automated suite**

Run: `npm test`
Expected: all suites PASS (uqr contract, templates, generator incl. 96 scan round-trips, png, i18n parity, SEO).

- [ ] **Step 3: Manual check in the browser**

Run: `npm run dev`, open `http://localhost:3000/fr/tools/qr-code-generator`. Check each of the following and note any failure:

1. The tool is in the sidebar and on the home page; the version in the sidebar footer reads 2.2.0 and the dialog shows the 2.2.0 entry.
2. Default state shows a QR code for `https://asciitree.fr` in half-block style, on a white background, in **both light and dark app theme**.
3. Switch to `Wi-Fi`, `vCard`, `SMS`, `Email`, `Phone`, `Text`: the preview updates live; the counter shows `n/300`.
4. Type more than 300 characters in `Text`: the counter turns red, the alert appears, the preview clears (no crash). Delete characters: the QR code returns.
5. Options: change style (3), ECC (4). Turn on Invert: the preview switches to a black background with white text.
6. Buttons: Copy, Copy as Markdown, Download .txt, Download PNG all work; the PNG file opens as a black-on-white QR code with a white margin.
7. Change the language (e.g. `/ja`, `/ru`): no missing-key warning in the console, no untranslated English.

- [ ] **Step 4: Real phone scan (acceptance criterion)**

With a phone camera, scan the on-screen QR code (default URL) in each of the 3 styles. Then paste the copied text into a monospace editor/terminal (dark terminal: turn on Invert first) and scan again.
Expected: the phone opens `https://asciitree.fr` every time.
Known risk to report rather than hide: the pure-ASCII style (`##`) has gaps between glyph rows and columns depending on the font, so it can scan worse on a screen than the block styles. If it fails at the default preview size, report it with the font/size used; the fallback is to switch its glyph pair to a denser one (e.g. `@@`) in `qr-generator.ts` and in the `GLYPH` map of `tests/qr/helpers.ts`, then re-run `npm test`.

- [ ] **Step 5: Wrap up**

Run: `git status` and `git log --oneline main..HEAD`
Expected: clean tree; 8 commits (one per task 1–8). Then use superpowers:finishing-a-development-branch.

---

## Self-Review

**Spec coverage** (each Global Constraint → task):
- Scan mandatory → Task 3 (96 round-trips), Task 4 (PNG scan), Task 9 (phone).
- 3 styles/presets, quiet zone 4, ECC M default exposed, Invert → Tasks 3, 7.
- Preview forced colors → Task 7 (`qr-preview.tsx`). Refinement noted (black background when inverted).
- Client-side only → no network code anywhere; changelog states it.
- 7 templates + simple vCard, 300-char limit on final string, in code points, no truncation → Tasks 2, 7 (counter + alert + `safePayload`).
- Live generation with debounce → Task 7 (`useDebouncedValue`).
- Copy / Markdown / .txt / PNG (raster, fixed size, integer multiple) → Tasks 3, 4, 7.
- Monospace note, aria-label → Task 7 + i18n keys (Task 5).
- 8 locales, no hardcoded strings → Tasks 5, 6; parity tests enforce it.
- Slug, sitemap, SEO, ads slot, analytics (global, nothing per tool), version bump ×3 files → Tasks 6, 7, 8.
- Automated test with jsqr → Tasks 1, 3, 4.

**Placeholder scan:** the only intentional fill-in-the-blank items are the **translations** in Tasks 5 and 6 (six locales × SEO strings). They are bounded by a written source (`en`), a fixed key set, and tests that fail on any missing/identical-to-English/mis-templated value. No other TBD/TODO.

**Type consistency:** `QrTextFieldKey`, `QrFields`, `QrOptions`, `QrStyle`, `QrEcc`, `QrTemplate` defined in Task 2 and used unchanged in Tasks 3 and 7. `generateMatrix/toInkGrid/renderQr/toMarkdown` (Task 3) and `renderPngBlob/matrixToRgba/computePngLayout/PNG_TARGET_SIZE` (Task 4) are called with the same signatures in Task 7. i18n keys used in Task 7 (`input.*`, `templates.*`, `fields.*`, `options.*`, `preview.*`, `errors.*`) all exist in the Task 5 key list. `ToolSlug` `'qr-code-generator'` is created in Task 6 before Tasks 7 (page) needs it.

**Decisions to confirm at review time (not blocking):**
1. Inverted preview on black (refinement of "white background forced").
2. `url` template does not auto-prefix `https://`; the value is encoded as typed.
3. vCard lines are joined with `\n` (not CRLF) to save characters; phone scanners accept it.
4. The PNG ignores the Invert option (always dark on white).
