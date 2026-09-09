/* ============================================================
   AURELIA — Label Scan engine (pure, deterministic, SSR-safe)
   ------------------------------------------------------------
   OCR text (or pasted INCI list) →
     · split + normalize ingredient tokens (label noise aware)
     · match tokens onto the 12 actives via the alias table
       (exact → family patterns → substring → OCR-fuzzy)
     · surface non-active flags (alcohol / fragrance / EOs)
     · cross the matched actives against HER routine using the
       existing conflict/synergy matrix — classified as
       product-vs-routine, inside-product, inside-routine
   No DOM, no deps → testable under bun.
   ============================================================ */

import { actives, activeById } from "@/data/actives";
import {
  activeAliases,
  flagAliases,
  INCI_HEADER_PATTERN,
  type ActiveId,
  type FlagKind,
} from "@/data/inci-aliases";

/* ---------- types ---------- */

export type MatchConfidence = "exact" | "family" | "fuzzy";

export interface ScannedActive {
  id: ActiveId;
  name: string; // display name from the actives table
  via: string; // the token that matched (as printed on the label)
  confidence: MatchConfidence;
}

export interface LabelFlag {
  kind: FlagKind;
  via: string;
  note: string;
}

export interface ScanConflict {
  a: string; // display names
  b: string;
  aid: string;
  bid: string;
  severity: "avoid" | "warn";
  why: string;
  scope: "product-vs-routine" | "inside-product";
}

export interface ScanSynergy {
  a: string;
  b: string;
  why: string;
  scope: "product-vs-routine" | "inside-product";
}

export interface ScanResult {
  text: string; // raw text the scan ran on
  ingredients: string[]; // cleaned tokens, order preserved
  matched: ScannedActive[];
  flags: LabelFlag[];
  conflicts: ScanConflict[];
  synergies: ScanSynergy[];
  newActives: ScannedActive[]; // matched but not in her routine
  status: "clear" | "careful" | "conflict";
  matchCount: number;
}

/* ---------- normalization ---------- */

/** strip label decorations from one token: bullets, numbering, %, *, ™, footnotes */
export function normalizeToken(raw: string): string {
  return raw
    .replace(/^[\s•·▪◦*\-–—]+/, "") // leading bullets / dashes
    .replace(/[\s•·▪◦*]+$/, "") // trailing bullets
    .replace(/^\d+[.)]\s*/, "") // "1." "2)" numbering
    .replace(/\d+(\.\d+)?\s*%?/g, " ") // percentages + quantities
    .replace(/\(|\)|\[|\]/g, " ") // parentheses → space (keeps "Alcohol Denat (SD Alcohol 40)")
    .replace(/[™®©†‡§]/g, "")
    .replace(/[.,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** diacritics-free, letters+spaces-only form for fuzzy comparison */
function fuzzyForm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/0/g, "o")
    .replace(/[1|]/g, "l")
    .replace(/[^a-z\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** split a raw label text into cleaned ingredient tokens */
export function splitInci(text: string): string[] {
  const lines = text
    .split(/[\n\r]+/)
    .map((l) => l.replace(INCI_HEADER_PATTERN, " ")) // drop "Ingredients:" headers
    .filter((l) => l.trim().length > 0);
  const tokens: string[] = [];
  for (const line of lines) {
    /* colons split too — "May contain: Fragrance" lines are common on labels */
    for (const part of line.split(/[,;:\u00b7\u2022]+/)) {
      const t = normalizeToken(part);
      /* keep only plausible ingredient words: ≥3 chars, has a vowel, not noise */
      if (t.length < 3 || t.length > 60) continue;
      if (!/[aeiouy]/.test(t)) continue;
      if (/^(and|the|may contain|free from|no|paraben|phthalate|gluten|active)$/i.test(t)) continue;
      tokens.push(t);
    }
  }
  return tokens;
}

/* ---------- fuzzy matching ---------- */

/** bounded Levenshtein (early exit when distance exceeds max) */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

function fuzzyThreshold(len: number): number {
  if (len <= 5) return 0; // short tokens must be exact
  if (len <= 8) return 1;
  if (len <= 14) return 2;
  if (len <= 20) return 3;
  return 4;
}

/* ---------- the matcher ---------- */

export interface TokenMatch {
  kind: "active" | "flag";
  id?: ActiveId;
  flagKind?: FlagKind;
  confidence: MatchConfidence;
}

/** match ONE normalized token against alias + flag tables */
export function matchToken(token: string): TokenMatch | null {
  const fz = fuzzyForm(token);
  if (!fz) return null;

  /* 1. structural matches first (families + substrings) — un-fakeable */
  for (const alias of activeAliases) {
    for (const c of alias.contains ?? []) {
      if (token.includes(c)) return { kind: "active", id: alias.id, confidence: "family" };
    }
    for (const p of alias.patterns ?? []) {
      if (p.test(token)) return { kind: "active", id: alias.id, confidence: "family" };
    }
  }
  for (const flag of flagAliases) {
    for (const c of flag.contains ?? []) {
      if (token.includes(c)) return { kind: "flag", flagKind: flag.kind, confidence: "family" };
    }
    for (const p of flag.patterns ?? []) {
      if (p.test(token)) return { kind: "flag", flagKind: flag.kind, confidence: "family" };
    }
  }

  /* 2. exact full-name matches (fuzzy-tolerant for OCR noise) */
  let best: { id: ActiveId; dist: number } | null = null;
  let bestFlag: { kind: FlagKind; dist: number } | null = null;
  const th = fuzzyThreshold(fz.length);
  for (const alias of activeAliases) {
    for (const ex of alias.exact) {
      const target = fuzzyForm(ex);
      if (target === fz) return { kind: "active", id: alias.id, confidence: "exact" };
      const d = editDistance(fz, target, th);
      if (d <= th && (!best || d < best.dist)) best = { id: alias.id, dist: d };
    }
  }
  for (const flag of flagAliases) {
    for (const ex of flag.exact) {
      const target = fuzzyForm(ex);
      if (target === fz) return { kind: "flag", flagKind: flag.kind, confidence: "exact" };
      const d = editDistance(fz, target, th);
      if (d <= th && (!bestFlag || d < bestFlag.dist)) bestFlag = { kind: flag.kind, dist: d };
    }
  }
  /* ties → an active beats a flag; both fuzzy → closest wins */
  if (best && best.dist === 0) return { kind: "active", id: best.id, confidence: "exact" };
  if (bestFlag && bestFlag.dist === 0) return { kind: "flag", flagKind: bestFlag.kind, confidence: "exact" };
  if (best && (!bestFlag || best.dist <= bestFlag.dist)) return { kind: "active", id: best.id, confidence: "fuzzy" };
  if (bestFlag) return { kind: "flag", flagKind: bestFlag.kind, confidence: "fuzzy" };
  return null;
}

/* ---------- the scan ---------- */

export function scanLabel(rawText: string, myActives: string[]): ScanResult {
  const text = rawText ?? "";
  const ingredients = splitInci(text);

  const matched: ScannedActive[] = [];
  const flags: LabelFlag[] = [];
  const seenActive = new Set<ActiveId>();

  for (const token of ingredients) {
    const m = matchToken(token);
    if (!m) continue;
    if (m.kind === "active" && m.id) {
      if (seenActive.has(m.id)) continue; // first mention wins
      seenActive.add(m.id);
      matched.push({
        id: m.id,
        name: activeById(m.id)?.name ?? m.id,
        via: token,
        confidence: m.confidence,
      });
    } else if (m.kind === "flag" && m.flagKind) {
      const alias = flagAliases.find((f) => f.kind === m.flagKind);
      if (!alias) continue;
      if (flags.some((f) => f.kind === m.flagKind && f.via === token)) continue;
      flags.push({ kind: m.flagKind, via: token, note: alias.note });
    }
  }

  /* ---- cross the matched set against her routine ---- */
  const routineIds = new Set<string>(myActives.filter((id) => activeById(id) !== undefined));
  const scannedIds = new Set<string>(matched.map((m) => m.id));

  const conflicts: ScanConflict[] = [];
  const synergies: ScanSynergy[] = [];
  const seenPair = new Set<string>();

  const pairScope = (x: string, y: string): ScanConflict["scope"] | null => {
    const xin = scannedIds.has(x);
    const yin = scannedIds.has(y);
    const xrt = routineIds.has(x);
    const yrt = routineIds.has(y);
    if ((xin && yrt) || (yin && xrt)) return "product-vs-routine";
    if (xin && yin) return "inside-product";
    if (xrt && yrt) return null; // her own routine's business — Ingredient Lab covers it
    return null; // matched × unmatched — nothing to check
  };

  const recordPair = (aId: string, bId: string) => {
    const scope = pairScope(aId, bId);
    if (scope === null) return;
    const key = [aId, bId].sort().join("|") + ":" + scope;
    if (seenPair.has(key)) return;
    const a = activeById(aId);
    const b = activeById(bId);
    if (!a || !b) return;
    /* conflict is symmetric in our data — read whichever side declares it */
    const c = a.conflicts.find((x) => x.with === bId) ?? b.conflicts.find((x) => x.with === aId);
    if (c) {
      seenPair.add(key);
      conflicts.push({
        a: a.name, b: b.name, aid: aId, bid: bId,
        severity: c.severity, why: c.why, scope,
      });
      return;
    }
    const s = a.synergies.find((x) => x.with === bId) ?? b.synergies.find((x) => x.with === aId);
    if (s) {
      seenPair.add(key);
      synergies.push({ a: a.name, b: b.name, why: s.why, scope });
    }
  };

  for (const a of actives) {
    for (const other of actives) {
      if (a.id === other.id) continue;
      const relevant =
        (scannedIds.has(a.id) || routineIds.has(a.id)) &&
        (scannedIds.has(other.id) || routineIds.has(other.id));
      if (!relevant) continue;
      recordPair(a.id, other.id);
    }
  }

  /* avoid-severity first, then product-vs-routine before inside-product */
  conflicts.sort((x, y) => {
    const sev = (x.severity === "avoid" ? 0 : 1) - (y.severity === "avoid" ? 0 : 1);
    if (sev !== 0) return sev;
    return (x.scope === "product-vs-routine" ? 0 : 1) - (y.scope === "product-vs-routine" ? 0 : 1);
  });
  synergies.sort(
    (x, y) => (x.scope === "product-vs-routine" ? 0 : 1) - (y.scope === "product-vs-routine" ? 0 : 1),
  );

  const newActives = matched.filter((m) => !routineIds.has(m.id));

  const status: ScanResult["status"] = conflicts.some((c) => c.severity === "avoid")
    ? "conflict"
    : conflicts.length > 0
      ? "careful"
      : "clear";

  return {
    text,
    ingredients,
    matched,
    flags,
    conflicts,
    synergies,
    newActives,
    status,
    matchCount: matched.length,
  };
}

/* ---------- headline + verdict copy (pure) ---------- */

export function scanHeadline(r: ScanResult, routineSize: number): { title: string; sub: string } {
  if (r.matched.length === 0) {
    return {
      title: "No familiar actives found",
      sub:
        routineSize > 0
          ? "Nothing this product lists clashes with your routine — but nothing it lists is in our active dictionary either. Check the raw text below."
          : "Nothing matched our active dictionary — set your routine below to make future scans meaningful.",
    };
  }
  if (r.status === "conflict") {
    const worst = r.conflicts[0];
    return {
      title: "Heads up before you buy",
      sub: `${worst.a} × ${worst.b} — ${worst.severity === "avoid" ? "they neutralize or destabilize each other. " : ""}Details below.`,
    };
  }
  if (r.status === "careful") {
    return { title: "Layer with care", sub: `${r.conflicts.length} pairing${r.conflicts.length > 1 ? "s" : ""} worth knowing about — timing fixes most of them.` };
  }
  if (routineSize === 0) {
    return { title: "No clashes in this formula", sub: "Add your routine below to check this product against what you already use." };
  }
  return { title: "Plays well with your routine", sub: "No conflicts with the actives you track. Enjoy it." };
}

/* ---------- routine suggestions from the journal (pure) ---------- */

export function suggestRoutine(journalActives: string[][]): string[] {
  const counts = new Map<string, number>();
  for (const list of journalActives) {
    for (const id of list ?? []) {
      if (activeById(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);
}
