/* ============================================================
   AURELIA DATA — Hairstyles
   Source: src/content/hairstyle-guide.md (research)
   ============================================================ */

export type Difficulty = "easy" | "medium";

export interface HairStyle {
  id: string;
  name: string;
  difficulty: Difficulty;
  minutes: number;
  heat: boolean;
  length: string;
  occasions: string[];
  steps: string[];
  proTips: string[];
  mistake: string;
}

export const masterStyles: HairStyle[] = [
  {
    id: "sleek-high-pony",
    name: "Sleek High Ponytail",
    difficulty: "easy",
    minutes: 5,
    heat: false,
    length: "Medium-long",
    occasions: ["college", "gym", "night out", "formal"],
    steps: [
      "Brush all hair back and smooth it with your palms.",
      "Tilt your chin UP and gather hair at the crown — chin up = pony sits higher.",
      "Smooth the sides with the brush as you hold the pony in one hand.",
      "Secure tightly with a strong elastic, wrapped 2-3 times.",
      "Pick up a pencil-thin strand from UNDER the ponytail.",
      "Wrap it around the elastic until fully hidden.",
      "Pin the strand's tail under the pony with a bobby pin, wavy side down.",
      "For flyaways: spray hairspray onto a clean toothbrush and gently stroke down the crown.",
    ],
    proTips: [
      "If your pony slides low during the day, your elastic is too loose — stack two elastics.",
      "For a fuller pony: clip a small claw clip inside the base against your scalp, hidden under the hair.",
    ],
    mistake: "Placing it at half-height — a 'sort of high, sort of not' pony looks like it slid down. Commit to the crown.",
  },
  {
    id: "messy-bun",
    name: "The Messy Bun",
    difficulty: "easy",
    minutes: 3,
    heat: false,
    length: "Medium-long",
    occasions: ["everyday", "casual", "college", "travel"],
    steps: [
      "Spritz dry shampoo at the roots and scrunch — freshly-washed hair is too slippery to hold a bun.",
      "Flip your head upside down and gather hair at the crown with your fingers.",
      "Twist the whole ponytail into a rope.",
      "Wrap the rope around its own base into a bun shape.",
      "On the LAST wrap of your elastic, pull the hair only HALFWAY through — that's the messy-bun secret.",
      "Wrap any leftover tail around the bun and pin with bobby pins (wavy side down).",
      "Tug the bun's edges outward to enlarge and loosen it.",
      "Pull out two face-framing pieces at the front.",
    ],
    proTips: [
      "Bun looking small and sad? Wrap a thick scrunchie around the base first, then build the bun over it — instant volume.",
      "Messy does not mean falling apart: if it collapses by lunch, re-twist and add one more pin.",
    ],
    mistake: "Building it on silky just-washed hair with zero texture — it deflates. Dry shampoo or second-day hair is the fix.",
  },
  {
    id: "claw-twist",
    name: "Claw-Clip French Twist",
    difficulty: "easy",
    minutes: 3,
    heat: false,
    length: "Medium-long",
    occasions: ["office", "interview", "formal", "dinner"],
    steps: [
      "Brush hair smooth — this style's whole personality is sleek.",
      "Gather all your hair at the nape like a low ponytail.",
      "Twist the tail upward 2-3 full turns against the back of your head.",
      "Fold the ends DOWN and tuck them into the top of the roll.",
      "Press the roll flat against your head with your palm.",
      "Open a large claw clip and clamp it VERTICALLY over the roll — top near the crown, bottom near the nape.",
      "Make sure the clip's teeth grab hair at the scalp level, not just the outer roll.",
      "Gently lift the top edge of the roll with your fingertips for one soft, face-softening pouf.",
    ],
    proTips: [
      "Bigger clip = better hold. Tiny decorative clips will pop open — use a proper large one.",
      "Second-day hair holds a French twist better than fresh-washed hair.",
    ],
    mistake: "Clamping only the outer layer of the roll — the clip must reach hair close to your scalp or the twist slides down by midday.",
  },
  {
    id: "heatless-curls",
    name: "Heatless Curls",
    difficulty: "medium",
    minutes: 5,
    heat: false,
    length: "Medium-long",
    occasions: ["date night", "party", "everyday glam"],
    steps: [
      "Start with hair that's 85-90% dry — damp, never wet, never fully dry-frizzy.",
      "Brush through completely — every tangle becomes a weird kink by morning.",
      "Place a robe belt / satin rod over the top of your head like a headband, ends hanging down each side.",
      "Take a 5 cm section from the front and wrap it around the belt, directing AWAY from your face.",
      "Keep picking up new hair and adding it in as you wrap down — like curling a ribbon.",
      "Secure the last bit to the belt with a silk scrunchie.",
      "Repeat on the other side, wrapping still away from your face.",
      "Sleep on it (silk pillowcase helps), then unwrap gently and separate with fingers ONLY.",
    ],
    proTips: [
      "Wrap direction matters: away from the face = open curtain-style glam; toward the face = vintage Hollywood.",
      "Smaller sections = tighter, longer-lasting curls. Big sections = soft waves.",
    ],
    mistake: "Wrapping soaking-wet hair — you'll wake up with still-damp, weirdly bent hair and frizz. Damp, not wet. Always.",
  },
  {
    id: "half-up",
    name: "Half-Up Half-Down",
    difficulty: "easy",
    minutes: 2,
    heat: false,
    length: "Medium-long",
    occasions: ["date night", "everyday", "college"],
    steps: [
      "Use your thumbs to trace a line from just above each ear up to your crown.",
      "Gather that top section — everything ABOVE the line stays up.",
      "Clip or tie the bottom half out of the way so it doesn't sneak in.",
      "Brush the top section smooth.",
      "Secure it at your crown with a small elastic or claw clip.",
      "Take a thin strand from the half-pony and wrap it around the elastic to hide it; pin underneath.",
      "Gently tug the hair above the elastic upward on both sides — this 'poufs' the crown without teasing.",
      "Let down the bottom section and shake it out.",
    ],
    proTips: [
      "Two front strands left loose = instantly softer, face-framing version.",
      "Positioning is everything: secure at the CROWN (not the back of your head) so the style lifts your face.",
    ],
    mistake: "Taking hair from too low — the line is ABOVE your ears, otherwise you've just made a ponytail.",
  },
  {
    id: "dutch-braid",
    name: "Dutch Braid",
    difficulty: "medium",
    minutes: 6,
    heat: false,
    length: "Medium-long",
    occasions: ["college", "gym", "ethnic", "festivals"],
    steps: [
      "Brush hair back and grab a section at the top of your head, where a high pony would start.",
      "Split it into three equal strands.",
      "Dutch: cross the LEFT strand UNDER the middle, then the RIGHT under the middle. (French = cross OVER — braid sits flat underneath.)",
      "Before the next cross, pick up a thin slice of loose hair from the left side, ADD it to the left strand, then cross under.",
      "Same on the right: pick up, add, cross.",
      "Keep alternating — pick up, cross, pick up, cross — until you reach the nape.",
      "Continue with a regular 3-strand braid to the ends and secure.",
      "Pancake it: tug the outer edge of every loop to make the braid look twice as thick.",
    ],
    proTips: [
      "Braid on second-day hair — the slight texture gives your fingers grip.",
      "Keep every picked-up slice the same size. Uneven slices = wobbly braid.",
    ],
    mistake: "Looking in the mirror mid-braid. Braiding by FEEL, in a smooth rhythm, is easier than watching.",
  },
  {
    id: "fishtail",
    name: "Fishtail Side Braid",
    difficulty: "medium",
    minutes: 5,
    heat: false,
    length: "Long (medium works loosely)",
    occasions: ["date night", "party", "beach", "everyday"],
    steps: [
      "Brush hair and sweep it all over one shoulder.",
      "Split the hair into just TWO big sections. (Yes, two. Trust.)",
      "Take a THIN strand from the outside edge of the LEFT section.",
      "Cross that thin strand over and let it join the INSIDE of the RIGHT section.",
      "Now take a thin strand from the OUTSIDE of the right and cross it over to join the inside of the left.",
      "Keep alternating — outside strand crosses to the other side — like lacing a shoe, all the way down.",
      "Secure with a clear elastic near the ends.",
      "Pancake every loop outward for that thick, editorial look.",
    ],
    proTips: [
      "The thinner your crossing strands, the more intricate the fishtail looks.",
      "Messed up a section? Nobody can tell — fishtails hide small errors beautifully. Keep going.",
    ],
    mistake: "Using thick crossing strands — they make it look like a messy twist. Go thinner than feels natural.",
  },
  {
    id: "space-buns",
    name: "Space Buns",
    difficulty: "medium",
    minutes: 8,
    heat: false,
    length: "Medium-long",
    occasions: ["party", "festival", "night out"],
    steps: [
      "Part hair straight down the middle, all the way back to the nape.",
      "Make two high pigtails — trace from the outer edge of each eyebrow up toward the crown.",
      "Tie each pigtail with an elastic, tight enough to hold position.",
      "Twist each pigtail into a firm rope.",
      "Wrap the rope around its base into a small bun.",
      "Secure each bun with an elastic (half-loop trick) and 1-2 bobby pins, wavy side down.",
      "Tug the buns' edges outward to fluff and enlarge them.",
      "Pull out two thin face-framing strands at the front to soften.",
    ],
    proTips: [
      "Beginner remix: 'half-up space buns' — only bun the top half, leave the rest down. Cuter and easier.",
      "Add a tiny braid in each pigtail BEFORE twisting it into the bun for extra texture.",
    ],
    mistake: "Placing the buns too far apart or too far back — you should SEE both buns from the front.",
  },
  {
    id: "bubble-pony",
    name: "Bubble Ponytail",
    difficulty: "easy",
    minutes: 5,
    heat: false,
    length: "Medium-long",
    occasions: ["party", "college", "formal", "night out"],
    steps: [
      "Brush hair into a ponytail — any height, but high looks most dramatic.",
      "Add a second elastic about 7-8 cm below the base.",
      "Pull the hair between the two elastics gently outward on all sides to puff it into a bubble.",
      "Add a third elastic another 7-8 cm down.",
      "Tug that section into a matching bubble.",
      "Repeat until you're about 5 cm from your ends, then secure.",
      "Even out all bubbles with your fingers — same size, same puff.",
      "Optional: wrap a thin strand of hair around each elastic and pin to hide it.",
    ],
    proTips: [
      "Rub one drop of leave-in between your palms and lightly smooth each bubble — polished, not fuzzy.",
      "Space bubbles a hand-width apart. Even spacing is the difference between elegant and lumpy.",
    ],
    mistake: "Pulling the bubbles too aggressively and popping them out of shape — puff gently, a little at a time.",
  },
  {
    id: "halo-braid",
    name: "Braided Crown (Halo)",
    difficulty: "medium",
    minutes: 9,
    heat: false,
    length: "Medium-long",
    occasions: ["ethnic", "wedding guest", "formal", "festivals"],
    steps: [
      "Part hair straight down the middle.",
      "Starting at the right side of the part, begin a Dutch braid (strands cross UNDER), curving down along your hairline toward your ear.",
      "Follow the hairline: braid past the ear and around the back toward the nape, adding hair from the hairline side.",
      "When you run out of hair, finish with a normal braid and tie it off.",
      "Repeat on the left side, braiding along the hairline to meet the first braid at the back.",
      "Cross the two braid tails over each other.",
      "Tuck each tail UNDER the opposite braid and pin it there, wavy side down.",
      "Pancake the top loops of both braids to make the crown look full and thick.",
    ],
    proTips: [
      "Think of the braid as drawing a headband shape around your head — close to the hairline the whole way.",
      "Pinning is your safety net: any loose loop can be pinned with a bobby pin, wavy side down.",
    ],
    mistake: "Braiding too far from the hairline, so the 'crown' ends up at the back of your head instead of framing your face.",
  },
];

export const styleById = (id: string) => masterStyles.find((s) => s.id === id);

/* ---------------- Styles by outfit category ---------------- */

export interface OutfitCategory {
  id: string;
  name: string;
  blurb: string;
  styleIds: string[];
  why: Record<string, string>;
}

export const outfitCategories: OutfitCategory[] = [
  {
    id: "casual",
    name: "Casual / Everyday",
    blurb: "Jeans & tee, errands, coffee runs",
    styleIds: ["messy-bun", "half-up", "claw-twist"],
    why: {
      "messy-bun": "Reads effortless exactly like your favorite jeans-and-tee combo — put together but not trying too hard.",
      "half-up": "Lifts hair off your face so a plain tee instantly looks styled.",
      "claw-twist": "One clip, one minute — chill but clean.",
    },
  },
  {
    id: "college",
    name: "College / Campus",
    blurb: "Lectures, library, long days",
    styleIds: ["dutch-braid", "bubble-pony", "sleek-high-pony"],
    why: {
      "dutch-braid": "Survives a full day of classes, a backpack, and an accidental library nap — and still looks intentional.",
      "bubble-pony": "Looks like you tried way harder than you did — perfect for the girl sprinting to a 9 AM.",
      "sleek-high-pony": "Backpack straps, laptop bags, wind — nothing grabs a sleek pony.",
    },
  },
  {
    id: "date",
    name: "Date Night",
    blurb: "Dresses, cute tops, dinner",
    styleIds: ["half-up", "heatless-curls", "fishtail"],
    why: {
      "half-up": "Romantic without trying too hard — softness where it counts.",
      "heatless-curls": "Waves that look deliberate and touchable, done while you slept.",
      "fishtail": "The 'she's effortlessly gorgeous' braid — intricate from the front, simple from your hands.",
    },
  },
  {
    id: "party",
    name: "Party / Night Out",
    blurb: "Clubs, birthdays, events",
    styleIds: ["space-buns", "fishtail", "bubble-pony"],
    why: {
      "space-buns": "The fun one — playful, photo-ready, survives dancing.",
      "fishtail": "Boho-glam pulled-out version reads expensive in photos.",
      "bubble-pony": "Sleek bubbles + accessories = main-character pony.",
    },
  },
  {
    id: "formal",
    name: "Formal / Office",
    blurb: "Blazers, interviews, formal shirts",
    styleIds: ["claw-twist", "sleek-high-pony", "bubble-pony"],
    why: {
      "claw-twist": "The office classic — polished in 3 minutes flat.",
      "sleek-high-pony": "Sharp, awake, professional.",
      "bubble-pony": "The corporate-friendly pony with personality.",
    },
  },
  {
    id: "ethnic",
    name: "Traditional / Ethnic",
    blurb: "Saree, kurta, lehenga",
    styleIds: ["halo-braid", "fishtail", "dutch-braid"],
    why: {
      "halo-braid": "The regal frame for sarees and lehengas — add flowers tucked into the braid.",
      "fishtail": "Side-swept over one shoulder with a parandi or ribbon woven in.",
      "dutch-braid": "Decorated braid energy — gajra (flower strings) woven along the braid is a classic.",
    },
  },
  {
    id: "sporty",
    name: "Sporty / Athleisure",
    blurb: "Gym, yoga, runs",
    styleIds: ["dutch-braid", "sleek-high-pony", "messy-bun"],
    why: {
      "dutch-braid": "The 'it stays ALL workout' style — two braids (boxer braids) for high-intensity days.",
      "sleek-high-pony": "High and wrapped — out of the way, zero distractions.",
      "messy-bun": "The yoga-class uniform. Loose enough to be comfy, secure enough for flows.",
    },
  },
  {
    id: "beach",
    name: "Beach / Vacation",
    blurb: "Summer, salt air, sunshine",
    styleIds: ["heatless-curls", "fishtail", "messy-bun"],
    why: {
      "heatless-curls": "Overnight waves + salt air = the beach texture everyone fakes with product.",
      "fishtail": "Loose side braid that only looks better as the day gets windier.",
      "messy-bun": "The post-swim classic — high, loose, sun-warmed.",
    },
  },
];

/* ---------------- Face shapes ---------------- */

export interface FaceShape {
  id: string;
  name: string;
  emoji: string;
  spot: string;
  goal: string;
  flattering: string;
  careful: string;
}

export const faceShapes: FaceShape[] = [
  {
    id: "oval",
    name: "Oval",
    emoji: "🥚",
    spot: "Face ~1.5× longer than wide. Forehead slightly wider than the jaw, softly rounded jaw. No single feature dominates.",
    goal: "Nothing — you're balanced. Nearly everything works.",
    flattering: "Sleek high ponytail, middle-part buns, claw-clip twist, braided crown. Show off those balanced cheekbones.",
    careful: "Heavy blunt full-coverage bangs hide your best feature — that balance. Curtain bangs are the softer choice.",
  },
  {
    id: "round",
    name: "Round",
    emoji: "🍑",
    spot: "Face width and length nearly equal. Cheeks are the widest point, soft curved jaw and chin.",
    goal: "Add LENGTH and height — draw the eye up and down, not side to side.",
    flattering: "Sleek high ponytail (instant length), deep side part, side-swept fishtail, long waves past the collarbone.",
    careful: "Round chin-length bobs, puffed volume at the cheeks, super-flat middle parts with no height — all add width.",
  },
  {
    id: "square",
    name: "Square",
    emoji: "🟩",
    spot: "Strong angular jawline; forehead, cheekbones and jaw all close in width. Jaw corners visible from the front.",
    goal: "Soften the angles with curves and movement.",
    flattering: "Loose waves at the jawline (curls curve exactly where the angles are), side-swept braid, textured messy bun, deep side part.",
    careful: "Razor-straight sleek centre parts and stick-flat hair that trace every angle. If you go sleek, leave two soft pieces out.",
  },
  {
    id: "heart",
    name: "Heart",
    emoji: "💗",
    spot: "Forehead clearly the widest part, cheeks taper, chin comes to a noticeable point.",
    goal: "Add balance and weight at the JAW/chin to offset the wide forehead.",
    flattering: "Side-swept or curtain bangs, waves at the jaw, low side braid, low chignon bun, half-up with face-framing waves.",
    careful: "Tight slicked-back fully-off-the-face high ponys with no front pieces — they exaggerate the top-heavy triangle.",
  },
  {
    id: "long",
    name: "Long / Oblong",
    emoji: "📏",
    spot: "Face noticeably longer than wide (~2×), long forehead, often a longer chin.",
    goal: "Add WIDTH — bring fullness to the sides, visually shorten the face.",
    flattering: "Curtain bangs (cover forehead = shorter face), waves with volume at the CHEEKS, space buns (width at the top corners!), half-up half-down.",
    careful: "Very high tight ponytails and long flat straight hair with a middle part — both stretch the face longer.",
  },
  {
    id: "diamond",
    name: "Diamond",
    emoji: "💎",
    spot: "Cheekbones are the widest point; forehead and chin both narrow. Face slightly longer than wide.",
    goal: "Show off those cheekbones; add width at the forehead, soften the chin.",
    flattering: "Half-up half-down (width at the temples), curtain bangs, waves at the jaw, braided crown, space buns.",
    careful: "Super-slicked-back styles with zero volume — they make the forehead and chin look even narrower.",
  },
];

/* ---------------- Prep basics & quick fixes ---------------- */

export const prepBasics = [
  { title: "Second-day hair is your superpower", body: "Freshly-washed hair is slippery and slides out of everything. The slight texture of day-two hair gives grips and holds — dry shampoo at the roots refreshes it instantly." },
  { title: "Dry shampoo, done right", body: "Spray at the ROOTS from 15-20 cm, lift sections, then massage with fingertips. Pro move: apply it the NIGHT BEFORE so it absorbs oil while you sleep — you wake up with instant volume." },
  { title: "Detangle without damage", body: "Start from the ENDS and work up, holding the section above where you're brushing so tugs don't reach your scalp. Wet hair? Wide-tooth comb only — brushes snap wet strands." },
  { title: "Hair ties that don't dent", body: "Silk scrunchies and spiral (invisibobble-style) ties don't leave the deep crease of a regular elastic — plus they're gentler on your hairline. Velvet scrunchies double a bun's size." },
  { title: "The bobby pin secret", body: "Wavy side DOWN. The waves grip the hair, the flat side holds it down. Sliding pins? Cross two pins in an X over each other." },
  { title: "Hide the elastic", body: "After tying any pony, pull a thin strand from under the tail, wrap it around the elastic until hidden, and pin the end underneath. 15 seconds, instantly expensive." },
];

export const haircareTips = [
  { title: "Wash frequency by hair type", body: "Oily scalp: every 1-2 days. Normal scalp + dry ends (most common): 2-3 per week. Thick/wavy/South Asian textures: 1-2 per week. Over-washing strips the scalp, which pumps out MORE oil." },
  { title: "Post-wash = where breakage happens", body: "Blot and scrunch with a microfiber towel or soft tee — NEVER rub. Detangle damp hair from the ends with a wide-tooth comb. Don't tie hair up soaking wet — damp hair stretches and snaps." },
  { title: "Heat protection is non-negotiable", body: "Spray damp hair before blow-drying, dry hair before straightening. Even 'just once a week' heat needs protection — heat damage is cumulative and doesn't wash out." },
  { title: "Sleep like you care", body: "Silk or satin pillowcase = less frizz, fewer tangles, less breakage. No silk? Wrap hair in a satin scarf or sleep in a loose low braid with a silk scrunchie. Never a tight elastic overnight." },
  { title: "Pre-wash oiling (the classic that works)", body: "Warm 1-2 tbsp of coconut/almond/argan oil, apply to mid-lengths and ends first, massage the scalp 3-5 minutes, leave 30 min to overnight, shampoo out. Once a week for dry/thick hair." },
];

export const quickFixes = [
  { problem: "Greasy hair, no time to wash", fix: "Dry shampoo at the roots BEFORE bed (it absorbs oil overnight). No dry shampoo? A touch of translucent setting powder or cocoa powder on dark hair, brushed through." },
  { problem: "Ponytail dent", fix: "Dampen the dent section slightly, blow-dry while pulling hair the opposite direction, or tie a claw clip loosely instead of an elastic next time." },
  { problem: "Frizz, zero products", fix: "Smooth a tiny amount of plain hand cream or (clean!) lip balm between palms and lightly pat flyaways. Less is more." },
  { problem: "Bun too small", fix: "Wrap a thick velvet scrunchie around the base before building the bun, or pancake the bun edges outward with both hands." },
  { problem: "Braid looks thin and sad", fix: "Pancake it — tug the outer edge of every loop outward, working from bottom to top. A braid can double in size in 30 seconds." },
  { problem: "Bobby pins keep sliding", fix: "Wavy side down, and spray them with dry texturizing spray or hairspray first. Cross two in an X for heavy sections." },
  { problem: "Curls fell flat by evening", fix: "Retwist a few face-framing sections around your finger, blast 10 seconds with cool air from a blow-dryer, or clip them up warm and release at the door." },
  { problem: "Ponytail headache", fix: "Your pony is too tight and too high — loosen the elastic one wrap, or switch to a claw clip that grips without pulling the scalp." },
];
