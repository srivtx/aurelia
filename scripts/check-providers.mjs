#!/usr/bin/env node
/* ============================================================
   AURELIA — operator provider check (run locally, never shipped)
   Replaces the old public /api/models endpoint: provider identity
   is now server-side-only, so operators verify their env config
   with this script instead of the app exposing it.

   Usage:
     node scripts/check-providers.mjs            # reads .env / .env.local
     GROQ_API_KEY=gsk_... node scripts/check-providers.mjs

   What it does:
     1. Shows which provider resolveProvider() would pick for this env.
     2. Pings each configured provider's /models endpoint to verify
        the key works, and prints a few usable model ids.
     3. Exits non-zero if the resolved provider fails a live check.
   ============================================================ */

import { readFileSync, existsSync } from "node:fs";
import { env } from "node:process";

/* --- tiny .env loader (no dependency) --- */
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const PROVIDERS = [
  { id: "groq", label: "Groq", baseUrl: "https://api.groq.com/openai/v1", keyEnv: "GROQ_API_KEY", fallback: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"] },
  { id: "gemini", label: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", keyEnv: "GEMINI_API_KEY", fallback: ["gemini-2.5-flash", "gemini-2.5-flash-lite"] },
  { id: "openrouter", label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", keyEnv: "OPENROUTER_API_KEY", fallback: [] },
  { id: "cerebras", label: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", keyEnv: "CEREBRAS_API_KEY", fallback: ["gpt-oss-120b"] },
  { id: "mistral", label: "Mistral", baseUrl: "https://api.mistral.ai/v1", keyEnv: "MISTRAL_API_KEY", fallback: ["mistral-small-latest"] },
];
const AUTO_PRIORITY = ["groq", "gemini", "openrouter", "cerebras", "mistral", "custom"];

const custom = env.AI_BASE_URL ? { id: "custom", model: env.AI_MODEL ?? "" } : null;
const configured = PROVIDERS.filter((p) => env[p.keyEnv]);

/* resolve — mirrors src/lib/ai-providers.ts resolveProvider() */
let resolved;
if (env.AI_PROVIDER) {
  const id = env.AI_PROVIDER.toLowerCase();
  const hit = PROVIDERS.find((p) => p.id === id);
  if (id === "zai") resolved = { id: "zai", model: "aurelia-default" };
  else if (id === "custom" && custom) resolved = { id: "custom", model: custom.model };
  else if (hit && env[hit.keyEnv]) resolved = { id, model: env.AI_MODEL ?? hit.fallback[0] ?? "?" };
  else resolved = null;
}
if (!resolved) {
  if (custom && custom.model) resolved = { id: "custom", model: custom.model };
  else if (configured.length) {
    const p = configured.find((p) => AUTO_PRIORITY.includes(p.id)) ?? configured[0];
    resolved = { id: p.id, model: env.AI_MODEL ?? p.fallback[0] ?? "?" };
  } else resolved = { id: "zai", model: "aurelia-default" };
}

console.log("\nAURELIA — provider check\n=========================\n");
if (env.AI_PROVIDER && !resolved) console.log(`⚠ AI_PROVIDER=${env.AI_PROVIDER} is not configured — would fall back`);
console.log(`Resolved for this env : ${resolved.id} → ${resolved.model}${env.AI_PROVIDER ? "  (pinned via AI_PROVIDER)" : "  (auto-detected)"}`);
console.log(`Built-in fallback     : always available (Aurelia Cloud)\n`);

if (!configured.length && !custom) {
  console.log("No external provider keys found — the app serves the built-in model. Add a key to .env.local to switch (see docs/DEPLOYMENT.md).");
  process.exit(0);
}

/* live checks */
let failed = false;
for (const p of configured) {
  const key = env[p.keyEnv];
  process.stdout.write(`  ${p.label.padEnd(16)} `);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${p.baseUrl}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) {
      console.log(`✗ HTTP ${res.status} — key rejected or revoked`);
      if (p.id === resolved.id) failed = true;
      continue;
    }
    const json = await res.json();
    const ids = (json.data ?? []).map((m) => m.id).filter(Boolean);
    const chat = ids.filter((m) => !/whisper|tts|guard|embed|rerank|distil|safeguard|playai|embedding|image|audio/i.test(m));
    console.log(`✓ key works — ${ids.length} models${chat.length ? ` (e.g. ${chat.slice(0, 3).join(", ")})` : ""}`);
  } catch (e) {
    console.log(`✗ network error: ${e instanceof Error ? e.message : e}`);
    if (p.id === resolved.id) failed = true;
  }
}
if (custom) {
  console.log(`  ${"Custom / local".padEnd(16)} ${custom.model ? `→ ${custom.model} @ ${env.AI_BASE_URL}` : "✗ AI_MODEL not set"}`);
}

console.log(failed ? "\n✗ The RESOLVED provider failed its live check — the app would silently fall back to the built-in model. Fix the key or pin another provider.\n" : "\n✓ All configured providers verified. Users never see any of this — routing is server-side.\n");
process.exit(failed ? 1 : 0);
