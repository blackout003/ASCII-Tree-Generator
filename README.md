# ASCII Tools

> A free, open-source web toolkit to create ASCII file trees, tables, charts and text banners — perfect for README files, technical documentation and the terminal.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![GitHub Issues](https://img.shields.io/github/issues/blackout003/ASCII-Tree-Generator)](https://github.com/blackout003/ASCII-Tree-Generator/issues)
[![GitHub Feature Requests](https://img.shields.io/github/issues/blackout003/ASCII-Tree-Generator/enhancement?label=feature%20requests&color=purple)](https://github.com/blackout003/ASCII-Tree-Generator/issues?q=label%3Aenhancement)

**Live:** [asciitree.fr](https://asciitree.fr) · [Report a bug](https://github.com/blackout003/ASCII-Tree-Generator/issues/new?template=bug_report.md) · [Request a feature](https://github.com/blackout003/ASCII-Tree-Generator/issues/new?template=feature_request.md)

---

## Tools

A suite of ASCII generators that run entirely in your browser — no signup, no install, output ready to copy and paste anywhere.

- **ASCII Tree** — build file/folder hierarchies with a drag-and-drop editor and a real-time preview
- **ASCII Table** — turn tabular data into clean text tables
- **ASCII Charts** — visualize number series as compact mini-charts (sparklines)
- **Text Banners** — convert text into large stylized ASCII banners

Plus reference resources:

- **Markdown Guide** — a handy cheat sheet for Markdown syntax
- **ASCII Emojis** — a browsable catalog of ASCII/kaomoji emoticons

## Features

- **Real-time preview** — see the output update as you type
- **Drag-and-drop tree editor** — build your file/folder hierarchy visually
- **Two connector styles** — Unicode (`├──`, `└──`) or plain ASCII (`|--`, `\--`)
- **Customizable output** — indentation, depth limit, sorting, folder slash
- **Copy & export** — copy to clipboard or download as `.txt`
- **8 languages** — French, English, Italian, Spanish, German, Portuguese, Russian, Japanese
- **Dark / Light theme**
- **PWA-ready** — installable on desktop and mobile
- **Privacy-first** — no account required, analytics are production-only and opt-in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 3 + shadcn/ui |
| UI Primitives | Radix UI |
| i18n | next-intl 4 |
| Validation | Zod 4 |
| Icons | Lucide React |
| Analytics | Vercel Speed Insights |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone https://github.com/blackout003/ASCII-Tree-Generator.git
cd ascii-tree-generator
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will redirect to the default locale (`/fr/`).

### Build & Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

All variables are optional. The app works without any of them in development.

```env
# Override the base URL (defaults to https://asciitree.fr)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Google Analytics 4 (production only)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager (production only)
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Hotjar (production only)
NEXT_PUBLIC_HOTJAR_ID=0000000
NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION=6

# Matomo — privacy-focused analytics alternative (production only)
NEXT_PUBLIC_MATOMO_URL=https://your-matomo.com
NEXT_PUBLIC_MATOMO_SITE_ID=1

#UMAMI
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
```

Create a `.env.local` file at the root and add any variables you need.

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/             # Localized routes (fr | en | it | es | de | pt | ru | ja)
│   │   ├── page.tsx          # Landing page
│   │   ├── tools/            # One route per tool
│   │   │   ├── ascii-tree/
│   │   │   ├── ascii-table/
│   │   │   ├── sparkline/
│   │   │   ├── banner/
│   │   │   ├── markdown-guide/
│   │   │   └── ascii-emoji/
│   │   ├── mentions-legales/ # Legal notices
│   │   └── donnees-personnelles/ # Privacy policy
│   ├── manifest.ts           # PWA manifest
│   └── sitemap.ts            # Dynamic sitemap
│
├── components/
│   ├── generator/            # ASCII tree editor components
│   │   ├── tree-generator.tsx
│   │   ├── tree-view.tsx
│   │   ├── ascii-preview.tsx
│   │   ├── tree-options-panel.tsx
│   │   ├── tree-controls.tsx
│   │   └── drag-drop-zone.tsx
│   ├── table-generator/      # ASCII table tool
│   ├── sparkline-generator/  # ASCII charts tool
│   ├── banner-generator/     # Text banners tool
│   ├── markdown-guide/       # Markdown reference
│   ├── ascii-emoji/          # ASCII emoji catalog
│   ├── tools-nav/            # Shared layout, sidebar & header
│   └── ui/                   # shadcn/ui + custom components
│
├── lib/
│   ├── tree-generator.ts     # Core ASCII generation algorithm
│   ├── tools.ts              # Tool & resource registry (nav)
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── validation.ts         # Zod schemas
│   └── default-options.ts    # Default tree config
│
└── i18n/
    ├── locales.ts            # Supported locales
    └── locales/              # Translation files (fr, en, it, es, de, pt, ru, ja)
```

---

## Internationalization

The app supports 8 locales with URL-based routing:

| Locale | Language | URL |
|---|---|---|
| `fr` | Français (default) | `/fr/` |
| `en` | English | `/en/` |
| `it` | Italiano | `/it/` |
| `es` | Español | `/es/` |
| `de` | Deutsch | `/de/` |
| `pt` | Português | `/pt/` |
| `ru` | Русский | `/ru/` |
| `ja` | 日本語 | `/ja/` |

To add a new language, create a translation file in `src/i18n/locales/` and register the locale in `src/i18n/locales.ts`.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Key points:
- Fork the repo and create a branch from `main`
- Run `npm run lint` before submitting
- Keep PRs focused — one feature or fix per PR
- Open an issue first for significant changes

---

## Support

If you find this project useful, you can support its development:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-blackout003-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/blackout003)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-blackout003-ea4aaa?style=flat&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/blackout003)

---

## License

This project is licensed under the [GNU General Public License v3.0](./LICENSE).

You are free to use, modify, and distribute this software under the terms of the GPL v3. Any derivative work must also be released under the same license.
