/* E2E: deep-tech features — Color Lab (season, outfit, photo) · Ingredient Lab · Face Meter · AI Stylist + hydration watch */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  timezoneId: 'Asia/Calcutta',
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
  // hide next dev overlay
  const style = document.createElement('style');
  style.textContent = 'nextjs-portal { display: none !important; }';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  // returning user
  localStorage.setItem(
    'aurelia-store',
    JSON.stringify({
      state: {
        saved: [],
        skinResult: { base: 'combination', sensitiveOverlay: false },
        seasonResult: null,
        profile: { name: 'Maya', skinType: 'oily', vibe: 'soft' },
        streak: { count: 4, lastVisit: new Date().toISOString().slice(0, 10) },
        routine: { date: '', am: [], pm: [] },
      },
      version: 0,
    })
  );
});

const results = [];
const check = (name, ok) => results.push(`${ok ? '✓' : '✗ FAIL'} ${name}`);

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
check('app renders (no blank screen)', (await page.locator('text=Aurelia').first().count()) > 0);
check('no hydration/console errors on load', errors.length === 0);

/* ---------- 1. Home: Ask Aurelia card ---------- */
const askCard = await page.locator('button[aria-label="Open Ask Aurelia — your AI stylist"]').count();
check('home: Ask Aurelia card present', askCard > 0);

/* ---------- 2. Colors tab → Color Lab ---------- */
await page.click('nav button[aria-label="Colors"]');
await page.waitForTimeout(1200);
const labSection = await page.locator('text=Lab-grade tools').count();
check('colors: Color Lab section', labSection > 0);
const seasonCard = await page.locator('button[aria-label="Open the 12-season personal color analysis"]').count();
check('colors: 12-Season card present', seasonCard > 0);

/* ---------- 3. Season analysis wizard (7 questions) ---------- */
await page.click('button[aria-label="Open the 12-season personal color analysis"]');
await page.waitForTimeout(800);
check('season quiz opens (Q1)', (await page.locator('text=Question 1 of 7').count()) > 0);
// warm autumn-leaning answers: hair 2 (medium warm), eyes 4 (golden brown), skin 3 (medium), veins 2 (green), sun 3 (tan golden), contrast 2 (medium), glow 3 (earthy)
const picks = [2, 4, 3, 2, 3, 2, 3];
for (let i = 0; i < picks.length; i++) {
  const q = page.locator(`div[role="dialog"] >> text=Question ${i + 1} of 7`).count();
  if ((await q) === 0) break;
  await page.locator(`[aria-label="Close"]`).count(); // no-op
  const opts = page.locator('div[role="dialog"] button.w-full');
  await opts.nth(picks[i]).click();
  await page.waitForTimeout(350);
}
await page.waitForTimeout(800);
const signalProfile = await page.locator('text=Your signal profile').count();
check('season result: signal profile shown', signalProfile > 0);
const glowPalette = await page.locator('text=Your glow palette').count();
check('season result: palette shown', glowPalette > 0);
const wardrobeBest = await page.locator('text=Best of your wardrobe').count();
check('season result: wardrobe ratings shown', wardrobeBest > 0);
const seasonName = (await page.locator('[role="dialog"] h3').first().textContent())?.trim() ?? '';
check(`season classified (${seasonName})`, /Spring|Summer|Autumn|Winter/.test(seasonName));
// save season
await page.click('button:has-text("Make it mine")');
await page.waitForTimeout(800);
const savedBtn = await page.locator('button:has-text("Saved to profile")').count();
check('season saved to profile', savedBtn > 0);
// close sheet
await page.locator('[aria-label="Close"]').first().click();
await page.waitForTimeout(700);
const badge = await page.locator('text=You are ').count();
check('season badge appears in Colors tab', badge > 0);

/* ---------- 4. Outfit Lab ---------- */
await page.click('[aria-label="Open the Outfit Lab"]');
await page.waitForTimeout(800);
check('outfit lab opens', (await page.locator('h2:has-text("Score a combination")').count()) > 0);
// pick two colors: first two swatches
const swatches = page.locator('div[role="dialog"] .grid button[aria-pressed]');
await swatches.nth(0).click();
await page.waitForTimeout(250);
await swatches.nth(1).click();
await page.waitForTimeout(900);
const scoreText = await page.locator('[aria-label^="Outfit score"]').count();
check('outfit lab: score ring rendered', scoreText > 0);
const factors = await page.locator('text=Hue geometry').count();
check('outfit lab: factors rendered', factors > 0);
const roleBar = await page.locator('text=Wear it 60 · 30 · 10').count();
check('outfit lab: 60-30-10 role bar', roleBar > 0);
const seasonFit = await page.locator(`text=Your ${seasonName} fit`).count();
check('outfit lab: personal season fit factor', seasonFit > 0);
await page.locator('[aria-label="Close"]').first().click();
await page.waitForTimeout(600);

/* ---------- 5. Photo analyzer UI (no file upload in headless) ---------- */
await page.click('[aria-label="Open the photo palette analyzer"]');
await page.waitForTimeout(700);
check('photo analyzer opens', (await page.locator('h2:has-text("Extract a palette")').count()) > 0);
check('photo analyzer: choose button', (await page.locator('button:has-text("Choose a photo")').count()) > 0);
check('photo analyzer: privacy copy', (await page.locator('text=Nothing is ever uploaded').count()) > 0);
await page.locator('[aria-label="Close"]').first().click();
await page.waitForTimeout(600);

/* ---------- 6. Skin tab → Ingredient Lab ---------- */
await page.click('nav button[aria-label="Skin"]');
await page.waitForTimeout(1200);
await page.click('[aria-label="Open the mix and match ingredient lab"]');
await page.waitForTimeout(700);
check('ingredient lab opens', (await page.locator('h2:has-text("Mix & match check")').count()) > 0);
// toggle retinol + glycolic → expect conflict
await page.click('button[aria-label="Retinol / Retinal — not selected"]');
await page.waitForTimeout(300);
await page.click('button[aria-label="Glycolic Acid (AHA) — not selected"]');
await page.waitForTimeout(700);
const conflictBanner = await page.locator('text=Conflict found').count();
check('ingredient lab: conflict detected (retinol × glycolic)', conflictBanner > 0);
const conflictCard = await page.locator('text=/alternate nights/i').count();
check('ingredient lab: conflict fix advice', conflictCard > 0);
const timeline = await page.locator('text=Morning').count();
check('ingredient lab: AM/PM timelines', timeline > 0);
await page.locator('[aria-label="Close"]').first().click();
await page.waitForTimeout(600);

/* ---------- 7. Hair tab → Face Meter ---------- */
await page.click('nav button[aria-label="Hair"]');
await page.waitForTimeout(1200);
await page.click('[aria-label="Open the face meter — measure your face"]');
await page.waitForTimeout(700);
check('face meter opens', (await page.locator('h2:has-text("Measure your face")').count()) > 0);
check('face meter: morphing SVG face', (await page.locator('[aria-label^="Face outline that morphs"]').count()) > 0);
// move jaw slider to max (square-ish) — drag via keyboard on range
const sliders = page.locator('input[type="range"], [role="slider"]');
const count = await sliders.count();
check(`face meter: 4 sliders rendered (${count})`, count >= 4);
// set values via the shadcn slider thumbs (drag) — simpler: evaluate classifier result exists
const faceResult = await page.locator('[role="dialog"] p.font-display').first().textContent().catch(() => null);
check(`face meter: classified (${faceResult?.trim() ?? 'n/a'})`, /Oval|Round|Square|Heart|Long|Diamond/.test(faceResult ?? ''));
const stylesFor = await page.locator('text=Styles that flatter you').count();
check('face meter: recommended styles list', stylesFor > 0);
await page.locator('[aria-label="Close"]').first().click();
await page.waitForTimeout(600);

/* ---------- 8. AI stylist chat ---------- */
await page.click('button[aria-label="Ask Aurelia — AI stylist chat"]');
await page.waitForTimeout(900);
check('chat overlay opens', (await page.locator('text=Your pocket stylist').count()) > 0);
check('chat header shows season', (await page.locator(`[aria-label="Ask Aurelia — AI stylist chat"] >> text=${seasonName}`).count()) > 0);
await page.fill('input[aria-label="Message Aurelia"]', `Which lip color suits a ${seasonName}?`);
await page.click('button[aria-label="Send message"]');
// wait for reply (LLM call → streams into .markdown-body)
let reply = '';
for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(1000);
  const bubbles = page.locator('[aria-label="Ask Aurelia — AI stylist chat"] .markdown-body');
  const n = await bubbles.count();
  if (n >= 1) {
    const last = await bubbles.nth(n - 1).textContent();
    if (last && last.trim().length > 20) {
      reply = last.trim().slice(0, 60);
      break;
    }
  }
}
check(`AI stylist replied (${reply ? reply.slice(0, 40) + '…' : 'no reply'})`, reply.length > 0);
// close via X
await page.locator('[aria-label="Close chat"]').click();
await page.waitForTimeout(700);

/* ---------- 9. Final: still no errors ---------- */
const hydrationErrors = errors.filter((e) => /hydrat|Minified React error/i.test(e));
check(`no hydration errors (total console errors: ${errors.length})`, hydrationErrors.length === 0);

console.log(results.join('\n'));
if (errors.length > 0) {
  console.log('\n--- console/page errors ---');
  console.log(errors.slice(0, 12).join('\n'));
}
await browser.close();
const fails = results.filter((r) => r.includes('FAIL')).length;
process.exit(fails > 0 ? 1 : 0);
