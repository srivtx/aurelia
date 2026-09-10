# RESEARCH-NEXT-TECH — The Next Deep-Tech Layer for Aurelia

> **Part of Aurelia** · [README](../README.md) · [Docs index in README](../README.md#docs) · [Extended README](./README-EXTENDED.md) · [CONTEXT](./CONTEXT.md) · [DEPLOYMENT](./DEPLOYMENT.md)


**Project:** Aurelia (beauty/style PWA, Next.js 16 App Router, TS, Tailwind v4)
**Compiled:** 2026-09-09 · **Methodology:** live web research (11 targeted searches + primary-source fetches: developer.chrome.com Prompt API page (updated 2026-08-26), Google AI Edge MediaPipe FaceLandmarker guide, W3C CSS Color 4 (Sept 2026), webmachinelearning/WebNN materials, sqlite.org OPFS docs). Items that could not be verified live are marked ⚠️ *internal knowledge — verify before relying*.
**Predecessor:** [`RESEARCH-DEEPTECH.md`](./RESEARCH-DEEPTECH.md) (WebMCP ✅ shipped, provider cascade ✅ shipped, share-target ✅ shipped, PWA APIs ✅). This doc covers the **next** layer only — nothing below duplicates it.

---

## Executive Summary — the 10 coolest verified directions, ranked

| # | Idea | Core tech (2026 status) | Impact | Feasibility | Effort |
|---|------|--------------------------|--------|-------------|--------|
| 1 | **Live AR Mirror** — try palette/season lip & cheek colors on your own face, live | MediaPipe FaceLandmarker in-browser (478 3D landmarks, 52 blendshapes — ✅ verified) | 10 | 7 | 3–5 d |
| 2 | **Offline Aurelia** — full private stylist with zero network on Chromium | Chrome built-in AI Prompt API (✅ shipped Chrome 138; sampling origin trial Chrome 148) | 8 | 7 | 2–3 d |
| 3 | **Ingredient Label Scanner** — photograph a product, auto-check conflicts against her routine | tesseract.js (✅ browser OCR, mature) + existing conflict matrix | 9 | 8 | 2–3 d |
| 4 | **Auto Face-Shape from selfie** — real CV geometry feeding the existing Face Meter | FaceLandmarker ratios (length/cheekbone/jaw taper — the exact metrics already coded) | 8 | 9 | 1–2 d |
| 5 | **WebGPU Color Lab** — GPU-computed ΔE2000 heatmaps, OKLCh harmony generator, P3 output | WebGPU (universal) + CSS Color 4 OKLCh gamut mapping (✅ W3C Sept 2026) | 7 | 8 | 3–4 d |
| 6 | **Bandit personalization** — tips that learn what she actually engages with | Thompson sampling (Beta priors) — pure TS, no deps | 6 | 10 | 1 d |
| 7 | **Spaced-repetition habits** — SM-2 scheduling for routine adherence | classic algorithm — pure TS, no deps | 6 | 10 | 1 d |
| 8 | **On-device VLM outfit coach** — photo → style tags, offline | transformers.js + WebGPU (✅ 10M downloads, ONNX Runtime; SmolVLM-2B verified browser-runnable) | 7 | 5 | 4–6 d |
| 9 | **OPFS data spine** — sqlite-wasm local-first store for Passport + vector index | SQLite WASM/OPFS SyncAccessHandle (✅ official builds; Zeta-Lite paper Sept 2026) | 5 | 8 | 2–3 d |
| 10 | **Voice stylist** — speak to Aurelia, hear answers hands-free | Web Speech API (Chromium recognizers; ⚠️ Chrome desktop recognizer is cloud-assisted — privacy caveat) | 5 | 8 | 1–2 d |

**Deliberately rejected after research:** WebNN (Chromium-only, CPU backend behind flags, no Firefox/Safari in 2026 — build on it only via transformers.js's future backend, never directly); federated learning (no cross-user data by design); emotion/gaze analysis (against the body-positive charter).

---

## §1 Offline Aurelia — Chrome built-in AI (Prompt API)

**Verified live (developer.chrome.com/docs/ai/prompt-api, updated 2026-08-26):**
- Prompt API shipped in **Chrome 138** (Intent). An **origin trial for `samplingMode`** presets runs from **Chrome 148**. On the open web, `temperature`/`topK` are NOT available by default (only `samplingMode` presets via trial; extensions keep legacy params).
- Entry point: `LanguageModel`, with `await LanguageModel.availability()` → `"unavailable" | "downloadable" | "downloading" | "available"` — the doc stresses passing **the same options** to `availability()` and `prompt()`/`promptStreaming()`.
- Streaming: `session.promptStreaming()` returns a `ReadableStream` of text chunks — maps 1:1 onto Aurelia's existing NDJSON chat renderer.
- **The model is Gemini Nano, downloaded on-device**; prompts never leave the machine. Chrome exposes an EPP ("Early Preview Program") and a first-party **polyfill** for other browsers (routes to a cloud model — off by default for us).
- **Politics:** Mozilla formally opposed shipping it (Apr 2026, ✅ search-verified). So: treat as **progressive enhancement**, never a dependency. Feature-detect, degrade gracefully to the server cascade that already exists.

**Why this is research-grade for Aurelia:** the app already has (a) a grounded system prompt + RAG block (server-side today), and (b) a streaming chat UI. Moving the *first hop* of the cascade on-device gives: offline in installed PWA, zero marginal cost, zero privacy exposure of the question text. The full architecture is a **3-tier cascade**:

```
[1] LanguageModel (Gemini Nano)     — offline, free, Chromium-only
[2] resolveProvider() external      — Groq/Gemini/etc (current default)
[3] built-in z-ai model             — always-on floor (already silent-fallback)
```

Tier promotion happens **client-side**: if `LanguageModel.availability() === "available"`, the chat calls a local completion path instead of `/api/stylist` (or `/api/stylist` gains a `prefer: "on-device"` hint that just tells the client to try locally first — better: keep routing decisions client-agnostic and do the detection in the chat component).

**Implementation sketch (client, ~120 lines):**

```ts
async function nanoReply(system: string, messages: UIMessage[]): Promise<string> {
  const avail = await LanguageModel.availability({ systemPrompt: system });
  if (avail !== "available") throw new Error("nano-unavailable");
  const session = await LanguageModel.create({ systemPrompt: system, monitor(m) {
    m.addEventListener("downloadprogress", (e) => setProgress(e.loaded / e.total));
  }});
  let out = "";
  for (const m of messages) out += await session.prompt(m.content); // or promptStreaming
  return out;
}
```

Fallback ladder in `send()`: try `nanoReply` → on any failure, hit `/api/stylist` as today. The user sees one extra status line: "Answering on-device ✦" vs nothing — no provider names, consistent with the server-side-only routing policy.

**Also from the built-in AI family (same availability pattern):** `Summarizer` (condense a saved look's steps into a 3-line card — nice, low value), `Translator` (localize tips — out of scope now), `Proofreader` (skip). Only Prompt API matters today.

---

## §2 Live AR Mirror — MediaPipe FaceLandmarker try-on

**Verified live (Google AI Edge docs, developers.google.com/edge/mediapipe/solutions/vision/face_landmarker):**
- **Face Landmarker = 478 3D landmarks** (468 face-mesh + 10 iris), built on the lightweight **BlazeFace short-range** detector; optional **52 blendshape scores** and a **facial transformation matrix** (canonical-model transform for effects).
- Web delivery via `@mediapipe/tasks-vision` (wasm + tflite from CDN, lazy-loadable — ~3–5 MB on first AR use, cacheable in the SW's runtime cache).
- Real-time on mid-tier mobile (the task is explicitly engineered for mobile; video mode `detectForVideo()` at 30 fps is the standard path).

**Competitive landscape (✅ search-verified):** Maybelline, L'Oréal Paris and NYX all ship virtual try-on — built on **vendor AR SDKs** (ModiFace/Revieve-class, closed, heavy, e-commerce-oriented). A free no-signup browser try-on exists (makeupcheckai.com). **Nobody** connects try-on to a **12-season color-science engine**: the pitch "these are YOUR True Spring lip colors — see them on your face" is the differentiated product, not the AR itself.

**How to build the lipstick (hardest-then-easy) part without any 3D engine:**
1. `FaceLandmarker` in VIDEO mode, `numFaces: 1`, `outputFaceBlendshapes: false`.
2. Lip region = the documented `lips` landmark group (outer + inner lips). Build a closed path from the **outer-lip convex hull** each frame.
3. Draw to an overlay canvas: `ctx.globalCompositeOperation = "multiply"` (keeps lip texture/shading), fill with the product color, then a soft inner-lip erase at low alpha for a natural edge. Blush = cheek landmark cluster hull at ~15% alpha with `multiply`; eyeshadow = eyelid landmark hull.
4. Color source: **the palette engine's swatches** (hex → `fillStyle`), so AR is literally driven by the color-science layer — season-filtered shades only, if she has a season result.
5. Snapshot button → composite video frame + overlay → save into Saved (existing heart/save flow) + Web-Share card (existing share lib).

**Performance guardrails:** run detection in a rAF loop only while the mirror sheet is open; `OffscreenCanvas` for compositing if available; auto-fallback to "photo mode" (single `ImageEmbedder`-free `detect()` pass on a captured selfie) if fps < 15 on device tier (see §10 CPU Performance API).

**Bonus — auto face-shape (idea #4, same dependency):** the existing Face Meter computes length/cheekbone/forehead/jaw-taper ratios from **manual sliders**. With one `detect()` call on a selfie we get 478 real 3D points → compute the same ratios from anatomy → prefill the sliders → classify. That is a genuine CV upgrade of a shipped feature at ~zero extra dependency cost (same wasm as the mirror).

---

## §3 Ingredient Label Scanner — OCR × conflict matrix

**Verified:** tesseract.js is a mature pure-JS OCR (100+ languages, wasm, worker-based; browser + Node). Precedent pattern (recipe-scanning web apps ingesting printed ingredient lists) works; 2026 tutorials still treat it as the default browser OCR.

**The user problem nobody in the beauty-app space solves offline:** "I'm holding a new serum in the store — can I use it with my retinol night routine?" Aurelia already owns the answer engine (ingredient dictionary + conflict/synergy matrix + routine sequencer). The only missing input is the printed INCI list.

**Pipeline (all on-device):**
1. Camera capture (existing pattern from Photo Analyzer) or picked image.
2. Preprocess: grayscale + contrast stretch (canvas, ~15 lines — the known OCR quality lever for glossy labels).
3. `Tesseract.recognize(image, "eng")` in a worker → text.
4. **INCI parser**: tokenize on commas/newlines, normalize case, strip percentages and parenthetical INCI aliases → candidate ingredient names.
5. Fuzzy-match against `data/actives.ts` + ingredient dictionary (Levenshtein ≤ 2 handles OCR wobble on short tokens; exact-match first).
6. Render with the existing Ingredient Lab cards: green (in her routine ✓), red (conflicts with her actives — "retinol × glycolic: alternate nights"), amber (not recognized — offer manual search).
7. Everything cached per product in Saved; barcode optional add-on via `BarcodeDetector` (Chromium-only, feature-detected) purely as an ID tag — no online product DB dependency (keeps it offline and zero-liability).

**Cost:** tesseract wasm ~2–3 MB, lazy-loaded only when the scanner opens; models (~10 MB eng) fetched once, cached in OPFS/SW runtime cache.

---

## §4 On-device embeddings & VLM — transformers.js

**Verified (2026 sources):** transformers.js passed **10M downloads**, runs ONNX-Runtime-Web models client-side, **WebGPU-accelerated**; browsers now run LLMs up to ~8B params locally; Web-LLM is the shader-native alternative (faster for its supported set). **SmolVLM-2B** is documented running in-browser with a chat UI (Oct 2025 walkthrough; arXiv paper — 2B-class VLM designed for edge inference).

**Two distinct plays — do NOT conflate them:**

**(a) Embeddings for offline semantic search (high feasibility).** `feature-extraction` with a MiniLM-class model (~23 MB int8 ONNX, wasm-only is fine): embed the knowledge base chunks **at build time** (Node script → `src/data/kb-index.json`), embed the query at runtime, cosine top-k. That upgrades the existing keyword search sheet to semantic ("something for redness after gym" → niacinamide card) with zero server. Feed the same top-k into the offline system prompt → **full offline RAG** when combined with §1.

**(b) VLM outfit coach (experimental, desktop-first).** SmolVLM-256M/500M (int8, ~300–500 MB class — heavy) or Qwen2-VL-2B via WebGPU: photo → "ivory knit, camel wool coat, gold jewelry, soft-neutral vibe" tags → feed the outfit scorer's vibe + color extractors. Genuinely frontier, but the model weight cost makes it a **desktop Chromium, user-opt-in "Lab" feature** behind a device-tier + storage check. Ship after (a) proves the pipeline.

**Guardrail:** all transformers.js features must be lazily imported (`await import("@huggingface/transformers")` inside the feature's open handler) so the base bundle never grows; models cache in OPFS via the standard `env.backends.onnx.wasm.proxy` + custom cache path.

---

## §5 WebGPU Color Lab — compute shaders, OKLCh, P3

**Verified:** WebGPU is universal on current Chromium/Safari/Firefox channels; **CSS Color 4 (W3C, Sept 2026) specifies OKLCh as the gamut-mapping color space** for CSS (the spec's own example maps `color(display-p3 1 1 0)` through OKLCh into sRGB); colorjs.io ships a live gamut-mapping playground implementing exactly this algorithm; `color(display-p3 …)` is universally parseable now.

**Three concrete upgrades:**

1. **ΔE2000 heatmap on GPU (compute shader).** Today's Color Lab does pairwise ΔE on CPU for one pair. A compute shader does the **full 19×19 color × 19×19 palette distance matrix in one dispatch** → live heatmap as she drags a swatch. WGSL is ~60 lines (kernel = CIEDE2000 in linear color). Fallback: WASM (CPU) — same math, already proven in the k-means path.
2. **Harmony generator in OKLCh with spec gamut mapping.** Rotating hue by harmony angle (complementary 180°, triad 120°, split 61°/63°…) in **OKLCh**, then mapping out-of-gamut results with the CSS Color 4 algorithm → perceptually uniform harmonies (no HSL mud). This becomes the engine behind a "Generate my palette" card: seed = her season's anchor hue + chroma.
3. **P3 display awareness.** `matchMedia("(color-gamut: p3)")` → swatches render `color(display-p3 r g b)` when the device can show it (verifiable at runtime by canvas round-trip test). Luxury screens get visibly richer berries/greens; sRGB screens unchanged. Low effort, high polish-per-line.

---

## §6 Bandit personalization (Thompson sampling)

No web verification needed — textbook algorithm (Thompson 1933; contextual bandits in production at every recommender). ⚠️ *internal knowledge — the math is standard.*

The daily tip currently rotates by date. A **Beta(α, β) posterior per tip-category** (colors/makeup/skin/hair) turns opens+saves into a multi-armed bandit, fully private (localStorage):

```ts
// on tip card open:  α[cat] += 1
// on tip save:        β[cat] += 0.2   // save ≈ weak negative? no — save = strong positive:
// better: α = opens, β = impressions-minus-opens → sample θ_c ~ Beta(α_c+1, β_c+1)
// each day: pick category = argmax θ, then pick the least-recently-shown tip in it.
```

~40 lines, no dependencies, and the app can *show the learning* ("You open skin tips 3× more — want skin daily?"), which fits the explainability charter. Cold start = uniform priors = current behavior.

## §7 Spaced-repetition habits (SM-2)

Same class: classic, pure TS. The streak currently counts consecutive days; SM-2 schedules **reviews** — here, "re-introduce the routine checklist at expanding intervals" (day 1, 2, 4, 7, 15, 30) with per-step easiness so a girl who has nailed cleansing AM/PM stops being nagged about it and the shaky step (SPF, always SPF) resurfaces most. Stores one 6-number record per step. This is habit science, not gamification — a real pedagogy differentiator, invisible to competitors.

---

## §8 Voice stylist (Web Speech)

**Verified (search):** Web Speech `SpeechRecognition` remains the browser-native path; 2026 voice-first PWA projects still build on it (auto-restart pattern, interim results). **Privacy caveat ⚠️ (verify per platform):** Chrome's desktop recognizer is historically cloud-assisted; Android Chrome can be on-device; Safari/iOS ships `webkitSpeechRecognition` with its own cloud path. Because Aurelia's privacy promise is strict, voice input must be **opt-in with a visible "uses browser speech service" label**, not a default. `speechSynthesis` (100% local, universal) is the safer half: read the routine steps aloud while her hands are busy — that's a genuine hands-free skincare moment.

## §9 OPFS data spine (sqlite-wasm)

**Verified:** official SQLite WASM builds persist via **OPFS SyncAccessHandle VFS** in a worker; 2026 guides + sqlite.org docs confirm it's the recommended browser storage for real databases; a Sept 2026 arXiv paper (Zeta-Lite) treats the browser as a first-class DB host. Aurelia today: localStorage (Passport, store) — fine at current size, but the coming artifacts (offline KB index, OCR product cache, model caches, embeddings) want a real file layer. Plan: `sqlite-wasm` behind a lazy `lib/localdb.ts` with a `kv` + `vectors` table; migrate the Passport verbatim; keep localStorage as mirror during a 2-release transition. BroadcastChannel syncs tabs.

## §10 Platform candies (verified 2026)

- **Web Install API** `navigator.install()` + declarative `<install>` element (Edge 145 / Chrome ~145+, per Feb 2026 release notes + Dec 2025 chromestatus) — a shared palette card page can install Aurelia itself. One-line deep-link upgrade to the existing share cards.
- **CPU Performance API** (Chrome, Aug 2026 enterprise notes) — device-tier gating for §2/§4 heavy features (auto photo-mode on low tier). `navigator.hardwareConcurrency` stays the portable fallback.
- **Cross-document View Transitions** (already researched in DEEPTECH §3.5) — now worth wiring for hash-route deep opens.

---

## Build order recommendation

1. **Week 1 — pure-math layer (no deps, no risk):** §6 bandit tips + §7 SM-2 habits + §10 `<install>` on share pages. All offline, all explainable.
2. **Week 2 — scanner:** §3 OCR ingredient scanner (tesseract.js lazy) — highest "wow-per-effort", fully on-device, feeds existing engines.
3. **Week 3 — mirror:** §2 FaceLandmarker AR lip/blush try-on + auto face-shape prefill — the flagship demo moment; gate behind device check.
4. **Week 4 — offline stylist:** §1 Prompt API tier in the cascade + §4(a) build-time embeddings for offline semantic search/RAG.
5. **Later:** §5 WebGPU Color Lab, §4(b) VLM Lab (opt-in), §9 OPFS migration, §8 voice.

Every step preserves the two non-negotiables: **on-device by default** and **operator-side AI routing invisible to users**.

---

## Sources (live-fetched or search-verified 2026-09-09)

- developer.chrome.com/docs/ai/prompt-api — Prompt API (published 2025-05-20, **updated 2026-08-26**; Chrome 138 ship, Chrome 148 sampling origin trial, `LanguageModel.availability`, `promptStreaming`)
- developers.google.com/edge/mediapipe/solutions/vision/face_landmarker — Face Landmarker guide (478 landmarks, blendshapes, BlazeFace, facial transformation matrices)
- W3C CSS Color Module Level 4 (Sept 1, 2026 snapshot) — OKLCh gamut mapping; apps.colorjs.io Gamut Mapping Playground
- huggingface.co/docs/transformers.js + community write-ups (10M downloads, WebGPU; "Run an LLM in Your Browser", June 2026); pyimagesearch.com SmolVLM-in-browser walkthrough (Oct 2025); arXiv 2504.05299 SmolVLM
- github.com/naptha/tesseract.js + 2026 OCR web-app tutorials (dynamsoft)
- W3C WebNN (Sept 2026) + chromestatus WebNN + webmachinelearning/webnn-samples (CPU-backend/flag status; Firefox/Safari absent)
- sqlite.org OPFS persistence docs; powersync.com "State of SQLite on the Web" (Nov 2025); didof.dev OPFS guide (Mar 2026); arXiv Zeta-Lite (Sept 2026)
- Microsoft Edge 145/153 web platform release notes (Web Install API, `<install>` element); Chrome Enterprise release notes Aug 2026 (CPU Performance API)
- Web Speech API project write-ups 2026; Mozilla opposition coverage (Apr 2026) re: Prompt API standardization
- Competitor AR try-on surfaces: maybelline.com, lorealparisusa.com, nyxcosmetics.com, makeupcheckai.com, arbelle.ai (all ✅ search-verified as existing; none season-science-coupled)
