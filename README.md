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
  - **Skin Signature** — dermatology-grade colorimetry from one selfie: white-point (von-Kries) calibration against a reference patch, CIELAB averaging, **ITA°** depth classification, hue-angle undertone and chroma — the measured replacement for the folklore undertone quiz. Feeds the Shade Lab, the passport and season evidence.
  - **Shade Lab** — foundation/blush/lip verdicts from a Lab-space blend model (arXiv 2024 lineage): predicted on-skin color, ΔE2000 visibility, shade-step depth deltas, undertone congruence, oxidation risk and ashy-cast warnings — “how it will look on YOU” without AR.
- **Makeup** — five occasion looks with step-by-step instructions, the 12-step application order, face/eye/lip 101 guides, common mistakes, tool care — and the **Glow Delta**: before/after selfies, independently white-point corrected, measured per region with **ΔE2000** (Kim 2023 lineage) — luminance lift, redness shift, evenness change, shareable outcome card. It measures *change*, never “beauty”.
- **Skincare** — a 10-question skin-type quiz, a daily AM/PM routine checklist, an ingredient dictionary, mixing rules, the **Ingredient Lab** (an evidence-based conflict/synergy matrix with an AM/PM routine sequencer, pH-ordered, thin→thick, SPF last) — and the **Skin Journal**, the closed beauty loop’s retention engine: a weekly calibrated selfie → per-zone redness (a\*), evenness (ΔE dispersion) and texture (edge energy) → trend sparklines, regression slopes and milestones wired to the actives you tag (“cheek redness ↓ 28% while on niacinamide”). Trends, never diagnosis.
- **Hair** — hairstyles matched to eight outfit categories, ten master styles, face-shape guides, and the **Face Meter** — an anthropometric ratio classifier (length/cheekbone, forehead and jaw taper) with a live-morphing SVG face preview.
- **Ask Aurelia** — an AI stylist chat with **token-by-token streaming**, markdown-rendered replies, and knowledge-grounded answers (RAG over the app's own content). The model behind her is a **server-side decision**: operators plug in a free key from Groq, Google Gemini, OpenRouter, Cerebras, Mistral, or a local LLM (Ollama/LM Studio) via env vars — users never see or choose a provider, and the built-in cloud model is the always-on fallback.
- **Agent-ready (WebMCP)** — the color-science, season, routine, conflict and search engines are registered as **read-only MCP tools** (`document.modelContext`), so your browser/desktop AI agent (ChatGPT site tools, Chrome/Edge trials) can call `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge` and `compare_colors` directly against the live page.
- **Share-to-Analyze** — on Android, share any image from anywhere into Aurelia (installed PWA) and the on-device palette analyzer runs on it; on desktop, "Open with Aurelia" via file handlers. Nothing is uploaded, ever.
- **Beauty Passport** — your profile (season, skin type, vibe, journal summary) as a portable JSON file you own: export, share, import on another device.

App-level features: global search across all content including the tools, a three-step onboarding flow that personalizes the home screen, saved favorites, shareable tip and palette cards, glow streak with home-screen badge, storage persistence, dark mode, and deep-linkable hash routes.

**The closed beauty loop** — MEASURE (selfie colorimetry) → ADVISE (season, routine, outfit, stylist engines) → RE-MEASURE (glow delta, weekly journal) → ADAPT (milestones wired to your actives). Every measurement is on-device, white-reference calibrated, and paper-grounded ([docs/RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md)).

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

Open http://localhost:3000. Everything works with zero configuration — including
the AI stylist (built-in provider). To plug in **free models** (Groq, Gemini,
OpenRouter, …) or a **local LLM**, see
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — it's a 2-minute, one-env-var setup.

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
node scripts/e2e-chat-fixes.mjs     # chat markdown, contrast, dark-mode tokens, provider-leak check
node scripts/e2e-closed-loop.mjs    # Glow Delta + Skin Journal flows with synthetic calibrated selfies
bun scripts/test-engines.ts        # pure-engine math: glow delta, journal zone metrics, trends
node scripts/check-providers.mjs    # operator: verify AI provider keys + server-side resolution
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

## Documentation

Everything a contributor needs is preserved in [`docs/`](docs/):

- **[docs/CONTEXT.md](docs/CONTEXT.md)** — start here: full codebase map, design-token rules (including the alias pitfall), hydration guardrails, engine reference, how to add content/features.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — free-model setup (Groq/Gemini/OpenRouter/Cerebras/Mistral/local), Vercel + Docker + self-host guides, troubleshooting.
- **[docs/RESEARCH-DEEPTECH.md](docs/RESEARCH-DEEPTECH.md)** — WebMCP spec deep-dive, free-LLM provider matrix, modern PWA APIs, ranked deep-tech roadmap.
- **[docs/RESEARCH-NEXT-TECH.md](docs/RESEARCH-NEXT-TECH.md)** — the next layer (2026-09): live AR mirror (MediaPipe FaceLandmarker), offline stylist via Chrome built-in AI, OCR ingredient scanner, WebGPU/OKLCh color lab, bandit + spaced-repetition personalization, on-device VLM.
- **[docs/RESEARCH-PWA-LAUNCH.md](docs/RESEARCH-PWA-LAUNCH.md)** — PWA launch checklist and benchmarks.
- **[docs/RESEARCH-BEAUTY-APP-UX.md](docs/RESEARCH-BEAUTY-APP-UX.md)** — competitor benchmark and feature-gap analysis.
- `worklog.md` — append-only build log of every task and verification run.

## Project Structure

```
src/
  app/                        # root layout, page (tab router), 404, error boundaries,
                              # /api/stylist (server-side multi-provider streaming + RAG)
  components/aurelia/         # shell, bottom sheet, UI primitives, icons, illustrations,
                              # onboarding, search overlay, stylist chat (streaming —
                              # provider invisible to users), markdown renderer,
                              # platform bridge (WebMCP/badge/share-target), season analysis,
                              # outfit lab, photo analyzer, ingredient lab, face meter,
                              # beauty passport
  components/aurelia/tabs/    # home, colors, makeup, skin, hair
  data/                       # content knowledge base (colors, makeup, skincare, hair,
                              # tips, 12 seasons, active ingredients)
  lib/                        # zustand store, search index, share utilities, RAG grounding,
                              # AI provider registry, WebMCP tools, passport, share inbox,
                              # color-science engine, outfit engine, palette extraction
                              # (k-means), routine sequencer, face-shape classifier
public/                       # manifest (share_target, file_handlers), service worker,
                              # icons, splash screens, og image
docs/                         # research + context + deployment guides
```

## License

All rights reserved.
