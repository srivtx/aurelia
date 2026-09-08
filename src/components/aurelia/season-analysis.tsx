"use client";

/* ============================================================
   AURELIA — 12-Season Personal Color Analysis (Color Lab)
   7-question diagnostic → vector-space classifier → season,
   palette, metals, makeup + personalized wardrobe ratings.
   ============================================================ */

import { useMemo, useState } from "react";
import {
  seasonQuiz,
  classifySeason,
  seasonSignals,
  seasonById,
  rateColorForSeason,
  topColorsForSeason,
  type Season,
  type SeasonResult as ClassResult,
} from "@/data/seasons";
import { wardrobeColors } from "@/data/colors";
import { useAurelia } from "@/lib/store";
import { shareText } from "@/lib/share";
import { Card, Chip, Eyebrow } from "./bits";
import { ShareIcon, CheckIcon } from "./icons";

/* ---------- signal profile bars (the math made visible) ---------- */

function SignalBar({ label, left, right, value }: { label: string; left: string; right: string; value: number }) {
  /* value in -1..1 → knob position 0..100% */
  const pct = ((value + 1) / 2) * 100;
  return (
    <div>
      <div className="flex justify-between text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        <span>{left}</span>
        <span>{label}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-2 rounded-full bg-surface-deep mt-1.5">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-line" aria-hidden />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-surface border-2 shadow-[0_2px_6px_rgba(45,35,32,0.18)]"
          style={{ left: `${pct}%`, borderColor: "var(--cat-colors)" }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/* ---------- result view ---------- */

function SeasonResultView({ result, onRetake, onClose }: { result: ClassResult; onRetake: () => void; onClose: () => void }) {
  const { season, confidence, signals } = result;
  const { seasonResult, setSeasonResult, showToast, toggleSaved } = useAurelia();
  const [saved, setSaved] = useState(seasonResult?.id === season.id);

  const topWardrobe = useMemo(
    () => topColorsForSeason(wardrobeColors.map((c) => ({ id: c.id, hex: c.hex })), season, 5).map((t) => ({ ...t, color: wardrobeColors.find((c) => c.id === t.id)! })),
    [season],
  );

  const onShare = async () => {
    const res = await shareText({
      title: `My color season: ${season.name}`,
      text: `I'm a ${season.name} — ${season.tagline.toLowerCase()}. Glow colors: ${season.palette.slice(0, 4).map((s) => s.name).join(", ")}. Found my season with Aurelia ✦`,
    });
    if (res === "copied") showToast("Season card copied ✦");
  };

  return (
    <div>
      {/* header */}
      <div className="flex items-center gap-2">
        <Chip color="var(--cat-colors)">Personal color analysis</Chip>
        <Chip soft>{Math.round(confidence * 100)}% match</Chip>
      </div>
      <h3 className="font-display text-[24px] leading-[29px] text-ink mt-2.5">{season.name}</h3>
      <p className="text-[13.5px] italic leading-[19px] text-ink-3 mt-1">{season.tagline}</p>

      {/* signal profile — the classifier's math, visible */}
      <Card className="p-4 mt-4">
        <Eyebrow color="var(--cat-colors)">Your signal profile</Eyebrow>
        <div className="space-y-3.5 mt-3">
          <SignalBar label="warmth" left="Cool" right="Warm" value={signals.warm} />
          <SignalBar label="depth" left="Light" right="Deep" value={signals.depth} />
          <SignalBar label="chroma" left="Muted" right="Bright" value={signals.chroma} />
          <SignalBar label="contrast" left="Low" right="High" value={signals.contrast} />
        </div>
        <p className="text-[11.5px] leading-[16px] text-ink-3 mt-3">
          Classified in a 4-dimensional color space (CIE-informed) against 12 season archetypes. Closest match: {season.name}
          {result.runnerUp ? ` · runner-up: ${result.runnerUp.name}` : ""}.
        </p>
      </Card>

      {/* palette */}
      <h4 className="font-display text-[17px] text-ink mt-6">Your glow palette</h4>
      <div className="grid grid-cols-8 gap-1.5 mt-2.5">
        {season.palette.map((s) => (
          <div key={s.hex + s.name} className="text-center">
            <div
              className="w-full aspect-square rounded-[10px] border border-line-soft"
              style={{ background: s.hex }}
              role="img"
              aria-label={`${s.name} ${s.hex}`}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {season.palette.slice(0, 8).map((s) => (
          <span key={s.name} className="text-[10px] text-ink-3 px-1.5 py-0.5 rounded bg-surface-muted">{s.name}</span>
        ))}
      </div>

      {/* wardrobe best friends (rated via ΔE2000) */}
      <h4 className="font-display text-[17px] text-ink mt-6">Best of your wardrobe</h4>
      <p className="text-[12px] text-ink-3 mt-0.5">Rated by perceptual distance (ΔE2000) to your season palette</p>
      <div className="space-y-2 mt-2.5">
        {topWardrobe.map(({ color, score }) => {
          const r = rateColorForSeason(color.hex, season);
          return (
            <div key={color.id} className="flex items-center gap-3 bg-surface-muted rounded-[14px] p-3">
              <span className="shrink-0 w-9 h-9 rounded-full border border-line" style={{ background: color.hex }} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink leading-tight">{color.name}</p>
                <p className="text-[11.5px] text-ink-3 mt-0.5">closest palette match: {r.nearest.name}</p>
              </div>
              <div className="shrink-0 w-14 text-right">
                <p className="font-display text-[16px] text-ink">{score}</p>
                <p className="text-[9.5px] uppercase tracking-wider text-ink-3">{r.verdict}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* metals, makeup, hair */}
      <div className="grid grid-cols-1 gap-2.5 mt-6">
        {[
          { title: "Your metals", body: `${season.metals}. ${season.jewelry}.` },
          { title: "Makeup that flatters", body: season.makeup },
          { title: "Hair direction", body: season.hair },
        ].map((b) => (
          <div key={b.title} className="rounded-[14px] bg-terra-soft border border-line-soft p-3.5">
            <p className="eyebrow text-[10.5px] text-cat-colors">{b.title}</p>
            <p className="text-[13.5px] leading-[19px] text-ink-2 mt-1.5">{b.body}</p>
          </div>
        ))}
      </div>

      {/* handle with care */}
      <h4 className="font-display text-[17px] text-ink mt-6">Handle with care</h4>
      <div className="space-y-2 mt-2.5">
        {season.avoid.map((a) => (
          <div key={a.name} className="flex items-start gap-3 rounded-[14px] p-3 bg-honey-soft">
            <span className="shrink-0 w-9 h-9 rounded-full border border-line" style={{ background: a.hex }} />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink leading-tight">{a.name}</p>
              <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1">{a.why}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-gold/30 bg-gold/10 p-3.5 mt-4 flex items-start gap-2.5">
        <span className="text-[15px] leading-[21px]">💡</span>
        <p className="text-[13px] leading-[19px] text-ink-2">{season.wearing}</p>
      </div>

      {/* actions */}
      <div className="flex gap-2.5 mt-6 mb-1">
        <button onClick={onRetake} className="flex-1 h-11 rounded-full border border-line text-[14px] font-bold text-ink-2 press">
          Retake
        </button>
        <button
          aria-label="Share your season"
          onClick={onShare}
          className="h-11 w-11 rounded-full border border-line text-ink-2 press grid place-items-center shrink-0"
        >
          <ShareIcon width={19} height={19} />
        </button>
        <button
          onClick={() => {
            if (saved) {
              setSeasonResult(null);
              setSaved(false);
              toggleSaved({ id: `season-${season.id}`, category: "colors", title: season.name, subtitle: "Color season" });
            } else {
              setSeasonResult({ id: season.id, taken: new Date().toISOString().slice(0, 10) });
              setSaved(true);
              toggleSaved({ id: `season-${season.id}`, category: "colors", title: season.name, subtitle: "Your color season" });
              showToast(`${season.name} saved — Outfit Lab & AI stylist now use it ✦`);
            }
          }}
          className={`flex-1 h-11 rounded-full text-[14px] font-bold press flex items-center justify-center gap-1.5 ${
            saved ? "bg-sage text-white" : "bg-cat-colors text-white"
          }`}
        >
          {saved ? <CheckIcon width={16} height={16} /> : null}
          {saved ? "Saved to profile" : "Make it mine"}
        </button>
      </div>
      <button onClick={onClose} className="tap-target w-full text-center text-[13px] font-semibold text-ink-3 mt-3">
        Close
      </button>
    </div>
  );
}

/* ---------- wizard ---------- */

export function SeasonAnalysis({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const done = step >= seasonQuiz.length;

  const result = useMemo(() => (done ? classifySeason(answers) : null), [done, answers]);

  if (done && result) {
    return (
      <SeasonResultView
        result={result}
        onClose={onClose}
        onRetake={() => {
          setStep(0);
          setAnswers([]);
        }}
      />
    );
  }

  const q = seasonQuiz[step];
  return (
    <div>
      <div className="flex gap-1.5 mb-5">
        {seasonQuiz.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-cat-colors" : "bg-surface-deep"}`} />
        ))}
      </div>
      <p className="eyebrow text-ink-3 mb-1">
        Question {step + 1} of {seasonQuiz.length}
      </p>
      <h3 className="font-display text-[19px] leading-[25px] text-ink">{q.q}</h3>
      <p className="text-[12px] italic text-ink-3 mt-1.5">{q.hint}</p>
      <div className="space-y-2.5 mt-5">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => {
              setAnswers((a) => [...a.slice(0, step), i]);
              setStep(step + 1);
            }}
            className="w-full text-left bg-surface-muted rounded-[14px] p-4 press hover:bg-terra-soft transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            <p className="text-[14.5px] font-semibold text-ink">{o.text}</p>
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="tap-target text-[13px] font-semibold text-ink-3 mt-4">
          ← back
        </button>
      )}
    </div>
  );
}

/* ---------- mini card: current season (shown in tab) ---------- */

export function SeasonBadge({ onOpen }: { onOpen: () => void }) {
  const { seasonResult } = useAurelia();
  const season: Season | undefined = seasonResult ? seasonById(seasonResult.id) : undefined;
  if (!season) return null;
  return (
    <Card onClick={onOpen} ariaLabel={`Open your ${season.name} palette`} className="p-4 flex items-center gap-3.5 mt-3">
      <div className="flex -space-x-1.5 shrink-0">
        {season.palette.slice(0, 5).map((s) => (
          <span key={s.hex} className="w-7 h-7 rounded-full border-2 border-surface" style={{ background: s.hex }} />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-bold text-ink leading-tight">You are {season.name}</p>
        <p className="text-[12px] text-ink-3 mt-0.5">Your saved season — tap to see your palette</p>
      </div>
      <span className="shrink-0 w-9 h-9 rounded-full grid place-items-center bg-cat-colors text-white" style={{ background: "var(--cat-colors)" }}>
        <CheckIcon width={16} height={16} />
      </span>
    </Card>
  );
}
