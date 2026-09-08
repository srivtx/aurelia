/* ============================================================
   AURELIA — Color Science Engine
   ------------------------------------------------------------
   Real colorimetry, computed client-side in ~0 ms:
     · sRGB ↔ CIE XYZ (D65) ↔ CIELAB / CIELCh
     · CIEDE2000 perceptual color difference (full spec)
     · WCAG relative luminance + contrast ratio
     · Hue-relationship classification & palette harmonies
   All functions are pure + deterministic → SSR/hydration safe.
   ============================================================ */

export interface Lab {
  L: number; // lightness 0-100
  a: number; // green(-) ↔ red(+)
  b: number; // blue(-) ↔ yellow(+)
}
export interface Hcl {
  L: number; // lightness 0-100
  C: number; // chroma 0-100 (approx)
  h: number; // hue angle 0-360
}
export interface Rgb {
  r: number;
  g: number;
  b: number;
} // 0-255

/* ---------- sRGB helpers ---------- */

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/* sRGB → linear (for XYZ math) */
const srgbToLinear = (c: number): number => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};
/* linear → sRGB */
const linearToSrgb = (x: number): number => {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, v * 255));
};

/* ---------- sRGB ↔ CIE XYZ (D65, 2° observer) ---------- */

export function rgbToXyz(rgb: Rgb): { x: number; y: number; z: number } {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return {
    x: 0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    y: 0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    z: 0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  };
}

const EPS = 216 / 24389; // (6/29)^3
const KAPPA = 24389 / 27;

/* D65 reference white (in absolute units) */
const WN = { x: 0.95047, y: 1.0, z: 1.08883 };

export function xyzToLab(xyz: { x: number; y: number; z: number }): Lab {
  const f = (t: number): number => (t > EPS ? Math.cbrt(t) : (KAPPA * t + 16) / 116);
  const fx = f(xyz.x / WN.x);
  const fy = f(xyz.y / WN.y);
  const fz = f(xyz.z / WN.z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function labToXyz(lab: Lab): { x: number; y: number; z: number } {
  const fy = (lab.L + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;
  const fi = (t: number): number => (t * t * t > EPS ? t * t * t : (116 * t - 16) / KAPPA);
  return { x: fi(fx) * WN.x, y: fi(fy) * WN.y, z: fi(fz) * WN.z };
}

export function xyzToRgb(xyz: { x: number; y: number; z: number }): Rgb {
  const r = 3.2404542 * xyz.x - 1.5371385 * xyz.y - 0.4985314 * xyz.z;
  const g = -0.969266 * xyz.x + 1.8760108 * xyz.y + 0.041556 * xyz.z;
  const b = 0.0556434 * xyz.x - 0.2040259 * xyz.y + 1.0572252 * xyz.z;
  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) };
}

/* ---------- hex ↔ Lab (with sRGB gamut clamping) ---------- */

export function hexToLab(hex: string): Lab {
  return xyzToLab(rgbToXyz(hexToRgb(hex)));
}

export function labToHex(lab: Lab): string {
  return rgbToHex(xyzToRgb(labToXyz(lab)));
}

/* ---------- CIELCh (cylindrical Lab) ---------- */

export function labToHcl(lab: Lab): Hcl {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L: lab.L, C, h };
}

export function hclToLab(hcl: Hcl): Lab {
  const rad = (hcl.h * Math.PI) / 180;
  return { L: hcl.L, a: hcl.C * Math.cos(rad), b: hcl.C * Math.sin(rad) };
}

/* ---------- Perceptual difference ---------- */

export function deltaE76(a: Lab, b: Lab): number {
  const dl = a.L - b.L;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

const DEG = Math.PI / 180;
const cos = (d: number) => Math.cos(d * DEG);
const sin = (d: number) => Math.sin(d * DEG);

/** CIEDE2000 — the current ISO/CIE standard perceptual ΔE. */
export function deltaE2000(lab1: Lab, lab2: Lab): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const CBar = (C1 + C2) / 2;
  const CBar7 = Math.pow(CBar, 7);
  const G = 0.5 * (1 - Math.sqrt(CBar7 / (CBar7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  let h1p = (Math.atan2(b1, a1p) * 180) / Math.PI;
  if (h1p < 0) h1p += 360;
  let h2p = (Math.atan2(b2, a2p) * 180) / Math.PI;
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * sin(dhp / 2);

  const LBarP = (L1 + L2) / 2;
  const CpBar = (C1p + C2p) / 2;

  let hBarP: number;
  if (C1p * C2p !== 0) {
    const sum = h1p + h2p;
    const absDiff = Math.abs(h1p - h2p);
    if (absDiff <= 180) hBarP = sum / 2;
    else if (sum < 360) hBarP = (sum + 360) / 2;
    else hBarP = (sum - 360) / 2;
  } else {
    hBarP = h1p + h2p;
  }

  const T =
    1 -
    0.17 * cos(hBarP - 30) +
    0.24 * cos(2 * hBarP) +
    0.32 * cos(3 * hBarP + 6) -
    0.2 * cos(4 * hBarP - 63);

  const dTheta = 30 * Math.exp(-Math.pow((hBarP - 275) / 25, 2));
  const CpBar7 = Math.pow(CpBar, 7);
  const RC = 2 * Math.sqrt(CpBar7 / (CpBar7 + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(LBarP - 50, 2)) / Math.sqrt(20 + Math.pow(LBarP - 50, 2));
  const SC = 1 + 0.045 * CpBar;
  const SH = 1 + 0.015 * CpBar * T;
  const RT = -sin(2 * dTheta) * RC;

  const tL = dLp / SL;
  const tC = dCp / SC;
  const tH = dHp / SH;

  return Math.sqrt(tL * tL + tC * tC + tH * tH + RT * tC * tH);
}

/** convenience: hex-pair ΔE2000 */
export const hexDeltaE = (hex1: string, hex2: string): number => deltaE2000(hexToLab(hex1), hexToLab(hex2));

/* ---------- WCAG contrast ---------- */

export function relLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast ratio 1-21, independent of order */
export function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- Warmth / undertone math ---------- */

/** Hue-angle warmth: +1 = warm (red→yellow), -1 = cool (cyan→blue). */
export function warmthOfHue(h: number): number {
  const x = ((h % 360) + 360) % 360;
  if (x >= 20 && x < 110) return 1; // red → yellow: warm
  if (x >= 110 && x < 170) return 0.35; // green: mildly warm
  if (x >= 170 && x < 290) return -1; // cyan → blue: cool
  return -0.35; // magenta/purple: mildly cool
}

/**
 * Overall warmth score of a color in [-1, 1].
 * Blends the CIELCh hue family with the b* axis (yellow+/blue-),
 * which dominates perceived "warm vs cool" in near-neutral shades.
 */
export function warmthScore(hex: string): number {
  const lab = hexToLab(hex);
  const hcl = labToHcl(lab);
  const bSignal = Math.max(-1, Math.min(1, lab.b / 40));
  const w = 0.55 * warmthOfHue(hcl.h) + 0.45 * bSignal;
  return Math.max(-1, Math.min(1, w));
}

/* ---------- Hue relationship classification ---------- */

export type HueRelation =
  | "monochrome"
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic"
  | "neutral";

export function classifyHuePair(h1: number, h2: number): { relation: HueRelation; separation: number } {
  let d = Math.abs(h1 - h2);
  if (d > 180) d = 360 - d;
  const near = (target: number, tol: number) => Math.abs(d - target) <= tol;
  if (near(0, 12)) return { relation: "monochrome", separation: d };
  if (near(30, 14)) return { relation: "analogous", separation: d };
  if (near(60, 14) || near(90, 14)) return { relation: "tetradic", separation: d };
  if (near(120, 15)) return { relation: "triadic", separation: d };
  if (near(150, 15)) return { relation: "split-complementary", separation: d };
  if (near(180, 18)) return { relation: "complementary", separation: d };
  return { relation: "neutral", separation: d };
}

/* ---------- Harmony generation ---------- */

export type HarmonyScheme =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochrome";

/** Harmonies are generated in CIELCh space (perceptually even) and
    clamped back into the sRGB gamut. */
export function harmonize(baseHex: string, scheme: HarmonyScheme): string[] {
  const lab = hexToLab(baseHex);
  const hcl = labToHcl(lab);
  const rot = (dh: number, dL = 0, cMul = 1): string =>
    labToHex(hclToLab({ L: Math.min(95, Math.max(5, hcl.L + dL)), C: hcl.C * cMul, h: hcl.h + dh }));
  switch (scheme) {
    case "complementary":
      return [rot(180)];
    case "analogous":
      return [rot(-30, 4, 0.95), rot(30, -4, 0.95)];
    case "triadic":
      return [rot(120), rot(240)];
    case "split-complementary":
      return [rot(150), rot(210)];
    case "tetradic":
      return [rot(90), rot(180), rot(270)];
    case "monochrome":
      return [
        rot(0, 16, 0.85),
        rot(0, -16, 0.85),
        rot(0, 0, 0.55),
      ];
  }
}

/* ---------- Naming (closest human name from a reference set) ---------- */

const NAME_ANCHORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#101014" },
  { name: "White", hex: "#F7F4EF" },
  { name: "Cream", hex: "#F2E4C6" },
  { name: "Beige", hex: "#D9C7A8" },
  { name: "Camel", hex: "#C08A4E" },
  { name: "Brown", hex: "#6E4B2A" },
  { name: "Terracotta", hex: "#C97B58" },
  { name: "Rust", hex: "#A5482A" },
  { name: "Coral", hex: "#F0806E" },
  { name: "Peach", hex: "#FADCB8" },
  { name: "Blush", hex: "#F2C4CE" },
  { name: "Rose", hex: "#C97B95" },
  { name: "Berry", hex: "#A54D74" },
  { name: "Fuchsia", hex: "#C73FB4" },
  { name: "Lavender", hex: "#AB9BC9" },
  { name: "Purple", hex: "#7B52C6" },
  { name: "Navy", hex: "#22314A" },
  { name: "Denim", hex: "#5B7391" },
  { name: "Sky", hex: "#9FC5E8" },
  { name: "Teal", hex: "#2E8B8B" },
  { name: "Sage", hex: "#9CAF88" },
  { name: "Olive", hex: "#77721F" },
  { name: "Mint", hex: "#BCE0C8" },
  { name: "Forest", hex: "#4E5D42" },
  { name: "Mustard", hex: "#D4A017" },
  { name: "Gold", hex: "#C9A227" },
  { name: "Grey", hex: "#A8A4A0" },
  { name: "Charcoal", hex: "#3A3A3C" },
];

/** Nearest perceptual name via ΔE2000. */
export function nameColor(hex: string): string {
  let best = "Custom";
  let bestD = Infinity;
  for (const a of NAME_ANCHORS) {
    const d = deltaE2000(hexToLab(hex), hexToLab(a.hex));
    if (d < bestD) {
      bestD = d;
      best = a.name;
    }
  }
  return best;
}
