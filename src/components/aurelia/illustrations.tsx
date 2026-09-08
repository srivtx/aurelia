"use client";

/* ============================================================
   AURELIA SVG ILLUSTRATIONS
   Style: faceless fashion line art + soft blush fills
   Stroke: warm ink (currentColor), round caps, max 2 fills
   ============================================================ */

import { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/* ---------- Hero: faceless girl with palette (Home) ---------- */

export const HeroIllustration = (props: P) => (
  <svg viewBox="0 0 240 220" fill="none" {...props}>
    {/* soft blush blob */}
    <path
      d="M196 42c18 22 26 52 20 80-6 29-27 55-54 68-28 13-60 12-84-4C54 170 40 138 44 106 48 74 70 46 100 32c30-14 78-12 96 10Z"
      fill="var(--primary-soft)"
      opacity="0.55"
    />
    <path
      d="M60 172c-8-10-14-24-12-38 2-15 14-26 27-31"
      stroke="var(--rose-soft, #F6DDE3)"
      strokeWidth="10"
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* hair back */}
    <path
      d="M92 88c-4-18 4-38 22-46 20-9 44-2 54 16 9 16 6 36-4 50-6 8-14 12-22 13"
      fill="var(--rose-soft, #F6DDE3)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* face (blank) */}
    <path
      d="M92 86c-3-16 5-32 21-38 17-6 36-1 44 13 8 13 5 30-3 42-5 7-12 11-19 12"
      fill="var(--surface, #FFF)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* single-line face hint */}
    <path d="M112 78c4 2 9 2 13 0" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    {/* neck + shoulders */}
    <path
      d="M116 110c0 8 2 14 7 18M142 108c0 8-2 14-7 18"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M84 148c6-14 18-22 34-22s30 8 36 20c4 8 6 18 6 28v22H78v-22c0-9 2-18 6-26Z"
      fill="var(--terra-soft, #F7E9E0)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* arm holding palette */}
    <path d="M156 148c8 4 13 10 14 18" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    <path d="M158 142c10 2 17 9 18 20l2 14" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    {/* palette */}
    <path
      d="M170 176c-2-8 4-15 12-15 9 0 16 7 15 16-1 8-8 13-15 12-6-1-11-7-12-13Z"
      fill="var(--surface, #FFF)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
    />
    <circle cx="177" cy="172" r="2.2" fill="var(--primary, #A84A62)" />
    <circle cx="185" cy="171" r="2.2" fill="var(--secondary, #C97B58)" />
    <circle cx="181" cy="180" r="2.2" fill="var(--cat-skin, #7FA08C)" />
    {/* hair strand front */}
    <path d="M96 64c6-8 16-12 26-10" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    {/* sparkles */}
    <path d="M64 92c1 4 2.6 5.6 6.6 6.6-4 1-5.6 2.6-6.6 6.6-1-4-2.6-5.6-6.6-6.6 4-1 5.6-2.6 6.6-6.6Z" fill="var(--accent, #D9A441)" opacity="0.85" />
    <path d="M196 116c.8 3.2 2 4.4 5.2 5.2-3.2.8-4.4 2-5.2 5.2-.8-3.2-2-4.4-5.2-5.2 3.2-.8 4.4-2 5.2-5.2Z" fill="var(--primary, #A84A62)" opacity="0.7" />
  </svg>
);

/* ---------- Quiz illustration (skin tab) ---------- */

export const QuizIllustration = (props: P) => (
  <svg viewBox="0 0 200 160" fill="none" {...props}>
    <path
      d="M158 22c12 16 16 38 10 58-7 21-22 39-42 47-20 9-44 8-60-4-16-11-24-33-19-54 5-22 21-40 43-48 22-8 56-15 68 1Z"
      fill="var(--sage-soft, #DCEAE1)"
      opacity="0.6"
    />
    {/* face profile */}
    <path
      d="M70 44c-2-12 5-24 17-28 13-4 27 1 32 12 5 10 2 23-4 32-4 6-10 9-16 10"
      fill="var(--surface, #FFF)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M78 36c5 3 11 3 16 0" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* bun */}
    <circle cx="58" cy="36" r="10" fill="var(--sage-soft, #DCEAE1)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" />
    <path d="M62 28c6-6 16-6 21 1" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    {/* neck + shoulder */}
    <path d="M92 70c0 6 2 10 6 13M76 68c0 6-2 10-6 13" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    <path d="M56 108c5-11 15-17 27-17s22 6 27 15v18H50v-16Z" fill="var(--sage-soft, #DCEAE1)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinejoin="round" />
    {/* thought bubbles with category marks */}
    <path d="M112 52h56M130 52v0" stroke="none" />
    <circle cx="140" cy="42" r="17" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.8" />
    <circle cx="128" cy="62" r="4" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.5" />
    <circle cx="120" cy="72" r="2.4" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.2" />
    {/* droplet inside bubble */}
    <path d="M140 32s6.5 6.6 6.5 11a6.5 6.5 0 1 1-13 0c0-4.4 6.5-11 6.5-11Z" stroke="var(--cat-skin, #7FA08C)" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M168 86c.9 3.4 2.2 4.7 5.6 5.6-3.4.9-4.7 2.2-5.6 5.6-.9-3.4-2.2-4.7-5.6-5.6 3.4-.9 4.7-2.2 5.6-5.6Z" fill="var(--cat-skin, #7FA08C)" />
    <path d="M158 34c.8 3 2 4.2 5 5-3 .8-4.2 2-5 5-.8-3-2-4.2-5-5 3-.8 4.2-2 5-5Z" fill="var(--primary, #A84A62)" opacity="0.75" />
  </svg>
);

/* ---------- Empty saved (hand mirror) ---------- */

export const EmptySavedIllustration = (props: P) => (
  <svg viewBox="0 0 160 160" fill="none" {...props}>
    <path
      d="M126 18c10 14 13 33 8 50-6 18-19 33-36 40-17 7-37 6-50-3-13-9-19-27-15-45 4-19 18-34 37-41 19-7 46-14 56 5Z"
      fill="var(--primary-soft)"
      opacity="0.5"
    />
    <circle cx="72" cy="62" r="34" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" />
    <path d="M52 44c4-6 10-10 16-11" stroke="var(--rose-soft, #F6DDE3)" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    <path d="M88 89l10 10" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M92 93 104 81l10 10-12 12c-4 4-10 4-13 0-3-4-3-9 3-10Z"
      fill="var(--terra-soft, #F7E9E0)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M34 30c1.2 5 3.2 7 8.2 8.2-5 1.2-7 3.2-8.2 8.2-1.2-5-3.2-7-8.2-8.2 5-1.2 7-3.2 8.2-8.2Z" fill="var(--accent, #D9A441)" opacity="0.9" />
    <path d="M118 118c1 4 2.6 5.6 6.6 6.6-4 1-5.6 2.6-6.6 6.6-1-4-2.6-5.6-6.6-6.6 4-1 5.6-2.6 6.6-6.6Z" fill="var(--primary, #A84A62)" opacity="0.7" />
  </svg>
);

/* ---------- Hairstyle line-art minis (48px grid) ---------- */

const hair = (props: P) => ({
  width: 48,
  height: 48,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const PonyMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="22" cy="26" r="11" />
    <path d="M13 22c0-8 6-14 14-12" />
    <path d="M30 14c4-4 10-5 12-2-1 5-5 9-10 9" />
    <path d="M28 12c1-1 2-2 2-3" opacity="0.5" />
    <path d="M12 34c-2 3-2 6 1 8" opacity="0.6" />
  </svg>
);

export const BunMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="24" cy="28" r="10.5" />
    <circle cx="24" cy="11" r="6" />
    <path d="M18 21c1-3 3-5 6-5s5 2 6 5" />
    <path d="M16 34c-2 2-2 5 0 7M32 34c2 2 2 5 0 7" opacity="0.6" />
  </svg>
);

export const ClawMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="20" cy="22" r="11" />
    <path d="M10 18c0-7 5-12 12-11 6 1 10 5 10 11" />
    <path d="M29 24c6 1 10 5 11 11" />
    <path d="M36 30l3-1M38 34l3 0M38 38l2 2" opacity="0.7" />
  </svg>
);

export const CurlsMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="24" cy="18" r="10" />
    <path d="M14 17c-3 4-3 9 0 12 3 3 3 7 1 9" />
    <path d="M34 17c3 4 3 9 0 12-3 3-3 7-1 9" />
    <path d="M18 26c-2 2-2 5 0 6s2 4 1 6" opacity="0.6" />
    <path d="M30 26c2 2 2 5 0 6s-2 4-1 6" opacity="0.6" />
  </svg>
);

export const HalfUpMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="24" cy="22" r="11" />
    <path d="M13 19c0-7 5-11 11-11s11 4 11 11" />
    <path d="M20 9c2 2 6 2 8 0" />
    <circle cx="24" cy="7" r="2.2" fill="currentColor" stroke="none" opacity="0.8" />
    <path d="M15 30c-1 3-1 6 1 9M33 30c1 3 1 6-1 9" opacity="0.6" />
  </svg>
);

export const BraidMini = (props: P) => (
  <svg {...hair(props)}>
    <path d="M17 6c-4 3-5 8-3 12 2 5 2 14-1 24 5 2 10 2 14 0-3-10-3-19-1-24 2-4 1-9-3-12-2-1.5-5-1.5-6 0Z" />
    <path d="M18 22l4 3 4-3 4 3M18 28l4 3 4-3 4 3M19 34l4 3 4-3 4 3" opacity="0.8" />
    <path d="M22 40h4" />
  </svg>
);

export const FishtailMini = (props: P) => (
  <svg {...hair(props)}>
    <path d="M14 6c-3 4-3 9 0 13 3 5 3 14 0 23 5 2 10 2 15 0-3-9-3-18 0-23 3-4 3-9 0-13-2-2-4-2-5 0-1-2-3-2-5 0-2 2-3 4-2 6" opacity="0.9" />
    <path d="M17 24l6-2 6 2M18 30l6-2 6 2M19 36l6-2 6 2" opacity="0.7" />
  </svg>
);

export const SpaceBunsMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="15" cy="13" r="5.5" />
    <circle cx="33" cy="13" r="5.5" />
    <circle cx="24" cy="26" r="10.5" />
    <path d="M11 16c-1 2-1 4 0 6M37 16c1 2 1 4 0 6" opacity="0.6" />
    <path d="M15 32c-2 2-2 5-1 8M33 32c2 2 2 5 1 8" opacity="0.6" />
  </svg>
);

export const BubbleMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="24" cy="10" r="7" />
    <path d="M17 14c-3 6-3 12 0 18" opacity="0.5" />
    <path d="M20 17h8M19 24h10M20 31h8" />
    <ellipse cx="24" cy="17" rx="6.5" ry="4" opacity="0.4" />
    <ellipse cx="24" cy="24" rx="6.5" ry="4" opacity="0.4" />
    <ellipse cx="24" cy="31" rx="5" ry="3.5" opacity="0.4" />
    <path d="M24 34v6" />
  </svg>
);

export const HaloMini = (props: P) => (
  <svg {...hair(props)}>
    <circle cx="24" cy="24" r="10" />
    <path d="M24 10a14 14 0 0 1 14 14" opacity="0" />
    <path d="M13 13c-4 4-6 9-4 15 2 5 6 9 11 10" />
    <path d="M35 13c4 4 6 9 4 15-2 5-6 9-11 10" />
    <path d="M15 12.5l1.5 3M20 10.5l1 3M28 10.5l-1 3M33 12.5l-1.5 3M12 20l3 1M11 27l3 0M12 33l3-1.5" opacity="0.6" />
  </svg>
);

export const hairstyleMinis: Record<string, (props: P) => React.ReactElement> = {
  "sleek-high-pony": PonyMini,
  "messy-bun": BunMini,
  "claw-twist": ClawMini,
  "heatless-curls": CurlsMini,
  "half-up": HalfUpMini,
  "dutch-braid": BraidMini,
  fishtail: FishtailMini,
  "space-buns": SpaceBunsMini,
  "bubble-pony": BubbleMini,
  "halo-braid": HaloMini,
};

/* ---------- Face shape outlines (64px grid) ---------- */

const face = (props: P) => ({
  width: 64,
  height: 64,
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const OvalFace = (props: P) => (
  <svg {...face(props)}>
    <ellipse cx="32" cy="32" rx="17" ry="23" />
    <path d="M32 9v50" opacity="0.12" />
  </svg>
);
export const RoundFace = (props: P) => (
  <svg {...face(props)}>
    <circle cx="32" cy="32" r="20" />
    <path d="M32 12v40" opacity="0.12" />
  </svg>
);
export const SquareFace = (props: P) => (
  <svg {...face(props)}>
    <path d="M13 12h38v28c0 8-8 13-19 13s-19-5-19-13V12Z" />
    <path d="M32 12v39" opacity="0.12" />
  </svg>
);
export const HeartFace = (props: P) => (
  <svg {...face(props)}>
    <path d="M13 13c6-4 12-6 19-6s13 2 19 6c0 14-6 28-14 40h-10C19 41 13 27 13 13Z" />
    <path d="M32 7v40" opacity="0.12" />
  </svg>
);
export const LongFace = (props: P) => (
  <svg {...face(props)}>
    <rect x="15" y="8" width="34" height="48" rx="15" />
    <path d="M32 8v48" opacity="0.12" />
  </svg>
);
export const DiamondFace = (props: P) => (
  <svg {...face(props)}>
    <path d="M32 8c8 6 13 12 13 20s-5 16-13 28c-8-12-13-20-13-28s5-14 13-20Z" />
    <path d="M32 8v48" opacity="0.12" />
  </svg>
);

export const faceShapeIcons: Record<string, (props: P) => React.ReactElement> = {
  oval: OvalFace,
  round: RoundFace,
  square: SquareFace,
  heart: HeartFace,
  long: LongFace,
  diamond: DiamondFace,
};

/* ---------- Small decorative blobs for section headers ---------- */

export const SectionBlob = ({ color = "var(--primary-soft)", ...props }: P & { color?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" {...props}>
    <path
      d="M80 18c9 12 12 28 8 43-5 15-16 28-32 33-16 5-33 3-45-6C4 79 2 64 6 50 10 35 21 22 36 16c15-6 35-10 44 2Z"
      fill={color}
      opacity="0.55"
    />
  </svg>
);

/* ---------- Onboarding: girl greeting with mirror ---------- */

export const OnboardingIllustration = (props: P) => (
  <svg viewBox="0 0 220 180" fill="none" {...props}>
    <path
      d="M178 26c14 18 20 42 15 65-6 24-23 44-46 54-24 10-52 9-72-5-19-13-27-38-22-62 6-25 24-45 49-54 25-9 62-16 76 2Z"
      fill="var(--rose-soft, #F6DDE3)"
      opacity="0.45"
    />
    {/* girl */}
    <path
      d="M66 74c-3-14 4-28 17-33 13-5 29 0 35 12 5 11 3 25-3 34-4 6-10 10-16 11"
      fill="var(--surface, #FFF)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M82 62c4 2 10 2 14 0" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M86 92c0 6 2 11 5 14M104 90c0 6-2 11-5 14" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    <path d="M56 128c5-11 15-18 27-18 6 0 11 1 16 4" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 121c6-12 15-18 26-18s21 6 26 14v23H58v-16Z" fill="var(--terra-soft, #F7E9E0)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinejoin="round" />
    {/* hair */}
    <path
      d="M64 76c-4-16 4-32 19-38 16-6 34-2 42 10 8 12 6 28-2 39-5 7-12 11-18 12"
      fill="var(--rose-soft, #F6DDE3)"
      stroke="var(--ink-2, #5A4E46)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* hand mirror held out */}
    <path d="M108 112c10 0 18 4 22 10" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="142" cy="128" r="17" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" />
    <circle cx="142" cy="128" r="11" fill="var(--sage-soft, #DCEAE1)" opacity="0.8" />
    <path d="M132 120c3-4 7-7 11-7" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    <path d="M142 145v8" stroke="var(--ink-2, #5A4E46)" strokeWidth="2.4" strokeLinecap="round" />
    {/* sparkles */}
    <path d="M36 44c1 4 2.6 5.6 6.6 6.6-4 1-5.6 2.6-6.6 6.6-1-4-2.6-5.6-6.6-6.6 4-1 5.6-2.6 6.6-6.6Z" fill="var(--accent, #D9A441)" opacity="0.9" />
    <path d="M188 96c.9 3.6 2.3 5 6 5.9-3.7.9-5.1 2.3-6 5.9-.9-3.6-2.3-5-6-5.9 3.7-.9 5.1-2.3 6-5.9Z" fill="var(--primary, #A84A62)" opacity="0.7" />
    <path d="M176 40c.7 2.8 1.8 3.9 4.6 4.6-2.8.7-3.9 1.8-4.6 4.6-.7-2.8-1.8-3.9-4.6-4.6 2.8-.7 3.9-1.8 4.6-4.6Z" fill="var(--cat-skin, #7FA08C)" opacity="0.8" />
  </svg>
);

/* ---------- Search empty state: magnifier over swatches ---------- */

export const SearchIllustration = (props: P) => (
  <svg viewBox="0 0 160 140" fill="none" {...props}>
    <path
      d="M126 16c9 12 12 28 8 43-5 15-16 28-32 33-16 5-33 3-45-6-12-9-16-25-12-40 4-14 16-26 31-31 15-5 42-9 50 1Z"
      fill="var(--terra-soft, #F7E9E0)"
      opacity="0.5"
    />
    {/* swatch circles */}
    <circle cx="46" cy="88" r="12" fill="var(--primary, #A84A62)" opacity="0.25" />
    <circle cx="70" cy="96" r="10" fill="var(--secondary, #C97B58)" opacity="0.3" />
    <circle cx="92" cy="90" r="11" fill="var(--cat-skin, #7FA08C)" opacity="0.3" />
    <circle cx="60" cy="64" r="9" fill="var(--accent, #D9A441)" opacity="0.3" />
    {/* magnifier */}
    <circle cx="84" cy="56" r="24" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2.4" />
    <path d="M70 42c5-6 12-9 18-8" stroke="var(--rose-soft, #F6DDE3)" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    <path d="m101 73 14 14" stroke="var(--ink-2, #5A4E46)" strokeWidth="3.2" strokeLinecap="round" />
    {/* question dots inside lens */}
    <circle cx="80" cy="54" r="2.4" fill="var(--ink-2, #5A4E46)" opacity="0.6" />
    <circle cx="90" cy="54" r="2.4" fill="var(--ink-2, #5A4E46)" opacity="0.6" />
    <path d="M80 62c4 2 8 2 11 0" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    <path d="M28 34c.9 3.6 2.3 5 6 5.9-3.7.9-5.1 2.3-6 5.9-.9-3.6-2.3-5-6-5.9 3.7-.9 5.1-2.3 6-5.9Z" fill="var(--primary, #A84A62)" opacity="0.75" />
  </svg>
);

/* ---------- 404: lost compact ---------- */

export const NotFoundIllustration = (props: P) => (
  <svg viewBox="0 0 180 160" fill="none" {...props}>
    <path
      d="M142 20c10 14 13 33 8 50-6 18-19 33-36 40-17 7-37 6-50-3-13-9-19-27-15-45 4-19 18-34 37-41 19-7 46-12 56-1Z"
      fill="var(--primary-soft)"
      opacity="0.45"
    />
    {/* compact case */}
    <circle cx="84" cy="70" r="36" fill="var(--terra-soft, #F7E9E0)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2.2" />
    <circle cx="84" cy="70" r="26" fill="var(--surface, #FFF)" stroke="var(--ink-2, #5A4E46)" strokeWidth="2" />
    <path d="M66 56c4-6 9-10 15-11" stroke="var(--rose-soft, #F6DDE3)" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    {/* heart in the mirror */}
    <path
      d="M84 78s-9-5.4-9-10.4c0-2.4 1.9-4.3 4.2-4.3 1.2 0 2.3.6 2.9 1.5.6-.9 1.7-1.5 2.9-1.5 2.3 0 4.2 1.9 4.2 4.3 0 5-9 10.4-9 10.4Z"
      fill="var(--primary, #A84A62)"
      opacity="0.85"
    />
    <path d="M110 98l10 10" stroke="var(--ink-2, #5A4E46)" strokeWidth="2.2" strokeLinecap="round" />
    {/* dashed wandering path */}
    <path d="M28 128c12-8 20 6 32-2s18 8 30 0" stroke="var(--ink-2, #5A4E46)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 8" opacity="0.55" />
    <path d="M132 30c1 4 2.6 5.6 6.6 6.6-4 1-5.6 2.6-6.6 6.6-1-4-2.6-5.6-6.6-6.6 4-1 5.6-2.6 6.6-6.6Z" fill="var(--accent, #D9A441)" opacity="0.9" />
    <path d="M40 32c.8 3 2 4.2 5 5-3 .8-4.2 2-5 5-.8-3-2-4.2-5-5 3-.8 4.2-2 5-5Z" fill="var(--primary, #A84A62)" opacity="0.7" />
  </svg>
);

/* ---------- Update badge: sparkle ring (for toast) ---------- */

export const SparkleRing = (props: P) => (
  <svg viewBox="0 0 48 48" fill="none" {...props}>
    <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" strokeDasharray="3 7" opacity="0.5" />
    <path d="M24 13c1.3 5.5 3.5 7.7 9 9-5.5 1.3-7.7 3.5-9 9-1.3-5.5-3.5-7.7-9-9 5.5-1.3 7.7-3.5 9-9Z" fill="currentColor" />
  </svg>
);
