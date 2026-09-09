// Compact web-search runner for research tasks
// Usage: node scripts/research-search.mjs "query" [num] [recency_days]
import ZAI from 'z-ai-web-dev-sdk';

const query = process.argv[2] ?? '';
const num = parseInt(process.argv[3] ?? '8', 10);
const recency = process.argv[4] ? parseInt(process.argv[4], 10) : undefined;

if (!query) { console.error('usage: node research-search.mjs "query" [num] [recency_days]'); process.exit(1); }

const zai = await ZAI.create();
const args = { query, num };
if (recency) args.recency_days = recency;

let results = null;
let lastErr = null;
for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    results = await zai.functions.invoke('web_search', args);
    break;
  } catch (e) {
    lastErr = e;
    console.error(`attempt ${attempt} failed (${String(e.message ?? e).slice(0, 120)}); retrying in ${attempt * 6}s...`);
    await new Promise(r => setTimeout(r, attempt * 6000));
  }
}
if (!Array.isArray(results)) { console.log('NO RESULTS for: ' + query + (lastErr ? ' — error: ' + String(lastErr.message ?? lastErr).slice(0, 200) : '')); process.exit(0); }
console.log(`\n===== QUERY: ${query} (${results.length} results) =====`);
for (const r of results) {
  const snip = (r.snippet ?? '').replace(/\s+/g, ' ').slice(0, 350);
  console.log(`\n### ${r.name} [${r.host_name}] (${r.date ?? 'n.d.'})\n${r.url}\n${snip}`);
}
