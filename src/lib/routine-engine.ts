/* ============================================================
   AURELIA — Routine Sequencer (Ingredient Lab engine)
   ------------------------------------------------------------
   Given a set of selected actives:
     · detects every pairwise conflict (both directions)
     · assigns actives to AM / PM slots
     · orders them: low pH first, humectant/repair last,
       SPF always the final morning step
     · surfaces wait-time + beginner notes
   Pure + deterministic → SSR safe.
   ============================================================ */

import { actives, activeById, type Active, type ActiveConflict } from "@/data/actives";

export interface DetectedConflict extends ActiveConflict {
  a: string; // display name
  b: string;
  aid: string;
  bid: string;
}

export interface RoutineStep {
  active: Active;
  wait?: string; // e.g. "wait 5 min"
}

export interface RoutinePlan {
  am: RoutineStep[];
  pm: RoutineStep[];
  conflicts: DetectedConflict[];
  synergies: { a: string; b: string; why: string }[];
  notes: string[];
  status: "clear" | "careful" | "conflict";
}

const HUMECTANTS = new Set(["hyaluronic", "ceramides", "peptides"]);

export function buildRoutine(selectedIds: string[]): RoutinePlan {
  const selected = selectedIds.map((id) => activeById(id)).filter((a): a is Active => Boolean(a));

  /* ---- conflicts (deduped, both directions) ---- */
  const seen = new Set<string>();
  const conflicts: DetectedConflict[] = [];
  for (const a of selected) {
    for (const c of a.conflicts) {
      if (!selectedIds.includes(c.with)) continue;
      const key = [a.id, c.with].sort().join("|") + ":" + c.severity;
      if (seen.has(key)) continue;
      seen.add(key);
      const other = activeById(c.with);
      conflicts.push({
        ...c,
        aid: a.id,
        bid: c.with,
        a: a.name,
        b: other?.name ?? c.with,
      });
    }
  }
  conflicts.sort((x, y) => (x.severity === "avoid" ? -1 : 1) - (y.severity === "avoid" ? -1 : 1));

  /* ---- synergies ---- */
  const synSeen = new Set<string>();
  const synergies: { a: string; b: string; why: string }[] = [];
  for (const a of selected) {
    for (const s of a.synergies) {
      if (!selectedIds.includes(s.with)) continue;
      const key = [a.id, s.with].sort().join("|");
      if (synSeen.has(key)) continue;
      synSeen.add(key);
      synergies.push({ a: a.short, b: activeById(s.with)?.short ?? s.with, why: s.why });
    }
  }

  /* ---- slot assignment ---- */
  const am: Active[] = [];
  const pm: Active[] = [];
  const both = new Set<string>();
  for (const a of selected) {
    if (a.slots.includes("am") && a.slots.includes("pm")) both.add(a.id);
    else if (a.slots.includes("am")) am.push(a);
    else pm.push(a);
  }
  /* flexibles go to the emptier side */
  for (const id of both) {
    const a = activeById(id)!;
    const target = am.length <= pm.length ? am : pm;
    target.push(a);
  }

  const order = (list: Active[], slot: "am" | "pm"): RoutineStep[] => {
    const exfoliants = list.filter((a) => a.id.startsWith("aha") || a.id === "bha");
    const rest = list.filter((a) => !exfoliants.includes(a));
    /* actives by pH ascending, humectants/repair at the end, SPF last of all */
    const sortPh = (x: Active, y: Active) => x.ph - y.ph;
    const activesSorted = rest.filter((a) => !HUMECTANTS.has(a.id) && a.id !== "spf").sort(sortPh);
    const humectants = rest.filter((a) => HUMECTANTS.has(a.id)).sort(sortPh);
    const spf = slot === "am" ? rest.filter((a) => a.id === "spf") : [];

    const steps: RoutineStep[] = exfoliants.sort(sortPh).map((a) => ({
      active: a,
      wait: a.id.startsWith("aha") ? "wait 10-15 min" : a.id === "bha" ? "wait 5-10 min" : undefined,
    }));
    steps.push(...activesSorted.map((a) => ({ active: a, wait: a.id === "retinol" ? "apply to dry skin" : undefined })));
    steps.push(...humectants.map((a) => ({ active: a, wait: a.id === "hyaluronic" ? "on damp skin" : undefined })));
    steps.push(...spf.map((a) => ({ active: a, wait: "final step, 2-finger amount" })));
    return steps;
  };

  const notes: string[] = [];
  const amExfoliants = am.filter((a) => a.id.startsWith("aha") || a.id === "bha");
  if (amExfoliants.length > 0) notes.push("Acids landed in your morning slot — that's unusual. They're safest at night; SPF is non-negotiable.");
  const pmExfoliants = pm.filter((a) => a.id.startsWith("aha") || a.id === "bha");
  const pmRetinol = pm.some((a) => a.id === "retinol");
  if (pmExfoliants.length > 0 && pmRetinol) notes.push("You have both an exfoliant and retinol at night — run them on alternating nights, never the same one.");
  const total = am.length + pm.length;
  if (am.length > 4) notes.push("That's a lot for one morning — a routine you'll actually keep beats a 6-step science project.");
  if (pm.length > 4) notes.push("Consider moving a PM active to the morning (or out) — simplicity is a feature.");
  if (total === 0) notes.push("Pick at least two actives below to see how they choreograph.");

  const status: RoutinePlan["status"] = conflicts.some((c) => c.severity === "avoid") ? "conflict" : conflicts.length > 0 ? "careful" : "clear";

  return { am: order(am, "am"), pm: order(pm, "pm"), conflicts, synergies, notes, status };
}

export { actives };
