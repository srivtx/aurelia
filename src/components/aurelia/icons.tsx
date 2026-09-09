"use client";

/* ============================================================
   AURELIA SVG ICONS — 24px grid, round caps, currentColor
   Style: 1.5-2px warm line art (per DESIGN_BRIEF §6)
   ============================================================ */

import { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/* ---------- Tab bar icons ---------- */

export const SparkleIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3.5c1.1 4.6 2.9 6.4 7.5 7.5-4.6 1.1-6.4 2.9-7.5 7.5-1.1-4.6-2.9-6.4-7.5-7.5 4.6-1.1 6.4-2.9 7.5-7.5Z" />
    <path d="M18.5 15.5c.5 2 1.3 2.8 3.2 3.2-1.9.4-2.7 1.2-3.2 3.2-.5-2-1.3-2.8-3.2-3.2 1.9-.4 2.7-1.2 3.2-3.2Z" strokeWidth="1.4" />
  </svg>
);

export const PaletteIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 21c-4.5 0-8.2-3.4-8.2-7.9 0-4.6 3.9-8.3 8.6-8.3 4.4 0 8 3 8 7 0 2.3-1.8 3.4-3.5 3.4h-1.3c-1 0-1.8.8-1.8 1.8 0 .5.2.9.5 1.3.3.4.5.9.5 1.4 0 .7-.6 1.3-1.3 1.3Z" />
    <circle cx="8.2" cy="10.6" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="15.9" cy="9.6" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="7.4" cy="14.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const LipstickIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M9.2 10.5V5.4l2.4-2.1 2.4 2.1v5.1" />
    <rect x="9.2" y="10.5" width="4.8" height="3.2" rx="0.8" />
    <rect x="8.2" y="13.7" width="6.8" height="7.3" rx="1.4" />
    <path d="M11.2 5.2h1.6v5.3h-1.6z" fill="currentColor" stroke="none" opacity="0.35" />
  </svg>
);

export const DropletIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3.2s6.5 6.6 6.5 11a6.5 6.5 0 1 1-13 0c0-4.4 6.5-11 6.5-11Z" />
    <path d="M9.3 13.8c.3 1.8 1.4 3 3.1 3.3" strokeWidth="1.4" />
  </svg>
);

export const ScissorsIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="6" cy="6.5" r="2.4" />
    <circle cx="6" cy="17.5" r="2.4" />
    <path d="M8.2 8 20 18.5M8.2 16 20 5.5M13.5 11.2 20 5.5" />
  </svg>
);

/* ---------- UI glyphs ---------- */

export const SearchIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4.5 4.5" />
  </svg>
);

export const ShareIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3.5v11" />
    <path d="m8 7.5 4-4 4 4" />
    <path d="M5.5 12.5v6A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5v-6" />
  </svg>
);

export const FlameIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3.2c.6 3-1 4.6-2.6 6.2C7.8 11 6.3 12.7 6.3 15.4a5.7 5.7 0 0 0 11.4 0c0-3.9-2.7-5.7-3.7-8.7-.3-1-1.1-2-2-3.5Z" />
    <path d="M12 16.8c-1.2-.7-1.8-1.8-1.2-3.1.3.9 1 1.2 1.5 1.6" strokeWidth="1.3" />
  </svg>
);

export const SunriseIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 4v2.5" />
    <path d="M5.6 6.6 7.4 8.4M18.4 6.6 16.6 8.4" />
    <path d="M8 17a4 4 0 0 1 8 0" />
    <path d="M2.5 20.5h19" />
    <path d="M5 17H2.5M21.5 17H19" />
  </svg>
);

export const MoonStarIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5 7.6 7.6 0 1 0 19.5 14.5Z" />
    <path d="M17.5 4.5c.4 1.6 1.1 2.3 2.7 2.7-1.6.4-2.3 1.1-2.7 2.7-.4-1.6-1.1-2.3-2.7-2.7 1.6-.4 2.3-1.1 2.7-2.7Z" strokeWidth="1.3" />
  </svg>
);

export const UserIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.8 20.2c.6-3.7 3.6-5.8 7.2-5.8s6.6 2.1 7.2 5.8" />
  </svg>
);

export const PencilIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Z" />
    <path d="m12.5 7.5 4 4" strokeWidth="1.3" />
  </svg>
);

export const RefreshIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4h-4" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: P & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.3S4 15.6 4 9.9C4 7.2 6.1 5 8.7 5c1.4 0 2.6.7 3.3 1.7.7-1 1.9-1.7 3.3-1.7C17.9 5 20 7.2 20 9.9c0 5.7-8 10.4-8 10.4Z" strokeWidth={filled ? 0 : 1.8} />
  </svg>
);

export const CheckIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const TrendIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M3.5 19.5 9 13l3.5 3.5L20.5 8" />
    <path d="M15.5 8h5v5" />
  </svg>
);

export const XIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const SunIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </svg>
);

export const MoonIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M20 13.6A8.2 8.2 0 0 1 10.4 4 8.3 8.3 0 1 0 20 13.6Z" />
  </svg>
);

export const ClockIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const ArrowRightIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const ArrowDownIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 5v14m-6-6 6 6 6-6" />
  </svg>
);

export const ArrowUpIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 19V5m-6 6 6-6 6 6" />
  </svg>
);

export const ChevronDownIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const AlertIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 4 21 19.5H3L12 4Z" />
    <path d="M12 10v4M12 16.8v.2" />
  </svg>
);

export const LightbulbIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M8.5 14.5a5.5 5.5 0 1 1 7 0v1.8h-7v-1.8Z" />
    <path d="M9.8 19h4.4M10.8 21h2.4" />
  </svg>
);

export const ToolsIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 4h4l2 8h8l2-8" transform="translate(0 0)" />
    <path d="M10 12l-1.5 6h7L14 12" />
    <circle cx="12" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const BrushIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M14.5 3.5 20.5 9.5M17.2 6.2 8.5 14.9M9.8 13.6c-1.9.4-3.3 1.8-3.8 4.4-.2 1-1 1.5-2 1.5 1 1.2 2.6 2 4.2 2 2.7 0 4.8-2 4.8-4.8l-3.2-3.1Z" />
  </svg>
);

export const MirrorIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="9" r="6" />
    <path d="M12 3.5v11M4.5 9h15" opacity="0.4" />
    <path d="M12 15v5.5M9.5 20.5h5" />
  </svg>
);

/* ---------- Outfit category icons (hair tab) ---------- */

export const TeeIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M8.5 4 5 6l-1.5 4 3 1.2L6.5 20h11l.5-8.8 3-1.2L19 6l-3.5-2a3.5 3.5 0 0 1-7 0Z" />
  </svg>
);

export const BackpackIcon = (props: P) => (
  <svg {...base(props)}>
    <rect x="6" y="8" width="12" height="12" rx="3" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    <path d="M6 13h12" opacity="0.5" />
    <rect x="10" y="15" width="4" height="3" rx="1" opacity="0.6" />
  </svg>
);

export const DressIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M9 4h6l1.5 5.5c2 3.5 3 7.5 3.5 11H4c.5-3.5 1.5-7.5 3.5-11L9 4Z" />
    <path d="M9 4c.6 1.4 1.7 2.2 3 2.2S14.4 5.4 15 4" />
  </svg>
);

export const DiscoIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="12" r="6.5" opacity="0.5" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </svg>
);

export const BlazerIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M9 4 6 6l-1 14h14L18 6l-3-2-3 3-3-3Z" />
    <path d="M12 7v13" opacity="0.5" />
  </svg>
);

export const FlowerIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="9" r="1.6" />
    <path d="M12 7.4c0-2 1.4-3.4 3.2-3.4 0 2-1.3 3.4-3.2 3.4ZM13.5 9.9c2-.4 3.6.8 3.9 2.6-2 .4-3.6-.8-3.9-2.6ZM12.2 10.8c.6 1.9-.4 3.7-2.1 4.4-.6-1.9.4-3.7 2.1-4.4ZM10.5 9.7c-1.7-.8-2.3-2.8-1.6-4.4 1.7.8 2.3 2.8 1.6 4.4Z" />
    <path d="M12 11v9" opacity="0.5" />
  </svg>
);

export const DumbbellIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M7 8v8M4.5 9.5v5M17 8v8M19.5 9.5v5M7 12h10" />
  </svg>
);

export const BeachIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 19h16" />
    <path d="M13.5 19c0-4.4-1.6-8.7-4.3-12.2 4.8.7 8.5 4.9 9.1 9.9.1.8.1 1.6.1 2.3" />
    <path d="M6.5 7c1.5-.5 3-.5 4.5 0" opacity="0.5" />
  </svg>
);

/* ---------- Deep-tech feature icons ---------- */

export const FlaskIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M9.5 3.5v4.6L4.8 16.6A2.4 2.4 0 0 0 6.9 20.2h10.2a2.4 2.4 0 0 0 2.1-3.6L14.5 8.1V3.5" />
    <path d="M8.5 3.5h7" />
    <path d="M7.4 14.5c1.6-1 3.1-1 4.6 0 1.5 1 3 1 4.6 0" opacity="0.7" />
    <circle cx="10" cy="17" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="13.2" cy="18" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const CameraIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M4.5 8.2A2.2 2.2 0 0 1 6.7 6h1.2l1.2-1.8h5.8L16.1 6h1.2a2.2 2.2 0 0 1 2.2 2.2v9a2.2 2.2 0 0 1-2.2 2.2H6.7a2.2 2.2 0 0 1-2.2-2.2v-9Z" />
    <circle cx="12" cy="13" r="4" />
    <circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

export const ChatIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M20 12.4c0 4-3.6 7.2-8 7.2-.9 0-1.8-.1-2.6-.4L5 20.5l1.2-3.1A6.9 6.9 0 0 1 4 12.4c0-4 3.6-7.2 8-7.2s8 3.2 8 7.2Z" />
    <path d="M12 9.6c.5 2 1.3 2.8 3.2 3.2-1.9.4-2.7 1.2-3.2 3.2-.5-2-1.3-2.8-3.2-3.2 1.9-.4 2.7-1.2 3.2-3.2Z" strokeWidth="1.3" />
  </svg>
);

export const SpiralIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 12c0-1.8 1.4-3.2 3.2-3.2 2.4 0 4.3 1.9 4.3 4.3 0 3.2-2.6 5.7-5.8 5.7-4.2 0-7.7-3.4-7.7-7.7C6 6.3 10 2.5 15 2.5" />
    <path d="M12 12c1.8 0 3.2 1.4 3.2 3.2" opacity="0.55" />
  </svg>
);

export const SwapIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M16.5 3.5 20 7l-3.5 3.5" />
    <path d="M20 7H8.5A4.5 4.5 0 0 0 4 11.5" />
    <path d="M7.5 20.5 4 17l3.5-3.5" />
    <path d="M4 17h11.5A4.5 4.5 0 0 0 20 12.5" />
  </svg>
);

export const SendIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 11.6 20 4l-7.6 16-2-6.4L4 11.6Z" />
    <path d="m10.4 13.6 3.8-3.6" strokeWidth="1.3" />
  </svg>
);

export const RulerIcon = (props: P) => (
  <svg {...base(props)}>
    <rect x="2.8" y="8.6" width="18.4" height="6.8" rx="1.6" />
    <path d="M6.4 8.6v2.6M9.6 8.6v4M12.8 8.6v2.6M16 8.6v4M19.2 8.6v2.6" />
  </svg>
);

export const SwatchDropIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3.2s6.5 6.6 6.5 11a6.5 6.5 0 1 1-13 0c0-4.4 6.5-11 6.5-11Z" />
    <path d="M12 20.5c-2 0-3.6-1.6-3.6-3.6 0-1.8 1.9-4 2.6-4.8" strokeWidth="1.3" />
  </svg>
);


export const outfitIcons: Record<string, (props: P) => React.ReactElement> = {
  casual: TeeIcon,
  college: BackpackIcon,
  date: DressIcon,
  party: DiscoIcon,
  formal: BlazerIcon,
  ethnic: FlowerIcon,
  sporty: DumbbellIcon,
  beach: BeachIcon,
};

export const tabIcons: Record<string, (props: P) => React.ReactElement> = {
  home: SparkleIcon,
  colors: PaletteIcon,
  makeup: LipstickIcon,
  skin: DropletIcon,
  hair: ScissorsIcon,
};
