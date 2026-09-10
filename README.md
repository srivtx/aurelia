<div align="center">

<img src="public/icons/icon.svg" width="120" alt="Aurelia" />

# Aurelia

Beauty advice with a mechanism, not a moodboard. A browser-only style &amp; beauty app — seasonal color analysis, outfit scoring, shade and oxidation verdicts, label scanning — all computed on-device by real color-science engines. No accounts, no uploads, no tracking.

[![Stars](https://img.shields.io/github/stars/srivtx/aurelia?style=flat&logo=github&label=Stars&color=181717)](https://github.com/srivtx/aurelia/stargazers)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-8B5CF6?style=flat)](./README.md#license)
[![PWA](https://img.shields.io/badge/PWA-installable_%C2%B7_offline-5A0FC8?style=flat&logo=pwa&logoColor=white)](./docs/RESEARCH-PWA-LAUNCH.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Features](#features) · [The Mirror Test](#the-mirror-test) · [Deploy](#deploy) · [Docs](#documentation) · [Contributing](#contributing)

</div>

---

## Features

- **Colors** — a 19-color matching engine (what pairs with what and why), 15 curated outfit palettes, an undertone finder, and color-theory basics.
- **The Color Lab** — real color science, computed on-device:
  - **12-Season Color Analysis** — a 7-question diagnostic mapped to a warmth × depth × chroma × contrast vector, classified against 12 season archetypes; yields a personal palette, metals, makeup direction, and wardrobe ratings.
  - **Outfit Lab** — scores any 2–4 colors via CIELCh hue geometry, lightness spread (WCAG-style contrast), chroma coherence, warmth coherence, and personal-season fit (ΔE2000), then suggests 60-30-10 roles — and with 3+ colors, the **Diagnosis** card: leave-one-out per-item contribution (who carries the outfit, who weakens it) plus a one-tap best-swap with a predicted score (node-wise diagnosis in the spirit of Balim 2023, on our deterministic engine).
  - **Photo → Palette** — k-means clustering in CIELAB space over a downscaled canvas — dominant-color extraction that never leaves the device.
  - **Skin Signature** — dermatology-grade colorimetry from one selfie: white-point (von-Kries) calibration against a reference patch, CIELAB averaging, **ITA°** depth classification, hue-angle undertone and chroma — the measured replacement for the folklore undertone quiz. Feeds the Shade Lab, the passport, and season evidence.
  - **Shade Lab** — foundation/blush/lip verdicts from a Lab-space blend model (arXiv 2024 lineage): predicted on-skin color, ΔE2000 visibility, shade-step depth deltas, undertone congruence and ashy-cast warnings — "how it will look on YOU" without AR — plus the **oxidation verdict (Mirror Test V2)**: her measured sebum profile × the shade's warm lean × product family → a 0–100 risk score, a **one-hour simulation** (fresh vs darker/warmer drift swatches), ranked drivers with the sebum-×-iron-oxide chemistry, and a one-tap counter-move that loads a swatch into the lab.
- **Makeup** — five occasion looks with step-by-step instructions, the 12-step application order, face/eye/lip 101 guides, common mistakes, tool care — and the **Glow Delta**: before/after selfies, independently white-point corrected, measured per region with **ΔE2000** (Kim 2023 lineage) — luminance lift, redness shift, evenness change, shareable outcome card. It measures change, never "beauty".
- **Skincare** — a 10-question skin-type quiz, a daily AM/PM routine checklist, an ingredient dictionary, mixing rules, and the **Ingredient Lab**: an evidence-based conflict/synergy matrix with an AM/PM routine sequencer (pH-ordered, thin→thick, SPF last). Plus the **Skin Journal** — the closed beauty loop's retention engine: a weekly calibrated selfie → per-zone redness (a\*), evenness (ΔE dispersion), texture (edge energy) and **gloss** (specular fraction — the selfie hydration proxy of Soh 2025, honestly labeled "estimate, not a corneometer") → trend sparklines, regression slopes, and milestones wired to the actives you tag ("cheek redness ↓ 28% while on niacinamide"). Trends, never diagnosis.
- **The Shelf (Mirror Test V4)** — every scanned or added product joins an offline inventory with a **PAO countdown** per category (EU 1223/2009 conventions), **near-duplicate detection** (swatch ΔE2000 < 5 within the same category, plus same-active twins), and cost-per-use — exported with the Beauty Passport.
- **Label Scanner (Mirror Test V3)** — photograph any INCI list: on-device OCR via a lazy-loaded Tesseract.js worker (upscaled + contrast-stretched), noise-tolerant fuzzy matching, and every verdict crossed against *your* saved routine — conflicts classified "with your routine" vs "inside this product", plus fragrance/alcohol/essential-oil flags, an oxidation formula read, and one-tap save-to-Shelf. Paste-the-list fallback always available; the photo is never uploaded.
- **Hair** — hairstyles matched to eight outfit categories, ten master styles, face-shape guides, the **Face Meter** — an anthropometric ratio classifier with a live-morphing SVG face preview — and the **Texture Lab**: photograph a section of hair, tap two strand patches, and a pure-CV fiber-geometry engine (orientation coherence, ridge frequency, edge density) classifies your curl pattern on the 10-class scale (Callender 2026 lineage), then unlocks texture-specific care. Geometry measures texture, never "good hair".
- **Ask Aurelia** — an AI stylist chat with token-by-token streaming, markdown-rendered replies, and knowledge-grounded answers (RAG over the app's own content). The provider is a **server-side operator decision** via env vars — Groq, Google Gemini, OpenRouter, Cerebras, Mistral, or a local LLM (Ollama/LM Studio) — and the built-in cloud model is the always-on fallback. Users never see a provider.
- **Agent-ready (WebMCP)** — the color-science, season, routine, conflict, and search engines are registered as read-only MCP tools (`document.modelContext`), so a browser AI agent can call `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge`, and `compare_colors` directly against the live page.
- **Share-to-Analyze** — on Android, share any image from anywhere into Aurelia (installed PWA) and the on-device palette analyzer runs on it; on desktop, "Open with Aurelia" via file handlers. Nothing is uploaded, ever.
- **Beauty Passport** — your profile (season, skin type, vibe, journal summary) as a portable JSON file you own: export, share, import on another device.

Also: global search across all content, a three-step onboarding flow that personalizes the home screen, saved favorites, shareable tip and palette cards, glow streak with home-screen badge, storage persistence, dark mode, and deep-linkable hash routes.

**The closed beauty loop** — MEASURE (selfie colorimetry) → ADVISE (season, routine, outfit, stylist engines) → RE-MEASURE (glow delta, weekly journal) → ADAPT (milestones wired to your actives). Every measurement is on-device, white-reference calibrated, and paper-grounded ([docs/RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md)).

## The Mirror Test

The product-decision engine for "will this product work for **me**?" — all four verdicts are live:

| Verdict | What it does |
| --- | --- |
| **V1 · Skin Signature** | Calibrated selfie colorimetry — depth, undertone, chroma, season evidence |
| **V2 · Oxidation Risk** | Sebum × warm lean × formula chemistry → 0–100 risk + one-hour drift simulation |
| **V3 · Label Scanner** | INCI OCR crossed against her own routine — conflicts, flags, oxidation reads |
| **V4 · The Shelf** | PAO countdowns + ΔE2000 duplicate radar, running offline on her measured data |

Scan a product, save it to the shelf, and the countdown and duplicate checks run offline against her own measured data — see [docs/RESEARCH-UNIQUE-PROBLEM.md](docs/RESEARCH-UNIQUE-PROBLEM.md).

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- TypeScript (strict)
- Tailwind CSS 4 with a custom token system
- Framer Motion
- Zustand (persisted, hydration-safe)
- Pure-TS color engine: sRGB ↔ CIE XYZ ↔ CIELAB/CIELCh, CIEDE2000, WCAG contrast
- Tesseract.js OCR (lazy worker, on-device)
- Service worker app-shell caching, custom SVG illustrations — no external image assets

## Getting Started

Prerequisites: Node.js 20+ (or Bun 1.1+). No database, no API keys, no config.

```bash
git clone https://github.com/srivtx/aurelia.git
cd aurelia

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works at full functionality out of the box, including the AI stylist (built-in provider).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

Optional verification suites (Playwright, installed globally):

```bash
node scripts/hydration-verify.mjs       # hydration under non-UTC timezone with persisted state — 0 errors expected
bun scripts/test-engines.ts             # pure-engine math suite — 191/191
node scripts/check-providers.mjs        # operator: which provider the env resolves to
```

Full e2e battery (needs the dev server on `:3000`): `e2e-new-features`, `e2e-deep-tech`, `e2e-chat-fixes`, `e2e-closed-loop`, `e2e-texture-diagnosis`, `e2e-scanner`, `e2e-shelf-oxidation`.

## Deploy

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Faurelia&project-name=aurelia&repository-name=aurelia)

</div>

1. Import the repo at [vercel.com/new](https://vercel.com/new) — framework auto-detects as Next.js, no build settings needed
2. Deploy with zero environment variables — the built-in stylist works immediately
3. Optional: add a free provider key (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `MISTRAL_API_KEY`) — server-side only; priority order groq → gemini → openrouter → cerebras → mistral → custom, with silent fallback to the built-in model so the chat never goes down

Keys live only in server env — never mark a var for client exposure. Docker/VPS self-hosting, rollback, troubleshooting, and the full post-deploy checklist live in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). GitHub Pages is not supported (the app has API routes).

## Documentation

Everything a contributor needs is preserved in [`docs/`](docs/):

| Document | What it holds |
| --- | --- |
| [CONTEXT.md](docs/CONTEXT.md) | Start here — full codebase map, design-token rules, hydration guardrails, engine reference, how to add features |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Complete deployment guide — agent brief, env contract, free-model setup, GitHub → Vercel flow, Docker/VPS, rollback |
| [RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md) | Every paper the engines are grounded in |
| [RESEARCH-UNIQUE-PROBLEM.md](docs/RESEARCH-UNIQUE-PROBLEM.md) | The Mirror Test product thesis |
| [RESEARCH-COMPLIANCE.md](docs/RESEARCH-COMPLIANCE.md) | Regulatory and claims safety — GDPR, EU AI Act, MoCRA, FTC, claims-language matrix |
| [RESEARCH-GROWTH.md](docs/RESEARCH-GROWTH.md) | Distribution and monetization strategy |
| [RESEARCH-CYCLE-SCIENCE.md](docs/RESEARCH-CYCLE-SCIENCE.md) | Temporal/context skin science with honest strength verdicts |
| [RESEARCH-DEEPTECH.md](docs/RESEARCH-DEEPTECH.md) | WebMCP deep-dive, free-LLM provider matrix, ranked deep-tech roadmap |
| [RESEARCH-NEXT-TECH.md](docs/RESEARCH-NEXT-TECH.md) | The next layer — AR mirror, on-device stylist, WebGPU color lab |
| [RESEARCH-PWA-LAUNCH.md](docs/RESEARCH-PWA-LAUNCH.md) | PWA launch checklist and benchmarks |
| [RESEARCH-BEAUTY-APP-UX.md](docs/RESEARCH-BEAUTY-APP-UX.md) | Competitor benchmark and feature-gap analysis |
| [DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) | Design language and motion rules |

Content knowledge bases: [Colors](docs/COLOR_COMBINATION_KNOWLEDGE_BASE.md) · [Makeup](docs/MAKEUP_KNOWLEDGE_BASE.md) · [Skincare](docs/SKINCARE_KNOWLEDGE_BASE.md). Also kept: [`worklog.md`](worklog.md) — the append-only build log of every task and verification run.

## Project Structure

```
src/
  app/                        # root layout, tab router, error boundaries,
                              # /api/stylist (server-side multi-provider streaming + RAG)
  components/aurelia/         # shell, UI primitives, icons, illustrations, onboarding,
                              # stylist chat, season analysis, outfit lab, photo analyzer,
                              # ingredient lab, skin signature, shade lab, glow delta,
                              # skin journal, scanner lab, shelf, face meter, curl lab,
                              # beauty passport, platform bridge (WebMCP/share-target)
  components/aurelia/tabs/    # home, colors, makeup, skin, hair
  data/                       # content knowledge bases (colors, seasons, actives, INCI, PAO)
  lib/                        # store, color-science + outfit + routine engines, RAG grounding,
                              # provider registry, WebMCP tools, passport, classifiers
public/                       # manifest (share_target, file_handlers), service worker, icons
docs/                         # research + context + deployment guides
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Read [`docs/CONTEXT.md`](docs/CONTEXT.md) first — it documents the design-token rules, hydration guardrails, and engine conventions this codebase runs on.

## License

All rights reserved. © 2026 srivtx.
