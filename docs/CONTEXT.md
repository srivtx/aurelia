# AURELIA — Context & Contribution Guide

> **Purpose of this file:** everything a new contributor needs to understand the
> repo in one read — what the app is, where everything lives, the design system,
> the deep-tech engines, the research that drove the decisions, and how to work
> on it safely (hydration rules!). Read this before touching code.
>
> Last updated: 2026-09-09 · App version: `aurelia-v4` (service worker)

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

Stack: **Next.js 15 (App Router) · TypeScript · Tailwind v4 · zustand ·
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
      stylist/route.ts    # AI chat: multi-provider, NDJSON token streaming, RAG grounding (keys live ONLY here)
      models/route.ts     # provider/model discovery for the in-app picker
  components/aurelia/
    shell.tsx             # blur header + 5-tab bottom nav (layoutId pill)
    bits.tsx              # Card, Chip, Eyebrow, SectionHeader, SaveButton, Do/Dont…
    sheet.tsx             # framer-motion bottom sheet w/ drag-dismiss
    icons.tsx             # ALL line icons (24px grid, currentColor — stroke follows text color)
    illustrations.tsx     # ALL illustrations (line art + soft fills, CSS-var colors → dark-mode aware)
    markdown.tsx          # markdown-lite renderer for chat replies (XSS-safe, no deps)
    stylist-chat.tsx      # full-screen chat: streaming, model picker, quick prompts
    platform-bridge.tsx   # WebMCP registration · storage persistence · badge · share-target handoff
    search-sheet.tsx      # global search with relevance grouping + deep-opens
    onboarding.tsx        # 3-step first-run (name / skin / vibe)
    season-analysis.tsx   # 12-season wizard + result (signal profile, palette, badge)
    outfit-lab.tsx        # outfit scorer UI (factor bars, 60-30-10 roles, season fit)
    photo-analyzer.tsx    # photo → palette (on-device k-means) + share-target pickup
    ingredient-lab.tsx    # actives sequencer (AM/PM timelines, conflicts)
    face-meter.tsx        # anthropometric face-shape classifier + morphing SVG
    passport-card.tsx     # Beauty Passport export/import (Home tab)
    tabs/                 # home · colors · makeup · skin · hair
  data/                   # pure content: colors, palettes, seasons, actives, makeup, skincare, hair, tips
  lib/
    store.ts              # zustand store (persist, skipHydration — see §4)
    color-science.ts      # sRGB↔XYZ↔Lab, CIEDE2000, WCAG contrast, warmth, harmony, naming
    seasons (data)        # 12-season archetypes + classifier (signal vector → nearest archetype)
    outfit-engine.ts      # outfit scoring: hue geometry, lightness/chroma/warmth, 60-30-10
    routine-engine.ts     # AM/PM sequencer: pH order, slots, photosensitivity, conflicts
    palette-extract.ts    # deterministic k-means++ in Lab space from an image
    face-shape.ts         # ratios (L/C, F/C, J/C) → 6 shapes + confidence
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
| Photo palette | `lib/palette-extract.ts` | Canvas downscale → Lab pixels → deterministic k-means++ (LCG-seeded) → ΔE2000 merge. 100% on-device. |
| Face meter | `lib/face-shape.ts` | Anthropometric ratios → 6 shapes + confidence; live-morphing parametric SVG. |
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
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Local dev, free model setup (Groq/Gemini/…), Vercel/Docker deploy, troubleshooting |
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
node scripts/e2e-chat-fixes.mjs    # markdown rendering, chat contrast, model picker, dark tokens
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
