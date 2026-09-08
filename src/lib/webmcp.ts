/* ============================================================
   AURELIA — WebMCP agent bridge (client-side, progressive)
   Turns the page into an MCP *tool server* so the user's AI
   agent (ChatGPT Desktop "site tools", Chrome/Edge origin
   trials, Brave) can call Aurelia's deterministic engines with
   structured arguments — CIEDE2000 color math, the 12-season
   classifier, the routine sequencer, the conflict matrix and
   the knowledge search — against the LIVE page state.

   Spec shape (W3C WebML CG, Sept 2026):
     document.modelContext.registerTool({
       name, title, description, inputSchema,
       annotations: { readOnlyHint: true },
       execute(input, { signal }) → MCP-style { content:[...] }
     })
   Compat shim: document.modelContext ?? navigator.modelContext
   (the Feb-2026 surface). Everything no-ops silently when the
   API is missing — zero cost, zero risk.

   Security posture (spec §6): every tool is read-only, narrow,
   and never takes or returns PII. The user's saved season is
   read from the local store only, and only its name/palette is
   returned. See docs/RESEARCH-DEEPTECH.md §1.
   ============================================================ */

import { useAurelia } from "./store";
import { analyzeOutfit } from "./outfit-engine";
import { classifySeason, seasonById, rateColorForSeason, type Season } from "@/data/seasons";
import { wardrobeColors, getMatchesFor } from "@/data/colors";
import { actives, activeById } from "@/data/actives";
import { buildRoutine } from "./routine-engine";
import { search } from "./search";
import { hexDeltaE, contrastRatio, warmthScore } from "./color-science";

/* minimal typing for the (still-moving) WebMCP surface */
interface McpToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean; consequentialHint?: boolean };
  execute: (input: Record<string, unknown>, options: { signal?: AbortSignal }) => Promise<unknown> | unknown;
}
interface McpSurface {
  registerTool?: (tool: McpToolDef, options?: { signal?: AbortSignal; exposedTo?: string[] }) => Promise<unknown> | unknown;
  unregisterTool?: (name: string) => unknown;
}

const HEX = /^#?[0-9a-fA-F]{6}$/;
const normHex = (s: string) => (s.startsWith("#") ? s : `#${s}`).toUpperCase();

function textResult(text: string, extra?: Record<string, unknown>) {
  /* MCP-style structured return, as recommended by the spec README */
  return { content: [{ type: "text", text }], ...(extra ?? {}) };
}

function savedSeason(): Season | null {
  const r = useAurelia.getState().seasonResult;
  return r ? seasonById(r.id) ?? null : null;
}

/* ---------- the six tools ---------- */

const TOOLS: McpToolDef[] = [
  {
    name: "score_outfit",
    title: "Score an outfit",
    description:
      "Scores an outfit of 2–5 hex colors with Aurelia's CIELAB / CIEDE2000 engine: hue-geometry relation, lightness spread, chroma coherence, warmth coherence, neutral anchor and 60-30-10 role assignment. If the user has a saved 12-season result, adds a season-fit factor. Deterministic and explainable — returns the per-factor breakdown.",
    inputSchema: {
      type: "object",
      properties: {
        colors: {
          type: "array",
          minItems: 2,
          maxItems: 5,
          items: { type: "string", pattern: "^#?[0-9a-fA-F]{6}$", description: "Hex color like #2F4F3F" },
          description: "The outfit's colors, e.g. ['#2F4F3F','#F5E6D3']",
        },
      },
      required: ["colors"],
    },
    annotations: { readOnlyHint: true },
    async execute({ colors }) {
      const hexes = (Array.isArray(colors) ? (colors as string[]) : []).filter((c) => typeof c === "string" && HEX.test(c)).map(normHex);
      if (hexes.length < 2) return textResult("Need at least 2 valid hex colors.");
      const a = analyzeOutfit(hexes, savedSeason());
      return textResult(
        `Outfit score: ${a.score}/100 — ${a.verdict}. ${a.headline} Hue relation: ${a.relationLabel}; contrast ${a.contrast.level} (${a.contrast.ratio.toFixed(1)}:1). Roles: base ${a.roles.base}, secondary ${a.roles.secondary}${a.roles.accent ? `, accent ${a.roles.accent}` : ""}.`,
        {
          score: a.score,
          verdict: a.verdict,
          hueRelation: a.relationLabel,
          contrast: a.contrast,
          roles: a.roles,
          warmthBalance: a.warmthBalance,
          factors: a.factors,
          seasonFit: a.seasonFit ?? null,
        }
      );
    },
  },
  {
    name: "find_matching_colors",
    title: "Find matching colors",
    description:
      "Given a wardrobe color (name like 'camel'/'burgundy', or a hex), returns the colors that pair well with it, why each works, and — if the user has a saved season — how well it rates for their season.",
    inputSchema: {
      type: "object",
      properties: {
        color: { type: "string", description: "Color name (e.g. 'forest green', 'camel') or hex like #A84A62" },
        count: { type: "integer", minimum: 1, maximum: 10, description: "Max matches to return (default 5)" },
      },
      required: ["color"],
    },
    annotations: { readOnlyHint: true },
    async execute({ color, count }) {
      const q = String(color ?? "").trim().toLowerCase();
      const n = Math.min(Math.max(Number(count) || 5, 1), 10);
      const byName = wardrobeColors.find((c) => c.id === q.replace(/\s+/g, "-") || c.name.toLowerCase() === q);
      const known = byName ?? (HEX.test(q) ? wardrobeColors.find((c) => c.hex.toLowerCase() === normHex(q).toLowerCase()) : undefined);
      if (!known) {
        if (HEX.test(q)) {
          const hex = normHex(q);
          const season = savedSeason();
          if (season) {
            const r = rateColorForSeason(hex, season);
            return textResult(`Unknown wardrobe color, but for the user's ${season.name} palette it is ${r.verdict} (ΔE2000 ${r.delta.toFixed(1)} to nearest palette color).`, {
              hex,
              season: season.name,
              rating: { verdict: r.verdict, delta: Number(r.delta.toFixed(1)), nearest: r.nearest?.name ?? null },
            });
          }
          const warm = warmthScore(hex);
          return textResult(`Unknown wardrobe color ${hex}. Warmth ${warm >= 0 ? "warm" : "cool"} (${warm.toFixed(2)}). Try the find_matching_colors tool with a known wardrobe color name for pairings.`, { hex, warmth: Number(warm.toFixed(2)) });
        }
        return textResult(`Unknown color "${q}". Known names: ${wardrobeColors.slice(0, 12).map((c) => c.name).join(", ")}…`);
      }
      const matches = getMatchesFor(known.id).slice(0, n);
      const season = savedSeason();
      const seasonNote = season ? rateColorForSeason(known.hex, season) : null;
      return textResult(
        `${known.name} (${known.hex}) pairs with: ${matches.map((m) => `${m.color.name} — ${m.why}`).join("; ")}.${
          seasonNote ? ` For the user's ${season?.name} palette, ${known.name} is ${seasonNote.verdict}.` : ""
        }`,
        {
          color: { id: known.id, name: known.name, hex: known.hex },
          matches: matches.map((m) => ({ id: m.color.id, name: m.color.name, hex: m.color.hex, why: m.why })),
          seasonRating: seasonNote ? { verdict: seasonNote.verdict, delta: Number(seasonNote.delta.toFixed(1)) } : null,
        }
      );
    },
  },
  {
    name: "get_season",
    title: "Personal color season",
    description:
      "Returns the user's saved 12-season personal color result (palette hexes, metals, makeup guidance, colors to avoid) — or, given 7 quiz answers (integers 0–3 in question order), classifies a season from the warmth/depth/chroma/contrast signal vector. Only the saved season name is returned if the user hasn't taken the analysis.",
    inputSchema: {
      type: "object",
      properties: {
        answers: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: { type: "integer", minimum: 0, maximum: 3 },
          description: "Optional: answers 0–3 to the 7 season questions, in order. Omit to read the user's saved result.",
        },
      },
    },
    annotations: { readOnlyHint: true },
    async execute({ answers }) {
      const store = useAurelia.getState().seasonResult;
      if (Array.isArray(answers) && answers.length === 7) {
        const r = classifySeason((answers as number[]).map((a) => Math.min(Math.max(Number(a) || 0, 0), 3)));
        if (!r) return textResult("Could not classify — need exactly 7 answers of 0–3.");
        return textResult(
          `Classified: ${r.season.name} (confidence ${Math.round(r.confidence * 100)}%; runner-up ${r.runnerUp.name}).`,
          {
            season: r.season.name,
            confidence: Number(r.confidence.toFixed(2)),
            runnerUp: r.runnerUp.name,
            signals: r.signals,
            palette: r.season.palette.slice(0, 10).map((p) => ({ name: p.name, hex: p.hex })),
          }
        );
      }
      if (!store) return textResult("No saved season. Ask the user to take the 12-Season analysis in the app, or pass 7 answers to classify now.");
      const s = seasonById(store.id);
      if (!s) return textResult("No saved season.");
      return textResult(
        `The user's season is ${s.name} — ${s.tagline}. Best metals: ${s.metals}.`,
        {
          season: s.name,
          tagline: s.tagline,
          palette: s.palette.slice(0, 12).map((p) => ({ name: p.name, hex: p.hex })),
          metals: s.metals,
          makeup: s.makeup,
          hair: s.hair,
          avoid: s.avoid.slice(0, 5).map((a) => ({ name: a.name, why: a.why })),
        }
      );
    },
  },
  {
    name: "get_routine",
    title: "Build a skincare routine",
    description:
      "Sequences skincare actives into an AM and PM routine using pH ordering, time slots, photosensitivity and the conflict/synergy matrix. Returns step order with reasons, detected conflicts and fixes. Valid active ids: " + actives.map((a) => a.id).join(", ") + ".",
    inputSchema: {
      type: "object",
      properties: {
        activeIds: {
          type: "array",
          minItems: 1,
          maxItems: 12,
          items: { type: "string", enum: actives.map((a) => a.id) },
          description: "Actives the user owns, e.g. ['retinol','niacinamide','vitamin-c']",
        },
      },
      required: ["activeIds"],
    },
    annotations: { readOnlyHint: true },
    async execute({ activeIds }) {
      const ids = (Array.isArray(activeIds) ? (activeIds as string[]) : []).map(String).filter((id) => activeById(id));
      if (!ids.length) return textResult("No valid actives given.");
      const plan = buildRoutine(ids);
      const fmt = (steps: { active: { name: string }; wait?: string }[]) =>
        steps.map((s) => `${s.active.name}${s.wait ? ` (${s.wait})` : ""}`).join(" → ");
      return textResult(
        `Routine for ${ids.join(" + ")} — status: ${plan.status}. AM: ${plan.am.length ? fmt(plan.am) : "gentle cleanse + SPF only"}. PM: ${plan.pm.length ? fmt(plan.pm) : "cleanse + moisturize"}.${
          plan.conflicts.length ? ` Conflicts: ${plan.conflicts.map((c) => `${c.a} × ${c.b} (${c.severity}) — ${c.why}`).join("; ")}` : ""
        }${plan.notes.length ? ` Notes: ${plan.notes.join(" ")}` : ""}`,
        {
          status: plan.status,
          am: plan.am,
          pm: plan.pm,
          conflicts: plan.conflicts,
          synergies: plan.synergies,
          notes: plan.notes,
        }
      );
    },
  },
  {
    name: "check_ingredient_conflict",
    title: "Check ingredient conflict",
    description:
      "Checks two skincare actives for conflict, caution or synergy — e.g. retinol × glycolic-acid — with the reason and the fix (alternate nights, buffering, order).",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "string", enum: actives.map((x) => x.id) },
        b: { type: "string", enum: actives.map((x) => x.id) },
      },
      required: ["a", "b"],
    },
    annotations: { readOnlyHint: true },
    async execute({ a, b }) {
      const A = activeById(String(a));
      const B = activeById(String(b));
      if (!A || !B) return textResult("Unknown active ids.");
      const conflict = A.conflicts.find((c) => c.with === B.id);
      const synergy = A.synergies.find((s) => s.with === B.id);
      if (conflict) {
        return textResult(`${A.name} × ${B.name}: ${conflict.severity === "avoid" ? "avoid combining" : "layer with care"}. ${conflict.why}`, {
          verdict: conflict.severity,
          why: conflict.why,
          pair: [A.id, B.id],
        });
      }
      if (synergy) {
        return textResult(`${A.name} × ${B.name}: synergy. ${synergy.why}`, { verdict: "synergy", why: synergy.why, pair: [A.id, B.id] });
      }
      return textResult(`${A.name} × ${B.name}: generally compatible — apply thinner/lower-pH first (${A.ph <= B.ph ? A.name : B.name}).`, {
        verdict: "compatible",
        pair: [A.id, B.id],
      });
    },
  },
  {
    name: "search_knowledge",
    title: "Search Aurelia's knowledge base",
    description:
      "Searches the app's curated beauty & style knowledge (19 wardrobe colors and their pairings, 15 palettes, color theory, makeup looks and 101s, skin types, 12 actives, hairstyles by outfit and face shape, daily tips). Returns titles with snippets and deep links.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search terms, e.g. 'retinol beginner', 'date night hair', 'oily skin routine'" },
        limit: { type: "integer", minimum: 1, maximum: 8, description: "Max results (default 5)" },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true },
    async execute({ query, limit }) {
      const hits = search(String(query ?? ""), Math.min(Math.max(Number(limit) || 5, 1), 8));
      if (!hits.length) return textResult("No results in the knowledge base.");
      return textResult(
        hits.map((h) => `${h.title} (${h.kind}): ${h.snippet}`).join(" | "),
        { results: hits.map((h) => ({ title: h.title, kind: h.kind, category: h.category, snippet: h.snippet, deepLink: `#/${h.category}` })) }
      );
    },
  },
  {
    name: "compare_colors",
    title: "Compare two colors scientifically",
    description:
      "Computes the perceptual distance (CIEDE2000) between two hex colors plus their WCAG contrast ratio and warmth scores — the math behind Aurelia's matching engine.",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "string", pattern: "^#?[0-9a-fA-F]{6}$" },
        b: { type: "string", pattern: "^#?[0-9a-fA-F]{6}$" },
      },
      required: ["a", "b"],
    },
    annotations: { readOnlyHint: true },
    async execute({ a, b }) {
      const ha = normHex(String(a));
      const hb = normHex(String(b));
      if (!HEX.test(ha) || !HEX.test(hb)) return textResult("Need two valid hex colors.");
      const delta = hexDeltaE(ha, hb);
      const contrast = contrastRatio(ha, hb);
      const meaning = delta < 10 ? "near-identical" : delta < 25 ? "close relatives" : delta < 45 ? "distinct but wearable" : "very different";
      return textResult(
        `${ha} vs ${hb}: ΔE2000 ${delta.toFixed(1)} (${meaning}), contrast ${contrast.toFixed(1)}:1 ${contrast >= 4.5 ? "(accessible)" : "(below WCAG AA)"}.`,
        {
          deltaE2000: Number(delta.toFixed(1)),
          contrastRatio: Number(contrast.toFixed(2)),
          warmth: { a: Number(warmthScore(ha).toFixed(2)), b: Number(warmthScore(hb).toFixed(2)) },
          meaning,
        }
      );
    },
  },
];

/* ---------- registration (idempotent, silent) ---------- */

let registered = false;

export function registerAureliaTools(): boolean {
  if (typeof document === "undefined" || registered) return false;
  const doc = document as Document & { modelContext?: McpSurface };
  const nav = navigator as Navigator & { modelContext?: McpSurface };
  const mc = doc.modelContext ?? nav.modelContext;
  if (!mc?.registerTool) return false;

  let ok = 0;
  for (const tool of TOOLS) {
    try {
      const p = mc.registerTool(tool);
      if (p && typeof (p as Promise<unknown>).then === "function") {
        (p as Promise<unknown>).catch(() => {});
      }
      ok++;
    } catch {
      /* surface moved again — skip this tool */
    }
  }
  registered = ok > 0;
  return registered;
}

export function unregisterAureliaTools(): void {
  if (typeof document === "undefined" || !registered) return;
  const doc = document as Document & { modelContext?: McpSurface };
  const nav = navigator as Navigator & { modelContext?: McpSurface };
  const mc = doc.modelContext ?? nav.modelContext;
  if (!mc?.unregisterTool) return;
  for (const t of TOOLS) {
    try {
      mc.unregisterTool(t.name);
    } catch {
      /* noop */
    }
  }
  registered = false;
}

export const webmcpToolNames = TOOLS.map((t) => t.name);
