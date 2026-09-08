/* eslint-disable @typescript-eslint/no-require-imports */
/* Generates OG image (1200x630) + iOS splash screens via sharp */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUB = path.join(__dirname, "..", "public");

const INK = "#2d2320";
const INK2 = "#5a4e46";
const INK3 = "#9c8f85";
const ROSE = "#A84A62";
const TERRA = "#C97B58";
const SAGE = "#7FA08C";

function sparkle(x, y, s, fill, op = 1) {
  return `<path d="M${x} ${y}c${0.12 * s} ${0.5 * s} ${0.32 * s} ${0.7 * s} ${0.82 * s} ${0.82 * s}c-${0.5 * s} ${0.12 * s}-${0.7 * s} ${0.32 * s}-${0.82 * s} ${0.82 * s}c-${0.12 * s}-${0.5 * s}-${0.32 * s}-${0.7 * s}-${0.82 * s}-${0.82 * s}c${0.5 * s}-${0.12 * s} ${0.7 * s}-${0.32 * s} ${0.82 * s}-${0.82 * s}Z" fill="${fill}" opacity="${op}"/>`;
}

/* ---------------- OG image 1200x630 ---------------- */
const og = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FAF7F3"/>
      <stop offset="0.55" stop-color="#F7ECE7"/>
      <stop offset="1" stop-color="#F2E3D9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1060" cy="90" r="230" fill="${ROSE}" opacity="0.13"/>
  <circle cx="120" cy="560" r="260" fill="${TERRA}" opacity="0.14"/>
  <circle cx="770" cy="520" r="90" fill="${SAGE}" opacity="0.16"/>

  <!-- brand mark -->
  <circle cx="110" cy="120" r="52" fill="${ROSE}"/>
  <text x="110" y="126" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="58" font-weight="700" fill="#ffffff">A</text>
  <text x="188" y="112" font-family="Georgia, serif" font-style="italic" font-size="72" font-weight="600" fill="${INK}">Aurelia</text>
  <text x="190" y="168" font-family="Georgia, serif" font-size="27" fill="${INK3}">your pocket beauty editor</text>

  <!-- headline -->
  <text x="110" y="300" font-family="Georgia, serif" font-size="96" font-weight="600" fill="${INK}">Style &amp; beauty,</text>
  <text x="110" y="404" font-family="Georgia, serif" font-size="96" font-weight="600" fill="${ROSE}">decoded &#10022;</text>
  <text x="110" y="468" font-family="Georgia, serif" font-size="33" fill="${INK2}">Color combos &#183; Makeup basics &#183; Skincare &#183; Hairstyles</text>

  <!-- swatch pills -->
  <g>
    <circle cx="140" cy="540" r="34" fill="#EFE4D3" stroke="rgba(45,35,32,0.15)" stroke-width="3"/>
    <circle cx="210" cy="540" r="34" fill="#C19A6B" stroke="rgba(45,35,32,0.15)" stroke-width="3"/>
    <circle cx="280" cy="540" r="34" fill="#A84A62" stroke="rgba(45,35,32,0.15)" stroke-width="3"/>
    <circle cx="350" cy="540" r="34" fill="#7FA08C" stroke="rgba(45,35,32,0.15)" stroke-width="3"/>
    <circle cx="420" cy="540" r="34" fill="#2F4B6C" stroke="rgba(45,35,32,0.15)" stroke-width="3"/>
  </g>
  <text x="500" y="551" font-family="Georgia, serif" font-style="italic" font-size="28" fill="${INK3}">all in one warm little app</text>

  ${sparkle(950, 250, 60, TERRA, 0.8)}
  ${sparkle(1090, 380, 44, ROSE, 0.7)}
  ${sparkle(880, 470, 36, SAGE, 0.7)}
</svg>`;

/* ---------------- splash screens (per device resolution) ---------------- */
function splash(w, h) {
  const cx = w / 2;
  const cy = h / 2 - 60;
  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FAF7F3"/>
      <stop offset="0.55" stop-color="#F7ECE7"/>
      <stop offset="1" stop-color="#F2E3D9"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w - 90}" cy="140" r="${Math.min(w, h) * 0.28}" fill="${ROSE}" opacity="0.12"/>
  <circle cx="80" cy="${h - 130}" r="${Math.min(w, h) * 0.3}" fill="${TERRA}" opacity="0.13"/>

  <!-- logo mark -->
  <circle cx="${cx}" cy="${cy - 20}" r="86" fill="${ROSE}"/>
  <text x="${cx}" y="${cy - 10}" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="96" font-weight="700" fill="#ffffff">A</text>

  <!-- wordmark -->
  <text x="${cx}" y="${cy + 130}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="86" font-weight="600" fill="${INK}">Aurelia</text>
  <text x="${cx}" y="${cy + 196}" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${INK3}">your pocket beauty editor</text>

  ${sparkle(cx - 150, cy - 120, 40, TERRA, 0.8)}
  ${sparkle(cx + 150, cy + 40, 34, SAGE, 0.7)}
</svg>`;
}

async function gen() {
  await sharp(Buffer.from(og)).png().toFile(path.join(PUB, "og.png"));
  console.log("og.png ✓");

  const SPLASH = path.join(PUB, "icons");
  const sizes = [
    [1290, 2796],
    [1179, 2556],
    [1284, 2778],
    [1170, 2532],
  ];
  for (const [w, h] of sizes) {
    await sharp(Buffer.from(splash(w, h))).png().toFile(path.join(SPLASH, `splash-${w}x${h}.png`));
    console.log(`splash-${w}x${h}.png ✓`);
  }
}

gen().catch((e) => {
  console.error(e);
  process.exit(1);
});
