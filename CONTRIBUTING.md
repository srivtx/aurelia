# Contributing to Aurelia

Read [`docs/CONTEXT.md`](docs/CONTEXT.md) first — it is the codebase map, the design-system rules, and the safety rules (hydration, tokens, engines) in one read.

## How to contribute

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Issues are welcome for bugs, feature proposals, and content corrections (wrong ingredient claim, broken engine verdict, missing season).

## Repo rules (load-bearing)

These are enforced by convention and by the e2e suites. If a PR breaks one, it will be asked to change.

- **Design tokens.** Every color is a CSS custom property in `src/app/globals.css` (`:root` + `.dark`). Raw CSS/inline styles/SVG attributes use canonical custom properties — Tailwind class names only in Tailwind classes. The aliases (`--rose`, `--sage-soft`, `--ink-2`, …) are load-bearing; do not "fix" them (see CONTEXT.md "The token-alias rule").
- **Hydration.** The app is SSG'd: never call `Date.now()`, `Math.random()`, or locale-sensitive APIs during render; persisted state rehydrates once after mount (`skipHydration: true`). Verify with `node scripts/hydration-verify.mjs` — it must report 0 errors.
- **Engines are pure.** The logic in `src/lib/*` (color science, outfit engine, oxidation, shelf, curl classifier, label scan) is deterministic and side-effect free — `today`/`now` is always a parameter, never a call. Data content lives in `src/data/*` as plain typed exports.
- **Privacy is a published product claim.** No new network calls that profile users. Photo/OCR/label processing stays on-device — do not move it server-side. No cookies, no analytics, no third-party storage.
- **Provider identity is server-side.** `/api/stylist` resolves the model from env vars; never expose provider or model names to the client (no `NEXT_PUBLIC_*` keys, no provider names in UI copy or error strings). Server-only imports never appear in a `"use client"` file.
- **Copy voice.** Kind older sister — specific, body-positive, never preachy; dermatologist-nudge for medical-adjacent topics; claims language follows [docs/RESEARCH-COMPLIANCE.md](docs/RESEARCH-COMPLIANCE.md).
- **Icons and illustrations** are inline SVG in `src/components/aurelia/` (24px grid, `currentColor` strokes, token-filled). No icon libraries, no external image assets.
- **Bundle discipline.** Tab content is lazy-loaded; keep it that way.
- **`worklog.md` is append-only** — record every task and its verification run at the bottom; never edit history.
- **Service worker**: after changing `public/sw.js`, bump `VERSION` — users get the in-app update toast.

## Verification before a PR

```bash
bun run lint                        # eslint — clean
bunx tsc --noEmit                   # src/ must be clean
bun scripts/test-engines.ts         # 191/191
bun run build                       # production build must pass

# with the dev server on :3000:
node scripts/hydration-verify.mjs   # 0 hydration errors
node scripts/e2e-new-features.mjs   # routing, onboarding, search, 404
node scripts/e2e-deep-tech.mjs      # engines under a real browser
```

Touch the relevant engine? Run its suite too (`e2e-closed-loop`, `e2e-texture-diagnosis`, `e2e-scanner`, `e2e-shelf-oxidation`, `e2e-chat-fixes`).

## Content contributions

Follow the existing interfaces in `src/data/*.ts` exactly. Keep copy in the app voice (see `docs/DESIGN_BRIEF.md`). New engines must be pure, deterministic, and grounded — cite the paper lineage in `docs/RESEARCH-PAPERS.md` or open an issue to discuss claims safety first.
