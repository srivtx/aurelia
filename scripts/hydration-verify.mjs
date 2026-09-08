/* Hydration verification: IST timezone + persisted saved items + profile + streak + routine */
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

const logs = [];
page.on('console', (msg) => {
  const t = msg.type();
  if (t === 'error' || t === 'warning') logs.push(`[console.${t}] ${msg.text().slice(0, 500)}`);
});
page.on('pageerror', (err) => logs.push(`[pageerror] ${String(err).slice(0, 500)}`));

// Pre-seed persisted store BEFORE any app code runs (simulates returning user)
await page.addInitScript(() => {
  localStorage.setItem(
    'aurelia-store',
    JSON.stringify({
      state: {
        saved: [
          { id: 'tip-t1', category: 'colors', title: 'The 3-color rule', subtitle: 'Daily tip' },
          { id: 'palette-p1', category: 'colors', title: 'Cream & Camel', subtitle: 'Palette' },
        ],
        skinResult: { base: 'combination', sensitiveOverlay: false },
        profile: { name: 'Maya', skinType: 'oily', vibe: 'soft' },
        streak: { count: 4, lastVisit: '2026-09-07' },
        routine: { date: '2026-09-08', am: [0, 1], pm: [] },
      },
      version: 0,
    })
  );
});

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const greeting = await page.locator('p.font-display').first().textContent().catch(() => 'N/A');
const serverGreeting = await fetch('http://localhost:3000')
  .then((r) => r.text())
  .then((t) => (t.match(/(Good [a-z]+|Up late|Hello), beautiful/)?.[1] ?? 'none'));
const clientGreetingMatch = greeting?.trim().match(/(Good [a-z]+|Up late|Hello)/)?.[1] ?? 'N/A';

const hydrationErrors = logs.filter((l) => /hydrat/i.test(l));
const otherErrors = logs.filter((l) => !/hydrat/i.test(l));

console.log('=== HYDRATION CHECK (IST + persisted state) ===');
console.log(`Server greeting (UTC): ${serverGreeting}`);
console.log(`Client greeting (IST): ${clientGreetingMatch}  (full: "${greeting?.trim()}")`);
console.log(`\nHydration errors: ${hydrationErrors.length}`);
hydrationErrors.forEach((e) => console.log('  ' + e));
console.log(`\nOther console errors/warnings: ${otherErrors.length}`);
otherErrors.forEach((e) => console.log('  ' + e.slice(0, 200)));

// verify personalized greeting landed after mount
const personalized = greeting?.includes('Maya');
console.log(`\nPersonalized greeting (name "Maya"): ${personalized ? 'YES ✓' : 'NO ✗'}`);

// verify streak chip (streak.count=4 persisted, lastVisit yesterday → today becomes 5)
const streakChip = await page.locator('text=/\\d+-day glow streak/').count();
console.log(`Streak chip visible: ${streakChip > 0 ? 'YES ✓' : 'NO ✗'}`);

// verify "For you" section (profile skinType=oily, vibe=soft; seed skinResult takes priority)
const forYou =
  (await page.locator('text=/Combination skin routine/').count()) > 0 ||
  (await page.locator('text=/Oily skin routine/').count()) > 0;
console.log(`"For you" skin routine card: ${forYou > 0 ? 'YES ✓' : 'NO ✗'}`);

// verify saved badge count
const badge = await page.locator('header button[aria-label^="Saved items"]').textContent().catch(() => '');
console.log(`Saved badge text: "${badge?.trim()}"`);

await browser.close();
