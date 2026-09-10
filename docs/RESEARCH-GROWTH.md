# RESEARCH-GROWTH — Distribution, Growth Loops & Monetization for Aurelia (2025–2026)

> **Part of Aurelia** · [README](../README.md) · [Docs index in README](../README.md#docs) · [Extended README](./README-EXTENDED.md) · [CONTEXT](./CONTEXT.md) · [DEPLOYMENT](./DEPLOYMENT.md)


**Project:** Aurelia (beauty/style PWA, Next.js 16 App Router, TS, on-device-first) · **Compiled:** 2026-09-09
**Methodology:** 14 live web searches (z-ai web_search); snippet-level evidence, marked ⚠️ where unverified or conflicting. Companion docs: [`RESEARCH-PWA-LAUNCH.md`](./RESEARCH-PWA-LAUNCH.md) (launch checklist — this doc is the *strategy* layer above it), [`RESEARCH-COMPLIANCE.md`](./RESEARCH-COMPLIANCE.md) (FTC affiliate disclosure, privacy policy, claims rules — the legal counterpart to monetization).
**Scope:** research + this document only. No app code was changed.
**Charters respected throughout:** zero-backend (no accounts, no analytics), photos never leave the device, AI routing invisible, free core.

---

## Executive summary

1. **The color-analysis demand wave is durable, not a fad.** TikTok #coloranalysis went 631M views (Jan 2023, Allure) → ~750M (Mar 2023, Refinery29) and remains an active creator category into 2026 (stylist sessions, "color analysis lies" content, shopping guides still posting Jan–Jun 2026). Commentators debate "fad or fab" but the free-tool demand persists.
2. **Free web tools own the search demand already — and they're beatable.** colorwise.me, palettehunt.com, color-analysis.app, colormebeautiful.com and theconceptwardrobe.com rank for "color analysis test / what season am I" queries; colorwise also ships an Android app (4.1★, 3,200 ratings). None of them combine calibrated on-device measurement + routine + journal + AI stylist — Aurelia's differentiation is the stack, not any single feature.
3. **Play Store distribution is cheap and real: TWA via Bubblewrap/PWABuilder.** Requirements: PWA installability (192px icon, HTTPS, service worker), $25 one-time developer account, and — for personal accounts — a closed test with ≥12 testers opted in for 14 continuous days (2026 rule, relaxed from 20).
4. **Apple App Store is effectively closed to a wrapped web app.** Guideline 4.2 ("minimum functionality") rejections of WebView-mirror apps are routine and well documented (Dec 2025 write-ups) — don't fight it; iOS users get the installed-PWA path, which works.
5. **Installed PWA users behave like app users.** 2026 write-ups consistently report higher engagement, longer sessions, and better conversion for installed PWA users; install prompts shown to *returning* visitors convert best (Grid Dynamics research).
6. **The strongest growth loop for Aurelia is the shareable result card** — already shipped in Glow Delta/share flows. Benchmarks: virality k-factor = i × c (invites × conversion); a 400-program study saw only ~19% of potential advocates participate and 22.5% of growth affected by k-factor — meaning loops must be *frictionless by default*, not begged for.
7. **Freemium math is sobering:** median free→paid conversion is 8–12% (good: 15–25%); 20% of products convert below 2.5% and 23% above 25% — the distribution is wide, so price the premium tier for the top decile, not the median.
8. **Beauty affiliate rates are known and modest:** Sephora ~4–5% (24h cookie per one 2026 source; other sources say 5–10%/30d ⚠️ conflicting), mass-market retail ~5% US / 15% UK via Skimlinks, LTK 10–25%, ShopMy 10–30%, Amazon Influencer 1–20% (mostly at the bottom).
9. **Paid human color analysis costs $150–$500+ (US, 2026 guides; range up to $800)** — apps monetize the gap: Dressika charges $5/week or $13/yr; Hathaura $14.99 one-time; the AI-tool span runs free to ~$50 (Elara). A one-time $9–15 "Deep Report" is the natural Aurelia price point.
10. **Ads would net ~$2.80–$8 eCPM** (banner/native/interstitial, 2024-25 data) while destroying the calm Soft-Editorial brand and adding tracking SDKs that violate the privacy charter — rejected.

---

## §1 Growth channels — where the audience already is

### TikTok (primary discovery channel)
- #coloranalysis: 631M views by Jan 2023 (Allure), 749.9M by Mar 2023 (Refinery29); continued high-activity creator content through 2025-26 (stylist session vlogs, palette shopping guides, myth-busting reels — TikTok/IG posts dated Jan, Feb, Jun 2026). ⚠️ Current total view count not verified.
- What performs: transformation reveal formats ("I got my colors done"), filter/draping try-outs, shopping guides ("what to wear if you're an Autumn"), and myth content ("the biggest color analysis lies").
- Aurelia's play: the app *is* the free version of the $300 in-person session — creators demonstrating a calibrated on-device measurement (vs. quiz guesswork) is the differentiating content angle. No budget required to start.
- Fad risk: Texarkana Magazine (Feb 2025) sits mid-fence ("might fade slightly once TikTok hype moves on, but its benefits—confidence—[stay]"). Diversify across channels regardless.

### Reddit (high-intent community)
- r/coloranalysis: active, SFW, 13+ community ("Learn, discover and discuss your individual color palette") with a substantial wiki; a spin-off r/colouranalysis exists (community fragmentation implies scale ⚠️ member counts not verified from snippets).
- Aurelia's play: the honest-science angle (CIEDE2000, white-reference calibration, "we show you the numbers") plays well against the community's recurring complaint — inconsistent human analysis. Share as a tool, never as an ad (subreddit self-promo rules apply).

### Instagram
- Reels ecosystem mirrors TikTok content; result-card shares (a shipped feature) are the native format. IG's "save/share" behavior rewards reference-style carousel content (palette cards).

### Influencer seeding (later, optional)
- 2026 rates: nano (1–10K) $50–$300/post; micro (10–100K) $200–$2,000/post (AMT); beauty/skincare micro $500–$5,000/deliverable (LaunchPoint). Not needed until product-market signal exists.

## §2 Programmatic SEO opportunity

**The query map** (intent → what ranks today → Aurelia's edge):
| Query cluster | Current top results | Aurelia angle |
|---|---|---|
| "color analysis test free / quiz" | palettehunt (quiz, no signup), theconceptwardrobe (12-season quiz), colormebeautiful (quiz + AI) | calibrated photo-based engine, no signup, works offline |
| "what season am I" | same + color-analysis.app | same + explainable verdict |
| "color analysis from photo" | colorwise.me self-analysis | white-reference calibration (verifiable accuracy story) |
| "best colors for my skin tone" | shopping-guide listicles | personal palette + shade verdicts |
| "foundation shade finder / undertone" | brand-locked finders | cross-brand, measured L*/hue angle |
| "curl pattern chart / type" | listicles | measured Texture Lab |

**Technical requirements to compete (from how the ranking tools are built):** individual URLs per tool/topic (not one SPA page), shareable OG result cards, fast mobile-first pages, FAQ-structured content. ⚠️ Search-volume figures were not verifiable from snippets — pull live numbers from Google Trends/Keyword Planner before investing in content SEO; treat SEO as the compounding channel, not the launch channel.

**Cost note:** all top free tools rank with zero or minimal backlink profiles (new sites, simple pages) — the SERP is winnable on product quality and page structure.

## §3 Store distribution reality

| Path | Cost | Effort | Friction | Verdict |
|---|---|---|---|---|
| **Google Play via TWA** (Bubblewrap/PWABuilder) | $25 one-time | 1–2 days (dev.to walkthrough, May 2026) | Personal accounts: closed test, ≥12 testers opted-in 14 continuous days (2026 rule; was 20) | **Do it** — discovery + "real app" trust |
| **Apple App Store (WebView wrap)** | $99/yr | 1–2 weeks + rejection risk | Guideline 4.2 minimum-functionality rejections of site-mirror apps are routine (MobiLoud Dec 2025; HN reports) | **Skip** — iOS users install the PWA to home screen (supported, documented in RESEARCH-PWA-LAUNCH) |
| **Installed PWA (browser prompt)** | $0 | ~0 (shipped) | Prompt works best after repeat visits (Grid Dynamics) | **Do it** — installed PWA users show higher engagement/longer sessions across published 2026 case studies |
| Microsoft Store | $19 one-time | small | Chromium-only audience on Windows | optional, later |

**PWA-vs-native build cost context (2026):** PWA build $25K–$80K vs native iOS+Android+web $80K–$200K+ for equivalent scope (Forasoft) — irrelevant to Aurelia's budget reality, but confirms the architecture bet.

## §4 Growth loops & retention

- **Share-card loop (the Aurelia-native loop):** every result screen (season, shade verdict, glow delta, texture, outfit score) can already export a card. Requirements to make it a *loop*: watermark + short URL on the card, and (later, SEO phase) a public landing page per tool so the link resolves for non-users. Benchmarks for honesty: k-factor = i × c; in the 400-customer study only 19% of potential advocates shared and k-factor influenced 22.5% of growth — loops must be one-tap, default-on, beautiful. Do not gate sharing behind signup (none exists — good).
- **Streaks/retention:** shipped (journal + Badging API). Beauty/content-app retention data in RESEARCH-BEAUTY-APP-UX §4 (daily tips, streaks, shareable cards, routine tracking) remains the reference.
- **WebMCP as a future channel** (from RESEARCH-DEEPTECH): agents can already call Aurelia's 7 tools when the page is open — if browser-agents ever surface "site tools" in discovery, early registrants win. Free optionality, zero cost.
- **Notification cadence:** shipped streak badge; resist push-notification spam — content-app push fatigue is documented in RESEARCH-BEAUTY-APP-UX §3.

## §5 Monetization options

| Option | Revenue potential | Effort | Brand/charter risk | Prerequisites |
|---|---|---|---|---|
| **Affiliate links on verdicts/palettes** | Low–medium (4–30% commission; see below) | Low (outbound links only — zero-backend compatible) | Medium: needs FTC-adjacent disclosure per RESEARCH-COMPLIANCE §5; brand dilution if over-placed | Affiliate network approvals |
| **One-time "Deep Report"** (PDF-style premium result: full palette + shade map + season cards) | Medium — human analysis costs $150–$500; app equivalents $5–15; freemium good-case converts 15–25%, median 8–12% | Medium (needs a payment link; Gumroad/Stripe Payment Link = zero-backend) | Low (premium ≠ paywalling core measurements — keep the loop free) | Payment provider account |
| **Subscription** | Medium recurring, but content-app subs churn; $13/yr Dressika precedent | High (continuous premium content) | Medium | Value proposition must be ongoing (journal AI insights?) |
| **Donations (Ko-fi)** | Very low (typical conversion ≪1% ⚠️ folklore-adjacent; no hard data found) | Trivial | None | A link |
| **Ads** | $2.80–$8 eCPM (2024-25: banner $2.80, native $3.30, interstitial $4.80–8) | Medium | **Fatal** — ad SDKs = tracking, violates privacy charter; ruins brand | — |

**Affiliate rate detail (2026):**
- Sephora: ~4–5% with a 24-hour cookie (JoinMavely 2026); other sources claim 5–10% / 30-day ⚠️ conflicting — verify in-network.
- Mass-market beauty via Skimlinks: 5% US / 15% UK for one major brand (competitive for mass market).
- LTK: 10–25% (some programs 30%); ShopMy: 10–30% — both creator-network oriented, approval as a "tool" not a creator may be awkward ⚠️.
- Amazon Influencer/Associates: 1–20% depending on category (beauty sits low single digits ⚠️).
- Placement idea that fits the charters: shade/dupe verdict cards ("your measured shade across brands") — commission on products the engine already independently recommends. Disclosure line adjacent to every link per FTC (RESEARCH-COMPLIANCE §5).

**Premium pricing benchmarks (2026):** Dressika $5/wk or $13/yr; Hathaura $14.99 one-time (+$9.99 guide tier); Elara free–$50 span; human analysis $150–$500 (US average in-person; color-analysis.app Aug 2026), $200–$800 range (YourColorGuru); PersonalColorAI markets the $0–$545 full span. → Aurelia Deep Report at **$12 one-time** (mid-range, honest vs. the $300 human alternative) with a free core that stays complete.

## §6 Recommended playbook (zero-backend + privacy-compatible)

**Phase 1 — Make the loop shareable (now, ~2 days):**
1. Watermark + `aurelia.app` (or repo URL) on every exported card; ensure OG tags on the root page.
2. Verify share targets (Web Share API) on iOS Safari + Android Chrome.
3. Post the app to r/coloranalysis as a free tool (follow self-promo rules), with the "we show you the CIEDE2000 numbers" angle.

**Phase 2 — Distribution surfaces (~1 week):**
4. TWA build via Bubblewrap → Play Store listing ($25 + 12-tester/14-day closed test — start recruiting testers from Reddit/communities immediately, the 14-day clock is the long pole).
5. TikTok/IG content: 3 formats — transformation reveal, "my measured L* vs my foundation", myth-busting. The measurement-on-device story is the hook no competitor has.
6. Static content pages per tool (one URL each) to begin compounding SEO.

**Phase 3 — Monetization when there's traffic (later):**
7. Affiliate links only on independently-derived verdicts, with adjacent "We may earn a commission" disclosure (FTC, RESEARCH-COMPLIANCE §5).
8. $12 one-time Deep Report via Gumroad/Stripe Payment Link (zero backend); free core stays complete.
9. Never: ads, accounts, tracking analytics (privacy policy in RESEARCH-COMPLIANCE §7 must remain literally true).

**Metrics without analytics:** use share-card exports, store listing installs, and (if landed) Deep Report sales as the only KPIs — all measurable without user tracking.

## Sources (live-searched 2026-09-09)

- Allure — "I Tried the Color Analysis That's All Over TikTok" (631M #coloranalysis views) — allure.com — Jan 2023
- Refinery29 — "Why Are We All Obsessed With Color Analysis On TikTok?" (749.9M views) — refinery29.com — Mar 2023
- Texarkana Magazine — "Is Color Analysis a Fad or Truly Fab?" — txkmag.com — Feb 2025
- TikTok creator posts (color-analysis sessions, Jan 2026; insights, Feb 2026) — tiktok.com ⚠️ engagement figures vary
- Instagram — imageconsultantmaidenhead "Biggest Color Analysis Lies 2026" — instagram.com — Jun 2026
- Reddit — r/coloranalysis (SFW 13+, wiki) and r/colouranalysis — reddit.com ⚠️ member counts not in snippets
- colorwise.me (self-analysis, virtual draping; Google Play "My Best Colors" 4.1★/3,200 ratings) + Similarweb analytics page (traffic −10.29% MoM, 00:01:36 avg visit) — colorwise.me, play.google.com, similarweb.com — Jul 2026
- palettehunt.com — free 3-minute color analysis quiz, no signup
- colormebeautiful.com — free quiz + AI analysis ("original pioneers")
- theconceptwardrobe.com — 12-season quiz
- saastostore.com — "How to Publish a Web App on Google Play (2026 Technical Guide)" (TWA vs native requirements table) — 2026
- dev.to — "How I shipped my PWA to Google Play as a TWA" — May 2026
- wheretosubmit.org — PWA submission venues (Play $25 account + 12-tester note) — 2026
- Google Play support — App testing requirements for personal developer accounts (≥12 testers, 14 days) — support.google.com — 2026
- primetestlab.com — "20 to 12 Testers: Google Play New Rules 2026" — Apr 2026
- MobiLoud — "App Store Review Guidelines: Will Your WebView App Be [Approved]" (Guideline 4.2 rejections) — mobiloud.com — Dec 2025
- News.ycombinator.com + developer.apple.com forums + ionicframework forum — 4.2 rejection case reports
- digitalapplied.com — "Progressive Web Apps 2026: PWA Performance Guide" (installed-user engagement) — Feb 2026
- griddynamics.com — PWA research (install prompt to loyal visitors converts best) — 2020
- forasoft.com — "PWA vs Native App (2026)" ($25K–$80K PWA vs $80K–$200K+ native) — Jul 2026
- AppsFlyer / Adjust / First Round Review / startups.com — k-factor definitions (K = i × c)
- saxifrage.xyz — "K-Factor Benchmarks" (400-customer study: 19% advocates, 22.5% growth affected) — Sep 2020
- Crazy Egg — free-to-paid conversion benchmarks (freemium 8–12% median / 15–25% good) — Sep 2025
- Adapty — trial conversion math — Mar 2026; Userpilot — conversion distribution (20% <2.5%, 23% >25%) — Aug 2026
- Skimlinks — "13 Best Beauty Affiliate Programs" (5% US / 15% UK) — 2026
- JoinMavely — "25 Best Beauty Affiliate Programs" (Sephora 4–5%, 24h cookie) — 2026
- wptasty.com — beauty affiliate roundup (Sephora 5–10%, 30d cookie) ⚠️ conflicts with JoinMavely
- stackinfluence.com / creatorflow.so / creator-hero.com / favly.com — ShopMy vs LTK commissions (ShopMy 10–30%, LTK 10–25%) — Feb–Aug 2026
- amt.ai — influencer rate tiers (nano $50–$300, micro $200–$2,000) — Jul 2026; launchpointhq.com — beauty micro $500–$5,000; influee.co — $250–$5,000 micro
- Dressika (Play listing: $5/wk, $13/yr, 3-day trial) — play.google.com; hathaura.co — 2026 app comparison ($14.99 one-time); joinelara.com — "In-person analysis costs $200–$500+; apps close that gap for free to ~$50" — Aug 2026
- color-analysis.app — "How Much Does a Professional Color Analysis Cost?" ($150–$500 US) — Aug 2026; personalcolorai.com — "$0 to $545" pricing guide — Apr 2026; yourcolorguru.com — $200–$800 consultant range
- Playwire — AdMob eCPM benchmarks (interstitial $5–8) — Sep 2025; Business of Apps — mobile ad rates (banner $2.80, native $3.30, interstitial $4.80) — Feb 2025; Liftoff — in-app advertising guide — Jun 2026
