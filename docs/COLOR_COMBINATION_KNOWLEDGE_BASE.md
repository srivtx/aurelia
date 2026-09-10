# Color Combos 101 — The Complete "What Goes With What" Knowledge Base

**Audience:** young women 16-25 who stand in front of a mirror holding a pink top and thinking "…but what pants?"
**Tone:** like a big sister who happens to be a stylist — zero judgment, zero "rules you must obey"
**Format:** app-ready sections: a 19-color matching engine, 15 curated palettes, a beginner color-theory crash course, 10 rules of thumb, and an undertone guide. Every color carries a real hex value.
**Brand policy:** 100% knowledge, 0% promotion. Hex codes are for the app's swatch UI — they describe clothing tones, not brand colors.

> Hey you. Yes, you — the one googling "does burgundy go with black" at 7 a.m. Here's the truth nobody tells you: color matching is not a talent some girls are born with. It's a tiny bit of theory plus a few go-to formulas, and you can learn all of it in one sitting. This guide is your cheat sheet. Within a week you'll be pairing colors on purpose instead of by panic. Let's go. — Your big sis

**Dev note:** Section 1 is the matching engine (every "pairs with" entry cross-references another core color, so you can render pairings bidirectionally). "Handle with care" ≠ forbidden — treat it as a gentle warning with a built-in rescue tip. All hexes used anywhere in this doc are collected in Appendix A.

---

#### Contents

- [SECTION 1: The Color Matching Engine — 19 Core Wardrobe Colors](section-1-the-color-matching-engine--19-core-wardrobe-colors)
- [SECTION 2: 15 Curated Outfit Palettes](section-2-15-curated-outfit-palettes)
- [SECTION 3: Color Theory Crash Course (beginner-friendly)](section-3-color-theory-crash-course-beginner-friendly)
- [SECTION 4: Rules of Thumb — 10 memorable laws](section-4-rules-of-thumb--10-memorable-laws)
- [SECTION 5: Skin Undertone Guide — find your flattering families](section-5-skin-undertone-guide--find-your-flattering-families)
- [Appendix A: Extended Hex Glossary](appendix-a-extended-hex-glossary)
- [Appendix B: Implementation notes (for the dev team)](appendix-b-implementation-notes-for-the-dev-team)

## SECTION 1: The Color Matching Engine — 19 Core Wardrobe Colors

### Master lookup table

| # | id | Name | Hex | Vibe | Flatters |
|---|---|------|-----|------|----------|
| 1 | white | Soft White | `#F7F4EF` | fresh minimalist | everyone |
| 2 | black | Soft Black | `#1B1B1B` | timeless city chic | cool & deep |
| 3 | cream | Cream | `#EFE4D3` | quiet luxury | warm & neutral |
| 4 | brown | Chocolate Brown | `#5C4033` | warm academia | warm & deep |
| 5 | camel | Camel | `#C19A6B` | old money classic | warm & deep-neutral |
| 6 | grey | Grey | `#9B9B9B` | urban minimalist | cool |
| 7 | navy | Navy | `#1E2A44` | Parisian polish | everyone (cool's BFF) |
| 8 | denim | Denim Blue | `#5B7C99` | effortless everyday | everyone |
| 9 | burgundy | Burgundy | `#6B2231` | dark academia elegance | everyone, esp. deep |
| 10 | red | Crimson Red | `#A51C30` | main character energy | everyone (match to undertone) |
| 11 | blush | Blush Pink | `#E8C4C4` | soft romantic | cool & neutral |
| 12 | hotpink | Hot Pink | `#D0417E` | dopamine dressing | cool (all, with confidence) |
| 13 | olive | Olive | `#646B49` | utility cool | warm, golden & deep |
| 14 | sage | Sage Green | `#A3B18A` | clean-girl calm | everyone |
| 15 | mustard | Mustard | `#C9A02C` | retro '70s sunshine | warm & deep |
| 16 | rust | Rust / Terracotta | `#A64B2A` | earthy autumn richness | warm & deep |
| 17 | lavender | Lavender | `#B99CD8` | dreamy whimsical | cool |
| 18 | teal | Teal | `#2F7676` | coastal jewel polish | everyone (rare bridge color) |
| 19 | mint | Mint | `#A8D9C0` | fresh spring breeze | cool & neutral |

---

#### 1. Soft White `#F7F4EF`
**Vibe:** fresh minimalist — the reset button of any wardrobe.
**Pairs beautifully with:**
- **Navy** `#1E2A44` — the highest-contrast combo that still reads polished; instant Riviera energy.
- **Denim** `#5B7C99` — white top + jeans is the most reliable formula in fashion history.
- **Black** `#1B1B1B` — graphic, high-contrast drama that always looks intentional.
- **Camel** `#C19A6B` — white lifts camel's warmth so the pairing looks expensive, never heavy.
- **Blush** `#E8C4C4` — keeps pink's sweetness from turning saccharine; soft romance, zero effort.
**Handle with care:**
- **Cream** `#EFE4D3` — worn together, two "almost whites" read like a failed matching attempt. If you mix, keep white near your face and cream below the waist.
- **Icy pale grey** `#C9CED6` — low contrast can wash out fairer skin; denim or black gives this duo the definition it lacks.
**Undertones:** everyone's color — warm undertones glow in creamy whites, cool undertones in crisper ones. Hold both up to your face and pick whichever makes your eyes pop.
**Stylist secret:** crisp white sneakers count — they refresh an entire outfit the way a white top does.

#### 2. Soft Black `#1B1B1B`
**Vibe:** timeless city chic — never wrong, always armed.
**Pairs beautifully with:**
- **Camel** `#C19A6B` — the camel-coat-over-black-outfit formula is shorthand for "expensive."
- **Blush** `#E8C4C4` — blush softens black's severity; instant feminine balance.
- **Red** `#A51C30` — bold, cinematic night-out drama.
- **Denim** `#5B7C99` — black boots or leather plus jeans = edgy but effortless.
- **White** `#F7F4EF` — maximum contrast, maximum polish.
**Handle with care:**
- **Navy** `#1E2A44` — in dim light the two darks blur into an accidental near-match; if you mix them, separate them with a white or cream layer.
- **Espresso** `#4A352B` — two deep, muted darks read flat and muddy; add a cream buffer if you can't resist.
**Undertones:** flattering on all, most striking on cool and deep undertones. If black drains a warm-fair complexion, keep it on the bottom and add color near your face (scarf, lip).
**Stylist secret:** texture is black's best accessory — leather + knit + denim reads rich; one flat black reads formal.

#### 3. Cream `#EFE4D3`
**Vibe:** quiet luxury — soft-spoken wealth.
**Pairs beautifully with:**
- **Chocolate** `#5C4033` — cozy tonal dressing at its most flattering, like latte art you can wear.
- **Camel** `#C19A6B` — the quiet-luxury layering duo (cream knit under camel coat).
- **Olive** `#646B49` — earthy and effortless; "European vacation" energy.
- **Burgundy** `#6B2231` — wine richness against soft cream feels cozy and expensive at once.
- **Navy** `#1E2A44` — a softer contrast than black; smart without severity.
**Handle with care:**
- **Optic white** `#FFFFFF` — side by side they look like two different whites fighting; commit to one white family per outfit.
- **Neon lime** `#9EF01A` — cream's softness turns any neon into a costume.
**Undertones:** warm and neutral undertones glow. Cool undertones: choose a pinker cream, or anchor the look with grey or navy.
**Stylist secret:** cream shoes make almost any outfit look softer and more expensive than black ones would.

#### 4. Chocolate Brown `#5C4033`
**Vibe:** warm academia — library hours, candlelight, good boots.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — warm, cozy, tonal; the pairing that never fails.
- **Camel** `#C19A6B` — stacking browns in different depths looks custom-made.
- **Rust** `#A64B2A` — rich autumn layering with real depth.
- **Sage** `#A3B18A` — earthy-modern; like a walk in the woods, but chic.
- **Denim** `#5B7C99` — brown boots with jeans is the oldest relaxed-polish trick we know.
**Handle with care:**
- **Black** `#1B1B1B` — flat and muddy with no focal point; if you must, add a camel or cream buffer.
- **Neon lime** `#9EF01A` — neon flattens brown's earthy richness into costume territory.
**Undertones:** made for warm and deep undertones. Cool-fair skin wears it best below the waist (trousers, boots, bag).
**Stylist secret:** brown leather accessories are the fastest way to warm up an otherwise cool outfit.

#### 5. Camel `#C19A6B`
**Vibe:** old money classic — the coat that does all the talking.
**Pairs beautifully with:**
- **Black** `#1B1B1B` — the power-luxe contrast every stylist reaches for first.
- **Cream** `#EFE4D3` — soft, tonal, quiet luxury.
- **Chocolate** `#5C4033` — rich tonal layers that read expensive.
- **Denim** `#5B7C99` — a camel scarf or coat instantly upgrades jeans.
- **Burgundy** `#6B2231` — preppy, wealthy-looking autumn.
**Handle with care:**
- **Mustard** `#C9A02C` — both are yellow-based, so together they can look too matchy and slightly jaundiced.
- **Neon lime** `#9EF01A` — neon shatters camel's hushed elegance.
**Undertones:** flatters warm and deep-neutral best. Cool-fair skin: brighten the face with white or blush near the collar.
**Stylist secret:** a camel coat is the single most expensive-looking garment per dollar you can own.

#### 6. Grey `#9B9B9B`
**Vibe:** urban minimalist — off-duty model energy.
**Pairs beautifully with:**
- **Navy** `#1E2A44` — sleek, business-class polish.
- **Blush** `#E8C4C4` — soft modern femininity; the grey-suit-plus-blush-top move.
- **White** `#F7F4EF` — clean, minimal, gallery-chic.
- **Burgundy** `#6B2231` — cool-weather polish with a wine-dark anchor.
- **Denim** `#5B7C99` — relaxed grey knit plus jeans never misses.
**Handle with care:**
- **Warm beige** `#D9CDBF` — the "greige trap": without a black or white anchor, this pairing can look muddy.
- **Chocolate** `#5C4033` — two muted mid-dark tones go drab; rescue with a crisp white layer.
**Undertones:** home turf for cool undertones. Warm undertones: add a warm accent (camel bag, gold jewelry) or pick a warm-toned grey.
**Stylist secret:** grey in tailored cuts (blazer, trousers) reads quiet-cool — keep one soft or feminine piece in the mix so it doesn't turn corporate.

#### 7. Navy `#1E2A44`
**Vibe:** Parisian polish — black's kinder, chicer sister.
**Pairs beautifully with:**
- **White** `#F7F4EF` — the nautical classic; crisp forever.
- **Camel** `#C19A6B` — preppy luxe, blazer-and-coat energy.
- **Blush** `#E8C4C4` — sweetness with structure.
- **Rust** `#A64B2A` — striking high-contrast autumn; the "wow" combo.
- **Denim** `#5B7C99` — tonal blues à la française; just vary the washes.
**Handle with care:**
- **Black** `#1B1B1B` — the midnight near-miss; if you mix, separate them with light pieces.
- **Chocolate** `#5C4033` — heavy dark-on-dark without a cream buffer.
**Undertones:** near-universal, and a best friend to cool undertones. For warm undertones it's the softer daytime black.
**Stylist secret:** swap black for navy before noon — same authority, gentler on your face.

#### 8. Denim Blue `#5B7C99`
**Vibe:** effortless everyday — the hardest-working color you own.
**Pairs beautifully with:**
- **White** `#F7F4EF` — the formula that built every capsule wardrobe ever.
- **Red** `#A51C30` — Americana pop; sneakers-and-red-lipstick energy.
- **Camel** `#C19A6B` — casual, but make it elevated.
- **Mustard** `#C9A02C` — sunny retro contrast.
- **Navy** `#1E2A44` — tonal blue-on-blue, but choose clearly different shades (light jeans + dark navy top).
**Handle with care:**
- **Navy in the same wash** `#1E2A44` — denim-on-denim only works when the shades are obviously different; identical values read accidental.
- **Dark denim + all-black layers** `#1B1B1B` — with no light break it reads heavy; add a white tee or grey knit.
**Undertones:** universal — denim is a true neutral; dress it up or down.
**Stylist secret:** treat jeans as a "blue-grey neutral": if an outfit would work with grey trousers, it works with jeans.

#### 9. Burgundy `#6B2231`
**Vibe:** dark academia elegance — candlelit library energy.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — cozy luxe; the winter uniform.
- **Camel** `#C19A6B` — rich, wealthy autumn tones.
- **Grey** `#9B9B9B` — sleek cool-weather polish.
- **Blush** `#E8C4C4` — tonal romance; pink-and-wine reads very intentional.
- **Mustard** `#C9A02C` — jewel-toned autumn magic.
**Handle with care:**
- **Red** `#A51C30` — two bold reds competing for the same spotlight.
- **Black** `#1B1B1B` — gorgeous but heavy; if you love it, mix textures (velvet, leather, knit) and keep a light buffer.
**Undertones:** flatters almost everyone; especially rich on deep and cool-neutral undertones. Warm-fair friends often glow more in rust.
**Stylist secret:** burgundy tights under a cream skirt — the coziest cold-weather flex there is.

#### 10. Crimson Red `#A51C30`
**Vibe:** main character energy — walk in, own the room.
**Pairs beautifully with:**
- **White** `#F7F4EF` — graphic and classic; red skirt, white tee, done.
- **Denim** `#5B7C99` — the Americana favorite.
- **Camel** `#C19A6B` — sophisticated pop; red plus camel reads French.
- **Navy** `#1E2A44` — preppy nautical contrast.
- **Black** `#1B1B1B` — bold evening drama.
**Handle with care:**
- **Burgundy** `#6B2231` — too close in family; reads like a mismatch instead of a choice.
- **Hot pink** `#D0417E` — bright-on-bright chaos for beginners (pink + red is a pro move; save it for later).
**Undertones:** everyone can wear red — just match the red to you: blue-based crimson for cool undertones, tomato red `#C63D2F` for warm.
**Stylist secret:** scared of red? Start with shoes or a lip — smallest dose, biggest effect.

#### 11. Blush Pink `#E8C4C4`
**Vibe:** soft romantic — ballet-core, but livable.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — tender tonal romance.
- **Grey** `#9B9B9B` — modern softness; grey suit, blush top.
- **Navy** `#1E2A44` — sweet meets structured.
- **Chocolate** `#5C4033` — the pink-and-brown classic (ballet-flat approved).
- **Camel** `#C19A6B` — warm glow, soft contrast.
**Handle with care:**
- **Hot pink** `#D0417E` — reads like two mismatched pinks unless you deliberately stack pinks in clearly different depths.
- **Neon lime** `#9EF01A` — a harsh fight with soft pink; the whole outfit loses.
**Undertones:** a bestie for cool and neutral undertones (rosy blush). Warm undertones glow more in a peachier blush.
**Stylist secret:** blush plus gold jewelry = instant glow; silver reads cooler and slightly harsher next to it.

#### 12. Hot Pink `#D0417E`
**Vibe:** dopamine dressing — the outfit equivalent of your favorite song.
**Pairs beautifully with:**
- **White** `#F7F4EF` — crisp pop, clean summer energy.
- **Navy** `#1E2A44` — bold prep; the unexpected sophisticate.
- **Black** `#1B1B1B` — statement night-out drama.
- **Grey** `#9B9B9B` — modern and cool, gallery-chic.
- **Denim** `#5B7C99` — playful casual; pink plus jeans reads effortless, not loud.
**Handle with care:**
- **Red** `#A51C30` — a bright-on-bright war for attention.
- **Burgundy** `#6B2231` — muted jewel next to neon reads unbalanced.
**Undertones:** anyone, with confidence — electric on cool undertones. Warm undertones shine even more in coral-pink.
**Stylist secret:** one hot pink bag on an all-neutral outfit is the fastest mood-lift known to science.

#### 13. Olive `#646B49`
**Vibe:** utility cool — cargo pants, white sneakers, main character off duty.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — earthy and clean; the easiest way to wear olive.
- **White** `#F7F4EF` — fresh utility (white tee + olive cargos).
- **Rust** `#A64B2A` — deep autumn layering.
- **Camel** `#C19A6B` — tonal desert polish.
- **Black** `#1B1B1B` — edgy utility; black boots ground olive.
**Handle with care:**
- **Neon lime** `#9EF01A` — cousin colors, both screaming.
- **Hot pink** `#D0417E` — muted versus neon is a saturation fight; the olive loses.
**Undertones:** warm, golden and deep undertones glow. Very cool-fair skin can look sallow — keep cream near your face.
**Stylist secret:** olive cargos + white sneakers is the blueprint off-duty-model look; add a cream knit and pretend paparazzi exist.

#### 14. Sage Green `#A3B18A`
**Vibe:** clean-girl calm — soft, slow-morning energy.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — serene and quietly expensive.
- **Blush** `#E8C4C4` — garden romance, soft contrast.
- **Chocolate** `#5C4033` — earthy depth; grounds the softness.
- **White** `#F7F4EF` — clean, spa-like freshness.
- **Denim** `#5B7C99` — fresh casual; sage knit plus jeans.
**Handle with care:**
- **Emerald** `#0F8A5F` — cousin greens clash (near in hue, far in saturation).
- **Neon lime** `#9EF01A` — neon flattens sage's softness entirely.
**Undertones:** the most universally flattering green — a rare color almost everyone can wear next to the face.
**Stylist secret:** sage is the green for people who "can't wear green." If forest green ever fought you, try sage instead.

#### 15. Mustard `#C9A02C`
**Vibe:** retro '70s sunshine — vinyl records and good turtlenecks.
**Pairs beautifully with:**
- **Olive** `#646B49` — autumn tonal, straight out of a record shop.
- **Navy** `#1E2A44` — golden-hour contrast; sweater-weather staple.
- **Chocolate** `#5C4033` — rich '70s warmth.
- **Burgundy** `#6B2231` — jewel-toned autumn magic.
- **Cream** `#EFE4D3` — sunny softness; softens mustard's boldness.
**Handle with care:**
- **Neon lime** `#9EF01A` — a yellow-family fight; too loud, too close.
- **Pale grey** `#C7C7C7` — muted-on-muted goes dingy; if you mix, anchor with navy or chocolate.
**Undertones:** glorious on warm and deep undertones. Cool-fair skin: wear it away from the face (bag, boots) or over a white layer.
**Stylist secret:** deep skin tones carry mustard like royalty; fair cools should keep it below the chin.

#### 16. Rust / Terracotta `#A64B2A`
**Vibe:** earthy autumn richness — golden hour, but as a color.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — warm-gallery contrast.
- **Camel** `#C19A6B` — tonal desert sunset.
- **Olive** `#646B49` — the core of every autumn-layering photo.
- **Navy** `#1E2A44` — striking complementary contrast (softened orange + blue).
- **Sage** `#A3B18A` — earthy modern; garden-fresh.
**Handle with care:**
- **Cherry red** `#A51C30` — too-close family competition; reads accidental.
- **Hot pink** `#D0417E` — warm-earth versus cool-neon fight.
**Undertones:** a dream for warm and deep undertones. Cool undertones look great in rust on the bottom half, or with a cool buffer (navy, grey).
**Stylist secret:** rust-colored leather (a bag, boots) gives you the trend without committing a whole garment to it.

#### 17. Lavender `#B99CD8`
**Vibe:** dreamy whimsical — spring picnic, but make it poetic.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — dreamy softness.
- **White** `#F7F4EF` — clean pastel, springtime fresh.
- **Grey** `#9B9B9B` — cool, modern, unexpectedly chic.
- **Navy** `#1E2A44` — tonal depth without harshness.
- **Sage** `#A3B18A` — the pastel garden pairing.
**Handle with care:**
- **Burgundy** `#6B2231` — purple stacked on purple can read "bruise"; keep purples to one per outfit unless you go deliberately tonal.
- **Neon lime** `#9EF01A` — pastel versus neon is an unbalanced fight.
**Undertones:** a cool-undertone dream. Warm undertones look more radiant in orchid or plum (red-based purples) instead.
**Stylist secret:** lavender nails with a grey hoodie — the laziest cool-girl combo in existence.

#### 18. Teal `#2F7676`
**Vibe:** coastal jewel polish — ocean-depth richness.
**Pairs beautifully with:**
- **Cream** `#EFE4D3` — soft contrast that lets the jewel tone shine.
- **Mustard** `#C9A02C` — complementary blue-orange magic, muted enough to actually wear.
- **Camel** `#C19A6B` — earthy-luxe contrast.
- **Burgundy** `#6B2231` — jewel-box richness for winter nights.
- **White** `#F7F4EF` — crisp coastal energy.
**Handle with care:**
- **Emerald** `#0F8A5F` — a cousin clash (near in hue, mismatched in depth and saturation).
- **Mint** `#A8D9C0` — reads like a near-miss green match rather than a choice.
**Undertones:** the rare bridge color that flatters warm AND cool undertones; especially gorgeous on olive and deep skin.
**Stylist secret:** teal is the "both teams" color — when a group chat argues warm vs cool, teal wins for everyone.

#### 19. Mint `#A8D9C0`
**Vibe:** fresh spring breeze — the color equivalent of cold lemonade.
**Pairs beautifully with:**
- **White** `#F7F4EF` — springtime fresh, light and clean.
- **Navy** `#1E2A44` — preppy seaside contrast.
- **Denim** `#5B7C99` — easy, breezy casual.
- **Grey** `#9B9B9B` — cool and calm.
- **Blush** `#E8C4C4` — pastel garden cuteness.
**Handle with care:**
- **Neon lime** `#9EF01A` — tips straight into costume-green territory.
- **Rust** `#A64B2A` (in large doses) — cool pastel versus warm earth is a fight; a small rust accessory is charming though.
**Undertones:** shines on cool and neutral undertones. Warm-fair skin may wash out — swap for a deeper jade `#2F8B6F`.
**Stylist secret:** mint reads freshest in small doses — flats, a mini bag, or a cardigan over cream.

---

## SECTION 2: 15 Curated Outfit Palettes

**How to read:** each palette = 3-5 swatches + a mood, a season, an occasion, why it works, and one real outfit to copy. The last swatch is often the "10% accent" — shoes, bag, or lip.

### 1. Capsule Neutrals
- **Swatches:** Cream `#EFE4D3` · Camel `#C19A6B` · Taupe `#A6937F` · Chocolate `#5C4033`
- **Mood:** warm, calm, "forever pieces"
- **Season:** all year (coziest in fall/winter)
- **Occasion:** work, classes, errands, travel — the everyday uniform
- **Why it works:** four steps of the same warm family = automatic harmony, and tonal depth reads expensive.
- **Try it:** cream fitted knit + camel wide-leg trousers + chocolate loafers + taupe shoulder bag.

### 2. Power Neutral
- **Swatches:** Black `#1B1B1B` · White `#F7F4EF` · Grey `#9B9B9B`
- **Mood:** sharp, confident, boardroom-ready
- **Season:** all
- **Occasion:** interviews, presentations, first days
- **Why it works:** maximal contrast reads decisive; grey softens the black/white severity just enough.
- **Try it:** white button-down + black tailored trousers + grey blazer + black pointed pumps.

### 3. Soft Romance
- **Swatches:** Blush `#E8C4C4` · Cream `#EFE4D3` · Mauve `#B08E9A` · Chocolate `#5C4033` (shoes)
- **Mood:** tender, dreamy, leading-lady
- **Season:** spring/summer (wedding-guest szn)
- **Occasion:** dates, anniversaries, bridal showers
- **Why it works:** three low-saturation pinks stay soft without fading; chocolate grounds it so it never turns cotton-candy.
- **Try it:** blush satin midi skirt + cream knit cardigan + mauve heels + delicate gold jewelry.

### 4. Autumn Layers
- **Swatches:** Rust `#A64B2A` · Mustard `#C9A02C` · Olive `#646B49` · Chocolate `#5C4033` · Cream `#EFE4D3`
- **Mood:** cozy, nostalgic, pumpkin-patch
- **Season:** fall
- **Occasion:** campus, coffee dates, apple picking
- **Why it works:** analogous warm earth tones with the darkest colors anchoring the bottom — the anatomy of every good autumn photo.
- **Try it:** cream tee + mustard oversized cardigan + olive cargo trousers + rust scarf + chocolate ankle boots.

### 5. Summer Breeze
- **Swatches:** White `#F7F4EF` · Sky `#A3C6DD` · Sand `#E8D8BE`
- **Mood:** light, salty, carefree
- **Season:** summer
- **Occasion:** vacation, brunch, beach-town strolls
- **Why it works:** all-light values keep it airy; sky and sand are analogous cool/warm soft tones that never fight.
- **Try it:** white linen midi dress + sky-blue shirt worn open + sand flat sandals + woven straw bag.

### 6. Monochrome Moment
- **Swatches:** Cream `#EFE4D3` · Camel `#C19A6B` · Caramel `#8B5E3C` · Chocolate `#5C4033`
- **Mood:** fashion-forward, elongating, expensive
- **Season:** all
- **Occasion:** city days, gallery nights, any time you want to look 6 feet tall
- **Why it works:** one hue in four values creates an uninterrupted vertical line — the oldest tall-and-chic trick.
- **Try it:** cream bodysuit + caramel satin midi skirt + chocolate knee-high boots + camel coat on top. (Works with any family: all-white, all-grey, all-pink.)

### 7. Riviera Stripe
- **Swatches:** Navy `#1E2A44` · White `#F7F4EF` · Denim `#5B7C99` · Red `#A51C30` (accent)
- **Mood:** nautical, playful, French-summer
- **Season:** late spring/summer
- **Occasion:** city breaks, boat days, brunch
- **Why it works:** the nautical triad, with red as the 10% pop — contrast does the styling for you.
- **Try it:** navy-and-white striped tee + white jeans + red ballet flats + denim jacket tied at the waist.

### 8. Quiet Luxury
- **Swatches:** Off-white `#F3EDE4` · Greige `#D6CBBB` · Taupe `#A6937F` · Espresso `#4A352B`
- **Mood:** hushed, expensive, logo-free
- **Season:** all
- **Occasion:** minimalist office, dinners, travel
- **Why it works:** barely-there tonal steps — the closer the values, the richer the textures need to be (silk, wool, leather).
- **Try it:** off-white silk tee + greige tailored trousers + taupe belt + espresso loafers.

### 9. Midnight Edge
- **Swatches:** Black `#1B1B1B` · Charcoal `#3A3A3F` · Hot pink `#D0417E` (accent)
- **Mood:** bold after-dark
- **Season:** all (best on fall/winter nights)
- **Occasion:** parties, concerts, dates you want to be remembered on
- **Why it works:** a near-black tonal base plus one electric accent = drama without chaos.
- **Try it:** black slip dress + hot pink heels + black leather jacket + silver hoops.

### 10. Pastel Garden
- **Swatches:** Lavender `#B99CD8` · Mint `#A8D9C0` · Blush `#E8C4C4` · Cream `#EFE4D3`
- **Mood:** whimsical, springtime-soft
- **Season:** spring
- **Occasion:** garden parties, picnics, festivals
- **Why it works:** pastels of equal saturation harmonize like watercolors — same softness, different hues.
- **Try it:** lavender knit + cream pleated skirt + mint ballet flats + blush mini bag.

### 11. Winter Jewel Box
- **Swatches:** Burgundy `#6B2231` · Teal `#2F7676` · Navy `#1E2A44` · Mustard-gold `#C9A02C` (accent)
- **Mood:** rich, festive, candlelit
- **Season:** winter/holidays
- **Occasion:** holiday parties, NYE dinners
- **Why it works:** deep jewel tones of matching saturation plus one golden glint — richness without a single neon.
- **Try it:** burgundy velvet top + teal satin midi skirt + navy heels + gold hoops.

### 12. Denim Days
- **Swatches:** Denim `#5B7C99` · White `#F7F4EF` · Camel `#C19A6B` · Red `#A51C30` (accent)
- **Mood:** effortless, off-duty
- **Season:** all
- **Occasion:** weekend errands, casual dates, travel days
- **Why it works:** denim is the neutral, camel is the warm layer, red is the 10% personality — a complete formula.
- **Try it:** white tee + straight-leg jeans + camel cardigan + red canvas sneakers + red lip.

### 13. Sage & Stone
- **Swatches:** Sage `#A3B18A` · Cream `#EFE4D3` · Grey `#9B9B9B` · Chocolate `#5C4033`
- **Mood:** calm, clean, slow-morning
- **Season:** spring/fall
- **Occasion:** study dates, soft office days, weekend coffee
- **Why it works:** muted mid-tones of matching softness, grounded by chocolate so it reads cozy, not washed out.
- **Try it:** sage sweater + cream jeans + grey wool coat + chocolate boots.

### 14. Desert Weekend
- **Swatches:** Rust `#A64B2A` · Camel `#C19A6B` · Cream `#EFE4D3` · Denim `#5B7C99`
- **Mood:** warm, golden, road-trip
- **Season:** late summer/early fall
- **Occasion:** festivals, golden-hour photos, weekend trips
- **Why it works:** a sunset gradient (cream→camel→rust) with denim's cool blue keeping it modern, not costume-y.
- **Try it:** cream tank + rust bias-cut skirt + denim jacket + camel ankle boots.

### 15. Dark Academia Library
- **Swatches:** Burgundy `#6B2231` · Chocolate `#5C4033` · Cream `#EFE4D3` · Charcoal `#3A3A3F`
- **Mood:** scholarly, moody, cozy
- **Season:** winter
- **Occasion:** library dates, museum afternoons, cold-weather classes
- **Why it works:** deep cozy darks plus one candlelight-cream — like a wool blanket you can wear.
- **Try it:** cream cable-knit sweater + burgundy plaid mini skirt + charcoal tights + chocolate boots.

---

## SECTION 3: Color Theory Crash Course (beginner-friendly)

### 3.1 The color wheel in 60 seconds
Picture a clock face made of 12 colors. Three **primaries** (red, yellow, blue) sit like hours 12, 4, and 8. Mixing neighbors makes the three **secondaries** (orange, green, purple), and everything in between is a **tertiary** (like red-orange or blue-green). Two facts actually matter for getting dressed:

1. **Warm side vs cool side.** From yellow through orange to red = the warm half (sunlight, fire, spice). From green through blue to purple = the cool half (water, shade, ice). Green and purple straddle the border — that's why sage reads calm and olive reads warm.
2. **Hue is only one dial.** Every color also has a **value** (light-to-dark) and a **saturation** (bright-to-muted). Most "clashing" outfits don't actually fight on hue — they fight on value or saturation (a neon top next to a dusty pastel, or five mid-tones with no anchor). Match those two dials and even weird hue combos start working.

### 3.2 The four beginner-proof schemes (with clothing examples)

**1) Complementary — "opposites attract."** Colors directly across the wheel: blue↔orange, purple↔yellow, red↔green. Highest energy, biggest wow.
- *Clothing examples:* navy coat + rust sweater · lavender top + mustard cardigan · burgundy sweater + sage trousers.
- *Big-sis tip:* complementary pairs are loud by nature — mute at least one side (rust, not neon orange) and keep the 60-30-10 rule (below) so they don't fight.

**2) Analogous — "next-door neighbors."** Two or three colors sitting side by side on the wheel. Always harmonious because they share undertones.
- *Clothing examples:* blush + mauve + burgundy (the pink-to-red family) · olive + sage + cream · navy + denim + teal (the blue family).
- *Big-sis tip:* to keep it from going flat, vary the values — go light-to-dark within the family, not three of the same depth.

**3) Monochromatic — "one color, many shades."** A single hue from its palest to darkest version.
- *Clothing examples:* cream + camel + chocolate (the brown ladder) · blush top + mauve cardigan + plum bag · light grey + charcoal.
- *Big-sis tip:* vary textures (satin, knit, leather) so the one-color look reads rich instead of flat. This is also the single most elongating way to dress.

**4) Neutral-based — "the real-life formula."** Neutrals do 90% of the work; one statement color pops.
- *Clothing examples:* white tee + jeans + red flats · cream sweater + camel trousers + hot pink bag.
- *Big-sis tip:* this is the scheme behind almost every outfit you've ever saved on Pinterest. When in doubt, you're one neutral + one statement away from a good outfit.

### 3.3 The 60-30-10 rule (with a concrete example)
Borrowed from interior design: **60% dominant color, 30% secondary, 10% accent.**

- **Concrete example — "First day of class":** navy sweater dress = 60% · light denim jacket = 30% · red ballet flats + red lip = 10%. The red is the punctuation mark, not the paragraph — that's why it looks chic instead of clownish.
- **Second example:** grey wool coat + grey trousers = 60% · black turtleneck = 30% · burgundy bag = 10%.
- *Big-sis note:* it's not literal math — eyeball it. When an outfit feels "too much," shrink the 10% (swap the bright trousers for bright shoes). When it feels boring, grow it.

### 3.4 Neutral vs statement colors
- **The neutral team (they recede, they mix, they never argue):** black, white, grey, navy, denim, beige/cream, brown, camel — plus honorary muted members olive, sage and taupe.
- **The statement team (they demand attention):** red, hot pink, mustard, rust, teal, lavender, mint, and anything neon-bright.
- **The foolproof formula:** 2 neutrals + 1 statement. That's it. That's the whole cheat code.
- **The advanced move:** two statements only when one of them is ≤10% of the outfit (a burgundy bag with a teal dress).

### 3.5 Warm vs cool undertones — the 3-step quick check
1. **Set the scene:** natural daylight, no makeup, no filter.
2. **Vein peek:** look at the inside of your wrist. Blue or purple veins → cool. Green veins → warm. Genuinely can't tell → neutral (the lucky middle).
3. **Jewelry confirm:** hold gold, then silver, near your face. Gold brightens you → warm. Silver brightens you → cool. Both work → neutral.

That's the 60-second version — the full guide (with the white-paper test and your flattering color families) is Section 5.

---

## SECTION 4: Rules of Thumb — 10 memorable laws

1. **Three colors max — neutrals count.** Above three, the eye doesn't know where to land. (60-30-10 is how you split them.)
2. **When in doubt, go tonal.** One color family, three depths — cream, camel, chocolate. Impossible to get wrong, instantly expensive.
3. **Denim goes with almost everything.** Treat jeans as a blue-grey neutral: if the outfit would work with grey trousers, it works with denim.
4. **Two neutrals + one statement = the can't-fail formula.** Camel trousers + white tee + red flats. Done before you've even finished your coffee.
5. **Match your leathers — and pick one metal.** Shoes, belt, bag in the same brown/black family; gold OR silver jewelry, not both.
6. **Echo a color twice.** Red lip ↔ red flats · bag ↔ scarf. One echo makes an outfit look planned; zero echoes makes it look assembled in the dark.
7. **Match saturation, not just hue.** Soft with soft (pastels + cream), bold with bold (or bold + neutral). And when two colors fight, break them up with a white or cream bridge — a tee, a scarf, sneakers.
8. **Light near the face, dark toward the feet.** It brightens your complexion and visually elongates you — the laziest slimming trick that actually works.
9. **Navy is the friendlier daytime black.** Same authority, gentler on warm undertones, chicer with camel.
10. **Your skin is a color too.** What sits next to your face matters most. A color that fights you usually still works on the bottom half or in a bag — move it, don't bin it.

---

## SECTION 5: Skin Undertone Guide — find your flattering families

### 5.1 The three self-tests (all in natural daylight, bare-faced)

**Test 1 — The vein test.**
1. Turn your wrist up in daylight.
2. Look at the veins on the inside of your wrist.
3. Blue/purple → cool. Green → warm. Blue-ish AND green-ish, or genuinely unsure → neutral.

**Test 2 — The jewelry test.**
1. Take one gold and one silver piece (or hold gold and silver foil/paper).
2. Hold each near your face, one at a time.
3. Gold makes your skin glow → warm. Silver → cool. Honestly both → neutral.

**Test 3 — The white paper test.**
1. Hold a sheet of pure white paper next to your bare face in daylight (hair tied back).
2. Compare your complexion in a mirror.
3. Face looks pinkish/fresher → cool. Yellowish/duller → warm. Basically unchanged → neutral.

**Scoring:** 2+ tests agreeing = your answer. (Bonus signal: in the sun you burn fast and rarely tan → often cool; you tan golden easily → often warm.)

### 5.2 Which families flatter you

**Warm undertones (gold jewelry, green veins, golden tan) — you glow in:**
- Camel `#C19A6B` · Cream `#EFE4D3` · Chocolate `#5C4033` · Olive `#646B49` · Mustard `#C9A02C` · Rust `#A64B2A` · Coral `#E86A50` · Peach `#F6C3A5` · Tomato red `#C63D2F` · warm golden greens and golden jewelry.
- *Handle with care:* icy pastels, cool grey, optic white (wear ivory instead), and hot-pink-level neons close to your face — they can read harsh against golden skin.

**Cool undertones (silver jewelry, blue/purple veins, burn-first) — you glow in:**
- Navy `#1E2A44` · Blush `#E8C4C4` · Hot pink `#D0417E` · Crimson `#A51C30` · Burgundy `#6B2231` · Lavender `#B99CD8` · Mint `#A8D9C0` · Grey `#9B9B9B` · True white `#FFFFFF` · Emerald `#0F8A5F` · Icy pastels · silver jewelry.
- *Handle with care:* mustard and rust near the face (they can go sallow), olive, and muddy warm beiges — swap beige for cream + grey.

**Neutral undertones (both metals, ambiguous veins — the diplomatic middle):**
- Almost everything works; you're the reason "universal" colors exist. Power picks: teal `#2F7676`, sage `#A3B18A`, navy, and any red whose undertone you match to your mood.
- *Your one caution:* very low-contrast outfits (pale on pale) can wash you out — keep one anchoring dark piece.

**Bonus notes:**
- **Deep skin tones:** the brightest jewels are yours — fuchsia, emerald, cobalt `#2E5FA3`, saffron, crisp white. Only caution: mid-tone murky shades that are almost exactly your skin depth can look accidental — go lighter or much brighter instead.
- **Olive skin (warm with a green cast):** the earth family adores you (olive, rust, camel), and emerald/teal/crimson pop beautifully. Watch out for grey-beige taupes that gray you out.

### 5.3 The pep-talk fine print
Undertones are a compass, not a cage. If a "wrong" color makes you happy, wear it — fix the *placement* (bottom half, bag, away from the face) or the *dose* (10% accent), not your joy. The most flattering thing in any outfit has always been the girl who clearly likes what she's wearing.

---

## Appendix A: Extended Hex Glossary
Every hex used in this document, beyond the 19 core colors:

| Color | Hex | Used for |
|---|---|---|
| Optic white | `#FFFFFF` | avoid-entry (white/cream clash), cool-undertone pick |
| Off-white | `#F3EDE4` | Quiet Luxury palette |
| Icy pale grey | `#C9CED6` | avoid-entry (washed-out white combo) |
| Pale grey | `#C7C7C7` | avoid-entry (mustard dinginess) |
| Warm beige | `#D9CDBF` | avoid-entry (grey greige-trap) |
| Espresso | `#4A352B` | avoid-entry (black clash), Quiet Luxury |
| Charcoal | `#3A3A3F` | Midnight Edge, Dark Academia |
| Taupe | `#A6937F` | Capsule Neutrals, Quiet Luxury |
| Greige | `#D6CBBB` | Quiet Luxury |
| Sand | `#E8D8BE` | Summer Breeze |
| Caramel | `#8B5E3C` | Monochrome ladder step |
| Sky | `#A3C6DD` | Summer Breeze |
| Mauve | `#B08E9A` | Soft Romance |
| Emerald | `#0F8A5F` | avoid-entries, cool-undertone pick |
| Neon lime | `#9EF01A` | avoid-entries (the universal clasher) |
| Coral | `#E86A50` | warm-undertone pick |
| Peach | `#F6C3A5` | warm-undertone pick |
| Tomato red | `#C63D2F` | warm-undertone red |
| Plum | `#5C3752` | monochrome example (pink family) |
| Cobalt | `#2E5FA3` | deep-skin pick |
| Jade | `#2F8B6F` | mint alternative for warm undertones |

## Appendix B: Implementation notes (for the dev team)

**Color record schema (describes Section 1):**
| Field | Type | Example |
|---|---|---|
| `id` / `name` | string | `camel` / "Camel" |
| `hex` | string | `#C19A6B` |
| `vibe` | short string | "old money classic" |
| `pairs[]` | array of `{id, hex, why}` (≤140 chars why) | navy → "preppy luxe…" |
| `cautions[]` | array of `{hex, why, rescue}` | mustard → "both yellow-based…" |
| `undertones` | `{warm, cool, neutral}` short flags/notes | "warm & deep-neutral" |
| `stylist_secret` | short string (nullable) | "a camel coat is…" |

**Palettes (Section 2):** `{name, mood, season, occasion, swatches[{hex, name?}], why, outfit_example}` — last swatch is often the 10% accent; render it smaller or with an "accent" chip.

**Engine logic:**
- Render `pairs` bidirectionally (union of both directions, per color), but keep `cautions` directional — they describe one specific context.
- 60-30-10 + "3 colors max" make a natural "outfit checker" feature; Section 4's rules are ready-made tip cards.
- Section 5 is a 3-question quiz (veins → jewelry → paper) that filters Section 1 by the `undertones` field and surfaces "glow" vs "handle with care" swatch rows.
- Editorial voice: second person, ≤140 chars per micro-tip, never "don't" — always "handle with care + rescue."

**UI alignment (per DESIGN_BRIEF):** the Color Combos pillar accent is Terracotta `#C97B58` on tint `#F7E9E0`; the core swatches in this doc (rust `#A64B2A`, camel `#C19A6B`, cream `#EFE4D3`, sage `#A3B18A`) already sit inside the app's warm-minimal world, so content hexes and UI chrome won't fight each other.

---

> **Final pep talk:** Nobody is "good with colors." People are *practiced* with colors — and you just swallowed the whole shortcut sheet. Start with the two-neutrals-plus-one-statement formula this week, steal one palette from Section 2 verbatim, and check your undertone once (it takes a minute). Within a month you'll be the friend everyone texts at 7 a.m. — except you'll already be dressed. You've got this, and honestly, you always did.
