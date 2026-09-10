# AURELIA — Context & Contribution Guide

> **Part of Aurelia** · [README](../README.md) · [Extended README](./README-EXTENDED.md) · [DEPLOYMENT](./DEPLOYMENT.md) · [worklog](../worklog.md)
>
> **Purpose of this file:** everything a new contributor needs to understand the
> repo in one read — what the app is, where everything lives, the design system,
> the deep-tech engines, the research that drove the decisions, and how to work
> on it safely (hydration rules!). Read this before touching code.
>
> Last updated: 2026-09-10 · App version: `aurelia-v5` (service worker)

---

## 1. What Aurelia is

A **mobile-first PWA for girls learning fashion, makeup, skincare and hair** —
one warm, clutter-free app instead of four ad-filled ones. It is:

- **Installable & offline-first** (service worker + app shell caching).
- **Algorithm-first**: the color, season, outfit, routine and face-shape advice
  is computed by real engines (CIELAB color math, CIEDE2000, k-means, expert
  systems) — not hardcoded "tips".
- **Private by design**: zero-party data (profile stays on-device), photos never
  uploaded, no accounts, no tracking, no ads.
- **AI-native but self-hostable**: an in-app stylist chat with pluggable free
  providers (Groq / Gemini / OpenRouter / …) and an agent bridge (WebMCP) that
  exposes the engines to the user's own AI agent.

Stack: **Next.js 16 (App Router) · TypeScript · Tailwind v4 · zustand ·
framer-motion**. No database required; Prisma is scaffolded but unused.

## 2. Repo map (where everything lives)

```
src/
  app/
    layout.tsx            # fonts (Fraunces + Nunito Sans), PWA meta, OG, iOS splash, no-flash theme script
    page.tsx              # the whole app: tab router, sheets, search, onboarding, chat, platform bridge
    globals.css           # "Soft Editorial" design tokens (light + dark) — THE source of color truth
    error.tsx / global-error.tsx / not-found.tsx   # branded error & 404 boundaries
    api/
      stylist/route.ts    # AI chat: server-side provider resolution, NDJSON token streaming, RAG grounding (keys live ONLY here)
  components/aurelia/
    shell.tsx             # blur header + 5-tab bottom nav (layoutId pill)
    bits.tsx              # Card, Chip, Eyebrow, SectionHeader, SaveButton, Do/Dont…
    sheet.tsx             # framer-motion bottom sheet w/ drag-dismiss
    icons.tsx             # ALL line icons (24px grid, currentColor — stroke follows text color)
    illustrations.tsx     # ALL illustrations (line art + soft fills, CSS-var colors → dark-mode aware)
    markdown.tsx          # markdown-lite renderer for chat replies (XSS-safe, no deps)
    stylist-chat.tsx      # full-screen chat: streaming, quick prompts (NO provider/model UI — server-side only)
    platform-bridge.tsx   # WebMCP registration · storage persistence · badge · share-target handoff
    search-sheet.tsx      # global search with relevance grouping + deep-opens
    onboarding.tsx        # 3-step first-run (name / skin / vibe)
    season-analysis.tsx   # 12-season wizard + result (signal profile, palette, badge)
    outfit-lab.tsx        # outfit scorer UI (factor bars, 60-30-10 roles, season fit, diagnosis + swap)
    photo-analyzer.tsx    # photo → palette (on-device k-means) + share-target pickup
    skin-signature.tsx    # selfie + white reference → ITA° capture flow (tap patches) — Skin tab "Skin Signature"
    shade-lab.tsx         # shade verdicts vs measured skin (blend model, oxidation one-hour simulation, counter-move, ashy) — Makeup tab "Shade Lab"
    glow-delta.tsx        # before/after selfies → ΔE2000 outcome card (Makeup tab)
    skin-journal.tsx      # weekly zone capture + trend sparklines (incl. gloss) + milestones (Skin tab)
    ingredient-lab.tsx    # actives sequencer (AM/PM timelines, conflicts)
    scanner-lab.tsx       # Label Scanner sheet: OCR/paste → verdict, formula read, save-to-Shelf
    shelf.tsx             # The Shelf sheet: PAO countdown bars, duplicate banner, cost-per-use, add/remove (Skin tab)
    face-meter.tsx        # anthropometric face-shape classifier + morphing SVG
    curl-lab.tsx          # Texture Lab: hair photo → 2 strand patches → curl pattern + care plan
    passport-card.tsx     # Beauty Passport export/import (Home tab)
    tabs/                 # home · colors · makeup · skin · hair
  data/                   # pure content: colors, palettes, seasons, actives, makeup, skincare, hair, curl-patterns, tips, inci-aliases, pao (PAO categories)
  lib/
    store.ts              # zustand store (persist, skipHydration — see §4; incl. shelf w/ rehydrate sanitizer)
    color-science.ts      # sRGB↔XYZ↔Lab, CIEDE2000, WCAG contrast, warmth, harmony, naming
    seasons (data)        # 12-season archetypes + classifier (signal vector → nearest archetype)
    outfit-engine.ts      # outfit scoring: hue geometry, lightness/chroma/warmth, 60-30-10
    routine-engine.ts     # AM/PM sequencer: pH order, slots, photosensitivity, conflicts
    palette-extract.ts    # deterministic k-means++ in Lab space from an image
    face-shape.ts         # ratios (L/C, F/C, J/C) → 6 shapes + confidence
    skin-signature.ts     # ITA° colorimetry: von-Kries white-point correction, Lab averaging, depth/undertone
    shade-match.ts        # Lab blend model: predicted on-skin color, ΔE2000, oxidation + ashy risk (delegates to lib/oxidation.ts)
    oxidation.ts          # Mirror Test V2 engine: sebum × warm lean × product family → score/risk, 1-hour drift simulation, counter-shade, INCI formula read
    glow-delta.ts         # before/after ΔE2000 per region + glow/redness/evenness summary
    skin-journal.ts       # zone metrics (a*, evenness, Sobel texture, gloss), trends, regression, milestones
    curl-classifier.ts    # fiber geometry: orientation coherence + ridge frequency + edge density → 10-class curl pattern
    label-scan.ts         # INCI parser + matcher + routine cross-check (pure, the Label Scanner engine)
    ocr.ts                # lazy tesseract.js wrapper: upscale + contrast-stretch, local worker (client-only)
    shelf.ts              # Mirror Test V4 engine: PAO countdown (calendar-month math), ΔE2000 shade-twin + active-twin duplicate detection, cost-per-use, summary — pure, today-as-parameter
    search.ts             # global search index over the whole knowledge base
    stylist-rag.ts        # BM25-lite retrieval → grounds the stylist's system prompt
    ai-providers.ts       # provider registry + live model discovery + SSE→NDJSON (server-only)
    webmcp.ts             # WebMCP tool registration (agent-callable engines)
    share.ts              # Web Share + canvas share cards
    passport.ts           # Beauty Passport build/export/import
    share-inbox.ts        # share-target handoff (client pickup)
public/
  manifest.json           # PWA manifest (share_target, file_handlers, shortcuts)
  sw.js                   # service worker (app shell, offline fallback, SWR assets, share target)
docs/                     # ALL research + guides (see §6)
scripts/                  # E2E suites (playwright) + asset generators
```

## 3. Design system — "Soft Editorial"

- **Canvas**: cream `#FAF7F3` → dark plum `#1C1518`. **Primary**: dusty rose
  `#A84A62` → light rose `#E095A7`. **Secondary**: terracotta. **Accent**: gold.
- Category accents: colors=terracotta, makeup=rose, skin=sage, hair=caramel.
- Fonts: **Fraunces** (display serif) + **Nunito Sans** (body), via `next/font`.
- Every color is a CSS custom property defined in `globals.css` under `:root`
  and `.dark`.

### ⚠️ The token-alias rule (read this twice)

Tailwind v4 utilities (`bg-rose`, `text-ink`) are generated from `@theme inline`
in `globals.css`. **Raw CSS/inline styles and SVG attributes must use the
canonical custom properties**, NOT Tailwind names. Both spellings now exist:

| Tailwind class name | Raw CSS var (use in style/svg) |
|---|---|
| `bg-rose` | `var(--primary)` or alias `var(--rose)` |
| `bg-rose-soft` | `var(--primary-soft)` / `var(--rose-soft)` |
| `text-ink` / `ink-2` / `ink-3` | `var(--ink-900)` / `var(--ink-600)` / `var(--ink-400)` (aliases `--ink`, `--ink-2`, `--ink-3`) |
| `text-cat-colors` | `var(--cat-color)` (alias `var(--cat-colors)`) |
| `bg-sage-soft`, `bg-honey-soft`… | `var(--success-soft)`, `var(--warning-soft)`… (aliases `--sage-soft`, `--honey-soft`…) |

The aliases (`--rose`, `--sage`, `--ink-2`…) are **declared in BOTH `:root` and
`.dark`** in `globals.css` — this is load-bearing: a `:root`-only alias freezes
the light value for descendants, because custom properties resolve `var()`
references when they are computed on the element that declares them. History:
before the aliases existed, `var(--rose)` silently resolved to *transparent*,
which produced invisible icons, invisible chat text and light-locked SVGs.

- **White-on-rose surfaces** must use `color: var(--rose-foreground)` — it is
  white in light mode and dark ink in dark mode (the rose flips to a light tint).
- **Icons** always stroke `currentColor`; illustrations fill with `var(--*)`
  tokens (no hardcoded hex) so they re-theme automatically.

## 4. Hydration rules (do not break these)

The app is SSG'd, so **server HTML and first client render must match**:

1. **Never call `Date.now()` / `Math.random()` / `locale-sensitive APIs` during render.**
   The greeting is computed in a `useEffect` + `requestAnimationFrame`.
2. **zustand persist uses `skipHydration: true`**; `rehydrateStore()` runs once
   after mount (see `page.tsx`). Anything derived from persisted state (name,
   season, streak) only renders after that point.
3. Date/day logic (`localDay`) is only used in **actions and effects**, never render.
4. Client-only portals (`typeof document === "undefined"` guards) for chat/search.
5. The theme (`.dark` class) is applied by a tiny pre-hydration script in
   `layout.tsx` with `suppressHydrationWarning` on `<html>`.

Verify with: `node scripts/hydration-verify.mjs` (0 errors expected, IST +
persisted store).

## 5. The deep-tech engines (what makes Aurelia not-a-tips-app)

| Engine | File | What it actually does |
|---|---|---|
| Color science | `lib/color-science.ts` | Full sRGB↔CIE XYZ(D65)↔CIELAB, **CIEDE2000** perceptual distance, WCAG contrast, warmth scoring from hue angle + b*, harmony generation, ΔE-based color naming. Pure + deterministic. |
| 12-Season analysis | `data/seasons.ts` | 7-question diagnostic → weighted [warmth, depth, chroma, contrast] vector → nearest of 12 archetypes with confidence + runner-up; per-season 16-swatch palettes, metals, makeup, hair, avoid-lists; ΔE2000 rating of any hex vs a season palette. |
| Outfit scorer | `lib/outfit-engine.ts` | Hue-geometry relation (mono/analogous/complementary/triadic…), lightness spread, chroma coherence, warmth coherence, neutral anchor detection, 60-30-10 role assignment, season-fit factor — scored 0-100 with human explanations. |
| Routine sequencer | `lib/routine-engine.ts` + `data/actives.ts` | pH-ordered AM/PM sequencing, slot constraints, photosensitivity, conflict/synergy matrix with fixes (alternate nights, buffering). |
| Label scanner | `lib/label-scan.ts` + `data/inci-aliases.ts` + `lib/ocr.ts` | The camera door to the conflict engine: split/normalize INCI text (bullets, numbering, %, headers, “may contain” colons) → match tokens onto the 12 actives (structural family patterns like every hyaluronate/peptide/ceramide/UV-filter, exact full names, bounded-Levenshtein fuzzy for OCR noise, 0→o / 1→l OCR fixes) → cross matched × her saved routine, classified product-vs-routine vs inside-product (routine-internal pairs filtered) → avoid/warn conflicts, synergies, new-for-you, plus non-active flags (drying alcohol, fragrance + EU allergens, essential oils). `ocr.ts` lazy-loads tesseract.js (CDN worker + eng model, cached), upscales to ≥1400px, grayscale + 2–98% percentile contrast stretch; every failure degrades to “paste the list instead”. Photo never uploaded — OCR runs in a local worker. |
| Photo palette | `lib/palette-extract.ts` | Canvas downscale → Lab pixels → deterministic k-means++ (LCG-seeded) → ΔE2000 merge. 100% on-device. |
| Face meter | `lib/face-shape.ts` | Anthropometric ratios → 6 shapes + confidence; live-morphing parametric SVG. |
| Skin Signature | `lib/skin-signature.ts` | Dermatology colorimetry: 15×15 patch means, von-Kries white-point correction → CIELAB → **ITA°** (Chardon classes), hue-angle undertone, chroma; plausibility guards + confidence warnings. The measurement primitive for everything downstream. |
| Shade match | `lib/shade-match.ts` | Lab-space α-blend per product kind (arXiv 2024 lineage) → predicted on-skin Lab, ΔE2000 visibility, shade-step depth, hue congruence, ashy-cast detection; fit score 0-100. Oxidation verdict delegated to `lib/oxidation.ts`. |
| Oxidation (V2) | `lib/oxidation.ts` | The "why does my foundation turn orange by lunch" model: her sebum factor (skin-type quiz) × the shade's warm lean vs her hue (V1) × product family propensity (foundation > blush > lip) → 0–100 score + risk; **one-hour simulation** (ΔL drop, Δb rise → post-oxidation swatch); counter-move shade (½ step lighter, 7° cooler, tappable into the lab); ranked drivers + sebum-×-iron-oxide chemistry copy; `formulaOxidation()` reads scanned INCI lists for iron oxides (CI 774xx via raw text — the tokenizer strips digits), vitamin C, benzoyl peroxide. Named-mechanism heuristic, honestly worded. |
| Shelf (V4) | `lib/shelf.ts` + `data/pao.ts` | PAO countdown per category (15 categories, EU 1223/2009 conventions, calendar-month expiry math, sealed/expiring-soon/expired states, junk-date guards); **duplicate radar** — shade twins (same category + swatch ΔE2000 < 5) and active twins (same category + same activeId); cost-per-use (price ÷ uses/week × PAO weeks); summary + share text; `buildShelfItem()` sanitization. Pure + deterministic (today is always a parameter). |
| Glow Delta | `lib/glow-delta.ts` | Kim 2023 lineage: two independently white-corrected selfies → per-region (cheek/jaw/forehead) ΔE2000, ΔL\*/Δa\*/Δb\*, hue shift; summary glow/redness/evenness (region dispersion); region-aware copy that measures *change*, never beauty. |
| Skin Journal | `lib/skin-journal.ts` | Closed-loop retention: 31×31 zone patches → per-pixel Lab stats (redness a\*, evenness = mean ΔE76 to zone mean, texture = Sobel edge energy, gloss = specular fraction — the hydration proxy of Soh 2025, honestly labeled) → entries (with tagged actives) → trend regression (slope/week, % change) + milestones (“redness ↓ 18% while on niacinamide”). Trends, never diagnosis. |
| Curl classifier | `lib/curl-classifier.ts` + `data/curl-patterns.ts` | Texture Lab engine (Callender 2026 lineage): 61×61 strand patches → structure-tensor orientation coherence (magnitude-weighted doubled angle), Schmitt-trigger ridge frequency with variance gating, normalized Sobel edge density → curl index 0–100 → 10-class scale (1, 2A–C, 3A–C, 4A–C); patch guards (flat/dark/blown) + cross-patch agreement discount; per-pattern care plans (wash cadence, moisture layering, styling physics, ingredients, night) and style matches. Geometry measures texture, never “good hair”. |
| Outfit diagnosis | `lib/outfit-engine.ts` → `diagnoseOutfit` | Balim-2023-style node-wise diagnosis on the deterministic scorer: leave-one-out per-item contributions (load-bearing / neutral / weakening), weakest-item detection, exhaustive wardrobe swap search with predicted score — rendered as contribution bars + one-tap “apply the swap” in the Outfit Lab. |
| Stylist RAG | `lib/stylist-rag.ts` | BM25-lite retrieval (idf + title boost + synonym expansion) over the app's own KB → injected into the system prompt so replies are grounded. |
| WebMCP bridge | `lib/webmcp.ts` | Registers the engines as **read-only MCP tools** (`document.modelContext.registerTool`, spec Sept-2026 + navigator shim) so the user's AI agent can call `score_outfit`, `find_matching_colors`, `get_season`, `get_routine`, `check_ingredient_conflict`, `search_knowledge`, `compare_colors` on the live page. |
| Provider layer | `lib/ai-providers.ts` | Registry of OpenAI-compatible providers, live model discovery (10-min cache), SSE→NDJSON streaming, curated fallbacks. |

## 6. Research & docs index (context preserved)

Everything the project learned, in the order you should read it:

| Doc | What it holds |
|---|---|
| [`RESEARCH-PWA-LAUNCH.md`](./RESEARCH-PWA-LAUNCH.md) | PWA quality bar, launch checklist, retention benchmarks, gap scorecard (2025-26) |
| [`RESEARCH-BEAUTY-APP-UX.md`](./RESEARCH-BEAUTY-APP-UX.md) | Competitor benchmark (YouCam, GlowUp, Dressika, Skin Bliss…), content coverage tables, prioritized feature gaps |
| [`RESEARCH-DEEPTECH.md`](./RESEARCH-DEEPTECH.md) | WebMCP spec deep-dive (current API shape), free LLM provider matrix (verified 2026-09), modern PWA APIs (share target, file handling, badging, view transitions, storage), ranked original deep-tech ideas |
| [`RESEARCH-NEXT-TECH.md`](./RESEARCH-NEXT-TECH.md) | Ranked next deep-tech layer (AR mirror, offline AI, OCR scanner, WebGPU color, bandit/SM-2) with verified 2026 platform status |
| [`RESEARCH-UNIQUE-PROBLEM.md`](./RESEARCH-UNIQUE-PROBLEM.md) | Problem-first market case: the “will this work for ME” thesis + Mirror-Test engine design |
| [`RESEARCH-PAPERS.md`](./RESEARCH-PAPERS.md) | 9 paper-grounded buildable features + the closed beauty loop thesis — the lineage behind Skin Signature, Shade Lab, Glow Delta and Skin Journal |
| [`RESEARCH-COMPLIANCE.md`](./RESEARCH-COMPLIANCE.md) | Regulatory & claims safety: GDPR scope (chat route only; on-device photos out of biometric territory), EU AI Act Art. 50(1) chat disclosure (live law since Aug 2026), FDA cosmetic-vs-drug claim lines, MDR/MDCG 2019-11 boundary, FTC AI + affiliate rules, claims-language matrix, privacy-policy/disclaimer artifact list |
| [`RESEARCH-GROWTH.md`](./RESEARCH-GROWTH.md) | Growth & monetization: TikTok/Reddit/SEO channel evidence, TWA→Play Store path (12-tester rule), iOS 4.2 reality, share-card loop benchmarks (k-factor), affiliate rates (Sephora/LTK/ShopMy), freemium conversion, $12 Deep-Report pricing, 3-phase zero-backend playbook |
| [`RESEARCH-CYCLE-SCIENCE.md`](./RESEARCH-CYCLE-SCIENCE.md) | Temporal/context skin science: cycle-phase (acne flare STRONG / barrier MIXED), seasonal (STRONG), sleep & stress (STRONG), circadian (MODERATE), pollution (STRONG) — each with honest verdict + the "Context Layer" design (journal tags, seasonal routine tilt, correlation milestones) |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | The complete deployment guide incl. the AI-deployment-agent brief (repo facts, env contract, verification commands, red lines), free-model setup, GitHub → Vercel flow, Docker/VPS, post-deploy checklist, rollback, troubleshooting |
| `worklog.md` (repo root) | Append-only multi-agent build log — every task, what was done, what was verified |

## 7. How to add things (common tasks)

- **Add a wardrobe color**: `data/colors.ts` → `wardrobeColors` (id, name, hex,
  undertone, vibe, secret) + add entries to `matches` (bidirectional). Search and
  the RAG pick it up automatically.
- **Add a makeup look / skincare ingredient / hairstyle**: edit the matching
  `data/*.ts` file — follow the existing interface, keep copy in the app's voice
  (kind older sister, specific, never preachy).
- **Add a chat model provider**: `lib/ai-providers.ts` → append to `providers`
  (endpoint, env var, curated models, optional `pick` filter). Done — picker,
  discovery and route pick it up.
- **Add a WebMCP tool**: `lib/webmcp.ts` → append to `TOOLS` (name, schema,
  readOnlyHint, execute → `textResult`). Keep tools read-only and PII-free.
- **Add a screen**: keep the 5-tab IA; new content usually belongs in a sheet
  (see `sheet.tsx`) opened from a tab section, + a `searchIndex()` entry for
  deep-open.

## 8. Testing & verification

```bash
bun run lint                       # eslint (clean expected)
bunx tsc --noEmit                  # typecheck (src/ is clean)
node scripts/hydration-verify.mjs  # 0 hydration errors
node scripts/e2e-new-features.mjs  # onboarding, routes, search, share, PWA files
node scripts/e2e-deep-tech.mjs     # season wizard, outfit lab, conflicts, face meter, stylist
node scripts/e2e-chat-fixes.mjs    # markdown rendering, chat contrast, dark tokens, no-provider-leak
node scripts/e2e-closed-loop.mjs   # Glow Delta + Skin Journal with synthetic calibrated selfies
node scripts/e2e-texture-diagnosis.mjs # Texture Lab (synthetic hair) + Outfit diagnosis/swap + gloss trend
node scripts/e2e-scanner.mjs       # Label Scanner: paste flow, verdicts vs routine, live re-derive on routine edit, persistence, + a real OCR smoke (CDN-dependent, SKIPs offline)
node scripts/e2e-shelf-oxidation.mjs # Mirror Test V2+V4: Shade Lab oxidation verdict + counter-move, scanner formula read + save-to-shelf, Shelf PAO/duplicates/persistence, search wiring
bun scripts/test-engines.ts        # pure-engine math (glow delta, journal/gloss, curl classifier, outfit diagnosis, label scan, oxidation, shelf) — no browser
node scripts/check-providers.mjs   # operator: verify AI provider keys + resolution (replaces /api/models)
bun run build                      # production build
```

All suites run headless Chromium against the dev server (`bun run dev`, port 3000).

## 9. Conventions & guardrails

- Copy voice: warm, specific, body-positive; never condescending; dermatologist
  nudge for medical-adjacent topics.
- No PII in schemas, logs, or WebMCP outputs. The profile is the user's property
  (Beauty Passport export).
- Server-only imports (`z-ai-web-dev-sdk`, `ai-providers`) must never appear in a
  `"use client"` file.
- Keep bundle discipline: tabs are lazy-loaded; icons/illustrations are inline
  SVG (no icon library).
- After changing `sw.js`, bump `VERSION` — users get the in-app update toast.
