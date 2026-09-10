# RESEARCH-CYCLE-SCIENCE — Temporal & Context Skin Science for Aurelia

> **Part of Aurelia** · [README](../README.md) · [Docs index in README](../README.md#docs) · [Extended README](./README-EXTENDED.md) · [CONTEXT](./CONTEXT.md) · [DEPLOYMENT](./DEPLOYMENT.md)


**Project:** Aurelia (beauty/style PWA, Next.js 16 App Router, TS, on-device-first) · **Compiled:** 2026-09-09
**Methodology:** 11 live web searches (z-ai web_search) across PubMed/PMC/journal-indexed queries; snippet-level evidence, marked ⚠️ where unverified. Companion docs: [`RESEARCH-PAPERS.md`](./RESEARCH-PAPERS.md) (the measurement layer this extends), [`RESEARCH-COMPLIANCE.md`](./RESEARCH-COMPLIANCE.md) (claims-language rules that govern every feature proposed here — the honest-labels discipline is *load-bearing*, because several of these domains have modest effect sizes).
**Scope:** research + this document only. No app code was changed.
**Charters:** on-device only, trends-not-diagnosis, body-positive, brutally honest about evidence strength, no cycle data leaves the device.

---

## Executive summary

1. **The strongest temporal signal in consumer-usable skin science is the premenstrual acne flare**: 63% of acne-prone adult women show more lesions in the late luteal phase (Lucky 2004, 129 citations; Geller 2014, 74 citations — the "63%" figure replicates across both), inflammatory lesions +25%, and 91% of premenstrual flares start within 7 days before menstruation. VERDICT: **STRONG** — buildable as a journal context tag + gentle routine hint.
2. **Cycle effects on skin barrier/hydration are real but mixed**: reviews find *no significant hydration change* across phases (Nguyen 2024, 7 citations) while controlled studies find higher TEWL mid-luteal vs ovulatory (estradiol protective; E/P-ratio effects on barrier differentiation — Murakami 2022, 18 citations). VERDICT: **MODERATE/CONFLICTING** — feature must say "evidence is mixed; here's *your* data."
3. **"Cycle-syncing skincare" is a marketing trend outrunning evidence** (PMC "Sync or Swim," Mar 2025: "scientific evidence supporting its effectiveness remains inconclusive"; Women's Health Apr 2026: "may not help"). Aurelia's angle: the *only* defensible version is showing the user their own measured trends against phase tags — not selling a synchronized routine.
4. **Seasonal skin variation is solid, replicated science**: lower stratum-corneum hydration and sebum in winter (humidity-driven), higher TEWL autumn/winter vs summer, sebum rising in hot humid summers (Nam 2015, 85 citations; Caucasian-women replication 2020; Wan 2015, 53 citations). VERDICT: **STRONG** — buildable as an automatic month-based routine tilt. Zero user input required (month is not personal data).
5. **Sleep × skin is well-grounded**: chronic poor sleep quality → increased intrinsic-aging signs + diminished barrier (PubMed-indexed study); even 1 night of deprivation reduces skin hydration and elasticity (Jang et al., via Afzal 2023, 14 citations). VERDICT: **STRONG** — sleep tag in journal + trend correlation.
6. **Stress × acne is one of the best-replicated psychodermatology findings**: stress severity correlates with acne severity (Zari 2017, 125 citations); 23% higher odds of worse acne under high exam stress (Wake Forest); during high-stress periods 100% of students had lesions vs 12.5% lesion-free in low-stress periods (Bouraqqadi 2025). VERDICT: **STRONG** — stress tag + correlation copy.
7. **Circadian skin biology supports AM/PM sequencing (already shipped)**: DNA/cell repair peaks at night, "daytime defense, nighttime repair" split (Lyons 2019, 99 citations). VERDICT: **MODERATE** — feature already exists; add the science footnote.
8. **Pollution × skin aging is strong epidemiology**: NO₂ significantly associated with more cheek lentigines (both studied populations, 50+; Fussell 2020, 96 citations); pollution–aging correlation in Asian populations (Huang 2022, 27 citations); PAHs strongest pigment-spot association. VERDICT: **STRONG** — but only as a manual "city day" context tag (privacy charter forbids location tracking).
9. **The market gap is confirmed**: period trackers (Hormona, Clue, Flo) own cycle data and *mention* skin; beauty apps own routines; **nobody couples measured skin trends × cycle phase × season × sleep/stress in one honest engine** — the closed-loop architecture Aurelia already has is the prerequisite.
10. **Every proposed feature is a pure-TS data layer** (journal tags + routine modifiers + milestone copy): no new dependencies, no photos required, no medical claims needed. This is the cheapest feature family in the entire research portfolio — evidence-grounded, and mostly UI + copy.

---

## §1 Menstrual cycle × skin — VERDICT: acne flare STRONG, barrier MIXED, trend framing honest

**The evidence that holds up:**
- Lucky et al. 2004 (JAMA-network, 129 citations): 63% of 25 adult women had more acne in the late luteal (premenstrual) than late follicular phase.
- Geller et al. 2014 (PMC, 74 citations): 63% of adult women had more acne lesions in late luteal; inflammatory-lesion counts +25% in 63% of participants during the premenstrual phase (recounted by Jain 2025).
- Among women with premenstrual acne, 91% report breakouts starting within 7 days before menstruation (samphireneuro.com summary of research, Feb 2026 ⚠️ primary not fetched).
- Barrier/hydration: Nguyen et al. 2024 (PMC, 7 citations) review — *no significant changes in skin hydration across the three cycle phases*; higher basal skin temperature reported. But: a controlled study found significantly higher TEWL in mid-luteal vs ovulatory phase, with estradiol protective on barrier (LWW journals, 2025 study); Murakami 2022 (ScienceDirect, 18 citations) — estrogen/progesterone ratio affects barrier differentiation and TEWL; older β-estradiol work shows paradoxical/adverse barrier effects of combined E+P elevation (Wiley 2007). The honest summary: **direction is person- and phase-dependent, magnitude modest, replication incomplete.**

**The trend reality-check:**
- "Sync or Swim: Navigating the Tides of Menstrual Cycle Messaging" (PMC, Mar 2025): cycle syncing is popular on TikTok, but scientific evidence remains inconclusive.
- Women's Health Mag (Apr 2026): experts explain how the cycle affects skin — "and why cycle syncing may not help."
- Brands build content on it anyway (Tatcha 2025, ayd.com.sg) — demand is real, supply is vague.

**Feature design (Aurelia, honest version):**
- **Journal context tag: cycle phase** — user marks period start dates only (on-device; nothing transmitted; no fertility claims → no regulatory adjacency). App derives phases (menstrual / follicular / ovulatory ≈ day 12-16 / luteal) with an explicit "estimates from your logged dates, not medical data" label.
- **Trend overlay**: skin-journal metrics plotted with phase bands — "your cheek redness averages +12% in late luteal weeks" (only claims the user's own measured pattern).
- **Routine hint, gentle**: in the 7-day pre-menstrual window, surface one line: "Breakout-prone week for many people — if that's your pattern, this is when the journal shows it." (Links the science honestly: "63% of acne-prone women flare premenstrually — Lucky 2004".) No "sync your skincare" marketing.
- **Effort**: 2–3 days (store schema, phase derivation, journal UI band, copy). **Compliance**: no fertility/prediction claims (MDR boundary, RESEARCH-COMPLIANCE §4); cosmetic-only copy.

## §2 Seasonal skin — VERDICT: STRONG, automatic, zero-input

**Evidence:**
- Nam et al. 2015 (PubMed, 85 citations): seasonal variation in skin hydration, sebum, scaliness, pH driven by air temperature, relative humidity, sunshine duration — the classic climate-cohort study.
- Caucasian-women replication (Wiley, Oct 2020): confirmed low SC hydration and sebum production in winter, driven by low environmental RH.
- Wan et al. 2015 (53 citations): lowest TEWL in summer; significantly higher autumn/winter values.
- Regional-climate/aging study (SCIRP): hydration and barrier decrease more in cold dry winter; sebum more affected by hot humid summers.

**Feature design:**
- **Seasonal routine tilt** — automatic from `new Date().getMonth()` (northern-hemisphere default, user-overridable hemisphere flag ⚠️ tiny detail):
  - Winter: raise moisturizer weight in the AM/PM sequence output; add barrier-support copy ("indoor heating drops humidity — the driest air your skin sees all year").
  - Summer: lighter textures, sebum-aware notes, higher-SPF emphasis (ties to existing sunscreen tips in search.ts).
- **Seasonal color-lighting note** (content, not science claim): winter's cool/low-angle light vs summer's warm light changes how colors read — a styling note, clearly framed as color-the-adjacent folklore ⚠️ no paper found; keep it as stylist voice, not measurement.
- **Effort**: 1–2 days (routine-engine modifier + copy blocks). Month-of-year is not personal data — no privacy surface at all.

## §3 Sleep × skin — VERDICT: STRONG

**Evidence:**
- PubMed-indexed study (Acta Dermato-Venereology lineage): chronic poor sleep quality associated with increased signs of intrinsic ageing, diminished skin barrier function.
- Afzal et al. 2023 (Oxford Academic, 14 citations): Jang et al. showed significant reduction in skin hydration after **1 day** of sleep deprivation and significant reduction in skin elasticity.
- Sleep Education (Jul 2022) quoting researchers: "first study to conclusively demonstrate that inadequate sleep is correlated with reduced skin health and accelerates skin aging."
- Mechanism chain: sleep loss → cortisol elevation → barrier/inflammation effects (Dallas Associated Dermatologists explainer, 2024).

**Feature design:**
- **Journal context tag: sleep hours** (manual 4 buckets: <5, 5-6, 6-8, 8+; no device sleep tracking — privacy + no new APIs).
- **Correlation milestone**: "Your evenness scores ran ~N% better in weeks you logged 7h+ sleep" (existing journalTrends machinery — slope math already supports grouping by tag).
- **Copy**: "Beauty sleep is measurably real — hydration drops after even one short night (Jang et al. 2007 lineage)." Keep the body-positive frame: it's about the *pattern*, not a verdict on her lifestyle.

## §4 Stress × skin — VERDICT: STRONG

**Evidence:**
- Zari et al. 2017 (PMC, 125 citations): stress-severity increase strongly correlated with acne-severity increase (female university students).
- Chiu et al. 2003 (JAMA Dermatology, 500 citations): the canonical exam-stress acne study — 67% of graduating medical students believed stress played a role (and objective severity tracked it).
- Wake Forest (2007): students reporting high stress were 23% more likely to have increased acne severity.
- Bouraqqadi et al. 2025 (ScienceDirect, 7 citations): during high-stress (exam) periods 100% of participants had acne (48.8% moderate); in low-stress periods 12.5% were lesion-free.

**Feature design:**
- **Journal context tag: stress (1–5)**. 
- **Correlation milestone + routine hint**: "High-stress weeks tracked with your redness flares — deep breath, your routine is still working" (tone: supportive, not blame-y).
- **Copy discipline** (per RESEARCH-COMPLIANCE §6): "stress correlates with breakouts in study after study" — never "stress causes your acne" (appearance framing + correlation wording).

## §5 Circadian skin — VERDICT: MODERATE (feature already shipped)

- Lyons et al. 2019 (PMC, 99 citations) review: repair of skin cells (DNA repair among them) peaks at night; adequate sleep necessary for optimal DNA repair; "day/night split: daytime defense, nighttime repair."
- Day/night cream trial (IJORD 2024): day- and night-formulated creams improved condition/hydration — modest consumer-grade evidence.
- Zhang 2026 (ScienceDirect): natural compounds can modulate skin clock genes — early, cosmetic-research frontier.

**Feature design:** Aurelia's AM/PM routine sequencing already implements this. Add the science footnote to the routine output ("your skin's repair biology runs at night — Lyons 2019"), and let the AI stylist RAG index the fact. **Effort: ~2 hours** (one copy block + one RAG entry).

## §6 Pollution & environment — VERDICT: STRONG (epidemiology), manual-tag feature

- Fussell et al. 2020 (ScienceDirect, 96 citations): NO₂ exposure significantly associated with more lentigines (cheeks) in both studied populations, in individuals over 50.
- Huang et al. 2022 (PMC, 27 citations): pollution–skin-aging correlation in Asian populations.
- Pamela 2020 (dermatoljournal): PAHs show the strongest association with acquired pigment spots in epidemiological studies.
- Buchanan 2024 (Dermatology Times): NO₂–pigment-spot association summary.

**Feature design:**
- **Journal context tag: "city day" / high-exposure day** (manual — geolocation would violate the privacy charter and add zero value the user doesn't already know).
- **Routine hint**: on tagged days, sunscreen reapplication and cleansing-first-evening copy rises in priority (ties into existing tips + actives data).
- Honest copy: the lentigine evidence is 50+ populations — "long-term urban exposure shows up in pigment studies; your daily habit that matters most is cleansing + SPF."

## §7 Competitor scan — the gap is real

| App | What it owns | Skin coupling |
|---|---|---|
| Hormona (hormona.io) | cycle + hormone tracking, app-store distribution | mentions hormone-aware wellness; no measured skin data |
| Clue (Play listing) | cycle tracking + wearables | marketing line: "understand how fluctuations affect mood, skin" — no measurement |
| Flo / Stardust / HealCycle (2025-26 roundups) | period + symptom analytics | symptom *self-report* at best; no colorimetry, no routines |
| Beauty routine apps (Skin Bliss et al., per RESEARCH-BEAUTY-APP-UX) | routines | no cycle/season context |
| Color-analysis apps (Dressika, Colorwise) | season palettes | no skin measurement trends at all |

**Nobody** pairs: measured per-zone skin trends × cycle phase × season × sleep/stress × actives — because it requires exactly the closed-loop measurement stack Aurelia already shipped (Skin Journal + Glow Delta + routine engine). The context layer is a *pure additive* on existing architecture.

## §8 Feature synthesis — the "Context Layer"

**Data model (one migration of the journal entry shape):**
```ts
type JournalContext = {
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'; // derived from logged period-start dates (on-device)
  sleepHours?: '<5' | '5-6' | '6-8' | '8+';
  stress?: 1 | 2 | 3 | 4 | 5;
  cityDay?: boolean;
  // season is NOT stored — derived from month at read time (not personal data)
};
```
- `JournalEntry + JournalContext` → journal capture UI gains a 4-chip "context" row (skippable — tags must never feel mandatory).
- `journalTrends` gains grouped-slope comparisons (metric slope in tagged vs untagged weeks) — the same least-squares machinery, parameterized.
- `routine-engine` gains two modifiers: `seasonal(month, hemisphere)` (auto) and `lutealPhaseWindow(periodDates)` (gentle copy only).
- Period-start dates: new store field, on-device, exportable in the Passport (with a warning line since it's health-adjacent data — RESEARCH-COMPLIANCE §7.5).

**Build order (evidence strength × effort):**
| # | Feature | Evidence | Effort |
|---|---|---|---|
| 1 | Seasonal routine tilt (auto, month-derived) | STRONG (§2) | 1–2 d |
| 2 | Sleep + stress context tags + correlation milestones | STRONG (§3, §4) | 1–2 d |
| 3 | Cycle-phase tags + journal overlay + gentle luteal hint | acne STRONG / barrier MIXED (§1) | 2–3 d |
| 4 | "City day" tag + SPF/cleansing hint | STRONG epidemiology (§6) | 0.5–1 d |
| 5 | Circadian footnote on AM/PM + RAG entry | MODERATE (§5) | 0.25 d |

**Disclaimer set (verbatim, per charter + RESEARCH-COMPLIANCE §6):**
- Journal context: "Patterns you observe — not a diagnosis, and phase estimates come from dates you type, not medical data."
- Cycle overlay: "Studies find cycle effects on skin for many people, not everyone — the point is what *your* numbers show."
- Correlation milestones: "Correlation, not cause — sleep, stress and skin move together in the research, and in your journal too."

**Why this family matters strategically:** it is the retention layer the closed loop needs (RESEARCH-PAPERS §0 thesis: MEASURE → ADVISE → RE-MEASURE → ADAPT). A journal that *explains itself* ("redness up — it was your high-stress, low-sleep, late-luteal week") is the difference between a measurement app and a companion. And every piece is on-device, cosmetic-framed, and honest about mixed evidence — the two charters that keep regulators and users equally comfortable.

## Sources (live-searched 2026-09-09)

- Lucky AW et al. — "Quantitative Documentation of a Premenstrual Flare" — jamanetwork.com — 2004 (129 citations)
- Geller L et al. — "Perimenstrual Flare of Adult Acne" — pmc.ncbi.nlm.nih.gov — 2014 (74 citations; 63% late-luteal flares)
- Jain A et al. — "Menstrual cycle phases and acne flares" — sciencedirect.com — 2025 (1 citation; recounts +25% inflammatory lesions)
- samphireneuro.com — hormonal-acne summary (91% within 7 days pre-menses) — Feb 2026 ⚠️ secondary
- Nguyen ML et al. — "Physiological Changes in Women's Skin During the Menstrual Cycle" — pmc.ncbi.nlm.nih.gov — 2024 (7 citations; no significant hydration change across phases)
- "Menopause, Menstrual Cycle, and Skin Barrier Function" — journals.lww.com / researchgate.net — 2025 (higher TEWL mid-luteal vs ovulatory; estradiol protective)
- Murakami K et al. — "Effect of estrogen/progesterone ratio on the differentiation..." — sciencedirect.com — 2022 (18 citations)
- "Paradoxical effects of β-estradiol on epidermal..." — onlinelibrary.wiley.com — 2007
- "Sync or Swim: Navigating the Tides of Menstrual Cycle Messaging" — pmc.ncbi.nlm.nih.gov/articles/PMC12204122 — Mar 2025
- Women's Health Mag — "Should You Sync Your Skincare Routine with Your Menstrual Cycle?" — womenshealthmag.com — Apr 2026
- Nam GW et al. — "The seasonal variation in skin hydration, sebum, scaliness..." — pubmed.ncbi.nlm.nih.gov — 2015 (85 citations)
- "Seasonal variations in the skin parameters of Caucasian..." — onlinelibrary.wiley.com — Oct 2020
- Wan MJ et al. — "Seasonal variability in the biophysical..." — ovid.com — 2015 (53 citations; lowest TEWL in summer)
- "The Effects of Regional Climate and Aging on Seasonal..." — scirp.org
- "Does poor sleep quality affect skin ageing?" — pubmed.ncbi.nlm.nih.gov (chronic poor sleep → intrinsic aging + barrier)
- Afzal UM et al. — "Sleep deprivation and the skin" — academic.oup.com — 2023 (14 citations; Jang et al.: hydration ↓ after 1 day)
- sleepeducation.org — sleep-quality/skin coverage — Jul 2022; dallasassocderm.com — cortisol mechanism — Feb 2024
- Zari S et al. — "The association between stress and acne among female..." — pmc.ncbi.nlm.nih.gov/articles/PMC5722010 — 2017 (125 citations)
- Chiu A et al. — "Changes in the Severity of Acne Vulgaris as Affected by..." — jamanetwork.com — 2003 (500 citations)
- Bouraqqadi O et al. — "The impact of academic stress on acne" — sciencedirect.com — 2025 (7 citations)
- Wake Forest newsroom — "Link Found Between Teens' Stress Levels and Acne Severity" — Mar 2007 (23% higher odds)
- Lyons AB et al. — "Circadian Rhythm and the Skin: A Review" — pmc.ncbi.nlm.nih.gov — 2019 (99 citations)
- Zhang C et al. — "Natural compounds regulating skin circadian rhythms" — sciencedirect.com — 2026; IJORD — day/night cream study — Aug 2024; northbiomedical.com — "Your Skin Has a Clock" — 2026 ⚠️ secondary
- Fussell JC et al. — "Oxidative contribution of air pollution to extrinsic skin ageing" — sciencedirect.com — 2020 (96 citations; NO₂–lentigines)
- Huang CH et al. — "Detrimental correlation between air pollution with skin aging" — pmc.ncbi.nlm.nih.gov — 2022 (27 citations)
- Pamela RD — Jakarta air pollution/pigment — dermatoljournal.com — 2020; Buchanan L — Dermatology Times — 2024
- hormona.io + App Store listing (cycle/hormone tracking) — 2026; Google Play Clue listing ("fluctuations affect mood, skin") — 2026; Medium "Best Menstrual Cycle Analytics Platforms 2026" — Dec 2025
