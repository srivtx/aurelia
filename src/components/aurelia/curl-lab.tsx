"use client";

/* ============================================================
   AURELIA — Curl Lab / Texture Lab (Hair tab)
   ------------------------------------------------------------
   Photograph a section of hair → tap 2 strand patches →
   the curl classifier measures fiber geometry (orientation
   coherence, ridge frequency, edge density) → 10-class curl
   pattern + texture-specific care plan + styles that suit.
   Paper lineage: docs/RESEARCH-PAPERS.md §7 (Callender 2026,
   L'Oréal curl classification). On-device, geometry never
   "good hair", persisted locally.
   ============================================================ */

import { useRef, useState } from "react";
import {
  classifyCurlFromPatches,
  CURL_FAMILY_META,
  CURL_PROTOCOL,
  CURL_DISCLAIMER,
  type CurlBuild,
  type CurlClassification,
} from "@/lib/curl-classifier";
import type { ZonePixels } from "@/lib/skin-journal";
import { curlPatternById, CURL_FAMILY_COPY } from "@/data/curl-patterns";
import { styleById } from "@/data/hair";
import { hairstyleMinis } from "./illustrations";
import { useAurelia, todayKey } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import { CameraIcon, CheckIcon, RefreshIcon, AlertIcon, ArrowRightIcon, SpiralIcon } from "./icons";

const PATCH = 61; // 61×61 strand sample — needs room for ridge statistics
const ACCENT = "var(--cat-hair)";

type Phase = "intro" | "tapping" | "result";

export function CurlLab({ onOpenStyle }: { onOpenStyle: (styleId: string) => void }) {
  const { curlResult, setCurlResult, showToast } = useAurelia();

  const [phase, setPhase] = useState<Phase>(curlResult ? "result" : "intro");
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [result, setResult] = useState<CurlBuild["result"] | null>(curlResult ? {
    pattern: curlResult.pattern,
    family: curlResult.family,
    curlIndex: curlResult.curlIndex,
    coherence: 0,
    ridgeFreq: 0,
    edgeDensity: 0,
    confidence: curlResult.confidence,
  } : null);

  /* ---------- capture state ---------- */
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const patches = useRef<ZonePixels[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [taps, setTaps] = useState<{ x: number; y: number }[]>([]);

  const startCapture = () => {
    setPhase("tapping");
    setError(null);
    setWarn(null);
    patches.current = [];
    setTapCount(0);
    setTaps([]);
    canvasRef.current = null;
    inputRef.current?.click();
  };

  const resetCapture = () => {
    setPhase("intro");
    setError(null);
    setWarn(null);
    patches.current = [];
    setTapCount(0);
    setTaps([]);
    canvasRef.current = null;
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
      if (imgRef.current) imgRef.current.src = url;
      setTaps([]);
      setTapCount(0);
    };
    img.onerror = () => {
      showToast("Couldn't read that photo — try another ✦");
      setPhase("intro");
    };
    img.src = url;
  };

  const onTap = (e: React.MouseEvent<HTMLImageElement>) => {
    if (phase !== "tapping" || !canvasRef.current) return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    const half = Math.floor(PATCH / 2);
    const px = Math.max(0, Math.min(canvasRef.current.width - PATCH, Math.round(x) - half));
    const py = Math.max(0, Math.min(canvasRef.current.height - PATCH, Math.round(y) - half));
    const imgData = canvasRef.current.getContext("2d", { willReadFrequently: true })!.getImageData(px, py, PATCH, PATCH);
    patches.current.push({ w: PATCH, h: PATCH, data: imgData.data });
    setTaps((t) => [...t, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    const next = tapCount + 1;
    setTapCount(next);

    if (next >= 2) {
      const built = classifyCurlFromPatches(patches.current);
      if (!built.ok || !built.result) {
        setError(built.error ?? "Something went wrong reading those patches.");
        patches.current = patches.current.slice(0, 1); // keep the good patch if one survived
        setTapCount(Math.min(1, patches.current.length));
        setTaps((t) => t.slice(0, 1));
        return;
      }
      setResult(built.result);
      setWarn(built.warning ?? null);
      setError(null);
      setCurlResult({
        pattern: built.result.pattern,
        family: built.result.family,
        curlIndex: built.result.curlIndex,
        confidence: built.result.confidence,
        date: todayKey(),
      });
      setPhase("result");
      showToast("Texture measured ✦ care plan unlocked");
    }
  };

  /* ---------- render ---------- */

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">{CURL_PROTOCOL}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Choose a photo of a hair section"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {phase === "intro" && (
        <div className="mt-4 space-y-3">
          <button
            onClick={startCapture}
            className="w-full rounded-[16px] border border-dashed border-line p-5 press hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            <CameraIcon width={30} height={30} className="mx-auto text-cat-hair" />
            <p className="text-[14px] font-bold text-ink mt-2">Photograph a hair section</p>
            <p className="text-[12px] text-ink-3 mt-0.5">Dry, product-free, strands filling the frame · tap 2 patches on it</p>
          </button>
          <p className="text-[12px] text-ink-3 px-1">
            The engine reads strand geometry — how parallel the fibers run and how tightly the ridges pack. It never judges; every texture gets its own care plan.
          </p>
        </div>
      )}

      {phase === "tapping" && (
        <div>
          <p className="text-[14.5px] font-bold text-ink">
            {tapCount === 0 ? "Tap on the strands" : "One more patch — a different section"}
          </p>
          <p className="text-[12px] text-ink-3 mt-0.5 mb-2.5">
            {tapCount === 0 ? "Right on the hair, where you can see individual strands." : "Texture varies — a second patch keeps the reading honest."}
          </p>
          <div className="relative w-fit mx-auto rounded-[14px] overflow-hidden border border-line">
            <img
              ref={imgRef}
              alt="Your hair section — tap on the strands"
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
          {error && (
            <div className="mt-3 rounded-[14px] bg-honey-soft border border-line-soft p-3.5 flex gap-2.5">
              <AlertIcon width={18} height={18} className="text-honey shrink-0 mt-0.5" />
              <p className="text-[13px] text-ink-2">{error}</p>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={resetCapture} className="tap-target h-10 px-4 rounded-full border border-line text-[13px] font-bold text-ink-2 press">
              Start over
            </button>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <CurlResultView result={result} warn={warn} onOpenStyle={onOpenStyle} onRemeasure={startCapture} />
      )}
    </div>
  );
}

/* ---------- result view ---------- */

function CurlResultView({
  result,
  warn,
  onOpenStyle,
  onRemeasure,
}: {
  result: CurlClassification;
  warn: string | null;
  onOpenStyle: (styleId: string) => void;
  onRemeasure: () => void;
}) {
  const pattern = curlPatternById(result.pattern);
  const familyMeta = CURL_FAMILY_META[result.family];
  const familyCopy = CURL_FAMILY_COPY[result.family];

  return (
    <div className="mt-4 space-y-3">
      {/* headline */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="grid place-items-center w-16 h-16 rounded-[18px] shrink-0" style={{ background: "color-mix(in srgb, var(--cat-hair) 14%, transparent)", color: "var(--cat-hair)" }}>
            <SpiralIcon width={34} height={34} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Chip color={ACCENT}>{pattern.label}</Chip>
              <Chip soft>{Math.round(result.confidence * 100)}% conf.</Chip>
            </div>
            <p className="font-display text-[18px] text-ink mt-1.5 leading-tight">{familyMeta.label} family</p>
            <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1">{familyMeta.note}</p>
          </div>
        </div>

        {/* curl index dial */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-ink-3 mb-1.5">
            <span>curl index</span>
            <span className="text-ink font-bold">{result.curlIndex.toFixed(0)} / 100</span>
          </div>
          <div className="relative h-3.5 rounded-full overflow-hidden flex" role="img" aria-label={`Curl index ${result.curlIndex} of 100`}>
            <div className="flex-[13]" style={{ background: "color-mix(in srgb, var(--cat-hair) 24%, var(--surface-muted))" }} />
            <div className="flex-[11]" style={{ background: "color-mix(in srgb, var(--cat-hair) 42%, var(--surface-muted))" }} />
            <div className="flex-[11]" style={{ background: "color-mix(in srgb, var(--cat-hair) 62%, var(--surface-muted))" }} />
            <div className="flex-[14]" style={{ background: "color-mix(in srgb, var(--cat-hair) 84%, var(--surface-muted))" }} />
            <span
              className="absolute top-0 bottom-0 w-[3px] rounded-full"
              style={{ left: `calc(${Math.min(100, result.curlIndex)}% - 1.5px)`, background: "var(--ink-900)" }}
            />
          </div>
          <div className="flex justify-between text-[9.5px] font-semibold text-ink-3 mt-1">
            {(["straight", "wavy", "curly", "coily"] as const).map((f) => (
              <span key={f}>{CURL_FAMILY_COPY[f].short}</span>
            ))}
          </div>
        </div>

        {/* the measured math, visible */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <MetricTile label="coherence" value={result.coherence.toFixed(2)} sub="parallel strands" />
          <MetricTile label="ridge freq" value={result.ridgeFreq.toFixed(2)} sub="coil density" />
          <MetricTile label="texture" value={result.edgeDensity.toFixed(2)} sub="edge energy" />
        </div>
      </Card>

      {warn && (
        <div className="rounded-[14px] bg-honey-soft border border-line-soft p-3.5 flex gap-2.5">
          <AlertIcon width={18} height={18} className="text-honey shrink-0 mt-0.5" />
          <p className="text-[13px] text-ink-2">{warn}</p>
        </div>
      )}

      {/* the fiber */}
      <Card className="p-4">
        <Eyebrow color={ACCENT}>Your fiber</Eyebrow>
        <p className="text-[13.5px] leading-[19px] text-ink-2 mt-1.5">{pattern.hair}</p>
        <p className="text-[12.5px] leading-[18px] text-ink-3 mt-2">{pattern.spot}</p>
        <div className="flex items-start gap-2.5 mt-3.5 rounded-[14px] p-3.5" style={{ background: "color-mix(in srgb, var(--cat-hair) 8%, transparent)" }}>
          <CheckIcon width={15} height={15} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
          <p className="text-[12.5px] leading-[18px] text-ink-2">{pattern.tip}</p>
        </div>
      </Card>

      {/* care plan */}
      <Card className="p-4">
        <Eyebrow color={ACCENT}>The {familyCopy.label} care plan</Eyebrow>
        <div className="mt-2.5 space-y-2.5">
          {(
            [
              ["Wash cadence", pattern.care.wash],
              ["Moisture", pattern.care.moisture],
              ["Styling physics", pattern.care.styling],
              ["Ingredients", pattern.care.ingredients],
              ["Night routine", pattern.care.night],
            ] as const
          ).map(([label, body]) => (
            <div key={label} className="rounded-[12px] bg-surface-muted p-3">
              <p className="text-[12px] font-bold uppercase tracking-wider text-ink-3">{label}</p>
              <p className="text-[13px] leading-[18px] text-ink-2 mt-1">{body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* styles that suit */}
      <Card className="p-4">
        <Eyebrow color={ACCENT}>Styles that suit {familyCopy.short}</Eyebrow>
        <div className="mt-2.5 space-y-2.5">
          {pattern.styles.map((s) => {
            const style = styleById(s.id);
            if (!style) return null;
            const Mini = hairstyleMinis[style.id];
            return (
              <button
                key={s.id}
                onClick={() => onOpenStyle(style.id)}
                className="w-full text-left flex items-center gap-3 rounded-[14px] bg-surface-muted p-3 press outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                aria-label={`Open ${style.name}`}
              >
                <span className="grid place-items-center w-11 h-11 rounded-[12px] shrink-0" style={{ background: "color-mix(in srgb, var(--cat-hair) 12%, transparent)", color: "var(--cat-hair)" }}>
                  {Mini ? <Mini width={32} height={32} /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-ink leading-tight">{style.name}</p>
                  <p className="text-[12px] leading-[16px] text-ink-3 mt-0.5 line-clamp-2">{s.why}</p>
                </div>
                <ArrowRightIcon width={15} height={15} className="text-ink-3 shrink-0" />
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-2">
        <button
          onClick={onRemeasure}
          className="flex-1 h-11 rounded-full border border-line text-[13.5px] font-bold text-ink-2 press flex items-center justify-center gap-2"
        >
          <RefreshIcon width={16} height={16} /> Re-measure
        </button>
      </div>

      <p className="text-[11.5px] leading-[16px] text-ink-3">{CURL_DISCLAIMER}</p>
    </div>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[12px] bg-surface-muted p-2.5 text-center">
      <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-3">{label}</p>
      <p className="font-display text-[17px] text-ink mt-0.5 leading-none">{value}</p>
      <p className="text-[9.5px] text-ink-3 mt-1 leading-none">{sub}</p>
    </div>
  );
}
