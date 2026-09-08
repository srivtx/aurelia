/* ============================================================
   AURELIA — Active Ingredients: structured interaction data
   ------------------------------------------------------------
   Evidence-based conflict/synergy matrix for common actives,
   with pH, preferred slot (AM/PM) and photosensitivity.
   Sources: general dermatological layering guidance
   (thin→thick, low pH first, SPF last, alternate irritation
   actives on different nights).
   ============================================================ */

export type Slot = "am" | "pm";

export interface ActiveConflict {
  with: string; // active id
  severity: "avoid" | "warn";
  why: string;
}

export interface Active {
  id: string;
  name: string;
  short: string;
  ph: number; // typical pH
  slots: Slot[]; // preferred time(s)
  photosensitive: boolean;
  note: string; // one-line usage wisdom
  conflicts: ActiveConflict[];
  synergies: { with: string; why: string }[];
}

export const actives: Active[] = [
  {
    id: "vitamin-c",
    name: "Vitamin C (LAA)",
    short: "Vit C",
    ph: 3.2,
    slots: ["am"],
    photosensitive: false,
    note: "AM under SPF — it boosts your sunscreen. Start at 5-10%.",
    conflicts: [
      { with: "benzoyl", severity: "avoid", why: "Benzoyl peroxide oxidizes pure vitamin C on contact — they neutralize each other. Use C in the morning, BP at night." },
      { with: "retinol", severity: "warn", why: "Different pH sweet-spots can destabilize both — easiest fix: vitamin C AM, retinol PM (the classic split)." },
      { with: "peptides", severity: "warn", why: "Very low-pH LAA can affect some peptide formulas — fine if separated by a moisturizer layer." },
    ],
    synergies: [
      { with: "spf", why: "Antioxidant + SPF protect as a team — C boosts UV defense." },
      { with: "niacinamide", why: "The old 'never mix' rule is debunked — modern formulas layer fine, and niacinamide calms." },
    ],
  },
  {
    id: "niacinamide",
    name: "Niacinamide",
    short: "Niacinamide",
    ph: 5.5,
    slots: ["am", "pm"],
    photosensitive: false,
    note: "The diplomat — plays with almost everything, 4-5% is plenty.",
    conflicts: [],
    synergies: [
      { with: "retinol", why: "Shown to reduce retinoid irritation and barrier damage — a perfect buffer." },
      { with: "bha", why: "Calms the flush acids can cause." },
    ],
  },
  {
    id: "retinol",
    name: "Retinol / Retinal",
    short: "Retinol",
    ph: 5.8,
    slots: ["pm"],
    photosensitive: true,
    note: "PM only, on dry skin, start 2 nights a week. SPF is mandatory.",
    conflicts: [
      { with: "aha-glycolic", severity: "avoid", why: "Two turnover speeders at once = peeling and barrier damage. Alternate nights instead." },
      { with: "aha-lactic", severity: "warn", why: "Gentler, but still alternate nights — or sandwich: moisturizer → retinol → moisturizer." },
      { with: "bha", severity: "warn", why: "Alternate nights. If you must, BHA first, wait, then buffered retinol." },
      { with: "benzoyl", severity: "warn", why: "Classic retinol degrades next to BP (adapalene is the stable exception). Split AM/PM." },
    ],
    synergies: [
      { with: "niacinamide", why: "Niacinamide buffers irritation — stack freely." },
      { with: "peptides", why: "Peptide moisturizer buffers retinol beautifully (sandwich method)." },
      { with: "hyaluronic", why: "HA layer underneath keeps retinol nights comfortable." },
    ],
  },
  {
    id: "bha",
    name: "Salicylic Acid (BHA)",
    short: "BHA",
    ph: 3.2,
    slots: ["pm"],
    photosensitive: true,
    note: "2-3 nights a week. The oil-soluble one — cleans inside pores.",
    conflicts: [
      { with: "aha-glycolic", severity: "avoid", why: "Double exfoliation strips the barrier — pick ONE acid per night." },
      { with: "aha-lactic", severity: "warn", why: "Milder combo, still one acid per night is the rule." },
      { with: "retinol", severity: "warn", why: "Alternate nights — see retinol." },
    ],
    synergies: [{ with: "niacinamide", why: "Niacinamide offsets the flush and rebalances oil." }],
  },
  {
    id: "aha-glycolic",
    name: "Glycolic Acid (AHA)",
    short: "Glycolic",
    ph: 3.5,
    slots: ["pm"],
    photosensitive: true,
    note: "1-2 nights a week, SPF daily — the glow is real, so is the sensitivity.",
    conflicts: [
      { with: "bha", severity: "avoid", why: "One exfoliant per night — over-exfoliation is the #1 beginner injury." },
      { with: "retinol", severity: "avoid", why: "Alternate nights. Glycolic + retinol same night is a peeling recipe." },
      { with: "aha-lactic", severity: "warn", why: "Same family — no benefit to stacking, split the nights." },
    ],
    synergies: [{ with: "hyaluronic", why: "HA right after acids re-hydrates the fresh surface." }],
  },
  {
    id: "aha-lactic",
    name: "Lactic Acid (AHA)",
    short: "Lactic",
    ph: 3.8,
    slots: ["pm"],
    photosensitive: true,
    note: "The gentlest acid — 1 night a week to start.",
    conflicts: [
      { with: "aha-glycolic", severity: "warn", why: "Same family — alternate nights." },
      { with: "bha", severity: "warn", why: "Alternate nights." },
      { with: "retinol", severity: "warn", why: "Alternate nights — lactic is gentle but not gentle enough to stack." },
    ],
    synergies: [{ with: "hyaluronic", why: "Lactic is mildly hydrating; HA seals the comfort." }],
  },
  {
    id: "azelaic",
    name: "Azelaic Acid",
    short: "Azelaic",
    ph: 4.5,
    slots: ["am", "pm"],
    photosensitive: false,
    note: "The peacemaker — gentle, pregnancy-safe, loves acne AND redness.",
    conflicts: [],
    synergies: [
      { with: "vitamin-c", why: "Both brighten via different paths — a strong dark-mark duo." },
      { with: "retinol", why: "Azelaic is so tolerant it can sit in the same routine." },
    ],
  },
  {
    id: "benzoyl",
    name: "Benzoyl Peroxide",
    short: "BP",
    ph: 3.5,
    slots: ["am", "pm"],
    photosensitive: false,
    note: "Spot-killer for inflammatory pimples — it bleaches fabrics, mind your pillowcase.",
    conflicts: [
      { with: "vitamin-c", severity: "avoid", why: "BP oxidizes vitamin C — split AM/PM." },
      { with: "retinol", severity: "warn", why: "Classic retinol degrades with BP (adapalene doesn't). Split AM/PM." },
      { with: "aha-glycolic", severity: "warn", why: "Both can dry — watch for flaking; alternate nights." },
    ],
    synergies: [{ with: "niacinamide", why: "Niacinamide keeps the barrier calm under BP's drying power." }],
  },
  {
    id: "hyaluronic",
    name: "Hyaluronic Acid",
    short: "HA",
    ph: 5.5,
    slots: ["am", "pm"],
    photosensitive: false,
    note: "Apply to DAMP skin, then seal with moisturizer — or it backfires in dry air.",
    conflicts: [],
    synergies: [
      { with: "retinol", why: "A hydration layer under retinol = comfort." },
      { with: "aha-glycolic", why: "Re-hydrates right after exfoliating." },
    ],
  },
  {
    id: "peptides",
    name: "Peptides",
    short: "Peptides",
    ph: 5.8,
    slots: ["am", "pm"],
    photosensitive: false,
    note: "Firmness support — gentle enough for every day.",
    conflicts: [{ with: "vitamin-c", severity: "warn", why: "Very low pH can affect some peptides — separate with a moisturizer layer." }],
    synergies: [
      { with: "retinol", why: "Buffer + repair in one." },
      { with: "ceramides", why: "The barrier-repair dream team." },
    ],
  },
  {
    id: "ceramides",
    name: "Ceramides",
    short: "Ceramides",
    ph: 5.5,
    slots: ["am", "pm"],
    photosensitive: false,
    note: "Barrier bricks — the more the merrier, especially after acids.",
    conflicts: [],
    synergies: [
      { with: "retinol", why: "The 'sandwich' moisturizer IS the ceramide layer." },
      { with: "peptides", why: "Barrier + firmness in one routine." },
    ],
  },
  {
    id: "spf",
    name: "Sunscreen SPF 30+",
    short: "SPF",
    ph: 6.5,
    slots: ["am"],
    photosensitive: false,
    note: "Every morning, last step, 2-finger rule. The best anti-aging product ever made.",
    conflicts: [],
    synergies: [{ with: "vitamin-c", why: "C underneath boosts UV protection." }],
  },
];

export const activeById = (id: string): Active | undefined => actives.find((a) => a.id === id);
