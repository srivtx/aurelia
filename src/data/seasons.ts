/* ============================================================
   AURELIA — 12-Season Personal Color Analysis
   ------------------------------------------------------------
   Professional "personal color" (personal color) methodology,
   implemented as vector-space classification:
     warmth × depth × chroma × contrast  →  1 of 12 seasons
   Each diagnostic answer contributes weighted signal deltas;
   the user vector is matched to the nearest season archetype.
   ============================================================ */

import { hexToLab, deltaE2000, type Lab } from "@/lib/color-science";

/* ---------- Types ---------- */

export interface SeasonSwatch {
  name: string;
  hex: string;
}
export interface Season {
  id: string;
  name: string;
  tagline: string;
  family: "spring" | "summer" | "autumn" | "winter";
  /* archetype vector: [warmth, depth, chroma, contrast] ≈ -2..2 */
  v: [number, number, number, number];
  palette: SeasonSwatch[];
  metals: string;
  jewelry: string;
  makeup: string;
  hair: string;
  avoid: { hex: string; name: string; why: string }[];
  wearing: string;
}

/* ---------- Diagnostic quiz ---------- */

export interface SeasonOption {
  text: string;
  sig: [number, number, number, number]; // [warm, depth, chroma, contrast]
}
export interface SeasonQuestion {
  id: string;
  q: string;
  hint: string;
  weight: [number, number, number, number];
  options: SeasonOption[];
}

export const seasonQuiz: SeasonQuestion[] = [
  {
    id: "hair",
    q: "Your natural hair color — in daylight, un-dyed",
    hint: "No cheating, the roots know the truth ✦",
    weight: [1.5, 1.2, 0.4, 0.6],
    options: [
      { text: "Platinum, ash blonde or light golden brown", sig: [0.5, -1.6, 0.1, -0.3] },
      { text: "Medium brown, warm chestnut or honey brown", sig: [1.2, -0.2, -0.2, 0] },
      { text: "Cool ash brown, mousy taupe or dishwater blonde", sig: [-1.2, -0.5, -0.8, -0.4] },
      { text: "Dark brown to black with warm or red glints", sig: [0.8, 1.2, 0.3, 0.5] },
      { text: "Blue-black or espresso with a cool sheen", sig: [-1.3, 1.8, 0.4, 0.7] },
    ],
  },
  {
    id: "eyes",
    q: "Your eyes — look closely at the iris in a mirror",
    hint: "The ring around the pupil tells all",
    weight: [0.6, 1.0, 1.3, 0.4],
    options: [
      { text: "Light & icy: pale blue, grey or light green", sig: [-0.8, -1.2, 0.8, 0.2] },
      { text: "Bright & crystal: vivid blue, green or amber", sig: [0.3, 0, 1.6, 0.4] },
      { text: "Soft & muted: grey-blue, soft hazel, dusty green", sig: [-0.3, -0.4, -1.4, -0.4] },
      { text: "Deep & dark: dark brown or black-brown", sig: [0.5, 1.6, -0.2, 0.3] },
      { text: "Warm & glowing: golden brown, whiskey, green-gold", sig: [1.4, 0.2, 0.5, 0.2] },
    ],
  },
  {
    id: "skin-depth",
    q: "Your skin's natural depth (foundation-free)",
    hint: "Compare to a plain white sheet in daylight",
    weight: [0.3, 1.5, 0.2, 0.3],
    options: [
      { text: "Very fair porcelain — I burn instantly", sig: [-0.2, -1.8, 0, 0] },
      { text: "Fair-to-light, I tan slowly", sig: [-0.1, -0.8, 0, 0] },
      { text: "Medium beige or olive, I tan evenly", sig: [0.3, 0.3, 0.1, 0] },
      { text: "Tan-to-deep, I rarely burn", sig: [0.4, 1.2, 0.2, 0.1] },
      { text: "Deep — rich, dark tones", sig: [0.3, 1.8, 0.4, 0.2] },
    ],
  },
  {
    id: "veins",
    q: "Look at the inside of your wrist — what color are your veins?",
    hint: "The classic undertone test",
    weight: [1.4, 0, 0, 0],
    options: [
      { text: "Clearly blue or violet", sig: [-1.6, 0, 0, 0] },
      { text: "Green or olive-toned", sig: [1.6, 0, 0, 0] },
      { text: "Both / hard to tell — blue-green", sig: [0, 0, 0, 0] },
    ],
  },
  {
    id: "sun",
    q: "What happens after 30 minutes of unexpected sunshine?",
    hint: "No sunscreen, full honesty",
    weight: [0.7, 0.6, 0.2, 0],
    options: [
      { text: "Burn and peel — nothing to show for it", sig: [-0.6, -0.6, 0, 0] },
      { text: "Burn a little, then a faint tan", sig: [-0.2, -0.2, 0, 0] },
      { text: "Go golden surprisingly fast", sig: [1, 0.6, 0.2, 0] },
      { text: "Tan deep and never burn", sig: [0.7, 1.2, 0.3, 0] },
    ],
  },
  {
    id: "contrast",
    q: "Your overall contrast — hair, eyes and skin together",
    hint: "Stand back from the mirror, squint a little",
    weight: [0, 0.5, 0.5, 1.6],
    options: [
      { text: "Low — everything lives in one tonal family", sig: [0, -0.3, -0.6, -1.5] },
      { text: "Medium — gentle steps between features", sig: [0, 0, 0, 0] },
      { text: "High — one feature is much darker than the rest", sig: [0, 0.5, 0.5, 1.5] },
    ],
  },
  {
    id: "glow",
    q: "Which group of colors makes your face light up?",
    hint: "Drape fabrics if you can — trust the mirror, not the habit",
    weight: [1, 0.4, 1.4, 0.3],
    options: [
      { text: "Clear, bright, saturated jewel tones", sig: [-0.2, 0.1, 1.6, 0.5] },
      { text: "Soft, dusty, greyed-out pastels", sig: [-0.3, -0.3, -1.6, -0.5] },
      { text: "Earthy, rich spice tones — rust, olive, gold", sig: [1.5, 0.2, -0.5, -0.2] },
      { text: "Light, airy, delicate pastels", sig: [0.3, -1.4, 0.3, -0.4] },
      { text: "Dark, dramatic, deep tones", sig: [-0.3, 1.4, 0.4, 0.6] },
    ],
  },
];

/* ---------- The 12 seasons ---------- */

const S = (name: string, hex: string): SeasonSwatch => ({ name, hex });

export const seasons: Season[] = [
  {
    id: "light-spring",
    name: "Light Spring",
    tagline: "Sunlit & delicate — your colors are morning light",
    family: "spring",
    v: [1.0, -1.3, 0.4, -0.5],
    palette: [
      S("Creamy White", "#FAF5EC"), S("Ivory", "#F5EDD9"), S("Peach", "#FADCB8"), S("Soft Coral", "#F8B7A3"),
      S("Apricot", "#F5A88B"), S("Light Salmon", "#F7B99B"), S("Butter Yellow", "#F7E9A0"), S("Light Gold", "#EFD98F"),
      S("Light Moss", "#C6D4A5"), S("Mint", "#BCE0C8"), S("Light Aqua", "#A8D8D8"), S("Powder Teal", "#9FD1CF"),
      S("Baby Sky", "#BFDDEB"), S("Lilac", "#D9C6E8"), S("Light Camel", "#E4C6A3"), S("Warm Grey", "#D6CFC7"),
    ],
    metals: "Delicate yellow gold and rose gold — thin, light chains",
    jewelry: "Small, airy pieces: fine chains, tiny hoops, peachy pearls",
    makeup: "Peach blush, coral or apricot lips, champagne shimmer on the lids. Everything soft-edged and glowy.",
    hair: "Keep hair light and warm — honey, golden, caramel. A full head of ashy darkness will swallow your glow.",
    avoid: [
      { hex: "#101014", name: "Harsh black", why: "Overpowers your lightness — use warm brown or charcoal instead." },
      { hex: "#5C1F33", name: "Dark burgundy", why: "Puts your face in shadow; choose light berry instead." },
    ],
    wearing: "Two lights together beat one light + one dark: cream + apricot, ivory + soft teal.",
  },
  {
    id: "true-spring",
    name: "True Spring",
    tagline: "Golden hour, bottled — warm, clear and alive",
    family: "spring",
    v: [1.6, 0.1, 1.2, 0.2],
    palette: [
      S("Warm Ivory", "#F7F0E3"), S("Golden Yellow", "#F2C94C"), S("Butter", "#F5DE7A"), S("Peach", "#FBB98A"),
      S("Coral", "#F0806E"), S("Poppy Red", "#E8555D"), S("Tangerine", "#F2915B"), S("Salmon", "#FA9B8A"),
      S("Spring Green", "#7CC24C"), S("Grass", "#6FAE5C"), S("Turquoise", "#1FA9A0"), S("Warm Teal", "#2E8B8B"),
      S("Aqua", "#4FB3BF"), S("Clear Rose", "#E86A8A"), S("Camel", "#C89F6D"), S("Chestnut", "#9C6B3F"),
    ],
    metals: "Polished yellow gold — the warmer and brighter, the better",
    jewelry: "Golden statement pieces, wooden beads, coral and turquoise stones",
    makeup: "Peachy-pink blush, warm coral or orange-red lips, golden shimmer. No grey-toned nudes — they dull you.",
    hair: "Golden blonde, warm caramel, copper, chestnut — shine is your superpower.",
    avoid: [
      { hex: "#829BB0", name: "Dusty blue-grey", why: "Muted greys mute your natural warmth — you look tired." },
      { hex: "#7A5C72", name: "Smoky plum", why: "Too cool and dusty; pick clear rose instead." },
    ],
    wearing: "Warm + clear + medium contrast: coral top, gold jewelry, teal accents.",
  },
  {
    id: "bright-spring",
    name: "Bright Spring",
    tagline: "Where warm meets electric — your colors have voltage",
    family: "spring",
    v: [0.8, 0.3, 1.7, 1.1],
    palette: [
      S("Bright Coral", "#FF6B5B"), S("Clear Tangerine", "#FF8A3D"), S("Bright Gold", "#F5C842"), S("Lemon", "#F7E76B"),
      S("Emerald", "#0E9F6E"), S("Bright Teal", "#0E9BA8"), S("True Pink", "#E84C8D"), S("Fuchsia", "#D6479B"),
      S("Warm Royal Blue", "#2E6FBF"), S("Violet", "#8F7BC6"), S("Bright Lime", "#B5D334"), S("Warm White", "#FDFBF5"),
      S("Clear Brown", "#8B5A2B"), S("Coral Rose", "#E85A75"), S("Clear Navy", "#3D5A80"), S("Bright Aqua", "#3BB8C4"),
    ],
    metals: "Bright polished gold, or gold with vivid stones — shine hard",
    jewelry: "Bold gold, can pull off rose gold statement pieces; citrine, turquoise, bright coral stones",
    makeup: "Clear bright coral, pink or orange lips; bright blush. Skip muted '90s brown lips.",
    hair: "Bright copper, golden blonde with dimension, warm chestnut — keep it shiny.",
    avoid: [
      { hex: "#B5A79A", name: "Mushroom beige", why: "Drains the electricity right out of your face." },
      { hex: "#6B7078", name: "Dull graphite", why: "Too flat and cool — choose clear navy instead." },
    ],
    wearing: "You can wear one wow piece at full volume — bright coral dress, gold hoops, done.",
  },
  {
    id: "light-summer",
    name: "Light Summer",
    tagline: "Cool morning mist — soft, light and quietly pretty",
    family: "summer",
    v: [-1.0, -1.3, -0.5, -0.5],
    palette: [
      S("Powder White", "#F0F3F7"), S("Soft Grey", "#C9CFD6"), S("Powder Blue", "#B7CFE8"), S("Dusty Blue", "#9FB8D1"),
      S("Lavender", "#C9BDE3"), S("Lilac", "#CBB6DE"), S("Soft Teal", "#9CC9C9"), S("Seafoam", "#B9DFD0"),
      S("Rose Pink", "#F2C4CE"), S("Dusty Rose", "#E8BFC5"), S("Soft Coral", "#F4B6A8"), S("Soft Yellow", "#F2E3B6"),
      S("Mauve", "#C7A6B8"), S("Light Navy", "#7E93B8"), S("Misty Mint", "#C4E0D4"), S("Cloud Grey", "#D3D9DF"),
    ],
    metals: "Silver and white gold — delicate, nothing brassy",
    jewelry: "Fine silver chains, small pearls, moonstone and light blue topaz",
    makeup: "Cool pink blush, rosy-nude or soft berry lips, silvery-pink shimmer. Skip the orange family.",
    hair: "Cool ash blonde, beige blonde, sandy brown — lowlights, not contrast.",
    avoid: [
      { hex: "#C15A2B", name: "Burnt orange", why: "Warmth clashes with your cool delicacy — choose soft coral." },
      { hex: "#0A0A0A", name: "Hard black", why: "Too heavy; charcoal or soft navy is your dark." },
    ],
    wearing: "Light + cool + low contrast: powder blue + soft grey + rose pink.",
  },
  {
    id: "true-summer",
    name: "True Summer",
    tagline: "English garden in shade — cool, soft, romantic",
    family: "summer",
    v: [-1.6, -0.2, -0.7, 0.1],
    palette: [
      S("Soft White", "#EDF1F6"), S("Powder Blue", "#A3BEDC"), S("Dusty Blue", "#8CA6C8"), S("Slate Blue", "#6E86A8"),
      S("Dusty Rose", "#C97B95"), S("Rosewood", "#B06A83"), S("Soft Fuchsia", "#B76CA4"), S("Lavender", "#AB9BC9"),
      S("Dusty Lilac", "#A79BC1"), S("Mauve", "#9C7C99"), S("Dusty Plum", "#8E6E96"), S("Soft Teal", "#5F9EA0"),
      S("Dusty Navy", "#3E5570"), S("Blue Grey", "#93A3B5"), S("Berry", "#A54D74"), S("Smoky Rose", "#C08A96"),
    ],
    metals: "Silver, antique silver, softly brushed pewter",
    jewelry: "Delicate vintage-style silver, pearls, blue stones like aquamarine",
    makeup: "Cool rose blush, dusty rose or berry lips, soft grey-mauve shadows. Avoid golden bronzers.",
    hair: "Ash brown, cool blonde, taupe — keep highlights cool-toned, never gold.",
    avoid: [
      { hex: "#D4A017", name: "Mustard gold", why: "Warm yellows fight your cool undertone — try soft butter yellow." },
      { hex: "#C94F3D", name: "Hot tomato red", why: "Too warm and aggressive; dusty berry red is yours." },
    ],
    wearing: "Dusty blue + grey + a touch of dusty rose — think watercolor.",
  },
  {
    id: "soft-summer",
    name: "Soft Summer",
    tagline: "Fog over the ocean — the most subtle of all",
    family: "summer",
    v: [-0.7, -0.1, -1.5, -0.9],
    palette: [
      S("Dove Grey", "#B5B8BD"), S("Storm Blue", "#5C7186"), S("Dusty Blue", "#829BB0"), S("Slate", "#71809B"),
      S("Sage Grey", "#A3B18A"), S("Seafoam Grey", "#9FB4B0"), S("Dusty Lavender", "#A79BC1"), S("Dusty Mauve", "#93708C"),
      S("Dusty Rose", "#C08A96"), S("Dusty Plum", "#7A5C72"), S("Soft Teal", "#5E8B87"), S("Mushroom", "#B5A79A"),
      S("Taupe", "#A89888"), S("Soft White", "#EDEFF0"), S("Smoky Navy", "#4A5A6E"), S("Graphite", "#6B7078"),
    ],
    metals: "Oxidized and matte silver — hammer, don't polish",
    jewelry: "Matte silver, brushed steel, grey moonstone, smoky quartz",
    makeup: "Muted rose-taupe blush, smoky plum or nude-rose lips, grey-toned shadows. Barely-there definition.",
    hair: "Smoky blonde, ash brown, low-contrast balayage — never harsh blocks of color.",
    avoid: [
      { hex: "#E8555D", name: "Fire-engine red", why: "Shouts over your quiet harmony — choose smoky plum." },
      { hex: "#F2C94C", name: "Bright gold", why: "Too loud and warm; soft sand and oatmeal are your neutrals." },
    ],
    wearing: "Tonal dressing is your superpower: slate + smoky navy + taupe, barely separating.",
  },
  {
    id: "soft-autumn",
    name: "Soft Autumn",
    tagline: "Desert at dusk — gentle warmth, grounded",
    family: "autumn",
    v: [1.0, -0.1, -1.4, -0.9],
    palette: [
      S("Oatmeal", "#D9C7A8"), S("Soft White", "#F5EFE3"), S("Sand", "#CBB899"), S("Taupe", "#A89888"),
      S("Mushroom", "#B5A79A"), S("Terracotta", "#C97B58"), S("Dusty Rose", "#C69A8B"), S("Caramel", "#C09A6B"),
      S("Honey", "#C9A66B"), S("Olive", "#9AA065"), S("Sage", "#9CAF88"), S("Moss", "#7C8A54"),
      S("Soft Navy", "#5E7188"), S("Denim", "#7C93A6"), S("Khaki", "#A79B7E"), S("Warm Grey", "#B3A79C"),
    ],
    metals: "Antiqued brass, copper, brushed bronze — nothing shiny",
    jewelry: "Matte gold, leather cords, wooden and stone beads, turquoise (softly blue)",
    makeup: "Terracotta blush, warm nude or dusty rose lips, soft taupe shadow. Gentle bronze, never glitter.",
    hair: "Soft brunette, honey brown, dim caramel — quiet dimension, no contrast strips.",
    avoid: [
      { hex: "#0A0A0A", name: "Jet black", why: "Crushes your softness — espresso brown is your dark." },
      { hex: "#E64C8D", name: "Hot pink", why: "Too cold-bright; dusty rose is your pink." },
    ],
    wearing: "Sand + terracotta + denim — everything looks sun-washed and expensive.",
  },
  {
    id: "true-autumn",
    name: "True Autumn",
    tagline: "October forest — rich, warm, golden",
    family: "autumn",
    v: [1.6, 0.3, -0.5, 0.2],
    palette: [
      S("Warm Cream", "#F2E4C6"), S("Camel", "#C08A4E"), S("Golden Tan", "#C39A6B"), S("Burnt Orange", "#C15A2B"),
      S("Rust", "#A5482A"), S("Tomato Red", "#C94F3D"), S("Mustard", "#D4A017"), S("Gold", "#C9A227"),
      S("Olive", "#77721F"), S("Forest", "#4E5D42"), S("Warm Teal", "#2E6E66"), S("Brick", "#9C4A35"),
      S("Aubergine", "#6E4A52"), S("Mahogany", "#6E3B2A"), S("Espresso", "#4B3621"), S("Warm Grey", "#A89F91"),
    ],
    metals: "Rich gold, bronze and copper — warm and weighty",
    jewelry: "Chunky gold, amber, tiger's eye, wooden bangles, copper cuffs",
    makeup: "Terracotta or apricot blush, brick-red or warm lipstick, bronze shimmer lids.",
    hair: "Warm chestnut, copper red, chocolate with golden highlights — gloss is everything.",
    avoid: [
      { hex: "#C7E3F2", name: "Icy blue", why: "Frost cools down your warmth — soft white or cream instead." },
      { hex: "#B5B8BD", name: "Cool dove grey", why: "Greys drain your golden glow; choose warm grey or oatmeal." },
    ],
    wearing: "Camel + rust + cream — the pumpkin-spice latte of outfits.",
  },
  {
    id: "dark-autumn",
    name: "Dark Autumn",
    tagline: "Spice market after dark — deep and glowing",
    family: "autumn",
    v: [1.1, 1.3, 0.3, 0.9],
    palette: [
      S("Espresso", "#4B3621"), S("Dark Chocolate", "#4A2C1F"), S("Walnut", "#5C4033"), S("Dark Rust", "#8B3A1F"),
      S("Mahogany", "#6E3B2A"), S("Oxblood", "#622F35"), S("Burgundy", "#5C1F33"), S("Deep Gold", "#B8862D"),
      S("Bronze", "#7A5C3D"), S("Dark Olive", "#5A5B33"), S("Forest", "#3E4A3A"), S("Deep Teal", "#1F4E4A"),
      S("Dark Camel", "#8B6B47"), S("Pine", "#2F4638"), S("Charcoal Brown", "#3B3226"), S("Warm Ivory", "#E8DCC0"),
    ],
    metals: "Deep antique gold — burnished, heavy, old-money",
    jewelry: "Large gold statement pieces, amber, dark garnet, smoky topaz",
    makeup: "Deep terracotta blush, brick or oxblood lips, bronze-black liner. Rich, not pastel.",
    hair: "Dark chocolate, espresso, deep auburn — deep and glossy.",
    avoid: [
      { hex: "#F2C4CE", name: "Pastel blush pink", why: "Candy pastels float away from your depth — go rich instead." },
      { hex: "#C9CFD6", name: "Light cool grey", why: "Washes out your warm darkness; charcoal brown is your neutral." },
    ],
    wearing: "Espresso + oxblood + deep gold — dark-on-dark with warm glints.",
  },
  {
    id: "true-winter",
    name: "True Winter",
    tagline: "Snow and ink — pure, cool, dramatic",
    family: "winter",
    v: [-1.7, 0.3, 1.3, 1.2],
    palette: [
      S("Pure White", "#FFFFFF"), S("True Black", "#0A0A0A"), S("Charcoal", "#3A3A3C"), S("Crimson", "#C8102E"),
      S("Cherry", "#A51C30"), S("Cobalt", "#1F4EB8"), S("Royal Blue", "#2B5FB0"), S("Emerald", "#0E7A54"),
      S("Hot Pink", "#E24A8B"), S("Magenta", "#A22B6F"), S("Deep Navy", "#1B2A4A"), S("Ice Blue", "#C7E3F2"),
      S("Ice Pink", "#F4D9E3"), S("Ice Lilac", "#DCE4F5"), S("Burgundy", "#5C1F33"), S("Sapphire", "#1D3A6E"),
    ],
    metals: "Polished silver and platinum — crisp and cool",
    jewelry: "Silver statement pieces, diamonds, icy blue stones; skip yellow gold",
    makeup: "Cool pink blush, true red or fuchsia lips, blackest liner. Icy shimmer, never gold.",
    hair: "Blue-black, cool espresso, icy blonde — sharp blocks of color, no soft gradient.",
    avoid: [
      { hex: "#D4A017", name: "Mustard", why: "Warm yellows are the enemy of your cool clarity." },
      { hex: "#C08A4E", name: "Camel", why: "Reads dusty and warm on you — replace with charcoal or grey." },
    ],
    wearing: "Black + white + one jewel tone = maximum you. High contrast is your birthright.",
  },
  {
    id: "dark-winter",
    name: "Dark Winter",
    tagline: "Midnight opera — deep, cool, regal",
    family: "winter",
    v: [-1.2, 1.4, 0.5, 1.2],
    palette: [
      S("Black", "#0D0D0F"), S("Deep Navy", "#1F2E4D"), S("Midnight", "#16203A"), S("Burgundy", "#5C1F33"),
      S("Dark Plum", "#3D2247"), S("Deep Emerald", "#0F4C3A"), S("Dark Teal", "#16424A"), S("Blood Red", "#8E1B25"),
      S("Dark Cherry", "#6E1F35"), S("Deep Grey", "#4A4E58"), S("Steel", "#7E8794"), S("Silver", "#C5CBD3"),
      S("Icy Pink", "#EBC6D9"), S("Ice Lavender", "#D8CCEB"), S("Frost Blue", "#AFC8DC"), S("Cool Ivory", "#F2F4F8"),
    ],
    metals: "Silver, gunmetal, white gold — cool-toned and serious",
    jewelry: "Pewter, onyx, dark sapphire; a small icy accent stone stuns",
    makeup: "Berry or wine lips, cool mauve blush, charcoal liner. Deep + icy = your formula.",
    hair: "Blue-black, dark espresso, deep ash brown — keep tone cool and color rich.",
    avoid: [
      { hex: "#C15A2B", name: "Bright rust", why: "Warm earth tones sit wrong on your cool depth — wear oxblood." },
      { hex: "#FADCB8", name: "Warm peach", why: "Too soft and warm; icy pink lights you up instead." },
    ],
    wearing: "Deep + one icy accent: black coat, burgundy scarf, frost-blue gloves.",
  },
  {
    id: "bright-winter",
    name: "Bright Winter",
    tagline: "Neon on snow — the boldest palette there is",
    family: "winter",
    v: [-0.8, 0.2, 1.7, 1.5],
    palette: [
      S("True White", "#FCFCFC"), S("Black", "#111214"), S("True Pink", "#E64C8D"), S("Hot Coral", "#F5554C"),
      S("Fuchsia", "#C73FB4"), S("Electric Blue", "#2E6FE8"), S("Cobalt", "#1F5BD6"), S("Bright Teal", "#0FB5C0"),
      S("Emerald", "#0FA36B"), S("Violet", "#8A46D5"), S("Lemon Ice", "#F5E76B"), S("Icy Blue", "#A8D8F0"),
      S("Ice Pink", "#F2C7DC"), S("Bright Mint", "#A8E6C8"), S("Royal Purple", "#6B3FD4"), S("Clear Red", "#D91E36"),
    ],
    metals: "High-polish silver or bright gold — mirrors, not antiques",
    jewelry: "Polished, geometric, shiny — crystals, cz, bright chrome; matte finishes die on you",
    makeup: "Fuchsia or true-red lips, bright cool blush, graphic liner. Color-blocking, no gradients.",
    hair: "Glossy black, dramatic platinum, or a vivid jewel tone — commitment pays.",
    avoid: [
      { hex: "#B5A79A", name: "Dusty beige", why: "The single worst color on you — it reads like static." },
      { hex: "#7C8A54", name: "Muddy moss", why: "Muted earth tones blur your electric clarity." },
    ],
    wearing: "White + fuchsia + cobalt. If it looks 'too much' on the hanger, it's probably yours.",
  },
];

export const seasonById = (id: string): Season | undefined => seasons.find((s) => s.id === id);

/* ---------- Classifier ---------- */

export interface SeasonSignals {
  warm: number;
  depth: number;
  chroma: number;
  contrast: number;
}
export interface SeasonResult {
  season: Season;
  runnerUp: Season;
  confidence: number; // 0-1
  signals: SeasonSignals;
}

/** Weighted-average of per-question option signals → the user's
    [warmth, depth, chroma, contrast] vector. Used to draw the
    signal profile in the result screen. */
export function seasonSignals(answers: number[]): SeasonSignals {
  const v: [number, number, number, number] = [0, 0, 0, 0];
  const w: [number, number, number, number] = [0, 0, 0, 0];
  seasonQuiz.forEach((q, i) => {
    const a = answers[i];
    if (a == null) return;
    const sig = q.options[a].sig;
    for (let k = 0; k < 4; k++) {
      v[k] += sig[k] * q.weight[k];
      w[k] += q.weight[k];
    }
  });
  for (let k = 0; k < 4; k++) v[k] = w[k] > 0 ? v[k] / w[k] : 0;
  return { warm: v[0], depth: v[1], chroma: v[2], contrast: v[3] };
}

/** Nearest-archetype classification over the 12-season vector space. */
export function classifySeason(answers: number[]): SeasonResult | null {
  if (answers.length !== seasonQuiz.length || answers.some((a) => a == null)) return null;

  const v: [number, number, number, number] = [0, 0, 0, 0];
  const w: [number, number, number, number] = [0, 0, 0, 0];
  seasonQuiz.forEach((q, i) => {
    const sig = q.options[answers[i]].sig;
    for (let k = 0; k < 4; k++) {
      v[k] += sig[k] * q.weight[k];
      w[k] += q.weight[k];
    }
  });
  for (let k = 0; k < 4; k++) v[k] = w[k] > 0 ? v[k] / w[k] : 0;
  const signals: SeasonSignals = { warm: v[0], depth: v[1], chroma: v[2], contrast: v[3] };

  /* distance weights: warmth dominates personal-color typing */
  const DW: [number, number, number, number] = [1.4, 1.2, 1.2, 0.9];
  const dist = (sv: [number, number, number, number]): number =>
    Math.sqrt(
      Math.pow((v[0] - sv[0]) * DW[0], 2) +
        Math.pow((v[1] - sv[1]) * DW[1], 2) +
        Math.pow((v[2] - sv[2]) * DW[2], 2) +
        Math.pow((v[3] - sv[3]) * DW[3], 2),
    );

  const ranked = seasons
    .map((s) => ({ s, d: dist(s.v) }))
    .sort((a, b) => a.d - b.d);

  /* confidence: how much closer the winner is than the runner-up */
  const best = ranked[0];
  const second = ranked[1];
  const confidence = Math.max(0.45, Math.min(0.98, 1 - best.d / 5.2 + (second.d - best.d) / 6));

  return { season: best.s, runnerUp: second.s, confidence, signals };
}

/* ---------- Season ↔ palette fitting (uses Lab + ΔE2000) ---------- */

const seasonLabCache = new Map<string, { sw: SeasonSwatch; lab: Lab }[]>();

export function seasonLabPalette(season: Season): { sw: SeasonSwatch; lab: Lab }[] {
  let cached = seasonLabCache.get(season.id);
  if (!cached) {
    cached = season.palette.map((sw) => ({ sw, lab: hexToLab(sw.hex) }));
    seasonLabCache.set(season.id, cached);
  }
  return cached;
}

/**
 * Rate an arbitrary color against a season: ΔE2000 to the nearest
 * palette swatch, mapped to a 0-100 score with verdict.
 * ΔE < 10 = excellent · 10-20 = good · 20-30 = risky · >30 = drains you
 */
export function rateColorForSeason(hex: string, season: Season): { score: number; verdict: "excellent" | "good" | "risky" | "avoid"; nearest: SeasonSwatch; delta: number } {
  const lab = hexToLab(hex);
  const pal = seasonLabPalette(season);
  let bestD = Infinity;
  let bestSw = pal[0].sw;
  for (const p of pal) {
    const d = deltaE2000(lab, p.lab);
    if (d < bestD) {
      bestD = d;
      bestSw = p.sw;
    }
  }
  const score = Math.round(Math.max(0, Math.min(100, 100 - bestD * 1.9)));
  const verdict = bestD < 10 ? "excellent" : bestD < 20 ? "good" : bestD < 30 ? "risky" : "avoid";
  return { score, verdict, nearest: bestSw, delta: bestD };
}

/** Suggest up to n best wardrobe colors from the existing DB for a season. */
export function topColorsForSeason(watchHexes: { id: string; hex: string }[], season: Season, n = 6): { id: string; score: number }[] {
  return watchHexes
    .map((c) => ({ id: c.id, score: rateColorForSeason(c.hex, season).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/** Season from raw warmth/depth/chroma/contrast numbers (for the outfit engine). */
export function seasonWarmth(season: Season): number {
  return season.v[0];
}
