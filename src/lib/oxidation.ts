/* ============================================================
   AURELIA — Oxidation Engine (Mirror Test V2)
   ------------------------------------------------------------
   "Why does my foundation turn orange by lunch?" — the first
   computational model of a folklore problem.

   Chemistry (paulaschoice.com / epilynx.com, Dec 2025):
     sebum (skin oil) saturates iron-oxide pigments →
     the film darkens and warms within ~1 hour of wear.
   Nobody on the market predicts it per-person. We do, from
   data she already measured:
     · her oiliness (skin-type quiz → oilyFactor 0–1)
     · the shade's warm lean vs HER hue angle (V1 signature)
     · the product type (foundations oxidize hardest)
   Pure + deterministic → SSR/hydration safe, bun-testable.
   ------------------------------------------------------------
   Honest charter: this is a named-mechanism heuristic, not a
   chemical assay. Copy says "recipe / likely", never "will".
   ============================================================ */

import { deltaE2000, hclToLab, labToHex, labToHcl, type Lab } from "./color-science";

/* ---------- shared product kinds (re-exported by shade-match) ---------- */

export type ProductKind = "foundation" | "blush" | "lip";

/* how oxidation-prone each product family is (calibrated judgment):
   foundation sits for hours on the oiliest zones of the face and
   carries the heaviest iron-oxide load; blush sits on cheeks but is
   sheered out; lip color has the shortest wear and no sebum canvas. */
const KIND_PROPENSITY: Record<ProductKind, number> = {
  foundation: 1,
  blush: 0.55,
  lip: 0.38,
};

/* ---------- types ---------- */

export interface OxidationDriver {
  label: string;
  weight: "high" | "medium" | "low";
}

export interface OxidationVerdict {
  score: number; // 0–100 composite likelihood × magnitude
  risk: "low" | "medium" | "high";
  headline: string;
  drivers: OxidationDriver[];
  /* the fresh application (given) vs the simulated 1-hour shift */
  fresh: Lab;
  postOxidation: Lab;
  postOxidationHex: string;
  shiftL: number; // ΔL* (negative = darker)
  shiftHue: number; // Δh° (positive = warmer/oranger)
  shiftVisibility: number; // ΔE2000(fresh, postOxidation) — how visible the drift is
  /* the concrete counter-move: half a shade lighter + cooler */
  counterHex: string | null;
  counterNote: string;
  chemistry: string;
  note: string; // one-paragraph guidance (compat surface for shade-match)
}

/* ---------- the model ---------- */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Full oxidation verdict for a shade on measured skin.
 * @param skin   her measured skin Lab (V1 signature)
 * @param shade  the product shade in Lab
 * @param kind   product family
 * @param predictedOnSkin  the α-blend the shade will read on skin
 *                         (from shade-match.predictOnSkin — oxidation
 *                         shifts *that*, not the raw shade)
 * @param oilyFactor  0–1 from her skin-type quiz
 */
export function oxidationVerdict(
  skin: Lab,
  shade: Lab,
  kind: ProductKind,
  predictedOnSkin: Lab,
  oilyFactor: number,
): OxidationVerdict {
  const skinHcl = labToHcl(skin);
  const shadeHcl = labToHcl(shade);

  let deltaHue = shadeHcl.h - skinHcl.h;
  if (deltaHue > 180) deltaHue -= 360;
  if (deltaHue < -180) deltaHue += 360;

  /* --- factors --- */
  const warmPull = clamp01(Math.max(0, deltaHue) / 18); // full at +18°
  const propensity = KIND_PROPENSITY[kind];
  const oily = clamp01(oilyFactor);

  /* composite: oiliness × (base + warm lean) × product family */
  const score = Math.round(100 * oily * (0.3 + 0.7 * warmPull) * propensity);
  const risk = score > 60 ? "high" : score > 34 ? "medium" : "low";

  /* --- the 1-hour simulation: darker + warmer ---
     magnitude scales with score; L* drops, b* rises (yellow-orange),
     a* nudges red. Foundation worst-case ≈ one shade step. */
  const s = score / 100;
  const shiftL = -(0.4 + 2.6 * s) * propensity; // up to ~−3 L* on a foundation
  const shiftB = (1.5 + 5.0 * s) * propensity; // the orange drift
  const shiftA = (0.4 + 1.6 * s) * propensity;

  const post: Lab = {
    L: Math.max(0, Math.min(100, predictedOnSkin.L + shiftL)),
    a: predictedOnSkin.a + shiftA,
    b: predictedOnSkin.b + shiftB,
  };
  const postHex = labToHex(post);
  const postHcl = labToHcl(post);
  const freshHcl = labToHcl(predictedOnSkin);
  let shiftHue = postHcl.h - freshHcl.h;
  if (shiftHue > 180) shiftHue -= 360;
  if (shiftHue < -180) shiftHue += 360;
  const shiftVisibility = deltaE2000(predictedOnSkin, post);

  /* --- the counter-move: half a shade lighter, ~7° cooler ---
     derived from THE SHADE (a product she can actually buy), not
     the on-skin blend — she taps it into the lab to re-test. */
  const counterHex =
    risk === "low"
      ? null
      : labToHex(
          hclToLab({
            h: (shadeHcl.h - 7 + 360) % 360,
            C: shadeHcl.C,
            L: Math.min(100, shade.L + 1.25), // +½ shade step
          }),
        );

  /* --- drivers (ranked, honest) --- */
  const drivers: OxidationDriver[] = [];
  drivers.push({
    label:
      oily >= 0.65
        ? `Your ${oilyWord(oily)} skin — sebum is the oxidizing engine`
        : oily <= 0.35
          ? "Your drier skin — little sebum to saturate the pigments"
          : "Balanced-to-moderate oiliness — sebum plays a partial role",
    weight: oily >= 0.65 ? "high" : oily <= 0.35 ? "low" : "medium",
  });
  if (deltaHue > 4) {
    drivers.push({
      label: `The shade runs ${Math.round(deltaHue)}° warmer than your hue — warm leans drift furthest`,
      weight: warmPull > 0.5 ? "high" : "medium",
    });
  } else if (deltaHue < -4) {
    drivers.push({
      label: `The shade runs ${Math.round(-deltaHue)}° cooler than you — cooler leans mask the drift better`,
      weight: "low",
    });
  } else {
    drivers.push({ label: "The shade is hue-congruent with you — less far to drift", weight: "low" });
  }
  drivers.push({
    label:
      kind === "foundation"
        ? "Foundation: longest wear, heaviest iron-oxide load — the classic oxidizer"
        : kind === "blush"
          ? "Blush: sheered-out film on the cheeks — moderate exposure"
          : "Lip color: shortest wear, no sebum canvas — least prone",
    weight: propensity > 0.8 ? "high" : propensity > 0.5 ? "medium" : "low",
  });

  /* --- copy --- */
  const headline =
    risk === "high"
      ? "The classic oxidation recipe"
      : risk === "medium"
        ? "Likely to darken on you"
        : "Oxidation risk is low";

  const chemistry =
    "The chemistry: sebum saturates the iron-oxide pigments in the formula, and the film reads darker and more orange within about an hour of wear — the “my foundation turned orange by lunch” effect. It’s person-dependent chemistry, which is why the same shade is stable on your friend and drifts on you.";

  const counterNote =
    counterHex
      ? `The standard counter: size half a shade lighter and ~7° cooler — it will drift onto you. Tap the swatch to load it into the lab.`
      : "No counter-move needed — this pairing stays stable.";

  const note =
    risk === "high"
      ? `${oilyWord(oily).charAt(0).toUpperCase() + oilyWord(oily).slice(1)}-skin chemistry + this warm lean is the classic oxidation recipe — expect a darker, orange shift within the hour. Sizing half a shade cooler-lighter is the standard counter.`
      : risk === "medium"
        ? "Some oxidation likely on oilier days — set with powder, or keep this shade for matte/dry-skin formulas."
        : "Oxidation risk is low — the undertone lean and your skin balance keep this stable.";

  return {
    score,
    risk,
    headline,
    drivers,
    fresh: predictedOnSkin,
    postOxidation: post,
    postOxidationHex: postHex,
    shiftL: round2(shiftL),
    shiftHue: round2(shiftHue),
    shiftVisibility: round2(shiftVisibility),
    counterHex,
    counterNote,
    chemistry,
    note,
  };
}

function oilyWord(oily: number): string {
  if (oily >= 0.75) return "oily";
  if (oily >= 0.55) return "combination";
  if (oily >= 0.4) return "balanced";
  return "dry";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ---------- formula read for scanned INCI lists ---------- */

export interface FormulaOxidation {
  propensity: number; // 0–1
  matched: string[]; // tokens that triggered the read
  notes: string[]; // one per finding
}

/* token sets (lowercase INCI-ish; the scanner normalizes input) */
const IRON_OXIDES = ["ci 77491", "ci 77492", "ci 77499", "ci 77400", "iron oxides", "iron oxide"];
const VIT_C = ["ascorbic acid", "l-ascorbic acid", "ascorbyl glucoside"];
const PEROXIDE = ["benzoyl peroxide", "hydrogen peroxide"];

/**
 * Read an ingredient token list for oxidation chemistry.
 * `rawText` (optional, the original label text) catches CI 77xxx
 * color-index numbers that token normalization strips digits from.
 * Returns null when nothing relevant is present.
 */
export function formulaOxidation(tokens: string[], rawText?: string): FormulaOxidation | null {
  const notes: string[] = [];
  const matched: string[] = [];
  let propensity = 0;

  const has = (set: string[]) => set.find((t) => tokens.includes(t));

  /* iron oxides: token form OR the CI color-index codes in raw text
     (splitInci strips digits, so "CI 77491" tokenizes to "ci") */
  const ironToken = has(IRON_OXIDES);
  const ironCi = /ci\s*(?:77491|77492|77499|77400)/i.test(rawText ?? "");
  if (ironToken || ironCi) {
    propensity += 0.55;
    matched.push(ironToken ?? "ci 774xx");
    notes.push(
      "Iron-oxide pigments (“" + (ironToken ?? "CI 774xx") + "”) — the classic oxidizer family. On oily skin this base is the one that drifts darker-orange by lunch.",
    );
  }
  const vitc = has(VIT_C);
  if (vitc) {
    propensity += 0.25;
    matched.push(vitc);
    notes.push(
      "Vitamin C in water form (“" + vitc + "”) oxidizes in the bottle — the yellowing you see is the serum itself, not your skin.",
    );
  }
  const peroxide = has(PEROXIDE);
  if (peroxide) {
    propensity += 0.2;
    matched.push(peroxide);
    notes.push(
      "“" + peroxide + "” is a strong oxidizer — it bleaches fabrics and oxidizes pure vitamin C on contact. Keep it away from both.",
    );
  }

  if (!matched.length) return null;
  return {
    propensity: Math.min(1, propensity),
    matched,
    notes,
  };
}
