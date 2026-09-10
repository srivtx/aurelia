/* ============================================================
   AURELIA — PAO knowledge (Mirror Test V4, the Shelf)
   ------------------------------------------------------------
   PAO = Period After Opening: the little open-jar "12M" logo.
   EU Cosmetics Regulation 1223/2009 requires it whenever a
   product's shelf life exceeds 30 months — but almost nobody
   tracks it after the box is thrown away. >90% of cosmetic
   users keep products past their PAO (Wang 2025, PMC/NIH).
   ------------------------------------------------------------
   These months follow the standard published conventions
   (EU PAO labeling + common brand/derm guidance). They are
   habit guidance, not a safety rule: the honest line is
   "when in doubt, toss it" — changes in smell, texture or
   color outrank any countdown.
   ============================================================ */

export interface PaoCategory {
  id: string;
  label: string;
  paoMonths: number;
  note: string;
}

export const paoCategories: PaoCategory[] = [
  {
    id: "mascara",
    label: "Mascara",
    paoMonths: 6,
    note: "The strictest PAO in makeup — the wand pumps air and bacteria into the tube every single use. Most brands say 3–6 months; if it clumps, flakes or smells off, it's done early.",
  },
  {
    id: "liquid-liner",
    label: "Liquid eyeliner",
    paoMonths: 6,
    note: "Same pump-and-bacteria math as mascara, especially felt-tip pens kept close to the lash line and tear ducts.",
  },
  {
    id: "cream-foundation",
    label: "Foundation — liquid / cream",
    paoMonths: 12,
    note: "Water-based formulas host microbes; pumps and airless jars stretch the safe window, droppers and open jars shorten it. Also: oxidized foundation shifts orange on you.",
  },
  {
    id: "concealer",
    label: "Concealer",
    paoMonths: 12,
    note: "Pot concealers applied with fingers age fastest (bacteria transfer); wand ones applied directly under the eye should be treated extra gently.",
  },
  {
    id: "powder-foundation",
    label: "Powder / mineral foundation",
    paoMonths: 24,
    note: "Powders are water-free — bacteria barely grow. The realistic limits are binder oils going rancid and the sponge you keep in the compact (wash it!).",
  },
  {
    id: "blush-cream",
    label: "Cream blush / bronzer",
    paoMonths: 12,
    note: "Cream = emulsion = same clock as cream foundation. Stick formats applied straight from the tube fare better than pots dug with fingers.",
  },
  {
    id: "blush-powder",
    label: "Powder blush / bronzer",
    paoMonths: 24,
    note: "Water-free and long-lived — the usual failure is hard pan from sebum transfer, not bacteria.",
  },
  {
    id: "eyeshadow-cream",
    label: "Cream eyeshadow",
    paoMonths: 12,
    note: "Emulsion on the most infection-sensitive zone of the face — don't stretch this one.",
  },
  {
    id: "eyeshadow-powder",
    label: "Powder eyeshadow",
    paoMonths: 24,
    note: "Like all pressed powders: effectively the longest-lived makeup you own. Replace when the pigment stops blending or the pan cracks.",
  },
  {
    id: "lipstick",
    label: "Lipstick",
    paoMonths: 18,
    note: "Waxes and oils keep it stable, but it touches your mouth — a cold sore is a hard reset. Rancid smell or a sour taste = toss immediately.",
  },
  {
    id: "lipgloss",
    label: "Lip gloss",
    paoMonths: 12,
    note: "The doe-foot wand goes from mouth to tube and back — the fastest microbe pipeline in the bag.",
  },
  {
    id: "moisturizer",
    label: "Moisturizer / face cream",
    paoMonths: 12,
    note: "Jar + fingers is the worst case; pump is the best. If a cream separates, yellows or smells different — it's done, whatever the jar says.",
  },
  {
    id: "serum",
    label: "Serum",
    paoMonths: 12,
    note: "12M is the generic clock. Vitamin C and other oxidizable actives die far sooner (3–6M) — an orange tint or curling smell means the actives are already gone.",
  },
  {
    id: "cleanser",
    label: "Cleanser / face wash",
    paoMonths: 12,
    note: "Surfactants are mildly self-preserving, but you keep it in a hot, wet shower — don't stretch it past a year.",
  },
  {
    id: "sunscreen",
    label: "Sunscreen",
    paoMonths: 12,
    note: "Filters degrade with heat and light — the glovebox and the beach bag are their enemies. Old SPF still blends fine but protects less: the one expiry with a direct health cost.",
  },
];

/* fallback when a category is unknown/legacy */
const GENERIC: PaoCategory = {
  id: "other",
  label: "Other product",
  paoMonths: 12,
  note: "Generic 12M convention — check the open-jar logo on the packaging for the real number.",
};

export const paoById = (id: string): PaoCategory => paoCategories.find((c) => c.id === id) ?? GENERIC;

export const PAO_DISCLAIMER =
  "PAO months follow standard published conventions, not your exact formula — smell, texture or color changes outrank any countdown. When in doubt, toss it.";
