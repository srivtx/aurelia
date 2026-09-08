/* Capture manifest screenshots (780x1688) + visual review shots */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
await page.addInitScript(() => {
  const style = document.createElement('style');
  style.textContent = 'nextjs-portal { display: none !important; }';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  localStorage.setItem(
    'aurelia-store',
    JSON.stringify({
      state: {
        profile: { name: 'Maya', skinType: 'oily', vibe: 'soft' },
        saved: [{ id: 'tip-t5', category: 'colors', title: 'Navy + camel, always', subtitle: 'Daily tip' }],
        skinResult: { base: 'oily', sensitiveOverlay: false },
        streak: { count: 3, lastVisit: '2026-09-07' },
        routine: { date: '2026-09-08', am: [0, 1], pm: [] },
      },
      version: 0,
    })
  );
});

const OUT = '/home/z/my-project/public/screenshots';
const SHOTS = '/home/z/my-project/scripts';

/* 1. Home (manifest screenshot) */
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/home.png` });

/* 2. Colors (manifest screenshot) — scroll to swatches */
await page.goto('http://localhost:3000#/colors', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/colors.png` });

/* 3. Onboarding (fresh profile removed) */
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('aurelia-store'));
  s.state.profile = null;
  localStorage.setItem('aurelia-store', JSON.stringify(s));
});
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${SHOTS}/shot-onboarding.png` });

/* 4. Search overlay */
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('aurelia-store'));
  s.state.profile = { name: 'Maya', skinType: 'oily', vibe: 'soft' };
  localStorage.setItem('aurelia-store', JSON.stringify(s));
});
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.click('button[aria-label="Search tips, colors, looks"]');
await page.waitForTimeout(600);
await page.fill('input[placeholder*="Search colors"]', 'oily');
await page.waitForTimeout(700);
await page.screenshot({ path: `${SHOTS}/shot-search.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

/* 5. Routine checklist (skin tab) */
await page.goto('http://localhost:3000#/skin', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.locator('text=Your daily checklist').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOTS}/shot-routine.png` });

/* 6. Dark mode home */
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.click('button[aria-label="Switch to dark mode"]');
await page.waitForTimeout(700);
await page.screenshot({ path: `${SHOTS}/shot-dark.png` });

console.log('screenshots captured');
await browser.close();
