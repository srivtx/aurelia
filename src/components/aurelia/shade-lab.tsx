"use client";

/* ============================================================
   AURELIA — Shade Lab (Color Lab)
   ------------------------------------------------------------
   Predicts how a shade will sit on HER measured skin:
   Lab α-blend (arXiv 2024 blend model) → ΔE2000, depth and
   undertone deltas, oxidation risk (skin sebum × warm pull),
   ashy-cast warning. Pure math, instant, offline.
   ============================================================ */

import { useMemo, useState } from "react";
import { hexToLab, labToHex } from "@/lib/color-science";
import { matchShade, oilyFactorFromSkinType, type ProductKind, type ShadeVerdict } from "@/lib/shade-match";
import { useAurelia } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import { MirrorIcon, FlaskIcon } from "./icons";

const KINDS: { id: ProductKind; label: string; alpha: string }[] = [
  { id: "foundation", label: "Foundation", alpha: "α 0.72" },
  { id: "blush", label: "Blush", alpha: "α 0.30" },
  { id: "lip", label: "Lip", alpha: "α 0.85" },
];

/* example shades per kind — hex + friendly name */
const PRESETS: Record<ProductKind, { name: string; hex: string }[]> = {
  foundation: [
    { name: "Ivory", hex: "#F5DCC8" },
    { name: "Warm beige", hex: "#E8C4A0" },
    { name: "Golden tan", hex: "#D3A074" },
    { name: "Almond", hex: "#B07B4F" },
    { name: "Chestnut", hex: "#7A4B2E" },
    { name: "Espresso", hex: "#4A2C1D" },
  ],
  blush: [
    { name: "Peach", hex: "#F2B08E" },
    { name: "Rose", hex: "#E5A3B1" },
    { name: "Berry", hex: "#B05479" },
    { name: "Terracotta", hex: "#C97B58" },
  ],
  lip: [
    { name: "Nude rose", hex: "#C88A80" },
    { name: "Warm red", hex: "#B0402E" },
    { name: "Cool red", hex: "#9E1B30" },
    { name: "Berry", hex: "#8E2A52" },
    { name: "Coral", hex: "#E8684F" },
  ],
};

export function ShadeLab() {
  const { skinSignature, skinResult, profile } = useAurelia();
  const [kind, setKind] = useState<ProductKind>("foundation");
  const [shadeHex, setShadeHex] = useState("#E8C4A0");
  const [custom, setCustom] = useState("");

  const skinType = skinResult?.base ?? profile?.skinType ?? null;
  const oily = oilyFactorFromSkinType(skinType);

  const verdict: ShadeVerdict | null = useMemo(() => {
    if (!skinSignature) return null;
    const shade = hexToLab(shadeHex);
    const skin = { L: skinSignature.L, a: skinSignature.a, b: skinSignature.b };
    return matchShade(skin, shade, kind, oily);
  }, [skinSignature, shadeHex, kind, oily]);

  const skinHex = skinSignature ? labToHex({ L: skinSignature.L, a: skinSignature.a, b: skinSignature.b }) : null;
  const predictedHex = verdict ? labToHex(verdict.predicted) : null;

  const applyCustom = () => {
    const hex = custom.trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setShadeHex(hex);
      setCustom("");
    }
  };

  const fitColor = verdict
    ? verdict.fit >= 80
      ? "var(--success)"
      : verdict.fit >= 60
        ? "var(--gold)"
        : "var(--error)"
    : "var(--ink-3)";

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        See how a shade will sit on <b>your measured skin</b> before you buy: we α-blend the shade with your skin in
        CIELAB (the blend model from published foundation-color research), then score depth, undertone congruence and
        oxidation risk. Instant, offline, nothing uploaded.
      </p>

      {!skinSignature && (
        <Card className="p-4 mt-4 border-gold/30 bg-gold/10">
          <Eyebrow color="var(--gold)">First, measure your skin</Eyebrow>
          <p className="text-[12.5px] leading-[18px] text-ink-2 mt-1.5">
            The Shade Lab needs your Skin Signature (one selfie + something white, ~30 seconds). Find it in the Color
            Lab — then every shade gets a verdict against <i>your</i> numbers, not a guess.
          </p>
        </Card>
      )}

      {/* product kind */}
      <div className="flex gap-2 mt-4" role="tablist" aria-label="Product type">
        {KINDS.map((k) => (
          <button
            key={k.id}
            role="tab"
            aria-selected={kind === k.id}
            onClick={() => setKind(k.id)}
            className={`flex-1 h-10 rounded-full text-[13px] font-bold press border ${kind === k.id ? "text-white" : "text-ink-2 border-line"}`}
            style={kind === k.id ? { background: "var(--cat-colors)", borderColor: "var(--cat-colors)" } : undefined}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* shade picker */}
      <div className="flex gap-2 mt-3">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyCustom()}
          placeholder="#B0402E"
          aria-label="Enter a shade hex code"
          className="flex-1 h-11 rounded-[14px] border border-line bg-surface px-4 text-[14px] font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
        />
        <div className="w-11 h-11 rounded-[14px] border border-line overflow-hidden grid place-items-center shrink-0" aria-hidden>
          <input
            type="color"
            aria-label="Shade color picker"
            value={shadeHex}
            onChange={(e) => setShadeHex(e.target.value.toUpperCase())}
            className="w-14 h-14 -m-2 cursor-pointer bg-transparent border-none"
            tabIndex={-1}
          />
        </div>
        <button
          onClick={applyCustom}
          className="h-11 px-4 rounded-full text-white text-[13px] font-bold press shrink-0"
          style={{ background: "var(--cat-colors)" }}
        >
          Set
        </button>
      </div>

      {/* presets */}
      <div className="flex flex-wrap gap-2 mt-3">
        {PRESETS[kind].map((p) => (
          <button
            key={p.hex}
            onClick={() => setShadeHex(p.hex)}
            aria-label={`Try ${p.name}`}
            className="press flex items-center gap-1.5 rounded-full border border-line pl-1 pr-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
            style={shadeHex === p.hex ? { borderColor: "var(--cat-colors)", boxShadow: "0 0 0 2px color-mix(in srgb, var(--cat-colors) 30%, transparent)" } : undefined}
          >
            <span className="w-7 h-7 rounded-full border border-line-soft" style={{ background: p.hex }} />
            <span className="text-[11.5px] font-semibold text-ink-2">{p.name}</span>
          </button>
        ))}
      </div>

      {/* verdict */}
      {verdict && skinSignature && skinHex && predictedHex ? (
        <div className="mt-5 space-y-3">
          {/* on-skin preview */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex rounded-[14px] overflow-hidden border border-line shrink-0" aria-label="Your skin and the predicted on-skin color">
                <div className="w-14 h-14 grid place-items-center" style={{ background: skinHex }}>
                  <MirrorIcon width={15} height={15} style={{ color: readable(skinHex) }} />
                </div>
                <div className="w-14 h-14 grid place-items-center" style={{ background: predictedHex }}>
                  <span className="text-[9.5px] font-bold" style={{ color: readable(predictedHex) }}>on you</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip color={fitColor}>{verdict.headline}</Chip>
                  <Chip soft>{`ΔE ${verdict.visibility}`}</Chip>
                </div>
                <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1.5">{verdict.verdict}</p>
              </div>
              <div className="shrink-0 grid place-items-center w-14 h-14 rounded-full border-[5px]" style={{ borderColor: fitColor }} aria-label={`Fit ${verdict.fit} out of 100`}>
                <span className="font-display text-[16px]">{verdict.fit}</span>
              </div>
            </div>
          </Card>

          {/* deltas */}
          <Card className="p-4">
            <Eyebrow color="var(--cat-colors)">The color-lab read</Eyebrow>
            <div className="space-y-2.5 mt-2.5">
              <DeltaRow icon="L" note={verdict.depthCall} />
              <DeltaRow icon="h°" note={verdict.undertoneCall} />
              <DeltaRow
                icon="ΔE"
                note={`Predicted on-skin sits ΔE ${verdict.visibility} from your bare skin — ${verdict.visibility < 3.5 ? "a whisper" : verdict.visibility < 8 ? "a visible shift" : "a statement"} on you.`}
              />
            </div>
            <p className="text-[11px] text-ink-3 mt-3">
              Blend α {KINDS.find((k) => k.id === kind)?.alpha} · skin L* {skinSignature.L.toFixed(0)} h{" "}
              {skinSignature.hue.toFixed(0)}° → predicted L* {verdict.predicted.L.toFixed(0)}
            </p>
          </Card>

          {/* oxidation */}
          <Card className="p-4">
            <Eyebrow color={verdict.oxidation.risk === "high" ? "var(--error)" : verdict.oxidation.risk === "medium" ? "var(--gold)" : "var(--cat-colors)"}>
              Oxidation risk · {verdict.oxidation.risk}
            </Eyebrow>
            <p className="text-[12.5px] leading-[18px] text-ink-3 mt-1.5">{verdict.oxidation.note}</p>
            {verdict.ashy && verdict.ashyNote && (
              <p className="text-[12.5px] leading-[18px] text-ink-2 mt-2 rounded-[12px] bg-honey-soft p-2.5">{verdict.ashyNote}</p>
            )}
            {skinType && (
              <p className="text-[11px] text-ink-3 mt-2">Sebum factor from your {skinType} skin profile{skinType.toLowerCase().includes("oily") || skinType.toLowerCase().includes("combination") ? " — the classic oxidizer" : ""}.</p>
            )}
          </Card>

          <p className="text-[11.5px] leading-[16px] text-ink-3 flex gap-2">
            <FlaskIcon width={14} height={14} className="shrink-0 mt-0.5" />
            Method: Lab-space α-blend of shade and measured skin, CIEDE2000 deltas, oxidation heuristic (skin oiliness
            × warm pull). Estimates, not corneometer readings — see docs/RESEARCH-PAPERS.md.
          </p>
        </div>
      ) : (
        skinSignature && (
          <div className="mt-5 rounded-[16px] border border-dashed border-line p-5 text-center">
            <MirrorIcon width={26} height={26} className="mx-auto text-ink-3" />
            <p className="text-[13px] text-ink-3 mt-2">Pick a shade above — the verdict appears instantly.</p>
          </div>
        )
      )}
    </div>
  );
}

function DeltaRow({ icon, note }: { icon: string; note: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="shrink-0 grid place-items-center w-7 h-7 rounded-[9px] bg-surface-muted text-[10.5px] font-bold text-cat-colors">{icon}</span>
      <p className="text-[12.5px] leading-[17px] text-ink-2">{note}</p>
    </div>
  );
}

function readable(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const Y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return Y > 0.35 ? "rgba(45,35,32,0.85)" : "rgba(255,255,255,0.92)";
}
