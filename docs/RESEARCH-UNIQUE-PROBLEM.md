# RESEARCH-UNIQUE-PROBLEM — The Problem Aurelia Should Solve That Nobody Solves

**Project:** Aurelia · **Compiled:** 2026-09-09
**Methodology:** 16 live web searches (z-ai web_search) on problem evidence, competitor coverage, and scientific feasibility. Marketing-adjacent stats are labeled as such. Companion docs: [`RESEARCH-NEXT-TECH.md`](./RESEARCH-NEXT-TECH.md) (tech-first), this doc is **problem-first**.

---

## 1. The unique problem: "Will this actually work for ME?"

Every beauty shopper, standing in an aisle or scrolling a product page, asks one question for ~10 seconds before money changes hands: **"will this product work for me — my color, my skin, my routine, my shelf?"** No app on the market answers that question. Each existing app answers a different, *easier* question:

| Her real question | What the market answers instead | Evidence (2025–26) |
|---|---|---|
| Will this **shade** work with MY undertone & depth? | Brand-locked shade finders (Fenty/MAC/Sephora — only their own shades); AR try-on ("excellent for engagement, discovery and colour play — but less reliable for final decisions, especially ambient light" — matchmymakeup.com, Jun 2025); cloud-upload AI scanners (Lancôme, Perfect Corp — photo leaves the device) | 20–65% of online beauty returns are color-mismatch driven (netcoreunbxd, chromarabeauty — marketing-adjacent but consistent across sources); salon industry claims 80%+ of women wear the wrong foundation shade (weak source, directionally repeated) |
| Will this **play well with MY routine and skin**? | Yuka / OnSkin / INCI Beauty score ingredient *safety in isolation*. Documented criticism: "evaluates individual ingredients, not finished formulations… ignores concentration, formulation context, and interactions" (hadabuddy.com Apr 2026; sanctuaryskinvb Jun 2026; cosmetic chemists via newbeauty.com Oct 2024) | Ingredient checkers have 10M+ downloads — the demand is proven, the answer is incomplete |
| Do I **already own** something like this? | Nothing. No scanner on the market deduplicates her shelf. | >90% of women use cosmetics beyond their PAO (PMC/NIH study, Wang 2025, 6 citations); ~70% of cosmetics discarded unfinished (businesswaste.co.uk) |
| Will it **oxidize on MY skin**? | Nothing. Folklore only. Real user quote: "really frustrated… almost all of my foundations oxidizing to orange after an hour." | Oxidation = skin oil saturating iron-oxide pigments (paulaschoice.com, epilynx.com Dec 2025) — i.e., it is *person-dependent chemistry* |

**Root cause (why it stays unsolved):** the industry solves pieces in silos because every app owns ONE asset — a product database (Yuka), an AR SDK (Perfect Corp), a brand catalog (Fenty) — and **nobody owns a computational model of the girl herself**: her measured skin color, her undertone vector, her season, her skin type, her owned shelf, her routine. Her data is the missing primitive, and it's exactly what privacy-first apps *can* own and brands *can't*.

## 2. Why Aurelia can win it (unfair advantage already shipped)

We already possess ~90% of the model of her, built in previous layers:

- **Color science engine** — sRGB↔XYZ↔CIELAB, full CIEDE2000 (`src/lib/color-science.ts`)
- **12-season vector classifier** — warmth/depth/chroma/contrast profile persisted in store (`src/data/seasons.ts`)
- **Skin type + conflict/synergy matrix + AM/PM sequencer** (`src/lib/routine-engine.ts`, `src/data/actives.ts`)
- **On-device photo → Lab extraction** — k-means++ in Lab, deterministic, never uploaded (`src/lib/palette-extract.ts`)
- **AI stylist + RAG + Beauty Passport** (zero-party data export)

No competitor has this stack. Single-purpose apps that *touch* the space confirm the demand but leave the whole question unanswered: ShadeMatch Pro (App Store, Jul 2026 — on-device skin read, but foundation-only, native-only); foundation-shade-finder.com ("read your skin the way a colour lab does" — photo *upload*, single verdict); Match My Makeup ("scientific colour analysis" — quiz-based); politesociety.com (CIELAB shade comparison — single purpose).

## 3. The solve — "Mirror Test": a 4-verdict product decision engine

One flow, one screen: scan/photograph a product (or its swatch), get four verdicts against **her model**, each with an explainable *why*, all on-device, all offline.

### V1 — Color verdict (the science core: calibrated skin colorimetry)
- She takes one selfie **holding any near-white reference** (tissue, notebook paper). White-point correction against the reference (Cugmas et al. 2020, smartphone teledermoscopy calibration; Sirisathitkul 2025, "Accuracy and precision of smartphone colorimetry", 17 citations — established science, unexploited in free web apps).
- Measure skin in CIELAB at jaw/cheek/forehead → **Skin Signature**: L* (depth), hue angle h° (undertone, from a*/b*), C* (chroma) — a 5-number vector, persisted in her Passport.
- Product swatch photo (or shade hex from a brand page) → ΔE2000 vs her measured skin + **undertone-congruence test** (shade hue angle vs her hue angle) → verdict: *"2 shades lighter than your measured L\* 64; pulls 7° warmer than your hue angle — expect an orange shift on you."*

### V2 — Oxidation risk (genuinely novel, nobody models it)
- Her skin type (oiliness — already known from the quiz) × shade undertone warmth (from V1's swatch measurement) → **oxidation risk score** with the chemistry explanation (oil saturating iron oxides → darker + warmer shift) → *"Oily-combination skin + warm-toned shade = high oxidation risk — size a half-shade cooler/lighter."* A cross-domain heuristic heretofore only folklore.

### V3 — Chemistry verdict (label × HER routine)
- OCR the INCI list on-device (tesseract.js, lazy-loaded — per RESEARCH-NEXT-TECH §3) → fuzzy-match → run the existing conflict/synergy matrix against *her* actives → AM/PM slot placement, alternate-night warnings. This is the piece Yuka is criticized for not doing.

### V4 — Shelf verdict (duplicates + PAO)
- Every scanned product joins her **Shelf** (offline, Passport-exported): PAO countdown (the >90% PAO-overrun problem), duplicate detection (swatch ΔE2000 < 5 within the same category + same active slot → *"you already own a near-identical berry"*), cost-per-use as a bonus.

### Result card
Green / amber / red chips per verdict, each expandable with the science, one-tap share, saved to Passport. **"Not a try-on toy — a decision engine."** The AR mirror (NEXT-TECH §2) then becomes a *layer* on top of V1 (see the shade on your face — filtered to her measured undertone), not the product itself.

## 4. Why this is deep-tech, not "anyone can do it"

1. Reference-based **smartphone colorimetry** in a browser PWA = published-research technique, not a consumer feature (two citable papers above).
2. **ΔE2000 + Lab hue-angle congruence** for shade fit = real color science applied to a folklore domain (current apps do RGB similarity or quizzes at best).
3. **Oxidation risk model** = a novel cross-product heuristic (skin sebum profile × shade chemistry) — nothing on the market predicts it.
4. **OCR INCI parser + fuzzy matcher + conflict matrix + sequencer** = full on-device pipeline, no product database needed (dodges the liability and staleness of product DBs).
5. **Duplicate detection via perceptual color distance** across her shelf.
6. **Zero photos leave the device** — verifiable claim vs. every cloud-upload competitor.

## 5. Build plan (fits the shipped architecture)

| Phase | Deliverable | Effort |
|---|---|---|
| 1 | Skin Signature capture (selfie + white reference, Lab extraction reusing palette-extract) + Passport field + undertone/depth report | 1–2 d |
| 2 | Shade verdict: swatch photo/hex → ΔE2000 + hue-congruence + copy generation | 1–2 d |
| 3 | Oxidation risk heuristic + chemistry copy | 0.5–1 d |
| 4 | INCI OCR scanner (tesseract.js lazy) → existing conflict engine | 2–3 d |
| 5 | Shelf: PAO + duplicates + result-card UI + e2e suite | 2 d |
| 6 | AR mirror as premium layer (FaceLandmarker, season/measurement-filtered shades) | 3–5 d |

Charters preserved: on-device by default; AI routing invisible to users; body-positive, explainable verdicts.

## Sources (live-searched 2026-09-09)

- PMC/NIH Wang 2025 — cosmetics PAO overrun study (>90%, 6 citations)
- Cugmas et al. 2020 — smartphone color calibration for teledermoscopy (25 citations); Sirisathitkul 2025 — smartphone colorimetry accuracy/precision (17 citations); Marefat 2025 — image-based colorimetric analysis (PMC)
- hadabuddy.com (Apr 2026), sanctuaryskinvb.com (Jun 2026), newbeauty.com (Oct 2024) — Yuka/ingredient-scanner limitations
- matchmymakeup.com (Jun 2025) — AR try-on unreliable for final decisions; bmfitt.com 2026 — 20-platform AR accuracy ranking
- netcoreunbxd.com, chromarabeauty.com, mintoiro.com — shade-mismatch return rates 20–65% (marketing-adjacent, labeled)
- color-analysis.app, palettehunt.com, personalcolorai.com (2025–26) — professional color analysis pricing $200–350 in-person
- paulaschoice.com, epilynx.com (Dec 2025) — foundation oxidation chemistry
- Competitor surface check: fentybeauty.com, maccosmetics.com, sephora.com, lancome.ca, perfectcorp.com, faceshapedetector.app, foundation-shade-finder.com, apps.apple.com ShadeMatch Pro, play.google.com INCI Beauty, apps.apple.com OnSkin/PaoUp
