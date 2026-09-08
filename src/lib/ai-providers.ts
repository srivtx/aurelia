/* ============================================================
   AURELIA — AI provider registry (SERVER-SIDE ONLY)
   Free / OpenAI-compatible providers behind /api/stylist.

   Design decisions (docs/RESEARCH-DEEPTECH.md §2):
   - Model IDs churn quarterly → live discovery via GET {base}/models
     with a 10-min in-memory cache, curated fallbacks if discovery fails.
   - All providers speak the OpenAI Chat Completions wire format.
   - Keys NEVER leave the server. The client only sees provider ids,
     model ids and display labels.
   ============================================================ */

export interface ProviderDef {
  id: string;
  label: string;
  blurb: string;
  baseUrl: string;
  keyEnv: string; // env var that unlocks this provider
  keyUrl: string; // where a user gets a key
  freeNote: string;
  curated: { id: string; label: string; note?: string }[]; // fallback when discovery fails / not configured
  headers?: Record<string, string>;
  /* filter live /models list down to chat-capable models */
  pick?: (ids: string[]) => string[];
}

export interface ModelInfo {
  id: string;
  label: string;
  note?: string;
}

export interface ProviderStatus extends ProviderDef {
  configured: boolean;
  models: ModelInfo[];
  live: boolean; // models came from the provider's live API
}

/* prettify "openai/gpt-oss-120b" → "GPT-OSS 120B" */
function prettyModelLabel(id: string): string {
  const tail = id.includes("/") ? id.split("/").slice(-1)[0] : id;
  return tail
    .split(/[-_]/)
    .map((p) => (p === "3" || /^\d/.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ")
    .replace(/\bIt\b/, "IT")
    .replace(/\bB\b$/, "B");
}

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
    /* production chat models only — drop whisper/tts/guard/embed/rerank */
    pick: (ids) =>
      ids.filter(
        (m) =>
          !/whisper|tts|guard|embed|rerank|distil|safeguard|playai|preview/i.test(m) ||
          /gpt-oss|qwen|compound|kimi|llama/i.test(m)
      ),
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
    pick: (ids) => ids.filter((m) => /^gemini/i.test(m) && !/embedding|image|tts|native|audio|learnlm/i.test(m)),
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
    /* the free pool rotates — anything with :free works */
    pick: (ids) => ids.filter((m) => m.endsWith(":free")),
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

/* ---------- live model discovery (cached 10 min) ---------- */

interface CacheEntry {
  at: number;
  models: ModelInfo[];
}
const modelCache = new Map<string, CacheEntry>();
const CACHE_MS = 10 * 60 * 1000;
const MAX_MODELS = 12;

async function discoverModels(p: ProviderDef): Promise<ModelInfo[]> {
  if (p.id === "zai" || p.id === "custom") return [];
  const base = baseUrlOf(p);
  const key = process.env[p.keyEnv] ?? "";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${base}/models`, {
      headers: { Authorization: `Bearer ${key}`, ...(p.headers ?? {}) },
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { id?: string }[] };
    let ids = (json.data ?? []).map((m) => m.id ?? "").filter(Boolean);
    if (p.pick) ids = p.pick(ids);
    /* de-dup, keep deterministic order (sort by id) */
    ids = [...new Set(ids)].sort();
    return ids.slice(0, MAX_MODELS).map((id) => ({ id, label: prettyModelLabel(id) }));
  } catch {
    return [];
  }
}

export async function providerStatus(): Promise<ProviderStatus[]> {
  const out: ProviderStatus[] = [];
  for (const p of providers) {
    const configured = isConfigured(p);
    let models: ModelInfo[] = [];
    let live = false;
    if (p.id === "zai") {
      models = p.curated;
    } else if (p.id === "custom") {
      const m = process.env.AI_MODEL;
      models = m ? [{ id: m, label: prettyModelLabel(m) }] : [];
    } else if (configured) {
      const cached = modelCache.get(p.id);
      if (cached && Date.now() - cached.at < CACHE_MS) {
        models = cached.models;
        live = models.length > 0;
      } else {
        const found = await discoverModels(p);
        modelCache.set(p.id, { at: Date.now(), models: found });
        models = found;
        live = found.length > 0;
      }
    }
    /* merge: live models, plus curated ones that still exist live or as fallback */
    if (!models.length) models = p.curated.map((c) => ({ ...c }));
    out.push({ ...p, configured, models, live });
  }
  return out;
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

export const prettyLabel = prettyModelLabel;
