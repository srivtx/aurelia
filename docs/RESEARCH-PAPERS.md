# RESEARCH-PAPERS — What AURELIA Can Build, Grounded in Actual Papers

> **Part of Aurelia** · [README](../README.md) · [Docs index in README](../README.md#docs) · [Extended README](./README-EXTENDED.md) · [CONTEXT](./CONTEXT.md) · [DEPLOYMENT](./DEPLOYMENT.md)


**Project:** Aurelia · **Compiled:** 2026-09-09 · **Methodology:** 14 live paper-hunts (z-ai web_search) across dermatology colorimetry, cosmetic chemistry CV, psychophysics of color, fashion-compatibility learning, and hair fiber science. Every feature below names its paper lineage and an on-device implementation path. Predecessors: [`RESEARCH-NEXT-TECH.md`](./RESEARCH-NEXT-TECH.md) (platform APIs), [`RESEARCH-UNIQUE-PROBLEM.md`](./RESEARCH-UNIQUE-PROBLEM.md) (problem-first market case).

---

## 0. The thesis this research unlocks: **the closed beauty loop**

Everything on the market is **open-loop**: it gives advice (or a try-on toy) and never *measures the outcome*. The papers below supply measurement tools that run on a phone: colorimetry, lesion detection, hydration proxies, preference psychophysics. AURELIA already owns the advice engines (season, routine, outfit, stylist). Combining the two makes AURELIA the first **closed-loop beauty app**:

```
MEASURE (selfie colorimetry / skin CV) → ADVISE (existing engines) → RE-MEASURE (delta) → ADAPT
```

Nobody has this loop, and research is what makes it honest — every measurement below has a citable lineage.

---

## 1. Skin Colorimetry → **Skin Signature (ITA° + multidimensional scale)**

**Papers:** ITA° is the dermatology standard — "Research Techniques Made Simple: Cutaneous Colorimetry" (JID 2019); ITA review on PMC ("Skin Tone Analysis Through Skin Tone Map Generation"); Sony AI "Beyond Skin Tone: A Multidimensional Measure of Apparent Skin Color" (2023 — argues ITA alone conflates depth and hue, adds **Hue Angle + Valence**); "A New Method for Skin Color Classification Based on Global Consensus" (Wiley, Sep 2025); "Which Skin Tone Measures Are the Most Inclusive?" (Heldreth, ACM FAccT 2024, 75 citations — Fenty/Monk scales perceived more inclusive than Fitzpatrick).

**Formula (open, published):** `ITA° = arctan((L* − 50) / b*) × 180/π` → very-light → dark classes; hue angle `h° = arctan(b*, a*)` → undertone; chroma `C* = √(a*²+b*²)`; Sony valence for the full vector.

**Build:** one calibrated selfie (white-reference card, per RESEARCH-UNIQUE-PROBLEM V1) → 4-number Skin Signature persisted in Passport. Replaces the *folklore* undertone quiz with measured dermatology; feeds season engine (better priors), shade verdicts, AR rendering. ~1–2 d, pure TS on the existing color-science engine. **Bonus:** rate our 19-color palette rendering against Monk Skin Tone 1–10 (open-source scale, Google) → an equity/verification statement no competitor can make.

## 2. Foundation blend prediction → **"How it will look on YOU" without AR**

**Paper:** "A Color Image Analysis Tool to Help Users Choose a Makeup Foundation Color" (arXiv, Jul 2024) — predicts **skin-with-foundation color** from a no-makeup selfie + a foundation shade image, using image calibration and ML blend models. Related: TrueHue (Cal Poly 2025, CNN shade recommendation); "Accurate Skin Tone Classification for Foundation Shade" (Syahputra 2025).

**Build:** her measured skin Lab + shade swatch Lab → blend model (paper uses learned α per skin region; we start with Lab-space α-blend + hue-shift term, upgradeable) → render the *predicted on-face color* on her selfie's cheek/jaw patches — no 3D engine, no GAN. Output: "predicted on-skin: L* 71, hue 68° — ΔE 3.2 from your jaw = near-invisible match; ΔE 8.4 = noticeably pink". ~1–2 d, pure math + canvas.

## 3. Before/after makeup ΔE → **"Glow Delta"**

**Paper:** Kim 2023, "Method and analysis of color changes of facial skin after makeup" (ScienceDirect, 11 citations) — quantifies facial color change from makeup using open-source CV, per skin region, in Lab.

**Build:** two selfies (before/after) → face-aligned region grid (MediaPipe landmarks, already researched) → per-cell ΔE2000 heatmap + summary metrics (evenness ↑, redness ↓, luminance ↑). The output is a **shareable, measurable "your look did this" card** — nobody in the market quantifies makeup outcomes. ~1 d. Body-positive framing: measures *change*, not "beauty".

## 4. Skin-objective tracking → **Skin Journal with lesion trend** (the retention engine)

**Papers:** Quattrini 2022 "Deep Learning-Based Facial Acne Classification System" (34 citations); "AI in the Assessment and Grading of Acne" (Traini 2025, PMC, 20 citations); AcneDet (Faster R-CNN object detection, 2022); Microsoft Research's cellphone-acne CNN (2019); wrinkle+pore segmentation (Yoon 2023, PMC, 27 citations); PhotoAgeClock (Aging-US 2019).

**Build (honest, on-device):** weekly selfie → face landmarks → cheek/forehead/chin/jaw crops → (a) **today, pure-CV proxy**: redness (a* shift), evenness (ΔE dispersion), texture (edge-density) — all explainable; (b) **phase 2**: MobileNet-class ONNX lesion classifier via transformers.js (lazy-loaded) trained on public acne datasets. Trend charts per zone, wired into the **routine engine** ("week 3 on niacinamide: cheek redness ↓ 18%") — the closed loop in action. Positioning: tracking, not diagnosis (disclaimer, charter-safe). ~2–4 d.

## 5. Hydration proxy → **"Hydration Check"** (frontier, carefully labeled)

**Paper:** Soh 2025, "AI-driven Remote Facial Skin Hydration and TEWL Assessment from Selfie Images: A Systematic Solution" (first study to estimate hydration + TEWL from selfies — published mi-research, Jan 2026).

**Build:** we can't ship their CNN, but the validated *signal* is specular: T-zone highlight-ratio (gloss) vs matte diffusion from a controlled-light selfie → hydration *proxy trend* before/after moisturizer, honestly labeled "estimate, not a corneometer". ~1 d, pure CV optics.

## 6. Color-pair psychophysics → **preference-grounded Outfit Lab + palette generator**

**Papers:** Schloss 2010 "Aesthetic response to color combinations" (396 citations — preference beyond component colors; hue-pair structure); Forni 2026 (hue-pair preferences vs natural hue statistics); Yang 2024 (personalized color-theme rating prediction); Li 2025 (colour harmony perception in *clothing* combinations, Springer Fashion & Textiles); Moretti's computational colour-harmony production.

**Build:** encode published hue-pair preference surfaces (peak ~ similar hues + complementary accents; blue/green pairs over-preferred, yellow under) as a lookup/weighting over our existing hue-geometry classifier → Outfit Lab scores gain a *psychophysics-grounded* term, and "Generate my palette" becomes "seeds from her season anchor hue, filtered through Schloss-preference peaks + Li's clothing-harmony findings". ~1–2 d, pure math, extremely citable.

## 7. Curl-pattern science → **texture-aware hair module**

**Papers:** "Classification of High Curl Pattern Hair: A Systematic Review" (Callender, PMC 2026 — L'Oréal curl classification, curvature fiber model); hair-type classifiers (FastAI, 5-class); follicle/hair-loss severity classification (Kim 2022, 46 citations).

**Build:** hair photo → fiber curvature estimation (ridge/strand curvature in pure CV) or small ONNX classifier → Type 1–4 + subtypes → unlocks the *missing* hair-by-texture content module (currently zero coverage) and texture-aware product/styling advice. ~1–2 d.

## 8. Fashion-compatibility research → **diagnosing outfit failures**

**Papers:** Cui 2019 "Node-wise GNN outfit compatibility" (178 citations, Polyvore); OutfitTransformer (Sarkar 2023, 70 citations); Balim 2023 "Diagnosing fashion outfit compatibility with deep learning" (21 citations — *not just a score: which item weakens the outfit*); GNN survey (arXiv 2024).

**Build:** we can't run their networks, but the **diagnosis** idea maps 1:1 onto our deterministic engine: bipartite item-category graph, per-node contribution scores → "the outfit was 82 — but the caramel bag is 3 chroma steps hotter than everything else; swapping to taupe predicts 91". Explorable, no model needed. ~1–2 d.

## 9. Makeup transfer research → **calibrated AR** (validation for the AR mirror)

**Papers:** BeautyGAN (2018), PSGAN/PSGAN++ (IET review 2022 — detail-preserving transfer + de-makeup), real-time identity-preserving transfer (arXiv Sep 2025); survey Ma 2021 (17 citations).

**Build angle:** GANs are too heavy for the browser — but Kim 2023 (§3) gives *measured* post-makeup Lab shifts, so our landmark-hull AR rendering (NEXT-TECH §2) can be **colorimetrically calibrated**: "multiply-blend lip at α=0.35 with +4 b* shift" matches real lipstick behavior. Our AR becomes the only *physically-calibrated* browser try-on.

## 10. Considered and parked

- **rPPG (heart-rate from camera)** — real research (Xiao 2024, 148 citations; Nature roadmap 2026) but health-adjacent and off-charter for a beauty app. Park.
- **Makeup GAN transfer / de-makeup in-browser** — model weight cost ≫ value today. Park (see §9 for the subset we take).
- **ITA-based demographic proxies** (Wiley 2025 uses ITA for demographic group membership) — off-charter, refuse.

---

## Build order (all on-device, all offline)

| # | Feature | Effort | Papers | Unlocks |
|---|---|---|---|---|
| 1 | Skin Signature (ITA° + hue/valence) | 1–2 d | JID 2019, Sony 2023 | the measurement primitive everything else uses |
| 2 | Foundation blend prediction | 1–2 d | arXiv 2024 | "how it looks on you" without AR |
| 3 | Glow Delta (before/after ΔE) | 1 d | Kim 2023 | shareable measurable outcomes |
| 4 | Skin Journal trends | 2–4 d | Quattrini/AcneDet/Traini | closed-loop retention engine |
| 5 | Preference-grounded outfit/palette | 1–2 d | Schloss 2010, Li 2025 | psychophysics-grade scoring |
| 6 | Curl classifier + texture module | 1–2 d | Callender 2026 | hair-by-texture content gap |
| 7 | Outfit diagnosis graph | 1–2 d | Cui 2019, Balim 2023 | explainable weak-item fixes |
| 8 | Calibrated AR mirror (cap on NEXT-TECH §2) | 3–5 d | Kim 2018–2023 + MediaPipe | flagship demo |
| 9 | Hydration proxy | 1 d | Soh 2025 | frontier signal, honest label |

Non-negotiables preserved: on-device by default; AI routing invisible to users; measurements are *trends and change*, never "beauty scores"; no medical diagnosis claims.

## Sources (live-searched 2026-09-09)

- Colorimetry: JID "Research Techniques Made Simple: Cutaneous Colorimetry" (2019); PMC "Skin Tone Analysis Through Skin Tone Map Generation"; Sony AI "Beyond Skin Tone" (2023); Wiley "New Method for Skin Color Classification" (Sep 2025); OpenOximetry ITA page; Heldreth FAccT 2024 "Which Skin Tone Measures Are the Most Inclusive?"; Monk Skin Tone — skintone.google / Wikipedia / Mehta 2025 (15 citations)
- Foundation: arXiv 2407.x "A Color Image Analysis Tool to Help Users Choose a Makeup Foundation Color" (Jul 2024) + themoonlight.io review; TrueHue (Cal Poly 2025); Syahputra 2025; Kim 2023 "color changes of facial skin after makeup" (11 citations)
- Acne/skin CV: Traini 2025 (PMC, 20 citations); Quattrini 2022 (34 citations); AcneDet preprint 2022; Microsoft devblogs 2019; Yoon 2023 wrinkle/pore segmentation (27 citations); PhotoAgeClock (Aging-US 2019); Soh 2025 hydration/TEWL from selfies (mi-research, 2026)
- Color psychophysics: Schloss 2010 (396 citations); Forni 2026 (ScienceDirect); Yang 2024 (Durham); Li 2025 (Springer F&T); Moretti computational colour harmony
- Hair: Callender 2026 systematic review (PMC); Kim 2022 follicle classification (46 citations); FastAI hair-type classifier
- Fashion compatibility: Cui 2019 (178 citations); Sarkar OutfitTransformer 2023 (70 citations); Balim 2023 (21 citations); GNN survey arXiv 2024
- Makeup transfer: BeautyGAN 2018; PSGAN++ (IET review 2022); Ma 2021 survey (17 citations); real-time identity-preserving transfer (arXiv Sep 2025)
- rPPG: Xiao 2024 (148 citations); Elgendi 2026 Nature roadmap; JACC 2023
