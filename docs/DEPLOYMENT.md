# Deploying Aurelia — and wiring free AI models

Aurelia is a **Next.js 15 App Router** app (TypeScript, Tailwind v4). It works fully
out of the box with the built-in **Aurelia Cloud** stylist — no keys, no config.
This guide is for self-hosting and for plugging in **free third-party models**
(Groq, Gemini, OpenRouter, Cerebras, Mistral, or your own local LLM).

> **Who chooses the model? The server, not the user.** The provider/model is an
> *operator* decision, resolved from env vars at request time. End users never
> see a picker, a provider name, or a model id — if an external provider hiccups,
> the route silently falls back to the built-in model so the chat never breaks.

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

The stylist chat talks to `/api/stylist`, which resolves the provider **server-side**:

1. **Get a free key** from any provider below (all have free tiers, no credit card
   except where noted).
2. **Create `.env.local`** in the repo root (see `.env.example`):

   ```bash
   GROQ_API_KEY=gsk_...        # example: Groq
   ```

3. **Restart the dev server** (`bun run dev`). That's it — the app now serves
   that provider automatically (first configured key in the priority order
   below). Users notice nothing except faster, free answers.

Optional pins, also in `.env.local`:

```bash
AI_PROVIDER=groq      # force one provider: groq|gemini|openrouter|cerebras|mistral|custom|zai
AI_MODEL=openai/gpt-oss-20b   # force one model id at that provider
```

Keys are read **server-side only** (Node runtime API routes) and are never sent
to the browser. No provider or model identifiers are exposed to the client —
not in the UI, not in the API responses, not in error messages.

### How the server picks the provider

`resolveProvider()` in `src/lib/ai-providers.ts`:

1. If `AI_PROVIDER` is set and configured → use it (`AI_MODEL` pins the model).
2. Else auto-detect: the **first configured** provider in priority order
   `groq → gemini → openrouter → cerebras → mistral → custom`.
3. Else the built-in **Aurelia Cloud** (always works, no key).

If the resolved external provider fails (429 rate limit, revoked key, network),
`/api/stylist` **silently falls back to the built-in model** and logs the details
server-side — the user just gets her answer. Operator-facing diagnostics go to
the server console, never to the client.

### Verify your setup (operators only)

```bash
node scripts/check-providers.mjs
```

Prints which provider the current env resolves to, and live-pings each configured
provider's `/models` endpoint to confirm the key works. This replaces the old
public `/api/models` endpoint (removed — provider identity is no longer exposed
over HTTP).

### Provider cheat-sheet (verified 2026-09, see RESEARCH-DEEPTECH.md §2)

| Provider | Env var | Get a key | Free tier | Notes |
|---|---|---|---|---|
| **Groq** | `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) | ~30 req/min · 1k req/day · 8k tok/min | Fastest. Default model `openai/gpt-oss-120b`. `llama-3.3-70b` was deprecated Aug 2026 — pin a newer id with `AI_MODEL` if needed. |
| **Gemini** | `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ~10 req/min · 250k tok/min | Best free quality. OpenAI-compatible endpoint. |
| **OpenRouter** | `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) | 20 req/min · 50 req/day (1000 if you ever bought ≥$10 credits) | Any model with the `:free` suffix. Default `google/gemma-4-31b-it:free`. |
| **Cerebras** | `CEREBRAS_API_KEY` | [cloud.cerebras.ai](https://cloud.cerebras.ai) | 5 req/min trial | ~3000 tokens/sec. |
| **Mistral** | `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai) | ~1 req/sec (Experiment tier) | All Mistral models. |
| **Custom / local** | `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL` | n/a | Free (your hardware) | Any OpenAI-compatible server: Ollama (`http://localhost:11434/v1`), LM Studio (`http://localhost:1234/v1`), vLLM. |

Setting several keys at once gives you a fallback chain: the priority order
picks the first live one, and the built-in model is the floor — the chat never
goes down.

### Local LLM example (Ollama)

```bash
ollama serve                       # default port 11434
# .env.local
AI_PROVIDER=custom
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama                  # ignored by Ollama, but the route expects one
AI_MODEL=llama3.2
```

Restart — the whole conversation stays on your machine.

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
| Chat answers but `node scripts/check-providers.mjs` shows ✗ | Provider key rejected — the route is silently serving the built-in model. Fix the key in `.env.local` and restart. |
| `429` rate limit | Free-tier limit hit. Wait a minute, set a second provider key as a fallback, or pin a faster model via `AI_MODEL`. |
| `401` / key rejected | Key revoked or typo'd — re-copy from the provider console, then re-run the check script. |
| Reply is empty / stream interrupted | Provider hiccup — the route already retried with the built-in model; if it persists, check the server console for `[/api/stylist]` logs. |
| Wrong provider being served | Set `AI_PROVIDER` explicitly (see §2). |
| PWA won't install | Serve over HTTPS and visit twice (install prompt heuristics). |
| Share target missing | Android + installed PWA only (Chromium). |
| Label Scanner says "OCR engine couldn't load" | tesseract.js worker + `eng` model load from a CDN (jsDelivr) on first use, then cache. On a first-run offline device the camera path fails gracefully — **paste the list instead** (fully offline, same verdict engine). Nothing about the photo is ever uploaded; OCR runs in a local web worker. |

## 8. Security notes

- Provider keys live only in server env vars; no key is ever bundled, logged, or
  sent to the client.
- **Provider and model identities are server-side only.** There is no public
  endpoint that lists them (the old `/api/models` was removed); user-facing
  error messages are provider-agnostic; operators use
  `node scripts/check-providers.mjs` instead.
- If an external provider fails, the server falls back to the built-in model
  silently — no provider details ever surface in the UI.
- The stylist API sanitizes + caps all inputs (20 messages, 2000 chars each).
- Photo analysis, face meter, season analysis and outfit scoring are **100%
  on-device** — no network calls at all.
- The user profile (Beauty Passport) is exportable JSON the user owns; the app
  never syncs it anywhere.
