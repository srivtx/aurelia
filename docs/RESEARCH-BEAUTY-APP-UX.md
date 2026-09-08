# Research: Feature & UX Benchmark for Consumer Beauty/Style Tips Apps (2025–2026)

**Task ID:** R-2 · **Type:** Research only (no code changes)
**Goal:** Identify what makes free beauty/style content apps win ratings + retention, and what Aurelia must add to feel complete and loved.
**Method:** 21 live web searches via `z-ai` CLI (`web_search`) covering app-store listings, product reviews, UX pattern articles, and beauty content sites; findings cross-checked against Aurelia's current code (`src/data/*`, `src/components/aurelia/*`, knowledge bases). Search snippets are the primary external evidence; interpretation and best-practice synthesis are labeled where they come from internal expertise.

---

## 1. Competitive landscape — what top free beauty/style apps do

Aurelia's true competitors are NOT the AR giants (no selfie-camera magic in a PWA), but five categories of **content-led** apps. Ratings/retention drivers per category:

### 1.1 AR / virtual try-on (YouCam Makeup, Perfect365, GlowUp)
- YouCam Makeup: 300M+ installs; praised for "great makeup tutorials & try any look" (play.google review). Perfect365: **4.8★ / 183K ratings**, top review keywords: "FREE", "fun", "so many styles".
- GlowUp (App Store): *"The tutorials are so intuitive, it's like having a makeup mentor 24/7"* — **the single most relevant quote for Aurelia**: the *mentor/24-7 big-sister* feeling is what users rate 5 stars, not AR itself.
- Lesson for Aurelia: don't chase AR. Chase the "mentor in your pocket" feeling: step-by-step, zero judgment, always available, offline.

### 1.2 Skincare routine trackers (Skin Bliss, FeelinMySkin, BasicBeauty, Skincare Routine)
- Skin Bliss (App Store pitch): "AI skin analysis, personalized routines, and smart tracking."
- FeelinMySkin: scan products, build routines, **reminders**, "track what you used & when", **photo comparison of skin over time**, logs mood/period/sleep.
- BasicBeauty + skincareroutine.app: **AM/PM checklists you tick off each day**; "your best skin habit is the one you actually keep" (Play listing).
- Lesson: the daily-open habit in this category = **checkable routine steps**. This is the single strongest retention mechanic in skincare apps, and Aurelia has zero of it.

### 1.3 Color analysis apps (Dressika, Colorwise.me, Show My Colors, My Best Colors)
- Dressika: "12 seasons theory → find your colour season, personal colour palette, clothing colours, makeup shades, and hair [colours]."
- Colorwise.me (free): **virtual draping, outfit recoloring, photo→palette extraction, capsule palettes**.
- My Best Colors: free 12-season palettes + premium "Complementary, Neutral, Accent, Jewelry, Eyeshadow" palettes.
- Lesson: the category's core promise is **"YOUR personal palette"** (a result you keep + reference). Aurelia has an undertone finder (3-result, warm/cool/neutral) — competitors deliver a **12-season result with a saved palette + "colors to avoid"**. This is the biggest content gap vs. the category.
- Pinterest data point: **73% say visual search results outperform traditional search** (Pinterest Business) — visual-first browsing is table stakes for discovery.

### 1.4 Visual inspiration / boards (Pinterest, Lemon8)
- Pinterest's whole UX = **discover → save to boards → return to boards**. "When you discover Pins you love, save them to boards to keep your ideas organized" (official help).
- Lemon8 (the fastest-growing beauty content app with Gen Z): beauty tutorials with **step-by-step image carousels**, likes, collections, comments.
- Lesson: "save" only creates value when saves are **organized and revisitable**. Aurelia saves favorites into one flat list — the boards/collections pattern (group by module, rename, e.g. "Date night", "My colors") is the upgrade.

### 1.5 Offline content apps (Apkpure "Beauty Tips", "Eye Makeup Step By Step HD", etc.)
- The #1 marketing line in these listings is literally: *"Beauty tips once viewed are saved offline and No Internet Required after that"* + "Easy Navigation."
- Lesson: **offline + simple navigation is a headline feature for this audience**, not a nice-to-have. Aurelia already has this — it should be *marketed inside the app* (install card copy) and paired with the other rating driver these apps get dinged for lacking: **no ads, no signup, no tracking**.

### Retention data points (from gamification research)
- Duolingo: users with a 7-day streak are **3.6× more likely to stay engaged long-term** (orizon.co).
- Counter-evidence (RevenueCat / Daphne Tideman): **streaks aren't the secret to retention** — badly designed streaks create "false pressure and resentment"; streaks work only when daily use genuinely matches the user's goal. Reddit r/UXDesign consensus: streaks become stressful.
- Synthesis (internal): for a tips app, use a **gentle streak** (visit counter with grace/freeze days, no shaming, weekly "you learned 7 tips this week" summary), never loss-framed red banners.

### Discovery/behavior data points (Gen Z)
- TikTok usage for beauty content has risen to **53%** among Gen Z (Attest 2025); **70%+ of Gen Z discover beauty products on social first** (selfnamed); TikTok reports **83% of shoppers discovered products on the platform** (cosmeticsandtoiletries).
- Trend directions 2025–2026: **skinimalism** (fewer products, skin-like finishes), authenticity/inclusivity, "blurred lips"/cream textures, K-beauty normalization.
- Lesson: Aurelia's tone (skin-first, 12-product starter kit, "technique beats price tag") is *exactly* on-trend — surface this as a content narrative ("less, but better"), not a new philosophy.

---

## 2. Content depth expectations — what a "complete" beauty-101 app covers

Status vs. Aurelia current content (✓ = covered in KB/data, △ = partially thin, ✗ = gap).

### 2.1 Makeup basics
| Topic | Status |
|---|---|
| Order of application (full routine, with "why" per step) | ✓ (12-step golden order) |
| Beginner starter kit (budget, ~12 items) | ✓ |
| Skin prep before makeup | ✓ (step 1) |
| Foundation shade matching + undertone | ✓ |
| Concealer / contour vs bronzer vs blush / powder vs spray | ✓ |
| Occasion looks (step-by-step, timed) | ✓ (5 looks) |
| Beginner mistakes + myths | ✓ (10 + 8) |
| Tool hygiene, wash frequency, product expiry | ✓ |
| Makeup removal / double cleansing | ✓ |
| Eyeliner styles by eye shape | ✓ |
| Mini glossary | ✓ |
| **Face-shape guide → where blush/contour/brows go** | ✗ (big-sis apps all map placement by face shape — oval/round/square/heart/long) |
| **Eyeshadow placement by eye shape (hooded, monolid, round, almond)** | △ (eyeliner only) |
| **Brushes 101 — what each brush does + finger/sponge swaps** | △ (tool care exists, no visual brush map) |
| Makeup removal for stubborn products / on a breakout day / school-friendly rules | △ |
| Photo-flash/flashback basics, desk-to-evening transitions | ✗ |
| How to read a makeup label (PAO symbol, expiry) | △ (expiry cheat sheet exists — could surface as interactive) |

### 2.2 Skincare basics
| Topic | Status |
|---|---|
| 5 skin types + how to identify | ✓ |
| Interactive skin-type quiz with scoring | ✓ (10-Q, verified) |
| AM/PM routines per type | ✓ |
| Hero ingredients / avoid per type | ✓ (13 ingredients) |
| Ingredient mixing rules | ✓ (check vs. full conflict matrix below) |
| Sunscreen deep dive | ✓ |
| Myths + habits | ✓ (12 + habits) |
| Medical disclaimer + derm guidance | ✓ |
| **Acne 101: types of breakouts (whiteheads/blackheads/cystic), what causes them, spot-treatment do/don't, when to see a derm** | ✗ (editorial note only — this is the #1 searched skin topic for 16–25) |
| **Acne-scar/dark-mark basics (PIH), why picking is the enemy** | △ |
| **Building your first routine / introducing actives slowly (2-week rule)** | △ (implied in habits) |
| **Skin barrier 101 — "repair mode", over-exfoliation signs** | ✗ |
| Ingredient **conflict checker matrix UI** (retinol×vitamin C, etc.) — competitors (skinsort, skincareconflict.com, INKEEDecoder) make this *the* hero feature | △ (mixing rules exist as content; not an interactive lookup) |
| Seasonal routine adjustment (winter dryness, summer oil) | ✗ |
| Eye cream / dark circles basics, body care, lip care | ✗ |
| Minimal 3-step routine ("skinimalism") | △ |

### 2.3 Color styling
| Topic | Status |
|---|---|
| Color → matches engine (bidirectional) | ✓ (19 colors) |
| Curated palettes | ✓ (15) |
| Color theory crash course, 4 schemes, 60-30-10 | ✓ |
| Warm/cool undertone self-tests | ✓ |
| 10 rules of thumb | ✓ |
| **12-season personal color analysis (season result → your palette + avoid list)** | ✗ — the defining feature of the category (Dressika, Colorwise, My Best Colors, color-analysis.app "2-minute quiz") |
| **Jewelry & metallics by undertone (gold vs silver)** | ✗ (competitors include Jewelry palettes) |
| **Prints & patterns mixing (stripes/leopard-as-neutral/florals)** | ✗ |
| Capsule wardrobe palette building from existing clothes | △ (capsule palettes exist as static content; no "build YOUR capsule" flow) |
| Photo → extract your outfit palette | ✗ (P2 — Colorwise does this) |

### 2.4 Hair
| Topic | Status |
|---|---|
| Styles by outfit category (8 × 3) | ✓ |
| 10 master styles with steps | ✓ |
| 6 face shapes + which styles suit | ✓ |
| Prep: second-day hair, dry shampoo, detangling | ✓ |
| 8 quick fixes | ✓ |
| **Hair types/texture guidance (fine/thick/curly variations)** | ✗ (assumes medium/long straight-ish) |
| **Heat tools 101 + heat protection (temps, curling/straightening safety)** | ✗ (explicitly "no heat" scoped) |
| Overnight/heatless expanded (rope braid waves, bun methods) | △ (heatless curls + overnight waves exist) |
| Hair care basics (wash frequency, split ends, oils, silk) | △ (silk scrunchies tip; no dedicated care section) |
| Accessories deep-dive (claw clips sizes, scarves, pins placement) | △ |
| "Bad hair day" emergency matrix by time budget (2/5/10 min) | △ (quick fixes flat list) |

### 2.5 Cross-cutting
| Topic | Status |
|---|---|
| Daily tips | ✓ (24, day-rotating) |
| **All-tips browsable archive/library** | ✗ (only today's tip is reachable) |
| Saved favorites | ✓ (flat list) |
| **Saved collections/boards, notes** | ✗ |
| **Global search** | ✗ (0 search in code; with ~5,300 lines of content this is the biggest navigational miss — Pinterest 73% visual-search preference shows discoverability = love) |
| Dark mode, offline PWA | ✓ |
| Onboarding/personalization | ✗ (no name capture, no profile) |

---

## 3. Onboarding & personalization patterns for content apps

Best-practice synthesis from search (uxcam, VWO, nextnative, setgreet, pushwoosh, scandiweb, blueconic, everydayindustries, quizify, nngroup):

1. **"Only ask what you will visibly act on"** (setgreet 2026 — called *the* rule of personalization questions). Every question must change something the user sees within the first session.
2. **5–7 questions max, one per screen**, big tappable cards, progress bar, always skippable ("I'll do this later"). Outcome quizzes convert best with visual answer options (quizify: "incorporate visual elements").
3. **Name collection is the #1 personalization cheap win** — greeting ("Good morning, Maya") in fashion/Duolingo-style apps; optional, never required.
4. **Quiz → visible result transformation**: the gold standard is quiz answers *re-render the home screen* ("For your combination skin…", "As a Deep Winter, swap black for navy"). Persona/archetype results are the most-shared asset type (formester outcome quiz guide) — share loops start at onboarding.
5. **Zero-party data framing** (blueconic): users happily answer quizzes when the value exchange is explicit ("Answer 6 questions → get your personalized routine"). Never ask for email/login to see results (rating killer in this category).
6. **Context-based progressive onboarding** (pushwoosh): don't front-load; ask hair-type later, the first time the user opens the Hair tab ("Personalize hair tips?").
7. **Show the payoff immediately**: after quiz, land directly on the personalized result with a "Save this to my profile" CTA — saving a result is the first "aha" + first retention hook.

Aurelia implication: a 6-question, skippable onboarding (name, skin type or quiz shortcut, hair type/length, style vibe: minimal/romantic/bold, undertone) feeding a "For You" home section is P0.

## 4. Engagement patterns

### Daily tips
- Day-rotating tip is a good hook; category apps pair it with a **browsable tip library** (Lemon8/Pinterest model: content is never "lost after today").
- Add **category filter + "surprise me" shuffle**; internal knowledge: tip cards with strong one-line hooks ("Bobby pins: wavy side DOWN") are exactly the format that gets screenshotted and shared.

### Streaks & progress
- Duolingo 7-day streak → 3.6× long-term engagement (orizon), but RevenueCat/UXDesign caution: pressure-framed streaks backfire; use **gentle streaks**: freezable, weekly summary framing ("3 new tips learned this week"), no red loss-banners, grace day per week.
- For Aurelia: a lightweight "days visited" counter + "tips read" count (stored locally, shown in profile/saved sheet) is enough — do not build heavy streak machinery.

### Push notification strategy (beauty/content apps)
- Common findings (theproductnotebook, subscribers.com, loyalnsave): frequency sweet spot is low — **2–3 content pushes/week**, more per day and value/attention collapses; personalize send time to user's active hours; content-led ("Tip of the day", "Your evening routine reminder") outperforms promo; always tie to a real action.
- Opt-in timing best practice (internal + pushwoosh): ask **after a positive moment** (quiz result shown, or 3rd item saved), not on first launch. For a PWA, Web Push requires install → make it part of the "install for daily tips" card.
- Aurelia implication: P1. Web Push with 3 default toggles (daily tip, evening routine reminder, weekly "new in Aurelia").

### Save & collect UX
- Pinterest boards = **organize saves into named collections**; revisiting boards is the return-visit reason. Aurelia's flat saved list should become **collections grouped by module + custom boards** ("Date night", "College looks"), with reordering and a note per item.
- Small delight pattern: heart animation + haptic (Aurelia already has heart-pop ✓ — keep and surface count in header).

### Shareable cards
- Beauty tip cards and quiz-result cards are the growth loop in this space (outcome quizzes are "the most shared asset type" — fyrebox/formester). Design: quote-style typography on brand background, app mark watermark, Web Share API (`navigator.share`) with canvas-generated PNG, fallback to copy-text.
- Aurelia implication: P0 — "Share this tip" on daily tip + "Share my result" on quiz results (skin type, undertone, future 12-season).

### Routine tracking (the skincare retention engine)
- FeelinMySkin / BasicBeauty / skincareroutine.app pattern: **AM/PM checklist per routine step**, check-off persists, "skip" allowed, optional reminder, and (advanced) skin photo diary over time.
- Aurelia implication: P0 — turn the existing skin-type routines into an **interactive AM/PM checklist** (steps from data, checkable, resets daily, streak-optional). Same mechanic reused as a **GRWM step-player** for the 5 makeup looks (next/prev, step timer, "look complete ✨").

---

## 5. Prioritized gap list for Aurelia

### P0 — must-have to feel complete (ship next)
1. **Global search** across colors, makeup, skin, hair, looks, tips (one box on Home; ~5,300 lines of content are currently unreachable without browsing).
2. **Onboarding flow**: skippable 5–6 questions (name, skin type via quiz shortcut, hair type/length, style vibe, undertone) → personalized greeting + "For You" section on Home ("For your combination skin…").
3. **AM/PM skincare routine checklist** (from existing per-type routines; daily reset; gentle "tips learned/visit days" counter in background).
4. **Shareable cards**: Web Share API image cards for daily tips + quiz results (watermarked) — growth loop + "loved" feeling.
5. **12-season color analysis upgrade** to the undertone finder: full quiz → season result (e.g., "Soft Summer") → "your palette" swatches + "wear less of" list, saved to profile. This is the category-defining feature competitors monetize.

### P1 — strong differentiators
6. **Saved collections/boards** (group saves by module + custom named boards; heart count in header).
7. **Tips library** (all tips browsable, filter by category, shuffle) + seasonal home rotation (spring/summer/autumn/winter palettes surfaced by real date).
8. **GRWM step-player** for the 5 looks (step-by-step walk mode with progress and timer).
9. **Content additions**: (a) Acne 101 + dark marks section; (b) face-shape → blush/contour/brow placement maps; (c) brushes 101 cheat sheet; (d) hair by texture/length variations + heat tools & protection primer; (e) jewelry/metallics by undertone; (f) prints & patterns guide.
10. **Web Push notifications** (2–3/week, content-led, opt-in after positive moment, install-tied).

### P2 — later polish
11. Photo → color extraction ("snap your outfit → get its palette") — Colorwise's killer feature, doable with canvas pixel sampling.
12. Look builder: combine palette + hairstyle + makeup look into one saved "look card".
13. Skin photo diary (weekly selfie compare — FeelinMySkin pattern).
14. A–Z glossary page; 2025–2026 trend guide (skinimalism, blurred lips) as static content; achievements ("Myth-buster: flipped all 20 myths").

---

## 6. Top 10 concrete additions (priority order)

1. Global search (P0)
2. Personalized onboarding → "For You" home (P0)
3. AM/PM routine checklist tracker (P0)
4. Shareable tip/result cards via Web Share API (P0)
5. 12-season color analysis quiz + saved personal palette (P0)
6. Saved collections/boards (P1)
7. Browsable tips library + seasonal rotation (P1)
8. GRWM step-by-step look player (P1)
9. Content: Acne 101, face-shape placement maps, brushes 101, hair-by-texture + heat primer, jewelry by undertone (P1)
10. Gentle streak/visit stats + Web Push (P1/P2)

---

## Sources (primary)
- App listings/reviews: apps.apple.com (Perfect365 4.8★/183K; GlowUp "makeup mentor 24/7"; Skin Bliss; Dressika; Show My Colors), play.google.com (YouCam 300M+; AI Skin Test; Skincare Routine tracker; FeelinMySkin), apkpure (offline beauty tips apps), basicbeauty.app, skincareroutine.app, feelinmyskin.com, colorwise.me, perfect365.com, perfectcorp.com
- Color analysis: nataliebolonina.com (best color analysis apps 2025), color-analysis.app, theconceptwardrobe.com, shopcolorbook.com (12 seasons), gabriellearruda.com, anuschkarees.com
- Onboarding/UX: setgreet.com (2026 onboarding best practices), uxcam.com, vwo.com, nextnative.dev, pushwoosh.com, scandiweb.com, everydayindustries.com (personalization quiz UX), nngroup.com (quizzes/calculators), quizify.io, formester.com, fyrebox.com, blueconic.com
- Engagement/retention: orizon.co (Duolingo streak 3.6×), revenuecat.com (streaks aren't the secret), trophy.so, strivecloud.io, reddit r/UXDesign (streaks), theproductnotebook.substack.com, subscribers.com, loyalnsave.com (push frequency/sweet spot)
- Discovery/trends: askattest.com (TikTok 53%), statista.com (Gen Z beauty discovery), selfnamed.com (70% social-first), cosmeticsandtoiletries.com (83% TikTok), rixincosmetics.com (skinimalism), Pinterest Business (73% visual search), help.pinterest.com, stylebookapp.com, r/capsulewardrobe
- Ingredient checkers: skinsort.com, inkeedecoder.com, skincareconflict.com, cosmeticcalculator.com, getskinscore.com
- Aurelia internal state verified by code inspection (this repo): no search, no onboarding, flat favorites, 24 day-rotating tips, quizzes = skin-type (10Q) + undertone (3-way), offline PWA ✓, dark mode ✓.
