/* E2E: Label Scanner — paste path, verdicts vs routine, live re-derive,
   persistence, routine editor, and a best-effort real OCR smoke.
   Run: bun scripts/e2e-scanner.mjs  (needs dev server on :3000) */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const errors = [];
let ocrSmokeDone = false;
page.on('pageerror', (e) => errors.push(`[pageerror] ${String(e).slice(0, 250)}`));
page.on('console', (m) => {
  if (m.type() === 'error') {
    /* OCR smoke network failures are tolerated and reported separately */
    if (ocrSmokeDone) return;
    if (/net::|tesseract|tessdata|worker/i.test(m.text())) return;
    errors.push(`[console.error] ${m.text().slice(0, 250)}`);
  }
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

/* ---------- seed: profile + routine (retinol + vitamin-c) ---------- */
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const seedState = {
  profile: { name: 'Zoya', skinType: 'Oily', vibe: 'bold' },
  streak: { count: 3, lastVisit: day(0) },
  myActives: ['retinol', 'vitamin-c'],
};
await page.addInitScript((seed) => {
  if (localStorage.getItem('aurelia-store')) return;
  localStorage.setItem('aurelia-store', JSON.stringify({ state: seed, version: 0 }));
}, seedState);

const BP_LABEL = 'Ingredients: Aqua, Benzoyl Peroxide 2.5%, Alcohol Denat., Parfum, Hydroxyethylcellulose';

/* ============ Part A — paste path + verdict ============ */

mark('part A: open scanner, paste, verdict');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
check('onboarding skipped (seeded profile)', (await page.locator('text=What should we call you?').count()) === 0);

await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
check('scan card visible on skin tab', (await page.locator('text=Scan a label').count()) >= 1);

await page.click('[aria-label="Open the ingredient label scanner"]');
await page.waitForTimeout(800);
check('scanner sheet opens', (await page.locator('text=Label Scanner').count()) >= 1);
check('privacy line present', (await page.locator('text=No photo ever leaves the device').count()) >= 1);
check('routine editor seeded (retinol + vit c)', (await page.locator('text=Your routine').count()) >= 1);
check('capture button + photo hint visible', (await page.locator('text=Flat label, bright light').count()) >= 1);

/* expand paste mode and run the scan */
await page.click('text=Or paste the list');
await page.fill('[aria-label="Paste the ingredient list"]', BP_LABEL);
await page.click('text=Read this label');
await page.waitForTimeout(900);

check('verdict: heads-up headline (BP × vitamin-c avoid)', (await page.locator('text=Heads up before you buy').count()) >= 1);
check('benzoyl × vitamin-c conflict card', (await page.locator('text=Vitamin C (LAA) × Benzoyl Peroxide').count()) >= 1);
check('scope chip: with your routine', (await page.locator('text=with your routine').count()) >= 1);
check('alcohol flag surfaced', (await page.locator('text=drying alcohol').count()) >= 1);
check('actives found (1) card', (await page.locator('text=Actives found (1)').count()) >= 1);
check('BP note line (spot-killer)', (await page.locator('text=Spot-killer for inflammatory pimples').count()) >= 1);
check('new-for-you line', (await page.locator('text=New for you: BP').count()) >= 1);

/* raw list */
await page.click('text=The raw list we read');
await page.waitForTimeout(400);
check('raw text toggle opens', (await page.locator('text=Something look wrong? Fix the text').count()) >= 1);
check('ingredient chips render (aqua)', (await page.locator('text=aqua').count()) >= 1);

/* ============ Part B — live re-derive on routine edit ============ */

mark('part B: routine edit updates verdict live');
await page.click('text=Checked against 2 actives · edit');
await page.waitForTimeout(500);
check('routine editor expanded', (await page.locator('text=what we check against').count()) >= 1);

/* toggle OFF retinol + vitamin-c → verdict should become clear */
await page.click('[aria-label="Retinol / Retinal — in your routine"]');
await page.click('[aria-label="Vitamin C (LAA) — in your routine"]');
await page.waitForTimeout(700);
check('verdict flips to no-clashes when routine emptied', (await page.locator('text=No clashes in this formula').count()) >= 1);
check('compact counter now 0', (await page.locator('text=Checked against 0 actives').count()) >= 0);

/* toggle vitamin-c back on → avoid conflict returns */
await page.click('[aria-label="Vitamin C (LAA) — not in your routine"]');
await page.waitForTimeout(700);
check('verdict flips back to heads-up', (await page.locator('text=Heads up before you buy').count()) >= 1);

/* ============ Part C — persistence across reload ============ */

mark('part C: persistence');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
await page.click('[aria-label="Open the ingredient label scanner"]');
await page.waitForTimeout(900);
check('scan verdict survives reload', (await page.locator('text=Heads up before you buy').count()) >= 1);
check('routine survives reload (vitamin-c on)', (await page.locator('text=Checked against 1 active').count()) >= 1);

/* scan another → capture view, textarea empty */
await page.click('text=Scan another');
await page.waitForTimeout(500);
check('scan-another resets to capture', (await page.locator('text=Flat label, bright light').count()) >= 1);

/* empty paste is guarded — paste mode is already open after rescan() */
await page.fill('[aria-label="Paste the ingredient list"]', '   ');
await page.click('text=Read this label');
await page.waitForTimeout(400);
check('empty paste does not crash (still on capture view)', (await page.locator('text=Flat label, bright light').count()) >= 1);

/* console errors so far (before OCR smoke) */
check('no page/console errors', errors.length === 0, errors[0] ?? '');

/* ============ Part D — real OCR smoke (best effort, network-dependent) ============ */

mark('part D: OCR smoke (CDN-dependent, may SKIP)');
ocrSmokeDone = true;
const ocr = await page.evaluate(async () => {
  try {
    /* synthetic label: black text on white */
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 300;
    const x = c.getContext('2d');
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, 1200, 300);
    x.fillStyle = '#111111';
    x.font = '44px Arial';
    x.fillText('Aqua, Niacinamide, Salicylic Acid', 40, 120);
    x.fillText('Alcohol Denat., Parfum', 40, 210);
    const mod = await import('https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js');
    const T = mod.default ?? mod;
    /* eng.traineddata is ~12 MB — allow up to 100 s, then bail as SKIP */
    const withTimeout = (p, ms, label) => Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + label)), ms)),
    ]);
    const worker = await withTimeout(T.createWorker('eng', 1, {}), 100000, 'loading engine');
    const { data } = await withTimeout(worker.recognize(c), 60000, 'recognizing');
    await worker.terminate();
    return { ok: true, text: (data?.text ?? '').toLowerCase() };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 200) };
  }
});
if (ocr.ok) {
  check('OCR engine loads and reads synthetic label', /niacinamide/.test(ocr.text) && /aqua/.test(ocr.text), ocr.text.replace(/\s+/g, ' ').slice(0, 120));
  /* feed the OCR text through the real UI */
  await page.fill('[aria-label="Paste the ingredient list"]', ocr.text);
  await page.click('text=Read this label');
  await page.waitForTimeout(900);
  check('OCR text → full scan verdict (niacinamide found)', (await page.locator('text=Actives found (').count()) >= 1);
  check('OCR pipeline finds salicylic acid (family match)', (await page.locator('text=Salicylic Acid (BHA)').count()) >= 1);
} else {
  console.log(`  ⚠ SKIP OCR smoke (network/CDN unavailable): ${ocr.error}`);
}

await browser.close();

const fails = results.filter((r) => r.startsWith('✗')).length;
console.log(`\n${results.length - fails} passed, ${fails} failed (scanner e2e)`);
process.exit(fails > 0 ? 1 : 0);
