/* Hydration reproduction: IST timezone + persisted saved items */
import { chromium } from 'playwright';

const results = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  timezoneId: 'Asia/Calcutta', // user's timezone (UTC+5:30)
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

const logs = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') logs.push(`[console.${msg.type()}] ${msg.text().slice(0, 400)}`);
});
page.on('pageerror', (err) => logs.push(`[pageerror] ${String(err).slice(0, 400)}`));

// Pre-seed persisted store BEFORE any app code runs
await page.addInitScript(() => {
  localStorage.setItem(
    'aurelia-store',
    JSON.stringify({
      state: {
        saved: [
          { id: 'tip-t1', category: 'colors', title: 'The 3-color rule', subtitle: 'Daily tip' },
          { id: 'palette-p1', category: 'colors', title: 'Cream & Camel', subtitle: 'Palette' },
        ],
        skinResult: null,
      },
      version: 0,
    })
  );
});

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const greeting = await page.locator('p.font-display').first().textContent().catch(() => 'N/A');
const serverGreeting = await fetch('http://localhost:3000')
  .then((r) => r.text())
  .then((t) => (t.match(/Good [a-z]+|Up late|Good night/)?.[0] ?? 'none'));

results.push(`Server greeting (UTC): ${serverGreeting}`);
results.push(`Client greeting (IST): ${greeting?.trim()}`);
results.push(`Machine UTC hour: ${new Date().getUTCHours()}`);
results.push('--- console errors/warnings ---');
results.push(...logs.map((l) => l.slice(0, 300)));

console.log(results.join('\n'));
await browser.close();
