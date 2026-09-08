"use client";

/* ============================================================
   AURELIA — Photo Palette Analyzer (Color Lab)
   On-device computer vision: k-means over CIELAB pixels.
   The photo never leaves the phone — no upload, no network.
   ============================================================ */

import { useRef, useState } from "react";
import { extractPalette, type ExtractedSwatch } from "@/lib/palette-extract";
import { analyzeOutfit } from "@/lib/outfit-engine";
import { seasonById } from "@/data/seasons";
import { useAurelia } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import { CameraIcon, FlaskIcon } from "./icons";

type Phase = "idle" | "working" | "done" | "error";

export function PhotoAnalyzer({ onUseInLab }: { onUseInLab: (hexes: string[]) => void }) {
  const { seasonResult } = useAurelia();
  const season = seasonResult ? seasonById(seasonResult.id) ?? null : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<ExtractedSwatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhase("error");
      setError("That file isn't an image — try a photo ✦");
      return;
    }
    setPhase("working");
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    try {
      const result = await extractPalette(file, 6);
      setSwatches(result);
      setPhase("done");
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error && e.message.includes("uniform") ? "That photo is a single flat color — try one with a few tones." : "Couldn't read that photo — try another one ✦");
    }
  };

  const top3 = swatches.slice(0, 3).map((s) => s.hex);
  const analysis = top3.length >= 2 ? analyzeOutfit(top3, season) : null;
  const warmCount = swatches.filter((s) => s.warmth > 0.25).length;
  const coolCount = swatches.filter((s) => s.warmth < -0.25).length;
  const neutralCount = swatches.filter((s) => s.neutral).length;
  const mood =
    warmCount > coolCount ? "warm-leaning" : coolCount > warmCount ? "cool-leaning" : "temperature-balanced";

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Photograph an outfit, a fabric or a mood-board and k-means clustering in CIELAB space pulls out its true palette — computed entirely on your device. Nothing is ever uploaded.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Choose a photo to analyze"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="mt-4 w-full rounded-[16px] border border-dashed border-line p-5 press hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
      >
        <CameraIcon width={30} height={30} className="mx-auto text-cat-colors" />
        <p className="text-[14px] font-bold text-ink mt-2">{phase === "done" ? "Analyze another photo" : "Choose a photo"}</p>
        <p className="text-[12px] text-ink-3 mt-0.5">JPG or PNG · analyzed offline on-device</p>
      </button>

      {phase === "working" && (
        <div className="mt-4 space-y-2" role="status" aria-live="polite">
          <p className="text-[13px] font-semibold text-ink-2">Clustering pixels in Lab space…</p>
          <div className="h-1.5 rounded-full bg-surface-deep overflow-hidden">
            <div className="h-full w-1/3 bg-cat-colors rounded-full animate-[shimmer_1.1s_ease-in-out_infinite]" style={{ background: "var(--cat-colors)" }} />
          </div>
        </div>
      )}

      {phase === "error" && error && (
        <div className="mt-4 rounded-[14px] bg-honey-soft border border-line-soft p-3.5">
          <p className="text-[13px] text-ink-2">{error}</p>
        </div>
      )}

      {phase === "done" && preview && swatches.length > 0 && (
        <div className="mt-5 space-y-3">
          {/* preview + swatches */}
          <div className="flex gap-3.5 items-stretch">
            <div className="relative w-24 h-32 rounded-[14px] overflow-hidden border border-line shrink-0">
              <img src={preview} alt="Photo you analyzed" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              {swatches.map((s) => (
                <div key={s.hex} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-[8px] border border-line shrink-0" style={{ background: s.hex }} />
                  <span className="text-[11px] font-bold text-ink w-[74px] shrink-0 truncate">{s.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-deep overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(4, s.share * 100)}%`, background: s.hex }} />
                  </div>
                  <span className="text-[10px] text-ink-3 w-8 text-right">{Math.round(s.share * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* temperature read */}
          <Card className="p-4">
            <Eyebrow color="var(--cat-colors)">Temperature read</Eyebrow>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Chip color="var(--terra)">{mood}</Chip>
              {neutralCount > 0 && <Chip soft>{neutralCount} neutral{neutralCount > 1 ? "s" : ""}</Chip>}
              {warmCount > 0 && <Chip color="var(--honey)">{warmCount} warm</Chip>}
              {coolCount > 0 && <Chip color="var(--cat-skin)">{coolCount} cool</Chip>}
            </div>
            <p className="text-[12.5px] leading-[18px] text-ink-3 mt-2.5">
              Warmth scored per-cluster from CIELAB hue angle and the b* (yellow↔blue) axis.
            </p>
          </Card>

          {/* outfit analysis on dominant colors */}
          {analysis && (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Eyebrow color="var(--cat-colors)">Dominant-color outfit score</Eyebrow>
                  <p className="font-display text-[17px] text-ink mt-1.5">{analysis.verdict}</p>
                  <p className="text-[12px] text-ink-3 mt-0.5">
                    {analysis.relationLabel} · {analysis.contrast.level} contrast · ΔL {analysis.contrast.spread}
                  </p>
                </div>
                <div className="shrink-0 grid place-items-center w-16 h-16 rounded-full border-[5px]" style={{ borderColor: "var(--cat-colors)", color: "var(--ink)" }} aria-label={`score ${analysis.score}`}>
                  <span className="font-display text-[19px]">{analysis.score}</span>
                </div>
              </div>
              {analysis.factors.slice(0, 3).map((f) => (
                <p key={f.label} className="text-[12.5px] leading-[17px] text-ink-3 mt-2">
                  <span className="font-bold text-ink-2">{f.label}: </span>
                  {f.note}
                </p>
              ))}
              {season && (
                <p className="text-[12.5px] leading-[17px] text-ink-2 mt-2.5 rounded-[12px] bg-surface-muted p-2.5">
                  Season fit vs your {season.name} palette: <b>{analysis.seasonFit?.overall}/100</b>
                </p>
              )}
            </Card>
          )}

          <button
            onClick={() => onUseInLab(swatches.slice(0, 4).map((s) => s.hex))}
            className="w-full h-11 rounded-full bg-cat-colors text-white text-[14px] font-bold press flex items-center justify-center gap-2"
            style={{ background: "var(--cat-colors)" }}
          >
            <FlaskIcon width={17} height={17} />
            Open these in the Outfit Lab
          </button>
        </div>
      )}
    </div>
  );
}
