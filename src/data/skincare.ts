/* ============================================================
   AURELIA DATA — Skincare
   Source: docs/SKINCARE_KNOWLEDGE_BASE.md (research)
   ============================================================ */

export type SkinTypeId = "normal" | "oily" | "dry" | "combination" | "sensitive";

export interface SkinType {
  id: SkinTypeId;
  name: string;
  snapshot: string;
  identify: string[];
  amRoutine: string[];
  pmRoutine: string[];
  dos: string[];
  donts: string[];
  heroes: string[];
  avoid: string[];
}

export const skinTypes: SkinType[] = [
  {
    id: "normal",
    name: "Normal",
    snapshot: "Balanced skin — not too oily, not too dry. Lucky, but still needs protection. (Every skin type is normal skin to have.)",
    identify: [
      "Very little shine — maybe a slight glow on forehead and nose by late afternoon.",
      "No tightness after washing; skin feels comfortable within an hour.",
      "Pores small; obvious only on and around the nose.",
      "Makeup sits well — doesn't slide off or cling to dry patches.",
    ],
    amRoutine: [
      "Rinse with lukewarm water (or gentle cleanser if sweaty overnight).",
      "Lightweight hydrating toner or essence (optional).",
      "Light lotion moisturizer.",
      "Sunscreen SPF 30+ — always the last step.",
    ],
    pmRoutine: [
      "Gentle cleanser (double cleanse on makeup/SPF days).",
      "Optional serum: niacinamide most nights, vitamin C on alternate nights.",
      "Moisturizer — slightly richer than your AM one.",
      "Lip balm (optional — lips need care too).",
    ],
    dos: [
      "Wear SPF every single day — normal skin today is sun-damaged skin later if unprotected.",
      "Keep the routine simple and consistent — boring and steady wins.",
      "Moisturize even though your skin feels fine — prevention beats repair.",
      "Re-check your skin type when seasons or hormones change.",
    ],
    donts: [
      "Don't over-exfoliate 'for extra glow' — you'll trade normal skin for irritation.",
      "Don't use harsh stripping products just because a routine feels tingly.",
      "Don't pick at the rare pimple — that's how permanent dark marks start.",
      "Don't skip night cleansing because you're tired; 60 seconds counts.",
    ],
    heroes: ["Hyaluronic acid", "Niacinamide", "Vitamin C (gentle)", "Peptides", "Squalane", "Light ceramide lotion"],
    avoid: ["Harsh sulfate foaming cleansers", "High-strength acids + frequent peels", "Denatured alcohol-heavy products", "Jagged physical scrubs"],
  },
  {
    id: "oily",
    name: "Oily",
    snapshot: "Your skin produces extra sebum all over. The upside nobody tells you: oily skin often ages more slowly and looks plumper later in life. The challenge is shine, bigger pores, and clogs.",
    identify: [
      "All-over shine, often within an hour of washing — cheeks AND forehead.",
      "Rarely tight — more likely already shiny again soon after cleansing.",
      "Visibly larger pores, especially nose, inner cheeks, and chin.",
      "Makeup slides off or breaks up by mid-afternoon; a midday tissue picks up oil from multiple zones.",
    ],
    amRoutine: [
      "Gentle gel cleanser (yes, wash in the morning — overnight oil + sweat).",
      "Hydrating toner/essence (optional).",
      "Niacinamide serum — regulates oil look, supports barrier.",
      "Oil-free gel or fluid moisturizer — yes, oily skin still needs it.",
      "Sunscreen SPF 30+ — gel, fluid or matte textures feel nicest.",
    ],
    pmRoutine: [
      "Oil cleanser or micellar water first if you wore makeup/SPF (double cleanse).",
      "Gentle gel cleanser.",
      "Salicylic acid (2%) serum 2-3 nights per week.",
      "Gel moisturizer (add niacinamide on non-acid nights).",
    ],
    dos: [
      "Moisturize daily — dehydrated oily skin pumps out MORE oil to compensate.",
      "Use salicylic acid 2-3 nights a week — it's oil-soluble, so it cleans inside pores.",
      "Blot during the day instead of re-powdering cake layers.",
      "Wear SPF — sun damage thickens and darkens marks.",
    ],
    donts: [
      "Don't wash more than twice a day — over-washing triggers rebound oil.",
      "Don't skip moisturizer — the #1 oily-skin myth.",
      "Don't use alcohol-heavy astringents — that tight feeling is damage, not clean.",
      "Don't pile on every acid at once — one active per routine is plenty.",
    ],
    heroes: ["Niacinamide (5%)", "Salicylic acid/BHA (2%)", "Zinc", "Lightweight gel moisturizers", "Clay masks 1×/week"],
    avoid: ["Heavy rich creams all over", "Neat coconut oil", "Alcohol-heavy toners + menthol", "Daily clay masks + physical scrubs"],
  },
  {
    id: "dry",
    name: "Dry",
    snapshot: "Your skin produces less sebum, so it struggles to hold water. It craves ceramides, cream textures, and lukewarm water. Dry ≠ dehydrated: dry is a type (little oil); dehydrated is a temporary state (little water) any type can have.",
    identify: [
      "Almost no shine — skin looks matte, sometimes dull or papery.",
      "Tightness within minutes of washing, sometimes flaking.",
      "Visible dry patches around nose, cheeks, eyebrows in winter.",
      "Moisturizer seems to vanish into it; fine dehydration lines under the eyes.",
    ],
    amRoutine: [
      "Rinse with lukewarm water only, or a creamy non-foaming cleanser.",
      "Hyaluronic acid serum on DAMP skin (the trick).",
      "Cream moisturizer with ceramides.",
      "Sunscreen SPF 30+ — moisturizing formulas, layered after cream.",
    ],
    pmRoutine: [
      "Cream/oil/balm cleanser (melts SPF and makeup without stripping).",
      "Hyaluronic acid serum on damp skin.",
      "Cream moisturizer (ceramides).",
      "Optional: 2-3 drops of squalane or facial oil as the sealing step.",
    ],
    dos: [
      "Apply hyaluronic acid to damp skin, then seal with cream — order matters.",
      "Use lukewarm (never hot) water for washing and showering.",
      "Choose cream and balm textures over foaming gels, especially in winter.",
      "Run a humidifier in dry/heated bedrooms overnight.",
    ],
    donts: [
      "Don't take long hot showers or splash hot water on your face.",
      "Don't use foaming sulfate cleansers — squeaky = stripped.",
      "Don't exfoliate more than once a week (if at all).",
      "Don't scrub off flaking — usually it's a sign to moisturize MORE, not scrub.",
    ],
    heroes: ["Ceramides", "Hyaluronic acid", "Glycerin", "Squalane", "Panthenol", "Shea butter", "Lactic acid (gentle weekly)"],
    avoid: ["SLS sulfate cleansers", "High-strength glycolic peels", "Denatured alcohol + menthol + strong fragrance", "Frequent clay masks"],
  },
  {
    id: "combination",
    name: "Combination",
    snapshot: "The most common type of all. Your T-zone (forehead, nose, chin) acts oily while your cheeks act normal or dry. Your superpower is zone-treating: different products or amounts on different areas.",
    identify: [
      "Shiny forehead, nose, and chin by midday — cheeks stay matte or normal.",
      "Cheeks may feel slightly tight after washing; T-zone quickly shines.",
      "Pores visible on/around the nose, smaller on cheeks.",
      "Breakouts and blackheads concentrated in the T-zone.",
    ],
    amRoutine: [
      "Gentle gel cleanser (one wash, whole face).",
      "Hydrating toner or essence (optional).",
      "Niacinamide serum — balances both zones, a combination-skin hero.",
      "Lightweight lotion, a little extra moisturizer patted onto cheeks.",
      "Sunscreen SPF 30+.",
    ],
    pmRoutine: [
      "Double cleanse if you wore SPF/makeup; otherwise one gentle cleanse.",
      "Salicylic acid 2-3 nights a week, applied mainly to the T-zone.",
      "Niacinamide or hyaluronic serum on non-acid nights.",
      "Gel-cream on the T-zone + richer cream on the cheeks (two textures is smart).",
    ],
    dos: [
      "Treat zones differently — gel for T-zone, cream for cheeks.",
      "Use BHA mainly where the clogs live (nose, chin, forehead).",
      "Pick gel-cream hybrid textures if you want one product for everywhere.",
      "Adjust with the seasons — lighter in summer, richer in winter.",
    ],
    donts: [
      "Don't treat your whole face as oily — your cheeks will pay with tightness and flaking.",
      "Don't skip cheek moisturizer because your nose is shiny.",
      "Don't use stripping all-over astringents.",
      "Don't apply rich cream thickly across your T-zone.",
    ],
    heroes: ["Niacinamide (5%)", "Hyaluronic acid", "Salicylic acid (T-zone)", "Gel-cream moisturizers", "Ceramides (cheeks)"],
    avoid: ["Rich occlusive creams all over", "Harsh foaming cleansers", "Denatured alcohol toners", "Physical scrubs (irritates both zones)"],
  },
  {
    id: "sensitive",
    name: "Sensitive",
    snapshot: "Skin that reacts — stinging, redness, itching, or burning from products most people tolerate. It can overlay any other type. Often it's a stressed barrier, so the fix is usually 'less, gentler, fragrance-free' — not more products.",
    identify: [
      "Stinging or burning when you apply products, especially fragranced ones.",
      "Flushes easily; visible redness around cheeks/nose; little visible capillaries.",
      "Tightness PLUS warmth or pink patches after washing.",
      "History of rashes, eczema patches, or reactions to products.",
    ],
    amRoutine: [
      "Rinse with lukewarm water or a milky, fragrance-free cleanser.",
      "Centella (cica) or panthenol soothing serum.",
      "Fragrance-free barrier moisturizer with ceramides.",
      "Mineral sunscreen SPF 30+ — usually the friendliest filters for reactive skin.",
    ],
    pmRoutine: [
      "Milky/cream fragrance-free cleanser (one cleanse is often enough).",
      "Centella or aloe-based soothing serum.",
      "Ceramide barrier cream.",
      "Optional: spot-soothe red patches with plain occlusive balm.",
    ],
    dos: [
      "Choose fragrance-free products (skip anything listing 'fragrance/parfum').",
      "Patch test every new product — inner arm, 24-48 hours.",
      "Introduce one new product at a time, 2 weeks apart.",
      "Keep your routine short — 3-4 steps is genuinely best for you.",
    ],
    donts: [
      "Don't use fragrance, essential oils, or botanical-extract cocktails.",
      "Don't exfoliate with strong acids — gentle azelaic is the exception.",
      "Don't use physical scrubs, cleansing brushes, or rough towels.",
      "Don't keep using a product that stings, hoping you'll get used to it. Stinging is a stop sign.",
    ],
    heroes: ["Centella asiatica (cica)", "Ceramides", "Panthenol (B5)", "Aloe (fragrance-free)", "Oat extract", "Azelaic acid", "Mineral SPF"],
    avoid: ["Fragrance + essential oils", "Denatured alcohol + witch hazel + menthol", "High-% acids + strong retinoids", "Undiluted tea tree oil"],
  },
];

export const skinTypeById = (id: SkinTypeId) => skinTypes.find((t) => t.id === id)!;

/* ---------------- Quiz (scoring per research spec) ---------------- */

export interface QuizQuestion {
  q: string;
  options: { text: string; points: Partial<Record<SkinTypeId, number>> }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    q: "How does your skin feel 1 hour after washing your face (with nothing on it)?",
    options: [
      { text: "Tight, maybe even a little flaky", points: { dry: 2 } },
      { text: "Comfortable — no tightness, no shine", points: { normal: 2 } },
      { text: "Already shiny all over (cheeks too)", points: { oily: 2 } },
      { text: "Shiny on forehead/nose/chin, fine on cheeks", points: { combination: 2, oily: 1 } },
    ],
  },
  {
    q: "At midday, if you press a tissue on your face, what happens?",
    options: [
      { text: "It picks up oil from everywhere — cheeks included", points: { oily: 2 } },
      { text: "Oil only on the forehead/nose/chin area", points: { combination: 2, oily: 1 } },
      { text: "No oil at all — skin may even look flaky on the tissue", points: { dry: 2 } },
      { text: "No oil, and my skin feels totally comfortable", points: { normal: 2 } },
    ],
  },
  {
    q: "How would you describe your pores?",
    options: [
      { text: "Large and visible on my nose AND my cheeks", points: { oily: 2 } },
      { text: "Noticeable mainly on/around my nose", points: { combination: 2 } },
      { text: "Small and barely visible", points: { normal: 2 } },
      { text: "Small, but the skin around them feels rough and dry", points: { dry: 2 } },
    ],
  },
  {
    q: "How often do you break out?",
    options: [
      { text: "Often — several pimples at a time, in lots of areas", points: { oily: 2 } },
      { text: "Regularly, but mostly on forehead, nose, and chin", points: { combination: 2 } },
      { text: "Rarely — a small one around my period, max", points: { normal: 2 } },
      { text: "Rarely — my bigger issue is dryness/flaking, not pimples", points: { dry: 2 } },
    ],
  },
  {
    q: "When you try a new skincare product, what usually happens?",
    options: [
      { text: "It often stings, burns, or turns my skin red", points: { sensitive: 2 } },
      { text: "Occasionally it irritates my skin", points: { sensitive: 1 } },
      { text: "Almost never any reaction", points: { normal: 1 } },
      { text: "No reaction, but some products feel drying", points: { dry: 1 } },
    ],
  },
  {
    q: "How often do you get flaky or rough patches?",
    options: [
      { text: "Often, even when I'm using moisturizer", points: { dry: 2 } },
      { text: "Sometimes, but mostly in winter", points: { dry: 1 } },
      { text: "Never — my skin is more shiny than flaky", points: { oily: 1 } },
      { text: "Never flaking — instead I constantly get blackheads/clogs", points: { oily: 2 } },
    ],
  },
  {
    q: "By late afternoon, how does your skin look?",
    options: [
      { text: "Greasy/shiny all over", points: { oily: 2 } },
      { text: "Shiny T-zone (forehead/nose/chin), cheeks fine", points: { combination: 2, oily: 1 } },
      { text: "Matte, dull, maybe a bit tight", points: { dry: 2 } },
      { text: "Just a soft, healthy, natural glow", points: { normal: 2 } },
    ],
  },
  {
    q: "Right after you apply moisturizer, it…",
    options: [
      { text: "Sinks in instantly and my skin still feels tight", points: { dry: 2 } },
      { text: "Feels heavy or greasy on my skin", points: { oily: 2 } },
      { text: "Feels comfortable and invisible — perfect", points: { normal: 2 } },
      { text: "Sometimes stings or makes my skin red", points: { sensitive: 2 } },
    ],
  },
  {
    q: "Blackheads and clogged pores are…",
    options: [
      { text: "A constant thing on my nose, chin, AND forehead", points: { oily: 2 } },
      { text: "Mostly on my nose", points: { combination: 2, oily: 1 } },
      { text: "Rare for me", points: { normal: 2 } },
      { text: "Never — but I do get dry patches instead", points: { dry: 2 } },
    ],
  },
  {
    q: "Which best describes your cheeks?",
    options: [
      { text: "Soft and comfortable", points: { normal: 2 } },
      { text: "Often tight, flaky, or rough", points: { dry: 2 } },
      { text: "Shiny by the afternoon, same as the rest of my face", points: { oily: 2 } },
      { text: "Often red, warm, or itchy", points: { sensitive: 2 } },
    ],
  },
];

export function computeQuizResult(
  answers: number[]
): { base: SkinTypeId; sensitiveOverlay: boolean; scores: Record<SkinTypeId, number> } {
  const scores: Record<SkinTypeId, number> = { normal: 0, oily: 0, dry: 0, combination: 0, sensitive: 0 };
  let q1Choice: number | null = null;
  let q5Choice: number | null = null;
  answers.forEach((choice, qi) => {
    if (choice < 0) return;
    const q = quizQuestions[qi];
    for (const [type, pts] of Object.entries(q.options[choice].points)) {
      scores[type as SkinTypeId] += pts ?? 0;
    }
    if (qi === 0) q1Choice = choice;
    if (qi === 4) q5Choice = choice;
  });

  let base: SkinTypeId;
  if (scores.oily >= 6 && scores.dry >= 6) {
    base = "combination";
  } else {
    const entries = (Object.entries(scores) as [SkinTypeId, number][]).filter(([t]) => t !== "sensitive");
    const max = Math.max(...entries.map(([, v]) => v));
    const winners = entries.filter(([, v]) => v === max).map(([t]) => t);
    if (winners.length === 1) {
      base = winners[0];
    } else {
      // tie-break 1: type chosen in Q1
      if (q1Choice !== null) {
        const q1Winner = quizQuestions[0].options[q1Choice].points;
        const q1Types = Object.keys(q1Winner).filter((t) => (t as SkinTypeId) !== "sensitive");
        if (q1Types.length === 1) {
          base = q1Types[0] as SkinTypeId;
        } else {
          base = "combination";
        }
      } else {
        base = "combination";
      }
      // tie-break 2 priority: Combination > Oily > Dry > Normal
      const priority: SkinTypeId[] = ["combination", "oily", "dry", "normal"];
      if (!winners.includes(base)) {
        base = priority.find((p) => winners.includes(p)) ?? base;
      }
    }
  }

  const sensitiveOverlay = scores.sensitive >= 4 || q5Choice === 0;
  return { base, sensitiveOverlay, scores };
}

/* ---------------- Ingredients ---------------- */

export interface Ingredient {
  name: string;
  tagline: string;
  does: string;
  bestFor: string;
  when: string;
  caution: string;
}

export const ingredients: Ingredient[] = [
  {
    name: "Hyaluronic Acid",
    tagline: "the water magnet",
    does: "A humectant that pulls water into skin and holds up to 1,000× its weight in water — instant hydration and a plumper look.",
    bestFor: "Every skin type, especially dehydrated skin of any type.",
    when: "AM and/or PM — apply to DAMP skin, then seal with moisturizer, or it can pull moisture back out in dry air.",
    caution: "Almost none — just don't use it without a moisturizer on top.",
  },
  {
    name: "Niacinamide",
    tagline: "the quiet multitasker",
    does: "Regulates oil production, strengthens the barrier, fades dark marks, softens the look of pores. One of the best-studied, most tolerant actives.",
    bestFor: "All types — a hero for oily, combination, breakout-prone skin.",
    when: "AM or PM (or both, at 4-5%).",
    caution: "Rare flushing at 10%+; 4-5% is plenty. Plays well with nearly everything.",
  },
  {
    name: "Vitamin C",
    tagline: "the brightener",
    does: "A potent antioxidant that brightens, fades dark marks, supports collagen, and enhances your sunscreen's protection.",
    bestFor: "Normal, combination, oily; dullness and dark spots. Sensitive: pick gentle derivatives (SAP, THD ascorbate).",
    when: "AM under sunscreen for best value.",
    caution: "Can tingle at first — start at 5-10% or a derivative. Store away from light and heat.",
  },
  {
    name: "Retinol",
    tagline: "the gold standard",
    does: "Vitamin A derivatives that speed up cell turnover — the gold standard for clogged pores, breakouts, texture, and fine lines.",
    bestFor: "Oily, combination, breakout-prone, texture concerns. Not for pregnancy.",
    when: "PM only, on dry skin (damp skin increases irritation).",
    caution: "Start low (0.1-0.3%), 2 nights a week, build slowly. Mild flaking is common; daily SPF is non-negotiable. Skip if pregnant.",
  },
  {
    name: "Salicylic Acid (BHA)",
    tagline: "the pore cleaner",
    does: "The only common oil-soluble exfoliant — dissolves into pores and clears out oil and dead cells. Ideal for blackheads and clogs.",
    bestFor: "Oily, combination, breakout-prone.",
    when: "PM, 2-3 nights a week to start.",
    caution: "Mild tingling is normal; overuse causes flaking. One exfoliant per routine — don't stack with retinol the same night.",
  },
  {
    name: "Glycolic Acid (AHA)",
    tagline: "the glow exfoliant",
    does: "A small, fast-penetrating water-soluble exfoliant that lifts dead surface cells — smoother texture, more glow, more even tone.",
    bestFor: "Normal, combination; dullness and texture.",
    when: "PM, 1-2 nights a week to start.",
    caution: "Stronger than it feels — stinging means it's working too hard for you. SPF daily. Skip on retinol nights.",
  },
  {
    name: "Lactic Acid (AHA)",
    tagline: "the gentle exfoliant",
    does: "A larger-molecule AHA that exfoliates the surface more gently while hydrating — smoothing flaky patches and softening texture.",
    bestFor: "Dry, sensitive (introducing acids slowly), beginners.",
    when: "PM, 1 night a week to start.",
    caution: "Gentler than glycolic but still sun-sensitizing; don't layer with retinol the same night.",
  },
  {
    name: "Azelaic Acid",
    tagline: "the calm multitasker",
    does: "Calms redness, unclogs pores, and gently fades dark marks — unusually kind to reactive skin.",
    bestFor: "Sensitive, rosacea-prone, acne + redness combos, post-acne marks.",
    when: "AM or PM.",
    caution: "Slight tingling the first week is common; 10% is typically well tolerated.",
  },
  {
    name: "Ceramides",
    tagline: "the barrier mortar",
    does: "Skin-identical lipids — the 'mortar' between your skin-cell 'bricks' — that repair the barrier so moisture stays in and irritants stay out.",
    bestFor: "Everyone — essential for dry and sensitive skin.",
    when: "AM and PM, inside your moisturizer.",
    caution: "None — pure support, no downside.",
  },
  {
    name: "Panthenol (B5)",
    tagline: "the calmer",
    does: "Soothes, hydrates, and supports barrier repair — the classic 'calm down' ingredient.",
    bestFor: "All types, especially sensitive or irritated skin.",
    when: "AM/PM.",
    caution: "None — very well tolerated.",
  },
  {
    name: "Centella (Cica)",
    tagline: "the healer",
    does: "A calming herb that reduces redness and supports skin's own repair processes — the backbone of 'cica' products.",
    bestFor: "Sensitive, redness-prone, barrier-damaged skin — honestly, anyone.",
    when: "AM/PM.",
    caution: "None — famously well tolerated.",
  },
  {
    name: "Squalane",
    tagline: "the soft seal",
    does: "A lightweight, skin-identical oil that seals in moisture and softens without clogging pores for most people.",
    bestFor: "Dry skin (the final PM step); all types wanting extra comfort.",
    when: "PM, last step before or instead of richer cream.",
    caution: "Very low; oily skin may prefer it sparingly.",
  },
  {
    name: "Zinc",
    tagline: "the mineral friend",
    does: "Mild oil-regulating and calming mineral support; the star of mineral sunscreens as a broad-spectrum UV filter.",
    bestFor: "Oily, sensitive; mineral SPF for reactive skin.",
    when: "Any time, within formulas.",
    caution: "Gentle — but avoid harsh 'drying lotion' zinc formulas that sting.",
  },
];

export const ingredientMixing = {
  dont: [
    { combo: "Retinol + Vitamin C", why: "Different pH sweet spots + compounding irritation risk", fix: "Vitamin C in AM · retinol in PM" },
    { combo: "Retinol + AHA/BHA (same night)", why: "Double turnover = peeling and barrier damage", fix: "Retinol Mon/Wed, acid Tue/Thu" },
    { combo: "Retinol + Benzoyl peroxide", why: "BPO can deactivate classic retinol", fix: "Use adapalene with BPO, or AM/PM split" },
    { combo: "Two strong acids at once", why: "Over-exfoliation city", fix: "One exfoliant, 1-3 nights/week" },
  ],
  do: [
    "Niacinamide + almost anything — it even improves retinol tolerance.",
    "Hyaluronic acid + everything — a hydration layer for any routine.",
    "Ceramides, panthenol, squalane + any active — they buffer and support.",
    "Vitamin C + SPF in the morning — antioxidant + protection team up.",
    "The sandwich method: moisturizer → retinol → moisturizer for sensitive beginners.",
  ],
};

/* ---------------- Sunscreen & myths ---------------- */

export const sunscreenGuide = {
  title: "Sunscreen — the most important 30 seconds of your day",
  points: [
    "Research attributes roughly 80% of visible facial aging — dark spots, uneven tone, fine lines — to UV exposure. Starting SPF at 16 rather than 30 is a genuine advantage: you're preventing, not correcting.",
    "UVB = the burning rays (strongest 10am-4pm, mostly blocked by glass). UVA = the aging rays — steady all day, all year, passes through windows and clouds.",
    "SPF 30 ≈ 97% of UVB filtered · SPF 50 ≈ 98%. The amount you apply matters far more than the number — most people apply a quarter of the tested dose.",
    "The two-finger rule: squeeze two lines from base to tip of your index and middle fingers — that's the right amount for face + neck.",
    "Reapply every 2 hours of sun exposure; after swimming, sweating, toweling. Indoors all day near a window? UVA still reaches you.",
    "Choose 'broad spectrum' so you're covered against both. Any SPF you'll happily wear daily is the right one.",
  ],
};

export const skincareMyths = [
  { myth: "Oily skin doesn't need moisturizer", truth: "FALSE — dehydrated skin compensates by producing MORE oil. A light gel moisturizer usually means less shine, not more." },
  { myth: "Natural is always better", truth: "Poison ivy is natural; water is a chemical. Well-tested 'lab' ingredients are often gentler than raw lemon or essential oils. Judge the formula, not the vibe." },
  { myth: "Toothpaste dries out pimples", truth: "Toothpaste is formulated for teeth — it can burn the spot and leave a dark mark that outlives the pimple by months. Use benzoyl peroxide instead." },
  { myth: "Higher SPF = way more protection", truth: "SPF 30 blocks ~97% of UVB, SPF 50 ~98%. Applying ENOUGH matters far more than the number." },
  { myth: "You only need sunscreen when it's sunny", truth: "Up to ~80% of UV penetrates clouds, and UVA comes through windows. Daily SPF is the rule." },
  { myth: "Hot water opens pores, cold closes them", truth: "Pores have no muscles and no doors. Warm water softens the oil inside pores (helpful), but pore size is genetics + oil." },
  { myth: "Exfoliating daily gives faster results", truth: "Skin renews on ~28-day cycles in your teens/20s. Daily scrubbing damages the barrier — 1-3×/week maximum." },
  { myth: "Acne means your face is dirty", truth: "Acne is oil + hormones + genetics + bacteria, not dirt. Over-washing strips the barrier and can make it worse." },
  { myth: "You'll see results in a few days", truth: "Realistic timelines: hydration ~2 weeks, texture ~4-8 weeks, dark spots 2-6+ months. Consistency beats intensity." },
  { myth: "Tanning clears up acne", truth: "A tan temporarily camouflages skin, but UV increases post-acne marks, ages skin, and raises cancer risk. Tanning is never a treatment." },
  { myth: "The more products, the better the skin", truth: "A consistent 3-5 step routine beats a 12-step shelf. Every added product is added irritation risk." },
  { myth: "Chocolate and pizza cause breakouts", truth: "Strong direct links are unproven. Evidence points weakly to high-glycemic diets and heavy skim dairy for some people. No single food is a universal trigger." },
];

export const habitTips = [
  { title: "Wash your pillowcase 1-2×/week", body: "Your face spends 8 hours a night on it — it collects oil, dead cells, and bacteria that get pressed back into your skin nightly." },
  { title: "Hands (and phone) off your face", body: "Your phone screen is a top offender for cheek breakouts — wipe it daily. Never pick or pop: squeezing pushes inflammation deeper and turns a small pimple into a long-lasting dark mark." },
  { title: "Sleep is real beauty sleep", body: "7-9 hours: skin does its repair work overnight, and sleep loss raises cortisol — more oil, more breakouts, duller tone." },
  { title: "Patch test everything new", body: "Apply a pea-size amount to your inner arm and wait 24-48 hours. Any redness, itching, or bumps = that product is not for you. One new product at a time, 1-2 weeks apart." },
  { title: "Lukewarm water, always", body: "Hot water feels nice and strips skin. After sweaty workouts, rinse or wash so sweat doesn't sit and marinate." },
];
