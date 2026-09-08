/* ============================================================
   AURELIA — Stylist RAG-lite grounding (SERVER-SIDE)
   Retrieves the most relevant snippets from the app's own
   knowledge base and appends them to the system prompt, so
   replies are grounded in the same curated content the UI shows.
   Deterministic keyword scoring (BM25-lite): no embeddings,
   no external calls, ~1ms.
   ============================================================ */

import { searchIndex } from "./search";
import { actives } from "@/data/actives";
import { seasons } from "@/data/seasons";

interface Doc {
  title: string;
  text: string;
  source: string;
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "with", "for", "my", "me", "i", "you", "your", "is", "are", "was", "be",
  "to", "of", "in", "on", "it", "this", "that", "do", "does", "how", "what", "which", "should", "can", "will",
  "have", "has", "about", "any", "some", "best", "good", "look", "looks", "like", "get", "make", "makes", "use",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

/* small synonym map to bridge user phrasing → KB vocabulary */
const SYNONYMS: Record<string, string[]> = {
  lipstick: ["lips", "lip"],
  lip: ["lipstick", "lips"],
  eyeshadow: ["eyes", "eye", "eyeliner", "mascara"],
  mascara: ["eyes", "eye", "eyeshadow"],
  skincare: ["skin", "routine"],
  skin: ["skincare", "routine"],
  acne: ["breakouts", "pimples", "blemish", "spots"],
  pimple: ["acne", "breakouts", "spots"],
  glow: ["glowing", "radiance"],
  glitter: ["shimmer", "sparkle"],
  outfit: ["clothes", "dress", "wear", "style"],
  dress: ["outfit", "gown"],
  jeans: ["denim"],
  denims: ["denim", "jeans"],
  heels: ["shoes", "shoes", "footwear"],
  hair: ["hairstyle", "strands", "curls", "braid"],
  curls: ["curly", "hair", "hairstyle"],
  interview: ["formal", "office", "blazer"],
  college: ["campus", "class", "student"],
  date: ["date-night", "romantic"],
  retinol: ["retinoid", "vitamin-a"],
  niacinamide: ["vitamin-b3", "niacin"],
  sunscreen: ["spf", "sun", "sunblock"],
  spf: ["sunscreen", "sun"],
  oily: ["oil", "shine", "greasy"],
  dry: ["dryness", "dehydrated", "flaky"],
  season: ["12-season", "color-analysis", "palette"],
  undertone: ["warm", "cool", "neutral"],
};

let docs: Doc[] | null = null;

function buildDocs(): Doc[] {
  if (docs) return docs;
  const out: Doc[] = [];
  for (const e of searchIndex()) {
    out.push({ title: e.title, text: `${e.title}. ${e.body}`, source: e.id });
  }
  for (const a of actives) {
    const slotTxt =
      a.slots.includes("am") && a.slots.includes("pm") ? "Morning and night use" : a.slots.includes("am") ? "Morning use" : "Night use";
    out.push({
      title: `Active: ${a.name}`,
      text: `${a.name} (${a.id}). ${a.note} pH ${a.ph}. ${slotTxt}.${a.photosensitive ? " Can increase sun sensitivity — SPF extra important." : ""}`,
      source: `active-${a.id}`,
    });
  }
  for (const s of seasons) {
    out.push({
      title: `Season: ${s.name}`,
      text: `${s.name} — ${s.tagline}. Palette: ${s.palette.slice(0, 8).map((p) => p.name).join(", ")}. Metals: ${s.metals}. Makeup: ${s.makeup}. Avoid: ${s.avoid.slice(0, 5).map((a) => a.name).join(", ")}.`,
      source: `season-${s.id}`,
    });
  }
  docs = out;
  return out;
}

interface Scored {
  doc: Doc;
  score: number;
}

export function retrieveGrounding(query: string, k = 4): Scored[] {
  const all = buildDocs();
  let tokens = tokenize(query);
  /* expand with synonyms */
  const expanded = new Set<string>();
  for (const t of tokens) {
    expanded.add(t);
    const stem = t.endsWith("s") ? t.slice(0, -1) : t;
    expanded.add(stem);
    for (const syn of SYNONYMS[t] ?? SYNONYMS[stem] ?? []) {
      expanded.add(syn);
      expanded.add(syn.endsWith("s") ? syn.slice(0, -1) : syn);
    }
  }
  tokens = [...expanded];
  if (!tokens.length) return [];

  /* document frequency for idf */
  const df = new Map<string, number>();
  for (const d of all) {
    const seen = new Set(tokenize(d.text));
    for (const t of tokens) if (seen.has(t)) df.set(t, (df.get(t) ?? 0) + 1);
  }

  const scored: Scored[] = [];
  for (const d of all) {
    const textTokens = tokenize(d.text);
    const titleTokens = new Set(tokenize(d.title));
    let score = 0;
    const counts = new Map<string, number>();
    for (const t of textTokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const t of tokens) {
      const tf = counts.get(t) ?? 0;
      if (!tf) continue;
      const idf = Math.log(1 + all.length / (1 + (df.get(t) ?? 0)));
      score += (1 + Math.log(tf)) * idf;
      if (titleTokens.has(t)) score += idf * 2.2; /* title hit boost */
    }
    if (score > 0) scored.push({ doc: d, score });
  }

  scored.sort((a, b) => b.score - a.score);
  /* diversity: max 1 doc per source prefix (color-/skin-/hair-…) */
  const picked: Scored[] = [];
  const usedKind = new Set<string>();
  for (const s of scored) {
    const kind = s.doc.source.split("-")[0];
    if (usedKind.has(kind) && picked.length < k) continue;
    picked.push(s);
    usedKind.add(kind);
    if (picked.length >= k) break;
  }
  return picked;
}

export function groundingBlock(queries: string[]): string {
  /* use the last user messages as retrieval queries (deduped, latest first) */
  const seen = new Set<string>();
  const qs: string[] = [];
  for (const q of queries.reverse()) {
    if (seen.has(q)) continue;
    seen.add(q);
    qs.push(q);
    if (qs.length === 3) break;
  }
  const docs: Doc[] = [];
  const docSources = new Set<string>();
  for (const q of qs) {
    for (const { doc } of retrieveGrounding(q, 2)) {
      if (docSources.has(doc.source)) continue;
      docSources.add(doc.source);
      docs.push(doc);
      if (docs.length >= 4) break;
    }
    if (docs.length >= 4) break;
  }
  if (!docs.length) return "";
  return [
    "Grounding — verified facts from the app's own knowledge base (prefer these over generic knowledge; cite naturally, never mention this block):",
    ...docs.map((d) => `• ${d.text.replace(/\s+/g, " ").slice(0, 420)}`),
  ].join("\n");
}
