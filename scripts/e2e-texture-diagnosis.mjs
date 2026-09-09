/* E2E: Texture Lab (curl classifier, hair) + Outfit diagnosis (colors) + gloss trend (skin journal)
   Synthetic hair photos generated in-page (canvas → PNG) so the geometry is deterministic.
   Run: bun scripts/e2e-texture-diagnosis.mjs  (needs dev server on :3000) */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${String(e).slice(0, 250)}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console.error] ${m.text().slice(0, 250)}`);
});
await page.addInitScript(() => {
  const style = document.createElement('style');
  style.textContent = 'nextjs-portal { display: none !important; }';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
});

const results = [];
const check = (name, ok) => {
  results.push(`${ok ? '✓' : '✗ FAIL'} ${name}`);
  console.log(`${ok ? '✓' : '✗ FAIL'} ${name}`);
};
const mark = (s) => console.log(`── ${s} ──`);

/* ---------- seed: profile + journal with rising gloss (hydration proxy) ---------- */
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const zone = (L, a, b, ev, tx, gloss) => ({ L, a, b, evenness: ev, texture: tx, gloss });
const seedState = {
  profile: { name: 'Zoya', skinType: 'Oily', vibe: 'bold' },
  streak: { count: 3, lastVisit: day(0) },
  skinResult: { base: 'Oily', sensitiveOverlay: false },
  journal: [
    { id: 'gloss-0', date: day(-21), calibrated: true, zones: { cheekR: zone(70, 18, 16, 6.6, 12, 0.03), forehead: zone(68, 10, 15, 6.1, 10, 0.05) }, actives: ['niacinamide'], note: 'seeded' },
    { id: 'gloss-1', date: day(-14), calibrated: true, zones: { cheekR: zone(70, 18, 16, 6.5, 12, 0.04), forehead: zone(68, 10, 15, 6, 10, 0.05) }, actives: ['niacinamide'], note: 'seeded' },
    { id: 'gloss-2', date: day(-7), calibrated: true, zones: { cheekR: zone(70, 15, 16, 6.2, 11.5, 0.11), forehead: zone(68, 10, 15, 5.9, 10, 0.06) }, actives: ['niacinamide'], note: 'seeded' },
  ],
};
await page.addInitScript((seed) => {
  if (localStorage.getItem('aurelia-store')) return;
  localStorage.setItem('aurelia-store', JSON.stringify({ state: seed, version: 0 }));
}, seedState);

/* ---------- synthetic hair photos (600×800, whole canvas = strand pattern) ---------- */
const drawHair = (mode) =>
  page.evaluate((m) => {
    const c = document.createElement('canvas');
    c.width = 600;
    c.height = 800;
    const x = c.getContext('2d');
    const DARK = [58, 44, 32];
    const LIGHT = [126, 96, 68];
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const tri = (v) => Math.abs(((v % 2) + 2) % 2 - 1);
    if (m === 'flat') {
      x.fillStyle = 'rgb(128,128,128)';
      x.fillRect(0, 0, 600, 800);
    } else {
      for (let y = 0; y < 800; y++) {
        let t;
        if (m === 'straight') t = tri((y + (rnd() - 0.5) * 2) / 11);
        else t = tri((y + 7 * Math.sin(y / 90)) / 6.5); /* wavy */
        const col = [0, 1, 2].map((i) => Math.round(DARK[i] + t * (LIGHT[i] - DARK[i])));
        x.fillStyle = `rgb(${col.join(',')})`;
        x.fillRect(0, y, 600, 1);
      }
    }
    return c.toDataURL('image/png');
  }, mode);

/* ============ Part A — Texture Lab (Hair) ============ */

mark('part A — Texture Lab');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
check('onboarding skipped (seeded profile)', (await page.locator('text=What should we call you?').count()) === 0);

await page.click('[aria-label="Hair"]');
await page.waitForTimeout(700);
check('hair tab: Texture Lab section', (await page.locator('text=Curl pattern, measured').count()) > 0);

await page.locator('text=Curl pattern, measured').scrollIntoViewIfNeeded();
await page.click('[aria-label="Open the Texture Lab — measure your curl pattern"]');
await page.waitForTimeout(600);
const curlDialog = page.locator('[role="dialog"][aria-label="Know your texture"]');
check('texture lab sheet opens', (await curlDialog.count()) === 1);
check('protocol copy explains geometry', (await page.locator('text=/strand geometry/').count()) > 0);

/* straight hair photo → 2 taps → result */
const straightPng = await drawHair('straight');
const hairFile = '/tmp/aurelia-hair-straight.png';
writeFileSync(hairFile, Buffer.from(straightPng.split(',')[1], 'base64'));

await Promise.all([
  page.waitForEvent('filechooser'),
  page.click('text=Photograph a hair section'),
]).then(([chooser]) => chooser.setFiles(hairFile));
await page.waitForSelector('img[alt="Your hair section — tap on the strands"]');
await page.waitForTimeout(400);
check('tapping prompt visible', (await page.locator('text=Tap on the strands').count()) > 0);

const hairImg = page.locator('img[alt="Your hair section — tap on the strands"]');
await hairImg.click({ position: { x: 150, y: 150 } });
await page.waitForTimeout(250);
check('second-patch prompt', (await page.locator('text=One more patch').count()) > 0);
await hairImg.click({ position: { x: 150, y: 240 } });
await page.waitForTimeout(700);

check('result: straight pattern classified', (await page.locator('text=Type 1 · Straight').count()) > 0);
check('result: curl index shown', (await page.locator('text=curl index').count()) > 0);
check('result: metrics tiles', (await page.locator('text=coherence').count()) > 0);
check('care plan: wash cadence', (await page.locator('text=Wash cadence').count()) > 0);
check('care plan: night routine', (await page.locator('text=Night routine').count()) > 0);
check('styles: suit Type 1', (await page.locator('text=Styles that suit Type 1').count()) > 0);
check('disclaimer present', (await page.locator('text=/not a rulebook/').count()) > 0);

/* style deep-link from result (scoped to the sheet — the master list behind it shares the label) */
await curlDialog.locator('[aria-label="Open Sleek High Ponytail"]').click();
await page.waitForTimeout(600);
check('style detail opens from texture result', (await page.locator('[role="dialog"][aria-label="Sleek High Ponytail"]').count()) === 1);
await page.click('[aria-label="Close"]');
await page.waitForTimeout(500);

/* persistence: hair tab card shows measured chip */
check('hair tab card: measured chip', (await page.locator('text=measured').count()) > 0);
check('hair tab card: pattern surfaced', (await page.locator('text=/Type 1 · Straight · curl index/').count()) > 0);

/* re-measure with a flat photo → guard error */
await page.click('[aria-label="Open the Texture Lab — measure your curl pattern"]');
await page.waitForTimeout(500);
check('lab reopens directly at result (persisted)', (await page.locator('text=Type 1 · Straight').count()) > 0);

const flatPng = await drawHair('flat');
const flatFile = '/tmp/aurelia-hair-flat.png';
writeFileSync(flatFile, Buffer.from(flatPng.split(',')[1], 'base64'));

const flatChooser = await Promise.all([
  page.waitForEvent('filechooser'),
  page.click('text=Re-measure'),
]).then(([c]) => c);
await flatChooser.setFiles(flatFile);
await page.waitForSelector('img[alt="Your hair section — tap on the strands"]');
await page.waitForTimeout(400);
const flatImg = page.locator('img[alt="Your hair section — tap on the strands"]');
await flatImg.click({ position: { x: 150, y: 150 } });
await page.waitForTimeout(200);
await flatImg.click({ position: { x: 150, y: 240 } });
await page.waitForTimeout(400);
check('flat photo rejected with actionable error', (await page.locator('text=/reads flat|tap ON the hair/i').count()) > 0);
await page.click('text=Start over');
await page.waitForTimeout(300);
check('start over returns to intro', (await page.locator('text=Photograph a hair section').count()) > 0);
await page.click('[aria-label="Close"]');
await page.waitForTimeout(400);

/* ============ Part B — Outfit diagnosis (Colors) ============ */

mark('part B — Outfit diagnosis');
await page.click('[aria-label="Colors"]');
await page.waitForTimeout(700);
await page.locator('text=Outfit Lab').first().scrollIntoViewIfNeeded();
await page.click('[aria-label="Open the Outfit Lab"]');
await page.waitForTimeout(600);
const labDialog = page.locator('[role="dialog"][aria-label="Score a combination"]');
check('outfit lab sheet opens', (await labDialog.count()) === 1);

check('no diagnosis with 0 colors', (await page.locator('text=who carries the outfit').count()) === 0);

/* Soft White + Soft Black → still no diagnosis (2 colors) */
await page.click('[aria-label="Soft White not selected"]');
await page.click('[aria-label="Soft Black not selected"]');
await page.waitForTimeout(300);
check('no diagnosis with 2 colors', (await page.locator('text=who carries the outfit').count()) === 0);

/* + Cream → the two-almost-whites clash fires the diagnosis */
await page.click('[aria-label="Cream not selected"]');
await page.waitForTimeout(400);
check('diagnosis card appears at 3 colors', (await page.locator('text=Diagnosis — who carries the outfit').count()) > 0);
check('3 contribution rows', (await labDialog.locator('[role="listitem"]').count()) === 3);
check('weakening item flagged', (await labDialog.locator('text=/weakening/i').count()) > 0);
check('leave-one-out explainer', (await page.locator('text=leave-one-out').count()) > 0);

const swapCard = page.locator('text=The fix:');
check('swap suggestion card', (await swapCard.count()) > 0);
check('swap target is Grey', (await page.locator('text=/→ Grey/').count()) > 0);
check('predicted gain shown', (await page.locator('text=/Predicted score/').count()) > 0);
check('balim lineage footnote', (await page.locator('text=/Balim 2023/i').count()) > 0);

/* apply the swap */
await page.click('[aria-label="Swap Cream for Grey"]');
await page.waitForTimeout(500);
check('grey is now worn (selected)', (await page.locator('[aria-label="Grey selected"]').count()) === 1);
check('cream is no longer worn', (await page.locator('[aria-label="Cream selected"]').count()) === 0);
check('score updated to prediction (97)', (await labDialog.locator('text=97').count()) > 0);
check('post-swap: no piece weakens → team effort', (await page.locator('text=/team effort/i').count()) > 0);
await page.click('[aria-label="Close"]');
await page.waitForTimeout(400);

/* ============ Part C — Gloss trend (Skin Journal) ============ */

mark('part C — gloss hydration proxy');
await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
await page.locator('[aria-label="Open the skin journal trend tracker"]').scrollIntoViewIfNeeded();
await page.click('[aria-label="Open the skin journal trend tracker"]');
await page.waitForTimeout(600);
const journalDialog = page.locator('[role="dialog"][aria-label="The Skin Journal"]');
check('journal sheet opens', (await journalDialog.count()) === 1);
check('gloss row label', (await page.locator('text=Gloss').count()) > 0);
check('gloss honest label (not a corneometer)', (await page.locator('text=/hydration proxy/i').count()) > 0);
check('gloss milestone fired', (await page.locator('text=/surface gloss is up/i').count()) > 0);
await page.click('[aria-label="Close"]');
await page.waitForTimeout(400);

/* ---------- console + report ---------- */
check('no console errors', errors.length === 0);
if (errors.length > 0) console.log(errors.join('\n'));

/* hydration regression: reload keeps store (app-written, not reseeded) */
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.click('[aria-label="Hair"]');
await page.waitForTimeout(600);
check('persistence: curl result survives reload', (await page.locator('text=measured').count()) > 0);

const fails = results.filter((r) => r.includes('FAIL')).length;
console.log(`\n${results.length - fails}/${results.length} passed`);
await browser.close();
process.exit(fails > 0 ? 1 : 0);
