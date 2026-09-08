/* ============================================================
   AURELIA — Face Geometry Engine
   ------------------------------------------------------------
   Classic anthropometric ratios (length / cheekbone, forehead
   and jaw taper) → score-matched against 6 shape archetypes.
   Pure + deterministic → SSR safe.
   ============================================================ */

export interface FaceMeasurements {
  length: number; // hairline → chin
  forehead: number; // widest across forehead
  cheekbone: number; // widest across cheekbones
  jaw: number; // widest across jaw
}

export type FaceShapeId = "oval" | "round" | "square" | "heart" | "long" | "diamond";

export interface FaceClassification {
  shape: FaceShapeId;
  confidence: number; // 0-1
  ratios: { length: number; forehead: number; jaw: number };
  ranked: { id: FaceShapeId; score: number }[];
}

const near = (v: number, target: number, tol: number): number =>
  tol <= 0 ? 0 : Math.max(0, 1 - Math.abs(v - target) / tol);

const below = (v: number, edge: number, falloff: number): number =>
  v <= edge ? 1 : Math.max(0, 1 - (v - edge) / falloff);

const above = (v: number, edge: number, falloff: number): number =>
  v >= edge ? 1 : Math.max(0, 1 - (edge - v) / falloff);

export function classifyFaceShape(m: FaceMeasurements): FaceClassification {
  const C = Math.max(1, m.cheekbone);
  const LR = m.length / C; // length ratio
  const FR = m.forehead / C; // forehead ratio
  const JR = m.jaw / C; // jaw ratio

  const scores: Record<FaceShapeId, number> = {
    oval:
      near(LR, 1.48, 0.22) * 0.5 +
      near(JR, 0.84, 0.2) * 0.25 +
      near(FR, 0.94, 0.14) * 0.25,
    round:
      below(LR, 1.32, 0.16) * 0.55 +
      near(JR, 0.88, 0.18) * 0.25 +
      near(FR, 0.95, 0.2) * 0.2,
    square:
      below(LR, 1.38, 0.2) * 0.35 +
      above(JR, 0.94, 0.18) * 0.4 +
      near(FR, 0.98, 0.16) * 0.25,
    heart:
      above(FR, 1.02, 0.14) * 0.4 +
      below(JR, 0.8, 0.15) * 0.4 +
      near(LR, 1.45, 0.35) * 0.2,
    long:
      above(LR, 1.66, 0.3) * 0.7 +
      near(JR, 0.85, 0.3) * 0.15 +
      near(FR, 0.95, 0.3) * 0.15,
    diamond:
      below(FR, 0.9, 0.14) * 0.35 +
      below(JR, 0.84, 0.14) * 0.35 +
      near(LR, 1.48, 0.3) * 0.3,
  };

  const ranked = (Object.keys(scores) as FaceShapeId[])
    .map((id) => ({ id, score: scores[id] }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  const confidence = Math.max(0.35, Math.min(0.97, best.score > 0 ? 1 - Math.max(0, second.score) / Math.max(0.05, best.score) * 0.6 : 0.35));

  return {
    shape: best.id,
    confidence,
    ratios: { length: Math.round(LR * 100) / 100, forehead: Math.round(FR * 100) / 100, jaw: Math.round(JR * 100) / 100 },
    ranked,
  };
}

/* ---------- shape → recommended master styles (from research KB) ---------- */

export const shapeStyleMap: Record<FaceShapeId, { yes: string[]; why: string; avoid: string }> = {
  oval: {
    yes: ["sleek-high-pony", "halo-braid", "claw-twist", "half-up"],
    why: "You're balanced — nearly everything works. These show off the symmetry.",
    avoid: "Heavy full-coverage blunt bangs hide your best feature — the balance itself.",
  },
  round: {
    yes: ["sleek-high-pony", "fishtail", "heatless-curls", "bubble-pony"],
    why: "Height and length draw the eye up and down, not side to side.",
    avoid: "Chin-length bobs and puffed volume at the cheeks — both add width.",
  },
  square: {
    yes: ["heatless-curls", "messy-bun", "fishtail", "half-up"],
    why: "Waves curve exactly where your angles are — softness by design.",
    avoid: "Razor-straight centre parts and stick-flat hair that trace every angle.",
  },
  heart: {
    yes: ["half-up", "fishtail", "messy-bun", "claw-twist"],
    why: "Weight at the jaw balances the wider forehead.",
    avoid: "Tight slicked-back ponys with no front pieces — they exaggerate the top-heavy triangle.",
  },
  long: {
    yes: ["space-buns", "half-up", "heatless-curls", "claw-twist"],
    why: "Width at the sides and top corners visually shortens the face.",
    avoid: "Very high tight ponytails and long flat middle parts — both stretch the face.",
  },
  diamond: {
    yes: ["half-up", "halo-braid", "space-buns", "heatless-curls"],
    why: "Width at the temples + cheekbones on display = pure geometry flattery.",
    avoid: "Super-slicked-back styles with zero volume — they narrow you further.",
  },
};

export const shapeNames: Record<FaceShapeId, string> = {
  oval: "Oval",
  round: "Round",
  square: "Square",
  heart: "Heart",
  long: "Long / Oblong",
  diamond: "Diamond",
};
