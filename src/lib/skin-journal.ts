/* ============================================================
   AURELIA — Skin Journal engine (closed-loop retention core)
   ------------------------------------------------------------
   MEASURE → ADVISE → RE-MEASURE → ADAPT, honest version:
     · weekly selfie → tapped zone patches → objective
       per-zone metrics, all pure CV:
         - redness    = CIELAB a*   (dermatology proxy)
         - brightness = L*
         - evenness   = mean ΔE76 of pixels to the zone mean
         - texture    = edge energy (Sobel gradient, relative)
     · trends across entries: % change, slope per week,
       milestones wired to her tagged actives
   Paper lineage (docs/RESEARCH-PAPERS.md §4):
     Quattrini 2022 (acne DL classification), Traini 2025
     (AI acne grading), Yoon 2023 (wrinkle/pore segmentation)
     — they use learned models; today we ship the explainable
     pure-CV proxies those papers' inputs reduce to, phase 2
     can add a lazy ONNX classifier behind the same Entry type.
   White-point (von-Kries, Cugmas 2020) calibrated like every
   Aurelia measurement. Pure + deterministic → SSR safe.
   Charter: TRENDS AND CHANGE, never diagnosis, never a
   "beauty score".
   ============================================================ */

import { deltaE76, rgbToXyz, xyzToLab, type Lab } from "./color-science";
import {
  correctToReference,
  plausibleSkinLab,
  usableReference,
  type PatchSample,
} from "./skin-signature";

/* ---------- types ---------- */

export type JournalZone = "cheekL" | "cheekR" | "forehead" | "chin";

export const JOURNAL_ZONES: JournalZone[] = ["cheekL", "cheekR", "forehead", "chin"];

export const ZONE_LABELS: Record<JournalZone, string> = {
  cheekL: "left cheek",
  cheekR: "right cheek",
  forehead: "forehead",
  chin: "chin",
};

/** raw RGBA patch straight from getImageData — engine does the math */
export interface ZonePixels {
  w: number;
  h: number;
  data: Uint8ClampedArray | number[]; // RGBA, length w*h*4
}

export interface ZoneMetrics {
  L: number; // brightness
  a: number; // redness axis
  b: number;
  evenness: number; // mean ΔE76 to zone mean — LOWER = more even
  texture: number; // mean Sobel gradient magnitude (relative index)
}

export interface JournalEntry {
  id: string;
  date: string; // local YYYY-MM-DD
  calibrated: boolean;
  zones: Partial<Record<JournalZone, ZoneMetrics>>;
  actives: string[]; // ids of actives she's been using (from src/data/actives)
  note?: string;
}

export interface MetricTrend {
  zone: JournalZone;
  metric: "redness" | "evenness" | "texture" | "brightness";
  first: number;
  latest: number;
  changePct: number; // + = value increased
  slopePerWeek: number; // regression slope × 7 days
  direction: "down" | "up" | "flat";
  improving: boolean; // per metric semantics (redness↓, evenness↓, texture↓, brightness↑ = improving)
}

export interface JournalSummary {
  entries: number;
  firstDate: string | null;
  latestDate: string | null;
  weeks: number;
  trends: MetricTrend[]; // zones × metrics that exist in ≥2 entries
  milestones: string[]; // human sentences
  bestStreakZone: { zone: JournalZone; text: string } | null;
}

/** UI disclaimer — the charter, verbatim */
export const JOURNAL_DISCLAIMER =
  "Skin Journal measures trends and change — it is not a medical diagnosis and never grades your face. For anything persistent or painful, see a dermatologist.";

/* ---------- zone math ---------- */

/**
 * Per-pixel: white-correct (von-Kries) → Lab. Zone stats:
 * mean Lab, evenness (mean ΔE76 to the mean, in-zone), texture
 * (mean Sobel magnitude on luma, border excluded).
 */
export function computeZoneMetrics(px: ZonePixels, ref: PatchSample): ZoneMetrics {
  const { w, h, data } = px;
  const n = w * h;
  if (n === 0) return { L: 0, a: 0, b: 0, evenness: 0, texture: 0 };

  /* luma map (uncorrected — gradient is lighting-normal enough) */
  const luma = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    luma[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  /* texture: Sobel-lite (Scharr-ish kernels), skip 1px border */
  let gradSum = 0;
  let gradCount = 0;
  if (w > 2 && h > 2) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const gx =
          -luma[i - w - 1] + luma[i - w + 1] - 2 * luma[i - 1] + 2 * luma[i + 1] - luma[i + w - 1] + luma[i + w + 1];
        const gy =
          -luma[i - w - 1] - 2 * luma[i - w] - luma[i - w + 1] + luma[i + w - 1] + 2 * luma[i + w] + luma[i + w + 1];
        gradSum += Math.hypot(gx, gy);
        gradCount++;
      }
    }
  }
  const texture = gradCount ? gradSum / gradCount : 0;

  /* Lab stats on white-corrected pixels */
  const labs: Lab[] = new Array(n);
  let sL = 0, sa = 0, sb = 0;
  for (let i = 0; i < n; i++) {
    const corrected = correctToReference(
      { r: data[i * 4], g: data[i * 4 + 1], b: data[i * 4 + 2] },
      ref,
    );
    const lab = xyzToLab(rgbToXyz(corrected));
    labs[i] = lab;
    sL += lab.L;
    sa += lab.a;
    sb += lab.b;
  }
  const meanLab: Lab = { L: sL / n, a: sa / n, b: sb / n };

  let evSum = 0;
  for (let i = 0; i < n; i++) evSum += deltaE76(labs[i], meanLab);
  const evenness = evSum / n;

  return {
    L: round2(meanLab.L),
    a: round2(meanLab.a),
    b: round2(meanLab.b),
    evenness: round2(evenness),
    texture: round2(texture),
  };
}

export interface EntryBuild {
  ok: boolean;
  entry?: JournalEntry;
  warnings: string[];
  error?: string;
}

/**
 * Build a journal entry from a calibrated selfie.
 * @param ref    white reference patch sample
 * @param zones  tapped zone patches (at least 2 zones)
 */
export function buildJournalEntry(
  ref: PatchSample,
  zones: Partial<Record<JournalZone, ZonePixels>>,
  actives: string[] = [],
  note?: string,
  date?: string, // YYYY-MM-DD (tests inject fixed dates)
): EntryBuild {
  const warnings: string[] = [];
  if (!usableReference(ref)) {
    return {
      ok: false,
      warnings,
      error: "That white reference looks off — keep a tissue in frame, shoot in even daylight, and retake.",
    };
  }

  const measured: Partial<Record<JournalZone, ZoneMetrics>> = {};
  let skipped = 0;
  for (const zone of JOURNAL_ZONES) {
    const px = zones[zone];
    if (!px) continue;
    const m = computeZoneMetrics(px, ref);
    if (!plausibleSkinLab({ L: m.L, a: m.a, b: m.b })) {
      skipped++;
      continue;
    }
    measured[zone] = m;
  }

  const have = Object.keys(measured) as JournalZone[];
  if (have.length === 0) {
    return {
      ok: false,
      warnings,
      error: "None of the patches read as skin — tap cheeks, forehead and chin, away from hair, shadows and jewelry.",
    };
  }
  if (have.length < 2) {
    return {
      ok: false,
      warnings,
      error: "Tap at least two zones (both cheeks, forehead or chin) so trends have something to compare.",
    };
  }
  if (skipped > 0) warnings.push("One patch didn't read as skin and was skipped.");

  const entry: JournalEntry = {
    id: `je-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    date: date ?? localToday(),
    calibrated: true,
    zones: measured,
    actives,
    note: note?.trim() || undefined,
  };
  return { ok: true, entry, warnings };
}

/* ---------- trends ---------- */

const METRICS: { key: MetricTrend["metric"]; get: (m: ZoneMetrics) => number; lowerIsBetter: boolean }[] = [
  { key: "redness", get: (m) => m.a, lowerIsBetter: true },
  { key: "evenness", get: (m) => m.evenness, lowerIsBetter: true },
  { key: "texture", get: (m) => m.texture, lowerIsBetter: true },
  { key: "brightness", get: (m) => m.L, lowerIsBetter: false },
];

function dayIndex(date: string, base: string): number {
  const [y1, m1, d1] = base.split("-").map(Number);
  const [y2, m2, d2] = date.split("-").map(Number);
  return (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000;
}

function pctChange(first: number, latest: number): number {
  if (Math.abs(first) < 1e-6) return latest > first ? 100 : latest < first ? -100 : 0;
  return Math.max(-100, Math.min(100, ((latest - first) / Math.abs(first)) * 100));
}

/** least-squares slope per day → per week */
function slopePerWeek(days: number[], values: number[]): number {
  const n = days.length;
  if (n < 2) return 0;
  const mx = days.reduce((s, v) => s + v, 0) / n;
  const my = values.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (days[i] - mx) * (values[i] - my);
    den += (days[i] - mx) ** 2;
  }
  return den < 1e-9 ? 0 : (num / den) * 7;
}

export function journalTrends(entries: JournalEntry[]): JournalSummary {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (sorted.length === 0) {
    return { entries: 0, firstDate: null, latestDate: null, weeks: 0, trends: [], milestones: [], bestStreakZone: null };
  }
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const weeks = Math.max(0, dayIndex(latest.date, first.date) / 7);

  const trends: MetricTrend[] = [];
  for (const zone of JOURNAL_ZONES) {
    const pts = sorted.filter((e) => e.zones[zone]);
    if (pts.length < 2) continue;
    const days = pts.map((e) => dayIndex(e.date, first.date));
    for (const { key, get, lowerIsBetter } of METRICS) {
      const values = pts.map((e) => get(e.zones[zone]!));
      const firstV = values[0];
      const latestV = values[values.length - 1];
      const change = pctChange(firstV, latestV);
      const slope = slopePerWeek(days, values);
      /* flat when |slope| small relative to the value scale */
      const flat = Math.abs(change) < 4;
      const direction = flat ? "flat" : latestV < firstV ? "down" : "up";
      trends.push({
        zone,
        metric: key,
        first: round2(firstV),
        latest: round2(latestV),
        changePct: round1(change),
        slopePerWeek: round2(slope),
        direction,
        improving: flat ? false : lowerIsBetter ? latestV < firstV : latestV > firstV,
      });
    }
  }

  return {
    entries: sorted.length,
    firstDate: first.date,
    latestDate: latest.date,
    weeks: round1(weeks),
    trends,
    milestones: milestonesFor(sorted, trends),
    bestStreakZone: bestZone(sorted, trends),
  };
}

/* ---------- milestone copy (the closed loop speaking) ---------- */

function activeNames(entries: JournalEntry[]): string | null {
  const set = new Set<string>();
  for (const e of entries) for (const a of e.actives) set.add(a);
  if (set.size === 0) return null;
  return [...set].slice(0, 3).join(", ");
}

function milestonesFor(sorted: JournalEntry[], trends: MetricTrend[]): string[] {
  const out: string[] = [];
  if (sorted.length < 3) return out;
  const actives = activeNames(sorted);
  const activesBit = actives ? ` while using ${actives}` : "";

  /* cheeks are the headline zone: mean redness change */
  const cheekT = trends.filter((t) => t.zone === "cheekL" || t.zone === "cheekR");
  const red = cheekT.filter((t) => t.metric === "redness" && t.changePct <= -10);
  if (red.length > 0) {
    const avg = Math.round(Math.abs(red.reduce((s, t) => s + t.changePct, 0) / red.length));
    out.push(`Cheek redness is down ${avg}% since your first entry${activesBit} — the calmest your cheeks have measured.`);
  }
  const redUp = cheekT.filter((t) => t.metric === "redness" && t.changePct >= 15);
  if (redUp.length > 0 && out.length === 0) {
    out.push("Cheek redness is trending up across entries — worth watching (not diagnosing): sun, actives purging or a new product are the usual suspects.");
  }

  const ev = trends.filter((t) => t.metric === "evenness" && t.changePct <= -10);
  if (ev.length > 0) {
    const t = ev[0];
    out.push(`${cap(ZONE_LABELS[t.zone])} tone is ${Math.abs(Math.round(t.changePct))}% more even than when you started.`);
  }
  const tx = trends.filter((t) => t.metric === "texture" && t.changePct <= -15);
  if (tx.length > 0) {
    const t = tx[0];
    out.push(`${cap(ZONE_LABELS[t.zone])} texture reads smoother — ${Math.abs(Math.round(t.changePct))}% less edge energy under the same light.`);
  }
  return out.slice(0, 4);
}

function bestZone(
  sorted: JournalEntry[],
  trends: MetricTrend[],
): { zone: JournalZone; text: string } | null {
  if (sorted.length < 2) return null;
  const picks = trends.filter((t) => t.improving && t.metric !== "brightness").sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  if (picks.length === 0) return null;
  const t = picks[0];
  const dir = t.metric === "redness" ? "redness" : t.metric === "evenness" ? "unevenness" : "texture";
  const verb = t.metric === "texture" ? "smoothing out" : `losing ${dir}`;
  return { zone: t.zone, text: `Your ${ZONE_LABELS[t.zone]} is the zone ${verb} fastest — ${Math.abs(Math.round(t.changePct))}% since day one.` };
}

/* ---------- helpers ---------- */

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
