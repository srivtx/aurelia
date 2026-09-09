"use client";

/* ============================================================
   AURELIA — Skin Signature capture (Color Lab)
   ------------------------------------------------------------
   One selfie + any white surface = dermatology-grade skin
   colorimetry, fully on-device:
     1. photograph your face next to a white reference
        (tissue, notebook paper — anything truly white)
     2. tap the white thing, then your cheek, then your jaw
     3. we white-point correct (von-Kries), average the patches
        in CIELAB, and compute ITA° / hue angle / chroma
   The photo never leaves the phone. Result feeds Shade Lab,
   the passport, and your season evidence.
   ============================================================ */

import { useRef, useState } from "react";
import {
  buildSkinSignature,
  undertoneCopy,
  depthCopy,
  type PatchSample,
  type SignatureResult,
} from "@/lib/skin-signature";
import { labToHex } from "@/lib/color-science";
import { useAurelia, type SkinSignatureState } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import { CameraIcon, DropletIcon, CheckIcon, RefreshIcon, AlertIcon } from "./icons";

type Step = "white" | "cheek" | "jaw";

const STEP_PROMPTS: Record<Step, { title: string; hint: string }> = {
  white: { title: "Tap the white thing", hint: "The tissue or paper in the photo — it calibrates the lighting." },
  cheek: { title: "Tap your cheek", hint: "Center of the cheek, avoid shadows and blush." },
  jaw: { title: "Tap your jaw", hint: "Along the jawline — one more patch and we compute." },
};

export function SkinSignatureCapture() {
  const { skinSignature, setSkinSignature, showToast } = useAurelia();
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapDims = useRef<{ w: number; h: number } | null>(null);
  const refSample = useRef<PatchSample | null>(null);
  const cheekSample = useRef<PatchSample | null>(null);

  const [phase, setPhase] = useState<"intro" | "tapping" | "result">("intro");
  const [step, setStep] = useState<Step>("white");
  const [taps, setTaps] = useState<{ x: number; y: number; label: string }[]>([]);
  const [result, setResult] = useState<SignatureResult | null>(null);

  const reset = () => {
    setPhase("intro");
    setStep("white");
    setTaps([]);
    setResult(null);
    canvasRef.current = null;
    bitmapDims.current = null;
    refSample.current = null;
    cheekSample.current = null;
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("That file isn't an image — try a photo ✦");
      return;
    }
    /* decode once, cap at 1080px for patch sampling accuracy */
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
      setResult(null);
      setStep("white");
      setPhase("tapping");
    };
    img.onerror = () => showToast("Couldn't read that photo — try another ✦");
    img.src = url;
  };

  const onTap = (e: React.MouseEvent<HTMLImageElement>) => {
    if (phase !== "tapping" || !canvasRef.current || !bitmapDims.current) return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const natural = bitmapDims.current;
    /* map displayed coords → source bitmap coords */
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    /* 15×15 patch mean */
    const size = 15;
    const half = Math.floor(size / 2);
    const px = Math.max(0, Math.min(canvasRef.current.width - size, Math.round(x) - half));
    const py = Math.max(0, Math.min(canvasRef.current.height - size, Math.round(y) - half));
    const data = canvasRef.current
      .getContext("2d", { willReadFrequently: true })!
      .getImageData(px, py, size, size).data;
    let r = 0, g = 0, b = 0;
    const n = size * size;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const sample: PatchSample = { r: r / n, g: g / n, b: b / n };
    const display = { x: e.clientX - rect.left, y: e.clientY - rect.top, label: step };

    if (step === "white") {
      refSample.current = sample;
      setTaps((t) => [...t, display]);
      setStep("cheek");
    } else if (step === "cheek") {
      cheekSample.current = sample;
      setTaps((t) => [...t, display]);
      setStep("jaw");
    } else if (refSample.current && cheekSample.current) {
      setTaps((t) => [...t, display]);
      const res = buildSkinSignature(refSample.current, [cheekSample.current, sample]);
      setResult(res);
      setPhase("result");
    }
  };

  const save = () => {
    if (result?.signature) {
      setSkinSignature(result.signature as SkinSignatureState);
      showToast("Skin Signature saved ✦ it's in your Passport now");
    }
  };

  const sig = phase === "result" ? result?.signature : skinSignature;
  const hex = sig ? labToHex({ L: sig.L, a: sig.a, b: sig.b }) : null;

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Dermatology-grade skin colorimetry from one photo. Hold something white (a tissue works) next to your face,
        take a selfie in even daylight, and tap three spots. We compute ITA°, your objective undertone, and depth —
        entirely on your device, nothing is uploaded.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        aria-label="Choose a selfie with a white reference"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* current signature card */}
      {phase === "intro" && skinSignature && (
        <Card className="p-4 mt-4">
          <Eyebrow color="var(--cat-colors)">Your measured skin</Eyebrow>
          <SignatureBody sig={skinSignature} />
          <p className="text-[11.5px] text-ink-3 mt-3">Measured {skinSignature.taken}{skinSignature.calibrated ? " · white-reference calibrated" : ""}</p>
        </Card>
      )}

      {phase === "intro" && (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 w-full rounded-[16px] border border-dashed border-line p-5 press hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
        >
          <CameraIcon width={30} height={30} className="mx-auto text-cat-colors" />
          <p className="text-[14px] font-bold text-ink mt-2">Take the measuring selfie</p>
          <p className="text-[12px] text-ink-3 mt-0.5">Selfie + something white · daylight works best</p>
        </button>
      )}

      {phase === "tapping" && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2.5">
            {(["white", "cheek", "jaw"] as Step[]).map((s, i) => {
              const doneIdx = ["white", "cheek", "jaw"].indexOf(step);
              const done = i < doneIdx;
              const active = i === doneIdx;
              return (
                <span
                  key={s}
                  aria-label={`Step ${i + 1} ${done ? "done" : active ? "in progress" : "pending"}`}
                  className={`h-1.5 flex-1 rounded-full ${done ? "bg-cat-colors" : active ? "bg-cat-colors/60" : "bg-surface-deep"}`}
                  style={done || active ? { background: "var(--cat-colors)" } : undefined}
                />
              );
            })}
          </div>
          <p className="text-[14.5px] font-bold text-ink">{STEP_PROMPTS[step].title}</p>
          <p className="text-[12px] text-ink-3 mt-0.5 mb-2.5">{STEP_PROMPTS[step].hint}</p>
          <div className="relative w-fit mx-auto rounded-[14px] overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              alt="Your selfie — tap the marked spots"
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
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div className="mt-4 space-y-3">
          {!result.ok && result.error && (
            <div className="rounded-[14px] bg-honey-soft border border-line-soft p-3.5 flex gap-2.5">
              <AlertIcon width={18} height={18} className="text-honey shrink-0 mt-0.5" />
              <p className="text-[13px] text-ink-2">{result.error}</p>
            </div>
          )}
          {result.ok && sig && hex && (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Eyebrow color="var(--cat-colors)">Your Skin Signature</Eyebrow>
                    <p className="font-display text-[19px] text-ink mt-1 leading-tight">
                      {sig.depth} · {sig.undertone} undertone
                    </p>
                  </div>
                  <span className="w-14 h-14 rounded-[16px] border border-line shrink-0" style={{ background: hex }} aria-label="Your measured skin color" />
                </div>
                <SignatureBody sig={sig} />
                <div className="flex gap-2 mt-3.5">
                  <button
                    onClick={save}
                    className="flex-1 h-11 rounded-full bg-cat-colors text-white text-[14px] font-bold press flex items-center justify-center gap-2"
                    style={{ background: "var(--cat-colors)" }}
                  >
                    <CheckIcon width={17} height={17} /> Save signature
                  </button>
                  <button
                    onClick={reset}
                    aria-label="Retake the measurement"
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
                Method: white-point (von-Kries) correction on the reference patch, CIELAB averaging, ITA° per
                Chardon et al. thresholds. Runs in under a millisecond — see docs/RESEARCH-PAPERS.md.
              </p>
            </>
          )}
          {!result.ok && (
            <button onClick={reset} className="w-full h-11 rounded-full bg-cat-colors text-white text-[14px] font-bold press" style={{ background: "var(--cat-colors)" }}>
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* shared readout — used by the capture result and the saved card */
function SignatureBody({ sig }: { sig: SkinSignatureState }) {
  const hex = labToHex({ L: sig.L, a: sig.a, b: sig.b });
  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <Metric label="ITA°" value={sig.ita.toFixed(0)} sub="depth index" />
        <Metric label="Hue" value={`${sig.hue.toFixed(0)}°`} sub="undertone angle" />
        <Metric label="Chroma" value={sig.chroma.toFixed(1)} sub="colorfulness" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        <Chip color="var(--terra)">{sig.depth}</Chip>
        <Chip color="var(--cat-skin)">{sig.undertone} undertone</Chip>
        <Chip soft>{`L* ${sig.L.toFixed(0)}`}</Chip>
      </div>
      <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1">
        {depthCopy(sig)} · {undertoneCopy(sig.undertone)}.
      </p>
      <div className="flex items-center gap-2.5 mt-1">
        <DropletIcon width={14} height={14} className="text-cat-colors shrink-0" />
        <p className="text-[11.5px] text-ink-3">
          Lab ({sig.L.toFixed(1)}, {sig.a.toFixed(1)}, {sig.b.toFixed(1)}) → {hex}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[12px] bg-surface-muted p-2.5 text-center">
      <p className="font-display text-[17px] text-ink leading-tight">{value}</p>
      <p className="text-[9.5px] uppercase tracking-wider text-ink-3 mt-0.5">{label}</p>
      <p className="text-[9px] text-ink-3/70">{sub}</p>
    </div>
  );
}
