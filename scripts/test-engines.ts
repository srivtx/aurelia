/* ============================================================
   Engine math tests (bun-run, no DOM):
     bun scripts/test-engines.ts
   Covers: glow-delta (ΔE, guards, copy) and skin-journal
   (zone metrics, entry guards, trends, milestones).
   ============================================================ */

import {
  buildGlowDelta,
  type GlowPhoto,
  type GlowRegion,
} from "../src/lib/glow-delta";
import {
  buildJournalEntry,
  journalTrends,
  computeZoneMetrics,
  type JournalEntry,
  type JournalZone,
  type ZonePixels,
} from "../src/lib/skin-journal";
import type { PatchSample } from "../src/lib/skin-signature";
import { labToXyz, xyzToRgb } from "../src/lib/color-science";

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const approx = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/* ---------- helpers ---------- */

/** Lab → clamped int RGB patch (what the canvas sampler would hand us) */
function labPatch(L: number, a: number, b: number): PatchSample {
  const rgb = xyzToRgb(labToXyz({ L, a, b }));
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return { r: cl(rgb.r), g: cl(rgb.g), b: cl(rgb.b) };
}

const WHITE: PatchSample = { r: 250, g: 250, b: 250 };

/** deterministic zone pixels: base color + seeded noise (RGBA) */
function makeZone(base: [number, number, number], noise: number, w = 31, h = 31): ZonePixels {
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1; // -1..1
  };
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = Math.max(0, Math.min(255, Math.round(base[0] + rnd() * noise)));
    data[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(base[1] + rnd() * noise)));
    data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(base[2] + rnd() * noise)));
    data[i * 4 + 3] = 255;
  }
  return { w, h, data };
}

/* ---------- 1. Glow Delta ---------- */

console.log("\n── glow-delta engine ──");

{
  const photo = (cheek: [number, number, number], jaw: [number, number, number], forehead: [number, number, number]): GlowPhoto => ({
    ref: WHITE,
    patches: {
      cheek: labPatch(...cheek),
      jaw: labPatch(...jaw),
      forehead: labPatch(...forehead),
    } as Record<GlowRegion, PatchSample>,
  });

  const before = photo([70, 10, 16], [70, 10, 16], [70, 10, 16]);
  const after = photo([71.5, 15.5, 18], [66.5, 10, 16], [73.5, 8.5, 16.5]);

  const r = buildGlowDelta(before, after);

  check("builds ok", r.ok, r.error);
  check("3 regions measured", r.regions.length === 3, `${r.regions.length}`);
  check("cheek redness up (da>3)", r.regions[0].da > 3, `da=${r.regions[0].da.toFixed(2)}`);
  check("jaw darker (dL<-2)", r.regions[1].dL < -2, `dL=${r.regions[1].dL.toFixed(2)}`);
  check("forehead lifted (dL>2)", r.regions[2].dL > 2, `dL=${r.regions[2].dL.toFixed(2)}`);
  check("ΔE2000 visible on cheek", r.regions[0].dE > 2, `dE=${r.regions[0].dE.toFixed(2)}`);
  check("summary glow > 0", r.summary.glow > 0, r.summary.glow.toFixed(2));
  check("summary redness > 0 (redder)", r.summary.redness > 0, r.summary.redness.toFixed(2));
  check("region readings non-empty", r.regions.every((x) => x.reading.length > 20));
  check("headline + verdict present", r.headline.length > 3 && r.verdict.length > 40);
  check("shareText mentions glow delta", r.shareText.toLowerCase().includes("glow delta"));
  check("body-positive framing present", r.verdict.includes("never a fail") || r.verdict.includes("by choice") || r.verdict.includes("measurable"));
}

{
  /* evenness: after-patches converge */
  const before: GlowPhoto = {
    ref: WHITE,
    patches: { cheek: labPatch(66, 12, 16), jaw: labPatch(72, 8, 14), forehead: labPatch(70, 14, 19) } as Record<GlowRegion, PatchSample>,
  };
  const after: GlowPhoto = {
    ref: WHITE,
    patches: { cheek: labPatch(69.5, 11, 16.5), jaw: labPatch(70, 10.5, 16), forehead: labPatch(70, 11, 16.5) } as Record<GlowRegion, PatchSample>,
  };
  const r = buildGlowDelta(before, after);
  check("evenness improves when zones converge", r.ok && r.summary.evennessChange > 15, `evennessChange=${r.summary.evennessChange.toFixed(1)}`);
}

{
  const bad = buildGlowDelta(
    { ref: { r: 60, g: 60, b: 60 }, patches: { cheek: labPatch(70, 10, 16), jaw: labPatch(70, 10, 16), forehead: labPatch(70, 10, 16) } as Record<GlowRegion, PatchSample> },
    { ref: WHITE, patches: { cheek: labPatch(71, 11, 16), jaw: labPatch(71, 11, 16), forehead: labPatch(71, 11, 16) } as Record<GlowRegion, PatchSample> },
  );
  check("dark reference rejected with message", !bad.ok && /white/i.test(bad.error ?? ""), bad.error);
}

{
  const nonSkin = buildGlowDelta(
    { ref: WHITE, patches: { cheek: labPatch(70, 10, 16), jaw: labPatch(70, 10, 16), forehead: labPatch(70, 10, 16) } as Record<GlowRegion, PatchSample> },
    { ref: WHITE, patches: { cheek: { r: 10, g: 200, b: 30 }, jaw: { r: 10, g: 200, b: 30 }, forehead: { r: 10, g: 200, b: 30 } } as Record<GlowRegion, PatchSample> },
  );
  check("non-skin patches rejected", !nonSkin.ok, nonSkin.error);
}

/* ---------- 2. Skin Journal ---------- */

console.log("\n── skin-journal engine ──");

{
  const m = computeZoneMetrics(makeZone([224, 172, 150], 0), WHITE);
  check("uniform zone: evenness ~0", m.evenness < 0.3, `evenness=${m.evenness}`);
  check("uniform zone: texture ~0", m.texture < 0.3, `texture=${m.texture}`);
  check("skin Lab plausible (a 12..20)", m.a > 12 && m.a < 20, `a=${m.a}`);
  check("skin Lab plausible (L 65..78)", m.L > 65 && m.L < 78, `L=${m.L}`);
}

{
  const m = computeZoneMetrics(makeZone([224, 172, 150], 14), WHITE);
  check("noisy zone: evenness > 2", m.evenness > 2, `evenness=${m.evenness}`);
  check("noisy zone: texture > 1", m.texture > 1, `texture=${m.texture}`);
}

{
  const zones: Partial<Record<JournalZone, ZonePixels>> = {
    cheekL: makeZone([224, 172, 150], 6),
    cheekR: makeZone([224, 172, 150], 6),
    forehead: makeZone([224, 172, 150], 6),
  };
  const b = buildJournalEntry(WHITE, zones, ["niacinamide"], "test", "2026-09-01");
  check("entry builds ok", b.ok, b.error);
  check("entry carries actives + date", b.entry?.actives[0] === "niacinamide" && b.entry?.date === "2026-09-01");
  check("entry keeps 3 zones", Object.keys(b.entry?.zones ?? {}).length === 3);
  check("entry id generated", (b.entry?.id ?? "").length > 6);
}

{
  const b = buildJournalEntry({ r: 50, g: 50, b: 50 }, { cheekL: makeZone([224, 172, 150], 4) }, [], undefined, "2026-09-01");
  check("bad reference rejected", !b.ok && /white/i.test(b.error ?? ""), b.error);
  const one = buildJournalEntry(WHITE, { cheekL: makeZone([224, 172, 150], 4) }, [], undefined, "2026-09-01");
  check("single zone rejected (needs ≥2)", !one.ok && /two zones/i.test(one.error ?? ""), one.error);
}

{
  /* trends: 3 weekly entries, cheek redness falling */
  const mk = (date: string, a: number): JournalEntry => ({
    id: `t-${date}`,
    date,
    calibrated: true,
    zones: { cheekR: { L: 70, a, b: 16, evenness: 7, texture: 12 }, forehead: { L: 68, a: 10, b: 15, evenness: 6, texture: 10 } },
    actives: ["niacinamide"],
  });
  const entries = [mk("2026-08-26", 18), mk("2026-09-02", 15), mk("2026-09-09", 12)];
  const s = journalTrends(entries);

  const red = s.trends.find((t) => t.zone === "cheekR" && t.metric === "redness");
  check("redness trend exists", Boolean(red));
  check("redness trending down", red?.direction === "down");
  check("redness improving flag", red?.improving === true);
  check("redness change ≈ -33%", approx(red?.changePct ?? 0, -33.3, 1.5), `changePct=${red?.changePct}`);
  check("slope per week ≈ -3", approx(red?.slopePerWeek ?? 0, -3, 0.2), `slope=${red?.slopePerWeek}`);
  check("weeks = 2", s.weeks === 2, `${s.weeks}`);
  check("milestone mentions niacinamide", s.milestones.some((m) => /niacinamide/i.test(m)), JSON.stringify(s.milestones));
  check("milestone says redness down", s.milestones.some((m) => /redness is down/i.test(m)));
  check("best zone present", Boolean(s.bestStreakZone));
}

{
  /* flat + single entry edge cases */
  const flat = journalTrends([
    { id: "a", date: "2026-09-01", calibrated: true, zones: { cheekR: { L: 70, a: 10, b: 15, evenness: 5, texture: 9 } }, actives: [] },
    { id: "b", date: "2026-09-08", calibrated: true, zones: { cheekR: { L: 70.2, a: 10.1, b: 15, evenness: 5.1, texture: 9.05 } }, actives: [] },
  ]);
  const red = flat.trends.find((t) => t.metric === "redness");
  check("flat change is flat", red?.direction === "flat", red?.direction);
  const empty = journalTrends([]);
  check("empty journal handled", empty.entries === 0 && empty.trends.length === 0 && empty.milestones.length === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
