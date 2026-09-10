/* ============================================================
   Engine math tests (bun-run, no DOM):
     bun scripts/test-engines.ts
   Covers: glow-delta (ΔE, guards, copy), skin-journal (zone
   metrics incl. gloss/hydration proxy, entry guards, trends,
   milestones), curl-classifier (texture math, guards, class
   mapping, data integrity) and outfit diagnosis (leave-one-out,
   swap search).
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
import {
  curlMetrics,
  curlPatchUsable,
  classifyCurlFromPatches,
  classifyIndex,
  type CurlPatternId,
} from "../src/lib/curl-classifier";
import { analyzeOutfit, diagnoseOutfit } from "../src/lib/outfit-engine";
import { curlPatterns, curlPatternById } from "../src/data/curl-patterns";
import { masterStyles } from "../src/data/hair";
import type { PatchSample } from "../src/lib/skin-signature";
import { labToXyz, xyzToRgb } from "../src/lib/color-science";
import {
  splitInci,
  normalizeToken,
  editDistance,
  matchToken,
  scanLabel,
  scanHeadline,
  suggestRoutine,
} from "../src/lib/label-scan";

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
  const mk = (date: string, a: number, gloss: number): JournalEntry => ({
    id: `t-${date}`,
    date,
    calibrated: true,
    zones: {
      cheekR: { L: 70, a, b: 16, evenness: 7, texture: 12, gloss },
      forehead: { L: 68, a: 10, b: 15, evenness: 6, texture: 10, gloss: 0.05 },
    },
    actives: ["niacinamide"],
  });
  const entries = [mk("2026-08-26", 18, 0.04), mk("2026-09-02", 15, 0.06), mk("2026-09-09", 12, 0.09)];
  const s = journalTrends(entries);

  const red = s.trends.find((t) => t.zone === "cheekR" && t.metric === "redness");
  check("redness trend exists", Boolean(red));
  check("redness trending down", red?.direction === "down");
  check("redness improving flag", red?.improving === true);
  check("redness change ≈ -33%", approx(red?.changePct ?? 0, -33.3, 1.5), `changePct=${red?.changePct}`);
  check("slope per week ≈ -3", approx(red?.slopePerWeek ?? 0, -3, 0.2), `slope=${red?.slopePerWeek}`);
  check("weeks = 2", s.weeks === 2, `${s.weeks}`);
  check("milestone mentions niacinamide", s.milestones.some((m) => /niacinamide/i.test(m)), JSON.stringify(s.milestones));
  check("milestone says redness down", s.trends.length > 0 && s.milestones.some((m) => /redness is down/i.test(m)));
  check("gloss trend exists (cheekR)", s.trends.some((t) => t.zone === "cheekR" && t.metric === "gloss" && t.direction === "up" && t.improving));
  check("gloss milestone (hydration proxy)", s.milestones.some((m) => /gloss is up/i.test(m)), JSON.stringify(s.milestones));
  check("best zone present", Boolean(s.bestStreakZone));
}

{
  /* flat + single entry edge cases — gloss absent (legacy entries) */
  const flat = journalTrends([
    { id: "a", date: "2026-09-01", calibrated: true, zones: { cheekR: { L: 70, a: 10, b: 15, evenness: 5, texture: 9 } }, actives: [] },
    { id: "b", date: "2026-09-08", calibrated: true, zones: { cheekR: { L: 70.2, a: 10.1, b: 15, evenness: 5.1, texture: 9.05 } }, actives: [] },
  ]);
  const red = flat.trends.find((t) => t.metric === "redness");
  check("flat change is flat", red?.direction === "flat", red?.direction);
  check("legacy entries (no gloss) skip gloss trend", !flat.trends.some((t) => t.metric === "gloss"));
  const empty = journalTrends([]);
  check("empty journal handled", empty.entries === 0 && empty.trends.length === 0 && empty.milestones.length === 0);
}

/* ---------- 3. Hydration proxy (gloss — Soh 2025) ---------- */

console.log("\n── hydration proxy (gloss) ──");

{
  /* matte zone: uniform skin + noise */
  const matte = computeZoneMetrics(makeZone([224, 172, 150], 8), WHITE);
  /* shiny zone: same base, but 15% of pixels pushed to a bright desaturated specular */
  const shiny = makeZone([224, 172, 150], 8);
  const n = shiny.w * shiny.h;
  let painted = 0;
  for (let i = 0; i < n && painted < Math.floor(n * 0.15); i += 7) {
    shiny.data[i * 4] = 250;
    shiny.data[i * 4 + 1] = 246;
    shiny.data[i * 4 + 2] = 240;
    painted++;
  }
  const glossy = computeZoneMetrics(shiny, WHITE);
  const gl = matte.gloss ?? 0;
  check("matte zone gloss is low", gl < 0.08, `gloss=${matte.gloss}`);
  check("specular zone gloss much higher", glossy.gloss! > gl * 2 && glossy.gloss! > 0.08, `gloss=${glossy.gloss}`);
  check("gloss is a fraction (0..1)", (glossy.gloss ?? 0) >= 0 && (glossy.gloss ?? 0) <= 1);
  check("gloss does not disturb redness much", Math.abs(glossy.a - (matte.a ?? 0)) < 4, `a ${matte.a} → ${glossy.a}`);
}

/* ---------- 4. Curl classifier (Texture Lab) ---------- */

console.log("\n── curl-classifier engine ──");

/* deterministic synthetic hair patches (dark strands on light) */
let cseed = 42;
const crnd = () => {
  cseed = (cseed * 1103515245 + 12345) & 0x7fffffff;
  return cseed / 0x7fffffff;
};
const DARK: [number, number, number] = [58, 44, 32];
const LIGHT: [number, number, number] = [126, 96, 68];
function hairPatch(fn: (x: number, y: number) => number, w = 61, h = 61): ZonePixels {
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
const tri = (v: number) => Math.abs(((v % 2) + 2) % 2 - 1);
const PATCH_STRAIGHT = hairPatch((x, y) => tri((y + (crnd() - 0.5) * 2) / 11));
const PATCH_WAVY = hairPatch((x, y) => tri((y + 7 * Math.sin(x / 7)) / 6.5));
const PATCH_CURLY = hairPatch((x, y) => tri((y + 5 * Math.sin(x / 3.2) + 4 * Math.sin(x / 1.9)) / 4));
const PATCH_COILY = hairPatch((x, y) => ((Math.floor(x / 2) * 31 + Math.floor(y / 2) * 17) % 2));
const PATCH_FLAT = hairPatch(() => 0.5);

{
  const straight = curlMetrics(PATCH_STRAIGHT);
  check("straight: high coherence", straight.coherence > 0.8, `coherence=${straight.coherence}`);
  check("straight: low ridge frequency", straight.ridgeFreq < 0.06, `freq=${straight.ridgeFreq}`);
  const wavy = curlMetrics(PATCH_WAVY);
  const curly = curlMetrics(PATCH_CURLY);
  const coily = curlMetrics(PATCH_COILY);
  check("curl index is monotonic straight < wavy < curly < coily", straight.curlIndex < wavy.curlIndex && wavy.curlIndex < curly.curlIndex && curly.curlIndex < coily.curlIndex, [straight.curlIndex, wavy.curlIndex, curly.curlIndex, coily.curlIndex].join(" < "));
  check("straight classifies Type 1", classifyCurlFromPatches([PATCH_STRAIGHT]).result?.pattern === "1");
  check("wavy classifies family wavy (2A–2C)", ["2A", "2B", "2C"].includes(classifyCurlFromPatches([PATCH_WAVY]).result?.pattern ?? ""));
  check("curly classifies family curly (3A–3C)", ["3A", "3B", "3C"].includes(classifyCurlFromPatches([PATCH_CURLY]).result?.pattern ?? ""));
  check("coily classifies family coily (4A–4C)", ["4A", "4B", "4C"].includes(classifyCurlFromPatches([PATCH_COILY]).result?.pattern ?? ""));
  check("coily coherence collapses", curlMetrics(PATCH_COILY).coherence < 0.1, `coherence=${curlMetrics(PATCH_COILY).coherence}`);
}

{
  const flat = curlPatchUsable(PATCH_FLAT);
  check("flat patch rejected", !flat.ok && /flat|strands/i.test(flat.error ?? ""), flat.error);
  /* near-black / blown-out raw patches (the luma guards, not the texture guard) */
  const solid = (v: number): ZonePixels => {
    const data = new Uint8ClampedArray(31 * 31 * 4);
    for (let i = 0; i < 31 * 31; i++) {
      data[i * 4] = v; data[i * 4 + 1] = v; data[i * 4 + 2] = v; data[i * 4 + 3] = 255;
    }
    return { w: 31, h: 31, data };
  };
  const dark = curlPatchUsable(solid(12));
  check("too-dark patch rejected", !dark.ok && /light|black/i.test(dark.error ?? ""), dark.error);
  const blown = curlPatchUsable(solid(250));
  check("blown-out patch rejected", !blown.ok && /glare|blown/i.test(blown.error ?? ""), blown.error);
}

{
  const two = classifyCurlFromPatches([PATCH_STRAIGHT, PATCH_STRAIGHT]);
  check("two agreeing patches: high confidence", two.ok && (two.result?.confidence ?? 0) > 0.8, `conf=${two.result?.confidence}`);
  const mixed = classifyCurlFromPatches([PATCH_STRAIGHT, PATCH_COILY]);
  check("disagreeing patches: warning fires", mixed.ok && typeof mixed.warning === "string", mixed.warning);
  check("disagreeing patches: confidence discounted", (mixed.result?.confidence ?? 1) < (two.result?.confidence ?? 0), `${mixed.result?.confidence} < ${two.result?.confidence}`);
  const one = classifyCurlFromPatches([PATCH_FLAT]);
  check("all-flat input: error, no guess", !one.ok && Boolean(one.error), one.error);
}

{
  /* boundary mapping + data integrity */
  check("index 0 → Type 1", classifyIndex(0).pattern === "1");
  check("index 100 → 4C", classifyIndex(100).pattern === "4C");
  check("all 10 pattern ids in data, lookup round-trips", curlPatterns.length === 10 && curlPatterns.every((p) => curlPatternById(p.id).id === p.id));
  check("every pattern has 3 style matches that exist", curlPatterns.every((p) => p.styles.length === 3 && p.styles.every((s) => masterStyles.some((m) => m.id === s.id))));
  check("every pattern care plan complete", curlPatterns.every((p) => [p.care.wash, p.care.moisture, p.care.styling, p.care.ingredients, p.care.night].every((t) => t.length > 40)));
  const ids: CurlPatternId[] = ["1", "2A", "3B", "4C"];
  check("pattern lookup never misses", ids.every((i) => curlPatternById(i).id === i));
}

/* ---------- 5. Outfit diagnosis (leave-one-out) ---------- */

console.log("\n── outfit diagnosis engine ──");

{
  /* 2 colors: no diagnosis possible */
  const d2 = diagnoseOutfit(["#EFE6D8", "#22333B"]);
  check("<3 colors → empty diagnosis", d2.items.length === 0 && d2.weakest === null && d2.swap === null);
}

{
  /* clashing trio: one piece weakens, a swap fixes it */
  const colors = ["#EFE6D8", "#22333B", "#D08C60"];
  const full = analyzeOutfit(colors).score;
  const d = diagnoseOutfit(colors);
  check("3 colors → 3 item rows", d.items.length === 3);
  check("weakest has negative contribution", d.weakest !== null && d.weakest.contribution < 0, `c=${d.weakest?.contribution}`);
  check("weakest is the min contribution", d.items.every((it) => (d.weakest ? it.contribution >= d.weakest.contribution : true)));
  check("leave-one-out math is exact", d.items.every((it, i) => {
    const without = analyzeOutfit(colors.filter((_, j) => j !== i), null).score;
    return approx(full - without, it.contribution, 0.001);
  }));
  check("swap found and predicts a gain", d.swap !== null && d.swap.predictedScore > full && d.swap.gain > 0, `swap=${d.swap?.name} ${full}→${d.swap?.predictedScore}`);
  if (d.swap && d.weakest) {
    const trial = colors.map((c) => (c === d.weakest!.hex ? d.swap!.hex : c));
    check("swap prediction is deterministic (recomputed = reported)", analyzeOutfit(trial).score === d.swap.predictedScore);
    check("swap never suggests a worn color", !colors.includes(d.swap.hex));
  }
  check("team-effort trio: no weakening item → no swap", (() => {
    const t = diagnoseOutfit(["#F2E8DC", "#8C1C13", "#D4A373"]);
    return (t.weakest?.contribution ?? 0) >= 0 && t.swap === null;
  })());
}

/* ---------- 5. Label Scan engine ---------- */

console.log("\n── label-scan engine ──");
{
  /* splitter + normalizer */
  check("normalizeToken strips bullets, numbering, %, ™", normalizeToken("1. Niacinamide 4%™") === "niacinamide 4".replace(" 4", "") || normalizeToken("1. Niacinamide 4%™") === "niacinamide", normalizeToken("1. Niacinamide 4%™"));
  check("normalizeToken lowercases + trims parens (digits drop)", normalizeToken("  Alcohol Denat. (SD Alcohol 40) ") === "alcohol denat. sd alcohol", normalizeToken("  Alcohol Denat. (SD Alcohol 40) "));
  const parts = splitInci("Ingredients: Aqua, Glycerin, Niacinamide, Salicylic Acid.\nMay contain: Fragrance");
  check("splitInci drops the header line and splits", parts.includes("niacinamide") && parts.includes("salicylic acid") && parts.includes("aqua") && parts.includes("glycerin"), JSON.stringify(parts));
  check("splitInci keeps may-contain tokens", parts.includes("fragrance"));
  check("splitInci drops junk short tokens", !parts.some((p) => p.length < 3));

  /* edit distance sanity */
  check("editDistance exact = 0", editDistance("niacinamide", "niacinamide", 2) === 0);
  check("editDistance counts substitutions", editDistance("niacinamice", "niacinamide", 2) === 1, String(editDistance("niacinamice", "niacinamide", 2)));
  check("editDistance early-exits over max", editDistance("abc", "xyzabcxyz", 1) === 2);

  /* matcher — exact, family, fuzzy */
  check("matchToken exact: ascorbic acid → vitamin-c", matchToken("ascorbic acid")?.kind === "active" && matchToken("ascorbic acid")?.id === "vitamin-c");
  check("matchToken exact: sodium hyaluronate → hyaluronic", matchToken("sodium hyaluronate")?.id === "hyaluronic");
  check("matchToken family: hydroxypropyltrimonium hyaluronate via contains", matchToken("hydroxypropyltrimonium hyaluronate")?.id === "hyaluronic" && matchToken("hydroxypropyltrimonium hyaluronate")?.confidence === "family");
  check("matchToken family: palmitoyl tripeptide-1 → peptides", matchToken("palmitoyl tripeptide-1")?.id === "peptides");
  check("matchToken family: ceramide np → ceramides", matchToken("ceramide np")?.id === "ceramides");
  check("matchToken family: ethylhexyl methoxycinnamate → spf", matchToken("ethylhexyl methoxincinnamate")?.id === "spf" || matchToken("ethylhexyl methoxycinnamate")?.id === "spf", JSON.stringify(matchToken("ethylhexyl methoxycinnamate")));
  check("matchToken fuzzy: niacinamicle → niacinamide", matchToken("niacinamicle")?.id === "niacinamide" && matchToken("niacinamicle")?.confidence === "fuzzy", JSON.stringify(matchToken("niacinamicle")));
  check("matchToken fuzzy: retin0l (OCR zero) → retinol", matchToken("retin0l")?.id === "retinol", JSON.stringify(matchToken("retin0l")));
  check("matchToken rejects unrelated words", matchToken("phenoxyethanol") === null, JSON.stringify(matchToken("phenoxyethanol")));
  check("matchToken flag: parfum", matchToken("parfum")?.kind === "flag" && matchToken("parfum")?.flagKind === "fragrance");
  check("matchToken flag: linalool → fragrance allergen", matchToken("linalool")?.flagKind === "fragrance");
  check("matchToken flag: alcohol denat → drying alcohol", matchToken("alcohol denat")?.flagKind === "alcohol");
  check("matchToken flag: lavender oil → essential oil", matchToken("lavender oil")?.flagKind === "essential-oil");
  check("glycerin doesn't match anything", matchToken("glycerin") === null);

  /* full scan: product benzoyl × her retinol */
  const bpLabel = "Aqua, Benzoyl Peroxide 2.5%, Alcohol Denat., Parfum, Hydroxyethylcellulose";
  const bp = scanLabel(bpLabel, ["retinol"]);
  check("BP scan finds benzoyl", bp.matched.some((m) => m.id === "benzoyl"));
  check("BP × retinol flagged (warn, product-vs-routine)", bp.conflicts.some(
    (c) => [c.aid, c.bid].sort().join("|") === "benzoyl|retinol" && c.severity === "warn" && c.scope === "product-vs-routine",
  ), JSON.stringify(bp.conflicts));
  check("BP scan flags alcohol + fragrance", bp.flags.some((f) => f.kind === "alcohol") && bp.flags.some((f) => f.kind === "fragrance"));
  check("BP scan status careful", bp.status === "careful");

  /* full scan: avoid-severity pair + inside-product scope */
  const toxicDuo = scanLabel("Aqua, Ascorbic Acid, Benzoyl Peroxide, Glycerin", []);
  check("vitamin-c × benzoyl inside product = avoid", toxicDuo.conflicts.some(
    (c) => c.severity === "avoid" && c.scope === "inside-product",
  ), JSON.stringify(toxicDuo.conflicts));
  check("toxic duo status conflict", toxicDuo.status === "conflict");
  check("her-routine-internal pairs are filtered out", scanLabel("Aqua, Niacinamide", ["retinol", "niacinamide"]).conflicts.every(
    (c) => c.scope !== "inside-product" || c.aid !== "retinol",
  ));

  /* dedup + new-actives + no-routine behavior */
  const dup = scanLabel("Aqua, Salicylic Acid, Betaine Salicylate, Willow Bark", []);
  check("duplicate active ids deduped", dup.matched.filter((m) => m.id === "bha").length === 1);
  check("newActives = matched when routine empty", dup.newActives.length === dup.matched.length);
  check("newActives excludes owned actives", scanLabel("Aqua, Retinol", ["retinol"]).newActives.length === 0);
  check("empty text → empty result, status clear", scanLabel("", []).ingredients.length === 0 && scanLabel("", []).status === "clear");
  check("junk ids in myActives are ignored", scanLabel("Aqua, Retinol", ["not-a-real-active"]).newActives.length === 1);

  /* synergy surfacing */
  const syn = scanLabel("Aqua, Niacinamide, Sodium Hyaluronate", ["retinol"]);
  check("product niacinamide × her retinol synergy surfaces", syn.synergies.some(
    (s) => s.scope === "product-vs-routine" && /niacinamide/i.test(s.a + s.b) && /retinol/i.test(s.a + s.b),
  ), JSON.stringify(syn.synergies));

  /* headline copy */
  check("headline: conflict wording", scanHeadline(toxicDuo, 0).title === "Heads up before you buy");
  check("headline: no-match wording", scanHeadline(scanLabel("Aqua, Glycerin, Xanthan Gum", []), 0).title === "No familiar actives found");
  check("headline: clear with routine", scanHeadline(scanLabel("Aqua, Niacinamide", ["niacinamide"]), 1).title === "Plays well with your routine");

  /* routine suggestions from journal */
  check("suggestRoutine counts journal frequency", suggestRoutine([
    ["niacinamide"], ["niacinamide", "retinol"], ["niacinamide"],
  ])[0] === "niacinamide");
  check("suggestRoutine caps at 3 and drops junk", suggestRoutine([["retinol", "junk-id"], ["spf"], ["bha"], ["hyaluronic"]]).length === 3);

  /* determinism */
  const a1 = JSON.stringify(scanLabel(bpLabel, ["retinol"]));
  const a2 = JSON.stringify(scanLabel(bpLabel, ["retinol"]));
  check("scanLabel is deterministic", a1 === a2);
}

/* ---------- 6. Oxidation engine (Mirror Test V2) ---------- */

{
  console.log("\n── oxidation engine ──");
  const { oxidationVerdict, formulaOxidation } = await import("../src/lib/oxidation");
  const { predictOnSkin, matchShade } = await import("../src/lib/shade-match");
  const { hexToLab, labToHex } = await import("../src/lib/color-science");

  /* plausible measured skin: L 64, warm-neutral */
  const skin = { L: 64, a: 13, b: 17 };
  /* warm-leaning foundation shade (orange lean: high b vs a) */
  const warmShade = hexToLab("#E8C4A0");
  /* cool-leaning shade */
  const coolShade = hexToLab("#E8C8D0");
  const pred = predictOnSkin(skin, warmShade, "foundation");

  const high = oxidationVerdict(skin, warmShade, "foundation", pred, 0.85);
  const low = oxidationVerdict(skin, coolShade, "lip", predictOnSkin(skin, coolShade, "lip"), 0.25);

  check("oily+warm+foundation scores high", high.risk === "high", `score=${high.score}`);
  check("dry+cool+lip scores low", low.risk === "low", `score=${low.score}`);
  check("score bounds 0-100", high.score >= 0 && high.score <= 100 && low.score >= 0 && low.score <= 100);

  /* the one-hour simulation: darker + warmer */
  check("post-oxidation is darker (L drops)", high.postOxidation.L < pred.L, `dL=${(high.postOxidation.L - pred.L).toFixed(2)}`);
  check("post-oxidation is warmer (b rises)", high.postOxidation.b > pred.b, `db=${(high.postOxidation.b - pred.b).toFixed(2)}`);
  check("low risk shifts less than high risk", Math.abs(low.shiftL) < Math.abs(high.shiftL));
  check("shiftL is negative, shiftHue positive on high", high.shiftL < 0 && high.shiftHue > 0);
  check("drift visibility is a positive ΔE", high.shiftVisibility > 0);

  /* counter-move only when it matters, and it's lighter + cooler */
  check("high risk gets a counter-shade", high.counterHex !== null);
  check("low risk gets no counter-shade", low.counterHex === null);
  if (high.counterHex) {
    const counter = hexToLab(high.counterHex);
    check("counter-shade is lighter than the original", counter.L > warmShade.L, `dL=${(counter.L - warmShade.L).toFixed(2)}`);
    check("counter-shade is cooler (lower hue)", counter.b / (Math.abs(counter.a) + 1e-9) < warmShade.b / (Math.abs(warmShade.a) + 1e-9) || hexToLab(high.counterHex).b < warmShade.b);
    check("counter-shade is a valid hex", /^#[0-9A-F]{6}$/i.test(high.counterHex));
  }

  /* drivers + copy */
  check("drivers explain the chemistry (3 rows)", high.drivers.length === 3);
  check("drivers mention sebum for oily skin", high.drivers[0].label.toLowerCase().includes("skin"));
  check("chemistry names the mechanism", /sebum.*iron|iron.*sebum/i.test(high.chemistry));
  check("headline copy present", high.headline.length > 3 && low.headline.length > 3);
  check("note copy present", high.note.length > 40);

  /* kind propensity ordering */
  const fnd = oxidationVerdict(skin, warmShade, "foundation", predictOnSkin(skin, warmShade, "foundation"), 0.7);
  const lip = oxidationVerdict(skin, warmShade, "lip", predictOnSkin(skin, warmShade, "lip"), 0.7);
  check("foundation outranks lip at same inputs", fnd.score > lip.score, `fnd=${fnd.score} lip=${lip.score}`);

  /* matchShade still exposes the compat oxidation field via the shared engine */
  const mv = matchShade(skin, warmShade, "foundation", 0.85);
  check("matchShade.oxidation matches the engine risk", mv.oxidation.risk === high.risk);

  /* determinism */
  const o1 = JSON.stringify(oxidationVerdict(skin, warmShade, "foundation", pred, 0.85));
  const o2 = JSON.stringify(oxidationVerdict(skin, warmShade, "foundation", pred, 0.85));
  check("oxidationVerdict is deterministic", o1 === o2);

  /* formula read from INCI tokens */
  const iron = formulaOxidation(["aqua", "ci 77491", "dimethicone", "glycerin"]);
  check("iron oxides detected", iron !== null && iron.matched.includes("ci 77491"));
  check("iron oxides → propensity ≥ 0.55", iron !== null && iron.propensity >= 0.55);
  const vitc = formulaOxidation(["aqua", "ascorbic acid", "glycerin"]);
  check("vitamin C detected", vitc !== null && vitc.matched.includes("ascorbic acid"));
  check("iron + vitc stacks propensity", (formulaOxidation(["ci 77492", "ascorbic acid"])?.propensity ?? 0) > (iron?.propensity ?? 0));
  check("benzoyl peroxide detected", formulaOxidation(["aqua", "benzoyl peroxide"]) !== null);
  check("clean list returns null", formulaOxidation(["aqua", "glycerin", "xanthan gum"]) === null);
  check("formula notes are human sentences", (iron?.notes[0].length ?? 0) > 40);
  /* CI codes survive via raw text even though the tokenizer strips digits */
  const splitIron = splitInci("Aqua, Niacinamide, CI 77491, Dimethicone");
  check("tokenizer strips CI digits (known behavior)", !splitIron.includes("ci 77491"));
  const viaRaw = formulaOxidation(splitIron, "Aqua, Niacinamide, CI 77491, Dimethicone");
  check("CI 77491 caught from raw text", viaRaw !== null && viaRaw.propensity >= 0.55);
  check("raw-text iron note names the pigment family", /iron/i.test(viaRaw?.notes[0] ?? ""));

  /* the compat surface: labToHex round-trips through the engine (sanity) */
  check("labToHex works on predicted Lab", /^#[0-9A-F]{6}$/i.test(labToHex(pred)));
}

/* ---------- 7. Shelf engine (Mirror Test V4) ---------- */

{
  console.log("\n── shelf engine ──");
  const { paoStatus, findDuplicates, costPerUse, shelfSummary, buildShelfItem, SHELF_MAX_ITEMS } =
    await import("../src/lib/shelf");
  const { paoById, paoCategories } = await import("../src/data/pao");

  const TODAY = "2026-09-10";

  const mk = (over: Partial<ReturnType<typeof buildShelfItem> & object>): ReturnType<typeof buildShelfItem> => ({
    id: "x", name: "Product", category: "serum", addedOn: "2026-06-01",
    openedOn: null, price: null, usesPerWeek: null, swatchHex: null, activeId: null, scanned: false,
    ...over,
  });

  /* PAO math */
  const sealed = mk({ name: "Sealed serum" });
  check("sealed item: unopened, no countdown", paoStatus(sealed, TODAY).state === "unopened" && paoStatus(sealed, TODAY).daysLeft === null);
  check("sealed label mentions the clock starting", /sealed/i.test(paoStatus(sealed, TODAY).label));

  const opened7m = mk({ name: "Old serum", openedOn: "2025-08-01" }); /* serum = 12M → expires 2026-08-01 */
  const st7 = paoStatus(opened7m, TODAY);
  check("opened 13 months of a 12M PAO is expired", st7.state === "expired", JSON.stringify(st7));
  check("expired daysLeft is negative", (st7.daysLeft ?? 0) < 0);

  const opened0m = mk({ name: "New serum", openedOn: "2026-09-01" }); /* 12M → 2027-09-01 */
  const st0 = paoStatus(opened0m, TODAY);
  check("freshly opened is fresh", st0.state === "fresh");
  check("fresh label reads months", /month/i.test(st0.label));
  check("fresh pct is high", (st0.pct ?? 0) > 95);

  const soon = mk({ name: "Expiring mascara", category: "mascara", openedOn: "2026-03-20" }); /* 6M → 2026-09-20 */
  const stS = paoStatus(soon, TODAY);
  check("mascara 10 days before expiry = expiring-soon", stS.state === "expiring-soon", JSON.stringify(stS));
  check("expiring-soon window is ≤ 30 days", (stS.daysLeft ?? 0) <= 30 && (stS.daysLeft ?? 0) >= 0);
  check("expiring label reads weeks", /week/i.test(stS.label));

  /* calendar-month edge: Jan 31 + 1M = Feb 28 */
  const jan = mk({ category: "mascara", openedOn: "2026-01-31" }); /* 6M from Jan 31 */
  const stJan = paoStatus(jan, "2026-02-01");
  check("Jan 31 + 1M lands on Feb 28/29 (no crash)", stJan.expiresOn === null || /^\d{4}-\d{2}-\d{2}$/.test(stJan.expiresOn));
  check("junk date degrades gracefully", paoStatus(mk({ openedOn: "not-a-date" }), TODAY).daysLeft === null);

  /* category data integrity */
  check("PAO categories: 15 shipped + fallback", paoCategories.length >= 14);
  check("every category has plausible PAO (3-36 months)", paoCategories.every((c) => c.paoMonths >= 3 && c.paoMonths <= 36));
  check("unknown category falls back to 12M generic", paoById("nope").paoMonths === 12 && paoById("nope").id === "other");
  check("paoStatus uses fallback for junk category", paoStatus(mk({ category: "junk-cat" }), TODAY).months === 12);

  /* duplicates: shade twins (ΔE2000 < 5, same category) */
  const berryA = mk({ id: "a", name: "Berry 01", category: "lipstick", swatchHex: "#B05479" });
  const berryB = mk({ id: "b", name: "Berry 02", category: "lipstick", swatchHex: "#B3567B" }); /* near-identical */
  const berryC = mk({ id: "c", name: "Berry 03", category: "lipstick", swatchHex: "#8E2A52" }); /* clearly different */
  const berryD = mk({ id: "d", name: "Berry 04", category: "blush-powder", swatchHex: "#B05479" }); /* same color, other category */
  const dups = findDuplicates([berryA, berryB, berryC, berryD]);
  check("near-identical berry detected (ΔE < 5)", dups.some((d) => d.aId === "a" && d.bId === "b" && d.basis === "shade"));
  check("visually different shade NOT a duplicate", !dups.some((d) => (d.aId === "a" && d.bId === "c") || (d.aId === "b" && d.bId === "c")));
  check("same swatch in another category NOT a duplicate", !dups.some((d) => (d.aId === "a" && d.bId === "d")));
  check("duplicate message is a human sentence", (dups.find((d) => d.basis === "shade")?.message.length ?? 0) > 40);

  /* duplicates: active twins (same activeId + category, no swatches) */
  const retA = mk({ id: "r1", name: "Retinol A", category: "serum", activeId: "retinol" });
  const retB = mk({ id: "r2", name: "Retinol B", category: "serum", activeId: "retinol" });
  const retC = mk({ id: "r3", name: "Retinol C", category: "moisturizer", activeId: "retinol" });
  const retD = mk({ id: "r4", name: "Niacinamide", category: "serum", activeId: "niacinamide" });
  const actDups = findDuplicates([retA, retB, retC, retD]);
  check("same active + same category = active twin", actDups.some((d) => d.aId === "r1" && d.bId === "r2" && d.basis === "active"));
  check("same active, different category NOT a twin", !actDups.some((d) => (d.aId === "r1" && d.bId === "r3")));
  check("different active NOT a twin", !actDups.some((d) => (d.aId === "r1" && d.bId === "r4")));

  /* cost per use */
  const pricey = mk({ name: "Serum", category: "serum", price: 48, usesPerWeek: 7 }); /* 12M × 4.33 × 7 ≈ 364 uses */
  const cpu = costPerUse(pricey);
  check("cost-per-use computed", cpu !== null && cpu.perUse > 0 && cpu.perUse < 1);
  check("cost-per-use null without price", costPerUse(mk({ usesPerWeek: 7 })) === null);
  check("cost-per-use null without uses", costPerUse(mk({ price: 48 })) === null);

  /* summary */
  const shelf = [opened7m, soon, sealed, berryA, berryB];
  const sum = shelfSummary(shelf, TODAY);
  check("summary counts total", sum.total === 5);
  check("summary counts expired", sum.expired === 1);
  check("summary counts expiring-soon", sum.expiringSoon === 1);
  check("summary counts duplicates", sum.duplicates === 1);
  check("summary counts open", sum.open === 2);
  check("headline mentions the problems", sum.headline.includes("past PAO") && sum.headline.includes("expiring soon"));
  check("share text exists", sum.shareText.length > 20);
  check("empty shelf summary is graceful", shelfSummary([], TODAY).total === 0 && shelfSummary([], TODAY).headline.includes("empty"));

  /* buildShelfItem sanitization */
  const built = buildShelfItem(
    { name: "  Great Serum  ", category: "serum", price: 24.999, usesPerWeek: 99, swatchHex: "#a84a62", openedOn: "2026-09-01", activeId: "retinol", scanned: true },
    "id-1", "2026-09-10",
  );
  check("buildShelfItem trims + caps name", built.name === "Great Serum");
  check("buildShelfItem rounds price", built.price === 25);
  check("buildShelfItem caps uses/week at 70", built.usesPerWeek === 70);
  check("buildShelfItem uppercases swatch", built.swatchHex === "#A84A62");
  check("buildShelfItem keeps valid openedOn", built.openedOn === "2026-09-01");
  const junk = buildShelfItem({ name: "", category: "junk", price: -5, usesPerWeek: -1, swatchHex: "red" }, "id-2", "2026-09-10");
  check("junk inputs fall back to safe values", junk.name === "New product" && junk.price === null && junk.usesPerWeek === null && junk.swatchHex === null);
  check("empty name gets a fallback, junk category → generic", junk.category === "other");
  check("shelf cap exported", SHELF_MAX_ITEMS === 60);

  /* determinism */
  const s1 = JSON.stringify(shelfSummary(shelf, TODAY));
  const s2 = JSON.stringify(shelfSummary(shelf, TODAY));
  check("shelfSummary is deterministic", s1 === s2);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
