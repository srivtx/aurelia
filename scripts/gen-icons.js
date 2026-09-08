/* eslint-disable @typescript-eslint/no-require-imports */
/* Generates PWA icon PNGs from the master SVG (icon.svg) */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ICONS = path.join(__dirname, "..", "public", "icons");
const svg = fs.readFileSync(path.join(ICONS, "icon.svg"), "utf8");

/* maskable: same art but content shrunk into the 80% safe zone with full-bleed bg */
const maskable = svg
  .replace('<rect width="512" height="512" rx="116"', '<rect width="512" height="512" rx="0"')
  .replace("</svg>", `<g transform="translate(51.2,51.2) scale(0.8)">${svg.match(/<path[^>]*>/g).join("")}</g></svg>`);

async function gen() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(ICONS, `icon-${size}.png`));
    await sharp(Buffer.from(maskable)).resize(size, size).png().toFile(path.join(ICONS, `maskable-${size}.png`));
  }
  await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(path.join(ICONS, "apple-touch-icon.png"));
  await sharp(Buffer.from(svg)).resize(32, 32).png().toFile(path.join(ICONS, "favicon-32.png"));
  console.log("icons generated:", fs.readdirSync(ICONS).join(", "));
}

gen().catch((e) => {
  console.error(e);
  process.exit(1);
});
