# RESEARCH — PWA Launch Readiness for Aurelia (2025–2026)

**Task ID:** R-1 · **Agent:** research (PWA launch readiness) · **Type:** research-only
**Method:** 18 live web searches (z-ai web_search) against web.dev / MDN / Chrome developer docs / Apple docs / W3C / industry benchmark sites, cross-checked with deep internal knowledge of the PWA platform (both labeled). Current Aurelia code was inspected to ground every checklist item (`manifest.json`, `sw.js`, `layout.tsx`, `page.tsx`, `store.ts`, `globals.css`, `next.config.ts`).
**Legend:** ✅ already done in Aurelia · ⚠️ partial/risky · ❌ missing. Priorities: **P0** = must fix before launch, **P1** = should have at launch or within 2 weeks, **P2** = competitive polish / post-launch roadmap.

---

## 0. Executive summary — what "launch-ready" means in 2025–2026

A launch-ready PWA in this market must clear four bars simultaneously:

1. **Installable everywhere that matters** (Chrome/Edge/Android via manifest, iOS via A2HS affordances) and **feels native after install** — splash, no white flash, safe areas, correct back-button behavior, single instance.
2. **Fast on a mid-range phone on 4G** — LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75; JS payload discipline.
3. **Discoverable & trustworthy** — real metadata (OG/Twitter cards, JSON-LD), per-content deep links, privacy policy, screenshots, privacy-safe analytics.
4. **Alive, not a PDF** — update prompt flow, notification/streak loop, shareable content cards, personalization that visibly reacts to the user.

Aurelia is strong on 1 (install files, offline shell, safe-area CSS) and has real content depth; it is weak on 2 (all tabs in one client bundle), and mostly missing 3 and 4. The top killers for this specific app: no URL/deep-link state (breaks Android back, sharing, and SEO at once), no service-worker update prompt (users frozen on v1 forever), no iOS splash screens, disabled pinch-zoom (a WCAG violation), and no share loop in a demographic (teen girls) that grows apps *via* sharing.

---

## 1. PWA quality bar 2025–2026

### 1.1 Installability criteria (Chrome/Edge/Android)

- **P0 · HTTPS** — hard requirement (MDN, "Making PWAs installable", Nov 2025 update). ✅ (Caddy terminates TLS in this setup — verify prod).
- **P0 · Manifest completeness:** `name` or `short_name`, `start_url`, `display` one of `standalone|fullscreen|minimal-ui`, icons **192 + 512** (both present), `scope`, stable `id`. ✅ Aurelia's manifest has all of these, plus `display_override`, `categories` (beauty/lifestyle/fashion — valid W3C categories), dual-size maskable icons. ⚠️ Missing members that Chrome now uses (see §1.4).
- **P0 · Service worker:** Chrome relaxed the hard "SW with fetch handler" requirement for the *install prompt itself* (2024 criteria update, web.dev "What does it take to be installable?"), and **Lighthouse's dedicated PWA audits are deprecated** (developer.chrome.com, Apr 2024) in favor of Chrome's live installability check. **Do not treat that as license to skip the SW**: offline parity, iOS quality expectations, and every "quality PWA" checklist still require it. ✅ Aurelia has one.
- **P0 · User engagement heuristic:** Chrome requires ≥ 1 click/tap before the mini-infobar/custom prompt can fire (web.dev). Any real UI satisfies this; keep the install CTA *after* a positive moment (see §3.4).
- **P1 · `launch_handler: { clientMode: "navigate-existing" }`** — prevents duplicate app instances when the Android home-screen icon is re-tapped. ❌ Aurelia missing.
- **P1 · `dir`/`lang`** in manifest ("en", "ltr"). ❌ Missing (browsers default to auto-detect; explicit is best practice per MDN manifest docs, Nov 2025).

### 1.2 iOS PWA reality (the audience's dominant platform — assume iPhone-first)

Facts (Apple/WebKit docs + magicBell "PWA iOS limitations 2026" + brainhub.eu 2025 + vinova.sg 2025, confirmed by internal knowledge):

- **No `beforeinstallprompt` on iOS.** Install = Safari **Share → Add to Home Screen**. Chrome/Edge *on iOS* cannot install PWAs at all (web.dev "Installation prompt"). → **P0: show a conditional iOS install instruction card** (detect `!standalone && iOS` via UA/platform + `matchMedia('(display-mode: standalone)')`), with the Share-icon visual. Aurelia's Home "PWA install card" exists ⚠️ but is generic — it must branch per platform: Android → `beforeinstallprompt().prompt()`; iOS → visual A2HS steps; installed → hidden.
- **Web Push: iOS 16.4+ only, installed-only, user-gesture permission, VAPID server required. No badges, no silent push, no scheduled local notifications.** Design around this (see §3.2). 
- **Storage:** Safari gives installed web apps durable storage (exempt from the 7-day ITP eviction), but **non-installed Safari usage can have script-writable storage (incl. `localStorage`) evicted after ~7 days of non-use** → **⚠️ Aurelia's favorites can silently vanish for Safari users who don't install.** Mitigations: **P0** promote install early; **P1** call `navigator.storage.persist()` (Safari 17+ supports; harmless elsewhere) + show "Your saved looks live on this device only" in Settings; **P2** export/import JSON backup of `localStorage`.
- **Splash screens:** iOS ignores the manifest; without `apple-touch-startup-image` links the launch is a **blank white flash** (newer iOS shows icon + background, still jarring). → **P0:** generate 6–10 startup images at exact device pixel sizes (or at minimum the current common iPhone sizes: 1290×2796, 1179×2556, 1170×2532, 1125×2436 + their landscape twins) linked with `media` screen-width/height qualifiers. Note: iOS 26 has a reported landscape splash aspect bug (reddit r/Frontend, 2025) — ship portrait-only qualifiers first. ❌ Aurelia missing entirely.
- **Status bar / safe areas:** `black-translucent` + `viewport-fit=cover` + `env(safe-area-inset-*)` padding. ✅ All present in Aurelia (verified `globals.css` + `layout.tsx`).
- **Other iOS gaps to accept/work around:** no `share_target`, no shortcuts (iOS ignores manifest `shortcuts`), no protocol handlers, keyboard/viewport quirks in standalone (interactive elements can sit under the keyboard — test the quiz inputs), and `100vh` is dynamic (use `100dvh` — check globals.css uses dvh where full-height).

### 1.3 Offline experience expectations

- **P0 · Offline really works:** install the app, airplane mode, launch from home screen, tap through **every** tab and open a saved sheet — nothing should error or spin. Aurelia's architecture (all content bundled in JS, SWR static cache, network-first navigation with cached-shell fallback) should achieve this ✅ — but it has **not been device-tested** (worklog shows desktop-browser verification only). Test on real iOS Safari (A2HS) and Android Chrome, not just DevTools offline.
- **P0 · Fonts offline:** `next/font` self-hosts Fraunces/Nunito Sans — confirm they're served from same-origin `/_next/static` (✅ they are) and thus cached by the SWR rule ✅.
- **P1 · Branded offline fallback route:** current SW falls back to cached `/` for any navigation — fine, but add a **detection + banner**: when a fetch fails and you served from cache, show "Offline — showing your saved content" (small toast/`navigator.onLine` listener). ❌ Missing.
- **P1 · Offline UX affordance on writes:** favorites are `localStorage` so they work offline ✅; future server features (push, sync) must queue.
- **P2 · precache completeness audit:** `sw.js` ASSETS list omits `favicon-32.png`, `maskable-*` — harmless but inconsistent; bump `VERSION` **every deploy** (currently hardcoded `aurelia-v1` — if never bumped, cache cleanup logic never fires). ⚠️

### 1.4 App-like feel (the "is this a website?" test)

- **P0 · History/back correctness:** In standalone, Android back gesture / iOS back-swipe must (a) close the open bottom sheet, (b) go to previous tab, (c) only then exit. Currently ❌ — tab state is React-only, sheets are not history entries → **back exits the app instantly**, the #1 "PWA feels broken" complaint (StackOverflow 74096756; DockYard "Designing for PWAs without the Back Button"). Fix: `history.pushState` per tab + per sheet open (hash-routing `#/colors`, `#/saved`, `#/item/:id`), listen `popstate`. Also gives **deep links** (§2, §3.3). This single change closes three gaps at once.
- **P0 · Scroll containment:** `overscroll-behavior-y: none` on html/body (kills pull-to-refresh which would reload and wipe tab state, and iOS rubber-banding), `overscroll-behavior: contain` on internal scroll containers (sheet content). ❌/⚠️ needs audit in globals.css.
- **P1 · No double-tap zoom / tap jank:** `touch-action: manipulation` on interactive elements; `-webkit-tap-highlight-color: transparent` (Aurelia has press states ✅, verify globally).
- **P1 · `display-mode: standalone` adaptation:** hide install card when `matchMedia('(display-mode: standalone)')` or `navigator.standalone === true`; optionally hide blur header URL-ish elements. ❌ (install card is unconditional).
- **P1 · Reduced motion:** framer-motion + `prefers-reduced-motion: reduce` → disable stagger/springs (`MotionConfig reducedMotion="user"`). ❌ Missing — both an a11y (WCAG 2.3.3 territory) and motion-sickness issue.
- **P1 · Manifest `screenshots` member** (with `form_factor`): Chrome Android's rich install sheet shows real screenshots → materially higher install conversion. ❌ Missing.
- **P2 · `shortcuts`** (3–4): "Daily tip", "Skin quiz", "Saved looks" — long-press app icon on Android/Windows. ❌ Missing.
- **P2 · Monochrome icon** (`purpose: "monochrome"`) for Android dark-theme adaptive icons. ❌
- **P2 · Haptics:** `navigator.vibrate(8)` on heart-save (Android only) — cheap native feel.
- **P2 · Desktop form factor:** max-width centered column (≈ 520–640px) with pleasant page background; currently mobile-only layout stretches — looks unfinished on desktop, and reviewers WILL open it on desktop.

### 1.5 Service-worker update flow (users must not be frozen on v1)

Current SW calls `skipWaiting()` on install + `clients.claim()` → a new SW activates immediately, but **the running page keeps old code until next navigation**, and there is **no user-visible update mechanism at all** ❌. Best practice (Workbox/Chrome pattern, developer.chrome.com "Handling service worker updates"; progressier.com; confirmed by multiple 2025–2026 sources):

- **P0 · Implement the update-prompt loop:**
  1. On app load (and every ~24 h via `setInterval`): `reg.update()`.
  2. `reg.addEventListener('updatefound')` → `newWorker.state === 'installed' && navigator.serviceWorker.controller` → a waiting worker exists.
  3. Show a **non-blocking toast**: "A new version of Aurelia is available ✨ Refresh".
  4. Button → `newWorker.postMessage({ type: 'SKIP_WAITING' })`; SW listens for message and calls `self.skipWaiting()`.
  5. `navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload())` (guard with a flag so it reloads once).
  6. Remove unconditional `skipWaiting()` from the install handler (keep for first install only) — otherwise stale-page/mixed-version bugs.
- **P0 · Bump `VERSION` per deploy** (script it: inject build hash) so old caches are actually purged by the activate cleanup.
- **P1 · Cache strategy audit:** navigation = network-first ✅ (good: fresh HTML), `/_next/static` = cache-first ✅ (immutable hashes — correct). One real risk: `cache.put("/", copy)` only updates `/` — fine for single-page app. Keep as is.
- **P2 · "What's new"** micro-changelog inside the update toast (retention + polish, see §3).

---

## 2. Marketplace / launch checklist

### 2.1 Metadata & discovery (the "ASO-like" layer)

- **P0 · Open Graph + Twitter cards** ❌ entirely missing in `layout.tsx` metadata (only title/description present): `openGraph: { title, description, url, siteName, images: [1200×630 PNG <300 KB, absolute URL], type: 'website' }`, `twitter: { card: 'summary_large_image', ... }`. This is what renders when a link is iMessaged/WhatsApped/Instagram-DMed — the #1 free acquisition surface for this audience.
- **P0 · Title/description SEO discipline:** title ≤ 60 chars incl. keywords ("Aurelia — Beauty Tips, Makeup & Skincare"), meta description ≤ 160 (current is close ✅ but keyword-light). Target queries: "color combination app", "makeup for beginners app", "skincare quiz", "hairstyles for outfits".
- **P1 · JSON-LD `SoftwareApplication`/`WebApplication` schema** on the page (`applicationCategory: 'LifestyleApplication'`, `operatingSystem: 'Web'`, screenshot refs) → Google rich results. ❌
- **P1 · `sitemap.xml` + `robots.txt`** — robots ✅ exists; sitemap ❌. Only meaningful once real routes/deep links exist (§1.4).
- **P1 · Manifest `description` is keyword surface** (Chrome reads it in install UI) ✅ present, could be sharpened.
- **P2 · `og:image` variants** (1200×630 share, 1080×1920 story-format for IG/TikTok bio links).
- **P2 · Favicon set completeness** ✅ (32 + SVG + apple-touch present).

### 2.2 Deep links & architecture (prerequisite for both SEO and sharing)

- **P0 · URL state for tabs/sheets/items** (see §1.4): hash-routes (`#/colors`, `#/look/party-glam`) are offline-safe (no server round-trip, SW-independent). ⚠️ Trade-off note for the main agent: full SSG routes (`/colors`, `/skin-quiz`) would be *better for SEO* but require SW precache of every route and more build complexity; hash-routes are the 80/20 for launch. Decision: hash-routes at launch; SSG routes as P2 growth phase.
- **P0 · Unknown-route handling:** a branded 404/`not-found` state for bad hashes/deep links (and a Next `app/not-found.tsx` for real-path misses — ❌ currently default unstyled Next 404).

### 2.3 Screenshots & store assets

- **P1 · 4–6 polished phone screenshots** (1080×1920 portrait, device-frame, caption overlays) — needed for: manifest `screenshots` (rich install UI), PWABuilder store packaging, landing page, press kit. ❌
- **P1 · Landing/share meta image** (1200×630) with the Soft Editorial croquis hero — doubles as OG image.
- **P2 · If packaging to stores** (PWABuilder TWA → Google Play; Apple requires webview wrapper e.g. Median/PWABuilder route and App Review 4.2 minimum-function rules — web-content apps are scrutinized): privacy policy URL + support URL + account deletion path are **hard store requirements** (Apple Review Guidelines; median.co checklist). Given iOS audience, plan a P2 decision: "web-first + A2HS" vs "wrapped app store presence" (store presence unlocks real ASO + impulse installs; costs $99/yr Apple + review risk).

### 2.4 Privacy policy & legal

- **P0 · Privacy policy page** (`/privacy`, linked in footer/settings + manifest-adjacent): must state — no accounts, data stored **locally on device** (favorites/quiz/theme in `localStorage`), any analytics used (name it, cookieless), minors-safe framing (audience skews teen: avoid analytics that fingerprint; if Google Analytics is ever added → consent banner + lawful basis). Currently ❌ nothing exists. Even for a pure web launch this is expected by users, app-adjacent directories, and is mandatory for any future store listing.
- **P1 · "Tips, not medical advice" disclaimer** — ✅ exists in Skin tab (verified in worklog); surface it once more in footer.
- **P1 · Age-appropriateness note** (beauty content for teens: state "13+", no data collection from children → keeps you clear of COPPA/Apple-kids territory).
- **P2 · Terms + "clear my data" control** in-app (one tap: wipe `localStorage`) — trust signal + GDPR data-control hygiene.

### 2.5 Analytics (privacy-friendly, no cookie banner)

- **P1 · Add cookieless analytics** — recommended: **Umami** (MIT, self-hostable — fits existing server, free) or **Plausible** (hosted, slicker, paid); both GDPR-compliant with **no cookies → no consent banner** (plausible.io, umami.is, 2025–2026 comparisons). ❌ Currently zero analytics → cannot measure D1/D7, tab popularity, quiz completion, install conversion.
- **P1 · Event taxonomy from day one:** `tab_view`, `quiz_start/complete`, `save`, `unsave`, `sheet_open`, `install_prompt_shown/accepted`, `share`, `theme_toggle`. Funnels that matter at launch: quiz completion → save → install.
- **P2 · Self-hosted Umami** on the existing box behind Caddy; `data-events` only, no PII; document in privacy policy.

### 2.6 Performance budget (mobile, p75, mid-range Android on 4G)

2025–2026 Core Web Vitals (stable since INP replaced FID in March 2024; Google ranking signal): **LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1** (needs-improvement: 4 s / 500 ms / 0.25). Internal-knowledge targets for a content PWA like this:

- **P0 · Audit current bundle:** page is a single `"use client"` tree pulling all 5 tabs + framer-motion + all data files into one chunk. Budget: **initial JS ≤ 300 KB gz** for first paint of Home. Fix: `next/dynamic` lazy-load the 4 non-active tabs; keep Home eager. ⚠️ Unmeasured — run `next build` + Lighthouse CI (mobile, 4x CPU throttling, Fast 3G) and PageSpeed Insights before launch.
- **P0 · LCP element** = greeting hero text — ensure it's in the prerendered shell (it is, since data is static) and fonts use `display: swap` ✅ (both set) so no invisible-text LCP penalty; verify the no-flash theme script doesn't shift layout (theme color changes = potential CLS; measure).
- **P1 · INP discipline:** framer-motion tab transitions run on the main thread — use `layoutId` pill (already ✅) but avoid layout-triggering `AnimatePresence` exit animations on big lists; heart-burst spring is fine (small subtree).
- **P1 · CLS:** day-rotating tip text changes length daily → reserve min-height for the tip card; swatch grids fixed aspect ✅; bottom sheet appears as overlay (no layout shift ✅).
- **P2 · Static export consideration:** `output: "standalone"` ✅ fine; ensure `Cache-Control: immutable, max-age=31536000` for `/_next/static` at the Caddy layer (internal-knowledge: Caddy does this only if configured).

### 2.7 Accessibility (WCAG 2.2 AA — the 2025–2026 baseline)

- **P0 · REMOVE `userScalable: false, maximumScale: 1`** from `layout.tsx` viewport — **direct WCAG 1.4.4 (Resize Text) failure** and a classic "PWA feels hostile" marker. Pinch-zoom must work. ❌ Currently set. (Keep `viewport-fit: cover` ✅.)
- **P0 · Touch targets ≥ 24×24 CSS px minimum (WCAG 2.2 SC 2.5.8, AA, Dec 2024 REC), 44×44 best practice/AAA (W3C Understanding 2.5.5) and Apple HIG 44pt / Material 48dp.** Audit: heart SaveButton at 36px ⚠️ (passes AA, below best practice — make 44px), chips, tab bar (✅ 64px zone), quiz radios.
- **P0 · Contrast audit (WCAG 1.4.3/1.4.11):** normal text 4.5:1, large ≥ 24px/19px-bold text 3:1, UI components & meaningful icons 3:1. High-risk pairs in Soft Editorial palette: terracotta #C97B58 and berry/sage accents on cream #FAF7F3 (≈ 2.9–3.4:1 — **use only for ≥24px display text or icons, never body text**); `--ink-3` muted text in **dark mode** (verify ≥ 4.5:1 on #1C1518). ❌ Never audited — run automated check + manual.
- **P0 · Icon-only buttons need `aria-label`** (heart save = "Save {title}", theme toggle = "Toggle dark mode", close = "Close"). Screen-reader silence on primary actions reads as broken. ⚠️ Partial (illustrations are `aria-hidden` ✅ but interactive icons unlabeled).
- **P1 · Bottom sheet a11y:** focus trap while open, `Esc` closes, restore focus to trigger, `role="dialog"` + `aria-modal`. ⚠️ framer-motion sheet has none of this.
- **P1 · `aria-live="polite"`** toasts: "Saved to your collection" / theme change / update-available (also good UX).
- **P1 · Keyboard operability:** tab bar + quiz + collapsibles focusable in order, visible `:focus-visible` rings styled to the theme.
- **P1 · Reduced motion** (see §1.4). 
- **P2 · VoiceOver test pass** on iOS (the audience includes users relying on it): quiz radio semantics (`fieldset/legend`), myth flip cards (button semantics + announced state), hair illustrations decorative.

---

## 3. Retention & engagement (beauty/lifestyle content apps)

Benchmarks (searched, 2025–2026): mobile apps average **D1 ≈ 26%, D7 ≈ 6.9% (iOS) / 8–10% (Android), D30 ≈ 3–6%**; *good* lifestyle apps hold **~25% at D30** (bolderapps 2026; Pushwoosh 2025 study; strivecloud 2026). Streaks are repeatedly identified as the strongest habit mechanism in lifestyle/fitness content (productgrowth.in; trophy.so). Onboarding best practice 2025: **first-session engagement within 30 seconds, value before signup, ≤ 3 steps, 1 personalization question that immediately changes the UI** (UXCam 2026 examples; webisoft 2025; designerup 2025 study of 200+ flows).

### 3.1 Habit loop (P1 — ship at launch or v1.1)

- **Daily streak:** "Glow streak 🔥 3 days" on Home when the app is opened on consecutive days (pure `localStorage`, no server). Rules: forgiving (1 grace day/week), visible count, no shame on break (reset quietly to 1). Rotating daily tip ✅ already exists — it's the streak's content engine.
- **Weekly freshness:** rotate "Palette of the week" / "Look of the week" (deterministic by ISO week) so the app visibly changes without deploys.
- **P2 · Thumbs up/down on tips** (anonymous, local) → cheap "this app learns me" signal.

### 3.2 Notifications (P1 — needs small server piece)

- **Web Push (VAPID)**: iOS 16.4+ *installed-only*, Android fine; permission **must** be requested from a user gesture (button: "Get a daily glow tip ✨ (2×/week)"), never on load.
- Cadence: 2–3/week max (beauty content; teens are notification-fatigued), best 8–9 p.m. local; content = the daily tip, quiz-nudge at D3, "Your palette of the week is here" Monday.
- No server? Ship the **UI opt-in + permission** only later; do NOT fake local scheduling (impossible on iOS web).
- **P2 · Badge count** (Android only) as soft reminder.

### 3.3 Share cards — the growth engine for this audience (P0-lite / P1)

- **Web Share API**: `navigator.share({ title, text, url })` — iOS Safari supports text/URL share since iOS 12; **Level 2 (files/images) since iOS 15 via `navigator.canShare({files})`** (MDN Nov 2025; web.dev). Fallback chain: share-with-image → share-text+link → `navigator.clipboard.writeText` + "Link copied" toast.
- **Branded canvas-rendered share cards**: 1080×1920 story card for "My result: Combination skin ✓" (quiz), palette cards (swatch chips + hex), "look of the day". Render via offscreen canvas from existing data + brand colors, no image assets needed. This is the single highest-leverage organic loop for a girls' beauty app (Instagram stories / WhatsApp).
- Requires **deep links** (§1.4) so shared URLs open the exact content — without them, shares land on a generic home page and the loop dies.
- **Share entry points:** quiz result screen, palette sheet, look sheet, daily tip card (❌ none today).

### 3.4 Onboarding (P1)

- 2025 pattern for content apps: **no account, no tour** — one 3-screen value pass max: (1) "Your pocket beauty editor" + 3 content chips, (2) one question ("What do you want most? makeup / skincare / outfits" — 1 tap), (3) straight into the personalized tab with content visible **within 30 s**.
- Store the answer → Home pillar order + default tab adapt (visible personalization instantly).
- **Install prompt timing:** show the A2HS/install card *after* a win (quiz result or first save), not on first paint (Aurelia's install card ⚠️ is on Home from second visit — acceptable, but post-win converts better; capture `beforeinstallprompt` and defer).
- Skippable, never re-shown (localStorage flag), respects reduced motion.

### 3.5 Collections & personalization (P1/P2)

- Saved favorites ✅ exist (❌ no organization): P1 add per-category filter chips + count in the Saved sheet (cheap); P2 named collections ("Date night", "Everyday") + reorder.
- Skin quiz result ✅ stored — P1 use it: badge cards ("Great for combination skin"), reorder Skin guidance, "for your undertone" palette flags in Colors.
- P2 · export/import favorites JSON (also solves §1.2 storage-eviction anxiety).

---

## 4. Top 15 gaps that make small PWAs feel unfinished — Aurelia scorecard

1. **No URL/history state** — back gesture exits the app; sheets don't close on back; no deep links; refresh loses place; nothing is shareable. ❌ (fixes 4 problems at once — see §1.4/§2.2).
2. **No SW update prompt** — users pinned on stale build; no "What's new"; `VERSION` never bumps. ❌
3. **No 404/error/offline states** — bad deep link → unstyled default Next 404; a runtime JS error → white screen (no `error.tsx` boundary); no offline banner. ❌
4. **No search** — 100+ tips/palettes/looks, no way to find "eyeliner" or "blush" (even a tiny client-side fuzzy filter). ❌
5. **No share anywhere** — no Web Share, no share cards, no deep links = zero organic loop in a share-driven demographic. ❌
6. **iOS white-flash launch** — no `apple-touch-startup-image`; first impression on iPhone is a blank screen. ❌
7. **Pinch-zoom disabled** — `userScalable: false` (WCAG failure; feels hostile; also double-tap-zoom jank if `touch-action` unset). ❌
8. **Favorites fragility** — `localStorage`-only, no backup/export, silent Safari 7-day eviction for non-installed users, no "clear data" control, no `storage.persist()`. ⚠️
9. **No analytics** — launch is unmeasurable (D1/D7, quiz funnel, install conversion unknown). ❌
10. **Generic install UX** — no `beforeinstallprompt` capture, no iOS-specific A2HS instructions, not hidden once standalone, no `launch_handler` (Android duplicate instances). ⚠️
11. **Skeleton/loading states absent** — one client bundle: on slow networks the screen idles; no skeletons, no font-load management check, no slow-network feedback. ⚠️ (bundle itself is §2.6 P0)
12. **Overscroll/pull-to-refresh untamed** — PTR reloads and wipes state; iOS rubber-band inside sheets; keyboard-over-input in standalone iOS untested. ⚠️ (needs CSS audit + device test)
13. **Icon-only buttons unlabeled + contrast unaudited** — screen-reader silence on heart/theme/close; accent colors on cream borderline 3:1; dark-mode muted text unverified. ⚠️
14. **No privacy policy / about / feedback channel** — no trust page, no support email, no "tip was helpful?", no changelog; store submission blocked as-is. ❌
15. **Desktop/tablet unconsidered** — full-width mobile layout on desktop looks broken; no centered column; also no `prefers-reduced-motion` handling. ❌

(Honorable mentions: no manifest `screenshots`/`shortcuts`/`launch_handler`/monochrome icon; no update toast; empty states exist ✅ — genuinely above-average for a small PWA.)

---

## 5. Master pre-launch backlog (deduped, priority order)

**P0 — do before launch (blocks "launch-ready")**
1. Hash-route URL state (tabs + sheets + items) with `popstate` back handling (§1.4) → also unlocks deep links.
2. SW update prompt loop + per-deploy `VERSION` bump (§1.5).
3. iOS `apple-touch-startup-image` set + portrait-first qualifiers (§1.2).
4. Remove `userScalable:false`/`maximumScale:1`; add `touch-action: manipulation` (§2.7).
5. Branded `not-found.tsx` + `error.tsx` boundary + offline banner (§4.3).
6. OG/Twitter meta + 1200×630 share image (§2.1).
7. Privacy policy page + footer link + local-storage disclosure (§2.4).
8. Lighthouse mobile audit pass: LCP ≤ 2.5 s, CLS ≤ 0.1 via lazy-loading tabs (`next/dynamic`) (§2.6).
9. Real-device install test: iPhone A2HS + Android Chrome, airplane-mode walkthrough of every tab (§1.3).
10. `aria-label` on all icon-only buttons; contrast audit of accent-on-cream + dark muted text; 44px heart target (§2.7).

**P1 — at launch or first fortnight**
11. Install UX: `beforeinstallprompt` capture, iOS A2HS steps card, hide when standalone, `launch_handler`.
12. Web Share buttons (API + clipboard fallback) on quiz result, palettes, looks, daily tip.
13. Canvas share cards (1080×1920) + Web Share Level 2 file share.
14. Umami/Plausible cookieless analytics + event taxonomy.
15. Glow streak + palette-of-the-week rotation.
16. 3-screen personalization onboarding (value-first, skippable) + install prompt deferred to post-win.
17. Search: client-side filter across tips/palettes/looks.
18. Manifest additions: `screenshots` (form_factor), `shortcuts`, `launch_handler`, `lang/dir`, monochrome icon.
19. A11y pass 2: sheet focus trap + Esc + `aria-live` toasts + reduced-motion; VoiceOver spot-check.
20. `navigator.storage.persist()` + "data lives on this device" note.

**P2 — growth phase**
21. Web Push (VAPID server) 2–3×/week, opt-in from gesture; badge (Android).
22. Named collections + export/import JSON backup.
23. SSG real routes for SEO + sitemap.
24. Store packaging decision (PWABuilder → Play TWA; Apple wrapper path) w/ full store assets + age rating.
25. Desktop layout (centered column), haptics, "What's new" changelog, thumbs-up/down feedback.

---

## 6. Sources

Live search (z-ai web_search, retrieved today):
- developer.chrome.com/docs/lighthouse/pwa/installable-manifest · web.dev/articles/install-criteria · MDN Making PWAs installable (Nov 2025) — install criteria & Lighthouse PWA deprecation
- magicbell.com PWA iOS limitations (2026) · brainhub.eu PWA on iOS (2025) · vinova.sg Safari PWA limitations (2025) · developer.apple.com — web push in web apps · mobiloud.com — iOS storage quotas/persist
- progressier.com + developer.chrome.com/docs/workbox "Handling service worker updates" + MDN Using Service Workers — update flows
- web.dev/learn/pwa/enhancements (iOS startup images) · developer.apple.com/forums iOS splash threads · r/Frontend iOS 26 splash bug
- stackoverflow.com 74096756 · dockyard.com — back button in installed PWAs · blog.pwabuilder.com — native transitions
- web.dev/articles/offline-fallback-page · MDN Offline and background operation · getfishtank.com Next.js offline (2025)
- plausible.io · umami.is · mida.so · vulpasoft.com (2026) — cookieless analytics
- w3.org WAI WCAG21 Understanding 2.5.5 · w3.org TR WCAG22 (Dec 2024) · testparty.ai + boia.org — 24px AA vs 44px AAA targets · birdeatsbug.com mobile a11y checklist (2025)
- whatpwacando.today/installation · MDN Trigger install prompt · web.dev/learn/pwa/installation-prompt — beforeinstallprompt vs iOS
- MDN Navigator.share (Jul 2026) · web.dev/articles/web-share · w3c.github.io/web-share — Web Share L2
- developer.android.com predictive back · android-developers blog — gesture navigation
- bolderapps.com lifestyle benchmarks (2026) · pushwoosh.com 2025 retention study · strivecloud.io (2026) · trophy.so streaks (2026) · productgrowth.in streak mechanics
- uxcam.com onboarding examples (2026) · webisoft.com personalized onboarding (2025) · designerup.co 200 onboarding flows (2025)
- developer.apple.com App Review Guidelines · median.co / applaunchflow.com store checklists — privacy policy requirements
- applyzer/apptweak/adjust — ASO principles

Internal knowledge (labeled in text where not directly source-backed): CWV thresholds (LCP 2.5 s / INP 200 ms / CLS 0.1), Safari 7-day ITP eviction exemption for installed web apps, JS bundle budget heuristics, `overscroll-behavior` behavior, iOS keyboard/standalone quirks, manifest member support matrix, Next.js code-splitting advice.

*Prepared by R-1 research agent — no application code was modified.*
