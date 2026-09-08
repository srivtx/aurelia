/* ============================================================
   AURELIA — Photo Palette Extraction (client-side CV)
   ------------------------------------------------------------
   Dominant-color extraction entirely on-device:
     1. decode → downscale to ≤120px canvas
     2. convert every pixel to CIELAB
     3. k-means++ (deterministic LCG seed) in Lab space
     4. merge near-duplicate centroids (ΔE2000 < 9)
   No uploads, no network, no privacy concerns — runs in an
   event handler so it never touches SSR/hydration.
   ============================================================ */

import { hexToLab, labToHex, labToHcl, deltaE2000, nameColor, type Lab } from "./color-science";

export interface ExtractedSwatch {
  hex: string;
  lab: Lab;
  share: number; // 0-1 of sampled pixels
  name: string;
  neutral: boolean;
  warmth: number;
}

/* deterministic LCG so the same photo always yields the same palette */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function isNeutral(lab: Lab): boolean {
  const { C } = labToHcl(lab);
  return C < 13 || lab.L > 90 || lab.L < 14;
}

/** Lab-space hue warmth (see color-science warmthOfHue) */
function labWarmth(lab: Lab): number {
  const hcl = labToHcl(lab);
  const x = ((hcl.h % 360) + 360) % 360;
  let hueW: number;
  if (x >= 20 && x < 110) hueW = 1;
  else if (x >= 110 && x < 170) hueW = 0.35;
  else if (x >= 170 && x < 290) hueW = -1;
  else hueW = -0.35;
  const bSignal = Math.max(-1, Math.min(1, lab.b / 40));
  return 0.55 * hueW + 0.45 * bSignal;
}

/** Extract the dominant palette from an image File/Blob. */
export async function extractPalette(file: Blob, k = 6): Promise<ExtractedSwatch[]> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 120;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const data = ctx.getImageData(0, 0, w, h).data;

  /* collect opaque pixels as Lab */
  const pixels: Lab[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    pixels.push(hexToLab(rgbToHexQuick(data[i], data[i + 1], data[i + 2])));
  }
  if (pixels.length < 24) throw new Error("Image too small or uniform");

  /* ---- k-means++ init (deterministic) ---- */
  const rand = lcg(0x9E3779B9);
  const centroids: Lab[] = [pixels[Math.floor(rand() * pixels.length)]];
  while (centroids.length < k) {
    const dists = pixels.map((p) => {
      let best = Infinity;
      for (const c of centroids) best = Math.min(best, sqDist(p, c));
      return best;
    });
    const total = dists.reduce((a, b) => a + b, 0);
    if (total === 0) break;
    let r = rand() * total;
    let idx = 0;
    for (; idx < dists.length - 1 && r > dists[idx]; idx++) r -= dists[idx];
    centroids.push(pixels[idx]);
  }

  /* ---- Lloyd iterations ---- */
  let assign = new Array<number>(pixels.length).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = sqDist(pixels[i], centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (assign[i] !== best) changed = true;
      assign[i] = best;
    }
    /* recompute centroids */
    const sums = centroids.map(() => ({ L: 0, a: 0, b: 0, n: 0 }));
    for (let i = 0; i < pixels.length; i++) {
      const s = sums[assign[i]];
      s.L += pixels[i].L;
      s.a += pixels[i].a;
      s.b += pixels[i].b;
      s.n++;
    }
    centroids.forEach((c, ci) => {
      const s = sums[ci];
      if (s.n > 0) {
        c.L = s.L / s.n;
        c.a = s.a / s.n;
        c.b = s.b / s.n;
      }
    });
    if (!changed && iter > 1) break;
  }

  /* ---- shares, merge duplicates, sort ---- */
  const counts = centroids.map(() => 0);
  for (const a of assign) counts[a]++;
  const totalPixels = pixels.length;

  type Cluster = { lab: Lab; share: number };
  let clusters: Cluster[] = centroids
    .map((lab, i) => ({ lab, share: counts[i] / totalPixels }))
    .filter((c) => c.share > 0.03);

  /* merge centroids closer than ΔE2000 9 */
  clusters = clusters.sort((a, b) => b.share - a.share);
  const merged: Cluster[] = [];
  for (const c of clusters) {
    const dup = merged.find((m) => deltaE2000(m.lab, c.lab) < 9);
    if (dup) dup.share += c.share;
    else merged.push({ ...c });
  }

  return merged
    .sort((a, b) => b.share - a.share)
    .slice(0, k)
    .map((c) => ({
      hex: labToHex(c.lab),
      lab: c.lab,
      share: c.share,
      name: nameColor(labToHex(c.lab)),
      neutral: isNeutral(c.lab),
      warmth: labWarmth(c.lab),
    }));
}

function sqDist(a: Lab, b: Lab): number {
  const dl = a.L - b.L;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return dl * dl + da * da + db * db;
}

function rgbToHexQuick(r: number, g: number, b: number): string {
  const c = (v: number) => v.toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
