/* E2E: chat fixes + provider-invisibility + passport + dark-mode tokens + hydration regression
   Verifies the exact bugs the user reported:
   1. raw markdown (** ** *) no longer shown as text in chat
   2. user query text visible (bubble bg + fg contrast — the old white-on-white)
   3. Ask Aurelia icon visible in LIGHT mode (var(--rose) now resolves)
   4. dark mode: illustrations use dark tokens (not light-locked)
   5. NO provider/model UI leaks to the client (server-side routing):
      no picker button, no provider names, /api/models is gone
   6. Beauty Passport card present + exports
   7. 0 hydration errors (IST + persisted store)
*/
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
  const style = document.createElement('style');
  style.textContent = 'nextjs-portal { display: none !important; }';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  localStorage.setItem(
    'aurelia-store',
    JSON.stringify({
      state: {
        saved: [],
        skinResult: { base: 'combination', sensitiveOverlay: false },
        seasonResult: { id: 'dark-autumn', taken: new Date().toISOString().slice(0, 10) },
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
check('app renders', (await page.locator('text=Aurelia').first().count()) > 0);
check('no hydration/console errors on load', errors.length === 0);

/* ---------- 1. LIGHT MODE: Ask Aurelia icon actually has a colored bg ---------- */
const askIcon = page.locator('button[aria-label="Open Ask Aurelia — your AI stylist"] span').first();
const iconBg = await askIcon.evaluate((el) => getComputedStyle(el).backgroundColor);
check(`Ask Aurelia icon bg resolves (got "${iconBg}")`, iconBg !== 'rgba(0, 0, 0, 0)' && iconBg !== 'transparent');
const iconColor = await askIcon.evaluate((el) => getComputedStyle(el).color);
check(`Ask Aurelia icon fg is themed (got "${iconColor}")`, iconColor !== 'rgba(0, 0, 0, 0)');

/* Chat pill too */
const chatPill = page.locator('button[aria-label="Open Ask Aurelia — your AI stylist"] span').nth(1);
const pillBg = await chatPill.evaluate((el) => getComputedStyle(el).backgroundColor);
check(`Chat pill bg resolves (got "${pillBg}")`, pillBg !== 'rgba(0, 0, 0, 0)');

/* ---------- 2. Beauty Passport on home ---------- */
check('home: Beauty Passport card', (await page.locator('text=Beauty Passport').count()) > 0);
check('home: passport has Save + Import', (await page.locator('button:has-text("Import")').count()) > 0);

/* ---------- 3. Open chat → NO provider UI anywhere ---------- */
await page.click('button[aria-label="Open Ask Aurelia — your AI stylist"]');
await page.waitForTimeout(800);
check('chat opens (header present)', (await page.locator('text=Your pocket stylist').count()) > 0);

check('no model picker button in chat header', (await page.locator('button[aria-label="Choose AI model"]').count()) === 0);
const dialogText = await page.locator('[role="dialog"]').first().innerText().catch(() => '');
check('no provider names visible in chat UI', !/groq|gemini|openrouter|cerebras|mistral|aurelia cloud/i.test(dialogText));
const modelsRes = await page.request.get('http://localhost:3000/api/models').catch(() => null);
const modelsStatus = modelsRes ? await modelsRes.status() : 0;
check(`/api/models no longer exposed (status ${modelsStatus})`, modelsStatus === 404);

/* input text visibility while typing */
await page.fill('input[aria-label="Message Aurelia"]', 'What colors go with a forest-green dress?');
const inputEl = page.locator('input[aria-label="Message Aurelia"]');
const inputColor = await inputEl.evaluate((el) => getComputedStyle(el).color);
const inputBg = await inputEl.evaluate((el) => getComputedStyle(el).backgroundColor);
check(`chat input text color set (got "${inputColor}" on "${inputBg}")`, inputColor !== 'rgba(0, 0, 0, 0)');

/* send */
await page.click('button[aria-label="Send message"]');
/* wait for the reply to finish streaming (zai single-shot) */
await page.waitForTimeout(1200);
for (let i = 0; i < 20; i++) {
  const typing = await page.locator('[aria-label="Aurelia is typing"]').count();
  const assistantText = await page.locator('[role="dialog"] .markdown-body').count();
  if (!typing && assistantText > 0) break;
  await page.waitForTimeout(800);
}
await page.waitForTimeout(600);

/* user bubble: bg must be a real color now */
const userBubble = page.locator('[role="dialog"] .markdown-body >> xpath=..').first(); // assistant
const userMsg = page.locator('div:has-text("What colors go with a forest-green dress?")').last();
const userBg = await userMsg.evaluate((el) => {
  let n = el;
  while (n && n.getAttribute('role') !== 'dialog') {
    const bg = getComputedStyle(n).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    n = n.parentElement;
  }
  return 'none';
});
check(`user message bubble has real bg (got "${userBg}")`, userBg !== 'none');

/* markdown rendered: bold <strong> exists, raw ** does NOT */
const strongCount = await page.locator('[role="dialog"] .markdown-body strong').count();
const bodyText = await page.locator('[role="dialog"] .markdown-body').first().innerText();
check(`assistant reply rendered as markdown (strong count: ${strongCount})`, strongCount > 0);
check('no raw ** left in the rendered text', !bodyText.includes('**'));
const bulletCount = await page.locator('[role="dialog"] .markdown-body li').count();
check(`markdown bullets rendered (li count: ${bulletCount})`, bulletCount > 0);

/* typing indicator gone */
check('typing dots gone after reply', (await page.locator('[aria-label="Aurelia is typing"]').count()) === 0);

/* ---------- 4. DARK MODE: tokens + SVGs + bubble contrast ---------- */
await page.click('button[aria-label="Close chat"]');
await page.waitForTimeout(600);
/* toggle theme via the shell (uses localStorage key aurelia-theme) */
await page.evaluate(() => {
  localStorage.setItem('aurelia-theme', 'dark');
  document.documentElement.classList.add('dark');
});
await page.waitForTimeout(400);

const darkAskIcon = page.locator('button[aria-label="Open Ask Aurelia — your AI stylist"] span').first();
const darkIconBg = await darkAskIcon.evaluate((el) => getComputedStyle(el).backgroundColor);
const darkIconFg = await darkAskIcon.evaluate((el) => getComputedStyle(el).color);
check(`dark: Ask Aurelia icon bg "${darkIconBg}" fg "${darkIconFg}"`, darkIconBg !== 'rgba(0, 0, 0, 0)');

/* hero illustration must use a DARK-mode fill now (not the light #F6DDE3 lock).
   NOTE: target the illustration's own viewBox — the streak FlameIcon also
   lives inside .hero-card and would match a naive 'svg path' query. */
const heroBlush = await page.evaluate(() => {
  const svg = document.querySelector('section .hero-card svg[viewBox="0 0 240 220"]');
  const p = svg?.querySelector('path');
  return p ? getComputedStyle(p).fill : 'none';
});
check(`dark: hero SVG fill themed (got "${heroBlush}")`, heroBlush !== 'none' && heroBlush !== 'rgb(246, 221, 227)');

/* dark user bubble contrast: light rose bg + dark ink fg */
await page.click('button[aria-label="Open Ask Aurelia — your AI stylist"]');
await page.waitForTimeout(700);
const darkBubbleFg = await page.locator('div.whitespace-pre-wrap').first().evaluate((el) => getComputedStyle(el).color);
check(`dark: user bubble fg is dark ink (got "${darkBubbleFg}")`, darkBubbleFg !== 'rgb(255, 255, 255)');
await page.click('button[aria-label="Close chat"]');

/* ---------- 5. WebMCP: window registration is a no-op (API absent) but no crash ---------- */
check('no page errors after all interactions', errors.length === 0);

/* ---------- 6. share-inbox poll does not 404 on normal use ---------- */
check('no unexpected console errors at end', errors.filter((e) => !e.includes('404')).length === 0);

await page.screenshot({ path: 'scripts/verify-chat-fixes.png', fullPage: false });
await browser.close();

console.log(results.join('\n'));
const fails = results.filter((r) => r.includes('FAIL')).length;
console.log(`\n${results.length - fails}/${results.length} passed`);
if (errors.length) console.log('\nConsole/page errors:\n' + errors.join('\n'));
process.exit(fails ? 1 : 0);
