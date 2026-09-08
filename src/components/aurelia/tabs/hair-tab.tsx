"use client";

/* ============================================================
   AURELIA — Hair tab
   Outfit matcher · master styles · face shapes · quick fixes
   ============================================================ */

import { useState } from "react";
import { masterStyles, outfitCategories, faceShapes, prepBasics, haircareTips, quickFixes, styleById, type HairStyle } from "@/data/hair";
import { Card, Chip, Eyebrow, SectionHeader, ScreenTitle, StepRow, DifficultyChip, TimeChip, DotList } from "./../bits";
import { BottomSheet, type SheetData } from "./../sheet";
import { outfitIcons, LightbulbIcon, ArrowRightIcon, CheckIcon } from "./../icons";
import { hairstyleMinis, faceShapeIcons, EmptySavedIllustration } from "./../illustrations";

const ACCENT = "var(--cat-hair)";

/* ---------- Style detail ---------- */

function StyleDetail({ style }: { style: HairStyle }) {
  const Mini = hairstyleMinis[style.id];
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="grid place-items-center w-16 h-16 rounded-[18px] bg-[color-mix(in_srgb,var(--cat-hair)_14%,transparent)] text-cat-hair shrink-0">
          {Mini ? <Mini width={44} height={44} /> : null}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <DifficultyChip level={style.difficulty} />
            <TimeChip minutes={style.minutes} />
            <Chip soft>{style.heat ? "heat tools" : "heat-free"}</Chip>
          </div>
          <p className="text-[12.5px] text-ink-3 mt-1.5">{style.length} hair</p>
        </div>
      </div>
      <h3 className="font-display text-[17px] text-ink mt-6 mb-2.5">How to</h3>
      <ol className="space-y-3">
        {style.steps.map((s, i) => (
          <StepRow key={i} n={i + 1}>{s}</StepRow>
        ))}
      </ol>
      <h3 className="font-display text-[17px] text-ink mt-6 mb-2">Pro tips</h3>
      <DotList color={ACCENT}>{style.proTips}</DotList>
      <div className="flex items-start gap-2.5 mt-5 rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
        <LightbulbIcon width={16} height={16} className="text-gold shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold mb-1">Avoid this</p>
          <p className="text-[13px] leading-[19px] text-ink-2">{style.mistake}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Face shape detail ---------- */

function FaceShapeDetail({ shape }: { shape: (typeof faceShapes)[0] }) {
  const Icon = faceShapeIcons[shape.id];
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="grid place-items-center w-16 h-16 rounded-[18px] bg-[color-mix(in_srgb,var(--cat-hair)_12%,transparent)] text-cat-hair shrink-0">
          {Icon ? <Icon width={52} height={52} /> : shape.emoji}
        </span>
        <p className="font-display text-[20px] text-ink">{shape.name} face</p>
      </div>
      <h3 className="font-display text-[16px] text-ink mt-5 mb-1.5">How to spot it</h3>
      <p className="text-[14px] leading-[21px] text-ink-2">{shape.spot}</p>
      <h3 className="font-display text-[16px] text-ink mt-5 mb-1.5">Your goal</h3>
      <p className="text-[14px] leading-[21px] text-ink-2">{shape.goal}</p>
      <h3 className="font-display text-[16px] text-ink mt-5 mb-2">Most flattering</h3>
      <DotList color={ACCENT}>{[shape.flattering]}</DotList>
      <h3 className="font-display text-[16px] text-ink mt-5 mb-2">Handle with care</h3>
      <p className="text-[13.5px] leading-[20px] text-ink-2 rounded-[14px] bg-honey-soft p-3.5">{shape.careful}</p>
    </div>
  );
}

/* ---------- Tab ---------- */

export function HairTab() {
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [styleDetail, setStyleDetail] = useState<HairStyle | null>(null);
  const [shapeDetail, setShapeDetail] = useState<(typeof faceShapes)[0] | null>(null);
  const [activeCat, setActiveCat] = useState<string>(outfitCategories[0].id);

  const openStyle = (s: HairStyle) => {
    setStyleDetail(s);
    setShapeDetail(null);
    setSheet({ id: `style-${s.id}`, category: "hair", eyebrow: `${s.difficulty} · ${s.minutes} min`, title: s.name, subtitle: `${s.length} hair · ${s.heat ? "heat tools" : "heat-free"}`, accent: ACCENT });
  };
  const openShape = (s: (typeof faceShapes)[0]) => {
    setShapeDetail(s);
    setStyleDetail(null);
    setSheet({ id: `shape-${s.id}`, category: "hair", eyebrow: "Face shape guide", title: `${s.name} face`, subtitle: "Flatter YOUR face", accent: ACCENT });
  };

  const cat = outfitCategories.find((c) => c.id === activeCat)!;

  return (
    <div className="fade-in">
      <ScreenTitle eyebrow="Hairstyles" title="Match hair to outfit" accent={ACCENT}>
        <p className="text-[14px] leading-[21px] text-ink-2">Beginner-proof styles, mostly heat-free, for medium & long hair.</p>
      </ScreenTitle>

      {/* Outfit matcher */}
      <section className="mt-5">
        <SectionHeader eyebrow="What are you wearing?" title="Pick your outfit" accent={ACCENT} />
        <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max pb-1">
            {outfitCategories.map((c) => {
              const Icon = outfitIcons[c.id];
              const active = c.id === activeCat;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 w-[76px] shrink-0 rounded-[16px] border p-2.5 press transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40 ${
                    active ? "border-cat-hair/50 bg-[color-mix(in_srgb,var(--cat-hair)_12%,transparent)]" : "border-line bg-surface"
                  }`}
                >
                  <span className={`grid place-items-center w-10 h-10 rounded-[12px] ${active ? "bg-surface text-cat-hair" : "bg-surface-muted text-ink-3"}`}>
                    <Icon width={20} height={20} />
                  </span>
                  <span className={`text-[10.5px] font-semibold text-center leading-[13px] ${active ? "text-ink" : "text-ink-3"}`}>
                    {c.name.split(" / ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[12.5px] text-ink-3 mt-4 mb-3">{cat.blurb}</p>
        <div className="space-y-3">
          {cat.styleIds.map((sid) => {
            const s = styleById(sid)!;
            const Mini = hairstyleMinis[s.id];
            return (
              <Card key={sid} onClick={() => openStyle(s)} ariaLabel={`Open ${s.name}`} className="p-4">
                <div className="flex items-center gap-3.5">
                  <span className="grid place-items-center w-12 h-12 rounded-[14px] bg-[color-mix(in_srgb,var(--cat-hair)_12%,transparent)] text-cat-hair shrink-0">
                    {Mini ? <Mini width={36} height={36} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-ink leading-tight">{s.name}</p>
                    <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1 line-clamp-2">{cat.why[sid]}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <TimeChip minutes={s.minutes} />
                    <span className="text-[11px] font-semibold text-cat-hair uppercase tracking-wide">{s.difficulty}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Master list */}
      <section className="mt-9">
        <SectionHeader eyebrow="The essentials" title="10 master styles" accent={ACCENT} />
        <div className="grid grid-cols-2 gap-3">
          {masterStyles.map((s) => {
            const Mini = hairstyleMinis[s.id];
            return (
              <Card key={s.id} onClick={() => openStyle(s)} ariaLabel={`Open ${s.name}`} className="p-4 text-center">
                <span className="mx-auto grid place-items-center w-14 h-14 rounded-[16px] bg-[color-mix(in_srgb,var(--cat-hair)_12%,transparent)] text-cat-hair">
                  {Mini ? <Mini width={40} height={40} /> : null}
                </span>
                <p className="text-[13.5px] font-bold text-ink mt-2.5 leading-tight">{s.name}</p>
                <div className="flex justify-center gap-1 mt-2">
                  <Chip soft>{s.minutes} min</Chip>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Face shapes */}
      <section className="mt-9">
        <SectionHeader eyebrow="Flatter YOUR face" title="Face shape guide" accent={ACCENT} />
        <div className="grid grid-cols-3 gap-3">
          {faceShapes.map((s) => {
            const Icon = faceShapeIcons[s.id];
            return (
              <Card key={s.id} onClick={() => openShape(s)} ariaLabel={`Open ${s.name} face shape`} className="p-3.5 text-center">
                <span className="mx-auto block text-cat-hair">
                  {Icon ? <Icon width={44} height={44} /> : s.emoji}
                </span>
                <p className="text-[12.5px] font-bold text-ink mt-1.5">{s.name}</p>
              </Card>
            );
          })}
        </div>
        <p className="text-[12px] italic text-ink-3 mt-3 leading-[17px]">
          60-second test: pull hair back, trace your face outline on the mirror with a lipstick, compare. Most people are a blend — pick the closest.
        </p>
      </section>

      {/* Prep basics */}
      <section className="mt-9">
        <SectionHeader eyebrow="Do these first" title="Prep & basics" accent={ACCENT} />
        <div className="space-y-2.5">
          {prepBasics.map((p) => (
            <Card key={p.title} className="p-4">
              <div className="flex items-start gap-3">
                <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--cat-hair)_14%,transparent)] text-cat-hair">
                  <CheckIcon width={15} height={15} strokeWidth={2.4} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-ink leading-tight">{p.title}</p>
                  <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1.5">{p.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Haircare tips */}
      <section className="mt-9">
        <SectionHeader eyebrow="Care counts" title="Haircare quick tips" accent={ACCENT} />
        <div className="space-y-2.5">
          {haircareTips.map((p) => (
            <Card key={p.title} className="p-4">
              <p className="text-[14px] font-bold text-ink leading-tight">{p.title}</p>
              <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1.5">{p.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick fixes */}
      <section className="mt-9 mb-2">
        <SectionHeader eyebrow="Emergency" title="Bad hair day fixes" accent={ACCENT} />
        <div className="space-y-2.5">
          {quickFixes.map((q) => (
            <div key={q.problem} className="rounded-[16px] border border-line bg-surface-muted p-4">
              <p className="text-[13.5px] font-bold text-ink">{q.problem}</p>
              <p className="text-[13px] leading-[19px] text-ink-2 mt-1.5">{q.fix}</p>
            </div>
          ))}
        </div>
      </section>

      <BottomSheet data={sheet} onClose={() => setSheet(null)}>
        {styleDetail && <StyleDetail style={styleDetail} />}
        {shapeDetail && <FaceShapeDetail shape={shapeDetail} />}
      </BottomSheet>
    </div>
  );
}
