"use client";

/* ============================================================
   AURELIA — Skin tab
   Skin type quiz · type guides · ingredients · myths
   ============================================================ */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  skinTypes,
  quizQuestions,
  computeQuizResult,
  skinTypeById,
  ingredients,
  ingredientMixing,
  sunscreenGuide,
  skincareMyths,
  habitTips,
  type SkinTypeId,
} from "@/data/skincare";
import { Card, Chip, Eyebrow, SectionHeader, ScreenTitle, StepRow, MythCard, DotList, DoBlock, DontBlock } from "./../bits";
import { BottomSheet, type SheetData } from "./../sheet";
import { QuizIllustration } from "./../illustrations";
import { DropletIcon, LightbulbIcon, SunIcon, ArrowRightIcon, CheckIcon } from "./../icons";
import { useAurelia } from "@/lib/store";

const ACCENT = "var(--cat-skin)";

/* ---------- Quiz flow ---------- */

function QuizFlow({ onFinish, stored }: { onFinish: (r: { base: SkinTypeId; sensitiveOverlay: boolean } | null) => void; stored: { base: string; sensitiveOverlay: boolean } | null }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const total = quizQuestions.length;

  const result = useMemo(() => {
    if (answers.length < total) return null;
    return computeQuizResult(answers);
  }, [answers, total]);

  if (!started) {
    return (
      <div className="relative overflow-hidden rounded-[20px] border border-line bg-[linear-gradient(150deg,var(--sage-soft),var(--surface)_70%)]">
        <div className="p-5 relative z-10">
          <Eyebrow color={ACCENT}>10 questions · 2 minutes</Eyebrow>
          <h2 className="font-display text-[22px] leading-[28px] text-ink mt-1.5">What's your skin type?</h2>
          <p className="text-[13.5px] leading-[20px] text-ink-2 mt-2 max-w-[68%]">
            Oily, dry, combination, normal or sensitive — answer honestly, there&apos;s no wrong skin.
          </p>
          {stored && (
            <p className="text-[12px] text-cat-skin font-semibold mt-3">
              Last result: {stored.base} {stored.sensitiveOverlay ? "+ sensitive" : ""}
            </p>
          )}
          <button
            onClick={() => setStarted(true)}
            className="mt-4 h-11 w-full max-w-[220px] rounded-full bg-cat-skin text-white text-[14px] font-bold press"
          >
            {stored ? "Retake the quiz" : "Start the quiz"}
          </button>
        </div>
        <QuizIllustration className="absolute -right-3 -bottom-2 w-[150px] h-[120px] pointer-events-none select-none" aria-hidden />
      </div>
    );
  }

  if (result) {
    const type = skinTypeById(result.base);
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>
        <div className="rounded-[20px] border border-line bg-surface p-5 shadow-[0_2px_8px_rgba(45,35,32,0.05)]">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-[16px] bg-sage-soft text-cat-skin">
              <DropletIcon width={24} height={24} />
            </span>
            <div>
              <Eyebrow color={ACCENT}>Your result</Eyebrow>
              <h2 className="font-display text-[22px] text-ink leading-tight">
                {type.name}
                {result.sensitiveOverlay ? " + Sensitive" : ""} skin
              </h2>
            </div>
          </div>
          <p className="text-[14px] leading-[21px] text-ink-2 mt-3">{type.snapshot}</p>
          <p className="text-[12px] italic text-ink-3 mt-3">
            Skin types shift with seasons, hormones and age — retake this in a few months. There&apos;s no bad type, just different care.
          </p>
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => onFinish(result)}
              className="flex-1 h-11 rounded-full bg-cat-skin text-white text-[14px] font-bold press"
            >
              Save my result
            </button>
            <button
              onClick={() => {
                setAnswers([]);
                setStep(0);
                setStarted(false);
              }}
              className="h-11 px-5 rounded-full border border-line text-[14px] font-bold text-ink-2 press"
            >
              Retake
            </button>
          </div>
        </div>

        <Card className="p-5 mt-3">
          <h3 className="font-display text-[17px] text-ink">Your morning routine</h3>
          <ol className="space-y-3 mt-3">
            {type.amRoutine.map((s, i) => (
              <StepRow key={i} n={i + 1}>{s}</StepRow>
            ))}
          </ol>
        </Card>
        <Card className="p-5 mt-3">
          <h3 className="font-display text-[17px] text-ink">Your evening routine</h3>
          <ol className="space-y-3 mt-3">
            {type.pmRoutine.map((s, i) => (
              <StepRow key={i} n={i + 1}>{s}</StepRow>
            ))}
          </ol>
        </Card>
        {result.sensitiveOverlay && (
          <Card className="p-5 mt-3 border-gold/40">
            <Eyebrow color="var(--warning)">Sensitive overlay</Eyebrow>
            <p className="text-[13.5px] leading-[20px] text-ink-2 mt-2">{skinTypeById("sensitive").snapshot}</p>
            <p className="text-[12.5px] text-ink-3 mt-2">Check the Sensitive skin card below — fragrance-free everything, patch test everything.</p>
          </Card>
        )}
        <Card className="p-5 mt-3">
          <h3 className="font-display text-[17px] text-ink">Your hero ingredients</h3>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {type.heroes.map((h) => (
              <Chip key={h} color={ACCENT}>{h}</Chip>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  }

  const q = quizQuestions[step];
  return (
    <div>
      <div className="flex gap-1.5 mb-5">
        {quizQuestions.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-cat-skin" : "bg-surface-deep"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          <p className="eyebrow text-ink-3">Question {step + 1} of {total}</p>
          <h3 className="font-display text-[19px] leading-[25px] text-ink mt-1.5">{q.q}</h3>
          <div className="space-y-2.5 mt-5">
            {q.options.map((o, i) => (
              <button
                key={i}
                onClick={() => {
                  setAnswers((a) => [...a.slice(0, step), i]);
                  setStep(step + 1);
                }}
                className="w-full text-left bg-surface-muted rounded-[14px] p-4 press hover:bg-sage-soft transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
              >
                <p className="text-[14.5px] font-semibold text-ink">{o.text}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="tap-target text-[13px] font-semibold text-ink-3 mt-4">
          ← back
        </button>
      )}
    </div>
  );
}

/* ---------- Skin type card detail ---------- */

function TypeDetail({ id }: { id: SkinTypeId }) {
  const t = skinTypeById(id);
  return (
    <div>
      <p className="text-[14px] leading-[21px] text-ink-2">{t.snapshot}</p>
      <h3 className="font-display text-[17px] text-ink mt-5 mb-2">How to spot it</h3>
      <DotList color={ACCENT}>{t.identify}</DotList>
      <h3 className="font-display text-[17px] text-ink mt-5 mb-2.5">Morning routine</h3>
      <ol className="space-y-3">
        {t.amRoutine.map((s, i) => (
          <StepRow key={i} n={i + 1}>{s}</StepRow>
        ))}
      </ol>
      <h3 className="font-display text-[17px] text-ink mt-5 mb-2.5">Evening routine</h3>
      <ol className="space-y-3">
        {t.pmRoutine.map((s, i) => (
          <StepRow key={i} n={i + 1}>{s}</StepRow>
        ))}
      </ol>
      <h3 className="font-display text-[17px] text-ink mt-6 mb-2.5">Do</h3>
      <DoBlock items={t.dos} color={ACCENT} />
      <h3 className="font-display text-[17px] text-ink mt-5 mb-2.5">Don&apos;t</h3>
      <DontBlock items={t.donts} />
      <h3 className="font-display text-[17px] text-ink mt-6 mb-2">Hero ingredients</h3>
      <div className="flex flex-wrap gap-1.5">
        {t.heroes.map((h) => (
          <Chip key={h} color={ACCENT}>{h}</Chip>
        ))}
      </div>
      <h3 className="font-display text-[17px] text-ink mt-5 mb-2">Skip these</h3>
      <div className="flex flex-wrap gap-1.5">
        {t.avoid.map((a) => (
          <Chip key={a} soft>{a}</Chip>
        ))}
      </div>
    </div>
  );
}

/* ---------- Ingredient detail ---------- */

function IngredientDetail({ ing }: { ing: (typeof ingredients)[0] }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-12 h-12 rounded-[16px] bg-sage-soft text-cat-skin">
          <DropletIcon width={24} height={24} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[18px] text-ink leading-tight">{ing.name}</h3>
          <p className="text-[12.5px] italic text-ink-3 mt-0.5">{ing.tagline}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3.5">
        <div>
          <Eyebrow color={ACCENT}>What it does</Eyebrow>
          <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{ing.does}</p>
        </div>
        <div>
          <Eyebrow color={ACCENT}>Best for</Eyebrow>
          <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{ing.bestFor}</p>
        </div>
        <div>
          <Eyebrow color={ACCENT}>When to use</Eyebrow>
          <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{ing.when}</p>
        </div>
        <div className="flex items-start gap-2.5 rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
          <LightbulbIcon width={16} height={16} className="text-gold shrink-0 mt-0.5" />
          <p className="text-[13px] leading-[19px] text-ink-2">{ing.caution}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tab ---------- */

export function SkinTab() {
  const { skinResult, setSkinResult } = useAurelia();
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [typeDetail, setTypeDetail] = useState<SkinTypeId | null>(null);
  const [ingDetail, setIngDetail] = useState<(typeof ingredients)[0] | null>(null);

  const openType = (id: SkinTypeId) => {
    setTypeDetail(id);
    setIngDetail(null);
    setSheet({ id: `skin-${id}`, category: "skin", eyebrow: "Skin type", title: `${skinTypeById(id).name} skin`, subtitle: "The complete guide", accent: ACCENT });
  };
  const openIng = (ing: (typeof ingredients)[0]) => {
    setIngDetail(ing);
    setTypeDetail(null);
    setSheet({ id: `ing-${ing.name}`, category: "skin", eyebrow: "Ingredient dictionary", title: ing.name, subtitle: ing.tagline, accent: ACCENT });
  };

  return (
    <div className="fade-in">
      <ScreenTitle eyebrow="Skincare" title="Know your skin" accent={ACCENT}>
        <p className="text-[14px] leading-[21px] text-ink-2">Skin type first, products second. Everything else follows.</p>
      </ScreenTitle>

      {/* Quiz */}
      <section className="mt-5">
        <QuizFlow
          stored={skinResult as { base: string; sensitiveOverlay: boolean } | null}
          onFinish={(r) => setSkinResult(r)}
        />
      </section>

      {/* Universal routine */}
      <section className="mt-9">
        <SectionHeader eyebrow="Total beginner?" title="The 3-step minimum" accent={ACCENT} />
        <Card className="p-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            {["Cleanse", "Moisturize", "SPF 30+"].map((s, i) => (
              <div key={s} className="bg-sage-soft rounded-[14px] p-3">
                <span className="font-display text-[18px] text-cat-skin">{i + 1}</span>
                <p className="text-[12px] font-bold text-ink mt-1">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-[19px] text-ink-3 mt-3">
            Everything beyond these three is an upgrade, not a requirement. Order rule: thinnest to thickest consistency — and SPF is always last in the morning.
          </p>
        </Card>
      </section>

      {/* Skin types */}
      <section className="mt-9">
        <SectionHeader eyebrow="The five types" title="Skin type guides" accent={ACCENT} />
        <div className="grid grid-cols-2 gap-3">
          {skinTypes.map((t) => (
            <Card key={t.id} onClick={() => openType(t.id)} ariaLabel={`Open ${t.name} skin guide`} className="p-4">
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-9 h-9 rounded-[12px] bg-sage-soft text-cat-skin">
                  <DropletIcon width={18} height={18} />
                </span>
                <ArrowRightIcon width={14} height={14} className="text-ink-3" />
              </div>
              <p className="text-[14px] font-bold text-ink mt-2.5">{t.name}</p>
              <p className="text-[11.5px] leading-[15px] text-ink-3 mt-1 line-clamp-2">{t.snapshot}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Ingredients */}
      <section className="mt-9">
        <SectionHeader eyebrow="Read any label" title="Ingredient dictionary" accent={ACCENT} />
        <div className="grid grid-cols-2 gap-3">
          {ingredients.map((ing) => (
            <Card key={ing.name} onClick={() => openIng(ing)} ariaLabel={`Open ${ing.name}`} className="p-4">
              <p className="text-[13.5px] font-bold text-ink leading-tight">{ing.name}</p>
              <p className="text-[11.5px] italic text-cat-skin mt-1">{ing.tagline}</p>
              <p className="text-[11.5px] leading-[15px] text-ink-3 mt-1.5 line-clamp-2">{ing.does}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Mixing rules */}
      <section className="mt-9">
        <SectionHeader eyebrow="Play well together?" title="Mixing rules" accent={ACCENT} />
        <Card className="p-5">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-coral">Don&apos;t mix</h3>
          <div className="space-y-2 mt-2.5">
            {ingredientMixing.dont.map((d) => (
              <div key={d.combo} className="rounded-[14px] bg-coral-soft p-3">
                <p className="text-[13.5px] font-bold text-ink">{d.combo}</p>
                <p className="text-[12px] text-ink-3 mt-1">{d.why}</p>
                <p className="text-[12px] text-coral font-semibold mt-1.5">Fix: {d.fix}</p>
              </div>
            ))}
          </div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-sage mt-5">Stack freely</h3>
          <div className="mt-2.5">
            <DotList color={ACCENT}>{ingredientMixing.do}</DotList>
          </div>
        </Card>
      </section>

      {/* Sunscreen */}
      <section className="mt-9">
        <SectionHeader eyebrow="Non-negotiable" title="Sunscreen, decoded" accent={ACCENT} />
        <Card className="p-5 bg-[linear-gradient(150deg,var(--honey-soft),var(--surface)_75%)]">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-honey-soft text-honey border border-honey/30">
              <SunIcon width={20} height={20} />
            </span>
            <p className="font-display text-[16px] text-ink">The 2-finger rule</p>
          </div>
          <div className="mt-3">
            <DotList color="var(--warning)">{sunscreenGuide.points}</DotList>
          </div>
        </Card>
      </section>

      {/* Myths */}
      <section className="mt-9">
        <SectionHeader eyebrow="Myth vs fact" title="Tap to debunk" accent={ACCENT} />
        <div className="space-y-2.5">
          {skincareMyths.map((m) => (
            <MythCard key={m.myth} myth={m.myth} truth={m.truth} />
          ))}
        </div>
      </section>

      {/* Habits */}
      <section className="mt-9 mb-2">
        <SectionHeader eyebrow="The free 40%" title="Habits that cost nothing" accent={ACCENT} />
        <div className="space-y-2.5">
          {habitTips.map((h) => (
            <Card key={h.title} className="p-4">
              <div className="flex items-start gap-3">
                <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-sage-soft text-cat-skin">
                  <CheckIcon width={15} height={15} strokeWidth={2.4} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-ink leading-tight">{h.title}</p>
                  <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1.5">{h.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-[11.5px] leading-[16px] text-ink-3 mt-4 px-2">
          This is general skincare education, not medical advice. If something on your skin hurts, spreads, or won&apos;t heal — please see a dermatologist.
        </p>
      </section>

      <BottomSheet data={sheet} onClose={() => setSheet(null)}>
        {typeDetail && <TypeDetail id={typeDetail} />}
        {ingDetail && <IngredientDetail ing={ingDetail} />}
      </BottomSheet>
    </div>
  );
}
