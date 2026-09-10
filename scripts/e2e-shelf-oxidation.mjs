/* E2E: Mirror Test V2 + V4 — the oxidation verdict in the Shade Lab,
   the formula read in the Label Scanner, and the Shelf (PAO countdown +
   duplicates) end-to-end, incl. persistence.
   Run: bun scripts/e2e-shelf-oxidation.mjs  (needs dev server on :3000) */
import { chromium } from 'playwright';

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

/* ---------- seed: profile (oily) + measured signature + a starter shelf ---------- */
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const seedState = {
  profile: { name: 'Zoya', skinType: 'Oily', vibe: 'bold' },
  streak: { count: 3, lastVisit: day(0) },
  myActives: ['niacinamide'],
  skinSignature: {
    L: 64.2, a: 13.1, b: 17.2, ita: 28.4, hue: 52.7, chroma: 21.6,
    depth: 'medium', undertone: 'warm', calibrated: true, taken: day(-7),
  },
  shelf: [
    { /* expired ~1 month ago: 12M serum opened 400 days back */
      id: 'seed-exp', name: 'Old Retinol Serum', category: 'serum', addedOn: day(-400),
      openedOn: day(-400), price: 32, usesPerWeek: 4, swatchHex: null, activeId: 'retinol', scanned: false,
    },
    { /* the berry she already owns — duplicate radar target */
      id: 'seed-berry', name: 'Berry Blush 01', category: 'lipstick', addedOn: day(-30),
      openedOn: day(-30), price: 18, usesPerWeek: 3, swatchHex: '#B05479', activeId: null, scanned: false,
    },
  ],
};
await page.addInitScript((seed) => {
  if (localStorage.getItem('aurelia-store')) return;
  localStorage.setItem('aurelia-store', JSON.stringify({ state: seed, version: 0 }));
}, seedState);

const OXI_LABEL = 'Ingredients: Aqua, Niacinamide, Dimethicone, CI 77491, CI 77492, Glycerin, Parfum';

/* ============ Part A — V1 door + V2 oxidation verdict in Shade Lab ============ */

mark('part A: shade lab — the oxidation verdict');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
check('onboarding skipped (seeded profile)', (await page.locator('text=What should we call you?').count()) === 0);

await page.click('[aria-label="Makeup"]');
await page.waitForTimeout(700);
check('shade lab card on makeup tab', (await page.locator('text=The Shade Lab').count()) >= 1);
check('shade lab card teaser', (await page.locator('text=How will it read on you?').count()) >= 1);

await page.click('[aria-label="Open the shade lab"]');
await page.waitForTimeout(800);
check('shade lab sheet opens', (await page.locator('text=Shade Lab').count()) >= 1);
check('measured-skin line present (signature seeded)', (await page.locator('text=your measured skin').count()) >= 1);
check('verdict rendered (fit ring)', (await page.locator('[aria-label^="Fit "]').count()) >= 1);

/* default shade is warm beige + oily skin + foundation → oxidation card present */
check('oxidation card present', (await page.locator('text=Oxidation ·').count()) >= 1);
check('one-hour simulation block', (await page.locator('text=The one-hour simulation').count()) >= 1);
check('fresh vs +1h swatches', (await page.locator('text=+1h').count()) >= 1);
check('oxidation drivers listed (sebum line)', (await page.locator('text=/[Oo]ily skin — sebum is the oxidizing engine|[Yy]our oily skin/').count()) >= 1);
check('chemistry copy names iron oxides', (await page.locator('text=iron-oxide pigments').count()) >= 1);

/* the counter-move loads a new shade into the lab */
const counterBtn = page.locator('[aria-label="Load the counter-move shade into the lab"]');
const hasCounter = (await counterBtn.count()) >= 1;
check('counter-move offered (oily + warm)', hasCounter);
if (hasCounter) {
  const before = await page.locator('[aria-label="Shade color picker"]').inputValue();
  await counterBtn.click();
  await page.waitForTimeout(600);
  const after = await page.locator('[aria-label="Shade color picker"]').inputValue();
  check('counter-move loads a new shade into the lab', before !== after, `${before} → ${after}`);
  check('oxidation card survives the re-test', (await page.locator('text=Oxidation ·').count()) >= 1);
}

/* ============ Part B — scanner: formula read + save to shelf ============ */

mark('part B: scanner → formula read → save to shelf');
await page.keyboard.press('Escape'); /* close the Shade Lab sheet first */
await page.waitForTimeout(800);
await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
check('skin signature card on skin tab', (await page.locator('text=Skin Signature').count()) >= 1);
check('signature chip shows measured numbers', (await page.locator('text=/L\\* 64 · ITA° 28/').count()) >= 1);
check('shelf card on skin tab', (await page.locator('text=Your shelf').count()) >= 1);
check('shelf card warns about the expired item', (await page.locator('text=1 past PAO').count()) >= 1);

await page.click('[aria-label="Open the ingredient label scanner"]');
await page.waitForTimeout(800);
await page.click('text=Or paste the list');
await page.fill('[aria-label="Paste the ingredient list"]', OXI_LABEL);
await page.click('text=Read this label');
await page.waitForTimeout(900);

check('scan verdict rendered (niacinamide found)', (await page.locator('text=Actives found (1)').count()) >= 1);
check('formula read card appears', (await page.locator('text=Formula read · can oxidize').count()) >= 1);
check('iron-oxide note shown', (await page.locator('text=classic oxidizer family').count()) >= 1);

/* save to shelf: lipstick category + near-berry swatch → duplicate warning */
check('save-to-shelf card present', (await page.locator('text=Save to your Shelf').count()) >= 1);
await page.click('text=Lipstick');
await page.fill('[aria-label="Product name"]', 'Berry Twin 02');
await page.fill('[aria-label="Swatch hex color for duplicate detection"]', '#B3567B');
await page.check('[aria-label="Already opened"]');
await page.click('text=Save to shelf');
await page.waitForTimeout(700);
check('duplicate toast fired', (await page.locator('text=near-identical shade already there').count()) >= 1);

/* ============ Part C — the shelf sheet: PAO + duplicates ============ */

mark('part C: the shelf — PAO countdown + duplicate radar');
/* close scanner sheet first (bottom sheet backdrop) */
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
await page.click('[aria-label="Open your product shelf"]');
await page.waitForTimeout(800);
check('shelf sheet opens', (await page.locator('text=PAO countdown + near-duplicate radar').count()) >= 1);

check('summary chip counts items', (await page.locator('text=/3 products/').count()) >= 1);
check('expired row shows Past PAO', (await page.locator('text=Past PAO').count()) >= 1);
check('expired serum note visible', (await page.locator('text=12M is the generic clock').count()) >= 1);
check('PAO progress bars render', (await page.locator('[role="progressbar"]').count()) >= 2);
check('duplicate banner appears', (await page.locator('text=Near-duplicates on your shelf').count()) >= 1);
check('duplicate message names the berries', (await page.locator('text=/Berry Blush 01 and Berry Twin 02|Berry Twin 02 and Berry Blush 01/').count()) >= 1);
check('cost-per-use shown for priced items', (await page.locator('text=/~0\\.\\d+\\/use|~\\d+\\.\\d+\\/use/').count()) >= 1);
check('seeded berry row visible', (await page.locator('text=Berry Blush 01').count()) >= 1);
check('scanned twin row visible', (await page.locator('text=Berry Twin 02').count()) >= 1);
check('PAO disclaimer present', (await page.locator('text=When in doubt, toss it').count()) >= 1);

/* ============ Part D — persistence across reload ============ */

mark('part D: persistence');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
check('shelf card still counts 3 products', (await page.locator('text=1 past PAO').count()) >= 1);
await page.click('[aria-label="Open your product shelf"]');
await page.waitForTimeout(800);
check('shelf rows survive reload', (await page.locator('text=Berry Twin 02').count()) >= 1);
check('duplicate banner survives reload', (await page.locator('text=Near-duplicates on your shelf').count()) >= 1);

/* ============ Part E — search deep-opens the new tools ============ */

mark('part E: search wiring');
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
await page.click('[aria-label="Search tips, colors, looks"]');
await page.waitForTimeout(700);
await page.fill('[aria-label="Search"]', 'oxidation');
await page.waitForTimeout(900);
check('shade lab findable via search', (await page.locator('text=Shade Lab — will it oxidize?').count()) >= 1);
await page.fill('[aria-label="Search"]', 'pao');
await page.waitForTimeout(900);
check('shelf findable via search', (await page.locator('text=The Shelf — PAO & duplicates').count()) >= 1);
await page.fill('[aria-label="Search"]', 'colorimeter');
await page.waitForTimeout(900);
check('signature findable via search', (await page.locator('text=Skin Signature — the colorimeter').count()) >= 1);

/* ============ errors + summary ============ */

const failed = results.filter((r) => r.startsWith('✗'));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (errors.length) {
  console.log('PAGE ERRORS:');
  errors.forEach((e) => console.log('  ' + e));
}
await browser.close();
process.exit(failed.length || errors.length ? 1 : 0);
