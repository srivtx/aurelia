/* ============================================================
   AURELIA DATA — Daily tips (Home hero, rotates by day)
   ============================================================ */

export interface DailyTip {
  id: string;
  category: "colors" | "makeup" | "skin" | "hair";
  title: string;
  body: string;
}

export const dailyTips: DailyTip[] = [
  { id: "t1", category: "colors", title: "The 3-color rule", body: "Max three colors per outfit — neutrals count. Above three, the eye doesn't know where to land. When in doubt, go tonal: one family, three depths." },
  { id: "t2", category: "makeup", title: "Foundation goes after skincare", body: "Wait 3-5 minutes after moisturizer before your base — otherwise foundation clings in patches. Makeup is paint; hydrated skin is the wall." },
  { id: "t3", category: "skin", title: "The two-finger rule", body: "Sunscreen: squeeze two lines from base to tip of your index and middle fingers — that's the correct amount for face + neck. Most people apply a quarter of it." },
  { id: "t4", category: "hair", title: "Bobby pins: wavy side DOWN", body: "The waves grip your hair; the flat side holds it smooth. Sliding pins? Cross two in an X. This one change fixes half your bad hair days." },
  { id: "t5", category: "colors", title: "Navy + camel, always", body: "The combo stylists reach for first. Swap black for navy before noon — same authority, gentler on your face, chicer with camel." },
  { id: "t6", category: "makeup", title: "Wipe your mascara wand", body: "One swipe on a tissue before applying. Excess product is what makes clumps — the wiggle-at-the-roots technique does the rest." },
  { id: "t7", category: "skin", title: "Oily skin still needs moisturizer", body: "Dehydrated skin pumps out MORE oil to compensate. A light gel moisturizer usually means less shine, not more. It's the #1 oily-skin myth." },
  { id: "t8", category: "hair", title: "Second-day hair is a superpower", body: "Freshly-washed hair slides out of every style. Day-two texture grips and holds. Dry shampoo at the roots the night before = instant volume." },
  { id: "t9", category: "colors", title: "Denim is a neutral", body: "Treat jeans as a blue-grey neutral: if an outfit would work with grey trousers, it works with jeans. That's why jeans go with almost everything." },
  { id: "t10", category: "makeup", title: "Blush above the nostril line", body: "Smile, tap the apples, blend up toward your temples. Blush placed lower drags the whole face down. Keep it lifted, keep it soft." },
  { id: "t11", category: "skin", title: "Patch test everything new", body: "Pea-size amount on your inner arm, wait 24-48 hours. Any redness or itching = not for you. One new product at a time, two weeks apart." },
  { id: "t12", category: "hair", title: "Pancake every braid", body: "Tug the outer edge of every loop outward, bottom to top. A braid can look twice as thick in 30 seconds — this is how 'expensive' braids are made." },
  { id: "t13", category: "colors", title: "Match saturation, not just hue", body: "Soft with soft, bold with bold. Most 'clashing' outfits fight on brightness, not color. When two colors fight, break them up with a white or cream bridge." },
  { id: "t14", category: "makeup", title: "One statement at a time", body: "Soft glam is ONE balanced level of pretty everywhere. Bolder lip last-minute? Soften the eyes even more. Two shouting features make noise, not music." },
  { id: "t15", category: "skin", title: "Your phone causes cheek breakouts", body: "Wipe your screen daily and use earphones on long calls. Also: pillowcase 1-2× a week. Your face spends 8 hours a night on it." },
  { id: "t16", category: "hair", title: "Never tie soaking-wet hair", body: "Wet hair stretches and snaps. Blot with a microfiber towel (never rub), detangle from the ends, and let it reach damp before any elastic." },
  { id: "t17", category: "colors", title: "Light near the face", body: "Bright colors near your face, darker tones toward your feet — it brightens your complexion and elongates you. Color that fights you? Wear it on the bottom." },
  { id: "t18", category: "makeup", title: "Cream before powder", body: "Cream and liquid products go on before powders — powders grip, creams slide on top of powder. That's the entire logic of makeup order." },
  { id: "t19", category: "skin", title: "Consistency beats 12 steps", body: "Skin cell turnover takes ~28 days. Hydration shows in ~2 weeks, texture in 4-8, dark spots in months. A steady 3-step routine beats a shelf of products." },
  { id: "t20", category: "hair", title: "Silk scrunchies overnight", body: "A loose low braid with a silk scrunchie (or a silk pillowcase) means waking up with less frizz, fewer tangles, and less hairline breakage." },
  { id: "t21", category: "colors", title: "60-30-10, eyeballed", body: "60% dominant color, 30% secondary, 10% accent. The accent is the punctuation, not the paragraph. Feels like too much? Shrink the 10%." },
  { id: "t22", category: "makeup", title: "Set concealer with a whisper", body: "Dab, don't rub. Thin layer, wait 30 seconds, second layer only where needed, then a tiny puff of powder. Cakey under-eyes come from too much, too fast." },
  { id: "t23", category: "skin", title: "UVA passes through windows", body: "'I'm indoors' is mostly false — the aging rays come right through glass. Studying by a sunny window or long bus rides = real exposure. SPF daily." },
  { id: "t24", category: "hair", title: "Toothbrush for flyaways", body: "Spray a clean toothbrush with hairspray and gently stroke down the crown. Tamed flyaways without helmet-head — the red-carpet trick." },
];

export function tipOfTheDay(): DailyTip {
  const day = Math.floor(Date.now() / 86400000);
  return dailyTips[day % dailyTips.length];
}

export function paletteOfTheDay(palettes: { id: string }[]): string {
  const day = Math.floor(Date.now() / 86400000);
  return palettes[day % palettes.length].id;
}
