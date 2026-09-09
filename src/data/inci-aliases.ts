/* ============================================================
   AURELIA — INCI alias table (label scanner)
   ------------------------------------------------------------
   Maps real-world INCI names (and their OCR-mangled cousins)
   onto the 12 actives the conflict matrix knows, plus
   non-active "flags" (drying alcohols, fragrance + allergens,
   essential oils) worth surfacing on any label.
   Sources: INCI nomenclature as printed on cosmetic labels
   (FDA/PCPC INCI conventions; EU CosIng spellings included).
   ============================================================ */

import type { Slot } from "./actives";

export type ActiveId =
  | "vitamin-c"
  | "niacinamide"
  | "retinol"
  | "bha"
  | "aha-glycolic"
  | "aha-lactic"
  | "azelaic"
  | "benzoyl"
  | "hyaluronic"
  | "peptides"
  | "ceramides"
  | "spf";

export interface ActiveAlias {
  id: ActiveId;
  /** full-name matches (fuzzy-matchable — OCR noise tolerant) */
  exact: string[];
  /** substring matches (structural — e.g. every hyaluronate) */
  contains?: string[];
  /** prefix/pattern matches for ingredient families */
  patterns?: RegExp[];
}

export const activeAliases: ActiveAlias[] = [
  {
    id: "vitamin-c",
    exact: [
      "ascorbic acid", "l-ascorbic acid", "sodium ascorbate", "sodium ascorbyl phosphate",
      "ascorbyl glucoside", "ethyl ascorbic acid", "3-o-ethyl ascorbic acid", "ethylascorbic acid",
      "tetrahexyldecyl ascorbate", "ascorbyl tetraisopalmitate", "ascorbyl palmitate",
    ],
    contains: ["ascorb"],
  },
  {
    id: "retinol",
    exact: [
      "retinol", "retinal", "retinaldehyde", "retinyl acetate", "retinyl palmitate",
      "retinyl propionate", "hydroxypinacolone retinoate", "adapalene", "tretinoin",
    ],
    contains: ["retin"],
  },
  {
    id: "niacinamide",
    exact: ["niacinamide", "nicotinamide"],
  },
  {
    id: "bha",
    exact: ["salicylic acid", "betaine salicylate", "salicylic"],
    contains: ["salicyl"],
  },
  {
    id: "aha-glycolic",
    exact: ["glycolic acid", "ammonium glycolate"],
    contains: ["glycol"],
  },
  {
    id: "aha-lactic",
    exact: ["lactic acid", "sodium lactate", "ammonium lactate"],
    contains: ["lact"],
  },
  {
    id: "azelaic",
    exact: ["azelaic acid", "potassium azeloyl diglycinate"],
    contains: ["azel"],
  },
  {
    id: "benzoyl",
    exact: ["benzoyl peroxide"],
  },
  {
    id: "hyaluronic",
    exact: ["hyaluronic acid", "sodium hyaluronate"],
    contains: ["hyaluron"],
  },
  {
    id: "peptides",
    exact: ["carnosine", "matrixyl", "sh-oligopeptide", "sh-polypeptide"],
    contains: ["peptide", "carnosine", "matrixyl"],
    patterns: [/^(palmitoyl|acetyl|copper|nonapeptide|decapeptide|hexapeptide|pentapeptide|tetrapeptide|tripeptide|oligopeptide|polypeptide|bipeptide|dipeptide)/],
  },
  {
    id: "ceramides",
    exact: ["ceramide np", "ceramide ap", "ceramide eop", "ceramide ng", "ceramide ns", "ceramide eos", "ceramide"],
    contains: ["ceramide"],
  },
  {
    id: "spf",
    exact: [
      "zinc oxide", "titanium dioxide", "avobenzone", "octinoxate", "octocrylene",
      "homosalate", "octisalate", "ensulizole", "ecamsule", "bisoctrizole", "bemotrizinol",
      "diethylamino hydroxybenzoyl hexyl benzoate", "ethylhexyl triazone", "drometrizole trisiloxane",
    ],
    contains: ["methoxycinnamate", "benzophenone-", "tinosorb", "mexoryl", "uvinul", "sunglass"],
  },
];

/* ---- non-active flags: things worth calling out that the matrix doesn't model ---- */

export type FlagKind = "alcohol" | "fragrance" | "essential-oil";

export interface FlagAlias {
  kind: FlagKind;
  exact: string[];
  contains?: string[];
  patterns?: RegExp[];
  note: string;
}

export const flagAliases: FlagAlias[] = [
  {
    kind: "alcohol",
    exact: ["alcohol denat", "sd alcohol 40", "isopropyl alcohol", "denatured alcohol", "ethanol"],
    contains: ["alcohol denat"],
    note: "High content of drying alcohol — can sting on a compromised or dry barrier.",
  },
  {
    kind: "fragrance",
    exact: [
      "fragrance", "parfum", "aroma", "flavor", "perfume",
      "linalool", "limonene", "citronellol", "geraniol", "eugenol", "citral",
      "coumarin", "benzyl salicylate", "benzyl alcohol",
    ],
    contains: ["fragrance", "parfum"],
    note: "Fragrance or a listed fragrance allergen — the most common sensitivity trigger on labels.",
  },
  {
    kind: "essential-oil",
    exact: ["tea tree oil", "lavender oil", "peppermint oil", "eucalyptus oil", "rosemary oil"],
    contains: ["essential oil"],
    patterns: [/\b(lavender|tea tree|peppermint|eucalyptus|rosemary|geranium|ylang|bergamot|orange|lemon|grapefruit|citrus|clove|cinnamon)\s+oil\b/],
    note: "Essential oil — natural, but a frequent sensitiser over time (EU requires allergen labelling).",
  },
];

/* header lines / packaging noise the splitter should drop */
export const INCI_HEADER_PATTERN = /\b(ingredients?|inci|composition|contains)\b\s*[:：]?/i;

export const SLOT_LABEL: Record<Slot, string> = { am: "AM", pm: "PM" };
