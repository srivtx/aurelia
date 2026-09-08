<p align="center">
  <img src="public/icons/icon.svg" width="88" alt="Aurelia logo" />
</p>

<h1 align="center">Aurelia</h1>

<p align="center">A mobile-first PWA for style and beauty tips: color combinations, makeup basics, skincare, and hairstyles — in one app.</p>

---

## Overview

Aurelia is an installable, offline-capable Progressive Web App built with Next.js. It consolidates four content modules behind a five-tab mobile shell:

- **Colors** — a 19-color matching engine (what pairs with what and why), 15 curated outfit palettes, an undertone finder, and color-theory basics.
- **Makeup** — five occasion looks with step-by-step instructions, the 12-step application order, face/eye/lip 101 guides, common mistakes, and tool care.
- **Skincare** — a 10-question skin-type quiz (oily, dry, combination, normal, sensitive), a daily AM/PM routine checklist, an ingredient dictionary, and mixing rules.
- **Hair** — hairstyles matched to eight outfit categories, ten master styles with instructions, and face-shape guides.

App-level features: global search across all content, a three-step onboarding flow that personalizes the home screen, saved favorites, shareable tip and palette cards, dark mode, and deep-linkable hash routes.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS 4 (custom token system)
- Framer Motion
- Zustand (persisted state, hydration-safe)
- Service worker for offline support
- Custom SVG illustrations and icons (no external image assets)

## Getting Started

Requirements: Node.js 20+ (or Bun 1.1+) and npm/pnpm/bun.

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

Optional verification scripts (Playwright, installed globally):

```bash
node scripts/hydration-verify.mjs   # hydration check under a non-UTC timezone with persisted state
node scripts/e2e-new-features.mjs   # end-to-end pass over onboarding, search, routing, 404
```

## Deployment

### Vercel

1. Push this repository to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Vercel detects Next.js automatically — no configuration needed.
4. Deploy.

Or from the CLI:

```bash
npx vercel
```

### Self-hosted

```bash
npm run build
npm run start   # serves on port 3000, configurable via PORT
```

Any Node.js host or container works. The app is fully static at the root route and has no database dependency in its default configuration.

## PWA Notes

- `public/manifest.json` — app metadata, icons, shortcuts, and screenshots.
- `public/sw.js` — service worker with app-shell caching and an in-app update prompt.
- iOS splash screens are provided for common device sizes in `public/icons/`.

## Project Structure

```
src/
  app/                        # root layout, page (tab router), 404, error boundaries
  components/aurelia/         # shell, bottom sheet, UI primitives, icons, illustrations,
                              # onboarding, search overlay
  components/aurelia/tabs/    # home, colors, makeup, skin, hair
  data/                       # content knowledge base (colors, makeup, skincare, hair, tips)
  lib/                        # zustand store, search index, share utilities
public/                       # manifest, service worker, icons, splash screens, og image
docs/                         # research and design briefs
```

## License

All rights reserved.
