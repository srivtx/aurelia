/* ============================================================
   AURELIA — global search index
   One box across colors · makeup · skin · hair · tips
   ============================================================ */

import { wardrobeColors, palettes, theorySchemes, colorRules } from "@/data/colors";
import { looks, face101, eye101, lip101, makeupMistakes, goldenOrder } from "@/data/makeup";
import { skinTypes, ingredients, sunscreenGuide, habitTips } from "@/data/skincare";
import { masterStyles, outfitCategories, faceShapes, quickFixes } from "@/data/hair";
import { dailyTips } from "@/data/tips";
import type { Category } from "./store";

export interface SearchEntry {
  id: string; // unique, e.g. "color-navy" — also usable as deep-open target
  category: Category;
  title: string;
  body: string; // searchable text
  snippet: string; // shown in results
  kind: string; // "Color", "Palette", "Look", "Myth"...
}

let cached: SearchEntry[] | null = null;

export function searchIndex(): SearchEntry[] {
  if (cached) return cached;
  const e: SearchEntry[] = [];

  for (const c of wardrobeColors) {
    e.push({
      id: `color-${c.id}`,
      category: "colors",
      title: c.name,
      body: `${c.name} ${c.undertone} ${c.vibe} ${c.secret}`,
      snippet: c.undertone,
      kind: "Color",
    });
  }
  for (const p of palettes) {
    e.push({
      id: `palette-${p.id}`,
      category: "colors",
      title: p.name,
      body: `${p.name} ${p.mood} ${p.occasion} ${p.season} ${p.outfit} ${p.why} ${p.swatches.map((s) => s.name).join(" ")}`,
      snippet: `${p.mood} · ${p.occasion}`,
      kind: "Palette",
    });
  }
  for (const s of theorySchemes) {
    e.push({ id: `theory-${s.id}`, category: "colors", title: s.name, body: `${s.name} ${s.tagline} ${s.desc}`, snippet: s.tagline, kind: "Theory" });
  }
  for (const r of colorRules) {
    e.push({ id: `rule-${r.title}`, category: "colors", title: r.title, body: `${r.title} ${r.desc}`, snippet: r.desc.slice(0, 90), kind: "Rule" });
  }

  for (const l of looks) {
    e.push({
      id: `look-${l.id}`,
      category: "makeup",
      title: l.name,
      body: `${l.name} ${l.vibe} ${l.occasions} ${l.steps.join(" ")} ${l.kit.join(" ")} ${l.proTip}`,
      snippet: `${l.vibe} · ${l.minutes} min`,
      kind: "Look",
    });
  }
  for (const g of [face101, eye101, lip101]) {
    e.push({ id: `guide-${g.id}`, category: "makeup", title: g.title, body: `${g.title} ${g.intro} ${g.cards.map((c) => `${c.heading} ${c.body}`).join(" ")}`, snippet: g.intro, kind: "101 guide" });
  }
  for (const m of makeupMistakes) {
    e.push({ id: `mistake-${m.mistake}`, category: "makeup", title: m.mistake, body: `${m.mistake} ${m.fix}`, snippet: `Fix: ${m.fix.slice(0, 80)}…`, kind: "Mistake fix" });
  }
  for (const s of goldenOrder) {
    e.push({ id: `order-${s.step}`, category: "makeup", title: `${s.step}. ${s.name}`, body: `${s.name} ${s.why}`, snippet: s.why.slice(0, 90), kind: "Order" });
  }

  for (const t of skinTypes) {
    e.push({
      id: `skin-${t.id}`,
      category: "skin",
      title: `${t.name} skin`,
      body: `${t.name} ${t.snapshot} ${t.identify.join(" ")} ${t.amRoutine.join(" ")} ${t.pmRoutine.join(" ")} ${t.heroes.join(" ")}`,
      snippet: t.snapshot.slice(0, 90),
      kind: "Skin type",
    });
  }
  for (const i of ingredients) {
    e.push({ id: `ing-${i.name}`, category: "skin", title: i.name, body: `${i.name} ${i.tagline} ${i.does} ${i.bestFor} ${i.when} ${i.caution}`, snippet: i.tagline, kind: "Ingredient" });
  }
  e.push({
    id: "spf-guide",
    category: "skin",
    title: "Sunscreen, honestly",
    body: `${sunscreenGuide.title} ${sunscreenGuide.points.join(" ")}`,
    snippet: sunscreenGuide.title,
    kind: "Guide",
  });
  for (const h of habitTips) {
    e.push({ id: `habit-${h.title}`, category: "skin", title: h.title, body: `${h.title} ${h.body}`, snippet: h.body.slice(0, 90), kind: "Habit" });
  }

  for (const s of masterStyles) {
    e.push({
      id: `style-${s.id}`,
      category: "hair",
      title: s.name,
      body: `${s.name} ${s.occasions.join(" ")} ${s.length} ${s.steps.join(" ")} ${s.proTips.join(" ")} ${s.mistake}`,
      snippet: `${s.difficulty} · ${s.minutes} min · ${s.length} hair`,
      kind: "Hairstyle",
    });
  }
  for (const o of outfitCategories) {
    e.push({ id: `outfit-${o.id}`, category: "hair", title: `Hair for ${o.name}`, body: `${o.name} ${o.blurb} ${o.styleIds.map((id) => masterStyles.find((s) => s.id === id)?.name ?? "").join(" ")}`, snippet: o.blurb, kind: "Match" });
  }
  for (const f of faceShapes) {
    e.push({ id: `face-${f.id}`, category: "hair", title: `${f.name} face shape`, body: `${f.name} ${f.spot} ${f.goal} ${f.flattering} ${f.careful}`, snippet: f.goal.slice(0, 90), kind: "Face shape" });
  }
  for (const q of quickFixes) {
    e.push({ id: `fix-${q.problem}`, category: "hair", title: q.problem, body: `${q.problem} ${q.fix}`, snippet: `Fix: ${q.fix.slice(0, 80)}…`, kind: "Quick fix" });
  }

  for (const t of dailyTips) {
    e.push({ id: `tip-${t.id}`, category: t.category, title: t.title, body: `${t.title} ${t.body}`, snippet: t.body.slice(0, 90), kind: "Tip" });
  }

  /* deep-tech tools */
  e.push({ id: "lab-season", category: "colors", title: "12-Season Color Analysis", body: "personal color analysis season quiz palette vector classifier warm cool muted bright deep light spring summer autumn winter metals jewelry", snippet: "7 questions → your season, palette & metals", kind: "Tool" });
  e.push({ id: "lab-outfit", category: "colors", title: "Outfit Lab", body: "score outfit combination colors hue complementary analogous triadic value contrast chroma warmth 60-30-10 engine lab", snippet: "Score any 2-4 colors with real color math", kind: "Tool" });
  e.push({ id: "lab-photo", category: "colors", title: "Photo → Palette", body: "photo palette extract k-means camera outfit image colors dominant on-device computer vision private offline", snippet: "Pull colors from a photo, fully on-device", kind: "Tool" });
  e.push({ id: "lab-ingredients", category: "skin", title: "Ingredient Lab — Mix & Match", body: "mix match ingredients actives conflict retinol vitamin c niacinamide aha bha salicylic glycolic azelaic benzoyl peroxide layering order routine am pm sequencer", snippet: "Check conflicts + get the right AM/PM order", kind: "Tool" });
  e.push({ id: "label-scanner", category: "skin", title: "Label Scanner", body: "scan label ocr camera ingredients inci tesseract on-device check against routine conflicts barcode shelf", snippet: "Photograph an INCI list → verdict vs your routine", kind: "Tool" });
  e.push({ id: "lab-signature", category: "skin", title: "Skin Signature — the colorimeter", body: "measure skin selfie white reference calibration colorimetry cielab ita depth undertone hue chroma mirror test on-device signature", snippet: "One selfie + something white → your Lab numbers", kind: "Tool" });
  e.push({ id: "lab-shelf", category: "skin", title: "The Shelf — PAO & duplicates", body: "shelf products expiry pao period after opening countdown months mascara expired duplicate near-identical swatch inventory cost per use", snippet: "PAO countdown + near-duplicate radar, offline", kind: "Tool" });
  e.push({ id: "lab-shade", category: "makeup", title: "Shade Lab — will it oxidize?", body: "foundation shade match blend predict on skin deltae undertone warm cool oxidation orange shift darker simulate match before you buy", snippet: "How a shade reads on YOUR measured skin", kind: "Tool" });
  e.push({ id: "face-meter", category: "hair", title: "Face Meter", body: "measure face shape geometry calculator oval round square heart long diamond ratio classifier jaw forehead cheekbone hairstyle", snippet: "Slide 4 measurements → your shape + styles", kind: "Tool" });
  e.push({ id: "ask-aurelia", category: "colors", title: "Ask Aurelia — AI stylist", body: "ai stylist chat ask assistant beauty editor conversation colors makeup skin hair questions advice", snippet: "Your AI stylist, personalized", kind: "Tool" });

  cached = e;
  return e;
}

export interface SearchHit extends SearchEntry {
  score: number;
}

const norm = (s: string) => s.toLowerCase();

export function search(query: string, limit = 24): SearchHit[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];
  for (const entry of searchIndex()) {
    const title = norm(entry.title);
    const body = norm(entry.body);
    let score = 0;
    let all = true;
    for (const t of tokens) {
      if (title.startsWith(t)) score += 6;
      else if (title.includes(t)) score += 4;
      else if (body.includes(t)) score += 2;
      else {
        all = false;
        break;
      }
    }
    if (all && score > 0) hits.push({ ...entry, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.length - b.title.length).slice(0, limit);
}

/* Popular searches shown on the empty state */
export const popularSearches = ["my season", "outfit lab", "retinol", "oily skin", "date night", "face meter", "camel", "concealer", "blush", "SPF"];
