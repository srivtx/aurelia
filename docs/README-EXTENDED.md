# Aurelia — Extended Documentation

> The deep version of the README: full feature detail, the Mirror Test verdicts, verification commands, and project structure. For the short version, see the [main README](../README.md). For how to deploy, see [DEPLOYMENT.md](./DEPLOYMENT.md). For the codebase map and contribution rules, see [CONTEXT.md](./CONTEXT.md).

A mobile-first, offline-capable PWA for style and beauty — color combinations, makeup basics, skincare, and hairstyles — with a computational layer that most tip apps fake. Built with Next.js. Installable, private by design, algorithm-first.

---

## Feature detail

### Colors

A 19-color matching engine (what pairs with what and why), 15 curated outfit palettes, an undertone finder, and color-theory basics.

### The Color Lab — real color science, computed on-device

- **12-Season Color Analysis** — a 7-question diagnostic mapped to a warmth × depth × chroma × contrast vector, classified against 12 season archetypes; yields a personal palette, metals, makeup direction, and wardrobe ratings.
- **Outfit Lab** — scores any 2–4 colors via CIELCh hue geometry, lightness spread (WCAG-style contrast), chroma coherence, warmth coherence and personal-season fit (ΔE2000), then suggests 60-30-10 roles — and with 3+ colors, the **Diagnosis** card: leave-one-out per-item contribution (who carries the outfit, who weakens it) plus a one-tap best-swap with a predicted score (node-wise diagnosis in the spirit of Balim 2023, on our deterministic engine).
- **Photo → Palette** — k-means clustering in CIELAB space over a downscaled canvas — dominant-color extraction that never leaves the device.
- **Skin Signature** — dermatology-grade colorimetry from one selfie: white-point (von-Kries) calibration against a reference patch, CIELAB averaging, **ITA°** depth classification, hue-angle undertone and chroma — the measured replacement for the folklore undertone quiz. Feeds the Shade Lab, the passport and season evidence.
- **Shade Lab** — foundation/blush/lip verdicts from a Lab-space blend model (arXiv 2024 lineage): predicted on-skin color, ΔE2000 visibility, shade-step depth deltas, undertone congruence and ashy-cast warnings — "how it will look on YOU" without AR — plus the **oxidation verdict (Mirror Test V2)**: her measured sebum profile × the shade's warm lean × product family → a 0–100 risk score, a **one-hour simulation** (fresh vs darker/warmer drift swatches), ranked drivers with the sebum-×-iron-oxide chemistry, and a one-tap counter-move ("size instead: half a shade lighter, 7° cooler") that loads a swatch into the lab. Nobody on the market models this; it's folklore with a mechanism.

### Makeup

Five occasion looks with step-by-step instructions, the 12-step application order, face/eye/lip 101 guides, common mistakes, tool care — and the **Glow Delta**: before/after selfies, independently white-point corrected, measured per region with **ΔE2000** (Kim 2023 lineage) — luminance lift, redness shift, evenness change, shareable outcome card. It measures *change*, never "beauty".

### Skincare

A 10-question skin-type quiz, a daily AM/PM routine checklist, an ingredient dictionary, mixing rules, and:

- **Ingredient Lab** — an evidence-based conflict/synergy matrix with an AM/PM routine sequencer, pH-ordered, thin→thick, SPF last.
- **Label Scanner (Mirror Test V3)** — photograph any INCI list — on-device OCR via a lazy-loaded Tesseract.js worker, upscaled + contrast-stretched; the token matcher is label-noise tolerant with fuzzy matching, and every verdict is crossed against *your* saved routine — conflicts classified "with your routine" vs "inside this product", plus fragrance/alcohol/essential-oil flags, an **oxidation formula read** on iron-oxide/vitamin-C/peroxide chemistries, and one-tap **save-to-Shelf**; paste-the-list fallback always available, photo never uploaded.
- **Skin Journal** — the closed beauty loop's retention engine: a weekly calibrated selfie → per-zone redness (a\*), evenness (ΔE dispersion), texture (edge energy) and **gloss** (specular fraction — the selfie hydration proxy of Soh 2025, honestly labeled "estimate, not a corneometer") → trend sparklines, regression slopes and milestones wired to the actives you tag ("cheek redness ↓ 28% while on niacinamide"). Trends, never diagnosis.
- **The Shelf (Mirror Test V4)** — every scanned or added product joins an offline inventory with a **PAO countdown** per category (the >90% PAO-overrun problem made visible — EU 1223/2009 conventions, honest "when in doubt, toss it" line), **near-duplicate detection** (swatch ΔE2000 < 5 within the same category, plus same-active twins → "you already own a near-identical berry"), and cost-per-use — exported with the Beauty Passport.

### Hair

Hairstyles matched to eight outfit categories, ten master styles, face-shape guides, the **Face Meter** — an anthropometric ratio classifier (length/cheekbone, forehead and jaw taper) with a live-morphing SVG face preview — and the **Texture Lab**: photograph a section of hair, tap two strand patches, and a pure-CV fiber-geometry engine (orientation coherence, ridge frequency, edge density) classifies your curl pattern on the 10-class scale (1, 2A–C, 3A–C, 4A–C; Callender 2026 lineage), then unlocks texture-specific care — wash cadence, moisture layering, styling physics, ingredients, night routine — and the master styles that suit your texture. Geometry measures *texture*, never "good hair".

### Ask Aurelia

An AI stylist chat with **token-by-token streaming**, markdown-rendered replies, and knowledge-grounded answers (RAG over the app's own content). The model behind her is a **server-side decision**: operators plug in a free key from Groq, Google Gemini, OpenRouter, Cerebras, Mistral, or a local LLM (Ollama/LM Studio) via env vars — users never see or choose a provider, and the built-in cloud model is the always-on fallback.

### Agent-ready (WebMCP)

The color-science, season, routine, conflict and search engines are registered as **read-only MCP tools** (`document.modelContext`), so your browser/desktop AI agent (ChatGPT site tools, Chrome/Edge trials) can call `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge` and `compare_colors` directly against the live page.

### Share-to-Analyze

On Android, share any image from anywhere into Aurelia (installed PWA) and the on-device palette analyzer runs on it; on desktop, "Open with Aurelia" via file handlers. Nothing is uploaded, ever.

### Beauty Passport

Your profile (season, skin type, vibe, journal summary) as a portable JSON file you own: export, share, import on another device.

### App-level features

Global search across all content including the tools, a three-step onboarding flow that personalizes the home screen, saved favorites, shareable tip and palette cards, glow streak with home-screen badge, storage persistence, dark mode, and deep-linkable hash routes.

**The closed beauty loop** — MEASURE (selfie colorimetry) → ADVISE (season, routine, outfit, stylist engines) → RE-MEASURE (glow delta, weekly journal) → ADAPT (milestones wired to your actives). Every measurement is on-device, white-reference calibrated, and paper-grounded ([docs/RESEARCH-PAPERS.md](./RESEARCH-PAPERS.md)).

---

## The Mirror Test

The product-decision engine for "will this product work for ME?": all four verdicts are live — **V1 Skin Signature** (calibrated colorimetry), **V2 Oxidation risk** (sebum × warm lean × formula, with a one-hour drift simulation), **V3 Label Scanner** (INCI OCR × her routine), **V4 Shelf** (PAO countdown + ΔE2000 duplicate radar). Scan a product, save it to the shelf, and the countdown + duplicate checks run offline against her own measured data ([docs/RESEARCH-UNIQUE-PROBLEM.md](./RESEARCH-UNIQUE-PROBLEM.md)).

---

## Getting Started (verified)

Requirements: Node.js 20+ (or Bun 1.1+) and npm/pnpm/bun. No database, no keys, no config.

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open http://localhost:3000. Everything works with zero configuration — including the AI stylist (built-in provider). To plug in **free models** (Groq, Gemini, OpenRouter, …) or a **local LLM**, see [docs/DEPLOYMENT.md](./DEPLOYMENT.md) — it's a 2-minute, one-env-var setup.

### Scripts

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
node scripts/e2e-texture-diagnosis.mjs # Texture Lab (synthetic hair) + Outfit diagnosis/swap + gloss trend
node scripts/e2e-scanner.mjs        # Label Scanner: paste flow, verdicts vs routine, live re-derive, OCR smoke
node scripts/e2e-shelf-oxidation.mjs # Mirror Test V2+V4: Shade Lab oxidation + counter-move, Shelf PAO/duplicates
bun scripts/test-engines.ts         # pure-engine math — 191/191, no browser needed
node scripts/check-providers.mjs    # operator: which AI provider the env resolves to
```

All e2e suites need the dev server on `:3000`. The lone 404 console error in `e2e-new-features` is the intentional branded-404 test — expected.

### Production

```bash
npm run build
npm run start   # serves on port 3000, configurable via PORT
```

Any Node.js host or container works. The app is fully static at the root route and has no database dependency in its default configuration.

### PWA notes

- `public/manifest.json` — app metadata, icons, shortcuts, and screenshots.
- `public/sw.js` — service worker with app-shell caching and an in-app update prompt (`aurelia-v5`).
- Install affordance — a phone-only, dismissible notice: captures the native `beforeinstallprompt` (Android/Chrome) as a one-tap Install chip, and on iOS Safari (which never fires the event) shows the Share → Add to Home Screen hint. Hidden inside standalone and for 30 days after dismissal (`aurelia-install-dismissed` in localStorage).
- Splash screens ship in light AND dark variants; iOS picks the dark splash via `media="(prefers-color-scheme: dark)"`, and the pre-hydration theme script stamps the html background + `color-scheme` before first paint so both schemes boot without a flash.
- iOS splash screens are provided for common device sizes in `public/icons/`.

---

## Deploy

Full guide: [docs/DEPLOYMENT.md](./DEPLOYMENT.md) (agent brief, free-model setup, GitHub → Vercel, Docker/VPS, post-deploy checklist, rollback, troubleshooting). Short version: import at [vercel.com/new](https://vercel.com/new), accept defaults, deploy with zero env vars; optionally add one free provider key server-side. GitHub Pages is not supported (API routes).

---

## Documentation index

Everything a contributor needs is preserved in [`docs/`](./):

- **[docs/CONTEXT.md](./CONTEXT.md)** — start here: full codebase map, design-token rules (including the alias pitfall), hydration guardrails, engine reference, how to add content/features.
- **[docs/DEPLOYMENT.md](./DEPLOYMENT.md)** — the complete deployment guide: AI deployment-agent brief (repo facts, env contract, verification commands, red lines), free-model setup (Groq/Gemini/OpenRouter/Cerebras/Mistral/local), GitHub → Vercel flow, Docker/VPS self-hosting, post-deploy checklist, rollback, troubleshooting.
- **[docs/RESEARCH-DEEPTECH.md](./RESEARCH-DEEPTECH.md)** — WebMCP spec deep-dive, free-LLM provider matrix, modern PWA APIs, ranked deep-tech roadmap.
- **[docs/RESEARCH-NEXT-TECH.md](./RESEARCH-NEXT-TECH.md)** — the next layer (2026-09): live AR mirror (MediaPipe FaceLandmarker), offline stylist via Chrome built-in AI, OCR ingredient scanner, WebGPU/OKLCh color lab, bandit + spaced-repetition personalization, on-device VLM.
- **[docs/RESEARCH-PWA-LAUNCH.md](./RESEARCH-PWA-LAUNCH.md)** — PWA launch checklist and benchmarks.
- **[docs/RESEARCH-BEAUTY-APP-UX.md](./RESEARCH-BEAUTY-APP-UX.md)** — competitor benchmark and feature-gap analysis.
- **[docs/RESEARCH-COMPLIANCE.md](./RESEARCH-COMPLIANCE.md)** — regulatory/claims safety (2026-09): GDPR scope, EU AI Act Art. 50 duties, FDA/MoCRA claim lines, MDR boundary, FTC rules, a claims-language matrix, and the required privacy/disclosure artifacts.
- **[docs/RESEARCH-GROWTH.md](./RESEARCH-GROWTH.md)** — distribution & monetization strategy (2026-09): TikTok/Reddit/SEO channels, TWA Play-Store path, share-card growth loops, affiliate/freemium benchmarks, a 3-phase zero-backend playbook.
- **[docs/RESEARCH-CYCLE-SCIENCE.md](./RESEARCH-CYCLE-SCIENCE.md)** — temporal/context skin science (2026-09): menstrual-cycle, seasonal, sleep, stress, circadian, pollution evidence with honest strength verdicts and the "Context Layer" feature design for the journal + routine engine.
- **[docs/RESEARCH-UNIQUE-PROBLEM.md](./RESEARCH-UNIQUE-PROBLEM.md)** — the Mirror Test product thesis.
- **[docs/RESEARCH-PAPERS.md](./RESEARCH-PAPERS.md)** — every paper the engines are grounded in.
- **[docs/DESIGN_BRIEF.md](./DESIGN_BRIEF.md)** — design language and motion rules.
- Content knowledge bases: [COLOR_COMBINATION_KNOWLEDGE_BASE.md](./COLOR_COMBINATION_KNOWLEDGE_BASE.md) · [MAKEUP_KNOWLEDGE_BASE.md](./MAKEUP_KNOWLEDGE_BASE.md) · [SKINCARE_KNOWLEDGE_BASE.md](./SKINCARE_KNOWLEDGE_BASE.md).
- [`worklog.md`](../worklog.md) — append-only build log of every task and verification run.

---

## Project Structure

```
src/
  app/                        # root layout, page (tab router), 404, error boundaries,
                              # /api/stylist (server-side multi-provider streaming + RAG)
  components/aurelia/         # shell, bottom sheet, UI primitives, icons, illustrations,
                              # onboarding, search overlay, stylist chat, markdown renderer,
                              # platform bridge (WebMCP/badge/share-target), season analysis,
                              # outfit lab, photo analyzer, ingredient lab, face meter,
                              # skin signature capture, shade lab, glow delta, skin journal,
                              # scanner lab, shelf, beauty passport
  components/aurelia/tabs/    # home, colors, makeup, skin, hair
  data/                       # content knowledge base (colors, makeup, skincare, hair,
                              # tips, 12 seasons, active ingredients, curl patterns,
                              # INCI aliases, PAO categories)
  lib/                        # zustand store, search index, share utilities, RAG grounding,
                              # AI provider registry, WebMCP tools, passport, share inbox,
                              # color-science engine, outfit engine, palette extraction
                              # (k-means), routine sequencer, face-shape classifier,
                              # skin signature, shade match, oxidation, glow delta,
                              # skin journal, curl classifier, label scan + OCR, shelf
public/                       # manifest (share_target, file_handlers), service worker,
                              # icons, splash screens, og image
docs/                         # research + context + deployment guides
```

---

## License

All rights reserved. © 2026 srivtx.
