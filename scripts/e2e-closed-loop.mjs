/* E2E: closed-loop measurements — Glow Delta (makeup) + Skin Journal (skin)
   Synthetic selfies generated in-page (canvas → PNG) with known colors,
   so every tap lands on a deterministic patch and the math is verifiable.
   Run: bun scripts/e2e-closed-loop.mjs  (needs dev server on :3000) */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const TMP = new URL('./tmp-e2e/', import.meta.url).pathname;
mkdirSync(TMP, { recursive: true });

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

/* ---------- seed: profile + 2 journal entries (cheek redness falling) ---------- */
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const zone = (L, a, b, ev, tx) => ({ L, a, b, evenness: ev, texture: tx });
const seedState = {
  profile: { name: 'Zoya', skinType: 'Oily', vibe: 'bold' },
  streak: { count: 3, lastVisit: day(0) },
  skinResult: { base: 'Oily', sensitiveOverlay: false },
  journal: [
    { id: 'seed-1', date: day(-14), calibrated: true, zones: { cheekR: zone(70, 18, 16, 6.5, 12), forehead: zone(68, 10, 15, 6, 10) }, actives: ['niacinamide'], note: 'seeded' },
    { id: 'seed-2', date: day(-7), calibrated: true, zones: { cheekR: zone(70, 15, 16, 6.2, 11.5), forehead: zone(68, 10, 15, 5.9, 10) }, actives: ['niacinamide'], note: 'seeded' },
  ],
};
await page.addInitScript((seed) => {
  /* idempotent: only seed a fresh profile — a reload must keep
     whatever the app itself persisted during the session */
  if (localStorage.getItem('aurelia-store')) return;
  localStorage.setItem('aurelia-store', JSON.stringify({ state: seed, version: 0 }));
}, seedState);

/* ---------- synthetic selfies (600×800, tissue at (280..320, 100..140)) ---------- */
const drawShot = (opts) => page.evaluate((o) => {
  const c = document.createElement('canvas');
  c.width = 600; c.height = 800;
  const x = c.getContext('2d');
  x.fillStyle = `rgb(${o.base.join(',')})`;
  x.fillRect(0, 0, 600, 800);
  x.fillStyle = 'rgb(250,250,250)';
  x.fillRect(280, 100, 40, 40);
  for (const [cx, cy, r, color] of o.circles) {
    x.fillStyle = `rgb(${color.join(',')})`;
    x.beginPath();
    x.arc(cx, cy, r, 0, Math.PI * 2);
    x.fill();
  }
  return c.toDataURL('image/png');
}, opts);
const toPng = (url, name) => writeFileSync(TMP + name, Buffer.from(url.split(',')[1], 'base64'));

const glowBefore = await drawShot({ base: [224, 172, 150], circles: [] });
const glowAfter = await drawShot({
  base: [224, 172, 150],
  circles: [[200, 340, 28, [212, 140, 132]], [300, 560, 28, [198, 148, 128]], [300, 220, 28, [231, 182, 158]]],
});
const journalToday = await drawShot({ base: [218, 182, 162], circles: [] });
toPng(glowBefore, 'glow-before.png');
toPng(glowAfter, 'glow-after.png');
toPng(journalToday, 'journal-today.png');

/* image displayed at max-h 300 → scale 0.375 */
const S = 0.375;
const at = (sx, sy) => ({ position: { x: sx * S, y: sy * S } });
const SPOTS = {
  white: at(300, 120),
  cheek: at(200, 340),
  jaw: at(300, 560),
  forehead: at(300, 220),
  cheekL: at(230, 340),
  cheekR: at(370, 340),
  chin: at(300, 470),
};

/* ============ Part A — Glow Delta ============ */

mark('part A setup');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
check('onboarding skipped (seeded profile)', (await page.locator('text=What should we call you?').count()) === 0);

await page.click('[aria-label="Makeup"]');
await page.waitForTimeout(700);
check('makeup tab: Glow Delta section', (await page.locator('text=The Glow Delta').count()) > 0);
await page.locator('text=What did the look actually do?').scrollIntoViewIfNeeded();
await page.click('text=What did the look actually do?');
await page.waitForTimeout(600);
const dialog = page.locator('[role="dialog"][aria-label="The Glow Delta"]');
check('glow sheet opens', (await dialog.count()) === 1);
check('intro explains colorimetry', (await page.locator('text=/ΔE2000 colorimetry/').count()) > 0);

mark('before photo chooser');
/* before photo */
await Promise.all([
  page.waitForEvent('filechooser'),
  page.click('text=Start with the before selfie'),
]).then(([chooser]) => chooser.setFiles(TMP + 'glow-before.png'));
await page.waitForSelector('img[alt="Your before selfie — tap the marked spots"]');
await page.waitForTimeout(400);
check('before: white prompt', (await page.locator('text=Tap the white thing').count()) > 0);
const beforeImg = page.locator('img[alt="Your before selfie — tap the marked spots"]');
await beforeImg.click(SPOTS.white);
await page.waitForTimeout(250);
check('before: cheek prompt', (await page.locator('text=Tap your cheek').count()) > 0);
await beforeImg.click(SPOTS.cheek);
await beforeImg.click(SPOTS.jaw);
await page.waitForTimeout(250);
check('before: forehead prompt', (await page.locator('text=Tap your forehead').count()) > 0);
await beforeImg.click(SPOTS.forehead);
await page.waitForTimeout(500);
check('after interstitial shows', (await page.locator('text=Before shot locked in').count()) > 0);

/* after photo */
mark('after photo chooser');
await Promise.all([
  page.waitForEvent('filechooser'),
  page.click('text=Take the after selfie'),
]).then(([chooser]) => chooser.setFiles(TMP + 'glow-after.png'));
await page.waitForSelector('img[alt="Your after selfie — tap the marked spots"]');
await page.waitForTimeout(400);
const afterImg = page.locator('img[alt="Your after selfie — tap the marked spots"]');
await afterImg.click(SPOTS.white);
await afterImg.click(SPOTS.cheek);
await afterImg.click(SPOTS.jaw);
await afterImg.click(SPOTS.forehead);
await page.waitForTimeout(700);

check('result: headline card', (await page.locator('text=Your glow delta').count()) > 0);
check('result: 3 region rows', (await page.locator('div.rounded-\\[12px\\] .capitalize, p.capitalize').filter({ hasText: /cheek|jaw|forehead/ }).count()) >= 3);
check('result: ΔE chips present', (await page.locator('text=/ΔE \\d/').count()) >= 3);
check('result: metric tiles', (await page.locator('text=Luminance').count()) > 0 && (await page.locator('text=Redness').count()) > 0 && (await page.locator('text=Evenness').count()) > 0);
check('result: body-positive charter line', (await page.locator('text=/never beauty/').count()) > 0);
check('result: cheek reading mentions blush/flush', (await page.locator('text=/flush|blush|Calmer cheek|Lifted/').count()) > 0);

await page.click('text=Share the card');
await page.waitForTimeout(900);
check('share: toast feedback', (await page.locator('text=/Card copied|Couldn.t share|measured, not guessed/').count()) > 0);

await page.click('[aria-label="Close"]');
await page.waitForTimeout(500);
check('glow sheet closed', (await page.locator('[role="dialog"][aria-label="The Glow Delta"]').count()) === 0);

/* ============ Part B — Skin Journal ============ */

await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
check('skin tab: journal card', (await page.locator('text=Skin Journal').count()) > 0);
await page.locator('text=Skin Journal').first().scrollIntoViewIfNeeded();
await page.locator('[aria-label="Open the skin journal trend tracker"]').click();
await page.waitForTimeout(600);
const jdialog = page.locator('[role="dialog"][aria-label="The Skin Journal"]');
check('journal sheet opens', (await jdialog.count()) === 1);

check('trends default with 2 entries', (await page.locator('text=/2 entries/').count()) > 0);
check('trends: zone chips', (await page.locator('button[aria-pressed]').filter({ hasText: /cheek|forehead/ }).count()) >= 1);
check('trends: sparkline SVGs', (await page.locator('[role="dialog"] svg polyline').count()) >= 3);
check('trends: history rows', (await page.locator('text=/seeded/').count()) >= 2);

mark('part B journal');
/* capture this week */
const chooser3 = page.waitForEvent('filechooser');
await page.click('text=+ This week');
(await chooser3).setFiles(TMP + 'journal-today.png');
await page.waitForSelector('img[alt="Your selfie — tap the marked spots"]');
await page.waitForTimeout(400);
const jimg = page.locator('img[alt="Your selfie — tap the marked spots"]');
await jimg.click(SPOTS.white);
await page.waitForTimeout(250);
check('journal: left cheek prompt', (await page.locator('text=Tap your left cheek').count()) > 0);
await jimg.click(SPOTS.cheekL);
await jimg.click(SPOTS.cheekR);
await jimg.click(SPOTS.forehead);
await jimg.click(SPOTS.chin);
await page.waitForTimeout(500);
check('journal: tag phase', (await page.locator('text=/Tag what you.ve been using/').count()) > 0);
await page.click('button:has-text("Niacinamide")');
await page.click('text=/Save this week.s entry/');
await page.waitForTimeout(900);

check('journal: saved toast', (await page.locator('text=/Journal entry saved/').count()) > 0);
check('journal: now 3 entries', (await page.locator('text=/3 entries/').count()) > 0);
check('journal: milestone fired', (await page.locator('text=/redness is down/').count()) > 0);
check('journal: niacinamide context in milestone', (await page.locator('text=/niacinamide/').count()) > 0);
check('journal: disclaimer visible', (await page.locator('text=/not a medical diagnosis/').count()) > 0);

/* ============ Part C — persistence + passport ============ */

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.click('[aria-label="Skin"]');
await page.waitForTimeout(700);
await page.locator('[aria-label="Open the skin journal trend tracker"]').click();
await page.waitForTimeout(600);
check('journal persists after reload (3 entries)', (await page.locator('text=/3 entries/').count()) > 0);
await page.click('[aria-label="Close"]');
await page.waitForTimeout(400);

await page.click('[aria-label="Home"]');
await page.waitForTimeout(700);
const passportChip = await page.locator('text=/skin journal · 3/').count();
check('passport shows journal chip', passportChip > 0);

/* hydration + runtime errors */
check('0 page/console errors', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));

console.log(`\n${results.filter((r) => r.startsWith('✓')).length}/${results.length} passed`);
for (const r of results.filter((r) => r.startsWith('✗'))) console.log(r);
await browser.close();
process.exit(results.some((r) => r.startsWith('✗')) ? 1 : 0);
