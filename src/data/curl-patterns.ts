/* ============================================================
   AURELIA DATA — Curl patterns (texture-aware hair module)
   ------------------------------------------------------------
   The 10-class scale (1, 2A–C, 3A–C, 4A–C) of the L'Oréal /
   Andre-Walker lineage — reviewed in Callender 2026 (PMC,
   "Classification of High Curl Pattern Hair: A Systematic
   Review"). Each pattern carries texture-specific care:
   wash cadence, moisture chemistry, styling physics, night
   routine, and which of our 10 master styles actually suit
   it. Engine: src/lib/curl-classifier.ts.
   ============================================================ */

import type { CurlFamily, CurlPatternId } from "@/lib/curl-classifier";

export interface CurlStyleMatch {
  id: string; // masterStyles id (src/data/hair.ts)
  why: string;
}

export interface CurlPattern {
  id: CurlPatternId;
  family: CurlFamily;
  label: string; // "Type 2B · Wavy"
  hair: string; // what the fiber does
  spot: string; // how to recognize it
  care: {
    wash: string;
    moisture: string;
    styling: string;
    ingredients: string;
    night: string;
  };
  styles: CurlStyleMatch[];
  tip: string;
}

export const curlPatterns: CurlPattern[] = [
  {
    id: "1",
    family: "straight",
    label: "Type 1 · Straight",
    hair: "Round fiber, no bend — sebum travels the full length, so roots get oily fast while ends stay glossy.",
    spot: "No natural bend even at the ends; strands lie flat on a table; air-dries smooth in 20–40 minutes.",
    care: {
      wash: "Every 1–2 days suits most Type 1 scalps — sebum reaches the ends quickly. A gentle sulfate-free daily formula beats a harsh weekly strip.",
      moisture: "Your ends rarely dry out, but mid-lengths take a light mist or a pea of serum for slip and shine — heavy butters just weigh you flat.",
      styling: "Volume is your fight, not hold: blow-dry roots against their growth direction, dry shampoo at the crown pre-emptively. Texture sprays over gels.",
      ingredients: "Volumizing proteins (hydrolyzed wheat/rice) and lightweight silicones for shine. Skip heavy coconut-butter leave-ins — instant grease.",
      night: "A loose low braid stops overnight tangles without a morning crease; silk pillowcase keeps the cuticle flat and the shine intact.",
    },
    styles: [
      { id: "sleek-high-pony", why: "The fiber is naturally sleek — this style is your home turf, zero heat needed." },
      { id: "bubble-pony", why: "Straight strands make crisp, even bubbles — the geometric version reads expensive." },
      { id: "claw-twist", why: "Smooth fiber holds a clean French twist with one clip." },
    ],
    tip: "Second-day roots are a texture gift — a little scalp oil is nature's shine serum for straight hair. Dry shampoo at the crown, not the ends.",
  },
  {
    id: "2A",
    family: "wavy",
    label: "Type 2A · Loose wave",
    hair: "A gentle, stretched S — bends start mid-shaft. Fine strands that can go limp under weight.",
    spot: "Beachy bends appear when air-dried but brush out to near-straight; waves collapse by afternoon without support.",
    care: {
      wash: "2–3 washes a week. Co-washing once in place of shampoo keeps the wave from drying into frizz.",
      moisture: "Weight is the enemy — a light spray or mousse-level moisture. Leave-in creams heavier than a pea will flatten the S.",
      styling: "Scrunch, don't brush. Mousse on damp hair, cup and squeeze upward, then hands off — touching while drying straightens the bend.",
      ingredients: "Sea-salt and sugar-texture sprays for grit; lightweight aloe or flaxseed gel for soft hold. Avoid heavy shea in leave-ins.",
      night: "A loose pineapple (high, loose scrunchie) or two loose braids wakes up to amplified waves.",
    },
    styles: [
      { id: "heatless-curls", why: "Your wave takes a set overnight beautifully — the robe-belt method upgrades your natural S." },
      { id: "half-up", why: "Keeps volume where waves live while lifting hair off the face." },
      { id: "messy-bun", why: "The texture means the bun never looks flat — second-day is best." },
    ],
    tip: "Diffuse on low heat hovering above the hair — pressing the diffuser into waves while wet pushes them out into frizz.",
  },
  {
    id: "2B",
    family: "wavy",
    label: "Type 2B · Defined S-wave",
    hair: "Clear S-waves from the mid-lengths, with a tendency to frizz at the crown where the bend begins.",
    spot: "Waves survive brushing for an hour then re-bend; the crown halo of frizz shows up on humid days.",
    care: {
      wash: "2–3 times a week, sulfate-free. A shampoo brush massage lifts the scalp without roughing the wave pattern.",
      moisture: "Gel-cream level — light moisture with actual hold. Layer a leave-in mist, then a defining gel-cream seal on the mid-lengths.",
      styling: "Rake gel-cream through damp hair in sections, scrunch upward, air-dry or diffuse. Once cast forms, DON'T touch until fully dry — then scrunch the crunch out.",
      ingredients: "Flaxseed and aloe gels, argan-mist leave-ins. Proteins once a month; skip silicones that build up on wavy mid-lengths.",
      night: "Pineapple loosely with a silk scrunchie; refresh in the morning with water + a whisper of gel, not a re-wash.",
    },
    styles: [
      { id: "heatless-curls", why: "Defines the S you already have — the overnight set turns 2B into intentional beach waves." },
      { id: "fishtail", why: "Waves pancake into a thick, boho fishtail — texture is volume here." },
      { id: "half-up", why: "Half-up keeps the crown wave from flattening under its own weight." },
    ],
    tip: "Humidity day? Gel applied to soaking-wet hair (not damp) binds better — water is the vehicle that carries hold into the strand.",
  },
  {
    id: "2C",
    family: "wavy",
    label: "Type 2C · Coarse deep wave",
    hair: "Deep, thick S-waves bordering on curl — coarse strands that frizz easily and resist definition.",
    spot: "Waves start near the roots and are thick enough to hold; brushing dry = instant volume explosion, not smoothness.",
    care: {
      wash: "1–2 times a week. Your coarse fiber keeps its oil longer; over-washing tips it into dry frizz.",
      moisture: "Richer than 2A/B — a cream leave-in plus a gel seal. Your strands can carry weight; use it.",
      styling: "Define wet: section, rake cream through, scrunch, then gel over top. Dry with a diffuser hovering — or twisted air-dry for uniformity.",
      ingredients: "Shea and murumuru butters in the cream layer; strong-hold gel without drying alcohols. Monthly protein keeps coarse fiber springy.",
      night: "Pineapple or a satin bonnet (the bonnet wins for 2C — waves survive untouched).",
    },
    styles: [
      { id: "fishtail", why: "Your wave gives the fishtail its thickness — pancake the loops and it doubles." },
      { id: "messy-bun", why: "2C texture holds a bun all day; no dry shampoo needed for grip." },
      { id: "dutch-braid", why: "Braids on 2C set overnight into deep waves — two wins in one style." },
    ],
    tip: "The crown frizz halo is 2C's signature — fight it with gel DOWN to the root applied wet, not anti-frizz serum on dry hair (that just sits on top).",
  },
  {
    id: "3A",
    family: "curly",
    label: "Type 3A · Loose spiral",
    hair: "Big, shiny spirals about sidewalk-chalk width — the bend is real curl now, and brushing dry is curl murder.",
    care: {
      wash: "1–2 times a week sulfate-free; co-wash between if the scalp needs it. Detangle ONLY with conditioner in, wide-tooth comb, ends-up.",
      moisture: "Leave-in cream + gel is the baseline. Your spiral loses definition to dryness before anything else — moisture is definition.",
      styling: "Style soaking wet: leave-in, rake, scrunch gel in sections, then hands off until the cast dries. Scrunch out the crunch with a drop of oil.",
      ingredients: "Aloe, flaxseed and marshmallow-root gels; shea creams at the ends. Avoid drying alcohols and daily sulfate shampoos.",
      night: "Pineapple with a silk scrunchie, or the satin bonnet. Refresh with water-mist + a palm of leave-in — never re-shampoo for refresh.",
    },
    styles: [
      { id: "heatless-curls", why: "Defines and stretches your spirals evenly — no heat damage on already-shaped hair." },
      { id: "space-buns", why: "3A texture makes buns that look twice as full as they are." },
      { id: "fishtail", why: "A curly fishtail is editorial volume with almost no effort." },
    ],
    spot: "Chalk-width spirals with root lift; shrinkage is real — wet hair looks a full length longer than dry.",
    tip: "Your shrinkage means dry cuts lie — get curls cut DRY and in their natural state. A wet trim loses 2–4 cm of visible length to spring-back.",
  },
  {
    id: "3B",
    family: "curly",
    label: "Type 3B · Springy curl",
    hair: "Springy ringlets, marker-width, with volume from the root. Prone to dryness — the bend stops sebum mid-shaft.",
    care: {
      wash: "Once or twice a week. Deep-condition every 2 weeks minimum; your ringlet crispness is a moisture gauge.",
      moisture: "Layered: leave-in cream, then gel, then oil to seal ends (LOC-lite). Refresh daily with water — curl reactivate = water + a little product.",
      styling: "Wet application in sections, raking then scrunching, then don't disturb the cast. Diffuse hover-only when in a hurry.",
      ingredients: "Glycerin is climate-dependent (humidity makes it puffy) — test it. Shea, aloe, flaxseed; protein only if curls go limp and stringy.",
      night: "Satin bonnet nightly, pineapple if buns don't work. A refresher bottle (water + leave-in) lives by the mirror.",
    },
    styles: [
      { id: "dutch-braid", why: "Braids hold without elastics fighting the spring — and braid-outs stretch 3B into waves." },
      { id: "space-buns", why: "Ringlets pile into full, sculptural buns with two elastics." },
      { id: "halo-braid", why: "The crown braid tames the front while the back stays free." },
    ],
    spot: "Distinct marker-width ringlets; when pulled straight, springs back instantly. Dryness shows as frizz at the curl's shoulder.",
    tip: "Stringy, limp curls = protein. Puffy, undefined curls = moisture. Diagnose which before buying anything — they're opposites.",
  },
  {
    id: "3C",
    family: "curly",
    label: "Type 3C · Tight curl",
    hair: "Pencil-width corkscrews, dense root volume, serious shrinkage — half the wet length disappears dry.",
    care: {
      wash: "Once a week, low-sulfate or co-wash-led. Pre-wash oiling on the length (not scalp) protects the bend from surfactants.",
      moisture: "The LOC layering (Leave-in, Oil, Cream) every wash-day; mid-week water refresh with light leave-in. Dry ends = lost definition.",
      styling: "Define in small sections wet; shingle (smooth down each clump) or two-strand twist for uniformity. Gel for cast, oil to scrunch it out.",
      ingredients: "Shea, mango and murumuru butters, aloe gel, honey extracts. Avoid mineral-oil-heavy products that need sulfates to remove.",
      night: "Satin bonnet, no exceptions — cotton pillowcases wick the moisture out of 3C overnight.",
    },
    styles: [
      { id: "dutch-braid", why: "Cornrow-style braids protect the curl pattern and set a wave for days." },
      { id: "space-buns", why: "Dense 3C packs into full buns — half-up version is the easiest protective day style." },
      { id: "halo-braid", why: "A front crown braid with the back left free: protected edges, free volume." },
    ],
    spot: "Corkscrew curls the width of a pencil; visibly dense volume; stretches 1.5–2× longer wet.",
    tip: "Never detangle dry. Water + conditioner first, wide-tooth or fingers, ends to roots — a ripped curl stays ripped until it grows out.",
  },
  {
    id: "4A",
    family: "coily",
    label: "Type 4A · Soft coil",
    hair: "Crochet-needle-width coils in a defined S-zigzag pattern. Fragile: the tightest bend = weakest point along the fiber.",
    care: {
      wash: "Every 7–10 days, co-wash-led with a gentle low-po shampoo monthly. Pre-wash oiling is standard, not optional.",
      moisture: "Butter-heavy LOC every wash day; water-mist refresh DAILY — coily hair drinks and loses moisture fastest of all textures.",
      styling: "Wash-and-go works if gel defines each coil clump; twist-outs and braid-outs give stretch + protection for multi-day wear.",
      ingredients: "Shea, mango, cupuaçu butters, jojoba and baobab oils (close to scalp sebum). Heavy is fine; drying alcohol and daily sulfate are not.",
      night: "Satin bonnet + satin pillowcase, refresh in the morning with water and seal with oil. Never a cotton scarf.",
    },
    styles: [
      { id: "halo-braid", why: "The protective crown — edges safe, coils tucked, occasion-ready." },
      { id: "dutch-braid", why: "Protective by design; unravel one for a stretched twist-out." },
      { id: "space-buns", why: "On stretched or day-3 hair, two buns are gentle and cute." },
    ],
    spot: "S-pattern coils the width of a crochet needle — they have a visible zigzag if you pull a strand.",
    tip: "Protective styles (twists, braids, buns) aren't just aesthetics for 4A — every hour hair is tucked is an hour it isn't breaking at the bend.",
  },
  {
    id: "4B",
    family: "coily",
    label: "Type 4B · Z-coil",
    hair: "Z-pattern coils with sharp angles instead of round bends — extreme shrinkage, extreme fragility, extreme versatility.",
    care: {
      wash: "Every 7–10 days. Finger-detangle with slippery conditioner BEFORE any tool touches it; a comb is the last resort, never the first.",
      moisture: "The heaviest layering of all: leave-in, butter, then oil seal. Daily water mist — water first, ALWAYS; oil on dry hair seals dryness in.",
      styling: "Twist-outs, braid-outs, bantu knots — your styling IS the curl definition. Stretch (banding or twists) before any bun or pony.",
      ingredients: "Whipped shea, cupuaçu, murumuru; honey and glycerin for humectancy in dry climates. Say no to products needing a sulfate to remove.",
      night: "Satin bonnet nightly; re-mist and re-seal the ends before bed — overnight is when 4B loses its day.",
    },
    styles: [
      { id: "halo-braid", why: "Two front braids into a crown: the classic protective frame for 4B." },
      { id: "dutch-braid", why: "Braids protect and stretch; unravel for a defined braid-out that lasts days." },
      { id: "claw-twist", why: "On stretched hair, the claw twist is a one-clip protective updo." },
    ],
    spot: "Sharp Z-angles with little visible curl; shrinks 60–75% of its true length; bends break if combed dry.",
    tip: "Moisture rule of thumb: WATER first, butter second, oil LAST. Oil applied to dry hair is a lid on an empty jar.",
  },
  {
    id: "4C",
    family: "coily",
    label: "Type 4C · Tight zigzag",
    hair: "The tightest coil pattern with no visible curl definition — dense, versatile, and the most fragile fiber on the scale.",
    care: {
      wash: "Every 7–10 days minimum, some go 14 with refresh routines. Pre-wash oil always; shampoo the scalp only, let suds rinse the length.",
      moisture: "Maximum sealing: leave-in, heavy butter, oil — and water mist daily. If in doubt, moisturize; 4C almost never gets too much.",
      styling: "Twists and braids are the foundation (protect + define + stretch). Buns and puffs on stretched or day-4+ hair, never on crunchy dry hair.",
      ingredients: "Whipped shea blends, castor and jojoba seals, aloe juice as the water layer. Castor at the edges nightly keeps the hairline soft.",
      night: "Satin bonnet + pillowcase, ends misted and sealed before sleep. A low satin-lined stretch cap protects while gently lengthening.",
    },
    styles: [
      { id: "halo-braid", why: "The regal protective crown — 4C's signature occasion style, flowers optional." },
      { id: "dutch-braid", why: "Straight-back braids are the multi-day protective default; unravel for a stretched set." },
      { id: "space-buns", why: "On stretched hair — full, sculptural buns that hold all day on texture alone." },
    ],
    spot: "No visible curl pattern without manipulation; shrinks 75%+; holds ANY shape you give it (twists, knots, molds).",
    tip: "4C holds shape like no other texture — the flip side is that tight styles pull edges. Alternate protective styles; give the hairline rest weeks.",
  },
];

export const curlPatternById = (id: CurlPatternId): CurlPattern =>
  curlPatterns.find((p) => p.id === id) ?? curlPatterns[0];

export const CURL_FAMILY_ORDER: CurlFamily[] = ["straight", "wavy", "curly", "coily"];

export const CURL_FAMILY_COPY: Record<CurlFamily, { label: string; short: string }> = {
  straight: { label: "Straight", short: "Type 1" },
  wavy: { label: "Wavy", short: "Type 2" },
  curly: { label: "Curly", short: "Type 3" },
  coily: { label: "Coily", short: "Type 4" },
};
