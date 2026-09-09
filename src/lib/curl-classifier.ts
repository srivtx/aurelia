/* ============================================================
   AURELIA — Curl Pattern Classifier (Texture Lab engine)
   ------------------------------------------------------------
   Hair fiber curvature estimated in pure CV from a strand
   patch — no ML model, no network, explainable math:

     · orientation coherence — structure-tensor doubled-angle
       mean resultant length: straight hair = strand ridges
       run parallel → gradients share one direction; curls &
       coils curve in every direction → dispersion.
     · ridge frequency — zero-crossing rate of the detrended
       luma along scanlines (both axes, max): tight coils pack
       many strand ridges per pixel, straight hair packs few.
     · edge density — normalized Sobel energy (texture amount).

   Blended into a curl index 0–100 → the 10-class scale
   (1, 2A–C, 3A–C, 4A–C) of the L'Oréal/Andre-Walker lineage
   reviewed in Callender 2026 ("Classification of High Curl
   Pattern Hair: A Systematic Review", PMC). Documented in
   docs/RESEARCH-PAPERS.md §7.

   Charter: geometry measures TEXTURE, never "good hair";
   on-device only; honest guards instead of guesses.
   Pure + deterministic → SSR safe.
   ============================================================ */

import type { ZonePixels } from "./skin-journal";

/* ---------- types ---------- */

export type CurlPatternId = "1" | "2A" | "2B" | "2C" | "3A" | "3B" | "3C" | "4A" | "4B" | "4C";
export type CurlFamily = "straight" | "wavy" | "curly" | "coily";

export interface CurlMetrics {
  /** 0–1 · 1 = all gradients share one direction (parallel strands) */
  coherence: number;
  /** strand ridges per pixel (max of row/column scanline rates) */
  ridgeFreq: number;
  /** 0–1 · normalized mean Sobel magnitude */
  edgeDensity: number;
  /** 0–100 · the blended curl index */
  curlIndex: number;
}

export interface CurlClassification {
  pattern: CurlPatternId;
  family: CurlFamily;
  curlIndex: number;
  coherence: number;
  ridgeFreq: number;
  edgeDensity: number;
  confidence: number; // 0–1 · distance from the nearest class boundary
}

export interface CurlBuild {
  ok: boolean;
  result?: CurlClassification;
  error?: string;
  warning?: string;
}

/* ---------- calibration (documented, tuned against synthetic patches) ---------- */

const W_COHERENCE = 0.6;
const W_FREQ = 0.15;
const W_EDGE = 0.25;
const FREQ_REF = 0.3; // cycles/px ≈ 3.3 px wavelength — coil territory
const EDGE_REF = 300; // Sobel magnitude that saturates edge density

/** class boundaries on the curl index — upper edges, last = 100 */
const CLASS_STEPS: { id: CurlPatternId; upTo: number }[] = [
  { id: "1", upTo: 13 },
  { id: "2A", upTo: 24 },
  { id: "2B", upTo: 34 },
  { id: "2C", upTo: 45 },
  { id: "3A", upTo: 56 },
  { id: "3B", upTo: 65 },
  { id: "3C", upTo: 76 },
  { id: "4A", upTo: 84 },
  { id: "4B", upTo: 91 },
  { id: "4C", upTo: 100 },
];

const FAMILY_OF: Record<CurlPatternId, CurlFamily> = {
  "1": "straight",
  "2A": "wavy", "2B": "wavy", "2C": "wavy",
  "3A": "curly", "3B": "curly", "3C": "curly",
  "4A": "coily", "4B": "coily", "4C": "coily",
};

/* ---------- engine ---------- */

/** Sobel-lite gradient on the luma map (border-excluded) */
function gradients(luma: Float64Array, w: number, h: number) {
  const out: { gx: number; gy: number; mag: number }[] = [];
  if (w < 3 || h < 3) return out;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -luma[i - w - 1] + luma[i - w + 1] - 2 * luma[i - 1] + 2 * luma[i + 1] - luma[i + w - 1] + luma[i + w + 1];
      const gy =
        -luma[i - w - 1] - 2 * luma[i - w] - luma[i - w + 1] + luma[i + w - 1] + 2 * luma[i + w] + luma[i + w + 1];
      out.push({ gx, gy, mag: Math.hypot(gx, gy) });
    }
  }
  return out;
}

/**
 * Detrended + smoothed profile crossing rate (cycles per sample),
 * Schmitt-trigger with hysteresis so per-pixel noise never counts
 * as ridges. Returns { freq, std } — std feeds axis variance gating.
 */
function scanlineFreq(profile: Float64Array): { freq: number; std: number } {
  const n = profile.length;
  if (n < 8) return { freq: 0, std: 0 };

  /* light low-pass (win 5) — kills per-pixel shot noise */
  const sm = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - 2);
    const hi = Math.min(n - 1, i + 2);
    let s = 0;
    for (let k = lo; k <= hi; k++) s += profile[k];
    sm[i] = s / (hi - lo + 1);
  }

  const mean = sm.reduce((a, b) => a + b, 0) / n;
  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += (sm[i] - mean) ** 2;
  const std = Math.sqrt(varSum / n);

  /* Schmitt trigger: h relative to this profile's own scale */
  const h = Math.max(0.6, 0.18 * std);
  let cycles = 0;
  let armed = false; // armed after dipping below -h
  for (let i = 0; i < n; i++) {
    const v = sm[i] - mean;
    if (v <= -h) armed = true;
    else if (v >= h && armed) {
      cycles++;
      armed = false;
    }
  }
  return { freq: cycles / Math.max(1, n - 1), std };
}

/** metrics for one raw RGBA patch — the pure-CV texture math */
export function curlMetrics(px: ZonePixels): CurlMetrics {
  const { w, h, data } = px;
  const n = w * h;
  if (n === 0) return { coherence: 0, ridgeFreq: 0, edgeDensity: 0, curlIndex: 0 };

  /* luma map */
  const luma = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    luma[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  const grads = gradients(luma, w, h);

  /* --- orientation coherence (structure tensor, doubled angle,
         gradient-magnitude weighted — strong strand edges dominate,
         flat-pixel noise is ignored twice over) --- */
  let cs = 0, sn = 0, wSum = 0, magSum = 0;
  const gMin = 12; // ignore flat pixels — they carry no direction
  for (const g of grads) {
    magSum += g.mag;
    if (g.mag < gMin) continue;
    const th2 = 2 * Math.atan2(g.gy, g.gx);
    const wgt = g.mag * g.mag; // structure-tensor weight
    cs += wgt * Math.cos(th2);
    sn += wgt * Math.sin(th2);
    wSum += wgt;
  }
  const coherence = wSum > 0 ? Math.min(1, Math.hypot(cs, sn) / wSum) : 0;
  const edgeDensity = grads.length > 0 ? Math.min(1, magSum / grads.length / EDGE_REF) : 0;

  /* --- ridge frequency along scanlines (both axes) ---
         Variance gating: only profiles that actually oscillate count —
         a noise-only row of straight hair contributes zero. */
  const rowStats: { freq: number; std: number }[] = [];
  const colStats: { freq: number; std: number }[] = [];
  const rowVals = new Float64Array(w);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) rowVals[x] = luma[y * w + x];
    rowStats.push(scanlineFreq(rowVals));
  }
  const colVals = new Float64Array(h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) colVals[y] = luma[y * w + x];
    colStats.push(scanlineFreq(colVals));
  }
  const maxStd = Math.max(0, ...rowStats.map((s) => s.std), ...colStats.map((s) => s.std));
  const gate = 0.3 * maxStd;
  const axisFreq = (stats: { freq: number; std: number }[]): number => {
    const live = stats.filter((s) => s.std >= gate);
    if (live.length === 0) return 0;
    return live.reduce((a, s) => a + s.freq, 0) / live.length;
  };
  const rowFreq = axisFreq(rowStats);
  const colFreq = axisFreq(colStats);
  const ridgeFreq = Math.max(rowFreq, colFreq);

  /* --- blend into the curl index --- */
  const idx =
    W_COHERENCE * (1 - coherence) +
    W_FREQ * Math.min(1, ridgeFreq / FREQ_REF) +
    W_EDGE * edgeDensity;
  const curlIndex = Math.max(0, Math.min(100, idx * 100));

  return { coherence: round2(coherence), ridgeFreq: round3(ridgeFreq), edgeDensity: round2(edgeDensity), curlIndex: round1(curlIndex) };
}

/** map a curl index onto the 10-class scale + confidence */
export function classifyIndex(curlIndex: number): { pattern: CurlPatternId; confidence: number } {
  const idx = Math.max(0, Math.min(100, curlIndex));
  let lower = 0;
  for (let i = 0; i < CLASS_STEPS.length; i++) {
    const step = CLASS_STEPS[i];
    if (idx <= step.upTo || i === CLASS_STEPS.length - 1) {
      const width = step.upTo - lower;
      const pos = Math.min(1, Math.max(0, (idx - lower) / Math.max(1, width)));
      /* confidence peaks at class center, falls to 0.5 at boundaries */
      const confidence = Math.max(0.4, Math.min(0.95, 0.5 + Math.abs(pos - 0.5)));
      return { pattern: step.id, confidence: round2(confidence) };
    }
    lower = step.upTo;
  }
  return { pattern: "4C", confidence: 0.5 };
}

/** patch-level guard: is there usable hair texture at all? */
export function curlPatchUsable(px: ZonePixels): { ok: boolean; error?: string; warning?: string } {
  const { w, h, data } = px;
  const n = w * h;
  if (n < 64) return { ok: false, error: "That patch is too small to read strand texture — tap a section where hair fills the frame." };
  let lSum = 0;
  for (let i = 0; i < n; i++) {
    lSum += 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const mean = lSum / n;
  if (mean < 28) return { ok: false, error: "That patch is nearly black — shoot with more light or tap a lighter strand section." };
  if (mean > 235) return { ok: false, error: "That patch is blown out — move out of direct glare so the strands keep their edges." };
  const m = curlMetrics(px);
  if (m.edgeDensity < 0.03 && m.ridgeFreq < 0.02) {
    return { ok: false, error: "That patch reads flat — tap ON the hair strands, not the background or a smooth surface." };
  }
  return { ok: true };
}

/**
 * Classify from 1–3 tapped strand patches (metrics averaged —
 * patch agreement becomes a confidence discount).
 */
export function classifyCurlFromPatches(patches: ZonePixels[]): CurlBuild {
  const usable: ZonePixels[] = [];
  let skipped = 0;
  let lastError: string | undefined;
  for (const p of patches) {
    const g = curlPatchUsable(p);
    if (g.ok) usable.push(p);
    else {
      skipped++;
      lastError = g.error;
    }
  }
  if (usable.length === 0) {
    return { ok: false, error: lastError ?? "Tap on the hair strands so there's texture to measure." };
  }

  const ms = usable.map((p) => curlMetrics(p));
  const avg = (get: (m: CurlMetrics) => number) => ms.reduce((s, m) => s + get(m), 0) / ms.length;

  /* dispersion of the index across patches → honesty discount */
  const idxs = ms.map((m) => m.curlIndex);
  const meanIdx = avg((m) => m.curlIndex);
  const spread = Math.sqrt(idxs.reduce((s, v) => s + (v - meanIdx) ** 2, 0) / idxs.length);
  const agree = Math.max(0, 1 - spread / 18); // 18+ index points of disagreement → no bonus

  const { pattern, confidence } = classifyIndex(meanIdx);
  const result: CurlClassification = {
    pattern,
    family: FAMILY_OF[pattern],
    curlIndex: round1(meanIdx),
    coherence: round2(avg((m) => m.coherence)),
    ridgeFreq: round3(avg((m) => m.ridgeFreq)),
    edgeDensity: round2(avg((m) => m.edgeDensity)),
    confidence: round2(confidence * (0.75 + 0.25 * agree)),
  };

  const warning =
    skipped > 0
      ? `${skipped} of ${patches.length} patches were skipped — the reading comes from the rest.`
      : spread > 12
        ? "Your patches disagreed quite a bit — hair texture varies by section; measure the zone you actually style."
        : undefined;

  return { ok: true, result, warning };
}

/* ---------- helpers ---------- */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** family labels + copy for the result dial */
export const CURL_FAMILY_META: Record<CurlFamily, { label: string; note: string }> = {
  straight: { label: "Straight", note: "Strands lie parallel — reflectivity is your superpower." },
  wavy: { label: "Wavy", note: "S-curves that fall loose — definition without trying." },
  curly: { label: "Curly", note: "Springs and spirals — volume with a mind of its own." },
  coily: { label: "Coily", note: "Tight zigzags and helices — the most fragile, most versatile texture." },
};

/** protocol copy — the measurement is only honest if the photo is */
export const CURL_PROTOCOL =
  "Photograph a small section of dry, product-free hair filling the frame, backlit-free, against a contrasting background. What we measure is the strand geometry — texture, never 'good hair'.";

export const CURL_DISCLAIMER =
  "Texture Lab reads strand geometry from your photo — a guide to care and styling, not a rulebook. Hair varies by section, season and day; re-measure anytime.";
