"use client";

/* ============================================================
   AURELIA — Face Meter (Hair tab deep-tech feature)
   Four anthropometric sliders → ratio classifier → your face
   shape + styles that flatter it. The SVG face morphs live
   as you slide — measurements made visible.
   ============================================================ */

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { classifyFaceShape, shapeStyleMap, shapeNames } from "@/lib/face-shape";
import { styleById, faceShapes, type HairStyle } from "@/data/hair";
import { Card, Chip, Eyebrow } from "./bits";
import { RulerIcon } from "./icons";
import { hairstyleMinis } from "./illustrations";

/* ---------- live-morphing parametric face SVG ---------- */

function MorphFace({ m, accent }: { m: { length: number; forehead: number; cheekbone: number; jaw: number }; accent: string }) {
  /* normalize to drawing units: cheekbone = widest → 62 half-width at cheek level */
  const C = Math.max(1, m.cheekbone);
  const wF = (m.forehead / C) * 62;
  const wJ = (m.jaw / C) * 58;
  const hScale = 0.78 + (m.length / C - 1.3) * 0.55; // longer face → taller drawing
  const cx = 100;

  const topY = 24;
  const foreheadY = 24 + 46 * hScale;
  const cheekY = foreheadY + 52 * hScale;
  const jawY = cheekY + 52 * hScale;
  const chinY = jawY + 58 * hScale;

  const path = [
    `M ${cx} ${topY}`,
    `C ${cx + wF * 0.85} ${topY} ${cx + wF} ${foreheadY - 22} ${cx + wF} ${foreheadY}`,
    `C ${cx + wF + 6} ${foreheadY + 20} ${cx + 64} ${cheekY - 14} ${cx + 64} ${cheekY}`,
    `C ${cx + 62} ${cheekY + 20} ${cx + wJ + 8} ${jawY - 12} ${cx + wJ} ${jawY}`,
    `C ${cx + wJ - 10} ${jawY + 20} ${cx + 18} ${chinY - 10} ${cx} ${chinY}`,
    `C ${cx - 18} ${chinY - 10} ${cx - wJ + 10} ${jawY + 20} ${cx - wJ} ${jawY}`,
    `C ${cx - wJ - 8} ${jawY - 12} ${cx - 62} ${cheekY + 20} ${cx - 64} ${cheekY}`,
    `C ${cx - 64} ${cheekY - 14} ${cx - wF - 6} ${foreheadY + 20} ${cx - wF} ${foreheadY}`,
    `C ${cx - wF} ${foreheadY - 22} ${cx - wF * 0.85} ${topY} ${cx} ${topY}`,
    "Z",
  ].join(" ");

  /* feature positions track the morph */
  const eyeY = cheekY - 10;
  const eyeDX = 26 + (m.forehead / C - 0.9) * 8;
  const lipY = jawY + 22;
  const noseY = (eyeY + lipY) / 2 + 4;

  return (
    <svg viewBox="0 0 200 270" className="w-full h-auto max-h-[240px] mx-auto" role="img" aria-label="Face outline that morphs with your measurements">
      {/* measurement guides */}
      <g stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="3 4" opacity="0.9">
        <line x1={cx - 70} y1={foreheadY} x2={cx + 70} y2={foreheadY} />
        <line x1={cx - 72} y1={cheekY} x2={cx + 72} y2={cheekY} />
        <line x1={cx - 66} y1={jawY} x2={cx + 66} y2={jawY} />
        <line x1={cx} y1={topY - 6} x2={cx} y2={chinY + 6} />
      </g>
      {/* face outline */}
      <path d={path} fill={`color-mix(in srgb, ${accent} 10%, transparent)`} stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
      {/* hairline */}
      <path
        d={`M ${cx - wF * 0.96} ${foreheadY - 4} C ${cx - wF * 0.7} ${topY + 14} ${cx + wF * 0.7} ${topY + 14} ${cx + wF * 0.96} ${foreheadY - 4}`}
        fill="none"
        stroke={accent}
        strokeWidth="1.6"
        opacity="0.55"
      />
      {/* brows */}
      <path d={`M ${cx - eyeDX - 8} ${eyeY - 12} Q ${cx - eyeDX} ${eyeY - 17} ${cx - eyeDX + 7} ${eyeY - 12}`} fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" />
      <path d={`M ${cx + eyeDX - 7} ${eyeY - 12} Q ${cx + eyeDX} ${eyeY - 17} ${cx + eyeDX + 8} ${eyeY - 12}`} fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" />
      {/* eyes */}
      <ellipse cx={cx - eyeDX} cy={eyeY} rx="7.5" ry="5" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" />
      <ellipse cx={cx + eyeDX} cy={eyeY} rx="7.5" ry="5" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" />
      <circle cx={cx - eyeDX} cy={eyeY} r="2.4" fill="var(--ink-3)" />
      <circle cx={cx + eyeDX} cy={eyeY} r="2.4" fill="var(--ink-3)" />
      {/* nose */}
      <path d={`M ${cx - 4} ${noseY} Q ${cx - 6} ${noseY + 9} ${cx - 3} ${noseY + 11}`} fill="none" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d={`M ${cx + 4} ${noseY} Q ${cx + 6} ${noseY + 9} ${cx + 3} ${noseY + 11}`} fill="none" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      {/* lips */}
      <path
        d={`M ${cx - 12} ${lipY} Q ${cx - 6} ${lipY - 4} ${cx} ${lipY - 1} Q ${cx + 6} ${lipY - 4} ${cx + 12} ${lipY} Q ${cx + 6} ${lipY + 6} ${cx} ${lipY + 5} Q ${cx - 6} ${lipY + 6} ${cx - 12} ${lipY} Z`}
        fill={`color-mix(in srgb, ${accent} 26%, transparent)`}
        stroke="var(--ink-3)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/* ---------- main component ---------- */

const SLIDERS: { key: "length" | "forehead" | "cheekbone" | "jaw"; label: string; hint: string; min: number; max: number }[] = [
  { key: "length", label: "Face length", hint: "hairline → chin", min: 17, max: 28 },
  { key: "forehead", label: "Forehead width", hint: "widest above the brows", min: 11, max: 19 },
  { key: "cheekbone", label: "Cheekbone width", hint: "widest across the cheeks", min: 12, max: 19 },
  { key: "jaw", label: "Jaw width", hint: "widest at the jaw corners", min: 10, max: 19 },
];

export function FaceMeter({ onOpenStyle }: { onOpenStyle: (s: HairStyle) => void }) {
  const [m, setM] = useState({ length: 23, forehead: 15, cheekbone: 16, jaw: 13 });
  const result = useMemo(() => classifyFaceShape(m), [m]);
  const shapeGuide = faceShapes.find((f) => f.id === result.shape)!;
  const rec = shapeStyleMap[result.shape];

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Look in a mirror (hair tied back) and slide each measurement relative to the others — exact units don&apos;t matter, only the ratios. The classifier does the geometry.
      </p>

      {/* live morphing face */}
      <Card className="p-3.5 mt-4">
        <MorphFace m={m} accent="var(--cat-hair)" />
        <div className="flex justify-center gap-2 mt-1 flex-wrap">
          <Chip soft>L/C {result.ratios.length}</Chip>
          <Chip soft>F/C {result.ratios.forehead}</Chip>
          <Chip soft>J/C {result.ratios.jaw}</Chip>
        </div>
      </Card>

      {/* sliders */}
      <div className="space-y-4 mt-4">
        {SLIDERS.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-bold text-ink">{s.label}</p>
                <p className="text-[11px] text-ink-3">{s.hint}</p>
              </div>
              <span className="font-display text-[15px] text-cat-hair" style={{ color: "var(--cat-hair)" }}>
                {m[s.key]}
              </span>
            </div>
            <Slider
              value={[m[s.key]]}
              min={s.min}
              max={s.max}
              step={1}
              onValueChange={(v) => setM((prev) => ({ ...prev, [s.key]: v[0] }))}
              aria-label={s.label}
              className="mt-2"
            />
          </div>
        ))}
      </div>

      {/* result */}
      <div className="mt-5 rounded-[16px] border p-4" style={{ borderColor: "color-mix(in srgb, var(--cat-hair) 35%, transparent)", background: "color-mix(in srgb, var(--cat-hair) 8%, transparent)" }}>
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-surface text-cat-hair shrink-0" style={{ color: "var(--cat-hair)" }}>
            <RulerIcon width={17} height={17} />
          </span>
          <div>
            <p className="font-display text-[19px] text-ink leading-tight">{shapeNames[result.shape]} face</p>
            <p className="text-[11px] text-ink-3 mt-0.5">{Math.round(result.confidence * 100)}% confidence · ratio-classified</p>
          </div>
        </div>
        <p className="text-[13px] leading-[19px] text-ink-2 mt-2.5">{shapeGuide.goal}</p>
        <p className="text-[11.5px] leading-[16px] text-ink-3 mt-1.5">{shapeGuide.spot}</p>
        {/* runner-up */}
        {result.ranked[1] && result.ranked[1].score > 0.15 && (
          <p className="text-[11px] text-ink-3 mt-2">
            Closest alternative: {shapeNames[result.ranked[1].id]} — if that feels more like you, its guide lives in the Face Shapes section.
          </p>
        )}
      </div>

      {/* recommended styles */}
      <h4 className="font-display text-[17px] text-ink mt-6">Styles that flatter you</h4>
      <p className="text-[12px] text-ink-3 mt-0.5">{rec.why}</p>
      <div className="space-y-2.5 mt-3">
        {rec.yes.map((sid) => {
          const s = styleById(sid);
          if (!s) return null;
          const Mini = hairstyleMinis[s.id];
          return (
            <button
              key={sid}
              onClick={() => onOpenStyle(s)}
              className="w-full text-left bg-surface-muted rounded-[14px] p-3 flex items-center gap-3 press hover:bg-terra-soft transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
            >
              <span className="grid place-items-center w-11 h-11 rounded-[12px] shrink-0" style={{ background: "var(--surface)", color: "var(--cat-hair)" }}>
                {Mini ? <Mini width={30} height={30} /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-ink leading-tight">{s.name}</p>
                <p className="text-[11.5px] text-ink-3 mt-0.5">{s.minutes} min · {s.difficulty} · {s.heat ? "heat" : "heat-free"}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-[14px] bg-honey-soft p-3.5 mt-4">
        <Eyebrow color="var(--honey)">Careful with</Eyebrow>
        <p className="text-[13px] leading-[19px] text-ink-2 mt-1.5">{rec.avoid}</p>
      </div>
    </div>
  );
}
