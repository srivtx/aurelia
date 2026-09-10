<div align="center">

<img src="public/icons/icon.svg" width="120" alt="Aurelia" />

# Aurelia

**Beauty advice with a mechanism.**

[![Stars](https://img.shields.io/github/stars/srivtx/aurelia?style=flat&logo=github&label=Stars&color=181717)](https://github.com/srivtx/aurelia/stargazers)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-8B5CF6?style=flat)](./README.md#license)
[![PWA](https://img.shields.io/badge/PWA-installable_%C2%B7_offline-5A0FC8?style=flat&logo=pwa&logoColor=white)](./docs/RESEARCH-PWA-LAUNCH.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Documentation](docs/README-EXTENDED.md) &nbsp;&nbsp;•&nbsp;&nbsp; [Deploy](#deploy) &nbsp;&nbsp;•&nbsp;&nbsp; [Issues](https://github.com/srivtx/aurelia/issues)

</div>

---

Aurelia is a browser-only style and beauty app for the Mirror Test question — *will this product work on me?* — answered by measurement instead of folklore. Its advice is computed by deterministic engines on real color science (CIELAB, CIEDE2000); its photos, profile, and product shelf never leave the device, so there is nothing to leak and nothing to sell.

It ships as a mobile installable — four content modules, five tabs, an offline service worker, and a set of engines most apps fake:

| | Engine | Mechanism |
| --- | --- | --- |
| ▦ | **Outfit Lab** | CIELCh hue geometry, WCAG contrast, your season fit (ΔE2000) → score, 60-30-10 roles, leave-one-out diagnosis |
| ◐ | **12-Season Analysis** | warmth × depth × chroma × contrast vector → season archetype, personal palette, metals |
| ⬡ | **Skin Signature** | white-point (von-Kries) calibrated selfie → ITA° depth, hue-angle undertone |
| ⬢ | **Shade Lab** | Lab-space blend model → on-skin prediction, ashy warnings, oxidation risk + one-hour drift simulation |
| ⌕ | **Label Scanner** | on-device INCI OCR crossed against your routine → conflicts, flags, formula reads |
| ⬛ | **The Shelf** | PAO countdowns, ΔE2000 near-duplicate radar, cost-per-use — offline inventory |
| ✚ | **Glow Delta & Journal** | before/after selfies measured per region; weekly trends wired to the actives you tag |
| ↗ | **Hair** | Face Meter (anthropometric ratios) + Texture Lab (fiber geometry → 10-class curl scale) |
| ✉ | **Ask Aurelia** | streaming AI stylist, RAG-grounded on the app's own content; server-side provider, user sees none |
| ⚙ | **WebMCP bridge** | engines expose read-only tools agents can call against the live page |

Every measurement is white-reference calibrated and paper-grounded — the full lineage lives in [docs/RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md).

## Install

Prerequisites: Node.js 20+ (or Bun 1.1+). No database, no keys, no accounts.

```sh
git clone https://github.com/srivtx/aurelia.git
cd aurelia
npm install
npm run dev
# → http://localhost:3000
```

That's it — the AI stylist works out of the box on the built-in provider. Production:

```sh
npm run build
npm run start
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Faurelia&project-name=aurelia&repository-name=aurelia)

Import at [vercel.com/new](https://vercel.com/new), accept the auto-detected defaults, deploy with zero environment variables. Every push to `main` ships automatically.

Optional — a free LLM key (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, …) set server-side; providers auto-detect in priority order and silently fall back to the built-in model, so the chat never goes down. Keys are never exposed to the client.

GitHub Pages is not supported (the app has API routes). Docker, VPS, rollback, and the full post-deploy checklist are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Features

- **Colors** — 19-color matching engine, 15 curated palettes, undertone finder, color-theory basics.
- **12-Season Analysis** — a 7-question diagnostic mapped to a seasonal archetype with confidence; palette, metals, makeup direction, wardrobe ratings.
- **Outfit Lab** — hue geometry, lightness spread, chroma and warmth coherence, season fit; with 3+ colors, a Diagnosis card showing which piece carries the outfit and a one-tap best swap with a predicted score.
- **Photo → Palette** — k-means in CIELAB, fully on-device.
- **Skin Signature & Shade Lab** — measured depth, undertone, and chroma feeding foundation/blush/lip verdicts — predicted on-skin color, ΔE2000 visibility, ashy-cast warnings, and the oxidation verdict with a one-hour drift simulation and a counter-move.
- **Glow Delta & Skin Journal** — before/after selfies measured per region; weekly trends with regression slopes — "cheek redness ↓ 28% while on niacinamide". Trends, never diagnosis.
- **Ingredient Lab & Label Scanner** — pH-ordered AM/PM routine sequencer with a conflict/synergy matrix; photograph any INCI list and every verdict crosses against your saved routine, with a paste-the-list fallback.
- **The Shelf** — offline product inventory with PAO countdowns (EU 1223/2009 conventions), near-duplicate shade radar (ΔE2000 < 5), cost-per-use.
- **Hair** — Face Meter (live-morphing SVG preview) and Texture Lab: strand photography → curl pattern on the 10-class scale → texture-specific care. Geometry measures texture, never "good hair".
- **Ask Aurelia** — token-by-token streaming, markdown rendering, RAG-grounded answers.
- **Agent-ready (WebMCP)** — `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge`, `compare_colors` as read-only MCP tools.
- **Beauty Passport & Share-to-Analyze** — profile as portable JSON you own; share any image into the app and the on-device analyzer runs on it. Nothing is uploaded, ever.
- Also: global search, three-step onboarding, favorites, shareable cards, glow streak, storage persistence, dark mode, deep-linkable hash routes.

## Docs

| | |
| --- | --- |
| [README-EXTENDED.md](docs/README-EXTENDED.md) | Full feature detail, verification suites, project structure |
| [CONTEXT.md](docs/CONTEXT.md) | Start here for code — codebase map, design tokens, hydration guardrails |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Complete deploy guide — agent brief, env contract, checklist, rollback |
| [RESEARCH-PAPERS.md](docs/RESEARCH-PAPERS.md) | The paper lineage behind every engine |
| [RESEARCH-UNIQUE-PROBLEM.md](docs/RESEARCH-UNIQUE-PROBLEM.md) | The Mirror Test product thesis |
| [RESEARCH-COMPLIANCE.md](docs/RESEARCH-COMPLIANCE.md) | GDPR, EU AI Act, MoCRA, FTC claims safety |
| [RESEARCH-GROWTH.md](docs/RESEARCH-GROWTH.md) | Distribution and monetization strategy |
| [RESEARCH-CYCLE-SCIENCE.md](docs/RESEARCH-CYCLE-SCIENCE.md) | Temporal/context skin science, honest verdicts |
| [RESEARCH-DEEPTECH.md](docs/RESEARCH-DEEPTECH.md) | WebMCP deep-dive, provider matrix, roadmap |
| [RESEARCH-NEXT-TECH.md](docs/RESEARCH-NEXT-TECH.md) | The next layer — AR mirror, on-device stylist, WebGPU |
| [RESEARCH-PWA-LAUNCH.md](docs/RESEARCH-PWA-LAUNCH.md) | PWA launch checklist and benchmarks |
| [RESEARCH-BEAUTY-APP-UX.md](docs/RESEARCH-BEAUTY-APP-UX.md) | Competitor benchmark and feature gaps |
| [DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) | Design language and motion rules |
| [worklog.md](worklog.md) | Append-only build log |

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Read [docs/CONTEXT.md](docs/CONTEXT.md) first — design-token rules, hydration guardrails, engine conventions.

## License

All rights reserved. © 2026 srivtx.
