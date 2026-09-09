/* ============================================================
   AURELIA — Outfit Combination Engine
   ------------------------------------------------------------
   Scores 2-4 colors as a potential outfit using real color
   metrics: CIELCh hue geometry, lightness spread (value
   contrast), chroma coherence, warmth coherence, neutral
   anchoring, and — when the user has a season result —
   ΔE2000 proximity to their personal palette.
   Pure + deterministic → SSR safe.
   ============================================================ */

import {
  hexToLab,
  labToHcl,
  contrastRatio,
  classifyHuePair,
  warmthScore,
  type Hcl,
  type HueRelation,
} from "./color-science";
import { rateColorForSeason, type Season } from "@/data/seasons";
import { wardrobeColors, type WardrobeColor } from "@/data/colors";

export type FactorStatus = "good" | "ok" | "warn";

export interface OutfitFactor {
  label: string;
  status: FactorStatus;
  note: string;
}

export interface SeasonFitItem {
  hex: string;
  score: number;
  verdict: "excellent" | "good" | "risky" | "avoid";
}

export interface OutfitAnalysis {
  score: number; // 0-100
  verdict: string;
  headline: string;
  factors: OutfitFactor[];
  relation: HueRelation;
  relationLabel: string;
  contrast: { level: "low" | "medium" | "high"; ratio: number; spread: number };
  roles: { base: string; secondary: string; accent: string | null };
  warmthBalance: "coherent-warm" | "coherent-cool" | "mixed";
  seasonFit?: { overall: number; items: SeasonFitItem[] };
}

/* ---------- outfit diagnosis ---------- */

export interface ItemDiagnosis {
  hex: string;
  name: string;
  contribution: number; // score points this item adds (leave-one-out)
  status: "load-bearing" | "neutral" | "weakening";
}

export interface OutfitDiagnosis {
  items: ItemDiagnosis[];
  weakest: ItemDiagnosis | null;
  swap: { hex: string; name: string; predictedScore: number; gain: number } | null;
}

const nameForHex = (hex: string): string => {
  const w = wardrobeColors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
  if (w) return w.name;
  return "Custom color";
};

/**
 * Diagnose an outfit: which item is weakening the score, and what
 * single swap fixes it (per-item contribution via leave-one-out
 * rescoring; the "diagnosing compatibility" framing of Balim 2023,
 * mapped onto our deterministic engine).
 * Requires ≥3 colors (leave-one-out needs 2+ survivors).
 */
export function diagnoseOutfit(colors: string[], season?: Season | null): OutfitDiagnosis {
  if (colors.length < 3) return { items: [], weakest: null, swap: null };

  const full = analyzeOutfit(colors, season).score;
  const items: ItemDiagnosis[] = colors.map((hex, i) => {
    const rest = colors.filter((_, j) => j !== i);
    const without = analyzeOutfit(rest, season).score;
    const contribution = full - without;
    return {
      hex,
      name: nameForHex(hex),
      contribution,
      status: contribution > 2 ? "load-bearing" : contribution < -2 ? "weakening" : "neutral",
    };
  });

  const weakest = [...items].sort((a, b) => a.contribution - b.contribution)[0] ?? null;

  /* swap search: replace the weakest item with every wardrobe color,
     keep the best-scoring replacement (never suggest a color already worn) */
  let swap: OutfitDiagnosis["swap"] = null;
  if (weakest && weakest.contribution < 0) {
    const worn = new Set(colors.map((c) => c.toUpperCase()));
    for (const cand of wardrobeColors as WardrobeColor[]) {
      if (worn.has(cand.hex.toUpperCase())) continue;
      const trial = colors.map((c) => (c === weakest.hex ? cand.hex : c));
      const s = analyzeOutfit(trial, season).score;
      const gain = s - full;
      if (!swap || s > swap.predictedScore) {
        swap = { hex: cand.hex, name: cand.name, predictedScore: s, gain };
      }
    }
  }

  return { items, weakest, swap };
}

const RELATION_LABELS: Record<HueRelation, string> = {
  monochrome: "Monochrome",
  analogous: "Analogous",
  complementary: "Complementary",
  "split-complementary": "Split-complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  neutral: "Wide-separation",
};

/* ---------- hue-pair preference (psychophysics) ---------- */

/**
 * Preference surface for a color pair, 0–1.
 * Schloss-inspired (Schloss & Palmer 2010 — aesthetic response to
 * color combinations: preference lives in the PAIR, beyond the
 * components; humans over-prefer similar hues + blue families and
 * under-prefer yellows), implemented as a calibrated closed form.
 * Documented in docs/RESEARCH-PAPERS.md §6.
 */
export function huePairPreference(x: Hcl, y: Hcl): number {
  let d = Math.abs(x.h - y.h);
  if (d > 180) d = 360 - d;

  /* similarity preference: 1 at d=0, decays toward 0.45 at d=180 */
  let p = 1 - (d / 180) * 0.55;

  /* the awkward mid-zone our engine already flags */
  if (d >= 30 && d <= 75) p -= 0.08;

  /* complementary accents work when one partner is muted */
  if (d >= 150 && Math.min(x.C, y.C) < 20) p += 0.12;

  /* hue-family weights from the preference literature */
  const meanHue = ((x.h + y.h) / 2) % 360;
  if (meanHue >= 200 && meanHue < 280) p += 0.04; // blue families over-preferred
  if (meanHue >= 55 && meanHue < 95) p -= 0.05; // yellow families under-preferred

  return Math.max(0, Math.min(1, p));
}

const isNeutralHcl = (h: Hcl): boolean => h.C < 13 || h.L > 90 || h.L < 14;

/** Analyze 2-4 outfit colors. Optionally fit them to the user's season. */
export function analyzeOutfit(colors: string[], season?: Season | null): OutfitAnalysis {
  const hcls = colors.map((c) => ({ hex: c, hcl: labToHcl(hexToLab(c)) }));

  /* ---- 1. hue geometry (the two most saturated chromatic colors) ---- */
  const chromatic = hcls.filter((x) => !isNeutralHcl(x.hcl));
  const pairPool = (chromatic.length >= 2 ? chromatic : hcls).slice(0, 2);
  const rel = classifyHuePair(pairPool[0].hcl.h, pairPool[1].hcl.h);
  const relationLabel = RELATION_LABELS[rel.relation];

  /* ---- 2. value contrast ---- */
  const Ls = hcls.map((x) => x.hcl.L);
  const spread = Math.max(...Ls) - Math.min(...Ls);
  const ratio = contrastRatio(colors[0], colors[1] ?? colors[0]);
  const level = spread < 12 ? "low" : spread < 32 ? "medium" : "high";

  /* ---- 3. chroma coherence ---- */
  const Cs = hcls.map((x) => x.hcl.C);
  const cMax = Math.max(...Cs);
  const cMin = Math.min(...Cs);

  /* ---- 4. warmth coherence ---- */
  const warmths = colors.map((c) => warmthScore(c));
  const hasWarm = warmths.some((w) => w >= 0.4);
  const hasCool = warmths.some((w) => w <= -0.4);
  const warmthBalance = hasWarm && hasCool ? "mixed" : hasWarm ? "coherent-warm" : "coherent-cool";

  /* ---- 5. neutral anchor ---- */
  const hasNeutral = hcls.some((x) => isNeutralHcl(x.hcl));

  /* ---- 5b. hue-pair preference (Schloss psychophysics) ---- */
  const prefPair = (chromatic.length >= 2 ? chromatic : hcls).slice(0, 2);
  const preference = huePairPreference(prefPair[0].hcl, prefPair[1].hcl);

  /* ---- 6. season fit (optional) ---- */
  let seasonFit: OutfitAnalysis["seasonFit"] | undefined;
  if (season) {
    const items = colors.map((c) => {
      const r = rateColorForSeason(c, season);
      return { hex: c, score: r.score, verdict: r.verdict };
    });
    const overall = Math.round(items.reduce((a, b) => a + b.score, 0) / items.length);
    seasonFit = { overall, items };
  }

  /* ---- build factor list ---- */
  const factors: OutfitFactor[] = [];

  // hue relation
  if (rel.relation === "neutral") {
    factors.push({
      label: "Hue geometry",
      status: "warn",
      note: `${Math.round(rel.separation)}° apart — in the awkward zone between harmony schemes. Ground it with a neutral.`,
    });
  } else if (rel.relation === "monochrome") {
    factors.push({
      label: "Hue geometry",
      status: "ok",
      note: "Monochrome family — one hue, many moods. It always reads intentional.",
    });
  } else {
    const why: Record<string, string> = {
      analogous: "neighbors on the wheel — the easiest, most wearable harmony",
      complementary: "opposites on the wheel — maximum pop, keep proportions uneven",
      "split-complementary": "a softer punch than full complementary — very editorial",
      triadic: "a three-point chord — playful, needs a neutral referee",
      tetradic: "a rich rectangle of hues — works best with one clear lead color",
    };
    factors.push({ label: "Hue geometry", status: "good", note: `${relationLabel}: ${why[rel.relation]}` });
  }

  // value contrast
  if (level === "low") {
    factors.push({
      label: "Light-dark balance",
      status: "ok",
      note: "Tonal dressing (low contrast) — chic if deliberate. Add texture or one dark anchor.",
    });
  } else {
    factors.push({
      label: "Light-dark balance",
      status: "good",
      note: `${level === "high" ? "Strong" : "Gentle"} light-dark separation (ΔL ${Math.round(spread)}) — definition without effort.`,
    });
  }

  // neutral anchor
  if (hasNeutral) {
    factors.push({
      label: "Neutral anchor",
      status: "good",
      note: "A neutral is present to rest the eye — the 60-30-10 rule has a base.",
    });
  } else {
    factors.push({
      label: "Neutral anchor",
      status: "warn",
      note: "No neutral present — every color competes. Add cream, denim or charcoal somewhere.",
    });
  }

  // chroma coherence
  if (cMax / Math.max(1, cMin) > 4.5) {
    factors.push({
      label: "Intensity match",
      status: "warn",
      note: "One color is far more saturated than the rest — it will steal the show. Balance or embrace it solo.",
    });
  } else {
    factors.push({
      label: "Intensity match",
      status: "good",
      note: "Saturation levels are in the same family — nothing shouts over the rest.",
    });
  }

  // warmth coherence
  if (warmthBalance === "mixed") {
    factors.push({
      label: "Warm-cool balance",
      status: "ok",
      note: "Warm and cool tones meet — bridge them with grey, denim or a pattern that holds both.",
    });
  } else {
    factors.push({
      label: "Warm-cool balance",
      status: "good",
      note: warmthBalance === "coherent-warm" ? "A warm family — glows in golden light." : "A cool family — crisp and porcelain-clear.",
    });
  }

  // hue-pair preference (psychophysics)
  {
    const d = Math.round(Math.abs(classifyHuePair(prefPair[0].hcl.h, prefPair[1].hcl.h).separation));
    const label = `Pairing preference`;
    if (preference >= 0.72) {
      factors.push({
        label,
        status: "good",
        note: `This pairing sits in the preferred zone of published hue-pair studies (${d}° apart) — combinations like this are consistently rated pleasing.`,
      });
    } else if (preference >= 0.5) {
      factors.push({
        label,
        status: "ok",
        note: `A mid-rated pairing (${d}° apart) — wearable; preference studies favor either closer hues or a muted complementary accent.`,
      });
    } else {
      factors.push({
        label,
        status: "warn",
        note: `The pair lands in the under-preferred zone (${d}° apart) — hue-pair studies rate this range as clashy. Pull the hues closer, or mute one of them.`,
      });
    }
  }

  // season fit
  if (seasonFit && season) {
    const v = seasonFit.overall;
    factors.push({
      label: `Your ${season.name} fit`,
      status: v >= 75 ? "good" : v >= 55 ? "ok" : "warn",
      note:
        v >= 75
          ? `Scored ${v}/100 against your personal palette — these love you back.`
          : v >= 55
            ? `Scored ${v}/100 against your personal palette — wearable, not your glowest.`
            : `Scored ${v}/100 against your personal palette — these drain rather than lift. Your palette has better dates.`,
    });
  }

  /* ---- score ---- */
  let score = 58;
  const bonus = (s: FactorStatus) => (s === "good" ? 8 : s === "ok" ? 3 : -6);
  for (const f of factors) score += bonus(f.status);
  if (seasonFit) score = Math.round(score * 0.72 + seasonFit.overall * 0.28);
  score = Math.max(38, Math.min(97, score));

  const verdict = score >= 82 ? "Wear it today" : score >= 68 ? "A solid outfit" : score >= 55 ? "Adventurous" : "Needs a referee";
  const headline =
    score >= 82
      ? "This combination practically styles itself."
      : score >= 68
        ? "Polished and repeatable — a keeper formula."
        : score >= 55
          ? "Interesting! With one small fix it levels up."
          : "The pieces are fighting — let a neutral break them up.";

  /* ---- 60-30-10 roles ---- */
  const sortedByC = [...hcls].sort((x, y) => y.hcl.C - x.hcl.C);
  const accentCandidate = sortedByC[0];
  const accent = accentCandidate && !isNeutralHcl(accentCandidate.hcl) ? accentCandidate.hex : null;
  const neutralFirst = [...hcls].sort((x, y) => {
    const nx = isNeutralHcl(x.hcl) ? 0 : 1;
    const ny = isNeutralHcl(y.hcl) ? 0 : 1;
    if (nx !== ny) return nx - ny;
    return y.hcl.L - x.hcl.L;
  });
  const base = neutralFirst[0].hex;
  const secondary = hcls.find((x) => x.hex !== base && x.hex !== accent)?.hex ?? hcls.filter((x) => x.hex !== base)[0].hex;

  return {
    score,
    verdict,
    headline,
    factors,
    relation: rel.relation,
    relationLabel,
    contrast: { level, ratio: Math.round(ratio * 10) / 10, spread: Math.round(spread) },
    roles: { base, secondary, accent },
    warmthBalance,
    seasonFit,
  };
}
