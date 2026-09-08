"use client";

/* ============================================================
   AURELIA — Outfit Lab (Color Lab)
   Pick 2-4 colors → the outfit engine scores hue geometry,
   light-dark balance, chroma & warmth coherence, and your
   personal-season fit. Pure math, zero guessing.
   ============================================================ */

import { useMemo, useState } from "react";
import { wardrobeColors, colorShortNames, type WardrobeColor } from "@/data/colors";
import { seasonById } from "@/data/seasons";
import { analyzeOutfit, type OutfitAnalysis } from "@/lib/outfit-engine";
import { useAurelia } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import { FlaskIcon } from "./icons";

const MAX_PICKS = 4;

function ScoreRing({ score, size = 84 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 82 ? "var(--success)" : score >= 68 ? "var(--cat-colors)" : score >= 55 ? "var(--gold)" : "var(--error)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Outfit score ${score} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-deep)" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.32,0.72,0,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[22px] text-ink">{score}</span>
      </div>
    </div>
  );
}

function RoleBar({ analysis }: { analysis: OutfitAnalysis }) {
  const { base, secondary, accent } = analysis.roles;
  return (
    <div className="rounded-[14px] bg-surface-muted p-3.5">
      <Eyebrow color="var(--cat-colors)">Wear it 60 · 30 · 10</Eyebrow>
      <div className="flex h-9 rounded-[10px] overflow-hidden border border-line-soft mt-2.5">
        <div className="flex-[6] grid place-items-center" style={{ background: base }} aria-label={`60 percent ${base}`}>
          <span className="text-[10px] font-bold" style={{ color: readableOn(base) }}>60%</span>
        </div>
        <div className="flex-[3] grid place-items-center" style={{ background: secondary }} aria-label={`30 percent ${secondary}`}>
          <span className="text-[10px] font-bold" style={{ color: readableOn(secondary) }}>30%</span>
        </div>
        {accent && (
          <div className="flex-[1] grid place-items-center" style={{ background: accent }} aria-label={`10 percent ${accent}`}>
            <span className="text-[9px] font-bold" style={{ color: readableOn(accent) }}>10</span>
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-2.5 text-[11px] text-ink-3">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] border border-line-soft" style={{ background: base }} />base</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] border border-line-soft" style={{ background: secondary }} />second</span>
        {accent && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] border border-line-soft" style={{ background: accent }} />pop</span>}
      </div>
    </div>
  );
}

/* WCAG-aware label color for swatch backgrounds */
function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const Y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return Y > 0.35 ? "rgba(45,35,32,0.85)" : "rgba(255,255,255,0.92)";
}

export function OutfitLab({ seed = [] }: { seed?: string[] }) {
  const { seasonResult } = useAurelia();
  const season = seasonResult ? seasonById(seasonResult.id) ?? null : null;
  const [picked, setPicked] = useState<string[]>(seed);
  const [custom, setCustom] = useState("");

  const analysis: OutfitAnalysis | null = useMemo(
    () => (picked.length >= 2 ? analyzeOutfit(picked, season) : null),
    [picked, season],
  );

  const toggle = (c: WardrobeColor) => {
    setPicked((p) => {
      if (p.includes(c.hex)) return p.filter((x) => x !== c.hex);
      if (p.length >= MAX_PICKS) return [...p.slice(1), c.hex]; // roll oldest out
      return [...p, c.hex];
    });
  };

  const addCustom = () => {
    const hex = custom.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
    setPicked((p) => (p.includes(hex) ? p : [...p.slice(p.length >= MAX_PICKS ? 1 : 0), hex]));
    setCustom("");
  };

  const statusIcon = { good: "✓", ok: "•", warn: "!" };
  const statusColor = { good: "var(--success)", ok: "var(--gold)", warn: "var(--error)" };

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Pick 2–4 colors — from the wardrobe or your own hex — and the engine scores the combination on hue geometry, light-dark balance, intensity and warmth, {season ? "plus your season fit." : "using CIELCh color math."}
      </p>

      {/* picked colors */}
      <div className="flex items-center gap-2 mt-4 min-h-[44px] flex-wrap">
        {picked.length === 0 && <p className="text-[12.5px] text-ink-3 italic">Nothing picked yet — tap swatches below</p>}
        {picked.map((hex, i) => (
          <button
            key={hex + i}
            onClick={() => setPicked((p) => p.filter((x, idx) => !(x === hex && idx === i)))}
            aria-label={`Remove ${hex}`}
            className="press relative w-10 h-10 rounded-full border-2 border-surface shadow-[0_2px_6px_rgba(45,35,32,0.12)]"
            style={{ background: hex }}
          >
            <span
              className="absolute -top-1 -right-1 grid place-items-center rounded-full w-[18px] h-[18px] text-white text-[10px] font-bold"
              style={{ background: "var(--ink-900)" }}
            >
              ✕
            </span>
          </button>
        ))}
        {picked.length > 0 && (
          <button onClick={() => setPicked([])} className="tap-target text-[12px] font-semibold text-ink-3 ml-1">
            clear
          </button>
        )}
      </div>

      {/* custom hex */}
      <div className="flex gap-2 mt-3">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="#C97B58"
          aria-label="Add a custom color by hex code"
          className="flex-1 h-11 rounded-[14px] border border-line bg-surface px-4 text-[14px] font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
        />
        <div className="w-11 h-11 rounded-[14px] border border-line overflow-hidden grid place-items-center shrink-0" aria-hidden>
          <input
            type="color"
            aria-label="Color picker"
            onChange={(e) => setCustom(e.target.value.toUpperCase())}
            className="w-14 h-14 -m-2 cursor-pointer bg-transparent border-none"
            tabIndex={-1}
          />
        </div>
        <button onClick={addCustom} className="h-11 px-4 rounded-full bg-cat-colors text-white text-[13px] font-bold press shrink-0" style={{ background: "var(--cat-colors)" }}>
          Add
        </button>
      </div>

      {/* wardrobe swatches */}
      <div className="grid grid-cols-6 gap-x-2.5 gap-y-3.5 mt-5">
        {wardrobeColors.map((c) => {
          const on = picked.includes(c.hex);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c)}
              aria-label={`${c.name} ${on ? "selected" : "not selected"}`}
              aria-pressed={on}
              className="press flex flex-col items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded-xl"
            >
              <span
                className="w-11 h-11 rounded-full border transition-all"
                style={{ background: c.hex, borderColor: on ? "var(--cat-colors)" : "var(--line, #E8E0D8)", boxShadow: on ? "0 0 0 2px color-mix(in srgb, var(--cat-colors) 35%, transparent)" : undefined, transform: on ? "scale(1.08)" : undefined }}
              />
              <span className="text-[9.5px] leading-[12px] font-semibold text-ink-2 text-center max-w-full truncate">
                {colorShortNames[c.id] ?? c.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* analysis */}
      {analysis ? (
        <div className="mt-6 space-y-3">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={analysis.score} />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <Chip color="var(--cat-colors)">{analysis.relationLabel}</Chip>
                  <Chip soft>{analysis.contrast.level} contrast</Chip>
                </div>
                <p className="font-display text-[18px] text-ink mt-1.5 leading-tight">{analysis.verdict}</p>
                <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1">{analysis.headline}</p>
              </div>
            </div>
          </Card>

          <RoleBar analysis={analysis} />

          <div className="space-y-2">
            {analysis.factors.map((f) => (
              <div key={f.label} className="flex gap-3 items-start bg-surface-muted rounded-[14px] p-3.5">
                <span
                  className="shrink-0 grid place-items-center w-6 h-6 rounded-full text-[12px] font-bold mt-0.5"
                  style={{ background: `color-mix(in srgb, ${statusColor[f.status]} 16%, transparent)`, color: statusColor[f.status] }}
                >
                  {statusIcon[f.status]}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-ink leading-tight">{f.label}</p>
                  <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1">{f.note}</p>
                </div>
              </div>
            ))}
          </div>

          {analysis.seasonFit && (
            <Card className="p-4">
              <Eyebrow color="var(--cat-colors)">Season fit per color (ΔE2000)</Eyebrow>
              <div className="space-y-2 mt-2.5">
                {analysis.seasonFit.items.map((it) => {
                  const w = Math.max(6, it.score);
                  const col = it.verdict === "excellent" || it.verdict === "good" ? "var(--success)" : it.verdict === "risky" ? "var(--gold)" : "var(--error)";
                  return (
                    <div key={it.hex} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border border-line shrink-0" style={{ background: it.hex }} />
                      <div className="flex-1 h-2 rounded-full bg-surface-deep overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${w}%`, background: col, transition: "width 0.4s" }} />
                      </div>
                      <span className="text-[11px] font-semibold text-ink-2 w-8 text-right">{it.score}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-[16px] border border-dashed border-line p-5 text-center">
          <FlaskIcon width={26} height={26} className="mx-auto text-ink-3" />
          <p className="text-[13px] text-ink-3 mt-2">Pick at least 2 colors and the analysis appears — instantly, offline.</p>
        </div>
      )}
    </div>
  );
}
