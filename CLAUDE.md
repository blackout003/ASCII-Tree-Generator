# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Stack

- **Next.js 16** with App Router, TypeScript 5.9 (strict), Tailwind CSS 3
- **shadcn/ui** + Radix UI primitives for all UI components
- **next-intl 4** for i18n (8 locales: fr, en, es, de, it, pt, ru, ja)
- **Zod 4** for runtime validation (import/export file schema)
- Path alias: `@/*` → `src/*`

## Architecture

### Core data flow

`TreeGenerator` (component) owns all state → `TreeView` edits the `TreeNode[]` tree → `TreeOptionsPanel` configures `TreeOptions` → `generateASCIITree()` (pure function) renders ASCII → `ASCIIPreview` displays output.

No global state manager. State lives in `tree-generator.tsx` via React hooks only.

### Key files

| File | Role |
|------|------|
| [src/lib/tree-generator.ts](src/lib/tree-generator.ts) | Core recursive ASCII generation algorithm |
| [src/lib/types.ts](src/lib/types.ts) | `TreeNode`, `TreeOptions`, `ConnectorStyle` types |
| [src/lib/validation.ts](src/lib/validation.ts) | Zod schemas for JSON save/load |
| [src/lib/default-options.ts](src/lib/default-options.ts) | Default `TreeOptions` config |
| [src/components/generator/tree-generator.tsx](src/components/generator/tree-generator.tsx) | Main state container |
| [src/components/generator/tree-view.tsx](src/components/generator/tree-view.tsx) | Editable tree with drag-drop |
| [src/components/generator/ascii-preview.tsx](src/components/generator/ascii-preview.tsx) | ASCII output, copy/download |
| [src/i18n/locales/](src/i18n/locales/) | Translation JSON files per locale |
| [src/app/\[locale\]/](src/app/[locale]/) | Dynamic locale routing (all pages here) |

### Tree transformation pipeline

`TreeNode[]` → compress empty folders → show only files/folders filter → sort → `generateASCIITree()` → ASCII string.

The pipeline runs via `useMemo` in `tree-generator.tsx`, re-computing only when tree data or options change.

### Connector styles

Two styles defined in `TreeOptions.connectorStyle`:
- **Unicode** (default): `├──`, `│   `, `└──`
- **ASCII**: `|--`, `|   `, `\--`

### i18n

All routes live under `src/app/[locale]/`. Locales are statically generated via `generateStaticParams()`. Translation keys are in `src/i18n/locales/<lang>.json`. Never hardcode user-facing strings — always use `useTranslations()` from `next-intl`.

### Environment variables

All prefixed `NEXT_PUBLIC_`. See `.env.example` for the full list. Analytics providers (GA4, GTM, Hotjar, Matomo, Umami) are opt-in via env vars — the `analytics.tsx` component conditionally injects scripts.

### Legal pages

`/mentions-legales` and `/donnees-personnelles` are French-only static pages under `src/components/legal/`. They are not internationalized.
