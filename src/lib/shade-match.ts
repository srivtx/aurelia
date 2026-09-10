/* ============================================================
   AURELIA — Shade Match Engine
   ------------------------------------------------------------
   Predicts how a product shade will sit on HER measured skin,
   the way a color lab would — no AR, no upload, ~0.1 ms.

   Model lineage (docs/RESEARCH-PAPERS.md §2):
     · Blend prediction: "A Color Image Analysis Tool to Help
       Users Choose a Makeup Foundation Color" (arXiv, Jul 2024)
       — skin-with-foundation = learned blend of selfie Lab and
       shade Lab. We implement the closed-form Lab α-blend with
       per-product opacity constants (calibrated, tunable).
     · Depth/hue deltas + ΔE2000: our color-science engine.
     · Oxidation risk (V2): skin sebum × warm shade pull × product
       family — modeled in lib/oxidation.ts; nobody else ships it.
   Pure + deterministic → SSR/hydration safe.
   ============================================================ */

import { deltaE2000, labToHcl, type Lab } from "./color-science";
import { oxidationVerdict, type ProductKind } from "./oxidation";
import type { SkinSignature } from "./skin-signature";

/* ProductKind + KIND_ALPHA stay the public surface of shade-match;
   the oxidation model itself lives in lib/oxidation.ts (Mirror Test V2) */
export type { ProductKind } from "./oxidation";

/* opacity of the blend in Lab (calibrated constants — tunable) */
const KIND_ALPHA: Record<ProductKind, number> = {
  foundation: 0.72, // complexion products stay semi-translucent
  blush: 0.3, // sheered-out flush
  lip: 0.85, // lips are the most opaque canvas
};

/* one "shade step" ≈ 2.5 L* units (calibrated convention) */
export const SHADE_STEP = 2.5;

export interface ShadeVerdict {
  kind: ProductKind;
  predicted: Lab; // predicted on-skin Lab
  predictedHexable: { L: number; a: number; b: number };
  /* deltas */
  deltaL: number; // shade minus skin
  deltaHue: number; // shade hue minus skin hue (degrees; + = warmer)
  visibility: number; // ΔE2000(predicted, skin)
  shadeSteps: number; // depth difference in "shades"
  /* calls */
  depthCall: string;
  undertoneCall: string;
  verdict: string; // headline sentence
  headline: string; // short label
  fit: number; // 0-100
  oxidation: { risk: "low" | "medium" | "high"; note: string };
  ashy: boolean;
  ashyNote?: string;
}

/** skin Lab from a signature (or any Lab). */
export function skinLabOf(sig: SkinSignature): Lab {
  return { L: sig.L, a: sig.a, b: sig.b };
}

/** The blend model: Lab-space α-blend, skin underneath. */
export function predictOnSkin(skin: Lab, shade: Lab, kind: ProductKind): Lab {
  const alpha = KIND_ALPHA[kind];
  return {
    L: skin.L * (1 - alpha) + shade.L * alpha,
    a: skin.a * (1 - alpha) + shade.a * alpha,
    b: skin.b * (1 - alpha) + shade.b * alpha,
  };
}

/**
 * Full verdict for a shade against measured skin.
 * @param oilyFactor 0–1 (from her skin-type quiz: oily/combo → high)
 */
export function matchShade(
  skin: Lab,
  shade: Lab,
  kind: ProductKind,
  oilyFactor = 0.5,
): ShadeVerdict {
  const predicted = predictOnSkin(skin, shade, kind);
  const skinHcl = labToHcl(skin);
  const shadeHcl = labToHcl(shade);

  let deltaHue = shadeHcl.h - skinHcl.h;
  if (deltaHue > 180) deltaHue -= 360;
  if (deltaHue < -180) deltaHue += 360;
  const deltaL = shade.L - skin.L;
  const visibility = deltaE2000(predicted, skin);
  const shadeSteps = deltaL / SHADE_STEP;

  /* ---------- calls ---------- */

  const stepsAbs = Math.abs(shadeSteps);
  const depthCall =
    stepsAbs < 0.8
      ? `Depth is aligned with your measured L* ${Math.round(skin.L)} — a true-depth match.`
      : shadeSteps > 0
        ? `Pulls ~${stepsAbs.toFixed(1)} shades deeper than your measured L* ${Math.round(skin.L)}.`
        : `Pulls ~${stepsAbs.toFixed(1)} shades lighter than your measured L* ${Math.round(skin.L)}.`;

  const hueAbs = Math.abs(deltaHue);
  const undertoneCall =
    hueAbs < 4
      ? `Undertone is congruent (Δh ${deltaHue.toFixed(0)}°) — it disappears into your skin tone.`
      : deltaHue > 0
        ? `Runs ${hueAbs.toFixed(0)}° warmer than your hue angle ${Math.round(skinHcl.h)}° — expect a golden-to-orange lean on you.`
        : `Runs ${hueAbs.toFixed(0)}° cooler than your hue angle ${Math.round(skinHcl.h)}° — expect a pink-to-rosy lean on you.`;

  /* ---------- fit score ---------- */
  let fit = 100;
  fit -= Math.min(45, stepsAbs * 9); // depth mismatch
  fit -= Math.min(30, hueAbs * 1.4); // undertone mismatch
  if (kind === "foundation" && visibility > 6) fit -= 6; // a foundation should whisper
  if (kind === "lip" && visibility < 5) fit -= 10; // a lip should speak
  if (kind === "blush" && visibility < 3) fit -= 12; // a blush must show
  fit = Math.max(5, Math.min(100, Math.round(fit)));

  /* ---------- headline ---------- */
  let headline: string;
  let verdict: string;
  if (hueAbs >= 4 && deltaHue > 0) {
    headline = "Warms you";
    verdict = `This shade will read golden-warm on you${stepsAbs > 1.5 ? " and noticeably deeper" : ""}. Beautiful on warm undertones; on cooler skin it can tip orange.`;
  } else if (hueAbs >= 4 && deltaHue < 0) {
    headline = "Cools you";
    verdict = `This shade will read pink-cool on you${stepsAbs > 1.5 ? " and deeper" : stepsAbs < -1.5 ? " and lighter" : ""}. Gorgeous on cool undertones; on warm skin it can look dusty.`;
  } else if (stepsAbs > 1.5) {
    headline = "Deeper than you";
    verdict = `Undertone matches, but it sits ~${stepsAbs.toFixed(1)} shades deep — great as a sculpting/contour family, heavy as a match.`;
  } else if (stepsAbs < -1.5) {
    headline = "Lighter than you";
    verdict = `Undertone matches, but it sits ~${Math.abs(stepsAbs).toFixed(1)} shades light — a brightening family, not a disappearing match.`;
  } else {
    headline = kind === "foundation" ? "Invisible match" : "Skin-true";
    verdict =
      kind === "foundation"
        ? `ΔE ${visibility.toFixed(1)} from your skin — this is the shade that disappears into you.`
        : `Sits right on your tone (ΔE ${visibility.toFixed(1)}) — a your-lips-but-better family.`;
  }

  /* ---------- oxidation (Mirror Test V2 — lib/oxidation.ts) ---------- */
  const oxv = oxidationVerdict(skin, shade, kind, predicted, oilyFactor);
  const oxidation = { risk: oxv.risk, note: oxv.note } as { risk: "low" | "medium" | "high"; note: string };

  /* ---------- ashy risk ---------- */
  const ashy = deltaHue < -6 && shadeSteps < -0.5;
  const ashyNote = ashy
    ? "Heads up: cooler AND lighter than your skin is the recipe for a grey cast (ashiness), especially on deeper skin tones."
    : undefined;

  return {
    kind,
    predicted,
    predictedHexable: { L: predicted.L, a: predicted.a, b: predicted.b },
    deltaL: round1(deltaL),
    deltaHue: round1(deltaHue),
    visibility: round1(visibility),
    shadeSteps: round1(shadeSteps),
    depthCall,
    undertoneCall,
    verdict,
    headline,
    fit,
    oxidation,
    ashy,
    ashyNote,
  };
}

/** map the skin-type quiz result to an oiliness factor 0–1 */
export function oilyFactorFromSkinType(skinType: string | null): number {
  if (!skinType) return 0.5;
  const t = skinType.toLowerCase();
  if (t.includes("oily") && !t.includes("combination")) return 0.85;
  if (t.includes("combination") || t.includes("combo")) return 0.65;
  if (t.includes("normal")) return 0.45;
  if (t.includes("dry")) return 0.25;
  return 0.5;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
