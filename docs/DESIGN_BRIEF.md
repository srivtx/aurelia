# Design Brief — "Aurelia" (working name)
## Mobile-first PWA · Fashion & Beauty Tips for Gen-Z Women (16–25)
**Domains:** color combinations · makeup basics · skincare basics · hairstyles

**Research sources (2025–2026):** live web research on beauty/fashion app UI trends, Material/HIG navigation guidelines, NN/g animation research, PWA UX guidance (web.dev, Lollypop Design 2025), brand-color analysis of Sephora, Glossier, Rare Beauty, Ulta, Pinterest. This brief is opinionated and final — treat it as the design system source of truth.

---

## 0. Design Direction: "Soft Editorial"

One sentence: **a glossy magazine that happens to be an app.**

The winning formula in 2025–26 beauty products (Rare Beauty, Glossier, Rhode, Beautylish, Whiite) is *warm minimalism*: cream backgrounds, muted dusty tones, editorial serif headlines, generous whitespace, faceless line illustrations. It reads sophisticated rather than childish — which is exactly what the 16–25 audience wants (they reject "pink-for-girls" clichés but respond strongly to soft, aesthetic, curated looks).

Three pillars:
1. **Warm, not saccharine** — cream + dusty rose + terracotta instead of hot pink + purple.
2. **Editorial, not dashboard** — serif display type, magazine-style cards, one idea per screen.
3. **Calm, not gamified** — subtle motion, no confetti spam, no badge anxiety.

---

## 1. Color Palette (exact hex codes)

### 1.1 What the top players use (researched)

| App/Brand | Formula | Lesson |
|---|---|---|
| **Sephora** | Near-black `#000000` / white, red accent `#E9002F` | High contrast = luxury; but too corporate for a tips app |
| **Glossier** | Cool pale pink `#FCE6E9` (packaging), light blue `#B8E2F0`, mint `#CDE9DD`, peach `#FDD7C4` | Pale pastels on white feel fresh, but too low-contrast alone |
| **Rare Beauty** | Warm cream + deep berry `#7D0033` + terracotta neutrals | **Closest to target**: warm, mature, soft — our north star |
| **Pinterest** | Neutral gray/white UI, content provides the color | Content-first chrome; don't compete with photos |
| **Ulta / Sephora apps** | Loyalty orange/black, dense retail UI | Anti-example: retail clutter to avoid |

**Conclusion:** take Rare Beauty's warm-cream canvas, Glossier's pastel accents (deepened for contrast), and Pinterest's neutral chrome.

### 1.2 Core palette — LIGHT mode (default)

**Base / neutrals (warm, never blue-gray):**

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FAF7F3` | App background (warm ivory, softer than pure white) |
| `surface` | `#FFFFFF` | Cards, sheets, inputs |
| `surface-muted` | `#F5EFE9` | Chips, segmented controls, code-like blocks, masonry tiles |
| `surface-deep` | `#EFE7DF` | Pressed state, subtle zones, skeleton base |
| `border` | `#E7DDD4` | 1px card hairlines (plus `border-soft: #F0E8E0`) |

**Primary — Dusty Rose (brand):**

| Token | Hex | Usage |
|---|---|---|
| `rose-100` | `#F6DDE3` | Active tab pill, selected chip bg, tint fills |
| `rose-200` | `#EDB9C5` | Illustration fills, progress track |
| `rose-400` | `#D2718A` | Dark-mode-safe accents, gradient end |
| `rose-500` | `#C25A76` | Large graphic fills, illustration brand tone |
| **`rose-600`** | **`#A84A62`** | **Primary buttons, links, active tab text/icon** (4.6:1 on `#FAF7F3` ✓) |
| `rose-700` | `#8C3B50` | Button pressed, hover (pointer) |
| `rose-800` | `#6A2C3C` | Deep text-on-light-rose, hero overlay text |

**Secondary — Terracotta:** `terra-300 #E9B095` · `terra-400 #D99272` · **`terra-500 #C97B58`** (links-secondary, "New" badges, gradient partner) · `terra-600 #B06242`

**Accent — Gilded Amber (CTA sparkle):** `#D9A441` for stars, "Pro tip" ✦, save-highlight. Use ≤1 per screen.

**Text (warm ink):**

| Token | Hex | Usage |
|---|---|---|
| `ink-900` | `#2D2320` | Headlines, body (warm espresso-black, never `#000`) |
| `ink-600` | `#5A4E46` | Secondary text, captions, icon strokes |
| `ink-400` | `#9C8F85` | Placeholders, disabled, meta ("5 min read") |

**Semantic:**
- Success (sage): `#3E7C5B` text / `#DCEAE1` bg — used for skin-type match, "routine complete"
- Warning (honey): `#B4761F` text / `#F7ECD9` bg — "patch test first" notices
- Error (warm coral, not neon red): `#B5483F` text / `#F9E5E2` bg
- Info: use `rose-600` / `rose-100` (brand doubles as info)

### 1.3 Category accent system (key idea)

Each of the 4 content pillars gets its own hue — all drawn from the same warm-muted family so the app stays cohesive:

| Pillar | Accent hex | Icon | Tint bg |
|---|---|---|---|
| **Color Combos** | Terracotta `#C97B58` | palette | `#F7E9E0` |
| **Makeup** | Berry-rose `#C25A76` | lipstick | `#F6DDE3` |
| **Skincare** | Sage `#7FA08C` | droplet / lotus | `#E7EFE9` |
| **Hairstyles** | Caramel-bronze `#C39A6B` | scissors | `#F5EBDD` |

Use for: tab-icon tints on category screens, section eyebrows, hero-illustration fills, chip accents. This one trick makes the app feel "designed as a system" instantly.

### 1.4 DARK mode (mandatory — 82% of Gen-Z mobile users prefer dark; it's an expectation in 2025, not a feature)

Warm plum-charcoal — **never** pure black or blue-slate:

| Token | Hex | Notes |
|---|---|---|
| `bg-dark` | `#1C1518` | Warm near-black plum |
| `surface-dark` | `#261E22` | Cards |
| `surface-dark-elev` | `#322830` | Sheets, menus, inputs |
| `border-dark` | `#3E3339` | Hairlines |
| Text primary | `#F2E9E6` | Warm off-white |
| Text secondary | `#C9BBB6` | |
| Text muted | `#938378` | |
| `rose-300` | `#E095A7` | **Primary in dark mode** (text, icons, active tab) |
| `rose-400` | `#D2718A` | Filled primary buttons w/ `#2D1519` text |
| Terracotta | `#E0A183` | Secondary accent |
| Success | `#86C9A4` · Warning `#E3B36A` · Error `#E8847C` | Lightened for dark bg |

**Rules:** dark mode darkens the canvas and *lifts* accents one step lighter; category tints get +10% lightness (e.g. skincare `#9DBBA6`). Shadows become `border-dark` strokes + `rgba(0,0,0,0.4)` only on overlays. Photo/illustration content is tone-mapped with `filter: saturate(0.92)` to sit in the warm dark canvas.

### 1.5 Gradients (the only two allowed)

1. **Hero blush gradient:** `linear-gradient(135deg, #F6DDE3 0%, #F5EFE9 55%, #E9B095 130%)` — background for hero card.
2. **Rose CTA gradient (rare, max 1/screen):** `linear-gradient(135deg, #C25A76, #A84A62)`.

Everything else is flat. **No purple-pink gradients, no rainbow, no glassmorphism.**

---

## 2. Typography

### 2.1 The pairing (decisive pick)

- **Display/headings: `Fraunces`** (Google Fonts, variable) — the modern successor to Playfair; has a *SOFT* axis that literally rounds the serifs → editorial but friendly, feminine but contemporary. Weight 500–600, optical size auto. *(Fallback if Fraunces feels too quirky: `Playfair Display` 500/600.)*
- **UI/body: `Nunito Sans`** — humanist, slightly rounded terminals; reads friendly to a 16–25 audience where Inter feels "corporate SaaS." Weights: 400, 600, 700. *(Fallback: `Inter` for dense data UI like comparison tables.)*
- **Mono (tiny, optional):** none. Skip monospace entirely.

Load via Google Fonts with `display=swap`, subset `latin`, self-host woff2 in the PWA shell for offline. Total payload budget: ≤ 120 KB.

### 2.2 Type scale (mobile, base 375–390 px; line-heights on a 4 px rhythm)

| Role | Font | Size / line-height | Weight | Tracking | Color |
|---|---|---|---|---|---|
| Display (onboarding hero, one per app) | Fraunces | 36/40 | 500 | −0.5% | `ink-900` |
| **H1 screen title** | Fraunces | 28/34 | 600 | −0.3% | `ink-900` |
| H2 section title | Fraunces | 21/26 | 600 | 0 | `ink-900` |
| H3 card title | Nunito Sans | 17/22 | 700 | −0.1% | `ink-900` |
| Body L (tip text) | Nunito Sans | 16/24 | 400 | 0 | `ink-900` |
| Body S (descriptions) | Nunito Sans | 14/20 | 400 | 0 | `ink-600` |
| **Button / action** | Nunito Sans | 15/— | 700 | +0.2% | on-rose `#FFF` |
| Chip / tag | Nunito Sans | 13/— | 600 | +0.2% | category hex |
| Caption / meta | Nunito Sans | 12/16 | 400 | +0.2% | `ink-400` |
| Eyebrow (overline) | Nunito Sans | 11/14 | 700 | **+12%**, UPPERCASE | category hex |

**Rules:** Fraunces never below 18 px. Never more than 2 typefaces. Body text never `ink-400`. Line length 45–70 characters (max ~65% of card width for long tips).

### 2.3 Editorial touches that sell "magazine"

- Eyebrow + serif H2 combos: `COLOR THEORY` (terracotta, tracked out) above "Why navy + camel always works".
- Italic Fraunces (`font-style: italic`, opsz high) for pull-quotes in tip articles.
- Numbers in Fraunces for step counters ("Step 2 of 5") — instantly premium.

---

## 3. Layout & Navigation

### 3.1 Bottom tab bar (primary nav)

- **Exactly 5 tabs** (Material & HIG agree: 3–5; 4 if no search): `Home · Explore · Search · Saved · You`. If Search is dropped, 4 tabs + a floating search bar in the header.
- **Icons + text labels, always.** Icon-only tabs are the #1 discovery killer; labels stay ≤9 chars ("Home", "Explore", "Saved").
- Geometry: height **64 px** + `env(safe-area-inset-bottom)`; icons 24 px (2 px stroke), labels 10.5 px/600; tab tap target ≥ 48×48 px.
- **Active state = "pill" pattern** (iOS 18 / Material 3 style): icon sits in a rounded-full `rose-100` pill (32×32, radius 16) that animates in; icon + label `rose-600` (dark: pill `#3A2A2E`, icon `rose-300`). Inactive = `ink-400`.
- Background: `rgba(250,247,243,0.88)` + `backdrop-filter: saturate(180%) blur(20px)` + 1 px top hairline `#E7DDD4`. Dark: `rgba(28,21,24,0.88)`.
- Center-scroll behavior: on scroll-down hide? **No — keep persistent** (young users thumb-hop; hiding tabs in a browse app causes rage-taps). Only the FAB, if any, hides.

### 3.2 Grid & spacing (4/8 pt system)

- All spacing from: **4, 8, 12, 16, 24, 32, 48, 64**. (12 is a legal half-step for chips; never 5, 10, 15, 18.)
- Screen horizontal padding: **20 px** (16 px minimum on ≤360 px devices).
- Content **max-width 480 px**, centered, `padding-inline: max(20px, (100vw - 480px)/2)`. Tablet: 2-column ≥ 768 px, 3-column ≥ 1024 px.
- Section rhythm: 24 px inside a section, **48 px between sections**.
- Card internal padding 16 px (image-less tip cards 20 px). Card gap 12 px (dense feed) / 16 px (editorial feed).

### 3.3 Cards

- Radius scale: **12 px** (chips, small), **16 px** (standard cards), **20 px** (hero/sheets), **24 px** (modals) + full-round (pills).
- **Flat card design:** `surface` bg + 1 px `border` + optional `0 2px 8px rgba(45,35,32,0.05)`. No big shadows, no borders+shadows+gradients stacked.
- Feed card (editorial): image 16:10 radius 16 (clip), then 12 px gap, H3 (max 2 lines), caption row (category dot + "3 min" + save icon 40×40 tap target).
- Lookbook/masonry: 2-col, 12 px gutter, tiles radius 12, mixed heights — pure Pinterest energy, no text overlay except 1-line chip.
- Step cards (how-tos): numbered Fraunces badge in `rose-100` circle 28 px.
- **One card = one idea.** Max 3 distinct content types visible per viewport.

### 3.4 Headers, safe areas, scroll

- Sticky header: `backdrop-filter: blur(20px) saturate(180%)` on `rgba(250,247,243,0.85)`; H1 lives in header (28 px → shrinks to 17 px compact after 96 px scroll, cross-fade 200 ms).
- `viewport-fit=cover` + `env(safe-area-inset-top/bottom)` everywhere (iOS notch/Dynamic Island, Android gesture bar).
- Momentum scrolling; `overscroll-behavior-y: contain` to stop page bounce; `scrollbar-width: none` for app feel.
- Pull-to-refresh: custom branded spinner (rotating 24 px lipstick/petal line icon in `rose-600`) — not the default browser chrome.
- Back-swipe gesture edge 24 px (iOS) — keep; ensure horizontal carousels don't start within 24 px of screen edge.

### 3.5 Anti-clutter rules (hard numbers)

- Whitespace ≥ 48 px above the fold's primary CTA; a screen must be at least 40% empty at rest.
- **1 primary action** per screen (rose-600 button); everything else is text/ghost.
- Max 5 carousels per home feed, each with a "See all" eyebrow link.
- Chips row = max 6, horizontally scrollable, no wrap-to-jungle.
- Empty states get an illustration + 1 line + 1 action — never a dead-end message dump.

---

## 4. PWA-Specific Design

Goal: indistinguishable from a native app once installed. (Lollypop 2025 PWA research: branded splash + home-screen icon = the two moments that decide "is this an app or a website".)

**Manifest & identity**
- `display: standalone`, `display_override: ["standalone", "minimal-ui"]`, `orientation: "portrait"`, `start_url: "/?source=pwa"`.
- `background_color: #FAF7F3` (light) / `#1C1518` (dark) — this paints the iOS/Android splash.
- `theme_color: #FAF7F3` / dark `#1C1518`; ship **both** `<meta name="theme-color" media="(prefers-color-scheme: light|dark)">` variants. Status bar: `black-translucent`.
- Icons: 192, 512 + **maskable** (content within 80% safe-zone circle) + `apple-touch-icon` 180 px. Icon design: rose-600 rounded-square, cream line-art lipstick/palette glyph — no text, no gradients.

**App shell feel**
- **App shell architecture:** shell (tab bar, header, bg) renders instantly from cache; content hydrates with skeletons.
- **Skeletons, never spinners:** shimmer sweep `linear-gradient(90deg, #EFE7DF → #F7F2ED → #EFE7DF)` 1.4 s, matching final card geometry.
- **Offline-first:** tips content cached (stale-while-revalidate); offline indicator = subtle toast "You're offline — tips still available", not a blocking screen.
- Kill web tells: no text-selection on UI (`user-select: none` except article body), `-webkit-tap-highlight-color: transparent`, no zoom (inputs ≥ 16 px font), `touch-action: manipulation` on buttons, `100dvh` not `100vh`, disable double-tap zoom.
- **Custom install prompt:** after 2nd session or 30 s engaged, show in-feed card (not a blocking modal): "Add to Home Screen — your pocket beauty editor ✦" with phone-mock illustration. Trigger `beforeinstallprompt` from the card.
- Update flow: silent SW update → toast "Fresh looks just dropped — Refresh".
- Deep-link every tip card (shareable URLs) — Gen-Z shares via link screenshots; make real links that open to the same screen.

---

## 5. Micro-interactions & Animation

Global law: **everything ≤ 400 ms, nothing blocks input.** (NN/g & industry consensus: 200–300 ms for feedback; ease-out for ~90% of animations; linear only for spinners/shimmer.)

**Durations**

| Interaction | Duration | Easing |
|---|---|---|
| Button press → scale 0.97 | 100 ms | ease-out |
| Chip/tab pill select | 150 ms | spring `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Tab content swap (fade + 8 px slide) | 150 ms | ease-out `cubic-bezier(0, 0, 0.2, 1)` |
| Card enter (staggered feed) | 300 ms each, **40 ms stagger**, max 6 staggered then instant | ease-out |
| Bottom sheet up | 320 ms | spring `cubic-bezier(0.32, 0.72, 0, 1)` |
| Hero parallax (image 0.6× scroll) | scrub, no easing | linear (scroll-linked) |
| Save/heart burst | 400 ms total: scale 1→1.25→1 | spring; optional 6-particle petal burst at 12 px radius |
| Pull-to-refresh spinner | 0.9 s/rotation | linear |
| Skeleton shimmer | 1.4 s loop | linear gradient sweep |
| Header large→compact shrink | 200 ms | ease-in-out `cubic-bezier(0.4, 0, 0.2, 1)` |

**Signature moments (pick 2, execute perfectly)**
1. **Staggered feed entrance** on tab open: cards `opacity 0→1, translateY 12 px→0`, 300 ms ease-out, 40 ms stagger — this *alone* makes the app feel expensive.
2. **Save heart:** heart fills `rose-500`, spring-pop, tiny petal confetti (max 6 particles, 8 px, fade at 400 ms). Delight without casino vibes.

**Accessibility:** wrap all motion in `@media (prefers-reduced-motion: reduce)` → durations 0, opacity-only transitions. Never animate layout-critical properties on scroll; transform/opacity only (60 fps).

---

## 6. Custom SVG Illustration System

**Style: "faceless fashion line art + soft blush fills"** (validated as the dominant beauty-editorial illustration trend on Pinterest/Adobe Stock — elegant, inclusive by not drawing specific faces, tiny file sizes).

### 6.1 Rules
- Stroke: **1.5 px** (icons) / 2 px (heroes) consistent, round caps + joins, color `ink-600 #5A4E46` (dark: `#C9BBB6`).
- Fills: flat pastel from category tints (see §1.3) or `rose-100/200`; **max 2 fill colors per illustration** + line color.
- Faces: blank (no eyes/nose) or single line — the faceless fashion-croquis look. Hair and silhouettes carry the identity.
- Behind heroes: one soft radial blob `rose-200` at 60% opacity → transparent, `border-radius` organic path.
- Line art over blurred photo = forbidden; pure geometry only.
- Export: inline `<svg>` for interactive/tinted art (uses `currentColor`); `<img>` for static. viewBox 24 (icons) / 96 (spots) / 240–320 (heroes).

### 6.2 Tab bar icons (24 px grid, 2 px stroke, round caps — outlined inactive, filled-tinted active)
- **Home:** magazine/sparkle — 4-point star sparkle (sparkle also doubles as the app glyph).
- **Explore:** compass or grid-of-squares (masonry).
- **Search:** magnifier.
- **Saved:** heart outline (→ filled rose on active).
- **You:** faceless head-and-shoulders bust (matches illustration style — cute, on-brand).

### 6.3 Category icons (used as section markers, 24 px, category-hue stroke)
- **Colors = palette** (classic artist palette with 3 thumb-dots) or 3 overlapping color swatches.
- **Makeup = lipstick** (bullet angled at 45°, iconic silhouette, reads at 16 px).
- **Skincare = droplet** (single 2-curve droplet, optionally lotus if a botanical vibe is preferred — droplet tests better at small sizes).
- **Hair = scissors** (two circles + two blades crossing — instantly legible).

### 6.4 Component illustration set (build these 8 first)
1. **Onboarding hero (320 px):** faceless girl, hair in bun, holding oversized palette — blush blob bg.
2. **Empty Saved:** open hand-mirror with sparkle + "Nothing saved yet".
3. **Offline page:** droplet with a small umbrella.
4. **Quiz/quiz-start:** faceless girl with thought-bubble containing the 4 category icons.
5. **Category hero strips (96 px each):** lipstick / palette / droplet / scissors in their tint.
6. **Success/routine-complete:** sage lotus with check.
7. **Error states:** tilted lipstick, uncapped, single sweat-drop (tasteful humor).
8. **Install-prompt card:** phone mock with sparkle.

### 6.5 Photo treatment
Photos (outfit inspo, hair refs): full-bleed in cards, radius 16, no filters except dark-mode `saturate(0.92)`. Captions live *below* images, never overlaid — this keeps the clean editorial look and accessibility.

---

## 7. Anti-Patterns (what makes beauty apps feel cheap)

**Color crimes**
- Hot pink + purple gradients (the 2018 Instagram-baddie cliché — instantly dated).
- Pure black (`#000`) dark mode with neon accents — harsh, battery-optimized but ugly on OLED skin tones.
- Rainbow category colors that don't share a family → "sticker album" effect.

**Layout crimes**
- Hamburger menu on mobile (unreachable, unscannable — put it in tabs).
- Scrapbook clutter: borders + shadows + patterns + badges stacked on one card.
- 6+ carousels above the fold (Sephora-app disease); infinite "SEE MORE ↓" walls.
- Text overlaid on busy photos without scrims below 4.5:1.
- Touch targets < 44 px; like buttons at 24 px.

**Motion crimes**
- Confetti for everything; slot-machine reward wheels.
- Loading spinners where skeletons belong; full-screen blockers on tab switches.
- Parallax on every card; autoplaying video in feed (data + battery + anxiety).

**Content/UX crimes**
- Forced account creation before first tip is shown (let them browse 3 screens, then ask).
- Fake urgency ("Only 2 left!") and push-notification spam.
- Baby talk + emoji spam in UI copy ("Ooooh so pretty!!! 💖✨"). Editorial tone: warm, competent, magazine-subheading voice.
- Stock photos with visible watermarks; AI-face images with uncanny eyes.
- Font soup: 3+ typefaces, or script/handwritten fonts in body text.

**Accessibility misses (instantly "cheap" to discerning users)**
- `#FFF` text on `rose-400`; caption text at 11 px below 4.5:1; color-only category coding (always pair icon + label).

---

## 8. Token Quick-Reference (implementation cheat sheet)

```css
:root {
  /* Light */
  --bg: #FAF7F3;         --surface: #FFFFFF;    --surface-muted: #F5EFE9;
  --surface-deep: #EFE7DF; --border: #E7DDD4;
  --primary: #A84A62;    --primary-soft: #F6DDE3; --primary-graphic: #C25A76;
  --secondary: #C97B58;  --accent: #D9A441;
  --text: #2D2320;       --text-2: #5A4E46;     --text-3: #9C8F85;
  --success: #3E7C5B;    --warning: #B4761F;    --error: #B5483F;
  --cat-color: #C97B58;  --cat-makeup: #C25A76; --cat-skin: #7FA08C; --cat-hair: #C39A6B;
  --r-sm: 12px; --r-md: 16px; --r-lg: 20px; --r-xl: 24px;
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-6: 24px; --sp-8: 32px; --sp-12: 48px; --sp-16: 64px;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-inout: cubic-bezier(0.4, 0, 0.2, 1);
  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 150ms; --dur-base: 300ms; --dur-slow: 320ms;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1C1518;        --surface: #261E22;    --surface-muted: #322830;
    --border: #3E3339;    --primary: #E095A7;    --primary-soft: #3A2A2E;
    --text: #F2E9E6;      --text-2: #C9BBB6;     --text-3: #938378;
    --secondary: #E0A183; --success: #86C9A4;    --warning: #E3B36A; --error: #E8847C;
  }
}
```

**Fonts:** `Fraunces` 500/600 (+ italic) for H1/H2/Display; `Nunito Sans` 400/600/700 for everything else.
**Type scale:** 36/40 · 28/34 · 21/26 · 17/22 · 16/24 · 14/20 · 12/16 · button 15/700 · eyebrow 11/+12%.
**Tab bar:** 64 px + safe-area, 5 tabs, 24 px icons, pill active state.
**Screen:** 20 px gutters, 480 px max content, 48 px section gaps, 16 px card radius.
**Motion:** ≤ 400 ms, ease-out default, 40 ms stagger entrance, heart-burst signature.
**PWA:** standalone + maskable icon + branded splash (`#FAF7F3`) + skeletons + cached tips + custom install card.

---

*End of brief. Build the design system directly from §8; every value above is final and internally consistent.*
