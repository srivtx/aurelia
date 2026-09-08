<p align="center">
  <img src="public/icons/icon.svg" width="88" alt="Aurelia logo" />
</p>

<h1 align="center">Aurelia</h1>

<p align="center">A mobile-first PWA for style and beauty tips: color combinations, makeup basics, skincare, and hairstyles — in one app.</p>

---

## Overview

Aurelia is an installable, offline-capable Progressive Web App built with Next.js. It consolidates four content modules behind a five-tab mobile shell — and adds a computational layer that most tip apps fake:

- **Colors** — a 19-color matching engine (what pairs with what and why), 15 curated outfit palettes, an undertone finder, and color-theory basics.
- **The Color Lab** — real color science, computed on-device:
  - **12-Season Color Analysis** — a 7-question diagnostic mapped to a warmth × depth × chroma × contrast vector, classified against 12 season archetypes; yields a personal palette, metals, makeup direction, and wardrobe ratings.
  - **Outfit Lab** — scores any 2–4 colors via CIELCh hue geometry, lightness spread (WCAG-style contrast), chroma coherence, warmth coherence and personal-season fit (ΔE2000), then suggests 60-30-10 roles.
  - **Photo → Palette** — k-means clustering in CIELAB space over a downscaled canvas — dominant-color extraction that never leaves the device.
- **Makeup** — five occasion looks with step-by-step instructions, the 12-step application order, face/eye/lip 101 guides, common mistakes, and tool care.
- **Skincare** — a 10-question skin-type quiz, a daily AM/PM routine checklist, an ingredient dictionary, mixing rules, and the **Ingredient Lab** — an evidence-based conflict/synergy matrix with an AM/PM routine sequencer (pH-ordered, thin→thick, SPF last).
- **Hair** — hairstyles matched to eight outfit categories, ten master styles, face-shape guides, and the **Face Meter** — an anthropometric ratio classifier (length/cheekbone, forehead and jaw taper) with a live-morphing SVG face preview.
- **Ask Aurelia** — an AI stylist chat (server-side LLM) grounded in the app's knowledge base and personalized with your season, skin type, and vibe.

App-level features: global search across all content including the tools, a three-step onboarding flow that personalizes the home screen, saved favorites, shareable tip and palette cards, dark mode, and deep-linkable hash routes.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS 4 (custom token system)
- Framer Motion
- Zustand (persisted state, hydration-safe)
- Service worker for offline support
- Custom SVG illustrations and icons (no external image assets)
- Pure-TS color engine: sRGB ↔ CIE XYZ ↔ CIELAB/CIELCh, CIEDE2000, WCAG contrast

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
node scripts/e2e-deep-tech.mjs      # Color Lab, Ingredient Lab, Face Meter, AI stylist + hydration watch
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
  app/                        # root layout, page (tab router), 404, error boundaries, /api/stylist
  components/aurelia/         # shell, bottom sheet, UI primitives, icons, illustrations,
                              # onboarding, search overlay, stylist chat, season analysis,
                              # outfit lab, photo analyzer, ingredient lab, face meter
  components/aurelia/tabs/    # home, colors, makeup, skin, hair
  data/                       # content knowledge base (colors, makeup, skincare, hair,
                              # tips, 12 seasons, active ingredients)
  lib/                        # zustand store, search index, share utilities,
                              # color-science engine, outfit engine, palette extraction
                              # (k-means), routine sequencer, face-shape classifier
public/                       # manifest, service worker, icons, splash screens, og image
docs/                         # research and design briefs
```

## License

All rights reserved.
