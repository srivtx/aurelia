"use client";

/* ============================================================
   AURELIA — Makeup tab
   Occasion looks · golden order · 101s · myths
   ============================================================ */

import { useState, useEffect } from "react";
import { looks, goldenOrder, face101, eye101, lip101, makeupMistakes, makeupMyths, toolCare, removalSteps, type OccasionLook, type Guide101 } from "@/data/makeup";
import { Card, Chip, Eyebrow, SectionHeader, ScreenTitle, StepRow, MythCard, TimeChip, DotList } from "./../bits";
import { BottomSheet, type SheetData } from "./../sheet";
import { LightbulbIcon, XIcon, CheckIcon, ClockIcon, BrushIcon, MirrorIcon } from "./../icons";
import { useAurelia } from "@/lib/store";

const ACCENT = "var(--cat-makeup)";

/* ---------- Look detail ---------- */

function LookDetail({ look }: { look: OccasionLook }) {
  return (
    <div>
      <p className="text-[14px] leading-[21px] text-ink-2 italic">{look.vibe}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <TimeChip minutes={look.minutes} />
        <Chip soft>{look.occasions}</Chip>
      </div>
      <h3 className="font-display text-[17px] text-ink mt-6 mb-2.5">Step by step</h3>
      <ol className="space-y-3">
        {look.steps.map((s, i) => (
          <StepRow key={i} n={i + 1}>{s}</StepRow>
        ))}
      </ol>
      <h3 className="font-display text-[17px] text-ink mt-6 mb-2">Your kit</h3>
      <div className="flex flex-wrap gap-1.5">
        {look.kit.map((k) => (
          <Chip key={k} soft>{k}</Chip>
        ))}
      </div>
      <div className="flex items-start gap-2.5 mt-6 rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
        <LightbulbIcon width={16} height={16} className="text-gold shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold mb-1">Big-sis pro tip</p>
          <p className="text-[13px] leading-[19px] text-ink-2">{look.proTip}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 101 guide detail ---------- */

function GuideDetail({ guide }: { guide: Guide101 }) {
  return (
    <div>
      <p className="text-[14px] leading-[21px] text-ink-2 italic">{guide.intro}</p>
      <div className="space-y-4 mt-5">
        {guide.cards.map((c) => (
          <div key={c.heading} className="bg-surface-muted rounded-[16px] p-4">
            <h4 className="font-display text-[16px] text-ink">{c.heading}</h4>
            <p className="text-[13.5px] leading-[20px] text-ink-2 mt-2">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Golden order step (expandable) ---------- */

function OrderStep({ step, index, open, onToggle }: { step: (typeof goldenOrder)[0]; index: number; open: boolean; onToggle: () => void }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <span className="font-display grid place-items-center w-8 h-8 rounded-full bg-rose-soft text-rose text-[13px] font-semibold shrink-0">
          {step.step}
        </span>
        {index < goldenOrder.length - 1 && <span className="w-px flex-1 min-h-4 bg-line mt-1" />}
      </div>
      <button onClick={onToggle} className="text-left min-w-0 flex-1 pb-5 -mt-1 outline-none" aria-expanded={open}>
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-bold text-ink">{step.name}</p>
          {step.optional && <Chip soft>optional</Chip>}
        </div>
        <p className={`text-[13px] leading-[19px] text-ink-3 mt-1 transition-all ${open ? "" : "line-clamp-1"}`}>{step.why}</p>
      </button>
    </div>
  );
}

/* ---------- Tab ---------- */

export function MakeupTab() {
  const { focus, setFocus } = useAurelia();
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [look, setLook] = useState<OccasionLook | null>(null);
  const [guide, setGuide] = useState<Guide101 | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [showAllOrder, setShowAllOrder] = useState(false);

  const guides: Guide101[] = [face101, eye101, lip101];
  const guideIcons = [MirrorIcon, BrushIcon, LightbulbIcon];

  const openLook = (l: OccasionLook) => {
    setLook(l);
    setGuide(null);
    setSheet({ id: `look-${l.id}`, category: "makeup", eyebrow: `${l.minutes} minute look`, title: l.name, subtitle: l.occasions, accent: ACCENT });
  };
  const openGuide = (g: Guide101) => {
    setGuide(g);
    setLook(null);
    setSheet({ id: `guide-${g.id}`, category: "makeup", eyebrow: "The 101", title: g.title, subtitle: g.intro.slice(0, 60) + "…", accent: ACCENT });
  };

  /* deep-open from global search (e.g. "date night look") or from Home "For you" */
  useEffect(() => {
    if (focus?.category !== "makeup") return;
    const id = focus.id;
    const t = setTimeout(() => {
      setFocus(null);      if (id.startsWith("look-")) {
        const l = looks.find((x) => x.id === id.replace("look-", ""));
        if (l) openLook(l);
      } else if (id.startsWith("guide-")) {
        const g = [face101, eye101, lip101].find((x) => x.id === id.replace("guide-", ""));
        if (g) openGuide(g);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [focus]);

  const visibleOrder = showAllOrder ? goldenOrder : goldenOrder.slice(0, 6);

  return (
    <div className="fade-in">
      <ScreenTitle eyebrow="Makeup" title="From beginner to glam" accent={ACCENT}>
        <p className="text-[14px] leading-[21px] text-ink-2">No gatekeeping, no brand pushing — just how it actually works.</p>
      </ScreenTitle>

      {/* Occasion looks */}
      <section className="mt-5">
        <SectionHeader eyebrow="Pick your moment" title="Occasion looks" accent={ACCENT} />
        <div className="space-y-3">
          {looks.map((l) => (
            <Card key={l.id} onClick={() => openLook(l)} ariaLabel={`Open look ${l.name}`} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-ink leading-tight">{l.name}</p>
                  <p className="text-[12.5px] text-ink-3 mt-1 line-clamp-1">{l.vibe}</p>
                </div>
                <Chip color={ACCENT}>
                  <ClockIcon width={12} height={12} />
                  {l.minutes} min
                </Chip>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Golden order */}
      <section className="mt-9">
        <SectionHeader eyebrow="The golden order" title="Why makeup goes in order" accent={ACCENT} />
        <div className="bg-surface border border-line rounded-[16px] p-5 shadow-[0_2px_8px_rgba(45,35,32,0.05)]">
          {visibleOrder.map((s, i) => (
            <OrderStep
              key={s.step}
              step={s}
              index={showAllOrder ? i : i}
              open={openStep === s.step || showAllOrder}
              onToggle={() => setOpenStep(openStep === s.step ? null : s.step)}
            />
          ))}
          {!showAllOrder && (
            <button
              onClick={() => setShowAllOrder(true)}
              className="w-full h-10 rounded-full border border-dashed border-line text-[13px] font-semibold text-ink-2 press"
            >
              Show all 12 steps
            </button>
          )}
        </div>
        <p className="text-[12px] italic text-ink-3 mt-3 leading-[17px]">
          Going dark or glittery on the eyes? Do them BEFORE your base — fallout wipes off bare skin, but smudges foundation.
        </p>
      </section>

      {/* 101 guides */}
      <section className="mt-9">
        <SectionHeader eyebrow="Learn the zones" title="The 101s" accent={ACCENT} />
        <div className="grid grid-cols-3 gap-3">
          {guides.map((g, i) => {
            const Icon = guideIcons[i];
            return (
              <Card key={g.id} onClick={() => openGuide(g)} ariaLabel={`Open ${g.title}`} className="p-4 text-center">
                <span className="mx-auto grid place-items-center w-11 h-11 rounded-[14px] bg-rose-soft text-cat-makeup">
                  <Icon width={22} height={22} />
                </span>
                <p className="text-[13px] font-bold text-ink mt-2.5 leading-tight">{g.title}</p>
                <p className="text-[11px] text-ink-3 mt-1 leading-[14px]">{g.cards.length} mini-guides</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Mistakes */}
      <section className="mt-9">
        <SectionHeader eyebrow="We've all been there" title="10 beginner mistakes" accent={ACCENT} />
        <div className="space-y-2.5">
          {makeupMistakes.map((m) => (
            <Card key={m.mistake} className="p-4">
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-coral-soft text-coral mt-0.5">
                  <XIcon width={13} height={13} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink leading-snug">{m.mistake}</p>
                  <div className="flex items-start gap-2 mt-2">
                    <CheckIcon width={13} height={13} className="text-sage shrink-0 mt-1" strokeWidth={2.4} />
                    <p className="text-[13px] leading-[19px] text-ink-2">{m.fix}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Myths */}
      <section className="mt-9">
        <SectionHeader eyebrow="Myth vs fact" title="Tap to debunk" accent={ACCENT} />
        <div className="space-y-2.5">
          {makeupMyths.map((m) => (
            <MythCard key={m.myth} myth={m.myth} truth={m.truth} />
          ))}
        </div>
      </section>

      {/* Tool care + removal */}
      <section className="mt-9 mb-2">
        <SectionHeader eyebrow="Keep it clean" title="Tools & take-it-off" accent={ACCENT} />
        <Card className="p-5">
          <h3 className="font-display text-[16px] text-ink">{toolCare.title}</h3>
          <div className="mt-3">
            <DotList color={ACCENT}>{toolCare.points}</DotList>
          </div>
          <h4 className="text-[13px] font-bold text-ink mt-5 mb-2">When to toss it</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {toolCare.expiry.map((e) => (
              <div key={e.product} className="flex items-center justify-between bg-surface-muted rounded-xl px-3 py-2">
                <span className="text-[12px] text-ink-2 truncate">{e.product}</span>
                <span className="text-[12px] font-bold text-cat-makeup shrink-0 ml-2">{e.time}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 mt-3">
          <h3 className="font-display text-[16px] text-ink">Double cleansing, done right</h3>
          <p className="text-[12.5px] text-ink-3 mt-1">SPF and long-wear makeup are oil-soluble — oil removes them, then your gel wash removes the rest.</p>
          <ol className="space-y-2.5 mt-4">
            {removalSteps.map((s, i) => (
              <StepRow key={i} n={i + 1}>{s}</StepRow>
            ))}
          </ol>
        </Card>
      </section>

      <BottomSheet data={sheet} onClose={() => setSheet(null)}>
        {look && <LookDetail look={look} />}
        {guide && <GuideDetail guide={guide} />}
      </BottomSheet>
    </div>
  );
}
