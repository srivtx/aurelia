/* ============================================================
   AURELIA — Glow Delta engine (before/after makeup ΔE)
   ------------------------------------------------------------
   Quantifies what a look actually DID, in colorimetry:
     · per-region ΔE2000 / ΔL* / Δa* / Δb* between a
       before-selfie and an after-selfie
     · summary: luminance lift (glow), redness shift,
       evenness change (dispersion across regions)
   Paper lineage (docs/RESEARCH-PAPERS.md §3):
     Kim 2023, "Method and analysis of color changes of facial
     skin after makeup" — per-skin-region Lab deltas from open
     CV. We run the same measurement with tapped patches
     instead of landmarks (zero dependencies, same math).
   Both photos are independently white-point corrected
   (von-Kries, Cugmas 2020) — the only honest way to compare
   two shots taken under different light.
   Charter: measures CHANGE, never "beauty". Pure + 
   deterministic → SSR/hydration safe.
   ============================================================ */

import {
  deltaE2000,
  deltaE76,
  labToHcl,
  rgbToXyz,
  xyzToLab,
  type Lab,
} from "./color-science";
import {
  correctToReference,
  plausibleSkinLab,
  usableReference,
  type PatchSample,
} from "./skin-signature";

/* ---------- types ---------- */

export type GlowRegion = "cheek" | "jaw" | "forehead";

export const GLOW_REGIONS: GlowRegion[] = ["cheek", "jaw", "forehead"];

export interface GlowPhoto {
  ref: PatchSample;
  patches: Record<GlowRegion, PatchSample>;
}

export interface RegionDelta {
  region: GlowRegion;
  before: Lab;
  after: Lab;
  dE: number; // ΔE2000 — total visible change
  dL: number; // ΔL* — luminance ( + = lifted / brightened )
  da: number; // Δa* — redness ( + = redder, − = calmer )
  db: number; // Δb* — yellowness ( + = golden, − = rosy )
  dHue: number; // hue shift in degrees ( + = warmer )
  reading: string; // human sentence for this region
}

export interface GlowResult {
  ok: boolean;
  regions: RegionDelta[];
  summary: {
    glow: number; // mean ΔL* ( + = lifted )
    redness: number; // mean Δa* ( − = calmer )
    evennessChange: number; // % ( + = more even )
    totalChange: number; // mean ΔE2000
  };
  headline: string;
  verdict: string; // body-positive reading of the change
  shareText: string;
  warnings: string[];
  error?: string;
}

/* ---------- region-specific readings ----------
   Interpretation follows how makeup actually works per zone:
   cheeks take blush (redness is intended), jaw takes contour
   (darkening is intended), forehead takes base (evening-out
   is intended). Copy is neutral about "better": it describes
   the CHANGE, never grades her face. */

function regionReading(r: RegionDelta): string {
  const warm = r.dHue;
  switch (r.region) {
    case "cheek":
      if (r.da > 2.5 && warm > 1)
        return `Flush came through — redness +${r.da.toFixed(1)} and ${warm.toFixed(0)}° warmer: this is your blush sitting where blush lives.`;
      if (r.da < -1.5)
        return `Calmer cheek — redness ${r.da.toFixed(1)}: base or color-correcting pulled the flush down.`;
      if (r.dL > 2)
        return `Lifted +${r.dL.toFixed(1)} lightness — brightening is doing its job here.`;
      return `Barely moved (ΔE ${r.dE.toFixed(1)}) — the cheek reads almost the same as bare skin.`;
    case "jaw":
      if (r.dL < -1.5)
        return `Sculpted −${Math.abs(r.dL).toFixed(1)} lightness — shadow placed along the jawline, i.e. contour behaving.`;
      if (r.dL > 2)
        return `Brightened +${r.dL.toFixed(1)} — a lighter/brightening base at the jaw.`;
      return `Steady jaw (ΔE ${r.dE.toFixed(1)}) — same depth as before.`;
    case "forehead":
      if (Math.abs(r.da) < 1.5 && r.dE > 4)
        return `Evened out — redness held (Δa ${r.da.toFixed(1)}) while overall tone shifted ΔE ${r.dE.toFixed(1)}: base coverage without a mask.`;
      if (r.da < -1.5)
        return `Redness settled ${r.da.toFixed(1)} on the forehead — the most tell-tale sign a base is matching you.`;
      if (r.db > 2)
        return `Golden shift +${r.db.toFixed(1)} b* — warm-toned base or bronzer landing here.`;
      return `Quiet change (ΔE ${r.dE.toFixed(1)}) — forehead close to bare.`;
  }
}

/* ---------- evenness (dispersion across regions) ----------
   Kim 2023 reports per-region dispersion; with 3+ matched
   regions we use the mean ΔE76 distance from the facial
   centroid. Lower dispersion = more even overall tone.
   ΔE76 (not 2000) — dispersion is a spread statistic,
   not a perceptual match. Documented choice. */

function dispersion(labs: Lab[]): number {
  if (labs.length < 2) return 0;
  const c: Lab = {
    L: labs.reduce((s, l) => s + l.L, 0) / labs.length,
    a: labs.reduce((s, l) => s + l.a, 0) / labs.length,
    b: labs.reduce((s, l) => s + l.b, 0) / labs.length,
  };
  return labs.reduce((s, l) => s + deltaE76(l, c), 0) / labs.length;
}

/* ---------- core ---------- */

/** white-correct a patch and convert to Lab */
function patchToLab(p: PatchSample, ref: PatchSample): Lab {
  return xyzToLab(rgbToXyz(correctToReference({ r: p.r, g: p.g, b: p.b }, ref)));
}

export function buildGlowDelta(before: GlowPhoto, after: GlowPhoto): GlowResult {
  const warnings: string[] = [];

  if (!usableReference(before.ref) || !usableReference(after.ref)) {
    return {
      ok: false,
      regions: [],
      summary: { glow: 0, redness: 0, evennessChange: 0, totalChange: 0 },
      headline: "",
      verdict: "",
      shareText: "",
      warnings,
      error:
        "Both photos need something truly white in frame (a tissue works) — that's what makes two shots taken under different light comparable. Retake with the reference in both.",
    };
  }

  /* per-region deltas */
  const regions: RegionDelta[] = [];
  const beforeLabs: Lab[] = [];
  const afterLabs: Lab[] = [];

  for (const region of GLOW_REGIONS) {
    const bl = patchToLab(before.patches[region], before.ref);
    const al = patchToLab(after.patches[region], after.ref);
    const beforeOk = plausibleSkinLab(bl);
    const afterOk = plausibleSkinLab(al);
    if (!beforeOk || !afterOk) {
      warnings.push(
        `The ${region} patches don't read as skin in one of the photos — cheek, jaw and forehead, avoiding hair and shadows.`,
      );
      continue;
    }
    beforeLabs.push(bl);
    afterLabs.push(al);

    const bh = labToHcl(bl).h;
    const ah = labToHcl(al).h;
    let dHue = ah - bh;
    if (dHue > 180) dHue -= 360;
    if (dHue < -180) dHue += 360;

    regions.push({
      region,
      before: bl,
      after: al,
      dE: deltaE2000(al, bl),
      dL: al.L - bl.L,
      da: al.a - bl.a,
      db: al.b - bl.b,
      dHue,
      reading: "",
    });
  }

  if (regions.length === 0) {
    return {
      ok: false,
      regions: [],
      summary: { glow: 0, redness: 0, evennessChange: 0, totalChange: 0 },
      headline: "",
      verdict: "",
      shareText: "",
      warnings,
      error: "None of the tapped patches read as skin in both photos — tap cheek, jaw and forehead, away from hair and shadows.",
    };
  }

  for (const r of regions) r.reading = regionReading(r);

  /* summary */
  const glow = mean(regions.map((r) => r.dL));
  const redness = mean(regions.map((r) => r.da));
  const totalChange = mean(regions.map((r) => r.dE));
  const dispBefore = dispersion(beforeLabs);
  const dispAfter = dispersion(afterLabs);
  const evennessChange = dispBefore > 1e-6 ? ((dispBefore - dispAfter) / dispBefore) * 100 : 0;
  if (regions.length < GLOW_REGIONS.length) {
    warnings.push("One region was skipped — the summary averages the regions that read cleanly.");
  }
  if (evennessChange > 60 || evennessChange < -60) {
    warnings.push(
      "Lighting looks very different between the two photos — for a fair delta, shoot both in the same spot facing a window.",
    );
  }

  const summary = { glow, redness, evennessChange, totalChange };

  /* headline + body-positive verdict */
  const { headline, verdict } = glowCopy(summary, regions);

  const shareText = [
    `My glow delta ✦ ${headline.toLowerCase()}`,
    `luminance ${fmtSigned(glow)} · redness ${fmtSigned(-redness)} · evenness ${fmtSigned(evennessChange)}%`,
    "measured on-device, never uploaded — from the Aurelia app",
  ].join(" — ");

  return { ok: true, regions, summary, headline, verdict, shareText, warnings };
}

/* ---------- human copy ----------
   Charter: the card describes change, never grades a face. */

function glowCopy(
  summary: GlowResult["summary"],
  regions: RegionDelta[],
): { headline: string; verdict: string } {
  const { glow, redness, evennessChange, totalChange } = summary;

  if (totalChange < 1.5) {
    return {
      headline: "The no-makeup makeup",
      verdict: `ΔE ${totalChange.toFixed(1)} across your face — your look changed almost nothing measurable. That's not a fail; it's the definition of a clean, skin-like finish.`,
    };
  }
  if (glow > 1.5 && evennessChange > 8) {
    return {
      headline: "Lifted and evened",
      verdict: `Brightness +${glow.toFixed(1)} L* with tone ${evennessChange.toFixed(0)}% more even across cheek, jaw and forehead — the "your skin but rested" signature.`,
    };
  }
  if (glow > 1.5) {
    return {
      headline: "Lit from within",
      verdict: `Brightness lifted +${glow.toFixed(1)} L* on average. Highlighter, brightening base or just great light — the lift is measurable.`,
    };
  }
  if (glow < -1.5 && regions.some((r) => r.region === "jaw" && r.dL < -1.5)) {
    return {
      headline: "Sculpted",
      verdict: `Shadow won: ${Math.abs(glow).toFixed(1)} L* deeper on average, with the jaw reading −${Math.abs(regions.find((r) => r.region === "jaw")?.dL ?? 0).toFixed(1)}. Contour is doing sculpting work, not coverage work.`,
    };
  }
  if (redness > 3) {
    return {
      headline: "Warmth came forward",
      verdict: `Redness +${redness.toFixed(1)} a* across your zones — blush, bronzer or a warm base carrying the look. Change this intentional reads as healthy color, not coverage.`,
    };
  }
  if (redness < -1.5 && evennessChange > 0) {
    return {
      headline: "Calmed and evened",
      verdict: `Redness settled ${Math.abs(redness).toFixed(1)} a* while overall tone evened ${evennessChange.toFixed(0)}% — the quiet, expensive-looking finish.`,
    };
  }
  return {
    headline: "A true shift",
    verdict: `Your face moved ΔE ${totalChange.toFixed(1)} on average — visible change, measured zone by zone. The look did exactly what looks are for: it changed you, by choice.`,
  };
}

/* ---------- helpers ---------- */

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function fmtSigned(n: number): string {
  const v = Math.round(n * 10) / 10;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}`;
}
