/* ============================================================
   AURELIA — AI provider registry (SERVER-SIDE ONLY)
   Free / OpenAI-compatible providers behind /api/stylist.

   Design decisions (docs/RESEARCH-DEEPTECH.md §2):
   - The END USER never sees or chooses a provider — that is an
     operator concern. The server resolves the provider from env
     (AI_PROVIDER pin, or auto-detect the first configured free
     tier), with the built-in model as the always-available floor.
   - If an external provider hiccups (429 / 401 / network), the
     route silently falls back to the built-in model so the chat
     never breaks for the user.
   - All providers speak the OpenAI Chat Completions wire format.
   - Keys NEVER leave the server. No provider or model ids are
     exposed to the client — not in UI, not in API responses.
   - Operators verify their setup with `node scripts/check-providers.mjs`.
   ============================================================ */

export interface ProviderDef {
  id: string;
  label: string;
  blurb: string;
  baseUrl: string;
  keyEnv: string; // env var that unlocks this provider
  keyUrl: string; // where an operator gets a key
  freeNote: string;
  curated: { id: string; label: string; note?: string }[]; // default model order
  headers?: Record<string, string>;
}

export interface ModelInfo {
  id: string;
  label: string;
  note?: string;
}
/* ModelInfo: shape used by scripts/check-providers.mjs output — kept for future server tooling. */

const providers: ProviderDef[] = [
  {
    id: "zai",
    label: "Aurelia Cloud",
    blurb: "Built-in model — works out of the box, no key needed.",
    baseUrl: "", // handled by z-ai-web-dev-sdk in the route
    keyEnv: "",
    keyUrl: "",
    freeNote: "Always on",
    curated: [{ id: "aurelia-default", label: "Aurelia editor (default)" }],
  },
  {
    id: "groq",
    label: "Groq",
    blurb: "Fastest free tier — GPT-OSS & Qwen on LPU inference.",
    baseUrl: "https://api.groq.com/openai/v1",
    keyEnv: "GROQ_API_KEY",
    keyUrl: "https://console.groq.com/keys",
    freeNote: "Free: ~30 req/min, 1k req/day",
    curated: [
      { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", note: "Best quality · ~500 t/s" },
      { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", note: "Fast · ~1000 t/s" },
      { id: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B" },
      { id: "groq/compound", label: "Groq Compound", note: "Agentic + tools" },
    ],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    blurb: "Best free quality-to-limit ratio via the OpenAI-compatible endpoint.",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyEnv: "GEMINI_API_KEY",
    keyUrl: "https://aistudio.google.com/apikey",
    freeNote: "Free: ~10 req/min, generous daily caps",
    curated: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", note: "Balanced" },
      { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", note: "Fastest" },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    blurb: "One key, 400+ models — 16 free right now (:free suffix).",
    baseUrl: "https://openrouter.ai/api/v1",
    keyEnv: "OPENROUTER_API_KEY",
    keyUrl: "https://openrouter.ai/keys",
    freeNote: "Free pool: 20 req/min · 50–1000 req/day",
    curated: [
      { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", note: "Free" },
      { id: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron Lightning", note: "Free · 1M context" },
      { id: "liquid/lfm-2.5-2.6b:free", label: "LFM 2.5", note: "Free · tiny" },
    ],
    headers: { "X-Title": "Aurelia" },
  },
  {
    id: "cerebras",
    label: "Cerebras",
    blurb: "Extreme speed (~3000 t/s) on a small free trial.",
    baseUrl: "https://api.cerebras.ai/v1",
    keyEnv: "CEREBRAS_API_KEY",
    keyUrl: "https://cloud.cerebras.ai",
    freeNote: "Trial: 5 req/min",
    curated: [
      { id: "gpt-oss-120b", label: "GPT-OSS 120B", note: "~3000 t/s" },
      { id: "qwen-3.8-27b", label: "Qwen 3.8 27B" },
    ],
  },
  {
    id: "mistral",
    label: "Mistral",
    blurb: "Free Experiment tier — all Mistral models, ~1 req/sec.",
    baseUrl: "https://api.mistral.ai/v1",
    keyEnv: "MISTRAL_API_KEY",
    keyUrl: "https://console.mistral.ai",
    freeNote: "Free tier available",
    curated: [
      { id: "mistral-small-latest", label: "Mistral Small" },
      { id: "open-mistral-nemo", label: "Mistral Nemo" },
    ],
  },
  {
    id: "custom",
    label: "Custom / Local",
    blurb: "Any OpenAI-compatible endpoint (Ollama, LM Studio, vLLM…).",
    baseUrl: "", // from AI_BASE_URL env
    keyEnv: "AI_API_KEY",
    keyUrl: "https://ollama.com",
    freeNote: "Bring your own server",
    curated: [], // uses AI_MODEL env
  },
];

export const providerById = (id: string): ProviderDef | undefined => providers.find((p) => p.id === id);

export function isConfigured(p: ProviderDef): boolean {
  if (p.id === "zai") return true;
  if (p.id === "custom") return Boolean(process.env.AI_BASE_URL);
  return Boolean(p.keyEnv && process.env[p.keyEnv]);
}

function baseUrlOf(p: ProviderDef): string {
  if (p.id === "custom") return (process.env.AI_BASE_URL ?? "").replace(/\/$/, "");
  return p.baseUrl.replace(/\/$/, "");
}

/* ---------- server-side provider resolution ---------- */

export interface ResolvedLLM {
  def: ProviderDef;
  model: string; // "" only possible for misconfigured custom
  pinned: boolean; // operator pinned via AI_PROVIDER (vs auto-detect)
}

/* Auto-detection priority: best free tiers first. The built-in model
   is always the floor — resolveProvider() never fails. */
const AUTO_PRIORITY = ["groq", "gemini", "openrouter", "cerebras", "mistral", "custom"];

function modelFor(def: ProviderDef): string {
  const pinned = (process.env.AI_MODEL ?? "").trim();
  if (pinned) return pinned;
  if (def.id === "custom") return (process.env.AI_MODEL ?? "").trim();
  return def.curated[0]?.id ?? "";
}

/* Decide which provider + model this deployment serves. ENV contract:
   - AI_PROVIDER: pin one provider id (groq|gemini|openrouter|cerebras|mistral|custom|zai)
   - AI_MODEL:    pin a specific model id at that provider (optional)
   - otherwise:   first provider with a key present (AUTO_PRIORITY), else built-in. */
export function resolveProvider(): ResolvedLLM {
  const pinnedId = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  if (pinnedId) {
    const def = providerById(pinnedId);
    if (def && isConfigured(def)) {
      const model = modelFor(def);
      if (model) return { def, model, pinned: true };
      console.warn(`[ai-providers] AI_PROVIDER=${pinnedId} has no model (set AI_MODEL) — auto-selecting`);
    } else {
      console.warn(`[ai-providers] AI_PROVIDER=${pinnedId} is not configured (missing key env) — auto-selecting`);
    }
  }
  for (const id of AUTO_PRIORITY) {
    const def = providerById(id);
    if (def && isConfigured(def)) {
      const model = modelFor(def);
      if (model) return { def, model, pinned: false };
    }
  }
  return { def: providerById("zai")!, model: "aurelia-default", pinned: false };
}

/* ---------- completion call (OpenAI-compatible, streaming) ---------- */

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  providerId: string;
  model: string;
  messages: ChatMsg[];
  signal?: AbortSignal;
}

/* Returns an SSE *text stream reader* or null if provider is the built-in zai. */
export function openAICompatibleStream(req: CompletionRequest): Promise<Response> | null {
  const p = providerById(req.providerId);
  if (!p || p.id === "zai") return null;
  const base = baseUrlOf(p);
  const key = p.keyEnv ? process.env[p.keyEnv] ?? "" : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
    ...(p.headers ?? {}),
  };
  return fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    signal: req.signal,
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 700,
    }),
  });
}

/* Parse one SSE chunk body → text deltas. Handles [DONE] and comment lines. */
export async function* sseDeltas(res: Response): AsyncGenerator<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue; /* ignores ": OPENROUTER PROCESSING" comments */
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? "";
        if (typeof delta === "string" && delta) yield delta;
      } catch {
        /* partial JSON → skip; buffered next round */
      }
    }
  }
}
