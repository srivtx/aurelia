/* quick calibration: synthetic hair patches → curl classifier */
import { curlMetrics, classifyIndex, curlPatchUsable, classifyCurlFromPatches } from "../src/lib/curl-classifier";
import type { ZonePixels } from "../src/lib/skin-journal";

let seed = 42;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const DARK = [58, 44, 32] as const;
const LIGHT = [126, 96, 68] as const;

function patchFromFn(fn: (x: number, y: number) => number, w = 61, h = 61): ZonePixels {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = Math.max(0, Math.min(1, fn(x, y)));
      const i = (y * w + x) * 4;
      data[i] = DARK[0] + t * (LIGHT[0] - DARK[0]);
      data[i + 1] = DARK[1] + t * (LIGHT[1] - DARK[1]);
      data[i + 2] = DARK[2] + t * (LIGHT[2] - DARK[2]);
      data[i + 3] = 255;
    }
  }
  return { w, h, data };
}

/* smooth transition between bands: t = triangle wave 0..1 */
const tri = (v: number) => Math.abs(((v % 2) + 2) % 2 - 1);

const patterns: { name: string; px: ZonePixels }[] = [
  { name: "straight (bands period 22, horizontal)", px: patchFromFn((x, y) => tri((y + (rnd() - 0.5) * 2) / 11)) },
  { name: "wavy (bands period 13 + sine amp 7)", px: patchFromFn((x, y) => tri((y + 7 * Math.sin(x / 7)) / 6.5)) },
  { name: "curly (bands period 8 + double sine)", px: patchFromFn((x, y) => tri((y + 5 * Math.sin(x / 3.2) + 4 * Math.sin(x / 1.9)) / 4)) },
  { name: "coily (2px speckle blocks)", px: patchFromFn((x, y) => (Math.floor(x / 2) * 31 + Math.floor(y / 2) * 17) % 2) },
  { name: "flat (no texture)", px: patchFromFn(() => 0.5) },
];

for (const p of patterns) {
  const g = curlPatchUsable(p.px);
  const m = curlMetrics(p.px);
  const c = classifyIndex(m.curlIndex);
  console.log(
    `${p.name}\n  usable=${g.ok}${g.error ? " (" + g.error.slice(0, 40) + ")" : ""}  coherence=${m.coherence}  ridgeFreq=${m.ridgeFreq}  edge=${m.edgeDensity}  index=${m.curlIndex} → ${c.pattern} (conf ${c.confidence})`,
  );
}

console.log("\nmulti-patch (2 straight patches):");
const r = classifyCurlFromPatches([patterns[0].px, patterns[0].px]);
console.log(r.ok && r.result ? `  → ${r.result.pattern} index=${r.result.curlIndex} conf=${r.result.confidence}` : `  ERROR: ${r.error}`);

console.log("\nmulti-patch (1 straight + 1 coily — disagreement):");
const r2 = classifyCurlFromPatches([patterns[0].px, patterns[3].px]);
console.log(r2.ok && r2.result ? `  → ${r2.result.pattern} conf=${r2.result.confidence} warning=${r2.warning}` : `  ERROR: ${r2.error}`);
