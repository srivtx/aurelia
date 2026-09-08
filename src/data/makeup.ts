/* ============================================================
   AURELIA DATA — Makeup Basics
   Source: docs/MAKEUP_KNOWLEDGE_BASE.md (research)
   ============================================================ */

export const goldenOrder: { step: number; name: string; why: string; optional?: boolean }[] = [
  { step: 1, name: "Skincare prep", why: "Cleanse → moisturize → SPF, then wait 3-5 minutes. Makeup is paint — smooth, hydrated skin is the wall." },
  { step: 2, name: "Primer", why: "A problem-solver, not a vitamin. Blurring ones smooth texture, mattifying ones fight shine. Optional for everyday.", optional: true },
  { step: 3, name: "Color corrector", why: "Cancels stubborn discoloration with color theory: green on redness, peach on dark circles. Rice-grain amounts.", optional: true },
  { step: 4, name: "Foundation", why: "Evens overall tone. Thin layer from the center of the face outward; build only where you need it." },
  { step: 5, name: "Concealer", why: "Spot-fixes what foundation didn't cover. Goes after so it isn't wiped away — and you use half as much." },
  { step: 6, name: "Setting powder", why: "Locks the cream layers so they don't slide, and softens shine. Dry skin can skip or use a whisper." },
  { step: 7, name: "Brows", why: "Brows frame the entire face. Doing them before eyes keeps the eye look balanced." },
  { step: 8, name: "Eyeshadow", why: "Transition → lid → outer corner → highlight. Shadow before liner and mascara so fallout dusts off clean." },
  { step: 9, name: "Eyeliner", why: "Defines the lash line. Drawn after shadow so the line stays crisp on clean lids." },
  { step: 10, name: "Mascara", why: "Always the last eye step — otherwise shadow dust sticks to wet lashes." },
  { step: 11, name: "Bronzer → blush → highlighter", why: "Your base flattened your face; this puts dimension back. Warmth low, color on the apples, light on high points." },
  { step: 12, name: "Lips + setting spray", why: "Lipstick finishes the look; one mist of spray melts every layer into one seamless finish." },
];

export const starterKit = [
  { item: "Gentle cleanser", why: "A clean canvas. Gentle is the key word, not fancy." },
  { item: "Moisturizer for your skin type", why: "Hydrated skin is 70% of why makeup looks good." },
  { item: "SPF 30+ for the face", why: "The most powerful beauty product ever made. Non-negotiable." },
  { item: "Tinted moisturizer / BB cream", why: "A forgiving, sheer wash of color — impossible to get wrong." },
  { item: "Concealer", why: "Brightens under-eyes, hides blemishes and redness around the nose." },
  { item: "Translucent pressed powder", why: "Sets your base, kills midday shine. One compact lasts ages." },
  { item: "Cream blush, rosy or peachy", why: "The 'you look healthy' product. Blends with fingers, forgives mistakes." },
  { item: "Neutral matte eyeshadow palette", why: "Light + mid-tone + deep brown + ivory = every soft everyday look for a year." },
  { item: "Brow pencil + spoolie", why: "Brows change your face more than any other single product." },
  { item: "Brown-black mascara", why: "Opens the eyes in 30 seconds. Brown reads softer on first-timers." },
  { item: "Lip balm + one MLBB lip color", why: "'My lips but better' — the shade you can apply without a mirror." },
  { item: "Beauty sponge (damp)", why: "Streak-free, foolproof base application." },
];

export interface OccasionLook {
  id: string;
  name: string;
  minutes: number;
  vibe: string;
  occasions: string;
  kit: string[];
  steps: string[];
  proTip: string;
}

export const looks: OccasionLook[] = [
  {
    id: "no-makeup",
    name: "No-Makeup Makeup",
    minutes: 5,
    vibe: "I woke up like this — skin that looks like skin.",
    occasions: "Everyday · college · errands",
    kit: ["Moisturizer + SPF", "Concealer", "Cream blush", "Spoolie or brow gel", "Brown mascara", "Tinted lip balm"],
    steps: [
      "Moisturizer + SPF. Press it in, wait 60 seconds.",
      "Conceal ONLY what needs it: 3-4 tiny dots under each eye, tap in; a dab on any spot.",
      "One dot of cream blush on each apple. Tap up toward the temples with a fingertip.",
      "Brows: brush up and out with the spoolie. Done.",
      "Lashes: one coat of brown mascara — wiggle at the roots, sweep up.",
      "Tinted lip balm, press lips together. GO.",
    ],
    proTip: "Keep this entire 6-product kit in ONE small pouch. The fastest routine is the one you never dig for.",
  },
  {
    id: "fresh-campus",
    name: "Fresh Campus Look",
    minutes: 10,
    vibe: "Put-together and awake, not 'done up.'",
    occasions: "College · coffee · presentations",
    kit: ["Tinted moisturizer", "Concealer", "Pressed powder", "Neutral matte quad", "Brown pencil liner", "Mascara", "Brow pencil", "Cream blush", "Tinted lip"],
    steps: [
      "Tinted moisturizer: dots on forehead, cheeks, chin; blend outward with a DAMP sponge.",
      "Concealer under-eyes and spots; press in, then a whisper of powder over it.",
      "Powder the T-zone only — leave the cheeks soft and dewy.",
      "Brows: light hair-like strokes on the gaps, then spoolie through.",
      "Matte transition shade in the crease, windshield strokes for 30 seconds; ivory shimmer in the inner corners.",
      "Tightline with the brown pencil — press into the top lash line gaps; tiny smudge at the outer corner.",
      "Mascara: 2 coats, wiggle-zigzag.",
      "Cream blush on the apples, blend up; tinted lip. Done.",
    ],
    proTip: "Use the exact same eye placements every day — after two weeks your hands memorize the motion and this takes 6 minutes.",
  },
  {
    id: "date-night",
    name: "Date Night Soft Glam",
    minutes: 20,
    vibe: "Glowy, romantic, soft everything — pretty, not heavy.",
    occasions: "Dinners · dates · evenings",
    kit: ["Primer", "Light-medium foundation", "Brightening concealer", "Powder", "Blush", "Highlighter", "Champagne + soft brown shadows", "Brown liner", "Mascara", "Lip liner + satin lipstick", "Setting spray"],
    steps: [
      "Primer just where you need it (T-zone shine, visible pores).",
      "Foundation: one thin layer, buff with the damp sponge; add a second only where you want more.",
      "Brightening concealer: inverted triangles under the eyes, tap in, set with a tiny amount of powder.",
      "Brows: map, fill, gel.",
      "Soft brown transition through the crease (60 seconds of blending) → champagne shimmer on the lid → deepen the outer V slightly → ivory under the brow bone.",
      "Thin brown line along the top lashes, small soft flick, smudge before it sets.",
      "Curl lashes, 2-3 coats of mascara; wand tip on the outer third of bottom lashes.",
      "Blush on the apples blended to the temples; highlighter on cheekbones and cupid's bow.",
      "Lip liner softly overdrawing 1 mm at the peaks; satin rose lipstick; blot and reapply. One X-mist of setting spray.",
    ],
    proTip: "Soft glam = ONE balanced level of pretty everywhere. If you switch to a bolder lip last-minute, soften the eyes even more.",
  },
  {
    id: "party-glam",
    name: "Party Glam",
    minutes: 30,
    vibe: "Camera-ready drama that survives flash photography and dancing.",
    occasions: "Parties · birthdays · nights out",
    kit: ["Eyeshadow primer", "Smoky bronze palette", "Black liquid liner", "Face primer", "Full-coverage foundation", "Concealer", "Powder", "Contour/bronzer", "Blush", "Highlighter", "Brow products", "Mascara", "Lip liner + bold matte", "Setting spray"],
    steps: [
      "Lids first today: prime the eyelids (a dab of concealer + powder works too).",
      "Bronze smoky eye: matte brown transition → gold shimmer on the lid → deep shade pressed into the outer V → smoke the same shade under the lower lash line (outer third).",
      "Winged liner: small tail first, connect, fill the triangle, check with eyes open.",
      "Dust off fallout, THEN base: face primer, then full-coverage foundation in thin crossed layers.",
      "Brighten under-eyes, set with powder, and lightly BAKE (2-3 minutes while you do cheeks, then dust off).",
      "Contour the hollows, temples and jaw sides; bronze the '3'; blush slightly stronger than feels natural.",
      "Highlight: cheekbones, brow bone, nose tip, cupid's bow.",
      "Brows: full, defined, gel set.",
      "Curl + 2 coats of mascara; false lashes if you're ready (half/corner lashes are the training wheels).",
      "Bold matte lip: line, fill, blot, fill again. Setting spray in an X and a T.",
    ],
    proTip: "Camera flash washes faces out — blush and bronzer need to look 'a bit much' in the mirror to look right in photos.",
  },
  {
    id: "festive-desi",
    name: "Festive Desi Glam",
    minutes: 25,
    vibe: "Glowing skin, golden eyes, kohl rims — built to last through hours of functions.",
    occasions: "Weddings · functions · ethnic wear",
    kit: ["Primer + long-wear foundation", "Concealer", "Powder", "Gold/copper shimmer + deep bronze shadows", "Kajal/kohl", "Black liner", "Waterproof mascara", "Blush", "Gold highlighter", "Lip liner + deep berry matte", "Setting spray"],
    steps: [
      "Skincare + primer. Long-wear natural-matte foundation buffed in thin layers — functions last hours.",
      "Conceal under-eyes and around the nose; press powder in properly.",
      "Brows defined and groomed — brows carry a whole desi glam look.",
      "Eyes: warm brown transition → gold or copper shimmer all over the lid, pressing slightly past the outer corner → deep bronze in the outer V.",
      "Kajal: tightline the upper lash line, then line the lower waterline. Smudge the lower line softly — this is the soul of the look.",
      "Winged black liner with a slightly longer flick — it elongates the eye beautifully under dupattas and jewelry.",
      "Curl lashes, 2-3 coats of WATERPROOF mascara. (Functions make everyone cry. It's the law.)",
      "Blush slightly stronger on the apples up to the temples; gold highlighter on cheekbones, nose bridge, cupid's bow.",
      "Deep berry or red long-wear matte: line, fill, blot, fill. Setting spray to seal.",
    ],
    proTip: "Warm/golden undertones: skip grey-toned contour — it turns ashy. Define with a WARM bronzer instead.",
  },
];

/* ---------------- 101 mini-guides ---------------- */

export interface Guide101 {
  id: string;
  title: string;
  intro: string;
  cards: { heading: string; body: string }[];
}

export const face101: Guide101 = {
  id: "face-101",
  title: "Face Makeup 101",
  intro: "Foundation, concealer, and the three colors that sculpt your face — decoded.",
  cards: [
    {
      heading: "Find your foundation shade",
      body: "Two questions: DEPTH (fair → deep) + UNDERTONE (warm/cool/neutral). Swipe 2-3 shades in stripes along your JAW in daylight — the right one disappears into your neck. Never test on your hand. Wait 10 minutes to check for oxidizing (turning darker). Sheer coverage forgives imperfect matching; full coverage does not.",
    },
    {
      heading: "Concealer basics",
      body: "Under-eyes: draw an upside-down triangle, point toward your cheek — it lifts the whole face. Use your shade or 0.5-1 lighter, never much lighter (grey ghost circles). Blemishes: EXACTLY your shade — lighter highlights the bump. Press and tap, never rub; thin layers, 20-30 seconds apart.",
    },
    {
      heading: "Contour vs bronzer vs blush",
      body: "Contour = fake SHADOW (cool, matte, in the hollows — defines). Bronzer = fake SUNLIGHT (warm golden, on high points — glows). Blush = fake FLUSH (pink/coral, on the apples — brings life). If you buy ONE face product, buy blush. It's the most flattering starter.",
    },
    {
      heading: "The placement maps",
      body: "Blush: smile, tap the apples, blend up toward the temples — nothing below the nostril line. Bronzer: trace a big '3' on each side — forehead top → cheekbones → jawline. Highlight: cheekbones, brow bone, inner eye corners, cupid's bow, nose tip.",
    },
    {
      heading: "Powder vs spray",
      body: "Setting POWDER locks creams in place (right after creams). Setting SPRAY melts all layers into one seamless finish (your very last step). Oily skin / long days: both. Dry skin: whisper of powder on the T-zone + hydrating spray.",
    },
  ],
};

export const eye101: Guide101 = {
  id: "eye-101",
  title: "Eye Makeup 101",
  intro: "The most feared, most rewarding zone. Master three concepts and you're 90% there.",
  cards: [
    {
      heading: "The transition shade",
      body: "A matte shade 1-2 tones deeper than your skin, blended into the crease with a fluffy brush. It's the soft wash that connects your lid color to your skin — the reason looks blend instead of looking stuck on. No transition shade = sticker eyes. Always blend it.",
    },
    {
      heading: "Where each shade goes",
      body: "Transition: the crease, windshield-wiper strokes. Lid shade: from lash line to crease — usually your prettiest shimmer. Outer corner: deepest shade in a tiny 'V', blended up. Highlight: ivory pressed under the brow bone + inner corners. Matte builds shape, shimmer adds light.",
    },
    {
      heading: "Eyeliner styles, decoded",
      body: "TIGHTLINE (invisible, start here): press pencil into the upper lash line gaps. WING: start with the tail only — a line from the outer corner toward your brow tail — then connect down and fill the triangle. HOODED LIDS: keep the wing above the crease fold so it stays visible. PUPPY LINER: flick down-and-out following the lower lash line — soft, doe-eyed, forgiving.",
    },
    {
      heading: "Mascara in 30 seconds",
      body: "Wipe the wand first (excess = clumps). Wiggle at the ROOTS, then zigzag up. Second coat only while the first is damp. Bottom lashes: wand vertical, one pass. Never pump the wand (it dries the formula) and always curl BEFORE mascara, never after.",
    },
    {
      heading: "Eyebrows: map, fill, soften",
      body: "Brow STARTS where a pencil from your nose corner past your eye's inner corner lands. ARCH where the pencil through your iris edge lands. ENDS past the outer eye corner. Fill sparse spots with short, light, upward strokes — you're evening out, never redesigning. Brush through with a spoolie to finish. Never over-pluck.",
    },
  ],
};

export const lip101: Guide101 = {
  id: "lip-101",
  title: "Lip Makeup 101",
  intro: "The fastest way to look finished — once you prep and pick your shade.",
  cards: [
    {
      heading: "Prep (the skipped step)",
      body: "Exfoliate 1-2× a week with a damp washcloth in small circles. Balm 5-10 minutes before color — apply it at the start of your routine. Blot the excess right before lipstick: color grips a smooth, just-damp surface.",
    },
    {
      heading: "Lip liner's real job",
      body: "Crisp edges, no feathering, longer wear, subtle overdraw. Start at the cupid's bow (two little peaks), short light strokes outward, then the bottom edge. Overdraw only 1-2 mm at the peaks and 1 mm under the center — never a full circle outside your lips. Fill the whole lip with liner: instant long-wear base.",
    },
    {
      heading: "Finishes: when to wear what",
      body: "MATTE: bold, camera-ready, longest wear — but prep first, it's the most drying. SATIN: soft sheen, comfortable, the friendliest first lipstick. GLOSS: shine and fullness, needs touch-ups — great over matte to soften it. TINTED BALM: barely-there, re-apply freely — perfect first-ever lip color.",
    },
    {
      heading: "Shades by undertone",
      body: "COOL: rosy nudes, mauve, fuchsia, blue-based reds (cherry, raspberry — blue makes teeth look whiter). WARM: caramel, toffee, peach, tomato, brick, terracotta. NEUTRAL: true reds, rose, soft beige-pink. Everyone deserves one MLBB — 'my lips but better.'",
    },
  ],
};

export const makeupMistakes = [
  { mistake: "Testing foundation on your hand", fix: "Swipe shades along your JAW and check in daylight — the right one disappears. Hands are a different color and texture." },
  { mistake: "Skipping moisturizer", fix: "Even oily skin needs lightweight hydration. Wait 3-5 minutes before base or foundation clings in patches." },
  { mistake: "Cakey under-eye concealer", fix: "Dab and press — never rub. Thin layer, wait 30 seconds, second thin layer only where needed." },
  { mistake: "Concealer before foundation", fix: "Flip the order — foundation first, then concealer on what still shows. It stays put and you use less." },
  { mistake: "Blush stripes placed too low", fix: "Smile, tap the apples, blend up toward temples. Keep blush above an imaginary line across your nostrils." },
  { mistake: "Blocky, Sharpie brows", fix: "Short light strokes that mimic hairs, then spoolie through. Fill gaps — don't draw new brows." },
  { mistake: "Clumpy spider lashes", fix: "Wipe the wand, wiggle at roots, zigzag up, 2 coats max — the second while the first is still damp." },
  { mistake: "Never washing brushes", fix: "Weekly wash for face brushes. Dirty tools = breakouts + patchy, muddy color." },
  { mistake: "Dark lip liner ring", fix: "Fill your whole lip with the liner so it becomes the base, or match liner to lipstick." },
  { mistake: "Buying 30 products before learning 5", fix: "Master the starter kit first. Add one new product per month. Confidence before complexity." },
];

export const makeupMyths = [
  { myth: "You must always wear primer", truth: "Primer is a problem-solver, not a vitamin. Quick coffee run? Well-moisturized skin is a fine base. Skip guilt-free." },
  { myth: "More product = better coverage", truth: "Thin layers cover better. Heavy layers sit on skin, crease and cake. Apply less, blend more." },
  { myth: "Makeup ruins your skin", truth: "Habits ruin skin — sleeping in makeup, unwashed brushes, expired formulas. Remove everything properly and you're fine." },
  { myth: "Expensive products work better", truth: "Technique beats price, every time. A well-blended affordable foundation beats a luxury one applied with dry fingers." },
  { myth: "Test foundation on your hand", truth: "Your hand is a different color, texture and tan. Jawline + daylight + neck check is the only honest test." },
  { myth: "Dark circles need lighter concealer + more layers", truth: "Darkness is blue/purple — a light concealer lays a grey blanket over it. Peach corrector first, then ONE thin layer." },
  { myth: "You need a full brush set to start", truth: "A damp sponge, clean fingers, one fluffy blending brush and one powder brush do 90% of everything." },
  { myth: "You find your shade once, buy forever", truth: "Skin shifts — paler in winter, deeper after summer. Own two shades or mix them for in-between months." },
];

export const toolCare = {
  title: "Tool care & hygiene",
  points: [
    "Powders → brushes. Liquids/creams → damp sponge or clean fingers. That's the golden rule.",
    "Foundation brushes: wash every 2-3 uses. Powder brushes: weekly. Eyeshadow brushes: every 2 weeks.",
    "Deep-clean: lukewarm water + gentle soap, swirl in your palm, rinse, reshape, dry FLAT overnight (never upright — water kills the glue).",
    "Beauty sponge: rinse after every use, replace every 1-3 months — when it tears or stops bouncing back.",
    "Never share mascara, eyeliner or lip gloss. Anything that touches eyes or lips is personal.",
    "Toss immediately if it smells different, changed color, separated, or stings where it never used to.",
  ],
  expiry: [
    { product: "Mascara", time: "3 months" },
    { product: "Liquid eyeliner", time: "3-6 months" },
    { product: "Foundation (pump)", time: "12-18 months" },
    { product: "Concealer", time: "6-12 months" },
    { product: "Cream blush", time: "12-18 months" },
    { product: "Powders & eyeshadow", time: "18-24 months" },
    { product: "Lipstick", time: "18-24 months" },
  ],
};

export const removalSteps = [
  "Wash your hands first. (Seems obvious. It isn't.)",
  "Eyes: soak a cotton round with micellar water, PRESS on your closed eye for 10-15 seconds, wipe gently down and out. No scrubbing.",
  "Oil phase: with dry hands on dry skin, massage cleansing balm in slow circles for 45-60 seconds — everything starts dissolving.",
  "Emulsify: splash a little lukewarm water, keep massaging — it turns milky and lifts everything away.",
  "Water phase: massage your gentle gel cleanser for 45-60 seconds. This removes the oily residue plus sweat.",
  "Rinse lukewarm until nothing slippery is left. Pat dry — no rubbing.",
  "Moisturize immediately on still-damp skin. The day you wear makeup is the day you remove it. All of it.",
];
