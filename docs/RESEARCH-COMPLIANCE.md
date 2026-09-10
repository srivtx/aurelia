# RESEARCH-COMPLIANCE — Regulatory, Privacy & Claims-Language Safety for Aurelia

> **Part of Aurelia** · [README](../README.md) · [Docs index in README](../README.md#docs) · [Extended README](./README-EXTENDED.md) · [CONTEXT](./CONTEXT.md) · [DEPLOYMENT](./DEPLOYMENT.md)


**Project:** Aurelia (beauty/style PWA, Next.js 16 App Router, TS, on-device-first) · **Compiled:** 2026-09-09
**Methodology:** 16 live web searches (z-ai web_search); snippet-level evidence, marked ⚠️ where not fully verified. Primary-source anchors: EDPB, EUR-Lex, EU Commission, FDA, FTC, MDCG, CNIL/ICO commentary, law-firm client memos (Gibson Dunn, DLA Piper, Orrick, Foley, Finnegan, Mishcon, Stibbe). Two secondary verifications could not be run (tool outage) — flagged inline. Companion docs: [`RESEARCH-PAPERS.md`](./RESEARCH-PAPERS.md) (measurement science), [`RESEARCH-GROWTH.md`](./RESEARCH-GROWTH.md) (distribution/monetization, incl. FTC affiliate disclosure).
**Scope:** research + this document only. No app code was changed.

---

## Executive summary

1. **GDPR applies to Aurelia in exactly one place: the `/api/stylist` chat route.** Photos, measurements, journal and Passport never leave the device, so that processing sits at/outside GDPR material scope (EDPB 04/2019 "connected devices" logic, corroborated by 2025 academic commentary ⚠️) — but user chat text transmitted to LLM providers is in-scope: controller duties (Art. 13 information, legal basis, processor/transfer disclosure) attach to the chat alone.
2. **A selfie is personal data; it is *biometric* data only if processed for unique identification** — skin-color measurement is not, so no Art. 9 special category applies (EDPB Guidelines 3/2019 line, confirmed by multiple 2024-25 commentaries).
3. **EU AI Act Art. 50(1) is live law since 2 Aug 2026**: persons interacting with the stylist chatbot must be told they're interacting with an AI ("unless obvious") — a persistent "AI assistant" line in the chat UI satisfies it; infringement tier is €15M/3% of global turnover (⚠️ regulation text).
4. **Skin measurement is NOT prohibited biometric categorisation**: Art. 5(1)(g) (in force since 2 Feb 2025) bans only systems deducing race/ethnicity, political opinions, trade-union membership, religious/philosophical beliefs, sex life/sexual orientation — cosmetic skin-tone/trend analysis infers none of these.
5. **Aurelia is not high-risk under Annex III**, and the Digital Omnibus (proposed 19 Nov 2025, political agreement 7 May 2026) deferred Annex III high-risk obligations to 2 Dec 2027 anyway — but transparency duties (Art. 50) were NOT deferred.
6. **FDA's cosmetic/drug line governs copy**: "intended to diagnose, treat, prevent disease or affect structure/function" = drug. FDA warning letters have specifically flagged "promote collagen production," "reduce all types of hyperpigmentation," "lighten the skin," and acne-treatment claims — Aurelia copy must stay appearance-worded ("reduces the *look* of redness").
7. **MDR Rule 11 / MDCG 2019-11 boundary**: "trends not diagnosis" keeps Aurelia a non-medical device; "acne severity grading," "lesion monitoring," or disease-directed advice would flip it. Document the non-qualification decision (openregulatory, Aug 2026).
8. **FTC**: Operation AI Comply (Sept 2024) set the AI-deception baseline; 2026 posture is lighter (Rytr order set aside Jan 2026) but §5 substantiation is permanent — never claim AI accuracy you haven't tested; "AI stylist" itself is fine because it's true.
9. **Future affiliate links** = FTC Endorsement Guides (2023) + Consumer Reviews Rule (effective 21 Oct 2024): material-connection disclosure must be "clear and conspicuous" and adjacent to each link, not buried in an About page.
10. **Play/App Store health policies** prohibit misleading health functionality and require regulatory proof *or* a disclaimer for medical-adjacent apps — Google Play's "Health Content and Services" policy text is the platform compliance anchor for the trends-not-diagnosis disclaimer.

---

## §1 GDPR & face photos

**Verdict: GDPR materially applies only to the AI-chat pipeline; the on-device photo pipeline is at the edge of material scope — but best practice (and honest marketing) demands a privacy policy anyway.**

**Is a selfie personal data?** Yes — Art. 4(1) GDPR covers "any information relating to an identified or identifiable natural person," and a self-portrait depicts an identifiable person (GDPR Art. 4 text via gdpr-info.eu; CNIL's "Identify personal data" sheet). So the *image* is personal data while it exists on the device.

**When does it become biometric / Art. 9 data?** Only when processed "for the purpose of uniquely identifying" a person via specific technical means (Art. 4(14)). The EDPB's video-devices guidelines (3/2019) line, consistently repeated in later commentary: images are special-category data only if processed through technical means that match them to a person's identity (policyreview.info 2024: "In order for images to be classified as biometric data, they must be processed through a system that matches them with an individual's identity"; Brömme et al.: Art. 9's "criterion of purpose requires that biometric data be processed to identify a natural person uniquely"; ICO: biometric gets special protection "when used for unique identification"; EDPB Opinion 11/2024 reaffirms this framing). **Aurelia computes CIELAB values for cosmetic advice — there is no identification purpose, no template, no matching. Not biometric data, no Art. 9 processing.** A close cousin: skin-condition *trends* could in principle be "health data" (Art. 4(15)) if they revealed disease — but cosmetic-appearance self-tracking without diagnosis is treated as ordinary personal data in commentary ⚠️ (no directly-on-point 2026 guidance found).

**Does GDPR apply at all to on-device-only processing?** The EDPB's connected-devices logic (Guidelines 04/2019, connected vehicles) is that the GDPR does not in principle apply to processing carried out purely locally on a device and never transmitted to the manufacturer or a third party; 2025 academic commentary restates it: "the GDPR does not regulate the processing operations of smart devices that process data locally, the processing operations fall outside of the scope" (ScienceDirect 2025 ⚠️; underlying EDPB 04/2019 text not directly fetched ⚠️). Aurelia's photo path is exactly this: no account, no identifier, no upload. Two cautions: (a) this is a *material-scope* argument, not a magic exemption — if a bug or future feature ever transmits pixels, you are instantly in scope; (b) the **chat route IS in scope**: user-typed text goes to Aurelia's server and onward to LLM providers. That makes Aurelia a **controller** for chat processing, wherever the user is in the EU. Users may also volunteer health details in chat ("I have rosacea…") — Art. 9 exposure; safest posture: no server-side logging, no model fine-tuning on user inputs, model prompted to decline medical advice (⚠️ practice inference from Art. 9 text, not a fetched guideline).

**Practical requirements:** an Art. 13-style privacy policy (see §7) — controller identity, what stays on device, what is transmitted (chat text → AI provider category), legal basis (likely Art. 6(1)(b) contract or 6(1)(f) legitimate interest for the routing), recipients/categories (Art. 13(1)(e)), transfer safeguards if providers are US-based (OpenAI maintains a separate Europe privacy policy — openai.com, Aug 2026), retention, and data-subject rights contact. The "AI routing invisible" charter is compatible: GDPR requires disclosing *categories of recipients*, not the specific provider's brand name (⚠️ reading of Art. 13(1)(e)). localStorage for an offline PWA is arguably "strictly necessary" storage under ePrivacy Art. 5(3), so no cookie banner is needed while no analytics exist (⚠️ no snippet fetched; verify against EDPB Guidelines 2/2023 before launch).

**US extras:** Washington's My Health My Data Act (effective for most duties since Mar 2024) covers "consumer health data" = information linkable to a consumer identifying physical/mental health condition, collected by non-HIPAA businesses (WA AG; EFF Jul 2025). On-device data never transmitted to the business arguably isn't "collected" ⚠️, and a free no-account app likely sits below MHMD's small-business thresholds ⚠️ — revisit the moment analytics or accounts appear. GPC: 12 states require honoring universal opt-out signals as of 1 Jan 2026 (Didomi Dec 2025; Colorado has since Jul 2024) — irrelevant while you sell/share nothing, but publish a "we don't sell or share" statement. Illinois BIPA shouldn't bite because nothing identifies anyone (no face-geometry template) ⚠️.

## §2 EU AI Act classification (Reg. 2024/1689)

**Timeline (as of 2026-09-09):**

| Date | Event | Status |
|---|---|---|
| 1 Aug 2024 | Entry into force | Done |
| 2 Feb 2025 | Ch. I–II: prohibited practices (Art. 5), AI literacy (Art. 4) apply | In force |
| 2 Aug 2025 | GPAI obligations, governance, most penalties | In force |
| **2 Aug 2026** | **General application — incl. Art. 50 transparency** | **In force now** |
| 19 Nov 2025 | Digital Omnibus proposal (AI Act + GDPR simplification) | Proposed |
| 7 May 2026 | Political agreement on Omnibus | Agreed ⚠️ formal adoption pending |
| 2 Dec 2027 | (Deferred) Annex III high-risk obligations | Per Gibson Dunn, May 2026 |
| 2028 | (Deferred) Annex I product-embedded high-risk | Per Gibson Dunn, May 2026 |

(European Commission digital-strategy page: "entered into force 1 August 2024 and became applicable on 2 August 2026, with some exceptions: prohibited AI practices and AI literacy…"; Digital Omnibus: DLA Piper, CSA Labs Jul 2026, Winston & Taylor, Gibson Dunn May 2026, Orrick Jul 2026 — which also adds new bans: NCII, "nudifier" apps, CSAM. Amnesty opposed the rollback (Apr 2026) — final legal text should be re-verified before launch.)

**(a) The AI stylist chatbot — Art. 50(1), live now.** "Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that persons are informed that they are interacting with an AI system, unless this is obvious from the circumstances and context of use to a reasonably informed, observant and circumspect person." (disclosekit.eu Jul 2026: "Article 50(1) requires that persons be informed they are interacting with an AI system. This is a transparency obligation, not a consent [obligation]"; reglog.io Jul 2026 on the "obviousness" exception.) Aurelia is both provider and deployer of the stylist system. **Action: a persistent, visible line in the chat UI** — e.g. "You're chatting with an AI stylist — it can be wrong. For skin conditions, see a professional." Do not rely on the "obviousness" carve-out (a friendly named assistant reads human). Aurelia is a *deployer* of third-party GPAI models, not a GPAI *provider* — GPAI documentation/summarization duties sit with the model providers, not with you (⚠️ from timeline sources + role logic; no on-point guidance fetched).

**(b) On-device skin measurement — biometric categorisation?** Two gates: (1) "Biometric data" under the AI Act (Art. 3(34), mirroring GDPR) requires technical processing that allows/confirms *unique identification* — CIELAB region sampling does neither. (2) "Biometric categorisation system" (Art. 3(40)) assigns persons to categories *on the basis of biometric data*. Even if a regulator stretched to treat face-derived skin-tone classification (ITA°/Monk scale) as biometric categorisation: **Art. 5(1)(g) prohibits it only when the system deduces or infers race/ethnic origin, political opinions, trade-union membership, religious/philosophical beliefs, sex life or sexual orientation** (FPF Mar 2026: "The prohibition under Article 5(1)(g) applies only when a biometric categorization system is used to deduce or infer specific sensitive [attributes]"; Stibbe Jul 2026; William Fry; Kindt 2025). Skin-tone measurement for *shade matching* is not race inference — but this is the one genuinely unsettled area, and beauty/AR commentary treats facial-analysis inputs cautiously ("When facial images are processed for identification or analysis in virtual try-on services, they may be treated as biometric data" — Finnegan, Nov 2025; Mishcon Mar 2026). If a regulator did classify skin measurement as biometric categorisation, the duty is Art. 50(3): the deployer must *inform each exposed natural person of the operation of the system* (Stibbe). In a self-use app the exposed person is the user — an in-UI line ("measured locally from your photo, never uploaded") satisfies even that reading. **Do not build emotion recognition or any demographic-inference feature** — those are the tripwires.

**(c) Risk classification.** Annex III lists critical-use biometrics, infrastructure, education, employment, essential services, law enforcement, migration, justice, democratic processes — a cosmetic advice app is in none of them (⚠️ Annex content from regulation knowledge; corroborated by Finnegan commentary treating beauty apps as facing only transparency-tier duties). Conclusion: **not high-risk, not prohibited, one real duty (Art. 50(1) chat disclosure) + cheap insurance (Art. 50(3)-style measurement notice). Document the classification decision in a short internal memo** — same discipline openregulatory recommends for MDR non-qualification.

## §3 FDA MoCRA & US claims boundary

**MoCRA doesn't regulate apps.** It regulates cosmetic *products*: facility registration/listings via Cosmetics Direct (running; FDA page Jul 2026), safety substantiation, adverse-event reporting; the fragrance-allergen rule isn't out yet ("As of January 2026, FDA has not yet issued fragrance allergen regulations" — Foley, Mar 2026; NPRM anticipated May 2026, enforcement 2027+ — UL Prospector/AssureEntry ⚠️). **Aurelia becomes MoCRA-adjacent only if it ever sells or white-labels products (PAO advice about other people's products is unaffected).**

**The live issue is the FD&C drug/cosmetic line, which is claims-driven.** A cosmetic is "intended for cleansing, beautifying, promoting attractiveness, or altering the appearance"; a drug is "intended to diagnose, cure, mitigate, treat, or prevent disease" or "to affect the structure or any function of the body" (FDA, "Is It a Cosmetic, a Drug, or Both?", Sep 2024). Because acne is a disease, "treats acne" is a drug claim; because collagen is structure, "boosts/promotes collagen production" is a drug claim. FDA warning-letter history shows exactly these flips: "promote collagen production," "reduce all types of hyperpigmentation," "lighten the skin" (dglaw recap); 2017 letters to two cosmetics companies whose claims "established their products as drugs" (AGG); and a CIR-hosted 2025 FDA deck collects "examples of unapproved drug claims from recent warning letters" (⚠️ PDF not opened). Unlike supplements, cosmetics have NO structure-function allowance — "structure/function claims violate [the FD&C Act] because cosmetic products have not been approved as drugs" (shb.com ⚠️ older but on-point).

**For app copy:** the app isn't itself a marketed cosmetic, so the risk is indirect — (a) endorsing drug-flip claims about products it recommends (FTC substantiation + platform risk), (b) drifting the app's own described "intended use" toward treatment, which pulls it toward FDA/FCC/FTC attention and (via MDR logic, §4) toward device territory. Rules: use appearance framing ("improves the look of redness" not "treats redness/rosacea"), never "boosts collagen," never "treats/cures/prevents acne" — "breakout-prone," "blemish-prone" journaling language instead. EU Reg. 655/2013's six common criteria — legal compliance, truthfulness, evidential support, honesty (no exaggeration), fairness, informed decision-making (EUR-Lex; WKO guidelines) — are the best drafting benchmark even though they formally bind *product* claims.

## §4 Medical device boundary (MDR 2017/745 + US)

**Rule:** software is a medical device when its **stated intended purpose** is diagnosis, prevention, monitoring, treatment or alleviation of disease (MDCG 2019-11 — health.ec.europa.eu; revised July 2025 per biosliceblog). Software for "non-medical purposes… such as invoicing or staff planning" does not qualify (MDCG 2019-11 text). Rule 11 then classifies information-bearing software at Class IIa/IIb — but only once there's a medical purpose; "software that only stores data is not qualified as a medical device" (Johner Institute, Jan 2026). **"Monitoring" of a *disease* is the danger word for Aurelia**: "acne grading," "lesion trends," "severity score," "tracks your rosacea" would recast the journal as monitoring disease. "Trends in the appearance of redness" does not. MDCG 2019-11's own advice-in-spirit, made explicit by openregulatory (Aug 2026): **"Document the qualification decision even when the answer is 'not a medical device'… when a competent authority asks why your app isn't MDSW, a documented rationale is your defense."**

**Reference points on the far side of the line:** Germany's DiGA fast-track (BfArM) is only for Class I/IIa medical devices with proof of a positive healthcare effect (infoteam; mediacc) — i.e., what Aurelia would have to become if it ever *treated* acne. MDacne (US) shows the fully-regulated model: selfie-based acne-severity assessment tied to customized medication kits — a regulated treatment path, and even it markets that it "cannot diagnose underlying conditions" (miiskin.com 2024-25; PRNewswire 2018 ⚠️ FDA-clearance details not verified). FTC v. Mole Detective / MelApp (2015) is the cautionary tale: mole-photo-analysis apps whose detection claims were unsubstantiated drew FTC deception complaints (mobilemarketingwatch: apps "instructed users to photograph a mole"; polici.net). And the American Academy of Dermatology "warns that apps claiming to diagnose or provide treatment plans can provide inaccurate information" (PMC, Wongvibulsin 2024). US general-wellness enforcement discretion (FDA 2016/2019 guidance) covers lifestyle claims only ⚠️ (not fetched — verify if Aurelia ever approaches condition language).

## §5 FTC: AI claims + future affiliate rules

**AI claims (today):** Operation AI Comply (Sept 2024) brought cases against companies making deceptive AI-performance claims — FTC's framing: "Using AI tools to trick, mislead, or defraud people is illegal" (adventures-in-law Jan 2025; aiforthemarketer quoting FTC). 2026 posture is softer — the FTC reopened and set aside the Rytr consent order in Dec 2025 and is prioritizing kids' privacy over AI regulation (Bloomberg Law, Jan 2026) — but §5 FTC Act deception/substantiation is permanent law. **Rules for Aurelia: (1) never quantify AI accuracy you haven't measured; (2) "AI stylist" is fine — it *is* AI; (3) the privacy claim "photos never leave your device" is a factual marketing claim — it must be literally true at all times (false privacy claims are classic §5 territory ⚠️); (4) don't imply human experts ("your personal dermatologist") behind the chat.**

**Endorsements (future affiliate links):** Endorsement Guides, 16 CFR Part 255, as updated June 2023: any material connection (payment, free products, affiliate commission) must be disclosed clearly and conspicuously — unavoidable, in the same visual field as the endorsement (iubenda; citruslabs: "must clearly disclose any material connection"; MMR on 2023 examples). The **Rule on the Use of Consumer Reviews and Testimonials took effect 21 Oct 2024** — bans fake/false AI-generated consumer reviews and undisclosed insider reviews (allainews Sep 2026). June 2025 proposed updates recast promo codes, affiliate links and brand tags as endorsements requiring "clear and conspicuous" disclosure (influencermarketinghub Jun 2025 ⚠️ proposal status unverified). **In-app rule when affiliates come: a "We may earn a commission" line adjacent to every affiliate link/button — not in a linked policy page.** No endorsements exist today → nothing to do now.

## §6 Claims-language matrix for Aurelia

| Feature | Risky phrasing | Safe phrasing | Source basis |
|---|---|---|---|
| Skin measurement (CIELAB / L*, ITA°) | "Reads your skin health"; "detects sun damage or disease" | "Measures color values of your skin from your selfie — on your device" | FDA cosmetic/drug line; EDPB 3/2019 (not biometric); Finnegan |
| Redness/evenness/texture/gloss trends | "Tracks your acne/rosacea"; "severity grade 2" | "How the *look* of redness changed over 4 weeks — trends, not a diagnosis" | MDCG 2019-11 monitoring-of-disease line; AAD warning; Play Health policy |
| Acne-adjacent journaling | "Acne severity score"; "lesion count"; "treat your acne" | "Journal the zones you care about (chin, breakout-prone)"; "blemish-prone" | FDA: acne = disease → "treats acne" = drug claim; dglaw/AGG warning letters |
| Ingredient matrix / conflicts | "Niacinamide will calm your rosacea"; "retinol boosts collagen production" | "Niacinamide is widely used to improve the *look* of redness; retinoids are known for renewing skin's appearance — for treatment questions, ask a pharmacist/derm" | FDA drug-claim flips ("promote collagen production" — dglaw); 655/2013 honesty (no exaggeration) |
| Routine sequencing (AM/PM) | "Your prescription routine" | "Suggested order for the products *you* already use" | "Prescribe" implies medical authority (MDR logic ⚠️) |
| PAO countdown (planned) | "Warns you when products become unsafe" | "Many products suggest replacing N months after opening — track your own" | 655/2013 truthfulness (don't overstate what a countdown does) |
| Shade-fit verdict | "Finds your exact match — guaranteed" | "2 shades lighter than your measured L* — an estimate from your photo's colors" | 655/2013 evidential support; FTC substantiation |
| Oxidation-risk heuristic (planned) | "Predicts if your foundation will oxidize" | "Formulas with these traits are often *described as* oxidation-prone — watch your own swatch over a day" | 655/2013 honesty (no performance exaggeration) |
| Hydration proxy | "Measures your skin's hydration" | "A gloss-based hydration *estimate* — not a corneometer" (already shipped ✓) | 655/2013 truthfulness; FTC substantiation |
| AI stylist chat | "Your personal beauty expert/dermatologist"; "always right" | "You're chatting with an AI stylist — it can be wrong; for skin conditions, see a professional" | AI Act Art. 50(1); FTC Operation AI Comply |
| Curl classification | "Diagnoses hair damage" | "Estimates your curl-pattern family (1–4) from strand photos" | MDR intended-purpose logic |
| Any marketing | "Fix your flaws"; "anti-aging cure" | "Measure change, not beauty" (existing charter ✓) | Body-positive charter; 655/2013 fairness |

## §7 Required artifacts & wording

**1. Privacy policy page (linked in footer + app store listing).** Sections: (a) controller identity + contact (Art. 13(1)(a)); (b) **What never leaves your device** — photos, measurements, journal, Passport (architecture statement); (c) **What is transmitted** — stylist chat messages only, routed server-side to an AI provider to generate replies, not used for training, not retained [make literally true]; (d) legal basis for chat routing (contract/legitimate interest); (e) recipients: category "AI service providers" + transfer safeguards if non-EU; (f) no accounts, no identifiers, no analytics, no ad SDKs, no sale/sharing of personal information (CCPA/GPC statement); (g) rights contact (access/deletion — note: for on-device data the user *is* the storage; deletion = app reset); (h) not directed at children under 13; (i) effective date + change log. (Art. 13 items: gdpr-info.eu; OpenAI's Europe privacy policy shows the provider-side pattern.)

**2. In-app AI disclosure (chat header, persistent):** "You're chatting with an AI stylist — it can make mistakes. It's not a dermatologist."

**3. Measurement transparency line (AI Act insurance, Art. 50(3)-style):** in Skin/Texture/Glow capture sheets: "Analysis runs on your device. Your photo is never uploaded."

**4. Disclaimer set (already chartered, keep verbatim):** journal: "Trends, not diagnosis — this measures appearance, not medical conditions." hydration: "estimate, not a corneometer." shade: "an estimate from color values."

**5. Passport/export notice:** "Your Beauty Passport contains your personal measurements and notes — no photos. It's generated on your device; delete it anytime. Think before sharing: it's about you." (Sharing warning because the JSON is health-adjacent personal data to any recipient.)

**6. App-store data forms:** Play Data Safety + Apple privacy labels must match reality: photos = on-device, not collected; chat = ephemeral processing, not stored. Play "Health Content and Services" policy requires "regulatory proof or a disclaimer for apps offering medical advice" — Aurelia is cosmetic advice; attach the trends-not-diagnosis disclaimer anyway.

**7. Internal one-page classification memo** (MDCG 2019-11 + openregulatory): intended purpose = cosmetic appearance self-tracking; not diagnosis/monitoring of disease → not MDSW; not high-risk under AI Act Annex III; no prohibited practice; Art. 50(1) implemented. Re-verify Digital Omnibus final text before launch.

## Sources (live-searched 2026-09-09)

- EDPB Guidelines 3/2019, video devices — edpb.europa.eu — Jan 2020
- EDPB Opinion 11/2024 (facial recognition) — edpb.europa.eu — May 2024 ⚠️
- "Personal data controllers and device producers: Mind the gap" — sciencedirect.com/science/article/pii/S2212473X25000458 — 2025 ⚠️ (local processing outside GDPR scope; underlying EDPB 04/2019 connected-vehicles logic)
- Gültekin-Várkonyi, "Navigating data governance risks" — policyreview.info — 2024 (images = biometric only when matched to identity)
- Brömme et al., systemic approach to biometric data — dl.gi.de ⚠️
- ICO, Key data protection concepts — ico.org.uk ⚠️
- GDPR Arts. 4, 9, 13 — gdpr-info.eu/art-4-gdpr, /art-13-gdpr
- EU Commission, AI Act page — digital-strategy.ec.europa.eu — 2026 (force 1 Aug 2024; applicable 2 Aug 2026; Feb 2025 exceptions)
- EU AI Act Reg. 2024/1689 Art. 5 explorer — artificialintelligenceact.eu/article/5/ — Feb 2025
- Legiscope, AI Act effective dates — legiscope.com ⚠️; Venvera, AI Act deadlines — venvera.com — Aug 2026 ⚠️
- Disclosekit, Chatbot disclosure under Art. 50 — disclosekit.eu/blog/chatbot-disclosure-requirement-eu-ai-act — Jul 2026
- Reglog, EU AI Act transparency rules — reglog.io/blog/eu-ai-act-transparency-obligations-article-50 — Jul 2026
- Stibbe, Transparency for Emotion Recognition, Art. 50(3) — stibbe.com — Jul 2026
- FPF, Red Lines under the EU AI Act — fpf.org — Mar 2026
- William Fry, Practical Guide to Biometric [Categorisation] — williamfry.com — Jul 2024
- Kindt, EU biometric data regulation Part 2 — scholarlypublications.universiteitleiden.nl — 2025
- Gibson Dunn, EU AI Act Omnibus Agreement — gibsondunn.com — May 2026 (Annex III → 2 Dec 2027; Annex I → 2028)
- Orrick, Digital Omnibus Finalizes 8 Compliance [Points] — orrick.com — Jul 2026 ⚠️ (new bans NCII/nudifier/CSAM)
- Winston & Taylor, AI Act high-risk delayed — winstontaylor.com — 2026 (political agreement 7 May 2026)
- DLA Piper, Digital AI Omnibus deferral — knowledge.dlapiper.com — Nov 2025; CSA Labs — labs.cloudsecurityalliance.org — Jul 2026; Amnesty — amnesty.org — Apr 2026 (opposition)
- FDA, Is It a Cosmetic, a Drug, or Both? — fda.gov/cosmetics/cosmetics-laws-regulations/it-cosmetic-drug-or-both-or-it-soap — Sep 2024
- FDA, Registration & Listing of Cosmetic Product Facilities (MoCRA) — fda.gov — Jul 2026
- Foley, How MoCRA Is Reshaping FDA Oversight — foley.com — Mar 2026
- dglaw, FDA crackdown on cosmetics marketing claims — dglaw.com ⚠️ (collagen/hyperpigmentation/lightening examples)
- AGG, A Rose by Any Other Name — agg.com — Aug 2017
- CIR, FDA's views on cosmetics vs. drugs — cir-safety.org (2025 deck) ⚠️ (not opened)
- MDCG 2019-11 — health.ec.europa.eu — rev. Jul 2025 (biosliceblog)
- openregulatory, MDCG 2019-11 qualification — openregulatory.com — Aug 2026
- Johner Institute, MDR Rule 11 — blog.johner-institute.com — Jan 2026
- BfArM, DiGA/DiPA — bfarm.de; infoteam, DiGA class I/IIa — infoteam.de
- MDacne — mdacne.com; miiskin.com deep dive — 2024-25; PRNewswire — Jan 2018 ⚠️
- mobilemarketingwatch, FTC mole-app actions — mobilemarketingwatch.com; polici.net — 2015
- Wongvibulsin et al., Dermatology mobile applications — pmc.ncbi.nlm.nih.gov (AAD warning) — 2024
- Parker et al., A health app developer's guide to law and policy — pmc.ncbi.nlm.nih.gov — 2017
- adventures-in-law, Operation AI Comply — adventures-in-law.com — Jan 2025
- Bloomberg Law, FTC to avoid AI regs — news.bloomberglaw.com — Jan 2026
- iubenda / citruslabs / MMR Strategy, Endorsement Guides 2023 — 2023-24
- allainews, Consumer Reviews Rule — allainews.net — Sep 2026 (effective 21 Oct 2024)
- influencermarketinghub, FTC June 2025 proposals — influencermarketinghub.com — Jun 2025 ⚠️
- EUR-Lex, Reg. 655/2013 — eur-lex.europa.eu; WKO guidelines PDF; cosmedesk
- Google Play, Health Content and Services policy — support.google.com/googleplay/android-developer/answer/16679511
- Finnegan, Cosmetics, AI Facial Skin Analysis, and Privacy — finnegan.com — Nov 2025
- Mishcon, Virtual try-on data protection — mishcon.com — Mar 2026; Fittingbox expert talk — fittingbox.com ⚠️
- Didomi, GPC in 2026 — didomi.io — Dec 2025; seresa.io — Jan 2026 (12 states by 1 Jan 2026); oag.ca.gov GPC; foster.com — Dec 2025
- WA AG, My Health My Data — atg.wa.gov; Goodwin — Mar 2024; EFF — Jul 2025
- OpenAI Europe privacy policy — openai.com — Aug 2026

**Caveats:** (1) Digital Omnibus final adoption should be re-verified at launch (political agreement only, per May–Jul 2026 reporting). (2) AI Act penalty tiers (€15M/3% for Art. 50) and Annex III contents are from regulation text knowledge, not fetched snippets — marked ⚠️. (3) No 2024-26 FDA warning letter *to an app* (vs. product marketers) was found for cosmetic claims — the app-side risk remains copy-contagion, not direct FDA exposure.
