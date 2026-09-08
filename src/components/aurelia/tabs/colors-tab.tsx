"use client";

/* ============================================================
   AURELIA — Colors tab
   Matching engine · palettes · undertone finder · theory
   ============================================================ */

import { useMemo, useState, useEffect } from "react";
import {
  wardrobeColors,
  palettes,
  getMatchesFor,
  colorById,
  colorShortNames,
  theorySchemes,
  colorRules,
  rule6030,
  undertoneQuiz,
  undertoneResults,
  type WardrobeColor,
  type Palette,
} from "@/data/colors";
import { Card, Chip, Eyebrow, SectionHeader, ScreenTitle, DotList, StepRow } from "./../bits";
import { BottomSheet, type SheetData } from "./../sheet";
import { LightbulbIcon, AlertIcon, ArrowRightIcon, ShareIcon, FlaskIcon, CameraIcon, SwatchDropIcon } from "./../icons";
import { useAurelia } from "@/lib/store";
import { shareText } from "@/lib/share";
import { SeasonAnalysis, SeasonBadge } from "../season-analysis";
import { OutfitLab } from "../outfit-lab";
import { PhotoAnalyzer } from "../photo-analyzer";

const ACCENT = "var(--cat-colors)";

/* ---------- Swatch grid ---------- */

function SwatchGrid({ onPick }: { onPick: (c: WardrobeColor) => void }) {
  return (
    <div className="grid grid-cols-4 gap-x-3 gap-y-4">
      {wardrobeColors.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          aria-label={`${c.name} — see what pairs with it`}
          className="press flex flex-col items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded-xl group"
        >
          <span
            className="w-14 h-14 rounded-full border border-line shadow-[0_2px_6px_rgba(45,35,32,0.08)] transition-transform group-hover:scale-105"
            style={{ background: c.hex }}
          />
          <span className="text-[10.5px] leading-[13px] font-semibold text-ink-2 text-center max-w-full truncate">
            {colorShortNames[c.id] ?? c.name}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Color detail sheet body ---------- */

function ColorDetail({ color }: { color: WardrobeColor }) {
  const matches = useMemo(() => getMatchesFor(color.id), [color.id]);
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="w-16 h-16 rounded-[18px] border border-line" style={{ background: color.hex }} />
        <div className="min-w-0">
          <p className="text-[14px] text-ink-3 uppercase tracking-wider text-[12px]">{color.hex}</p>
          <p className="text-[14px] text-ink-2 leading-snug mt-1">{color.undertone}</p>
        </div>
      </div>
      <p className="text-[13px] italic text-ink-3 mt-3">“{color.vibe}”</p>

      <h3 className="font-display text-[17px] text-ink mt-5 mb-1">Pairs beautifully</h3>
      <div className="space-y-2.5">
        {matches.map((m) => (
          <div key={m.color.id} className="flex items-start gap-3 bg-surface-muted rounded-[14px] p-3">
            <span className="shrink-0 w-9 h-9 rounded-full border border-line" style={{ background: m.color.hex }} />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink leading-tight">{m.color.name}</p>
              <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1">{m.why}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-display text-[17px] text-ink mt-6 mb-2 flex items-center gap-1.5">
        <AlertIcon width={16} height={16} className="text-honey" /> Handle with care
      </h3>
      <div className="space-y-2">
        {color.cautions.map((c) => (
          <div key={c.name} className="flex items-start gap-3 rounded-[14px] p-3 bg-honey-soft">
            <span className="shrink-0 w-9 h-9 rounded-full border border-line" style={{ background: c.hex }} />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink leading-tight">{c.name}</p>
              <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1">{c.why}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 mt-6 rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
        <LightbulbIcon width={16} height={16} className="text-gold shrink-0 mt-0.5" />
        <p className="text-[13px] leading-[19px] text-ink-2">{color.secret}</p>
      </div>
    </div>
  );
}

/* ---------- Palette detail body ---------- */

function PaletteDetail({ palette }: { palette: Palette }) {
  return (
    <div>
      <div className="flex gap-1.5">
        {palette.swatches.map((s) => (
          <div key={s.name} className="flex-1 min-w-0">
            <div className="w-full h-16 rounded-[12px] border border-line-soft" style={{ background: s.hex }} />
            <p className="text-[10px] text-ink-3 text-center mt-1 truncate">{s.name}{s.accent ? " ✦" : ""}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <Chip soft>{palette.season}</Chip>
        <Chip soft>{palette.occasion}</Chip>
      </div>
      <p className="text-[13px] italic text-ink-3 mt-3">{palette.mood}</p>
      <h3 className="font-display text-[17px] text-ink mt-5">Why it works</h3>
      <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{palette.why}</p>
      <h3 className="font-display text-[17px] text-ink mt-5">Wear it like this</h3>
      <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{palette.outfit}</p>
    </div>
  );
}

/* ---------- Undertone finder (sheet quiz) ---------- */

function UndertoneFinder({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { showToast } = useAurelia();
  const done = step >= undertoneQuiz.length;
  const result = useMemo(() => {
    if (!done) return null;
    const tally = { warm: 0, cool: 0, neutral: 0 } as Record<string, number>;
    answers.forEach((a, i) => {
      const r = undertoneQuiz[i].options[a].result;
      tally[r] = (tally[r] ?? 0) + 1;
    });
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    return undertoneResults[winner as "warm" | "cool" | "neutral"];
  }, [done, answers]);

  return (
    <div>
      {!done ? (
        <div>
          <div className="flex gap-1.5 mb-5">
            {undertoneQuiz.map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-cat-colors" : "bg-surface-deep"}`} />
            ))}
          </div>
          <p className="eyebrow text-ink-3 mb-1">Question {step + 1} of {undertoneQuiz.length}</p>
          <h3 className="font-display text-[18px] leading-[24px] text-ink">{undertoneQuiz[step].q}</h3>
          <div className="space-y-2.5 mt-5">
            {undertoneQuiz[step].options.map((o, i) => (
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
      ) : (
        result && (
          <div>
            <p className="eyebrow" style={{ color: ACCENT }}>Your undertone</p>
            <h3 className="font-display text-[22px] text-ink mt-1">{result.name}</h3>
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {result.glow.map((g, i) => (
                <span
                  key={g}
                  className="w-10 h-10 rounded-full border border-line"
                  style={{ background: result.glowHexes[i] }}
                  title={g}
                />
              ))}
            </div>
            <h3 className="font-display text-[17px] text-ink mt-5">Colors that glow on you</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.glow.map((g) => (
                <Chip key={g} soft>{g}</Chip>
              ))}
            </div>
            <h3 className="font-display text-[17px] text-ink mt-5">Handle with care</h3>
            <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{result.care}</p>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                }}
                className="flex-1 h-11 rounded-full border border-line text-[14px] font-bold text-ink-2 press"
              >
                Retake
              </button>
              <button
                aria-label="Share your undertone result"
                onClick={async () => {
                  const res = await shareText({
                    title: `My undertone: ${result.name}`,
                    text: `My undertone is ${result.name} — glow colors: ${result.glow.slice(0, 3).join(", ")}. Found via Aurelia ✦`,
                  });
                  if (res === "copied") showToast("Result copied ✦");
                }}
                className="h-11 w-11 rounded-full border border-line text-ink-2 press grid place-items-center shrink-0"
              >
                <ShareIcon width={19} height={19} />
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-full bg-rose text-white text-[14px] font-bold press"
              >
                Got it
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ---------- Tab ---------- */

export function ColorsTab() {
  const { focus, setFocus } = useAurelia();
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [sheetBody, setSheetBody] = useState<"color" | "palette" | "undertone" | "theory" | "season" | "lab" | "photo">("color");
  const [activeColor, setActiveColor] = useState<WardrobeColor | null>(null);
  const [activePalette, setActivePalette] = useState<Palette | null>(null);
  const [activeTheory, setActiveTheory] = useState<(typeof theorySchemes)[0] | null>(null);
  const [undertoneOpen, setUndertoneOpen] = useState(false);
  const [labSeed, setLabSeed] = useState<string[]>([]);

  const openColor = (c: WardrobeColor) => {
    setActiveColor(c);
    setSheetBody("color");
    setSheet({ id: `color-${c.id}`, category: "colors", eyebrow: "Color match", title: c.name, subtitle: c.hex, accent: ACCENT });
  };
  const openPalette = (p: Palette) => {
    setActivePalette(p);
    setSheetBody("palette");
    setSheet({ id: `palette-${p.id}`, category: "colors", eyebrow: "Outfit palette", title: p.name, subtitle: p.occasion, accent: ACCENT });
  };
  const openSeason = () => {
    setSheetBody("season");
    setSheet({ id: "season-analysis", category: "colors", eyebrow: "Personal color analysis", title: "Find your season", subtitle: "12 seasons · 7 questions", accent: ACCENT });
  };
  const openLab = (seed: string[] = []) => {
    setLabSeed(seed);
    setSheetBody("lab");
    setSheet({ id: "outfit-lab", category: "colors", eyebrow: "Outfit Lab", title: "Score a combination", subtitle: "CIELCh color math · offline", accent: ACCENT });
  };
  const openPhoto = () => {
    setSheetBody("photo");
    setSheet({ id: "photo-analyzer", category: "colors", eyebrow: "Photo → Palette", title: "Extract a palette", subtitle: "On-device k-means · private", accent: ACCENT });
  };

  /* deep-open from global search (e.g. "navy", "capsule neutrals", "color lab") */
  useEffect(() => {
    if (focus?.category !== "colors") return;
    const id = focus.id;
    const t = setTimeout(() => {
      setFocus(null);
      if (id === "lab-season") {
        openSeason();
      } else if (id === "lab-outfit") {
        openLab();
      } else if (id === "lab-photo") {
        openPhoto();
      } else if (id.startsWith("color-")) {
        const c = colorById(id.replace("color-", ""));
        if (c) openColor(c);
      } else if (id.startsWith("palette-")) {
        const p = palettes.find((x) => x.id === id.replace("palette-", ""));
        if (p) openPalette(p);
      } else if (id.startsWith("theory-")) {
        const s = theorySchemes.find((x) => x.id === id.replace("theory-", ""));
        if (s) {
          setActiveTheory(s);
          setSheetBody("theory");
          setSheet({ id: `theory-${s.id}`, category: "colors", eyebrow: "Color theory", title: s.name, subtitle: s.tagline, accent: ACCENT });
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [focus]);

  return (
    <div className="fade-in">
      <ScreenTitle eyebrow="Color Combos" title="What goes with what" accent={ACCENT}>
        <p className="text-[14px] leading-[21px] text-ink-2">Tap a color to see its best friends — and the frenemies.</p>
      </ScreenTitle>

      {/* ── The Color Lab — real color science, on-device ── */}
      <section className="mt-5">
        <SectionHeader eyebrow="The Color Lab" title="Lab-grade tools" accent={ACCENT} />
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={openSeason}
            aria-label="Open the 12-season personal color analysis"
            className="text-left rounded-[16px] border border-line bg-[linear-gradient(135deg,var(--terra-soft),var(--surface))] p-4 press outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            <div className="flex items-center gap-3.5">
              <span className="grid place-items-center w-11 h-11 rounded-[14px] bg-surface text-cat-colors shrink-0" style={{ color: "var(--cat-colors)", background: "var(--surface)" }}>
                <SwatchDropIcon width={22} height={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-ink leading-tight">12-Season Color Analysis</p>
                <p className="text-[12px] leading-[16px] text-ink-3 mt-0.5">7 questions → your season, palette & metals — vector-space classifier</p>
              </div>
              <ArrowRightIcon width={16} height={16} className="text-ink-3 shrink-0" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Card onClick={() => openLab()} ariaLabel="Open the Outfit Lab" className="p-4">
              <span className="grid place-items-center w-10 h-10 rounded-[12px] bg-terra-soft shrink-0" style={{ background: "var(--terra-soft)", color: "var(--cat-colors)" }}>
                <FlaskIcon width={20} height={20} />
              </span>
              <p className="text-[14.5px] font-bold text-ink mt-3 leading-tight">Outfit Lab</p>
              <p className="text-[11.5px] leading-[15px] text-ink-3 mt-1">Score any 2–4 colors with real color math</p>
            </Card>
            <Card onClick={openPhoto} ariaLabel="Open the photo palette analyzer" className="p-4">
              <span className="grid place-items-center w-10 h-10 rounded-[12px] shrink-0" style={{ background: "var(--rose-soft)", color: "var(--cat-colors)" }}>
                <CameraIcon width={20} height={20} />
              </span>
              <p className="text-[14.5px] font-bold text-ink mt-3 leading-tight">Photo → Palette</p>
              <p className="text-[11.5px] leading-[15px] text-ink-3 mt-1">Pull colors from a photo, fully on-device</p>
            </Card>
          </div>

          <SeasonBadge onOpen={openSeason} />
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader eyebrow="The match engine" title="Pick a color" accent={ACCENT} />
        <SwatchGrid onPick={openColor} />
      </section>

      <section className="mt-9">
        <SectionHeader eyebrow="Curated palettes" title="Steal these outfits" accent={ACCENT} />
        <div className="space-y-3">
          {palettes.slice(0, 6).map((p) => (
            <Card key={p.id} onClick={() => openPalette(p)} ariaLabel={`Open palette ${p.name}`} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-ink">{p.name}</p>
                  <p className="text-[12.5px] text-ink-3 mt-0.5">{p.mood}</p>
                </div>
                <div className="flex -space-x-1.5 shrink-0">
                  {p.swatches.slice(0, 4).map((s) => (
                    <span key={s.name} className="w-7 h-7 rounded-full border-2 border-surface" style={{ background: s.hex }} />
                  ))}
                </div>
                <ArrowRightIcon width={16} height={16} className="text-ink-3 shrink-0" />
              </div>
            </Card>
          ))}
        </div>
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none tap-target flex items-center justify-center h-11 rounded-[14px] border border-dashed border-line text-[13px] font-semibold text-ink-2 group-open:hidden">
            Show all {palettes.length} palettes
          </summary>
          <div className="space-y-3">
            {palettes.slice(6).map((p) => (
              <Card key={p.id} onClick={() => openPalette(p)} ariaLabel={`Open palette ${p.name}`} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-ink">{p.name}</p>
                    <p className="text-[12.5px] text-ink-3 mt-0.5">{p.mood}</p>
                  </div>
                  <div className="flex -space-x-1.5 shrink-0">
                    {p.swatches.slice(0, 4).map((s) => (
                      <span key={s.name} className="w-7 h-7 rounded-full border-2 border-surface" style={{ background: s.hex }} />
                    ))}
                  </div>
                  <ArrowRightIcon width={16} height={16} className="text-ink-3 shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </details>
      </section>

      <section className="mt-9">
        <SectionHeader eyebrow="Know yourself" title="Find your undertone" accent={ACCENT} />
        <Card className="p-5 bg-[linear-gradient(135deg,var(--terra-soft),var(--surface))] border-line">
          <p className="text-[14px] leading-[21px] text-ink-2">
            Three quick questions — veins, jewelry, and a white sheet of paper — and we&apos;ll show you the color families that make you glow.
          </p>
          <button
            onClick={() => {
              setUndertoneOpen(true);
              setSheetBody("undertone");
              setSheet({ id: "undertone-finder", category: "colors", eyebrow: "Undertone finder", title: "3 quick tests", subtitle: "Natural daylight, bare face", accent: ACCENT });
            }}
            className="mt-4 w-full h-11 rounded-full bg-cat-colors text-white text-[14px] font-bold press"
          >
            Start the 60-second test
          </button>
        </Card>
      </section>

      <section className="mt-9">
        <SectionHeader eyebrow="Color theory" title="The crash course" accent={ACCENT} />
        <div className="grid grid-cols-2 gap-3">
          {theorySchemes.map((s) => (
            <Card
              key={s.id}
              onClick={() => {
                setActiveTheory(s);
                setSheetBody("theory");
                setSheet({ id: `theory-${s.id}`, category: "colors", eyebrow: "Color theory", title: s.name, subtitle: s.tagline, accent: ACCENT });
              }}
              className="p-4"
              ariaLabel={`Open ${s.name} scheme`}
            >
              <Eyebrow color={ACCENT}>{s.tagline}</Eyebrow>
              <p className="font-display text-[16px] text-ink mt-1">{s.name}</p>
              <p className="text-[12px] leading-[16px] text-ink-3 mt-1.5 line-clamp-2">{s.desc}</p>
            </Card>
          ))}
        </div>

        {/* 60-30-10 */}
        <Card className="p-5 mt-3">
          <Eyebrow color={ACCENT}>The golden ratio of outfits</Eyebrow>
          <h3 className="font-display text-[18px] text-ink mt-1">{rule6030.title}</h3>
          <p className="text-[13.5px] leading-[20px] text-ink-2 mt-2">{rule6030.desc}</p>
          <div className="mt-4 space-y-2">
            {[
              { pct: "60%", ...rule6030.example.sixty },
              { pct: "30%", ...rule6030.example.thirty },
              { pct: "10%", ...rule6030.example.ten },
            ].map((row) => (
              <div key={row.pct} className="flex items-center gap-3">
                <span className="font-display w-8 text-[15px] text-ink">{row.pct}</span>
                <span className="w-8 h-8 rounded-lg border border-line shrink-0" style={{ background: row.hex }} />
                <span className="text-[13px] text-ink-2">{row.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] italic text-ink-3 mt-3">{rule6030.example.note}</p>
        </Card>
      </section>

      <section className="mt-9 mb-2">
        <SectionHeader eyebrow="Rules of thumb" title="10 laws to live by" accent={ACCENT} />
        <div className="space-y-2.5">
          {colorRules.map((r, i) => (
            <div key={r.title} className="flex gap-3 items-start bg-surface-muted rounded-[14px] p-3.5">
              <span className="font-display shrink-0 grid place-items-center w-7 h-7 rounded-full bg-surface text-cat-colors text-[13px] font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-bold text-ink leading-tight">{r.title}</p>
                <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomSheet
        data={sheet}
        onClose={() => {
          setSheet(null);
          setUndertoneOpen(false);
        }}
      >
        {sheetBody === "color" && activeColor && <ColorDetail color={activeColor} />}
        {sheetBody === "palette" && activePalette && <PaletteDetail palette={activePalette} />}
        {sheetBody === "undertone" && <UndertoneFinder onClose={() => setSheet(null)} />}
        {sheetBody === "season" && <SeasonAnalysis onClose={() => setSheet(null)} />}
        {sheetBody === "lab" && <OutfitLab key={labSeed.join("-") || "empty"} seed={labSeed} />}
        {sheetBody === "photo" && <PhotoAnalyzer onUseInLab={(hexes) => openLab(hexes)} />}
        {sheetBody === "theory" && activeTheory && (
          <div>
            <p className="text-[14px] leading-[21px] text-ink-2">{activeTheory.desc}</p>
            <h3 className="font-display text-[17px] text-ink mt-5 mb-2">Try it</h3>
            <DotList color={ACCENT}>{activeTheory.examples}</DotList>
            <div className="flex items-start gap-2.5 mt-5 rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
              <LightbulbIcon width={16} height={16} className="text-gold shrink-0 mt-0.5" />
              <p className="text-[13px] leading-[19px] text-ink-2">{activeTheory.tip}</p>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
