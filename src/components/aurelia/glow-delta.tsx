"use client";

/* ============================================================
   AURELIA — Glow Delta capture (Makeup tab)
   ------------------------------------------------------------
   The measurable outcome card: before/after selfies, same
   white reference in both, tap 4 spots per photo → per-region
   ΔE2000, luminance lift, redness shift, evenness change.
   Everything on-device; the photos never leave the phone;
   the numbers describe CHANGE, never "beauty".
   Paper lineage: Kim 2023 (docs/RESEARCH-PAPERS.md §3).
   ============================================================ */

import { useRef, useState } from "react";
import {
  buildGlowDelta,
  GLOW_REGIONS,
  type GlowPhoto,
  type GlowRegion,
  type GlowResult,
  type RegionDelta,
} from "@/lib/glow-delta";
import type { PatchSample } from "@/lib/skin-signature";
import { labToHex } from "@/lib/color-science";
import { shareCard } from "@/lib/share";
import { useAurelia } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import {
  CameraIcon,
  RefreshIcon,
  ShareIcon,
  SparkleIcon,
  AlertIcon,
  CheckIcon,
} from "./icons";

type Phase = "intro" | "before" | "afterIntro" | "after" | "result";
type Step = "white" | GlowRegion;

const STEPS: Step[] = ["white", "cheek", "jaw", "forehead"];

const STEP_PROMPTS: Record<Step, { title: string; hint: string }> = {
  white: { title: "Tap the white thing", hint: "The tissue or paper — it stays in BOTH photos." },
  cheek: { title: "Tap your cheek", hint: "Center of the cheek, same spot both times." },
  jaw: { title: "Tap your jaw", hint: "Along the jawline, away from hair." },
  forehead: { title: "Tap your forehead", hint: "Center of the forehead — one more and we measure." },
};

export function GlowDelta() {
  const { showToast } = useAurelia();
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapDims = useRef<{ w: number; h: number } | null>(null);
  const whichRef = useRef<"before" | "after">("before");

  const beforeRef = useRef<GlowPhoto | null>(null);
  const afterRef = useRef<GlowPhoto | null>(null);
  const pendingRef = useRef<PatchSample | null>(null); // white ref of the photo being tapped
  const pendingPatches = useRef<Partial<Record<GlowRegion, PatchSample>>>({});

  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState<Step>("white");
  const [taps, setTaps] = useState<{ x: number; y: number }[]>([]);
  const [result, setResult] = useState<GlowResult | null>(null);

  const reset = () => {
    setPhase("intro");
    setStep("white");
    setTaps([]);
    setResult(null);
    canvasRef.current = null;
    bitmapDims.current = null;
    beforeRef.current = null;
    afterRef.current = null;
    pendingRef.current = null;
    pendingPatches.current = {};
  };

  const startPhoto = (which: "before" | "after") => {
    whichRef.current = which;
    setPhase(which);
    setStep("white");
    setTaps([]);
    setResult(null);
    pendingRef.current = null;
    pendingPatches.current = {};
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("That file isn't an image — try a photo ✦");
      setPhase("intro");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxDim = 1080;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, w, h);
      canvasRef.current = canvas;
      bitmapDims.current = { w: img.naturalWidth, h: img.naturalHeight };
      if (imgRef.current) imgRef.current.src = url;
      setTaps([]);
      setStep("white");
    };
    img.onerror = () => {
      showToast("Couldn't read that photo — try another ✦");
      setPhase("intro");
    };
    img.src = url;
  };

  const onTap = (e: React.MouseEvent<HTMLImageElement>) => {
    if ((phase !== "before" && phase !== "after") || !canvasRef.current) return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    /* 15×15 patch mean — same sampler as Skin Signature */
    const size = 15;
    const half = Math.floor(size / 2);
    const px = Math.max(0, Math.min(canvasRef.current.width - size, Math.round(x) - half));
    const py = Math.max(0, Math.min(canvasRef.current.height - size, Math.round(y) - half));
    const data = canvasRef.current.getContext("2d", { willReadFrequently: true })!.getImageData(px, py, size, size).data;
    let r = 0, g = 0, b = 0;
    const n = size * size;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const sample: PatchSample = { r: r / n, g: g / n, b: b / n };
    setTaps((t) => [...t, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);

    if (step === "white") {
      pendingRef.current = sample;
      setStep("cheek");
      return;
    }

    pendingPatches.current[step] = sample;
    const nextIdx = STEPS.indexOf(step) + 1;
    if (nextIdx < STEPS.length) {
      setStep(STEPS[nextIdx]);
      return;
    }

    /* photo complete */
    if (!pendingRef.current) return;
    const photo: GlowPhoto = { ref: pendingRef.current, patches: pendingPatches.current as Record<GlowRegion, PatchSample> };
    if (whichRef.current === "before" || phase === "before") {
      beforeRef.current = photo;
      canvasRef.current = null;
      setTaps([]);
      setPhase("afterIntro");
      showToast("Before shot locked in ✦ now the after, same light if you can");
    } else {
      afterRef.current = photo;
      if (!beforeRef.current) {
        showToast("The before photo went missing — start over ✦");
        reset();
        return;
      }
      const res = buildGlowDelta(beforeRef.current, afterRef.current);
      setResult(res);
      setPhase("result");
    }
  };

  const share = async () => {
    if (!result?.ok) return;
    const cheek = result.regions.find((r) => r.region === "cheek");
    const swatches = cheek ? [labToHex(cheek.before), labToHex(cheek.after)] : undefined;
    const status = await shareCard({
      eyebrow: "Glow Delta ✦ measured, not guessed",
      title: result.headline,
      subtitle: `luminance ${fmt(result.summary.glow)} · redness ${fmt(-result.summary.redness)} · evenness ${fmt(result.summary.evennessChange)}% — ΔE2000 colorimetry, on-device`,
      swatches,
      footer: "aurelia · glow delta · measures change, never beauty",
      text: result.shareText,
    });
    if (status === "copied") showToast("Card copied to clipboard ✦ paste it anywhere");
    if (status === "failed") showToast("Couldn't share — screenshot this card instead ✦");
  };

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        What did the look actually <em>do</em>? Photograph your face before and after — keep something white in both
        shots, tap four matching spots, and we measure the real colorimetric shift: luminance lift, redness change,
        evenness. On-device, nothing uploaded, and the numbers describe change — never "beauty".
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        aria-label="Choose a selfie for glow delta"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {phase === "intro" && (
        <div className="mt-4 space-y-3">
          <button
            onClick={() => startPhoto("before")}
            className="w-full rounded-[16px] border border-dashed border-line p-5 press hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            <CameraIcon width={30} height={30} className="mx-auto text-cat-makeup" />
            <p className="text-[14px] font-bold text-ink mt-2">Start with the before selfie</p>
            <p className="text-[12px] text-ink-3 mt-0.5">Bare face + a tissue in frame · daylight works best</p>
          </button>
          <p className="text-[11.5px] text-ink-3 leading-[16px]">
            Method: both photos are independently white-point corrected (von-Kries), then compared per region in
            CIELAB with ΔE2000 — the same measurement Kim 2023 uses for post-makeup color change, running in
            under a millisecond on your phone. See docs/RESEARCH-PAPERS.md.
          </p>
        </div>
      )}

      {(phase === "before" || phase === "after") && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            {STEPS.map((s, i) => {
              const doneIdx = STEPS.indexOf(step);
              return (
                <span
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${i < doneIdx ? "" : i === doneIdx ? "opacity-60" : "bg-surface-deep"}`}
                  style={i <= doneIdx ? { background: "var(--cat-makeup)" } : undefined}
                />
              );
            })}
          </div>
          <p className="text-[11px] uppercase tracking-wider text-cat-makeup font-bold">
            {phase === "before" ? "1 · Before photo" : "2 · After photo"}
          </p>
          <p className="text-[14.5px] font-bold text-ink">{STEP_PROMPTS[step].title}</p>
          <p className="text-[12px] text-ink-3 mt-0.5 mb-2.5">{STEP_PROMPTS[step].hint}</p>
          <div className="relative w-fit mx-auto rounded-[14px] overflow-hidden border border-line">
            <img
              ref={imgRef}
              alt={`Your ${phase} selfie — tap the marked spots`}
              className="block max-h-[300px] w-auto cursor-crosshair select-none"
              onClick={onTap}
            />
            {taps.map((t, i) => (
              <span
                key={i}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center w-6 h-6 rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md"
                style={{ left: t.x, top: t.y, background: "var(--ink-900)" }}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={reset} className="tap-target h-10 px-4 rounded-full border border-line text-[13px] font-bold text-ink-2 press">
              Start over
            </button>
            {phase === "after" && (
              <button onClick={() => startPhoto("before")} className="tap-target h-10 px-4 rounded-full border border-line text-[13px] font-bold text-ink-2 press">
                Redo before shot
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "afterIntro" && (
        <Card className="p-4 mt-4">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-full shrink-0" style={{ background: "var(--sage-soft)", color: "var(--success)" }}>
              <CheckIcon width={17} height={17} />
            </span>
            <div>
              <p className="text-[14.5px] font-bold text-ink leading-tight">Before shot locked in ✦</p>
              <p className="text-[12px] text-ink-3 mt-0.5">Do the look, then photograph the after — same spot, same light, tissue still in frame.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3.5">
            <button
              onClick={() => startPhoto("after")}
              className="flex-1 h-11 rounded-full text-white text-[14px] font-bold press flex items-center justify-center gap-2"
              style={{ background: "var(--cat-makeup)" }}
            >
              <CameraIcon width={17} height={17} /> Take the after selfie
            </button>
            <button
              onClick={() => startPhoto("before")}
              aria-label="Redo the before shot"
              className="h-11 w-11 rounded-full border border-line text-ink-2 press grid place-items-center shrink-0"
            >
              <RefreshIcon width={18} height={18} />
            </button>
          </div>
        </Card>
      )}

      {phase === "result" && result && (
        <div className="mt-4 space-y-3">
          {!result.ok && result.error && (
            <div className="rounded-[14px] bg-honey-soft border border-line-soft p-3.5 flex gap-2.5">
              <AlertIcon width={18} height={18} className="text-honey shrink-0 mt-0.5" />
              <p className="text-[13px] text-ink-2">{result.error}</p>
            </div>
          )}
          {!result.ok && (
            <button onClick={reset} className="w-full h-11 rounded-full text-white text-[14px] font-bold press" style={{ background: "var(--cat-makeup)" }}>
              Try again
            </button>
          )}
          {result.ok && (
            <>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Eyebrow color="var(--cat-makeup)">Your glow delta</Eyebrow>
                    <p className="font-display text-[21px] text-ink mt-1 leading-tight">{result.headline}</p>
                  </div>
                  <SparkleIcon width={26} height={26} className="text-cat-makeup shrink-0 mt-1" />
                </div>
                <p className="text-[13px] leading-[19px] text-ink-2 mt-2.5">{result.verdict}</p>

                <div className="grid grid-cols-3 gap-2 mt-3.5">
                  <MetricTile label="Luminance" value={fmt(result.summary.glow)} sub="ΔL* · glow" positive={result.summary.glow > 0.8} negative={result.summary.glow < -0.8} />
                  <MetricTile label="Redness" value={fmt(-result.summary.redness)} sub="Δa* · calm" positive={result.summary.redness < -0.8} negative={result.summary.redness > 2} />
                  <MetricTile label="Evenness" value={`${fmt(result.summary.evennessChange)}%`} sub="tone spread" positive={result.summary.evennessChange > 8} />
                </div>

                <div className="space-y-2.5 mt-4">
                  {result.regions.map((r) => (
                    <RegionRow key={r.region} r={r} />
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={share}
                    className="flex-1 h-11 rounded-full text-white text-[14px] font-bold press flex items-center justify-center gap-2"
                    style={{ background: "var(--cat-makeup)" }}
                  >
                    <ShareIcon width={17} height={17} /> Share the card
                  </button>
                  <button
                    onClick={reset}
                    aria-label="Measure another look"
                    className="h-11 w-11 rounded-full border border-line text-ink-2 press grid place-items-center shrink-0"
                  >
                    <RefreshIcon width={18} height={18} />
                  </button>
                </div>
              </Card>
              {result.warnings.map((w) => (
                <div key={w} className="rounded-[12px] bg-surface-muted p-3 text-[12.5px] text-ink-3">{w}</div>
              ))}
              <p className="text-[11.5px] leading-[16px] text-ink-3">
                This card measures change, never beauty — every number is a delta from your own before-shot, not a
                score. ΔE2000 in CIELAB after independent von-Kries white-point correction of both photos.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- bits ---------- */

function RegionRow({ r }: { r: RegionDelta }) {
  const beforeHex = labToHex(r.before);
  const afterHex = labToHex(r.after);
  return (
    <div className="rounded-[12px] bg-surface-muted p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex rounded-[8px] overflow-hidden border border-line-soft shrink-0">
          <span className="w-7 h-7 block" style={{ background: beforeHex }} aria-label="before" />
          <span className="w-7 h-7 block" style={{ background: afterHex }} aria-label="after" />
        </span>
        <p className="text-[13px] font-bold text-ink capitalize">{r.region}</p>
        <Chip soft>ΔE {r.dE.toFixed(1)}</Chip>
      </div>
      <p className="text-[12px] leading-[17px] text-ink-3 mt-2">{r.reading}</p>
    </div>
  );
}

function MetricTile({ label, value, sub, positive, negative }: { label: string; value: string; sub: string; positive?: boolean; negative?: boolean }) {
  const color = positive ? "var(--success)" : negative ? "var(--error)" : "var(--ink)";
  return (
    <div className="rounded-[12px] bg-surface-muted p-2.5 text-center">
      <p className="font-display text-[17px] leading-tight" style={{ color }}>{value}</p>
      <p className="text-[9.5px] uppercase tracking-wider text-ink-3 mt-0.5">{label}</p>
      <p className="text-[9px] text-ink-3/70">{sub}</p>
    </div>
  );
}

function fmt(n: number): string {
  const v = Math.round(n * 10) / 10;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}`;
}
