/* E2E: onboarding · search deep-open · hash routing · back button · routine checklist · 404 */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  permissions: ["clipboard-read", "clipboard-write"],
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
const check = (name, ok) => results.push(`${ok ? '✓' : '✗ FAIL'} ${name}`);

/* ---------- 1. Onboarding (fresh user) ---------- */
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
check('onboarding shows for fresh user', (await page.locator('text=What should we call you?').count()) > 0);
await page.fill('input[placeholder="Your name (optional)"]', 'Zoya');
await page.click('button:has-text("Continue")');
await page.waitForTimeout(500);
check('onboarding step 2 (skin)', (await page.locator('text=How does your skin usually feel?').count()) > 0);
await page.click('text=Oily skin');
await page.click('button:has-text("Continue")');
await page.waitForTimeout(500);
check('onboarding step 3 (vibe)', (await page.locator('text=Pick a style mood').count()) > 0);
await page.click('text=Bold & bossy');
await page.click('button:has-text("Start exploring")');
await page.waitForTimeout(800);
const greet = await page.locator('p.font-display').first().textContent();
check(`greeting personalized (${greet?.trim().includes('Zoya') ? 'Zoya' : greet})`, greet?.includes('Zoya'));
const forYou = await page.locator('text=/Picked for Zoya/').count();
check('"Picked for Zoya" For-you section', forYou > 0);
const oilyCard = await page.locator('text=/Oily skin routine/').count();
check('For-you: Oily skin routine card', oilyCard > 0);

/* ---------- 2. Routine checklist on skin tab ---------- */
await page.click('text=Oily skin routine'); // For-you card navigates to skin tab
await page.waitForTimeout(1000);
check('hash changed to #/skin', page.url().includes('#/skin'));
const routine = await page.locator('text=Your daily checklist').count();
check('routine checklist renders', routine > 0);
const before = await page.locator('text=Gentle gel cleanser (yes, wash in the morning').count();
check('AM steps visible', before > 0);
await page.click('[aria-label^="Morning step 1"]');
await page.waitForTimeout(400);
const checked = await page.locator('[aria-label^="Morning step 1"][aria-checked="true"]').count();
check('AM step 1 checked', checked > 0);
await page.click('[aria-label^="Morning step 1"]'); // uncheck (leave clean for later tests)
await page.waitForTimeout(300);

/* ---------- 3. Global search ---------- */
await page.click('button[aria-label="Search tips, colors, looks"]');
await page.waitForTimeout(600);
check('search overlay opens', (await page.locator('input[placeholder*="Search colors"]').count()) > 0);
await page.fill('input[placeholder*="Search colors"]', 'oily');
await page.waitForTimeout(600);
const skinHit = page.locator('[aria-label="Search Aurelia"] button:has-text("Oily skin")').first();
check('search finds "oily" results', (await skinHit.count()) > 0);
await skinHit.click();
await page.waitForTimeout(1200);
check('search deep-opens Oily skin sheet', (await page.locator('text=The complete guide').count()) > 0);
check('sheet header shows Oily', (await page.locator('h2:has-text("Oily skin")').count()) > 0);

/* ---------- 4. Back button closes sheet ---------- */
await page.goBack();
await page.waitForTimeout(700);
const sheetStillOpen = await page.locator('text=The complete guide').count();
check('browser back closes the sheet', sheetStillOpen === 0);
check('still on skin tab after back', (await page.locator('text=Know your skin').count()) > 0);

/* ---------- 5. Hash deep-link ---------- */
await page.goto('http://localhost:3000#/hair', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
check('#/hair deep-link opens hair tab', (await page.locator('text=Match hair to outfit').count()) > 0);

/* ---------- 6. Tab switch pushes history (back returns to previous tab) ---------- */
await page.click('button[aria-label="Colors"]');
await page.waitForTimeout(700);
check('tab switch → colors', (await page.locator('text=What goes with what').count()) > 0);
await page.goBack();
await page.waitForTimeout(700);
check('back returns to hair tab', (await page.locator('text=Match hair to outfit').count()) > 0);

/* ---------- 7. 404 ---------- */
await page.goto('http://localhost:3000/nope', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
check('branded 404 renders', (await page.locator('text=This mirror is empty').count()) > 0);

/* ---------- 8. PWA files ---------- */
for (const f of ['/manifest.json', '/sw.js', '/og.png', '/icons/splash-1170x2532.png']) {
  const code = await page.request.get(`http://localhost:3000${f}`).then((r) => r.status());
  check(`${f} → ${code}`, code === 200);
}

/* ---------- 9. Share fallback (clipboard in headless) ---------- */
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const shareBtn = page.locator('button[aria-label="Share this tip"]');
if ((await shareBtn.count()) > 0) {
  await page.click('button[aria-label="Share this tip"]');
  await page.waitForTimeout(900);
  const toast = await page.locator('[role="status"]').count();
  check('share → toast appears', toast > 0);
} else {
  check('share button present on tip card', false);
}

console.log('=== E2E RESULTS ===');
results.forEach((r) => console.log(r));
console.log(`\nConsole/page errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
