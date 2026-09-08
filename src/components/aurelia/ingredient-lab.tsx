"use client";

/* ============================================================
   AURELIA — Ingredient Lab (Mix & Match)
   Toggle actives → live conflict matrix + AM/PM sequencing.
   The routine engine's math, made visible.
   ============================================================ */

import { useMemo, useState } from "react";
import { buildRoutine, type RoutinePlan, type RoutineStep } from "@/lib/routine-engine";
import { actives } from "@/data/actives";
import { Card, Chip, Eyebrow } from "./bits";
import { SunriseIcon, MoonStarIcon, AlertIcon, CheckIcon, FlaskIcon } from "./icons";

const STATUS_META: Record<RoutinePlan["status"], { label: string; color: string; bg: string }> = {
  clear: { label: "Clear to stack", color: "var(--success)", bg: "var(--sage-soft)" },
  careful: { label: "Layer with care", color: "var(--gold)", bg: "color-mix(in srgb, var(--gold) 14%, transparent)" },
  conflict: { label: "Conflict found", color: "var(--error)", bg: "color-mix(in srgb, var(--error) 12%, transparent)" },
};

function Timeline({ title, icon: Icon, steps, tint }: { title: string; icon: typeof SunriseIcon; steps: RoutineStep[]; tint: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className="grid place-items-center w-8 h-8 rounded-[10px] shrink-0" style={{ background: tint, color: "var(--cat-skin)" }}>
          <Icon width={16} height={16} />
        </span>
        <p className="font-display text-[16px] text-ink">{title}</p>
        <span className="ml-auto text-[11px] text-ink-3">{steps.length} steps</span>
      </div>
      <ol className="mt-3.5 space-y-2.5">
        <li className="flex gap-3 items-center text-[13.5px] text-ink-2">
          <span className="font-display shrink-0 grid place-items-center w-6 h-6 rounded-full bg-surface-muted text-[11px] font-semibold text-ink-2">1</span>
          Cleanse
        </li>
        {steps.map((s, i) => (
          <li key={s.active.id} className="flex gap-3 items-start">
            <span
              className="font-display shrink-0 grid place-items-center w-6 h-6 rounded-full text-[11px] font-semibold mt-0.5"
              style={{ background: `color-mix(in srgb, var(--cat-skin) 16%, transparent)`, color: "var(--cat-skin)" }}
            >
              {i + 2}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13.5px] font-semibold text-ink leading-tight">{s.active.name}</p>
                {s.wait && <Chip color="var(--cat-skin)">{s.wait}</Chip>}
              </div>
              <p className="text-[11.5px] leading-[15px] text-ink-3 mt-0.5">{s.active.note}</p>
            </div>
          </li>
        ))}
        <li className="flex gap-3 items-center text-[13.5px] text-ink-2">
          <span className="font-display shrink-0 grid place-items-center w-6 h-6 rounded-full bg-surface-muted text-[11px] font-semibold text-ink-2">
            {steps.length + 2}
          </span>
          Moisturize {title === "Morning" ? "→ SPF always last" : ""}
        </li>
      </ol>
    </Card>
  );
}

export function IngredientLab() {
  const [selected, setSelected] = useState<string[]>([]);
  const plan = useMemo(() => buildRoutine(selected), [selected]);
  const meta = STATUS_META[plan.status];

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 6 ? [...s.slice(1), id] : [...s, id]));
  };

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Toggle the actives you own (up to 6) — the engine checks every pair for conflicts, then choreographs a morning and evening routine in the right order.
      </p>

      {/* active toggles */}
      <div className="flex flex-wrap gap-2 mt-4">
        {actives.map((a) => {
          const on = selected.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              aria-pressed={on}
              aria-label={`${a.name} — ${on ? "selected" : "not selected"}`}
              className="press h-9 px-3.5 rounded-full text-[12.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-rose/40 transition-colors"
              style={
                on
                  ? { background: "var(--cat-skin)", color: "white" }
                  : { background: "var(--surface-muted)", color: "var(--ink-2)", border: "1px solid var(--line-soft)" }
              }
            >
              {a.short}
            </button>
          );
        })}
      </div>

      {selected.length < 2 ? (
        <div className="mt-5 rounded-[16px] border border-dashed border-line p-5 text-center">
          <FlaskIcon width={26} height={26} className="mx-auto text-ink-3" />
          <p className="text-[13px] text-ink-3 mt-2">Pick at least 2 actives to run the conflict check.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {/* verdict */}
          <div className="rounded-[16px] p-4 flex items-center gap-3" style={{ background: meta.bg }}>
            <span className="grid place-items-center w-10 h-10 rounded-full shrink-0" style={{ background: "var(--surface)", color: meta.color }}>
              {plan.status === "clear" ? <CheckIcon width={20} height={20} /> : <AlertIcon width={20} height={20} />}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-ink leading-tight" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <p className="text-[12px] text-ink-3 mt-0.5">
                {plan.conflicts.length === 0
                  ? "No known conflicts in this set — layer away."
                  : `${plan.conflicts.length} interaction${plan.conflicts.length > 1 ? "s" : ""} to know about below.`}
              </p>
            </div>
          </div>

          {/* conflicts */}
          {plan.conflicts.map((c) => (
            <div key={c.aid + c.bid + c.severity} className="rounded-[14px] p-3.5" style={{ background: c.severity === "avoid" ? "var(--honey-soft)" : "color-mix(in srgb, var(--gold) 10%, transparent)" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip color={c.severity === "avoid" ? "var(--error)" : "var(--gold)"}>{c.severity === "avoid" ? "don't combine" : "careful"}</Chip>
                <p className="text-[13.5px] font-bold text-ink">{c.a} × {c.b}</p>
              </div>
              <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1.5">{c.why}</p>
            </div>
          ))}

          {/* synergies */}
          {plan.synergies.length > 0 && (
            <div className="rounded-[14px] p-3.5 bg-sage-soft">
              <Eyebrow color="var(--cat-skin)">Power couples</Eyebrow>
              <div className="space-y-2 mt-2">
                {plan.synergies.map((s) => (
                  <p key={s.a + s.b} className="text-[12.5px] leading-[17px] text-ink-2">
                    <b>{s.a} + {s.b}</b> — {s.why}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* timelines */}
          <Timeline title="Morning" icon={SunriseIcon} steps={plan.am} tint="var(--sage-soft)" />
          <Timeline title="Evening" icon={MoonStarIcon} steps={plan.pm} tint="color-mix(in srgb, var(--cat-skin) 18%, transparent)" />

          {/* notes */}
          {plan.notes.length > 0 && (
            <div className="rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
              {plan.notes.map((n) => (
                <p key={n} className="text-[12.5px] leading-[17px] text-ink-2 flex gap-2 items-start">
                  <span aria-hidden>·</span>
                  {n}
                </p>
              ))}
            </div>
          )}

          <p className="text-[10.5px] text-ink-3 leading-[15px] px-1">
            Sequencing rules: thin → thick, lowest pH first, hydration last, SPF the final morning step. General guidance, not medical advice — patch-test new actives and ask a dermatologist for persistent issues.
          </p>
        </div>
      )}
    </div>
  );
}
