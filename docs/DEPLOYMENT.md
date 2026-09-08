# Deploying Aurelia — and wiring free AI models

Aurelia is a **Next.js 15 App Router** app (TypeScript, Tailwind v4). It works fully
out of the box with the built-in **Aurelia Cloud** stylist — no keys, no config.
This guide is for self-hosting and for plugging in **free third-party models**
(Groq, Gemini, OpenRouter, Cerebras, Mistral, or your own local LLM) with the
in-app model picker.

> Companion docs: [`CONTEXT.md`](./CONTEXT.md) (codebase map) ·
> [`RESEARCH-DEEPTECH.md`](./RESEARCH-DEEPTECH.md) (why these providers/APIs) ·
> [`RESEARCH-PWA-LAUNCH.md`](./RESEARCH-PWA-LAUNCH.md) + [`RESEARCH-BEAUTY-APP-UX.md`](./RESEARCH-BEAUTY-APP-UX.md)

---

## 1. Local development

```bash
git clone https://github.com/srivtx/aurelia
cd aurelia
bun install        # or npm install / pnpm install
bun run dev        # http://localhost:3000
```

Requirements: Node 18+ (or Bun 1.1+). No database needed — all content and engines
are pure TypeScript; the user profile lives in the browser (localStorage + PWA storage).

## 2. Free AI models — the 2-minute setup

The stylist chat talks to `/api/stylist`. By default it uses the built-in provider.
To use a free external model instead:

1. **Get a free key** from any provider below (all have free tiers, no credit card
   except where noted).
2. **Create `.env.local`** in the repo root (see `.env.example`):

   ```bash
   GROQ_API_KEY=gsk_...        # example: Groq
   ```

3. **Restart the dev server** (`bun run dev`).
4. Open the app → **Ask Aurelia** → tap the model pill in the chat header →
   pick any model from your provider. The choice is remembered on the device.

That's it — keys are read **server-side only** (Node runtime API routes) and are
never sent to the browser. The client only ever sees provider ids, model ids and
display labels.

### Provider cheat-sheet (verified 2026-09, see RESEARCH-DEEPTECH.md §2)

| Provider | Env var | Get a key | Free tier | Notes |
|---|---|---|---|---|
| **Groq** | `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) | ~30 req/min · 1k req/day · 8k tok/min | Fastest. Current anchors: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.6-27b`. `llama-3.3-70b` was deprecated Aug 2026 — the picker reads the live model list, so it never goes stale. |
| **Gemini** | `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ~10 req/min · 250k tok/min | Best free quality. OpenAI-compatible endpoint. |
| **OpenRouter** | `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) | 20 req/min · 50 req/day (1000 if you ever bought ≥$10 credits) | Any model with the `:free` suffix. Pool rotates — the picker reads it live. |
| **Cerebras** | `CEREBRAS_API_KEY` | [cloud.cerebras.ai](https://cloud.cerebras.ai) | 5 req/min trial | ~3000 tokens/sec. |
| **Mistral** | `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai) | ~1 req/sec (Experiment tier) | All Mistral models. |
| **Custom / local** | `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL` | n/a | Free (your hardware) | Any OpenAI-compatible server: Ollama (`http://localhost:11434/v1`), LM Studio (`http://localhost:1234/v1`), vLLM. |

You can set several keys at once — the picker then offers all of them, which is
useful as a fallback chain when a rate limit hits (the error toast tells you
which provider hiccuped).

### Local LLM example (Ollama)

```bash
ollama serve                       # default port 11434
# .env.local
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama                  # ignored by Ollama, but the route expects one
AI_MODEL=llama3.2
```

Restart, then pick **Custom / Local → Llama 3.2** in the model picker. The whole
conversation stays on your machine.

### How the model picker decides what to show

- `GET /api/models` returns every provider with a `configured` flag (key present?)
  and a **live model list** fetched from the provider's `/models` endpoint,
  cached 10 minutes. Curated fallbacks cover the rare case discovery fails.
- Unconfigured providers appear grayed out with a one-tap **Get key** link and
  the exact env var name to add.
- `POST /api/stylist` validates the requested provider/model server-side; an
  unconfigured provider returns a clear, actionable error instead of failing silently.

## 3. Production build

```bash
bun run build      # outputs .next/standalone (self-contained)
bun run start      # serves the standalone build
```

The build copies `public/` and `.next/static` into `.next/standalone`, so the
folder is portable: `node .next/standalone/server.js` runs anywhere Node runs.

## 4. Deploy to Vercel (easiest)

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework is
   auto-detected as Next.js; zero config needed).
3. Add the env vars: **Project → Settings → Environment Variables** → add e.g.
   `GROQ_API_KEY` (and friends). They are server-only — never add them with the
   "Client" exposure flag Vercel offers for `NEXT_PUBLIC_*` names.
4. Deploy. PWA requirements are satisfied automatically (HTTPS, `manifest.json`,
   `sw.js` are served from `public/`).

> Service-worker updates: after each deploy, returning users get an in-app
> "A fresh new Aurelia is ready → Update" toast (built-in SW update flow).

## 5. Deploy anywhere else (Docker / VPS / Caddy)

The app needs HTTPS for the PWA features (service worker, install prompt, share
target). Minimal Dockerfile for the standalone build:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY .next/standalone ./
COPY public ./public
COPY .next/static ./.next/static
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

Run it behind any TLS reverse proxy (Caddy config lives in `Caddyfile` in this
repo as a reference). Add your keys with `-e GROQ_API_KEY=...`.

## 6. Android share-to-analyze

On Android, once the PWA is installed, the OS share sheet lists **Aurelia**:
share any image (Pinterest screenshot, store photo) and it lands directly in the
on-device Photo Palette analyzer (k-means in CIELAB — never uploaded). No server
config is needed — the service worker handles it (`POST /share-target`).

On desktop Chromium, "Open with → Aurelia" is registered for images via
`file_handlers`. iOS has no Share Target; the app offers Web-Share **out** cards
instead.

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Model picker shows "Not configured" | Key missing in `.env.local`, or server not restarted. The sheet tells you the exact env var name. |
| `429` toast | Free-tier rate limit. Wait a minute, or pick another provider/model. |
| `401` / key rejected | Key revoked or typo'd — re-copy from the provider console. |
| Reply is empty / stream interrupted | Provider hiccup; retry, or switch model. The built-in Aurelia Cloud always works. |
| PWA won't install | Serve over HTTPS and visit twice (install prompt heuristics). |
| Share target missing | Android + installed PWA only (Chromium). |

## 8. Security notes

- Provider keys live only in server env vars; no key is ever bundled, logged, or
  sent to the client (`/api/models` returns env var **names**, not values).
- The stylist API sanitizes + caps all inputs (20 messages, 2000 chars each).
- Photo analysis, face meter, season analysis and outfit scoring are **100%
  on-device** — no network calls at all.
- The user profile (Beauty Passport) is exportable JSON the user owns; the app
  never syncs it anywhere.
