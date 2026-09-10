# RESEARCH-DEEPTECH — WebMCP, Free LLM Providers, Modern PWA APIs & Original Deep-Tech Ideas

> **Part of Aurelia** · [README](../README.md) · [Docs index in README](../README.md#docs) · [Extended README](./README-EXTENDED.md) · [CONTEXT](./CONTEXT.md) · [DEPLOYMENT](./DEPLOYMENT.md)


**Project:** Aurelia (beauty/style PWA, Next.js 16 App Router, TS, Tailwind v4)
**Agent:** R-3 (research, deep-tech + providers) · **Compiled:** 2026-09-08
**Methodology:** Live web research (web search + full-page fetches of primary sources: W3C WebMCP spec, webmachinelearning/webmcp GitHub repo, Chrome/Edge developer docs, console.groq.com docs, OpenRouter docs + live `/v1/models` API, Cerebras inference docs (llms.txt), ai.google.dev docs, MDN browser-compat-data pulled from GitHub main). Items that could **not** be verified live are explicitly marked ⚠️ *internal knowledge — verify before relying*.
**Scope:** research + this document only. No app code was changed.

---

## Executive Summary

1. **WebMCP is real, shipping, and evolving fast — but it is NOT the shape most 2025 articles describe.** The current W3C Web Machine Learning CG draft (Sept 4, 2026) exposes tools via **`document.modelContext`** with an imperative `registerTool()/getTools()/executeTool()` API plus a **declarative HTML-form API** (`toolname`, `tooldescription`, `toolparamdescription`, `toolautosubmit` attributes). The much-cited `<script type="application/mcp+json">` JSON manifest **never made it into the spec** (and `window.mcp` never shipped) — the manifest idea was explicitly rejected in design discussion because it would limit WebMCP to PWAs. Chrome 149 runs a live **Origin Trial**, Edge 150 likewise, **ChatGPT Desktop ships it in production** ("Site tools"), Brave has experimental support. For Aurelia this is a ~1-file progressive enhancement that makes its deterministic color/ingredient engines callable by users' AI agents on the live page — something no beauty competitor does.
2. **Free OpenAI-compatible LLM capacity is abundant in 2026 but the model IDs churn fast.** Groq's classic free workhorses (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) were **deprecated Aug 16, 2026**; the current free-tier anchors are `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.6-27b` / `qwen3.8-27b`, and `groq/compound`. OpenRouter's `:free` pool (queried live) currently holds 16 models (Nemotron-3 family, Gemma-4, Inkling, Ling-3.0, …) at 20 RPM / 50–1000 RPD. Cerebras public endpoints are down to two models with a very tight free trial. **Gemini's OpenAI-compatible endpoint is the best free quality/limit combo** (free tier: ~10 RPM, 250K TPM, hundreds-to-1500 RPD). Practical recommendation: a **provider cascade** (Gemini → Groq → OpenRouter → local) behind Aurelia's existing `/api/stylist` route.
3. **The PWA API stack Aurelia hasn't used yet is now cross-browser enough to matter.** Same-document **View Transitions** just went universal (Chrome 111, Safari 18, Firefox 144). **Web Share Target** (Android) + **File Handling** (desktop Chromium) let the OS feed photos directly into Aurelia's *on-device* palette/outfit engines. `navigator.storage.persist()` is universal (Chrome 55 / FF 57 / Safari 15.2) and should be called to protect the user's season profile. Badging works on iOS home-screen web apps (16.4+) and desktop Chromium — but **not** on Android Chrome.
4. **Top implement-now ideas:** (a) WebMCP tool server for Aurelia's engines, (b) Share-to-Analyze pipeline (share_target → on-device k-means/ΔE2000), (c) portable zero-party "Beauty Passport" export. All are small, private-by-design, and not present in any benchmarked competitor.

---

## §1 WebMCP Deep-Dive

### 1.1 What it is (and what it is not)

WebMCP = "Web Model Context Protocol": a proposed **browser-native way for a web page to expose its functionality as structured tools** that AI agents (browser-integrated agents, agents in iframes, or assistive tech) can discover and call. A page using WebMCP is conceptually "an MCP server implemented in client-side script instead of on a backend."

Key clarification from the spec authors (Patrick Brosset, Edge team, Feb 2026): MCP is three layers — **primitives** (tools/resources/prompts), **data layer** (how client & server talk), **transport**. WebMCP only standardizes the **primitives layer**. The browser implements the other two: *"Implementation of the data layer to arbitrate access to these primitives for an Agent is left to the browser."* So there is **no page-level JSON-RPC endpoint to implement** — the page just registers JS functions; the browser translates to/from whatever the agent speaks.

- **Governance:** W3C **Web Machine Learning Community Group** (draft Community Group Report — *not* a W3C Standard, not on the standards track). Editors: Brandon Walderman (Microsoft), Khushal Sagar (Google), Dominic Farolino (Google). Repo: `github.com/webmachinelearning/webmcp` (~3.9k stars, very active).
- **Non-goals:** fully-autonomous/headless workflows, replacing backend MCP, replacing human UI. Site discoverability (knowing tools exist without visiting) is explicitly out of scope for now.
- TypeScript types ship as the **`webmcp-types`** npm package.

### 1.2 Spec evolution — critical for anyone who read a 2025 article

| Era | API surface | Status |
|---|---|---|
| Mid-2025 concept (pre-repo) ⚠️ *internal knowledge — not verifiable in current sources* | `<script type="application/mcp+json">` declarative JSON manifest + a `window.mcp` object; agent↔page messaging sketched as JSON-RPC-2.0-style request/notify over a browser-mediated channel | Never shipped; superseded. Widely repeated in press/third-party articles. **Not in any spec text I could fetch.** |
| Aug 13, 2025 first public proposal (`docs/proposal.html`) — ✅ verified | `navigator.modelContext.provideContext({tools: [...]})`, `registerTool()` / `unregisterTool()`; `agent.requestUserInteraction()` passed to `execute`; `window.agent.addEventListener('toolcall')` + `e.respondWith()` listed as a *considered alternative* | Historical |
| Feb 2026 (Brosset update; webfuse cheat sheet) — ✅ verified | `navigator.modelContext.registerTool()` (sync, `undefined` return), `unregisterTool(name)`, `ModelContextClient.requestUserInteraction()`, `annotations: {readOnlyHint}` | Historical (what most March-2026 tutorials show) |
| **Current: Sept 4, 2026 spec + README** — ✅ verified | **`document.modelContext`** (partial interface Document), Promise-returning `registerTool(tool, {signal, exposedTo})`, `getTools({fromOrigins})`, `executeTool(tool, input)` for **cross-origin tool calls**, `ontoolchange` event; `ToolAnnotations {readOnlyHint, untrustedContentHint, consequentialHint}`; declarative **HTML form** API; manifest-declared tools *rejected* ("Declaring tools solely in the Web App Manifest limits WebMCP to PWAs") | **The shape to code against (with feature detection)** |

**About `<script type="application/mcp+json">`:** as precisely as live research allows — this manifest shape (a JSON blob with a `tools` map, each tool carrying `description` + JSON-Schema `inputSchema`/`outputSchema`, discovered and invoked by the agent via a JSON-RPC 2.0-shaped channel) circulated in early coverage as "declarative WebMCP" ⚠️ *internal knowledge*. In the **current spec**, declarative WebMCP means something entirely different: **annotated HTML forms** (below). If you encounter `application/mcp+json` in an article, treat it as describing a pre-standard concept, not an implementable API. Aurelia should NOT emit that script tag; it does nothing in any shipping browser.

### 1.3 The current exact API shape (verified from the Sept 2026 spec IDL + README)

```webidl
partial interface Document {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};

[Exposed=Window, SecureContext]
interface ModelContext : EventTarget {
  Promise<undefined> registerTool(ModelContextTool tool,
      optional ModelContextRegisterToolOptions options = {});
  Promise<sequence<RegisteredTool>> getTools(optional ModelContextGetToolOptions options = {});
  Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject = {},
      optional ModelContextExecuteToolOptions options = {});
  attribute EventHandler ontoolchange;
};

dictionary ModelContextTool {
  required DOMString name;          // 1–128 chars; [A-Za-z0-9._-] only
  USVString title;                  // human-readable, for agent/native UIs
  required DOMString description;   // natural-language, for the agent
  object inputSchema;               // JSON Schema object
  required ToolExecuteCallback execute;
  ToolAnnotations annotations;
};

dictionary ToolAnnotations {
  boolean readOnlyHint = false;         // safe to call without user confirmation
  boolean untrustedContentHint = false; // output contains untrusted content
  boolean consequentialHint = false;    // changes state; deserves confirmation
};

callback ToolExecuteCallback = Promise<any> (object inputObject,
    ToolExecuteCallbackOptions options /* {signal: AbortSignal} */);

dictionary ModelContextRegisterToolOptions {
  sequence<USVString> exposedTo;  // cross-origin allow-list
  AbortSignal signal;             // abort → unregister
};
```

Canonical registration (README, current):

```js
const controller = new AbortController();
await document.modelContext.registerTool({
  name: "add-todo",
  description: "Add a new item to the user's active todo list",
  inputSchema: {
    type: "object",
    properties: { text: { type: "string", description: "The text content of the todo item" } },
    required: ["text"],
  },
  async execute({ text }) {
    await addTodoItemToCollection(text);
    // MCP-style structured return is recommended:
    return { content: [{ type: "text", text: `Added todo item: "${text}" successfully.` }] };
  },
}, { signal: controller.signal });
controller.abort(); // unregister
```

**How agents discover and call this (spec §5 + README):** (1) page registers tools; (2) an agent connected to the tab asks the browser for the active tool list + schemas (the agent never scrapes the page for this); (3) agent picks a tool and sends structured arguments validated against `inputSchema`; (4) the browser mediates the call — invokes `execute` in the page's event loop, sequentially, with the page's live state/session; (5) the resolved value returns to the agent. Cancellation is signaled via the `AbortSignal` in `ToolExecuteCallbackOptions` + a `toolcanceled` event. `getTools({fromOrigins})`/`executeTool()` also let one page call another origin's tools if that origin listed it in `exposedTo` (cross-origin tool sharing, gated by permissions policy).

### 1.4 Declarative WebMCP (the current form-based version) — ✅ verified

```html
<form toolname="search-cars" tooldescription="Perform a car make/model search" toolautosubmit>
  <input type="text" name="make" toolparamdescription="The vehicle's make (i.e., BMW, Ford)" required>
  <input type="text" name="model" toolparamdescription="The vehicle's model (i.e., 330i, F150)" required>
  <button type="submit">Search</button>
</form>
```

- `toolname` ↔ `ModelContextTool.name`; `tooldescription` ↔ `description`; `toolparamdescription` on controls ↔ property descriptions; the browser **synthesizes a JSON Schema** from the form.
- `toolautosubmit` lets the agent submit on the user's behalf; without it the browser focuses the submit button and the user confirms — human-in-the-loop by default.
- Responses return to the agent either via **`SubmitEvent#respondWith()`** (JS overrides the default action, pipes a structured response back without navigation) or by extracting `<script type="application/ld+json">` from the navigated page (structured data as tool output).
- Schema synthesis from `<input>`/`<select>` constraints (`enum`, `min`, `step`) is still a loose Chromium implementation under trial. ChatGPT's site tools **do not support the declarative API yet** — register tools in the top-level page with JS.

### 1.5 Security & privacy model — ✅ verified from spec §6 + Chrome docs + ChatGPT docs

- **SecureContext only** (HTTPS). **Origin-isolation required**: WebMCP APIs are disabled if the document uses `document.domain` or opts out of origin keying (`Origin-Agent-Cluster: ?0`).
- **Permissions Policy gate**: new **`tools`** policy, default `self` — enabled in top-level windows and same-origin iframes; cross-origin iframes need `allow="tools"` **and** the tool must list that origin in `exposedTo`.
- **Human-in-the-loop**: the spec's answer to consequential actions is the annotation set (`consequentialHint`) plus agent-side confirmation UX (earlier draft had `agent.requestUserInteraction()`; Chrome docs recommend a confirmation step for purchases/sensitive actions; ChatGPT performs a **per-invocation safety review** and ties each invocation to its originating page/registration).
- **Prompt-injection threat model is written into the spec** (§6.3): tool poisoning via `description` (metadata attacks), output injection, privacy leakage through over-parameterized schemas (e.g., a "search-dresses" tool whose schema quietly asks for `age`, `location`, `previousPurchases` — the spec uses exactly this example), and misrepresentation of intent (ambiguous `finalizeCart` that actually purchases). Mitigations specified: max input lengths, `untrustedContentHint` on responses containing UGC, `consequentialHint`, shared attack-eval datasets. **Design rule for Aurelia: keep tools read-only, narrow, and never put user PII in schemas or outputs.**
- ChatGPT's shipped controls: "Enable site tools" toggle in Settings › Browser › Permissions; "Site tools" indicator in the address bar; Sources panel listing recent tool calls; per-invocation review; tool definitions/results treated as untrusted content.

### 1.6 Browser & agent implementation status — ✅ verified (`implementation-status.md`, Sept 2026)

| Runtime | Status |
|---|---|
| **Chrome** | **Origin Trial live in Chrome 149**; local dev via `chrome://flags/#enable-webmcp-testing`; Early Preview Program; Intent to Experiment filed |
| **Edge** | **Origin Trial live in Edge 150** (Microsoft Edge Origin Trials page) |
| **ChatGPT Desktop** | **Shipped in production** ("Site tools") in the built-in browser; used by ChatGPT Work + Codex; currently a subset: imperative top-level-page tools only (no declarative, no iframes); GPT-5.6 Sol/Terra models enabled, Luna disabled; not in Enterprise/Edu |
| **Brave** | Experimental in Leo AI chat (issue 55232) |
| **Firefox / Safari** | Standards-position discussions only (Mozilla standards-positions, WebKit standards-positions) |
| **Tooling** | "Model Context Tool Inspector" Chrome extension (list/manually call tools, validate schemas, chat with an agent — defaults to `gemini-3-flash-preview`); Angular has experimental WebMCP support; `webmcp-types` on npm; WPT test suite at wpt.fyi/results/webmcp |

### 1.7 Real implementation examples (all ✅ verified)

1. **ChatGPT Desktop "Site tools"** (production): e.g. **OpenAI Learn/Developers docs** expose `search_openai_docs`, `lookup_page`, `lookup_context`, `navigate_to_page`, `generate_custom_guide`; **Margin** (local-first writing app) exposes 10 tools (3 read, 7 write) — surfaced in the browser UI with a per-site review panel.
2. **Chrome/Edge origin-trial demos**: **zaMaker** (imperative), **Travel demo (React)** (imperative), **Le Petit Bistro** (declarative forms) — source on GitHub.
3. **OpenAI WebMCP Challenge** (Aug 25–Sep 4, 2026; $3k × 10 winners; judges from Chrome, Cloudflare, Vercel, Shopify, Netlify): showcased **Wandernote** (travel-notes → itinerary, agent leaves comments), **Crossword Builder**, **3D Modeling** (agent refines a live scene), **Data Exploration** (DuckDB-Wasm + custom visualizations), collaborative writing. A public "WebMCP showcase" directory exists.
4. **Brave Leo** experimental agent integration.
5. **MCP-B / browser-agent ecosystem** (docs.mcp-b.ai, Alex Nahas — challenge judge): sibling protocol lineage for browser-exposed tools; ChatGPT's site-tools docs cross-reference it.

### 1.8 Concrete Aurelia WebMCP integration (recommended shape)

Recommended: **one client-side module**, feature-detected, registered after hydration, all tools **read-only** (`readOnlyHint: true`), grounded in Aurelia's existing pure-TS engines (`analyzeOutfit`, `classifySeason`, `getMatchesFor`, `buildRoutine`, `search`, `hexDeltaE`). Register only what's contextual (avoid overloading agent context windows — a spec best practice). No PII in schemas; the user's stored profile is only referenced if already computed.

```ts
// src/lib/webmcp.ts — progressive enhancement; zero cost when unsupported
import { analyzeOutfit } from "./outfit-engine";
import { classifySeason, seasonById, rateColorForSeason } from "../data/seasons";
import { getMatchesFor, wardrobeColors, colorById } from "../data/colors";
import { buildRoutine, actives, activeById } from "../data/actives"; // buildRoutine from routine-engine
import { search } from "./search";

type Tool = Parameters<NonNullable<
  Document["modelContext"]
>["registerTool"]>[0];

export function registerAureliaTools() {
  // Compat shim: current spec = document.modelContext (Promise-based registerTool);
  // Feb-2026 era = navigator.modelContext (sync). Detect both.
  const mc = (document as any).modelContext ?? (navigator as any).modelContext;
  if (!mc?.registerTool) return;
  const reg = (t: any, opts?: any) => mc.registerTool(t, opts);

  // 1) Outfit scoring (deterministic, explainable — returns the engine's factor breakdown)
  reg({
    name: "score_outfit",
    title: "Score an outfit",
    description:
      "Scores a 1–5 color outfit (hex list) with Aurelia's CIELAB/CIEDE2000 engine: " +
      "hue geometry, lightness spread, chroma coherence, warmth coherence, neutral anchor, " +
      "60-30-10 role assignment, and (if the user has a season result) season fit. Returns score, verdict, and per-factor explanations.",
    inputSchema: {
      type: "object",
      properties: {
        colors: {
          type: "array", minItems: 2, maxItems: 6,
          items: { type: "string", pattern: "^#[0-9a-fA-F]{6}$", description: "Hex color, e.g. #C97B58" },
          description: "The outfit's colors (2–6).",
        },
      },
      required: ["colors"],
    },
    annotations: { readOnlyHint: true },
    async execute({ colors }: { colors: string[] }) {
      const season = useAureliaStore.getState().seasonResult; // saved user season, if any
      const a = analyzeOutfit(colors, season ? seasonById(season.seasonId) : null);
      return {
        content: [{ type: "text", text: `Outfit score ${a.score}/97 — ${a.verdict}` }],
        score: a.score, verdict: a.verdict,
        factors: a.factors,           // [{ name, status, value, why }]
        roles: a.roles,               // 60-30-10 assignment
        seasonFit: a.seasonFit,       // optional
      };
    },
  });

  // 2) Season lookup / classification
  reg({
    name: "get_season",
    title: "Personal color season",
    description:
      "Returns the user's saved 12-season personal-color result (Dark Autumn, Cool Summer, …) with palette, " +
      "metals, makeup and hair guidance — or classifies a new one from 7 diagnostic answers (warmth/depth/chroma/contrast).",
    inputSchema: {
      type: "object",
      properties: {
        answers: {
          type: "array", minItems: 7, maxItems: 7, items: { type: "integer", minimum: 0, maximum: 3 },
          description: "Optional: answers (0–3) to Aurelia's 7 season questions, in order. Omit to return the saved result.",
        },
      },
    },
    annotations: { readOnlyHint: true },
    async execute({ answers }: { answers?: number[] }) {
      const r = answers ? classifySeason(answers) : useAureliaStore.getState().seasonResult;
      if (!r) return { content: [{ type: "text", text: "No saved season; pass 7 answers to classify." }] };
      const s = seasonById(r.seasonId)!;
      return {
        content: [{ type: "text", text: `Season: ${s.name}. Confidence ${Math.round(r.confidence * 100)}%.` }],
        season: s.name, confidence: r.confidence,
        palette: s.palette.map((p) => p.hex), metals: s.metals, avoid: s.avoid,
      };
    },
  });

  // 3) Matching colors for a wardrobe color
  reg({
    name: "find_matching_colors",
    title: "Find matching colors",
    description:
      "Given a wardrobe color id or hex, returns colors that pair well (with reasons), CIEDE2000 distances, " +
      "and — if the user has a season — how well each rates for their season.",
    inputSchema: {
      type: "object",
      properties: {
        color: { type: "string", description: "Wardrobe color id (e.g. 'camel', 'burgundy') or #rrggbb hex." },
        count: { type: "integer", minimum: 1, maximum: 12, description: "Max matches to return (default 6)." },
      },
      required: ["color"],
    },
    annotations: { readOnlyHint: true },
    async execute({ color, count = 6 }: { color: string; count?: number }) {
      const known = colorById(color) ?? wardrobeColors.find((c) => c.hex.toLowerCase() === color.toLowerCase());
      if (!known) {
        // unknown hex: still score it against the user's season palette via ΔE2000
        const season = useAureliaStore.getState().seasonResult;
        if (season) {
          const r = rateColorForSeason(color, seasonById(season.seasonId)!);
          return { content: [{ type: "text", text: `Unknown wardrobe color; season rating: ${r.verdict} (ΔE ${r.delta.toFixed(1)}).` }], rating: r };
        }
        return { content: [{ type: "text", text: "Unknown color id." }] };
      }
      const matches = getMatchesFor(known.id).slice(0, count)
        .map(({ color: c, why }) => ({ id: c.id, name: c.name, hex: c.hex, why }));
      return { content: [{ type: "text", text: `Matches for ${known.name}: ${matches.map((m) => m.name).join(", ")}` }], matches };
    },
  });

  // 4) Routine builder (AM/PM sequencer)
  reg({
    name: "get_routine",
    title: "Build a skincare routine",
    description:
      "Builds an AM/PM routine from selected actives (ids), sequenced by pH, slot, photosensitivity and the " +
      "conflict/synergy matrix, with step-by-step instructions and warnings.",
    inputSchema: {
      type: "object",
      properties: {
        activeIds: {
          type: "array", minItems: 1, maxItems: 12,
          items: { type: "string", enum: actives.map((a) => a.id) },
          description: "Actives the user has, e.g. ['retinol','vitamin-c','glycolic-acid'].",
        },
      },
      required: ["activeIds"],
    },
    annotations: { readOnlyHint: true },
    async execute({ activeIds }: { activeIds: string[] }) {
      const plan = buildRoutine(activeIds);
      return {
        content: [{ type: "text", text: `AM ${plan.am.length} steps / PM ${plan.pm.length} steps, ${plan.conflicts.length} conflicts.` }],
        am: plan.am, pm: plan.pm, conflicts: plan.conflicts, warnings: plan.warnings,
      };
    },
  });

  // 5) Ingredient conflict check
  reg({
    name: "check_ingredient_conflict",
    title: "Check ingredient conflict",
    description:
      "Checks two skincare actives for conflicts or synergy (e.g. retinol × glycolic acid), with the fix (alternate nights, buffer, order).",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "string", enum: actives.map((x) => x.id) },
        b: { type: "string", enum: actives.map((x) => x.id) },
      },
      required: ["a", "b"],
    },
    annotations: { readOnlyHint: true },
    async execute({ a, b }: { a: string; b: string }) {
      const conflict = activeById(a)?.conflicts.find((c) => c.with === b);
      const synergy = activeById(a)?.synergies.find((s) => s.with === b);
      const verdict = conflict ? "conflict" : synergy ? "synergy" : "compatible";
      return {
        content: [{ type: "text", text: conflict ? `Conflict: ${conflict.why}. Fix: ${conflict.fix}` : `${a} + ${b}: ${verdict}` }],
        verdict, why: conflict?.why ?? synergy?.why ?? null, fix: conflict?.fix ?? null,
      };
    },
  });

  // 6) Knowledge search (grounded, no hallucination surface)
  reg({
    name: "search_knowledge",
    title: "Search Aurelia's knowledge base",
    description:
      "Searches Aurelia's curated beauty/style knowledge (colors, makeup order, skin types, ingredients, hairstyles, tips) and returns snippets with deep links (#/tab routes).",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Search terms, e.g. 'retinol', 'date night hair'." }, limit: { type: "integer", minimum: 1, maximum: 10 } },
      required: ["query"],
    },
    annotations: { readOnlyHint: true },
    async execute({ query, limit = 5 }: { query: string; limit?: number }) {
      const hits = search(query, limit).map((h) => ({ title: h.title, tab: h.tab, snippet: h.snippet?.slice(0, 200) }));
      return { content: [{ type: "text", text: hits.map((h) => h.title).join("; ") || "No results" }], results: hits };
    },
  });
}

// Declarative alternative for the search form (works in Chromium trials, not yet in ChatGPT):
// <form toolname="search_knowledge" tooldescription="Search Aurelia's beauty & style knowledge base">
//   <input name="query" toolparamdescription="Search terms" required>
// </form>
```

Notes: (a) call `registerAureliaTools()` from a client effect *after* store rehydration; (b) keep total tool count low and re-register contextually (spec best practice: don't overload the agent's context window); (c) `title` matters — it renders in agent UIs; (d) mark everything `readOnlyHint: true` — these tools change no state, so agents can call them without confirmation friction; (e) treat this as an origin-trial-gated experiment: wrap registration in try/catch and expect the surface (`document.modelContext` vs `navigator.modelContext`) to keep moving for another year.

---

## §2 Free / OpenAI-Compatible Provider Matrix (live-verified 2026-09-08)

All providers below speak the **OpenAI Chat Completions wire format** (`POST {base}/chat/completions`, `Authorization: Bearer KEY`, SSE when `stream: true`). Streaming is uniform: `Content-Type: text/event-stream`, lines of `data: {json}` with `choices[0].delta.content`, terminated by `data: [DONE]` ⚠️ (standard OpenAI SSE; verified for Groq/Gemini via their docs' `stream:true` examples; treat minor per-provider extras like Groq's `x_groq` usage chunk as internal knowledge).

| Provider | Endpoint (base URL) | Auth | Free tier (live-verified) | Current model IDs (examples) | Gotchas |
|---|---|---|---|---|---|
| **Groq** | `https://api.groq.com/openai/v1` | `Bearer GROQ_API_KEY` | Per-model, org-level. **gpt-oss-120b / gpt-oss-20b: 30 RPM, 1K RPD, 8K TPM, 200K TPD** · qwen3.6-27b / qwen3.8-27b / gpt-oss-safeguard-20b: same · groq/compound(-mini): 30 RPM, 250 RPD, 70K TPM · whisper: 20 RPM, 2K RPD, 7.2K audio-sec/hr | `openai/gpt-oss-120b` (~500 t/s, 131K ctx), `openai/gpt-oss-20b` (~1000 t/s), `qwen/qwen3.6-27b`, `qwen/qwen3.8-27b`, `groq/compound`, `groq/compound-mini`, `openai/gpt-oss-safeguard-20b`, `whisper-large-v3(-turbo)` | **`llama-3.3-70b-versatile` + `llama-3.1-8b-instant` deprecated (shutdown 2026-08-16; enterprise-only now) — migrate to gpt-oss-120b/20b.** `kimi-k2-instruct` no longer in production list (verify before use). Cached tokens don't count toward limits (huge for a fixed system prompt). 429 + `retry-after` + `x-ratelimit-*` headers documented. Unsupported OpenAI fields (logprobs, logit_bias, messages[].name, N>1) → 400. `temperature:0` → coerced to 1e-8. |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `Bearer OPENROUTER_API_KEY` + optional `HTTP-Referer` (site URL) + `X-Title` / `X-OpenRouter-Title` (app name — powers openrouter.ai rankings) | `:free` model variants: **20 RPM; 50 RPD if lifetime credits < $10, 1000 RPD if ≥ $10**. Negative balance blocks even free models (402). Check quota: `GET /api/v1/key`. | Live `/v1/models` query (16 free today): `nvidia/nemotron-3.5-lightning:free` (1M ctx), `nvidia/nemotron-3-ultra-550b-a55b:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`, `thinkingmachines/inkling:free`, `inclusionai/ling-3.0-flash-sante:free` (health-tuned!), `liquid/lfm-2.5-2.6b:free`, `cohere/north-mini-code:free`, … | Free pool **rotates constantly** (the 2025-era deepseek/llama free tiers are gone; don't hardcode). Streaming SSE may interleave `: OPENROUTER PROCESSING` comment lines — ignore them. 429 can be OpenRouter's cap or upstream; use `models[]` fallback routing. Data-logging policies vary per provider. |
| **Cerebras** | `https://api.cerebras.ai/v1` | `Bearer CEREBRAS_API_KEY` | **Free Trial tier** (dual token buckets, uncached+total): gpt-oss-120b **5 RPM, 30K uncached TPM / 90K total, 1M TPH, 1M TPD**; qwen-3.8-27b 1 RPM, same buckets. Token-bucket replenishes continuously (no interval reset) | Public endpoints only two models: `gpt-oss-120b` (~3000 t/s, 65K free/131K paid ctx), `qwen-3.8-27b` (~1500 t/s, multimodal) | Free tier is now **very** tight (5/1 RPM). Desktop-class speed. `n:1` only; `prediction`/`service_tier` unsupported on shared endpoints; image inputs must be **base64 data URIs** (no external URLs). Developer tier: gpt-oss-120b 1K RPM / 1M TPM. |
| **Google Gemini (OpenAI-compat)** | `https://generativelanguage.googleapis.com/v1beta/openai/` | `Bearer GEMINI_API_KEY` | **Free tier** (project-level): ~**10 RPM, 250K TPM**, hundreds–1500 RPD depending on model ⚠️ (per-model RPD not published in a fetchable table; AI Studio shows exact per-project limits; community data: Gemini 3 Flash ≈ 10 RPM/250K TPM/1500 RPD; 2.5-class flash historically 250 RPD). No spend cap on free (spend-based 429s begin at Tier 1) | `gemini-3.8-flash` (newest stable), `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemini-2.0-flash`, `gemini-2.0-flash-lite` (2.x still listed/served) | Best free quality + generous limits. Natively multimodal via `image_url` (base64) — useful for future photo features with consent. Rate limits per **project** not per key. RPD resets midnight Pacific. `429 RESOURCE_EXHAUSTED` on spend limits. Free tier data may be used to improve products (check current ToS for the "free tier training" clause) ⚠️. |
| **Mistral** | `https://api.mistral.ai/v1` | `Bearer MISTRAL_API_KEY` | **Free "Experiment" tier**: rate-limited access to *all* API models, ≈**1 req/sec global per key**, ≈**1B tokens/month** cap ⚠️ (exact per-model limits no longer published — see Admin Console › API › Limits); SMS verification, no credit card | `mistral-small-3.2` (or current Small), `mistral-large-latest`, `ministral-3b/8b`, `codestral`, `devstral-small`, `voxtral` | Evaluation-only tier (not production). Model naming churns (`mistral-small-24b-instruct-2501` era → `mistral-small-3.2`); use `GET /v1/models` to list. Per-second limit makes it a bad primary for bursts. |
| **Chrome built-in AI (Prompt API)** | in-page: `LanguageModel` (no HTTP) | none — permission-less, on-device | **Free, unlimited, offline** after one-time Gemini Nano download. **Chrome 148+ desktop only** (Win 10/11, macOS 13+, Linux, ChromeOS Chromebook Plus). Needs ≥22GB disk free (model auto-removed <10GB), >4GB VRAM or 16GB RAM + 4 cores, unmetered connection for download. No data leaves the device. | `LanguageModel.create({systemPrompt, initialPrompts, temperature, topK, signal, monitor})`; `session.prompt()` / `promptStreaming()`; JSON-schema output via `responseFormat` in `prompt()`; `LanguageModel.availability()` | **Not on Android/iOS** — useless for Aurelia's mobile-first audience but a great desktop fallback. Small model: keep the system prompt tight and ground it with retrieved KB snippets. Sampling params on the web are gated behind an origin trial (`samplingMode` presets only). Types: `@types/dom-chromium-ai`. |
| **Generic custom OpenAI-compatible** | e.g. Ollama `http://localhost:11434/v1` · LM Studio `http://localhost:1234/v1` · vLLM `http://host:8000/v1` · any BYO gateway | `Bearer` (Ollama ignores; LM Studio `X-Api-Key` or none) | Free/local — user's own hardware | any local GGUF (qwen2.5-0.5b/1.5b, SmolLM2, Llama-3.2-1B…) | Server-side route must whitelist base URLs; never expose user-chosen base URLs to the client without SSRF protection. Useful as final cascade hop for power users. |

**Recommended architecture for Aurelia's `/api/stylist`:** keep the z-ai SDK route as primary (already deployed and battle-tested), add an env-driven provider cascade `GEMINI_API_KEY → GROQ_API_KEY → OPENROUTER_API_KEY` using one tiny OpenAI-compatible `fetch` wrapper (they all share the wire format), each with its own model id and 429/`retry-after` backoff, and cache the grounding system prompt (Groq prompt caching makes repeat turns nearly free). Surface a "offline/limited" state in the chat UI when all providers fail. All keys stay server-side (already the project's hygiene rule).

---

## §3 Modern PWA APIs — Quick Reference (support data pulled live from MDN browser-compat-data, 2026-09-08)

### 3.1 Web Share Target (receive shares, incl. images) — Chromium-only

Support: Chrome/Edge **Android** (installed PWA only) + ChromeOS/Windows desktop ⚠️ (BCD doesn't track manifest members; caniuse shows Chromium-only). Not Firefox, not Safari/iOS. Requires **installed** PWA.

```jsonc
// manifest.json additions
{
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "link",
      "files": [{ "name": "images", "accept": ["image/jpeg", "image/png", "image/webp"] }]
    }
  }
}
```

```js
// sw.js — intercept the POST, stash the file, redirect, then notify the client
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/share-target") return;
  event.respondWith((async () => {
    const formData = await event.request.formData();
    const files = formData.getAll("images").filter((f) => f instanceof File);
    // Hand off via Cache Storage (or IndexedDB) — SW can't pass File objects to clients
    const cache = await caches.open("share-inbox");
    await cache.put("/share-inbox/last", new Response(await files[0].arrayBuffer(), {
      headers: { "content-type": files[0].type, "x-filename": encodeURIComponent(files[0].name) },
    }));
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients[0]?.postMessage({ type: "shared-image", name: files[0].name, mime: files[0].type });
    return Response.redirect("/#/colors", 303); // 303 avoids re-POST on refresh
  })());
});
```

Client side: `navigator.serviceWorker.addEventListener("message", …)` → fetch `/share-inbox/last` from the cache → run `extractPalette()` (k-means++ over Lab pixels) → season-rate the swatches → route to the Photo Analyzer / Outfit Lab. Everything stays on-device.

### 3.2 File Handling API (desktop "Open with…") — Chromium-only

Support: `LaunchQueue` — Chrome/Edge **102+ desktop**; `false` in Firefox/Safari/Android (live BCD).

```jsonc
// manifest.json
{
  "file_handlers": [
    {
      "action": "/",
      "accept": { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
      "icons": [{ "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" }],
      "launch_type": "single-client" // or "multiple-clients"
    }
  ]
}
```

```ts
if ("launchQueue" in window) {
  (window as any).launchQueue.setConsumer(async (params: any) => {
    const [handle] = params.files ?? [];
    if (!handle) return;
    const file = await handle.getFile();
    openPhotoAnalyzer(file); // same on-device pipeline as share-target
  });
}
```

### 3.3 Badging API — Chrome desktop + Safari/iOS home-screen; **not Android Chrome**

Support (live BCD): `setAppBadge` Chrome 81 (Win/macOS; ChromeOS 91; no Linux), Edge mirror, **chrome_android: false**, Firefox false, Safari 17 (installed web apps on macOS Sonoma+), **Safari iOS 16.4+ (home-screen web apps)**. `clearAppBadge`: same but Android 81.

```ts
// routine adherence: pending AM/PM steps
const pending = amSteps.filter((s) => !s.done).length + pmSteps.filter((s) => !s.done).length;
try {
  if (pending > 0) await navigator.setAppBadge(pending); // numeric badge
  else await navigator.clearAppBadge();
} catch { /* unsupported — no-op */ }
```

### 3.4 Storage persistence — universal, do this now

Support (live BCD): `navigator.storage.persist()` — Chrome 55, Edge mirror, Firefox 57, Safari 15.2, iOS mirror. `estimate()` — Chrome 61 / FF 57 / Safari 17. Firefox prompts the user ⚠️ (UA-dependent), Chromium auto-grants for installed PWAs.

```ts
async function protectProfile() {
  if (!navigator.storage?.persist) return;
  const already = await navigator.storage.persisted();
  if (!already) await navigator.storage.persist(); // best after install + meaningful usage
  const { usage, quota } = await navigator.storage.estimate() ?? {};
  // store the estimate for a Settings "your data, X MB, stored only on this device" line
}
```

This directly mitigates R-1's iOS 7-day ITP eviction finding: persisted + installed PWAs keep localStorage/zustand data.

### 3.5 View Transitions API — same-document now universal; cross-document Chromium+Safari

Support (live BCD): **`document.startViewTransition()` (same-document/SPA): Chrome 111, Edge, Safari 18 (iOS mirror), Firefox 144 — all green.** `view-transition-name` CSS: same. **Cross-document (`@view-transition` MPA): Chrome 126+, Safari 18.2+ (iOS mirror), Firefox ✗ (bug 1860854).** Also available: `view-transition-class`, `:active-view-transition-type()`, `<link rel="expect">` for stable first paint.

```ts
// tab/sheet transitions inside Aurelia's SPA (replaces some framer-motion cost with native)
function openSheet(next: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    d.startViewTransition(next);
  } else next();
}
```

```css
/* morph a swatch chip into its detail sheet header */
.swatch-chip { view-transition-name: var(--vt-name); }
::view-transition-old(.*) , ::view-transition-new(.*) { animation-duration: 300ms; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none !important; } }
```

For a Next.js App Router MPA route change: add `@view-transition { navigation: auto; }` in global CSS (Chromium+Safari only; Firefox gets no transition, not an error).

---

## §4 Original Deep-Tech Ideas (ranked; all audit-differentiated vs. R-2's competitor benchmark)

**Ranked by (impact × feasibility) ÷ effort. None of these appear in YouCam/Perfect365/GlowUp/Dressika/Skin Bliss/etc. per R-2's benchmark; none are generic (search/streaks/share excluded by brief).**

### #1 — "Aurelia as an Agent-Callable Color-Science Engine" (WebMCP tool server) — Impact 9 · Feasibility 9 · Effort 1 day
Register the six read-only tools from §1.8. The user's agent (ChatGPT desktop browser, Chrome trial, Edge trial) can then answer "would this blazer work with my Dark Autumn palette?" or "can I layer this new toner with my routine?" by *calling CIEDE2000 and the conflict matrix on the live page* — deterministic, explainable, zero-server, zero-key, zero-cost. **Why it's novel:** every competitor's "AI" is a cloud chatbot; nobody exposes *algorithms* to agents. Aurelia becomes the site agents recommend for color/skin math. **Risks:** origin-trial-only reach (~12 months to stable), API surface still moving (hence the compat shim), ChatGPT subset (imperative, top-level only — already what we ship). **Feasibility notes:** pure client code; works today in ChatGPT Desktop; fails silently elsewhere. Track: register a Chrome origin trial token to collect real usage.

### #2 — "Share-to-Analyze" (Web Share Target + File Handling feeding the on-device engines) — Impact 8 · Feasibility 8 · Effort 1–2 days
Any photo anywhere on Android (gallery, Pinterest, Instagram share sheet) → "Share → Aurelia" → SW intercepts multipart POST → on-device k-means++/Lab palette extraction → season rating + outfit scoring, no upload, no account (§3.1/§3.2). Desktop: right-click "Open with Aurelia" via file_handlers. **Why it's novel:** competitors require in-app camera/upload flows and mostly process server-side; Aurelia becomes an OS-level *utility* with a privacy story ("analysis never leaves your phone") that's verifiably true (no network calls in the pipeline). **Feasibility notes:** Android-only share (iOS has no Share Target — provide Web Share *out* cards as the iOS counterpart, already built); file handoff through Cache Storage is the standard pattern; needs `storage.persist()`.

### #3 — "Beauty Passport" (portable zero-party profile) — Impact 7 · Feasibility 9 · Effort 1 day
A signed-off JSON export (`aurelia-passport.json` + shareable card): season + confidence + signal vector (warmth/depth/chroma/contrast), undertone, skin type, saved palette hexes, routine active ids, favorite colors. Export via Web Share API (existing canvas cards) or download; import via File Handling/drag-drop; *optionally* readable by the user's AI agent via a `get_profile` WebMCP tool with explicit user consent each time. **Why it's novel:** zero-party data portability for beauty doesn't exist — profiles are siloed accounts; the "passport" reframes Aurelia's profile as the user's property and makes the data interoperate with the emerging agent ecosystem (agents can dress the user *across* shopping sites using the passport). **Feasibility notes:** trivial (store schema → JSON); the consent gating for the agent tool is the only design work. Privacy: never auto-attach; explicit export only.

### #4 — "Explainable Evidence Cards" (surface the math) — Impact 6 · Feasibility 10 · Effort 1–2 days
Every result currently renders human explanations; add a "show the math" disclosure: ΔE2000 values with the component breakdown (ΔL′, ΔC′, ΔH′), contrast ratios vs WCAG thresholds, hue-geometry classification, the season classifier's signal vector and nearest-archetype distances, routine pH/slot reasoning. **Why it's novel:** Dressika/Colorwise are black boxes; no beauty app publishes its algorithmic evidence. Converts the "research-level engines" into a *trust* feature and a differentiator for press ("the app that shows its work"). **Feasibility notes:** pure UI over existing outputs; must pair with plain-language framing (the numbers are credibility, not the message).

### #5 — "Offline Stylist Cascade" (Chrome built-in AI + provider chain) — Impact 6 · Feasibility 5 · Effort 2–3 days
On Chrome desktop with Gemini Nano present, serve stylist chats fully offline via `LanguageModel` with a grounded system prompt (retrieved KB snippets); fall back to the server cascade (§2) elsewhere. **Why it's novel:** offline *content* is table stakes; offline *AI chat* in a beauty PWA is unheard of, and the privacy claim ("this conversation never left your device") is a marketable, honest claim. **Feasibility notes:** desktop-only (mobile excluded — Chrome built-in AI unavailable on Android/iOS), Gemini Nano is small (quality constrained — keep persona + retrieval tight, hide behind feature detection), model download UX must be explicit. Treat as experiment; the server cascade is the dependable path.

(Considered and parked: transformer.js/WebLLM full in-browser models — 300MB–2GB downloads are a non-starter for a mobile beauty PWA; WebNN — pre-standard; cross-document view transitions — Firefox missing.)

---

## §5 What to Implement Now vs. Later

| Priority | Item | Why now / why later |
|---|---|---|
| **P0 now** | §3.4 `navigator.storage.persist()` + Settings storage line | 5 lines, universal support, protects season/routine data (fixes R-1's ITP-eviction risk). |
| **P0 now** | §3.1/§3.2 Share-to-Analyze (manifest + SW fetch handler + Cache handoff) | Small, Android-installable today, feeds engines that already exist; biggest "wow per line of code." iOS keeps Web Share *out* cards. |
| **P1 now** | §1.8 WebMCP tools (compat-shimmed) + Chrome origin-trial token | Progressive enhancement, zero risk, first-mover story; works in ChatGPT Desktop today. Revisit surface quarterly (spec is a moving target). |
| **P1 now** | §4 #3 Beauty Passport export/import | One day of work; locks in the zero-party positioning; compounds with WebMCP `get_profile`. |
| **P1 now** | §4 #4 Evidence cards (ΔE2000 breakdown) | Pure UI; strengthens the "deep-tech" positioning R-2 says is Aurelia's moat. |
| **P2 next** | §2 provider cascade behind `/api/stylist` (Gemini → Groq → OpenRouter) | Removes single-provider risk; keys are free; OpenRouter model ids must be **fetched dynamically** (`GET /api/v1/models`), never hardcoded. |
| **P2 next** | §3.5 same-document View Transitions for sheet/tab morphs | Now cross-browser (FF 144); replaces some framer-motion cost. Keep `prefers-reduced-motion` guards. |
| **P2 next** | §3.3 Badging for routine adherence | Cheap; works on iOS home-screen + desktop Chromium; Android unsupported (don't make it the only reminder signal — pair with push from R-1's plan). |
| **Later (watch)** | WebMCP declarative forms, cross-document view transitions, WebMCP in iframes | Spec/trial churn; ChatGPT doesn't support declarative yet; Firefox lacks cross-document VT. |
| **Later (experiment)** | §4 #5 Offline stylist via Chrome `LanguageModel` | Desktop-only + model-download UX; prototype behind a flag, gather signal. |

---

## Sources (live-fetched 2026-09-08 unless noted)

**WebMCP:** W3C Web Machine Learning CG — WebMCP Draft Community Group Report (webmachinelearning.github.io/webmcp, 2026-09-04) · webmachinelearning/webmcp GitHub README + `declarative-api-explainer.md` + `implementation-status.md` + `docs/proposal.html` (2025-08-13) · Chrome for Developers: WebMCP overview (developer.chrome.com/docs/ai/webmcp, updated 2026-08-07), WebMCP best practices & secure-tools pages · Patrick Brosset, "WebMCP updates, clarifications, and next steps" (2026-02-23) · ChatGPT Learn: "Site tools (WebMCP)" (learn.chatgpt.com/docs/webmcp) · OpenAI WebMCP Challenge (openai.com/webmcp-challenge) · webfuse WebMCP cheat sheet (2026-03-09) · Flavio Copes, "A deep dive into WebMCP" (2026-09-01) · Edge Origin Trials (developer.microsoft.com).

**Providers:** GroqDocs — Rate Limits, Supported Models, Model Deprecation, OpenAI Compatibility (console.groq.com) · grizzlypeaksoftware.com free-tier analysis (2026-03-27) · OpenRouter docs — API reference/overview, Limits, FAQ; live `GET https://openrouter.ai/api/v1/models` (429 models, 16 `:free`) · Cerebras Inference docs — Rate Limits, Model Catalog, OpenAI Compatibility (inference-docs.cerebras.ai, incl. llms.txt) · Google AI for Developers — Gemini API rate limits, models list, OpenAI compatibility (ai.google.dev) · Mistral docs — Usage and limits; pricepertoken.com Mistral free-tier summary (verified 2026-06) · Chrome for Developers — Prompt API (updated 2026-08-26), Built-in AI hub.

**PWA APIs:** MDN Web Docs — share_target manifest reference (2026-08-27), Web Share Target How-to, file_handlers reference (2025-11-13), Badging API / setAppBadge, View Transition API, Storage quotas & eviction · MDN browser-compat-data (raw GitHub main, fetched 2026-09-08): `api.Document.startViewTransition`, `api.Navigator.setAppBadge/clearAppBadge/share`, `api.StorageManager.persist/estimate`, `api.LaunchQueue`, `css.at-rules.view-transition`, `css.properties.view-transition-name` · Microsoft Edge PWA file-handling docs · WebKit blog "Badging for Home Screen Web Apps" · caniuse (cross-document view transitions).

⚠️ *Internal-knowledge-only items (could not be live-verified; treat as unconfirmed):* the pre-repo mid-2025 `<script type="application/mcp+json">` / `window.mcp` concept and its JSON-RPC-style channel; OpenAI SSE chunk field minutiae beyond `delta.content`/`[DONE]`; exact Gemini free-tier per-model RPD table; Gemini free-tier data-training ToS status; Ollama/LM Studio/vLLM endpoint conventions; Firefox `persist()` user-prompt behavior; Web Share Target desktop-Chromium availability.
