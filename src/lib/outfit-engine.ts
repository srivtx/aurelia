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

const RELATION_LABELS: Record<HueRelation, string> = {
  monochrome: "Monochrome",
  analogous: "Analogous",
  complementary: "Complementary",
  "split-complementary": "Split-complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  neutral: "Wide-separation",
};

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

  // season fit
  if (seasonFit) {
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
