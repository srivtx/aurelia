# Deploying Aurelia — the complete guide (for humans *and* the deployment agent)

Aurelia is a **Next.js 16 App Router** PWA (TypeScript, Tailwind v4, Turbopack).
It works fully out of the box with the built-in **Aurelia Cloud** stylist — no
keys, no config, no database. This guide covers local development, wiring free
AI models (Groq, Gemini, OpenRouter, Cerebras, Mistral, or a local LLM),
deploying from GitHub to Vercel / Docker / any VPS, post-deploy verification,
rollback, and troubleshooting.

> **Who chooses the model? The server, not the user.** The provider/model is an
> *operator* decision, resolved from env vars at request time. End users never
> see a picker, a provider name, or a model id — if an external provider hiccups,
> the route silently falls back to the built-in model so the chat never breaks.

> Companion docs: [`CONTEXT.md`](./CONTEXT.md) (codebase map) ·
> [`RESEARCH-DEEPTECH.md`](./RESEARCH-DEEPTECH.md) (why these providers/APIs) ·
> [`RESEARCH-PWA-LAUNCH.md`](./RESEARCH-PWA-LAUNCH.md) (PWA quality bar) ·
> [`RESEARCH-COMPLIANCE.md`](./RESEARCH-COMPLIANCE.md) (privacy/claims rules)

---

## 0. AI deployment-agent brief (read this first, then act)

If you are an automated agent tasked with deploying this repository, this
section is your complete context. Everything else in the document is supporting
detail.

**What you are deploying.** A single Next.js 16 App Router application — a
mobile-first beauty/style PWA. Everything renders from one page (`/`) with
client-side tab routing; two API routes provide the AI stylist. There is **no
database in the default configuration** (Prisma scaffolding exists but is unused
by the app — do not run migrations, do not provision a DB).

**Repository facts:**

| Fact | Value |
|---|---|
| Repo | `https://github.com/srivtx/aurelia` (branch `main` is the trunk) |
| Runtime | Node.js 20+ (or Bun 1.1+) |
| Framework | Next.js 16.1.3, App Router, Turbopack build |
| Language | TypeScript (strict for `src/`) |
| Styling | Tailwind CSS 4 with a custom token system (no Tailwind config file needed) |
| State | Zustand + localStorage persist (hydration-safe: `skipHydration` + manual rehydrate) |
| Routes | `/` (static, the whole app) · `/_not-found` (static) · `/api` (health) · `/api/stylist` (Node runtime, streaming) |
| Build output | `.next/standalone` — self-contained (public/ + static assets are copied into it by `npm run build`) |
| External deps at runtime | None required. Optional: one LLM provider key. OCR model files load from jsDelivr CDN on first use (lazy, cached, with an offline paste fallback). |
| Secrets | Only provider API keys, server-side env vars. **Never** commit `.env`/`.env.local`. |

**The env contract (all optional):**

| Var | Purpose |
|---|---|
| `AI_PROVIDER` | Pin one: `groq \| gemini \| openrouter \| cerebras \| mistral \| custom \| zai` |
| `AI_MODEL` | Pin a model id at that provider |
| `GROQ_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY` / `CEREBRAS_API_KEY` / `MISTRAL_API_KEY` | Provider keys (pick any one or several — priority order is groq → gemini → openrouter → cerebras → mistral → custom) |
| `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL` | Custom OpenAI-compatible server (Ollama, LM Studio, vLLM) |
| `DATABASE_URL` | Legacy scaffold; unused by the app — safe to omit |

No var is exposed to the browser. With **zero** vars set, the app deploys and
runs at full functionality on the built-in provider.

**Your deploy procedure (Vercel path, recommended):**

1. Push/confirm `main` on GitHub (the repo is already connected to
   `github.com/srivtx/aurelia`; identity `srivtx`).
2. Vercel: *New Project → Import `srivtx/aurelia`*. Framework auto-detects as
   Next.js. **No build settings needed** — accept defaults.
3. Environment variables: add none (built-in model) or only server-side keys
   from the table above. Never mark any var for "Client" exposure.
4. Deploy, then run the post-deploy checklist (§8) against the live URL.
5. Commit nothing to the repo. Report the URL, the resolved provider, and the
   checklist results.

**Your verification commands (run in the repo, dev or CI):**

```bash
bun install
bun run lint                 # must exit 0
bunx tsc --noEmit            # src/ must be clean
bun run build                # must succeed; routes: /, /_not-found, /api, /api/stylist
bun scripts/test-engines.ts  # pure-engine suite — currently 191/191
bun scripts/e2e-shelf-oxidation.mjs  # needs dev server on :3000 — 40/40
node scripts/check-providers.mjs     # operator: which provider env resolves to
```

Full e2e battery (each needs the dev server on :3000): `e2e-chat-fixes` (22),
`e2e-deep-tech`, `e2e-new-features`, `e2e-closed-loop` (32),
`e2e-texture-diagnosis` (40), `e2e-scanner` (27, includes a live OCR smoke),
`e2e-shelf-oxidation` (40), plus `hydration-verify.mjs` (must report 0 hydration
errors). The lone 404 console error in `e2e-new-features` is the intentional
branded-404 test — expected.

**Red lines — do not do any of these:**

- Do not add a database, auth, analytics, or any network call that profiles
  users (the "no tracking" charter is a published product claim).
- Do not move photo/OCR/label processing server-side. Every measurement runs
  on-device by design; the privacy claims in the app copy are literal.
- Do not expose the AI provider or model identity to the client (no
  `NEXT_PUBLIC_*` for keys, no provider names in user-facing copy or errors).
- Do not edit `worklog.md` history; append only.
- Do not "fix" the CSS var aliases (`--rose`, `--sage-soft`, `--ink-2`…) — they
  are load-bearing (see CONTEXT.md "alias pitfall").

**Current state (2026-09-10, after the Mirror Test V2+V4 session):** all four
Mirror-Test verdicts live (Skin Signature V1, Oxidation V2, Label Scanner V3,
Shelf/PAO V4), closed beauty loop complete, 191 engine checks + full e2e
battery green, lint/tsc/build clean, service worker at `aurelia-v5`.

---

## 1. Local development

```bash
git clone https://github.com/srivtx/aurelia
cd aurelia
bun install        # or npm install / pnpm install
bun run dev        # http://localhost:3000
```

Requirements: Node 18+ (or Bun 1.1+). No database needed — all content and
engines are pure TypeScript; the user profile lives in the browser
(localStorage + PWA storage).

## 2. Free AI models — the 2-minute setup

The stylist chat talks to `/api/stylist`, which resolves the provider
**server-side**:

1. **Get a free key** from any provider below (all have free tiers, no credit
   card except where noted).
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

Prints which provider the current env resolves to, and live-pings each
configured provider's `/models` endpoint to confirm the key works. This replaces
the old public `/api/models` endpoint (removed — provider identity is no longer
exposed over HTTP).

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
`PORT` and `HOSTNAME` env vars configure the listener (defaults: 3000,
0.0.0.0).

## 4. Deploy from GitHub to Vercel (easiest, recommended)

1. The repo lives at `github.com/srivtx/aurelia`, branch `main`.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework is
   auto-detected as Next.js; zero config needed — do not add a `vercel.json`).
3. Add the env vars: **Project → Settings → Environment Variables** → add e.g.
   `GROQ_API_KEY` (and friends). They are server-only — never add them with the
   "Client" exposure flag Vercel offers for `NEXT_PUBLIC_*` names.
4. Deploy. PWA requirements are satisfied automatically (HTTPS, `manifest.json`,
   `sw.js` are served from `public/`).

After the first deploy, every push to `main` auto-deploys. That is the intended
GitHub → production flow: **commit to main → push → Vercel builds → verify**.

> Service-worker updates: after each deploy, returning users get an in-app
> "A fresh new Aurelia is ready → Update" toast (built-in SW update flow). Bump
> `VERSION` in `public/sw.js` when you want to force a cache refresh — the SW
> currently runs `aurelia-v5`.

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

A GitHub Actions option if you prefer CI-built images:

```yaml
# .github/workflows/docker.yml (example — only if you want image CI)
name: docker
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run build
      # then push .next/standalone into your registry/image of choice
```

## 6. Deploy via GitHub Pages? — No.

The app is a server-rendered Next.js application with API routes; GitHub Pages
only serves static files and would break `/api/stylist`. Use Vercel (§4) or any
Node host (§5). If you ever want a purely static export, the stylist chat would
need a separate backend — out of scope today.

## 7. Post-deploy verification checklist

Run against the live URL (replace `https://YOUR-DEPLOY`):

| # | Check | Expected |
|---|---|---|
| 1 | `curl -s https://YOUR-DEPLOY/api` | 200 with health payload |
| 2 | Load `/` on a phone browser | App shell + 5-tab nav render, no console errors |
| 3 | `https://YOUR-DEPLOY/manifest.json` | 200, valid JSON (PWA installable) |
| 4 | `https://YOUR-DEPLOY/sw.js` | 200, `Content-Type: application/javascript` |
| 5 | Open Ask Aurelia, send a message | Reply streams token-by-token (mark-down rendered) |
| 6 | Offline: load app, cut network, reload | App shell serves from cache (SW working) |
| 7 | Android share sheet → share an image to Aurelia | Photo Palette analyzer opens (installed PWA) |
| 8 | DevTools → Application → Storage | localStorage `aurelia-store` persists profile; no third-party storage, no cookies |
| 9 | Scan a label (Label Scanner) | OCR loads from CDN, verdict renders; paste path works offline |
| 10 | Provider check (if keys set) | `node scripts/check-providers.mjs` locally against same env: all configured providers ✓ |

## 8. Rollback

- **Vercel:** Deployments → any previous deployment → ⋯ → **Promote to
  Production**. Instant, no rebuild. The repo itself is never touched.
- **Docker/VPS:** redeploy the previous image tag, or `git checkout <previous
  tag> && bun run build && bun run start`.
- **Service worker:** returning users update on next launch (the update toast).
  If you must force it, bump `VERSION` in `public/sw.js` and redeploy.
- **Bad env var:** just fix the value and redeploy — the app never requires a
  key to boot, so a wrong key degrades to the built-in model rather than an
  outage.

## 9. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Chat answers but `node scripts/check-providers.mjs` shows ✗ | Provider key rejected — the route is silently serving the built-in model. Fix the key in `.env.local` / Vercel env and restart/redeploy. |
| `429` rate limit | Free-tier limit hit. Wait a minute, set a second provider key as a fallback, or pin a faster model via `AI_MODEL`. |
| `401` / key rejected | Key revoked or typo'd — re-copy from the provider console, then re-run the check script. |
| Reply is empty / stream interrupted | Provider hiccup — the route already retried with the built-in model; if it persists, check the server console for `[/api/stylist]` logs. |
| Wrong provider being served | Set `AI_PROVIDER` explicitly (see §2). |
| PWA won't install | Serve over HTTPS and visit twice (install prompt heuristics). The app shows a phone-only install notice — Android via the native prompt, iOS via Share → Add to Home Screen instructions. Dismissal is remembered for 30 days (`aurelia-install-dismissed`). |
| Share target missing | Android + installed PWA only (Chromium). |
| Label Scanner says "OCR engine couldn't load" | tesseract.js worker + `eng` model load from a CDN (jsDelivr) on first use, then cache. On a first-run offline device the camera path fails gracefully — **paste the list instead** (fully offline, same verdict engine). Nothing about the photo is ever uploaded; OCR runs in a local web worker. |
| Users see stale content after a deploy | Service-worker cache — bump `VERSION` in `public/sw.js` and redeploy; the update toast appears on next launch. |
| Hydration errors in the console | Should never happen (0 in all test runs). If you see one, run `node scripts/hydration-verify.mjs` locally — it reproduces the timezone + persisted-state case; do not ship until it reports 0. |

## 10. Security notes

- Provider keys live only in server env vars; no key is ever bundled, logged, or
  sent to the client.
- **Provider and model identities are server-side only.** There is no public
  endpoint that lists them (the old `/api/models` was removed); user-facing
  error messages are provider-agnostic; operators use
  `node scripts/check-providers.mjs` instead.
- If an external provider fails, the server falls back to the built-in model
  silently — no provider details ever surface in the UI.
- The stylist API sanitizes + caps all inputs (20 messages, 2000 chars each).
- Photo analysis, face meter, season analysis, label OCR and outfit scoring are
  **100% on-device** — no network calls at all. The photo never leaves the
  device; OCR runs in a local web worker (CDN only delivers the engine files).
- The user profile (Beauty Passport, shelf, journal) is exportable JSON the
  user owns; the app never syncs it anywhere. No cookies, no analytics, no
  third-party trackers.
- See `docs/RESEARCH-COMPLIANCE.md` for the GDPR/AI-Act/claims analysis behind
  these choices (e.g. the EU AI Act Art. 50(1) "you are chatting with an AI"
  disclosure line in the chat UI).
