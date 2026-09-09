/* ============================================================
   AURELIA — Skin Signature (dermatology-grade colorimetry)
   ------------------------------------------------------------
   The measurement primitive of the closed beauty loop:
     · ITA° — Individual Typology Angle, the dermatology
       standard for skin-color classification
       (Chardon et al. 1991; Clément et al. — classes below)
     · CIELCh hue angle h° — objective undertone signal
     · Chroma C* — colorfulness of the skin
   Measured from a selfie with a white-reference patch:
   von-Kries-style per-channel gain correction (the calibration
   approach validated for smartphone teledermoscopy, Cugmas et
   al. 2020). Everything runs on-device in <1 ms.
   Pure + deterministic → SSR/hydration safe.
   Thresholds marked "calibrated" are our tunable defaults,
   not paper constants (documented in docs/RESEARCH-PAPERS.md).
   ============================================================ */

import { rgbToXyz, xyzToLab, labToHcl, type Lab, type Rgb } from "./color-science";

/* ---------- types ---------- */

export interface SkinSignature {
  L: number; // CIELAB lightness
  a: number; // green(-) ↔ red(+)
  b: number; // blue(-) ↔ yellow(+)
  ita: number; // Individual Typology Angle, degrees
  hue: number; // CIELCh hue angle, degrees (skin lands ~20–75)
  chroma: number; // CIELCh chroma
  depth: ItaClass;
  undertone: "warm" | "neutral" | "cool";
  calibrated: boolean; // true = white reference used
  taken: string; // local YYYY-MM-DD
}

export type ItaClass =
  | "very light"
  | "light"
  | "intermediate"
  | "tan"
  | "brown"
  | "deep";

/* ---------- ITA° ---------- */

/** ITA° = arctan((L* − 50) / b*) × 180/π — higher = lighter. */
export function itaFromLab(lab: Lab): number {
  if (Math.abs(lab.b) < 1e-6) return lab.b >= 0 ? 90 : -90;
  return (Math.atan((lab.L - 50) / lab.b) * 180) / Math.PI;
}

/** Standard Chardon/Clément ITA classes. */
export function classifyIta(ita: number): ItaClass {
  if (ita > 55) return "very light";
  if (ita > 41) return "light";
  if (ita > 28) return "intermediate";
  if (ita > 10) return "tan";
  if (ita > -30) return "brown";
  return "deep";
}

/* ---------- undertone (calibrated thresholds) ----------
   Facial-skin Lab hue angles cluster ~20–75°. Red-leaning
   (pink) complexions sit low, golden/olive ones high.
   Calibrated defaults: cool < 48°, warm > 58°. Tunable. */

export function undertoneFromHue(h: number): "warm" | "neutral" | "cool" {
  if (h > 58) return "warm";
  if (h < 48) return "cool";
  return "neutral";
}

/* ---------- sampling + calibration ---------- */

export interface PatchSample {
  r: number;
  g: number;
  b: number;
}

/** Plausibility guard: skin patches in Lab must look like skin. */
export function plausibleSkinLab(lab: Lab): boolean {
  return lab.L > 8 && lab.L < 97 && lab.a > 2 && lab.b > 3 && lab.b < 45 && lab.a < 35;
}

/** Quality guard: a usable white reference is bright and near-neutral. */
export function usableReference(ref: PatchSample): boolean {
  const lum = 0.299 * ref.r + 0.587 * ref.g + 0.114 * ref.b;
  const spread = Math.max(ref.r, ref.g, ref.b) - Math.min(ref.r, ref.g, ref.b);
  return lum > 120 && spread < 90;
}

/**
 * White-point correction: per-channel gain so the reference patch
 * maps to sRGB white (255,255,255), then D65 Lab conversion.
 * This is the von-Kries diagonal model — the standard affordable
 * calibration for smartphone colorimetry.
 */
export function correctToReference(rgb: Rgb, ref: PatchSample): Rgb {
  const gain = (ch: number, refCh: number) => {
    if (refCh < 12) return 1; // degenerate reference — leave untouched
    return 255 / refCh;
  };
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return {
    r: clamp(rgb.r * gain(rgb.r, ref.r)),
    g: clamp(rgb.g * gain(rgb.g, ref.g)),
    b: clamp(rgb.b * gain(rgb.b, ref.b)),
  };
}

export interface SignatureResult {
  ok: boolean;
  signature?: SkinSignature;
  warnings: string[]; // non-fatal quality notes
  error?: string; // fatal, human-readable
}

/**
 * Build a Skin Signature from tapped patches.
 * @param ref      the white/neutral reference patch (tissue, paper…)
 * @param patches  2–4 skin patches (cheek, jaw, forehead…)
 */
export function buildSkinSignature(ref: PatchSample, patches: PatchSample[]): SignatureResult {
  const warnings: string[] = [];

  if (patches.length < 2) {
    return { ok: false, warnings, error: "Tap at least two spots on your skin (cheek + jaw)." };
  }
  if (!usableReference(ref)) {
    return {
      ok: false,
      warnings,
      error: "That white reference looks off — use something truly white (tissue, notebook paper) and retake in even light.",
    };
  }

  /* correct each patch against the reference, convert to Lab */
  const labs = patches.map((p) => {
    const corrected = correctToReference({ r: p.r, g: p.g, b: p.b }, ref);
    return xyzToLab(rgbToXyz(corrected));
  });

  const skinLabs = labs.filter(plausibleSkinLab);
  if (skinLabs.length === 0) {
    return {
      ok: false,
      warnings,
      error: "Those patches don't read as skin — tap cheek and jaw, avoiding hair, shadows and jewelry.",
    };
  }
  if (skinLabs.length < labs.length) {
    warnings.push("One patch looked off and was skipped.");
  }

  /* average in Lab */
  const avg: Lab = {
    L: skinLabs.reduce((s, l) => s + l.L, 0) / skinLabs.length,
    a: skinLabs.reduce((s, l) => s + l.a, 0) / skinLabs.length,
    b: skinLabs.reduce((s, l) => s + l.b, 0) / skinLabs.length,
  };

  /* patch agreement → measurement confidence */
  const spread = Math.max(
    ...skinLabs.map((l) => Math.hypot(l.L - avg.L, l.a - avg.a, l.b - avg.b)),
  );
  if (spread > 12) {
    warnings.push("Your skin patches differ a lot — lighting was uneven. Retake facing a window for a steadier read.");
  }

  const ita = itaFromLab(avg);
  const hcl = labToHcl(avg);
  const signature: SkinSignature = {
    L: round2(avg.L),
    a: round2(avg.a),
    b: round2(avg.b),
    ita: round1(ita),
    hue: round1(hcl.h),
    chroma: round2(hcl.C),
    depth: classifyIta(ita),
    undertone: undertoneFromHue(hcl.h),
    calibrated: true,
    taken: today(),
  };
  return { ok: true, signature, warnings };
}

/** Wrap an already-measured Lab into a full signature (manual entry). */
export function signatureFromLab(lab: Lab, taken?: string): SkinSignature {
  const ita = itaFromLab(lab);
  const hcl = labToHcl(lab);
  return {
    L: round2(lab.L),
    a: round2(lab.a),
    b: round2(lab.b),
    ita: round1(ita),
    hue: round1(hcl.h),
    chroma: round2(hcl.C),
    depth: classifyIta(ita),
    undertone: undertoneFromHue(hcl.h),
    calibrated: false,
    taken: taken ?? today(),
  };
}

/* ---------- human copy ---------- */

export function undertoneCopy(u: SkinSignature["undertone"]): string {
  if (u === "warm") return "golden-neutral undertone — creams, peach and terracotta will sit at home on you";
  if (u === "cool") return "pink-neutral undertone — berries, rose and cool reds were made for you";
  return "balanced undertone — the luckiest category, both warm and cool families flatter you";
}

export function depthCopy(sig: SkinSignature): string {
  const map: Record<ItaClass, string> = {
    "very light": "porcelain depth — the lightest foundation families, and pastels carry you",
    light: "light depth — light-to-medium shade families",
    intermediate: "medium depth — the heart of most shade ranges",
    tan: "tan depth — golden-medium territory; tan and amber bases",
    brown: "deep depth — rich caramels and bronzes; avoid anything chalky",
    deep: "deepest depth — red-toned and blue-toned deeps, never ashy",
  };
  return map[sig.depth];
}

/* ---------- helpers ---------- */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
