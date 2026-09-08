/* ============================================================
   AURELIA DATA — Color Combinations
   Source: docs/COLOR_COMBINATION_KNOWLEDGE_BASE.md (research)
   ============================================================ */

export interface ColorPair {
  id: string;
  why: string;
}
export interface ColorCaution {
  name: string;
  hex: string;
  why: string;
}
export interface WardrobeColor {
  id: string;
  name: string;
  hex: string;
  vibe: string;
  pairs: ColorPair[];
  cautions: ColorCaution[];
  undertone: string;
  secret: string;
}

export const wardrobeColors: WardrobeColor[] = [
  {
    id: "white",
    name: "Soft White",
    hex: "#F7F4EF",
    vibe: "fresh minimalist",
    pairs: [
      { id: "navy", why: "The highest-contrast combo that still reads polished — instant Riviera energy." },
      { id: "denim", why: "White top + jeans is the most reliable formula in fashion history." },
      { id: "black", why: "Graphic, high-contrast drama that always looks intentional." },
      { id: "camel", why: "White lifts camel's warmth so the pairing looks expensive, never heavy." },
      { id: "blush", why: "Keeps pink's sweetness from turning saccharine — soft romance, zero effort." },
    ],
    cautions: [
      { name: "Cream", hex: "#EFE4D3", why: "Two almost-whites read like a failed match. If you mix, keep white near your face." },
      { name: "Icy grey", hex: "#C9CED6", why: "Low contrast can wash out fairer skin — add denim or black for definition." },
    ],
    undertone: "Everyone's color — warm tones glow in creamy whites, cool tones in crisper ones.",
    secret: "Crisp white sneakers refresh an entire outfit the same way a white top does.",
  },
  {
    id: "black",
    name: "Soft Black",
    hex: "#1B1B1B",
    vibe: "timeless city chic",
    pairs: [
      { id: "camel", why: "The camel-coat-over-black-outfit formula is shorthand for expensive." },
      { id: "blush", why: "Blush softens black's severity — instant feminine balance." },
      { id: "red", why: "Bold, cinematic night-out drama." },
      { id: "denim", why: "Black boots or leather plus jeans = edgy but effortless." },
      { id: "white", why: "Maximum contrast, maximum polish." },
    ],
    cautions: [
      { name: "Navy", hex: "#1E2A44", why: "In dim light the two darks blur into an accidental near-match — separate with a light layer." },
      { name: "Espresso", hex: "#4A352B", why: "Two deep muted darks read flat and muddy — add a cream buffer." },
    ],
    undertone: "Flattering on all, most striking on cool and deep undertones.",
    secret: "Texture is black's best accessory — leather + knit + denim reads rich; one flat black reads formal.",
  },
  {
    id: "cream",
    name: "Cream",
    hex: "#EFE4D3",
    vibe: "quiet luxury",
    pairs: [
      { id: "brown", why: "Cozy tonal dressing at its most flattering — like latte art you can wear." },
      { id: "camel", why: "The quiet-luxury layering duo: cream knit under camel coat." },
      { id: "olive", why: "Earthy and effortless — European-vacation energy." },
      { id: "burgundy", why: "Wine richness against soft cream feels cozy and expensive at once." },
      { id: "navy", why: "A softer contrast than black — smart without severity." },
    ],
    cautions: [
      { name: "Optic white", hex: "#FFFFFF", why: "Side by side they look like two whites fighting — commit to one white family per outfit." },
      { name: "Neon lime", hex: "#9EF01A", why: "Cream's softness turns any neon into a costume." },
    ],
    undertone: "Warm and neutral undertones glow; cool tones should pick a pinker cream or anchor with navy.",
    secret: "Cream shoes make almost any outfit look softer and more expensive than black ones would.",
  },
  {
    id: "brown",
    name: "Chocolate Brown",
    hex: "#5C4033",
    vibe: "warm academia",
    pairs: [
      { id: "cream", why: "Warm, cozy, tonal — the pairing that never fails." },
      { id: "camel", why: "Stacking browns in different depths looks custom-made." },
      { id: "rust", why: "Rich autumn layering with real depth." },
      { id: "sage", why: "Earthy-modern — like a walk in the woods, but chic." },
      { id: "denim", why: "Brown boots with jeans is the oldest relaxed-polish trick there is." },
    ],
    cautions: [
      { name: "Black", hex: "#1B1B1B", why: "Flat and muddy with no focal point — if you must, add a camel or cream buffer." },
      { name: "Neon lime", hex: "#9EF01A", why: "Neon flattens brown's earthy richness into costume territory." },
    ],
    undertone: "Made for warm and deep undertones. Cool-fair skin wears it best below the waist.",
    secret: "Brown leather accessories are the fastest way to warm up an otherwise cool outfit.",
  },
  {
    id: "camel",
    name: "Camel",
    hex: "#C19A6B",
    vibe: "old money classic",
    pairs: [
      { id: "black", why: "The power-luxe contrast every stylist reaches for first." },
      { id: "cream", why: "Soft, tonal, quiet luxury." },
      { id: "brown", why: "Rich tonal layers that read expensive." },
      { id: "denim", why: "A camel scarf or coat instantly upgrades jeans." },
      { id: "burgundy", why: "Preppy, wealthy-looking autumn." },
    ],
    cautions: [
      { name: "Mustard", hex: "#C9A02C", why: "Both yellow-based — together they can look too matchy and slightly jaundiced." },
      { name: "Neon lime", hex: "#9EF01A", why: "Neon shatters camel's hushed elegance." },
    ],
    undertone: "Flatters warm and deep-neutral best; cool-fair skin should brighten the face with white or blush at the collar.",
    secret: "A camel coat is the single most expensive-looking garment per dollar you can own.",
  },
  {
    id: "grey",
    name: "Grey",
    hex: "#9B9B9B",
    vibe: "urban minimalist",
    pairs: [
      { id: "navy", why: "Sleek, business-class polish." },
      { id: "blush", why: "Soft modern femininity — the grey-suit-plus-blush-top move." },
      { id: "white", why: "Clean, minimal, gallery-chic." },
      { id: "burgundy", why: "Cool-weather polish with a wine-dark anchor." },
      { id: "denim", why: "Relaxed grey knit plus jeans never misses." },
    ],
    cautions: [
      { name: "Warm beige", hex: "#D9CDBF", why: "The greige trap — without a black or white anchor it looks muddy." },
      { name: "Chocolate", hex: "#5C4033", why: "Two muted mid-darks go drab — rescue with a crisp white layer." },
    ],
    undertone: "Home turf for cool undertones; warm tones should add camel or gold jewelry.",
    secret: "Grey in tailored cuts reads quiet-cool — keep one soft piece in the mix so it doesn't turn corporate.",
  },
  {
    id: "navy",
    name: "Navy",
    hex: "#1E2A44",
    vibe: "Parisian polish",
    pairs: [
      { id: "white", why: "The nautical classic — crisp forever." },
      { id: "camel", why: "Preppy luxe, blazer-and-coat energy." },
      { id: "blush", why: "Sweetness with structure." },
      { id: "rust", why: "Striking high-contrast autumn — the wow combo." },
      { id: "denim", why: "Tonal blues à la française — just vary the washes." },
    ],
    cautions: [
      { name: "Black", hex: "#1B1B1B", why: "The midnight near-miss — if you mix, separate them with light pieces." },
      { name: "Chocolate", hex: "#5C4033", why: "Heavy dark-on-dark without a cream buffer." },
    ],
    undertone: "Near-universal — a best friend to cool undertones, and the softer daytime black for warm ones.",
    secret: "Swap black for navy before noon — same authority, gentler on your face.",
  },
  {
    id: "denim",
    name: "Denim Blue",
    hex: "#5B7C99",
    vibe: "effortless everyday",
    pairs: [
      { id: "white", why: "The formula that built every capsule wardrobe ever." },
      { id: "red", why: "Americana pop — sneakers-and-red-lipstick energy." },
      { id: "camel", why: "Casual, but make it elevated." },
      { id: "mustard", why: "Sunny retro contrast." },
      { id: "navy", why: "Tonal blue-on-blue — choose clearly different shades." },
    ],
    cautions: [
      { name: "Same-wash navy", hex: "#1E2A44", why: "Denim-on-denim only works when shades are obviously different." },
      { name: "All-black layers", hex: "#1B1B1B", why: "With no light break it reads heavy — add a white tee." },
    ],
    undertone: "Universal — denim is a true neutral; dress it up or down.",
    secret: "Treat jeans as a blue-grey neutral: if an outfit would work with grey trousers, it works with jeans.",
  },
  {
    id: "burgundy",
    name: "Burgundy",
    hex: "#6B2231",
    vibe: "dark academia elegance",
    pairs: [
      { id: "cream", why: "Cozy luxe — the winter uniform." },
      { id: "camel", why: "Rich, wealthy autumn tones." },
      { id: "grey", why: "Sleek cool-weather polish." },
      { id: "blush", why: "Tonal romance — pink-and-wine reads very intentional." },
      { id: "mustard", why: "Jewel-toned autumn magic." },
    ],
    cautions: [
      { name: "Red", hex: "#A51C30", why: "Two bold reds competing for the same spotlight." },
      { name: "Black", hex: "#1B1B1B", why: "Gorgeous but heavy — mix textures and keep a light buffer." },
    ],
    undertone: "Flatters almost everyone; especially rich on deep and cool-neutral undertones.",
    secret: "Burgundy tights under a cream skirt — the coziest cold-weather flex there is.",
  },
  {
    id: "red",
    name: "Crimson Red",
    hex: "#A51C30",
    vibe: "main character energy",
    pairs: [
      { id: "white", why: "Graphic and classic — red skirt, white tee, done." },
      { id: "denim", why: "The Americana favorite." },
      { id: "camel", why: "Sophisticated pop — red plus camel reads French." },
      { id: "navy", why: "Preppy nautical contrast." },
      { id: "black", why: "Bold evening drama." },
    ],
    cautions: [
      { name: "Burgundy", hex: "#6B2231", why: "Too close in family — reads like a mismatch instead of a choice." },
      { name: "Hot pink", hex: "#D0417E", why: "Bright-on-bright chaos for beginners — save pink + red for later." },
    ],
    undertone: "Everyone can wear red — blue-based crimson for cool undertones, tomato red for warm.",
    secret: "Scared of red? Start with shoes or a lip — smallest dose, biggest effect.",
  },
  {
    id: "blush",
    name: "Blush Pink",
    hex: "#E8C4C4",
    vibe: "soft romantic",
    pairs: [
      { id: "cream", why: "Tender tonal romance." },
      { id: "grey", why: "Modern softness — grey suit, blush top." },
      { id: "navy", why: "Sweet meets structured." },
      { id: "brown", why: "The pink-and-brown classic (ballet-flat approved)." },
      { id: "camel", why: "Warm glow, soft contrast." },
    ],
    cautions: [
      { name: "Hot pink", hex: "#D0417E", why: "Reads like two mismatched pinks unless depths are clearly different." },
      { name: "Neon lime", hex: "#9EF01A", why: "A harsh fight with soft pink — the whole outfit loses." },
    ],
    undertone: "A bestie for cool and neutral undertones; warm tones glow more in a peachier blush.",
    secret: "Blush plus gold jewelry = instant glow; silver reads cooler next to it.",
  },
  {
    id: "hotpink",
    name: "Hot Pink",
    hex: "#D0417E",
    vibe: "dopamine dressing",
    pairs: [
      { id: "white", why: "Crisp pop, clean summer energy." },
      { id: "navy", why: "Bold prep — the unexpected sophisticate." },
      { id: "black", why: "Statement night-out drama." },
      { id: "grey", why: "Modern and cool, gallery-chic." },
      { id: "denim", why: "Playful casual that reads effortless, not loud." },
    ],
    cautions: [
      { name: "Red", hex: "#A51C30", why: "A bright-on-bright war for attention." },
      { name: "Burgundy", hex: "#6B2231", why: "Muted jewel next to neon reads unbalanced." },
    ],
    undertone: "Anyone, with confidence — electric on cool undertones; warm tones shine in coral-pink.",
    secret: "One hot pink bag on an all-neutral outfit is the fastest mood-lift known to science.",
  },
  {
    id: "olive",
    name: "Olive",
    hex: "#646B49",
    vibe: "utility cool",
    pairs: [
      { id: "cream", why: "Earthy and clean — the easiest way to wear olive." },
      { id: "white", why: "Fresh utility: white tee + olive cargos." },
      { id: "rust", why: "Deep autumn layering." },
      { id: "camel", why: "Tonal desert polish." },
      { id: "black", why: "Edgy utility — black boots ground olive." },
    ],
    cautions: [
      { name: "Neon lime", hex: "#9EF01A", why: "Cousin colors, both screaming." },
      { name: "Hot pink", hex: "#D0417E", why: "Muted versus neon is a saturation fight — the olive loses." },
    ],
    undertone: "Warm, golden and deep undertones glow; very cool-fair skin should keep cream near the face.",
    secret: "Olive cargos + white sneakers is the blueprint off-duty-model look. Add a cream knit and go.",
  },
  {
    id: "sage",
    name: "Sage Green",
    hex: "#A3B18A",
    vibe: "clean-girl calm",
    pairs: [
      { id: "cream", why: "Serene and quietly expensive." },
      { id: "blush", why: "Garden romance, soft contrast." },
      { id: "brown", why: "Earthy depth that grounds the softness." },
      { id: "white", why: "Clean, spa-like freshness." },
      { id: "denim", why: "Fresh casual — sage knit plus jeans." },
    ],
    cautions: [
      { name: "Emerald", hex: "#0F8A5F", why: "Cousin greens clash — near in hue, far in saturation." },
      { name: "Neon lime", hex: "#9EF01A", why: "Neon flattens sage's softness entirely." },
    ],
    undertone: "The most universally flattering green — almost everyone can wear it next to the face.",
    secret: "Sage is the green for people who think they can't wear green.",
  },
  {
    id: "mustard",
    name: "Mustard",
    hex: "#C9A02C",
    vibe: "retro '70s sunshine",
    pairs: [
      { id: "olive", why: "Autumn tonal, straight out of a record shop." },
      { id: "navy", why: "Golden-hour contrast — sweater-weather staple." },
      { id: "brown", why: "Rich '70s warmth." },
      { id: "burgundy", why: "Jewel-toned autumn magic." },
      { id: "cream", why: "Sunny softness that softens mustard's boldness." },
    ],
    cautions: [
      { name: "Neon lime", hex: "#9EF01A", why: "A yellow-family fight — too loud, too close." },
      { name: "Pale grey", hex: "#C7C7C7", why: "Muted-on-muted goes dingy — anchor with navy or chocolate." },
    ],
    undertone: "Glorious on warm and deep undertones; cool-fair skin should keep it below the chin.",
    secret: "Deep skin tones carry mustard like royalty; fair cools should wear it away from the face.",
  },
  {
    id: "rust",
    name: "Rust / Terracotta",
    hex: "#A64B2A",
    vibe: "earthy autumn richness",
    pairs: [
      { id: "cream", why: "Warm-gallery contrast." },
      { id: "camel", why: "Tonal desert sunset." },
      { id: "olive", why: "The core of every autumn-layering photo." },
      { id: "navy", why: "Striking complementary contrast — softened orange + blue." },
      { id: "sage", why: "Earthy modern, garden-fresh." },
    ],
    cautions: [
      { name: "Cherry red", hex: "#A51C30", why: "Too-close family competition — reads accidental." },
      { name: "Hot pink", hex: "#D0417E", why: "Warm-earth versus cool-neon fight." },
    ],
    undertone: "A dream for warm and deep undertones; cool tones look great in rust on the bottom half.",
    secret: "Rust-colored leather — a bag, boots — gives you the trend without committing a whole garment.",
  },
  {
    id: "lavender",
    name: "Lavender",
    hex: "#B99CD8",
    vibe: "dreamy whimsical",
    pairs: [
      { id: "cream", why: "Dreamy softness." },
      { id: "white", why: "Clean pastel, springtime fresh." },
      { id: "grey", why: "Cool, modern, unexpectedly chic." },
      { id: "navy", why: "Tonal depth without harshness." },
      { id: "sage", why: "The pastel garden pairing." },
    ],
    cautions: [
      { name: "Burgundy", hex: "#6B2231", why: "Purple stacked on purple can read bruise — one purple per outfit." },
      { name: "Neon lime", hex: "#9EF01A", why: "Pastel versus neon is an unbalanced fight." },
    ],
    undertone: "A cool-undertone dream; warm tones radiate more in orchid or plum instead.",
    secret: "Lavender nails with a grey hoodie — the laziest cool-girl combo in existence.",
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#2F7676",
    vibe: "coastal jewel polish",
    pairs: [
      { id: "cream", why: "Soft contrast that lets the jewel tone shine." },
      { id: "mustard", why: "Complementary blue-orange magic, muted enough to actually wear." },
      { id: "camel", why: "Earthy-luxe contrast." },
      { id: "burgundy", why: "Jewel-box richness for winter nights." },
      { id: "white", why: "Crisp coastal energy." },
    ],
    cautions: [
      { name: "Emerald", hex: "#0F8A5F", why: "A cousin clash — near in hue, mismatched in depth." },
      { name: "Mint", hex: "#A8D9C0", why: "Reads like a near-miss green match rather than a choice." },
    ],
    undertone: "The rare bridge color that flatters warm AND cool undertones — gorgeous on olive and deep skin.",
    secret: "Teal is the both-teams color — when the group chat argues warm vs cool, teal wins for everyone.",
  },
  {
    id: "mint",
    name: "Mint",
    hex: "#A8D9C0",
    vibe: "fresh spring breeze",
    pairs: [
      { id: "white", why: "Springtime fresh, light and clean." },
      { id: "navy", why: "Preppy seaside contrast." },
      { id: "denim", why: "Easy, breezy casual." },
      { id: "grey", why: "Cool and calm." },
      { id: "blush", why: "Pastel garden cuteness." },
    ],
    cautions: [
      { name: "Neon lime", hex: "#9EF01A", why: "Tips straight into costume-green territory." },
      { name: "Rust (large doses)", hex: "#A64B2A", why: "Cool pastel versus warm earth is a fight — a small rust accessory is charming though." },
    ],
    undertone: "Shines on cool and neutral undertones; warm-fair skin may prefer a deeper jade.",
    secret: "Mint reads freshest in small doses — flats, a mini bag, or a cardigan over cream.",
  },
];

export const colorById = (id: string) => wardrobeColors.find((c) => c.id === id);

/* shorter display names for the compact 4-col swatch grid */
export const colorShortNames: Record<string, string> = {
  white: "White",
  black: "Black",
  cream: "Cream",
  brown: "Chocolate",
  camel: "Camel",
  grey: "Grey",
  navy: "Navy",
  denim: "Denim",
  burgundy: "Burgundy",
  red: "Crimson",
  blush: "Blush",
  hotpink: "Hot Pink",
  olive: "Olive",
  sage: "Sage",
  mustard: "Mustard",
  rust: "Rust",
  lavender: "Lavender",
  teal: "Teal",
  mint: "Mint",
};

/* bidirectional pairing: A pairs with B ⇒ B pairs with A */
export function getMatchesFor(id: string): { color: WardrobeColor; why: string }[] {
  const out: { color: WardrobeColor; why: string }[] = [];
  for (const c of wardrobeColors) {
    if (c.id === id) continue;
    const direct = c.pairs.find((p) => p.id === id);
    if (direct) out.push({ color: c, why: direct.why });
  }
  const self = colorById(id);
  if (self) for (const p of self.pairs) {
    const pc = colorById(p.id);
    if (pc && !out.find((o) => o.color.id === pc.id)) out.push({ color: pc, why: p.why });
  }
  return out;
}

/* ---------------- Palettes ---------------- */

export interface Palette {
  id: string;
  name: string;
  mood: string;
  season: string;
  occasion: string;
  swatches: { name: string; hex: string; accent?: boolean }[];
  why: string;
  outfit: string;
}

export const palettes: Palette[] = [
  {
    id: "capsule-neutrals",
    name: "Capsule Neutrals",
    mood: "warm · calm · forever pieces",
    season: "All year",
    occasion: "Work, classes, errands",
    swatches: [
      { name: "Cream", hex: "#EFE4D3" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Taupe", hex: "#A6937F" },
      { name: "Chocolate", hex: "#5C4033" },
    ],
    why: "Four steps of the same warm family = automatic harmony. Tonal depth reads expensive.",
    outfit: "Cream fitted knit + camel wide-leg trousers + chocolate loafers + taupe shoulder bag.",
  },
  {
    id: "power-neutral",
    name: "Power Neutral",
    mood: "sharp · confident · boardroom",
    season: "All year",
    occasion: "Interviews, presentations",
    swatches: [
      { name: "Black", hex: "#1B1B1B" },
      { name: "White", hex: "#F7F4EF" },
      { name: "Grey", hex: "#9B9B9B" },
    ],
    why: "Maximal contrast reads decisive; grey softens the black/white severity just enough.",
    outfit: "White button-down + black tailored trousers + grey blazer + black pointed pumps.",
  },
  {
    id: "soft-romance",
    name: "Soft Romance",
    mood: "tender · dreamy · leading lady",
    season: "Spring / Summer",
    occasion: "Dates, bridal showers",
    swatches: [
      { name: "Blush", hex: "#E8C4C4" },
      { name: "Cream", hex: "#EFE4D3" },
      { name: "Mauve", hex: "#B08E9A" },
      { name: "Chocolate", hex: "#5C4033", accent: true },
    ],
    why: "Three low-saturation pinks stay soft without fading; chocolate grounds it.",
    outfit: "Blush satin midi skirt + cream knit cardigan + mauve heels + delicate gold jewelry.",
  },
  {
    id: "autumn-layers",
    name: "Autumn Layers",
    mood: "cozy · nostalgic · pumpkin patch",
    season: "Fall",
    occasion: "Campus, coffee dates",
    swatches: [
      { name: "Rust", hex: "#A64B2A" },
      { name: "Mustard", hex: "#C9A02C" },
      { name: "Olive", hex: "#646B49" },
      { name: "Chocolate", hex: "#5C4033" },
      { name: "Cream", hex: "#EFE4D3" },
    ],
    why: "Analogous warm earth tones with dark colors anchoring the bottom.",
    outfit: "Cream tee + mustard oversized cardigan + olive cargo trousers + rust scarf + chocolate ankle boots.",
  },
  {
    id: "summer-breeze",
    name: "Summer Breeze",
    mood: "light · salty · carefree",
    season: "Summer",
    occasion: "Vacation, brunch, strolls",
    swatches: [
      { name: "White", hex: "#F7F4EF" },
      { name: "Sky", hex: "#A3C6DD" },
      { name: "Sand", hex: "#E8D8BE" },
    ],
    why: "All-light values keep it airy; sky and sand never fight.",
    outfit: "White linen midi dress + sky-blue shirt worn open + sand flat sandals + woven straw bag.",
  },
  {
    id: "monochrome-moment",
    name: "Monochrome Moment",
    mood: "fashion-forward · elongating",
    season: "All year",
    occasion: "City days, gallery nights",
    swatches: [
      { name: "Cream", hex: "#EFE4D3" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Caramel", hex: "#8B5E3C" },
      { name: "Chocolate", hex: "#5C4033" },
    ],
    why: "One hue in four values = an uninterrupted vertical line. Instantly expensive.",
    outfit: "Cream bodysuit + caramel satin midi skirt + chocolate knee-high boots + camel coat.",
  },
  {
    id: "riviera-stripe",
    name: "Riviera Stripe",
    mood: "nautical · playful · French summer",
    season: "Late Spring / Summer",
    occasion: "City breaks, brunch",
    swatches: [
      { name: "Navy", hex: "#1E2A44" },
      { name: "White", hex: "#F7F4EF" },
      { name: "Denim", hex: "#5B7C99" },
      { name: "Red", hex: "#A51C30", accent: true },
    ],
    why: "The nautical triad with red as the 10% pop.",
    outfit: "Navy-and-white striped tee + white jeans + red ballet flats + denim jacket tied at the waist.",
  },
  {
    id: "quiet-luxury",
    name: "Quiet Luxury",
    mood: "hushed · expensive · logo-free",
    season: "All year",
    occasion: "Minimalist office, dinners",
    swatches: [
      { name: "Off-white", hex: "#F3EDE4" },
      { name: "Greige", hex: "#D6CBBB" },
      { name: "Taupe", hex: "#A6937F" },
      { name: "Espresso", hex: "#4A352B" },
    ],
    why: "Barely-there tonal steps; richer textures (silk, wool, leather) carry it.",
    outfit: "Off-white silk tee + greige tailored trousers + taupe belt + espresso loafers.",
  },
  {
    id: "midnight-edge",
    name: "Midnight Edge",
    mood: "bold · after-dark",
    season: "All year",
    occasion: "Parties, concerts, dates",
    swatches: [
      { name: "Black", hex: "#1B1B1B" },
      { name: "Charcoal", hex: "#3A3A3F" },
      { name: "Hot Pink", hex: "#D0417E", accent: true },
    ],
    why: "Near-black tonal base + one electric accent = drama without chaos.",
    outfit: "Black slip dress + hot pink heels + black leather jacket + silver hoops.",
  },
  {
    id: "pastel-garden",
    name: "Pastel Garden",
    mood: "whimsical · springtime-soft",
    season: "Spring",
    occasion: "Garden parties, picnics",
    swatches: [
      { name: "Lavender", hex: "#B99CD8" },
      { name: "Mint", hex: "#A8D9C0" },
      { name: "Blush", hex: "#E8C4C4" },
      { name: "Cream", hex: "#EFE4D3" },
    ],
    why: "Pastels of equal saturation harmonize like watercolors.",
    outfit: "Lavender knit + cream pleated skirt + mint ballet flats + blush mini bag.",
  },
  {
    id: "winter-jewel",
    name: "Winter Jewel Box",
    mood: "rich · festive · candlelit",
    season: "Winter / Holidays",
    occasion: "Holiday parties, NYE dinners",
    swatches: [
      { name: "Burgundy", hex: "#6B2231" },
      { name: "Teal", hex: "#2F7676" },
      { name: "Navy", hex: "#1E2A44" },
      { name: "Gold", hex: "#C9A02C", accent: true },
    ],
    why: "Deep jewel tones of matching saturation plus one golden glint.",
    outfit: "Burgundy velvet top + teal satin midi skirt + navy heels + gold hoops.",
  },
  {
    id: "denim-days",
    name: "Denim Days",
    mood: "effortless · off-duty",
    season: "All year",
    occasion: "Weekend errands, casual dates",
    swatches: [
      { name: "Denim", hex: "#5B7C99" },
      { name: "White", hex: "#F7F4EF" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Red", hex: "#A51C30", accent: true },
    ],
    why: "Denim is the neutral, camel the warm layer, red the 10% personality.",
    outfit: "White tee + straight-leg jeans + camel cardigan + red canvas sneakers + red lip.",
  },
  {
    id: "sage-stone",
    name: "Sage & Stone",
    mood: "calm · clean · slow morning",
    season: "Spring / Fall",
    occasion: "Study dates, soft office days",
    swatches: [
      { name: "Sage", hex: "#A3B18A" },
      { name: "Cream", hex: "#EFE4D3" },
      { name: "Grey", hex: "#9B9B9B" },
      { name: "Chocolate", hex: "#5C4033" },
    ],
    why: "Muted mid-tones of matching softness, grounded by chocolate.",
    outfit: "Sage sweater + cream jeans + grey wool coat + chocolate boots.",
  },
  {
    id: "desert-weekend",
    name: "Desert Weekend",
    mood: "warm · golden · road trip",
    season: "Late Summer / Early Fall",
    occasion: "Festivals, golden-hour photos",
    swatches: [
      { name: "Rust", hex: "#A64B2A" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Cream", hex: "#EFE4D3" },
      { name: "Denim", hex: "#5B7C99" },
    ],
    why: "A sunset gradient (cream → camel → rust) with denim's cool blue keeping it modern.",
    outfit: "Cream tank + rust bias-cut skirt + denim jacket + camel ankle boots.",
  },
  {
    id: "dark-academia",
    name: "Dark Academia Library",
    mood: "scholarly · moody · cozy",
    season: "Winter",
    occasion: "Library dates, museum afternoons",
    swatches: [
      { name: "Burgundy", hex: "#6B2231" },
      { name: "Chocolate", hex: "#5C4033" },
      { name: "Cream", hex: "#EFE4D3" },
      { name: "Charcoal", hex: "#3A3A3F" },
    ],
    why: "Deep cozy darks plus one candlelight-cream.",
    outfit: "Cream cable-knit sweater + burgundy plaid mini skirt + charcoal tights + chocolate boots.",
  },
];

/* ---------------- Theory, rules, undertone ---------------- */

export const theorySchemes = [
  {
    id: "complementary",
    name: "Complementary",
    tagline: "opposites attract",
    desc: "Colors across the wheel: blue ↔ orange, purple ↔ yellow, red ↔ green.",
    examples: ["Navy coat + rust sweater", "Lavender top + mustard cardigan", "Burgundy sweater + sage trousers"],
    tip: "Mute at least one side (rust, not neon orange) and use the 60-30-10 rule.",
  },
  {
    id: "analogous",
    name: "Analogous",
    tagline: "next-door neighbors",
    desc: "2-3 adjacent colors — always harmonious because they share undertones.",
    examples: ["Blush + mauve + burgundy", "Olive + sage + cream", "Navy + denim + teal"],
    tip: "Vary the values — light-to-dark within the family, not three of the same depth.",
  },
  {
    id: "monochromatic",
    name: "Monochromatic",
    tagline: "one color, many shades",
    desc: "A single hue in different depths and textures.",
    examples: ["Cream + camel + chocolate", "Blush + mauve + plum", "Light grey + charcoal"],
    tip: "Vary textures (satin, knit, leather) so it reads rich. Also the most elongating way to dress.",
  },
  {
    id: "neutral-based",
    name: "Neutral-Based",
    tagline: "the real-life formula",
    desc: "Neutrals do 90% of the work, one statement color pops.",
    examples: ["White tee + jeans + red flats", "Cream sweater + camel trousers + hot pink bag"],
    tip: "Behind almost every outfit you've ever saved on Pinterest.",
  },
];

export const colorRules = [
  { title: "Three colors max", desc: "Neutrals count. Above three, the eye doesn't know where to land." },
  { title: "When in doubt, go tonal", desc: "One family, three depths — impossible to get wrong, instantly expensive." },
  { title: "Denim goes with almost everything", desc: "Treat jeans as a blue-grey neutral." },
  { title: "Two neutrals + one statement", desc: "The can't-fail formula." },
  { title: "Match your leathers, pick one metal", desc: "Shoes / belt / bag in one family; gold OR silver, not both." },
  { title: "Echo a color twice", desc: "Red lip ↔ red flats. One echo looks planned; zero looks assembled in the dark." },
  { title: "Match saturation, not just hue", desc: "Soft with soft, bold with bold. When two colors fight, break them up with a white bridge." },
  { title: "Light near the face, dark toward the feet", desc: "Brightens your complexion and elongates you." },
  { title: "Navy is the friendlier daytime black", desc: "Same authority, gentler on warm undertones, chicer with camel." },
  { title: "Your skin is a color too", desc: "A color that fights you usually still works on the bottom half or in a bag. Move it, don't bin it." },
];

export const rule6030 = {
  title: "The 60-30-10 Rule",
  desc: "60% dominant color · 30% secondary · 10% accent. Not literal math — eyeball it. Feels too much? Shrink the 10%. Feels boring? Grow it.",
  example: {
    sixty: { name: "Navy sweater dress", hex: "#1E2A44" },
    thirty: { name: "Light denim jacket", hex: "#5B7C99" },
    ten: { name: "Red flats + red lip", hex: "#A51C30" },
    note: "The red is the punctuation mark, not the paragraph — that's why it reads chic instead of clownish.",
  },
};

export interface UndertoneQuizQuestion {
  q: string;
  options: { text: string; result: "warm" | "cool" | "neutral" }[];
}

export const undertoneQuiz: UndertoneQuizQuestion[] = [
  {
    q: "Look at the veins on the inside of your wrist in daylight. What color are they?",
    options: [
      { text: "Blue or purple", result: "cool" },
      { text: "Green", result: "warm" },
      { text: "I honestly can't tell — they look both / neither", result: "neutral" },
    ],
  },
  {
    q: "Hold gold and silver jewelry near your face, one at a time. Which makes your skin glow?",
    options: [
      { text: "Gold, definitely", result: "warm" },
      { text: "Silver, definitely", result: "cool" },
      { text: "Both look equally good", result: "neutral" },
    ],
  },
  {
    q: "Hold a pure white sheet of paper next to your bare face in daylight. Your face looks…",
    options: [
      { text: "Pinkish or fresher", result: "cool" },
      { text: "Yellowish or duller", result: "warm" },
      { text: "Exactly the same as always", result: "neutral" },
    ],
  },
];

export const undertoneResults = {
  warm: {
    name: "Warm undertone",
    glow: ["Camel", "Cream", "Chocolate", "Olive", "Mustard", "Rust", "Coral", "Tomato Red"],
    glowHexes: ["#C19A6B", "#EFE4D3", "#5C4033", "#646B49", "#C9A02C", "#A64B2A", "#E86A50", "#C63D2F"],
    care: "Be careful with icy pastels, cool grey and optic white near your face — choose ivory instead. Gold jewelry is your friend.",
    colorIds: ["camel", "cream", "brown", "olive", "mustard", "rust"],
  },
  cool: {
    name: "Cool undertone",
    glow: ["Navy", "Blush", "Hot Pink", "Crimson", "Burgundy", "Lavender", "Mint", "Grey"],
    glowHexes: ["#1E2A44", "#E8C4C4", "#D0417E", "#A51C30", "#6B2231", "#B99CD8", "#A8D9C0", "#9B9B9B"],
    care: "Be careful with mustard and rust near the face, and muddy warm beiges — swap beige for cream + grey. Silver jewelry is your friend.",
    colorIds: ["navy", "blush", "hotpink", "red", "burgundy", "lavender", "mint", "grey"],
  },
  neutral: {
    name: "Neutral undertone",
    glow: ["Almost everything", "Teal", "Sage", "Navy"],
    glowHexes: ["#2F7676", "#A3B18A", "#1E2A44", "#E8C4C4"],
    care: "The lucky middle — most colors flatter you. Just avoid pale-on-pale low contrast; keep one anchoring dark piece.",
    colorIds: ["teal", "sage", "navy", "blush", "cream", "denim"],
  },
};
