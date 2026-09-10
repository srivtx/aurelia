<div align="center">

<img src="public/icons/icon.svg" width="120" alt="Aurelia" />

# Aurelia

**Beauty advice with a mechanism, not a moodboard.**

A mobile-first, offline-capable PWA for style and beauty — color science, a computational Mirror Test for "will this work for *me*?", skincare and makeup engines, and an AI stylist that measures instead of guessing.

[![Stars](https://img.shields.io/github/stars/srivtx/aurelia?style=flat&logo=github&label=Stars&color=181717)](https://github.com/srivtx/aurelia/stargazers)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-8B5CF6?style=flat)](./README.md#-license)
[![PWA](https://img.shields.io/badge/PWA-installable_%C2%B7_offline-5A0FC8?style=flat&logo=pwa&logoColor=white)](./docs/RESEARCH-PWA-LAUNCH.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Features](#-features) · [The Mirror Test](#-the-mirror-test) · [Deploy](#-deploy) · [Docs](#-documentation) · [Contributing](#-contributing)

</div>

---

## ✨ Features

- **Colors** — a 19-color matching engine (what pairs with what and why), 15 curated outfit palettes, an undertone finder, and color-theory basics.
- **The Color Lab** — real color science, computed on-device:
  - **12-Season Color Analysis** — a 7-question diagnostic mapped to a warmth × depth × chroma × contrast vector, classified against 12 season archetypes; yields a personal palette, metals, makeup direction, and wardrobe ratings.
  - **Outfit Lab** — scores any 2–4 colors via CIELCh hue geometry, lightness spread (WCAG-style contrast), chroma coherence, warmth coherence and personal-season fit (ΔE2000), then suggests 60-30-10 roles — and with 3+ colors, the **Diagnosis** card: leave-one-out per-item contribution (who carries the outfit, who weakens it) plus a one-tap best-swap with a predicted score (node-wise diagnosis in the spirit of Balim 2023, on our deterministic engine).
  - **Photo → Palette** — k-means clustering in CIELAB space over a downscaled canvas — dominant-color extraction that never leaves the device.
  - **Skin Signature** — white-point (von-Kries) calibrated colorimetry from one selfie: CIELAB averaging, **ITA°** depth classification, hue-angle undertone and chroma — the measured replacement for the folklore undertone quiz. Feeds the Shade Lab, the passport and season evidence.
  - **Shade Lab** — foundation/blush/lip verdicts from a Lab-space blend model (arXiv 2024 lineage): predicted on-skin color, ΔE2000 visibility, shade-step depth deltas, undertone congruence and ashy-cast warnings — "how it will look on YOU" without AR — plus the **oxidation verdict**: measured sebum profile × the shade's warm lean × product family → a 0–100 risk score, a one-hour drift simulation, ranked drivers, and a one-tap counter-move.
- **Makeup** — five occasion looks, the 12-step application order, face/eye/lip 101 guides, and the **Glow Delta**: before/after selfies, independently white-point corrected, measured per region with **ΔE2000** (Kim 2023 lineage) — luminance lift, redness shift, evenness change, shareable outcome card. It measures *change*, never "beauty".
- **Skincare** — skin-type quiz, AM/PM routine checklist, ingredient dictionary, and the **Ingredient Lab** (evidence-based conflict/synergy matrix, AM/PM sequencer, pH-ordered, thin→thick, SPF last). Plus the **Skin Journal** — weekly calibrated selfies → per-zone redness, evenness, texture and gloss → trend sparklines wired to the actives you tag ("cheek redness ↓ 28% while on niacinamide"). Trends, never diagnosis.
- **The Shelf** — every scanned or added product joins an offline inventory with **PAO countdowns**, **near-duplicate detection** (ΔE2000 < 5 swatch radar + same-active twins), and cost-per-use — exported with the Beauty Passport.
- **Label Scanner** — photograph any INCI list: on-device OCR (Tesseract.js worker), noise-tolerant fuzzy matching, every verdict crossed against your saved routine, fragrance/alcohol flags, oxidation-formula reads, and one-tap save-to-Shelf. Paste-the-list fallback always available; the photo is never uploaded.
- **Hair** — hairstyles matched to outfit categories, face-shape guides via the **Face Meter** (anthropometric ratios with a live-morphing SVG preview), and the **Texture Lab**: pure-CV fiber geometry (orientation coherence, ridge frequency, edge density) classifies curl on the 10-class scale (Callender 2026 lineage) and unlocks texture-specific care. Geometry measures *texture*, never "good hair".
- **Ask Aurelia** — an AI stylist chat with token-by-token streaming, markdown rendering, and RAG over the app's own content. Providers are an **operator choice** via env vars (Groq, Gemini, OpenRouter, Cerebras, Mistral, or a local LLM) — users see none of it, and the built-in cloud model is the always-on fallback.
- **Agent-ready (WebMCP)** — the color, season, routine, conflict and search engines are registered as read-only **MCP tools** (`document.modelContext`), so an AI agent can call `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge`, `compare_colors` against the live page.
- **Share-to-Analyze** — share any image from anywhere (Android share target; desktop file handlers) and the on-device palette analyzer runs on it. Nothing is uploaded, ever.
- **Beauty Passport** — your profile (season, skin type, vibe, journal summary) as a portable JSON you own: export, share, import elsewhere.

Also: global search across all content, a three-step onboarding that personalizes the home screen, favorites, shareable tip/palette cards, glow streak, storage persistence, dark mode, deep-linkable hash routes.

**The closed beauty loop** — MEASURE (selfie colorimetry) → ADVISE (season, routine, outfit, stylist engines) → RE-MEASURE (glow delta, weekly journal) → ADAPT (milestones wired to your actives). Every measurement is on-device, white-reference calibrated, and paper-grounded ([docs/RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md)).

## 👑 The Mirror Test

The product-decision engine for "will this product work for **me**?" — all four verdicts are live:

| Verdict | What it does |
|---|---|
| **V1 · Skin Signature** | Calibrated selfie colorimetry — depth, undertone, chroma, season evidence |
| **V2 · Oxidation Risk** | Sebum × warm lean × formula chemistry → 0–100 risk + one-hour drift simulation |
| **V3 · Label Scanner** | INCI OCR crossed against her own routine — conflicts, flags, oxidation reads |
| **V4 · The Shelf** | PAO countdowns + ΔE2000 duplicate radar, running offline on her measured data |

Scan a product, save it to the shelf, and the countdown + duplicate checks run against her own measured data — see [docs/RESEARCH-UNIQUE-PROBLEM.md](docs/RESEARCH-UNIQUE-PROBLEM.md).

## 🧱 Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS 4 + Framer Motion (custom token system)
- Zustand (persisted, hydration-safe)
- Pure-TS color engine: sRGB ↔ CIE XYZ ↔ CIELAB/CIELCh, CIEDE2000, WCAG contrast
- Tesseract.js OCR (lazy worker), service worker app-shell caching
- Custom SVG illustrations — no external image assets

## 🏁 Getting Started

**Prerequisites:** Node.js 20+ (or Bun 1.1+)

```bash
git clone https://github.com/srivtx/aurelia.git
cd aurelia

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — fully working with zero configuration, including the AI stylist (built-in provider). To plug in **free models** (Groq, Gemini, OpenRouter, …) or a **local LLM**, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

**Optional verification suites** (Playwright, installed globally):

```bash
node scripts/hydration-verify.mjs   # hydration under non-UTC timezone with persisted state
node scripts/e2e-new-features.mjs   # onboarding, search, routing, 404
node scripts/e2e-deep-tech.mjs      # Color Lab, Ingredient Lab, Face Meter, AI stylist + hydration
node scripts/e2e-chat-fixes.mjs     # chat markdown, contrast, dark-mode tokens, provider-leak check
node scripts/e2e-closed-loop.mjs    # Glow Delta + Skin Journal with synthetic calibrated selfies
```

## 🚀 Deploy

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Faurelia&project-name=aurelia&repository-name=aurelia)

</div>

1. Clone or fork this repo, import it at [vercel.com/new](https://vercel.com/new)
2. Deploy with defaults — works with zero env vars (built-in stylist)
3. Optional: add any free provider key (`GROQ_API_KEY`, `GOOGLE_API_KEY`, …) — see the priority order and full guide in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

Docker/VPS self-hosting, post-deploy checklist, rollback and troubleshooting are all covered in the deployment guide.

## 📚 Documentation

Everything a contributor needs is preserved in [`docs/`](docs/):

| Document | What it holds |
|---|---|
| [CONTEXT.md](docs/CONTEXT.md) | **Start here** — full codebase map, design-token rules, hydration guardrails, engine reference, how to add features |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Complete deployment guide — agent brief, env contract, free-model setup, GitHub→Vercel flow, Docker/VPS, rollback |
| [RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md) | Every paper the engines are grounded in |
| [RESEARCH-UNIQUE-PROBLEM.md](docs/RESEARCH-UNIQUE-PROBLEM.md) | The Mirror Test product thesis |
| [RESEARCH-COMPLIANCE.md](docs/RESEARCH-COMPLIANCE.md) | Regulatory/claims safety — GDPR, EU AI Act, MoCRA, FTC, claims-language matrix |
| [RESEARCH-GROWTH.md](docs/RESEARCH-GROWTH.md) | Distribution & monetization strategy |
| [RESEARCH-CYCLE-SCIENCE.md](docs/RESEARCH-CYCLE-SCIENCE.md) | Temporal/context skin science with honest strength verdicts |
| [RESEARCH-DEEPTECH.md](docs/RESEARCH-DEEPTECH.md) | WebMCP deep-dive, provider matrix, ranked deep-tech roadmap |
| [RESEARCH-NEXT-TECH.md](docs/RESEARCH-NEXT-TECH.md) | The next layer — AR mirror, on-device stylist, WebGPU color lab |
| [RESEARCH-PWA-LAUNCH.md](docs/RESEARCH-PWA-LAUNCH.md) | PWA launch checklist and benchmarks |
| [RESEARCH-BEAUTY-APP-UX.md](docs/RESEARCH-BEAUTY-APP-UX.md) | Competitor benchmark and feature-gap analysis |
| [DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) | Design language and motion rules |
| Knowledge bases | [Colors](docs/COLOR_COMBINATION_KNOWLEDGE_BASE.md) · [Makeup](docs/MAKEUP_KNOWLEDGE_BASE.md) · [Skincare](docs/SKINCARE_KNOWLEDGE_BASE.md) |

Also kept: [`worklog.md`](worklog.md) — the append-only build log of every task and verification run.

## 📁 Project Structure

```
src/
  app/                        # root layout, tab router, 404, error boundaries,
                              # /api/stylist (server-side multi-provider streaming + RAG)
  components/aurelia/         # shell, UI primitives, icons, illustrations, onboarding,
                              # search overlay, stylist chat (provider invisible),
                              # markdown renderer, platform bridge (WebMCP/badge/share-target),
                              # season analysis, outfit lab, photo analyzer, ingredient lab,
                              # face meter, skin signature, shade lab, glow delta,
                              # skin journal, scanner lab, shelf, beauty passport
  components/aurelia/tabs/    # home, colors, makeup, skin, hair
  data/                       # content knowledge bases
  lib/                        # store, search, RAG grounding, provider registry,
                              # WebMCP tools, passport, color-science + outfit engines,
                              # palette extraction, routine sequencer, classifiers
public/                       # manifest (share_target, file_handlers), service worker, icons
docs/                         # research + context + deployment guides
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Read [`docs/CONTEXT.md`](docs/CONTEXT.md) first — it documents the design-token rules, hydration guardrails and engine conventions this codebase runs on.

## 📄 License

All rights reserved. © 2026 srivtx.
