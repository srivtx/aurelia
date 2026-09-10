<div align="center">

<img src="public/icons/icon.svg" width="120" alt="Aurelia" />

# Aurelia

Beauty advice with a mechanism, not a moodboard. Seasonal color analysis, outfit scoring, shade and oxidation verdicts, label scanning — all computed on-device by real color-science engines. No accounts, no uploads, no tracking.

[![Stars](https://img.shields.io/github/stars/srivtx/aurelia?style=flat&logo=github&label=Stars&color=181717)](https://github.com/srivtx/aurelia/stargazers)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-8B5CF6?style=flat)](./README.md#license)
[![PWA](https://img.shields.io/badge/PWA-installable_%C2%B7_offline-5A0FC8?style=flat&logo=pwa&logoColor=white)](./docs/RESEARCH-PWA-LAUNCH.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Features](#features) · [The Mirror Test](#the-mirror-test) · [Deploy](#deploy) · [Full Docs](docs/README-EXTENDED.md)

</div>

---

## Why Aurelia

Every beauty app gives tips. Aurelia computes answers from measurements taken on your own device — calibrated selfie colorimetry (CIELAB, ΔE2000), paper-grounded engines with named mechanisms, and a privacy model with nothing to leak: your photos, your profile, and your shelf never leave the browser.

The flagship is the **Mirror Test** — the product-decision engine for "will this product work for me?":

| Verdict | What it does |
| --- | --- |
| **V1 · Skin Signature** | Calibrated selfie colorimetry — depth, undertone, chroma, season evidence |
| **V2 · Oxidation Risk** | Sebum × warm lean × formula chemistry → 0–100 risk + one-hour drift simulation |
| **V3 · Label Scanner** | INCI OCR crossed against your routine — conflicts, flags, oxidation reads |
| **V4 · The Shelf** | PAO countdowns + ΔE2000 duplicate radar, running offline on your measured data |

Scan a product, save it to the shelf, and the countdown and duplicate checks run offline against your own measured data.

## Features

- **Colors & Outfit Lab** — 19-color matching engine, 15 curated palettes, undertone finder; the Outfit Lab scores any color mix via CIELCh hue geometry, WCAG-style contrast, and your personal season fit (ΔE2000), with 60-30-10 roles and a leave-one-out diagnosis showing which piece carries or weakens the outfit.
- **12-Season Analysis** — a 7-question diagnostic → personal palette, metals, makeup direction, and wardrobe ratings against 12 season archetypes.
- **Skin Signature & Shade Lab** — white-point calibrated selfie colorimetry (ITA° depth, hue-angle undertone) feeding foundation/blush/lip verdicts: predicted on-skin color, ΔE2000 visibility, ashy-cast warnings, and the oxidation verdict with a one-hour drift simulation and a one-tap counter-move.
- **Makeup** — 5 occasion looks, the 12-step application order, and the **Glow Delta**: before/after selfies measured per region — luminance lift, redness shift, evenness change. It measures change, never "beauty".
- **Skincare & Label Scanner** — evidence-based conflict/synergy matrix with an AM/PM routine sequencer (pH-ordered, thin→thick, SPF last); photograph any INCI list and the verdict crosses against your saved routine, with a paste-the-list fallback. The photo is never uploaded.
- **Skin Journal & The Shelf** — weekly calibrated selfies → trend sparklines wired to the actives you tag ("cheek redness ↓ 28% while on niacinamide"); offline product inventory with PAO countdowns, near-duplicate radar (ΔE2000 < 5), and cost-per-use.
- **Hair** — the Face Meter (anthropometric ratios, live-morphing SVG preview) and the Texture Lab: a pure-CV fiber-geometry engine classifying curl on the 10-class scale, unlocking texture-specific care.
- **Ask Aurelia** — an AI stylist chat with token-by-token streaming, grounded by RAG over the app's own content. The provider is a server-side operator decision (Groq, Gemini, OpenRouter, Cerebras, Mistral, or a local LLM) — users never see one, and the built-in model is the always-on fallback.
- **Agent-ready (WebMCP)** — the engines register as read-only MCP tools, so a browser AI agent can call `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge`, `compare_colors` against the live page.
- **Beauty Passport & Share-to-Analyze** — export your profile as portable JSON you own; share any image into the app (Android share target, desktop file handlers) and the on-device analyzer runs on it. Nothing is uploaded, ever.

**The closed beauty loop** — MEASURE (selfie colorimetry) → ADVISE (season, routine, outfit, stylist engines) → RE-MEASURE (glow delta, weekly journal) → ADAPT (milestones wired to your actives). See [docs/RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md) for the paper lineage behind every engine.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- TypeScript (strict), Zustand (persisted, hydration-safe)
- Tailwind CSS 4 (custom token system), Framer Motion
- Pure-TS color engine: sRGB ↔ CIE XYZ ↔ CIELAB/CIELCh, CIEDE2000, WCAG contrast
- Tesseract.js OCR (lazy worker, on-device), service worker app-shell caching
- Custom SVG illustrations — no external image assets

## Getting Started

Prerequisites: Node.js 20+ (or Bun 1.1+). No database, no API keys, no config.

```bash
git clone https://github.com/srivtx/aurelia.git
cd aurelia

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — fully functional out of the box, including the AI stylist.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

Verification suites live in `scripts/` — hydration check, a 191-check engine suite, and seven Playwright e2e batteries (usage in [docs/README-EXTENDED.md](docs/README-EXTENDED.md#getting-started-verified)).

## Deploy

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Faurelia&project-name=aurelia&repository-name=aurelia)

</div>

Import the repo at [vercel.com/new](https://vercel.com/new), accept the auto-detected defaults, and deploy with zero environment variables — the built-in stylist works immediately. Every push to `main` ships automatically.

Optional: add a free provider key (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `MISTRAL_API_KEY`) — server-side only, resolved in priority order with silent fallback so the chat never goes down. Keys are never exposed to the client.

GitHub Pages is not supported (the app has API routes). Docker/VPS self-hosting, rollback, troubleshooting, and the full post-deploy checklist live in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

Everything a contributor needs is preserved in [`docs/`](docs/):

| Document | What it holds |
| --- | --- |
| [README-EXTENDED.md](docs/README-EXTENDED.md) | The deep version of this README — full feature detail, verification commands, project structure |
| [CONTEXT.md](docs/CONTEXT.md) | Start here for code — codebase map, design-token rules, hydration guardrails, engine reference |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Complete deployment guide with agent brief, env contract, and post-deploy checklist |
| [RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md) | Every paper the engines are grounded in |
| [RESEARCH-UNIQUE-PROBLEM.md](docs/RESEARCH-UNIQUE-PROBLEM.md) | The Mirror Test product thesis |
| [RESEARCH-COMPLIANCE.md](docs/RESEARCH-COMPLIANCE.md) | Regulatory and claims safety — GDPR, EU AI Act, MoCRA, FTC |
| [RESEARCH-GROWTH.md](docs/RESEARCH-GROWTH.md) | Distribution and monetization strategy |
| [RESEARCH-CYCLE-SCIENCE.md](docs/RESEARCH-CYCLE-SCIENCE.md) | Temporal/context skin science with honest strength verdicts |
| [RESEARCH-DEEPTECH.md](docs/RESEARCH-DEEPTECH.md) | WebMCP deep-dive, free-LLM provider matrix, deep-tech roadmap |
| [RESEARCH-NEXT-TECH.md](docs/RESEARCH-NEXT-TECH.md) | The next layer — AR mirror, on-device stylist, WebGPU color lab |
| [RESEARCH-PWA-LAUNCH.md](docs/RESEARCH-PWA-LAUNCH.md) | PWA launch checklist and benchmarks |
| [RESEARCH-BEAUTY-APP-UX.md](docs/RESEARCH-BEAUTY-APP-UX.md) | Competitor benchmark and feature-gap analysis |
| [DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) | Design language and motion rules |

Also kept: [`worklog.md`](worklog.md) — the append-only build log of every task and verification run.

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Read [`docs/CONTEXT.md`](docs/CONTEXT.md) first — it documents the design-token rules, hydration guardrails, and engine conventions this codebase runs on.

## License

All rights reserved. © 2026 srivtx.
