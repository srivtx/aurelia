"use client";

/* ============================================================
   AURELIA — Skin Journal (Skin tab)
   ------------------------------------------------------------
   The closed beauty loop's retention engine: a weekly
   calibrated selfie → tapped zone patches → objective
   metrics (redness a*, evenness ΔE dispersion, texture edge
   energy) → trends, milestones and routine context.
   Paper lineage: docs/RESEARCH-PAPERS.md §4 (Quattrini 2022,
   Traini 2025, Yoon 2023 — pure-CV explainable proxies).
   On-device, persisted locally, TRENDS NEVER DIAGNOSIS.
   ============================================================ */

import { useMemo, useRef, useState } from "react";
import {
  buildJournalEntry,
  journalTrends,
  JOURNAL_DISCLAIMER,
  JOURNAL_ZONES,
  ZONE_LABELS,
  type EntryBuild,
  type JournalZone,
  type ZonePixels,
} from "@/lib/skin-journal";
import type { PatchSample } from "@/lib/skin-signature";
import { actives as ALL_ACTIVES } from "@/data/actives";
import { useAurelia } from "@/lib/store";
import { Card, Eyebrow } from "./bits";
import {
  CameraIcon,
  CheckIcon,
  RefreshIcon,
  AlertIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "./icons";

const TAG_ACTIVES = ALL_ACTIVES.slice(0, 9);
const ZONE_PATCH = 31; // 31×31 zone sample — enough for evenness/texture stats

type Step = "white" | JournalZone;
const STEPS: Step[] = ["white", "cheekL", "cheekR", "forehead", "chin"];

const STEP_PROMPTS: Record<Step, { title: string; hint: string }> = {
  white: { title: "Tap the white thing", hint: "Tissue or paper in frame — it calibrates this week's measurement." },
  cheekL: { title: "Tap your left cheek", hint: "Same spot every week is what makes trends meaningful." },
  cheekR: { title: "Tap your right cheek", hint: "Center of the cheek, away from blush or shadows." },
  forehead: { title: "Tap your forehead", hint: "Center, between the brows and the hairline." },
  chin: { title: "Tap your chin", hint: "Last zone — one tap and we compute." },
};

const METRIC_META: Record<
  "redness" | "evenness" | "texture" | "brightness" | "gloss",
  { label: string; sub: string; lowerIsBetter: boolean; fmt: (v: number) => string }
> = {
  redness: { label: "Redness", sub: "a* · lower is calmer", lowerIsBetter: true, fmt: (v) => v.toFixed(1) },
  evenness: { label: "Evenness", sub: "ΔE spread · lower is evener", lowerIsBetter: true, fmt: (v) => v.toFixed(1) },
  texture: { label: "Texture", sub: "edge energy · lower is smoother", lowerIsBetter: true, fmt: (v) => v.toFixed(1) },
  gloss: { label: "Gloss", sub: "hydration proxy · estimate, not a corneometer", lowerIsBetter: false, fmt: (v) => `${Math.round(v * 100)}%` },
  brightness: { label: "Brightness", sub: "L*", lowerIsBetter: false, fmt: (v) => v.toFixed(0) },
};

export function SkinJournal() {
  const { journal, addJournalEntry, clearJournal, showToast } = useAurelia();
  const [view, setView] = useState<"capture" | "trends">(journal.length > 0 ? "trends" : "capture");
  const [zone, setZone] = useState<JournalZone>("cheekR");

  /* ---------- capture state ---------- */
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingRef = useRef<PatchSample | null>(null);
  const zonePixels = useRef<Partial<Record<JournalZone, ZonePixels>>>({});

  const [phase, setPhase] = useState<"intro" | "tapping" | "tag">("intro");
  const [step, setStep] = useState<Step>("white");
  const [taps, setTaps] = useState<{ x: number; y: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tagged, setTagged] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saveWarn, setSaveWarn] = useState<string[]>([]);

  const summary = useMemo(() => journalTrends(journal), [journal]);
  const zonesWithHistory = useMemo(
    () => JOURNAL_ZONES.filter((z) => summary.trends.some((t) => t.zone === z)),
    [summary.trends],
  );
  const activeZone = zonesWithHistory.includes(zone) ? zone : (zonesWithHistory[0] ?? "cheekR");
  const zoneTrends = summary.trends.filter((t) => t.zone === activeZone);

  /* ---------- capture flow ---------- */

  const resetCapture = () => {
    setPhase("intro");
    setStep("white");
    setTaps([]);
    setError(null);
    setTagged([]);
    setNote("");
    setSaveWarn([]);
    canvasRef.current = null;
    pendingRef.current = null;
    zonePixels.current = {};
  };

  const startCapture = () => {
    resetCapture();
    setView("capture"); // the "+ This week" button lives in the trends view — switch over
    setPhase("tapping");
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
    if (phase !== "tapping" || !canvasRef.current) return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    if (step === "white") {
      /* 15×15 mean — reference only needs the mean */
      const sample = samplePatchMean(canvasRef.current, x, y, 15);
      pendingRef.current = sample;
      setTaps((t) => [...t, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setStep("cheekL");
      return;
    }

    /* zone: 31×31 raw pixels — the engine computes Lab/evenness/texture */
    const size = ZONE_PATCH;
    const half = Math.floor(size / 2);
    const px = Math.max(0, Math.min(canvasRef.current.width - size, Math.round(x) - half));
    const py = Math.max(0, Math.min(canvasRef.current.height - size, Math.round(y) - half));
    const imgData = canvasRef.current.getContext("2d", { willReadFrequently: true })!.getImageData(px, py, size, size);
    zonePixels.current[step] = { w: size, h: size, data: imgData.data };

    setTaps((t) => [...t, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    const nextIdx = STEPS.indexOf(step) + 1;
    if (nextIdx < STEPS.length) {
      setStep(STEPS[nextIdx]);
    } else {
      setPhase("tag");
    }
  };

  const save = () => {
    if (!pendingRef.current) return;
    const built: EntryBuild = buildJournalEntry(
      pendingRef.current,
      zonePixels.current,
      tagged,
      note,
    );
    if (!built.ok || !built.entry) {
      setError(built.error ?? "Something went wrong measuring those patches.");
      return;
    }
    addJournalEntry(built.entry);
    setSaveWarn(built.warnings);
    showToast("Journal entry saved ✦ the loop is closing");
    setView("trends");
    setPhase("intro");
    setError(null);
  };

  /* ---------- render ---------- */

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        The closed loop: a weekly calibrated selfie, measured per zone — redness, evenness, texture — so your routine
        gets judged by your skin&apos;s <em>change</em>, not by marketing. Everything runs on-device and stays on your
        phone.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        aria-label="Choose a selfie for this week's journal entry"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* view switcher */}
      <div className="flex gap-1.5 mt-3.5 p-1 rounded-full bg-surface-muted w-fit" role="tablist" aria-label="Journal views">
        <button
          role="tab"
          aria-selected={view === "capture"}
          onClick={() => setView("capture")}
          className={`h-8 px-4 rounded-full text-[12.5px] font-bold transition-colors ${view === "capture" ? "bg-surface text-cat-skin shadow-sm" : "text-ink-3"}`}
        >
          New entry
        </button>
        <button
          role="tab"
          aria-selected={view === "trends"}
          onClick={() => setView("trends")}
          disabled={journal.length === 0}
          className={`h-8 px-4 rounded-full text-[12.5px] font-bold transition-colors disabled:opacity-40 ${view === "trends" ? "bg-surface text-cat-skin shadow-sm" : "text-ink-3"}`}
        >
          Trends {journal.length > 0 ? `· ${journal.length}` : ""}
        </button>
      </div>

      {/* ---------------- capture ---------------- */}

      {view === "capture" && (
        <div className="mt-4">
          {phase === "intro" && (
            <div className="space-y-3">
              <button
                onClick={startCapture}
                className="w-full rounded-[16px] border border-dashed border-line p-5 press hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
              >
                <CameraIcon width={30} height={30} className="mx-auto text-cat-skin" />
                <p className="text-[14px] font-bold text-ink mt-2">Take this week&apos;s selfie</p>
                <p className="text-[12px] text-ink-3 mt-0.5">Bare face + a tissue in frame · same spot, same light each week</p>
              </button>
              {journal.length > 0 && (
                <p className="text-[12px] text-ink-3 px-1">
                  Last measured {fmtDate(summary.latestDate ?? "")} — weekly cadence gives the cleanest trends.
                </p>
              )}
            </div>
          )}

          {phase === "tapping" && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                {STEPS.map((s, i) => {
                  const doneIdx = STEPS.indexOf(step);
                  return (
                    <span
                      key={s}
                      className={`h-1.5 flex-1 rounded-full ${i === doneIdx ? "opacity-60" : i > doneIdx ? "bg-surface-deep" : ""}`}
                      style={i <= doneIdx ? { background: "var(--cat-skin)" } : undefined}
                    />
                  );
                })}
              </div>
              <p className="text-[14.5px] font-bold text-ink">{STEP_PROMPTS[step].title}</p>
              <p className="text-[12px] text-ink-3 mt-0.5 mb-2.5">{STEP_PROMPTS[step].hint}</p>
              <div className="relative w-fit mx-auto rounded-[14px] overflow-hidden border border-line">
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
                <button onClick={resetCapture} className="tap-target h-10 px-4 rounded-full border border-line text-[13px] font-bold text-ink-2 press">
                  Start over
                </button>
              </div>
            </div>
          )}

          {phase === "tag" && (
            <div className="space-y-3.5">
              <Card className="p-4">
                <Eyebrow color="var(--cat-skin)">Tag what you&apos;ve been using</Eyebrow>
                <p className="text-[12px] text-ink-3 mt-1 mb-2.5">
                  Optional — it lets your milestones say <em>why</em>: &ldquo;redness down 18% while on niacinamide&rdquo;.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_ACTIVES.map((a) => {
                    const on = tagged.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => setTagged((t) => (on ? t.filter((x) => x !== a.id) : [...t, a.id]))}
                        aria-pressed={on}
                        className={`h-8 px-3 rounded-full text-[12px] font-bold border transition-colors press ${
                          on ? "border-transparent text-white" : "border-line text-ink-2"
                        }`}
                        style={on ? { background: "var(--cat-skin)" } : undefined}
                      >
                        {a.short}
                      </button>
                    );
                  })}
                </div>
                <label className="block mt-4">
                  <span className="text-[11px] uppercase tracking-wider text-ink-3 font-bold">Note (optional)</span>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={80}
                    placeholder="e.g. started tretinoin 0.025%, stressful week…"
                    className="aurelia-input mt-1.5 w-full h-10 rounded-[12px] border border-line bg-surface px-3.5 text-[13.5px] text-ink placeholder:text-ink-3/60 outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                  />
                </label>
              </Card>

              {error && (
                <div className="rounded-[14px] bg-honey-soft border border-line-soft p-3.5 flex gap-2.5">
                  <AlertIcon width={18} height={18} className="text-honey shrink-0 mt-0.5" />
                  <p className="text-[13px] text-ink-2">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="flex-1 h-11 rounded-full text-white text-[14px] font-bold press flex items-center justify-center gap-2"
                  style={{ background: "var(--cat-skin)" }}
                >
                  <CheckIcon width={17} height={17} /> Save this week&apos;s entry
                </button>
                <button
                  onClick={resetCapture}
                  aria-label="Retake the measurement"
                  className="h-11 w-11 rounded-full border border-line text-ink-2 press grid place-items-center shrink-0"
                >
                  <RefreshIcon width={18} height={18} />
                </button>
              </div>
              {saveWarn.map((w) => (
                <div key={w} className="rounded-[12px] bg-surface-muted p-3 text-[12.5px] text-ink-3">{w}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- trends ---------------- */}

      {view === "trends" && journal.length > 0 && (
        <div className="mt-4 space-y-3">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Eyebrow color="var(--cat-skin)">Your skin, over time</Eyebrow>
                <p className="font-display text-[19px] text-ink mt-1 leading-tight">
                  {summary.entries} {summary.entries === 1 ? "entry" : "entries"} · {summary.weeks.toFixed(0)} {summary.weeks === 1 ? "week" : "weeks"}
                </p>
                <p className="text-[12px] text-ink-3 mt-1">
                  {fmtDate(summary.firstDate ?? "")} → {fmtDate(summary.latestDate ?? "")}
                </p>
              </div>
              <button onClick={startCapture} className="tap-target h-9 px-3.5 rounded-full text-[12.5px] font-bold text-white press shrink-0" style={{ background: "var(--cat-skin)" }}>
                + This week
              </button>
            </div>
          </Card>

          {summary.bestStreakZone && (
            <div className="rounded-[14px] p-3.5 border border-line-soft" style={{ background: "var(--sage-soft)" }}>
              <p className="text-[13px] font-bold text-ink leading-[18px]">{summary.bestStreakZone.text}</p>
            </div>
          )}

          {summary.milestones.length > 0 && (
            <Card className="p-4">
              <Eyebrow color="var(--cat-skin)">Milestones</Eyebrow>
              <ul className="mt-2 space-y-2">
                {summary.milestones.map((m) => (
                  <li key={m} className="flex gap-2 text-[13px] leading-[18px] text-ink-2">
                    <CheckIcon width={15} height={15} className="shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* zone selector */}
          <div className="flex flex-wrap gap-1.5">
            {zonesWithHistory.map((z) => (
              <button
                key={z}
                onClick={() => setZone(z)}
                aria-pressed={activeZone === z}
                className={`h-8 px-3.5 rounded-full text-[12px] font-bold border transition-colors press ${
                  activeZone === z ? "border-transparent text-white" : "border-line text-ink-2"
                }`}
                style={activeZone === z ? { background: "var(--cat-skin)" } : undefined}
              >
                {ZONE_LABELS[z]}
              </button>
            ))}
          </div>

          {/* metric rows with sparklines */}
          <Card className="p-4">
            <Eyebrow color="var(--cat-skin)">{ZONE_LABELS[activeZone]} — measured trend</Eyebrow>
            <div className="mt-2.5 space-y-3">
              {(["redness", "evenness", "texture", "gloss"] as const).map((metric) => {
                const t = zoneTrends.find((x) => x.metric === metric);
                if (!t) return null;
                const values = journal
                  .filter((e) => e.zones[activeZone] && Number.isFinite(metricValue(e, activeZone, metric)))
                  .map((e) => metricValue(e, activeZone, metric));
                const meta = METRIC_META[metric];
                return (
                  <TrendRow
                    key={metric}
                    label={meta.label}
                    sub={meta.sub}
                    values={values}
                    first={t.first}
                    latest={t.latest}
                    changePct={t.changePct}
                    direction={t.direction}
                    improving={t.improving}
                    fmtV={meta.fmt}
                  />
                );
              })}
            </div>
            {zoneTrends.length === 0 && (
              <p className="text-[12.5px] text-ink-3 mt-2">Add a second entry with this zone tapped to start its trend.</p>
            )}
          </Card>

          {/* entries list + danger zone */}
          <Card className="p-4">
            <Eyebrow color="var(--cat-skin)">History</Eyebrow>
            <div className="mt-2 space-y-1.5">
              {journal.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="text-ink-2 font-bold">{fmtDate(e.date)}</span>
                  <span className="text-ink-3 truncate">
                    {e.actives.length > 0 ? e.actives.length + " active" + (e.actives.length > 1 ? "s" : "") : "—"}
                    {e.note ? ` · ${e.note}` : ""}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                clearJournal();
                setView("capture");
                showToast("Journal cleared");
              }}
              className="mt-4 h-9 px-4 rounded-full border border-line text-[12.5px] font-bold text-ink-3 press"
            >
              Clear journal
            </button>
          </Card>

          <p className="text-[11.5px] leading-[16px] text-ink-3">{JOURNAL_DISCLAIMER}</p>
        </div>
      )}

      {view === "trends" && journal.length === 0 && (
        <div className="mt-4">
          <p className="text-[13px] text-ink-3">No entries yet — take the first selfie and the loop starts.</p>
          <button onClick={startCapture} className="mt-3 h-11 px-5 rounded-full text-white text-[14px] font-bold press" style={{ background: "var(--cat-skin)" }}>
            Start the journal
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- trend row with sparkline ---------- */

function TrendRow({
  label,
  sub,
  values,
  first,
  latest,
  changePct,
  direction,
  improving,
  fmtV,
}: {
  label: string;
  sub: string;
  values: number[];
  first: number;
  latest: number;
  changePct: number;
  direction: "down" | "up" | "flat";
  improving: boolean;
  fmtV: (v: number) => string;
}) {
  const color = improving ? "var(--success)" : direction === "flat" ? "var(--ink-3)" : "var(--error)";
  const Arrow = direction === "up" ? ArrowUpIcon : direction === "down" ? ArrowDownIcon : null;
  return (
    <div className="rounded-[12px] bg-surface-muted p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink">{label}</p>
          <p className="text-[10.5px] text-ink-3 mt-0.5">{sub}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" style={{ color }}>
          {Arrow && <Arrow width={13} height={13} />}
          <span className="text-[13px] font-bold">
            {Math.abs(changePct) < 4 ? "steady" : `${Math.abs(Math.round(changePct))}%`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 mt-2">
        <Sparkline values={values} color={color} />
        <p className="text-[11.5px] text-ink-3 shrink-0">
          {fmtV(first)} → <span className="text-ink font-bold">{fmtV(latest)}</span>
        </p>
      </div>
    </div>
  );
}

/** pure SVG polyline, 120×36, min-max normalized */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 120;
  const H = 36;
  const P = 4;
  if (values.length === 0) return <svg width={W} height={H} aria-hidden="true" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? W / 2 : P + (i / (values.length - 1)) * (W - 2 * P);
    const y = H - P - ((v - min) / range) * (H - 2 * P);
    return [x, y] as const;
  });
  const d = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={W} height={H} className="shrink-0" aria-hidden="true">
      <polyline points={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.6" fill={color} />
    </svg>
  );
}

/* ---------- helpers ---------- */

function samplePatchMean(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  size: number,
): PatchSample {
  const half = Math.floor(size / 2);
  const px = Math.max(0, Math.min(canvas.width - size, Math.round(x) - half));
  const py = Math.max(0, Math.min(canvas.height - size, Math.round(y) - half));
  const data = canvas.getContext("2d", { willReadFrequently: true })!.getImageData(px, py, size, size).data;
  let r = 0, g = 0, b = 0;
  const n = size * size;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return { r: r / n, g: g / n, b: b / n };
}

function metricValue(
  e: { zones: Partial<Record<JournalZone, { L: number; a: number; b: number; evenness: number; texture: number; gloss?: number }>> },
  zone: JournalZone,
  metric: "redness" | "evenness" | "texture" | "gloss",
): number {
  const m = e.zones[zone];
  if (!m) return NaN;
  if (metric === "gloss") return typeof m.gloss === "number" ? m.gloss : NaN;
  return metric === "redness" ? m.a : metric === "evenness" ? m.evenness : m.texture;
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1] ?? ""} ${d}${y !== new Date().getFullYear() ? ` ’${String(y).slice(2)}` : ""}`;
}
