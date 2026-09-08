"use client";

/* ============================================================
   AURELIA — shared UI primitives (Soft Editorial)
   ============================================================ */

import { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ClockIcon, HeartIcon } from "./icons";
import { useAurelia, type Category } from "@/lib/store";

/* ---------- Eyebrow ---------- */

export function Eyebrow({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <p className="eyebrow" style={{ color: color ?? "var(--ink-400)" }}>
      {children}
    </p>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({
  eyebrow,
  title,
  accent,
  action,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
        <h2 className="font-display text-[21px] leading-[26px] text-ink mt-1">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ---------- Card ---------- */

export function Card({
  children,
  className = "",
  onClick,
  style,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  const clickable = Boolean(onClick);
  return (
    <div
      role={clickable ? "button" : undefined}
      aria-label={ariaLabel}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick!();
        }
      }}
      style={style}
      className={`bg-surface border border-line rounded-[16px] shadow-[0_2px_8px_rgba(45,35,32,0.05)] ${
        clickable ? "press cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-rose/40" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Save (heart) button with pop ---------- */

export function SaveButton({
  item,
  size = 40,
  className = "",
}: {
  item: { id: string; category: Category; title: string; subtitle: string };
  size?: number;
  className?: string;
}) {
  const { saved, toggleSaved } = useAurelia();
  const isSaved = saved.some((s) => s.id === item.id);
  const [pop, setPop] = useState(false);
  return (
    <button
      aria-label={isSaved ? "Remove from saved" : "Save"}
      aria-pressed={isSaved}
      onClick={(e) => {
        e.stopPropagation();
        toggleSaved(item);
        if (!isSaved) {
          setPop(true);
          setTimeout(() => setPop(false), 420);
        }
      }}
      style={{ width: size, height: size }}
      className={`tap-target press grid place-items-center rounded-full text-ink-3 hover:text-rose transition-colors ${className}`}
    >
      <span className={pop ? "heart-pop" : ""}>
        <HeartIcon filled={isSaved} width={20} height={20} className={isSaved ? "text-rose" : ""} />
      </span>
    </button>
  );
}

/* ---------- Chip ---------- */

export function Chip({
  children,
  color,
  soft,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  soft?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 h-7 text-[12px] font-semibold tracking-[0.02em] whitespace-nowrap ${
        soft ? "bg-surface-muted text-ink-2" : ""
      } ${className}`}
      style={
        color
          ? { background: `color-mix(in srgb, ${color} 14%, transparent)`, color }
          : undefined
      }
    >
      {children}
    </span>
  );
}

/* ---------- Numbered step row ---------- */

export function StepRow({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span
        className="font-display shrink-0 grid place-items-center w-7 h-7 rounded-full bg-rose-soft text-rose text-[13px] font-semibold mt-0.5"
        aria-hidden
      >
        {n}
      </span>
      <p className="text-[15px] leading-[22px] text-ink-2 min-w-0">{children}</p>
    </li>
  );
}

/* ---------- Bullet list with colored dots ---------- */

export function DotList({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <ul className="space-y-2.5">
      {Array.isArray(children) ? (
        children.map((c, i) => (
          <li key={i} className="flex gap-2.5 items-start">
            <span
              className="shrink-0 w-1.5 h-1.5 rounded-full mt-[9px]"
              style={{ background: color ?? "var(--ink-400)" }}
            />
            <div className="text-[14px] leading-[21px] text-ink-2 min-w-0">{c}</div>
          </li>
        ))
      ) : (
        children
      )}
    </ul>
  );
}

/* ---------- Meta row (time / difficulty) ---------- */

export function TimeChip({ minutes }: { minutes: number }) {
  return (
    <Chip soft>
      <ClockIcon width={13} height={13} />
      {minutes} min
    </Chip>
  );
}

export function DifficultyChip({ level }: { level: "easy" | "medium" }) {
  return (
    <Chip color={level === "easy" ? "var(--success)" : "var(--accent)"}>{level === "easy" ? "easy" : "medium"}</Chip>
  );
}

/* ---------- Do / Don't blocks ---------- */

export function DoBlock({ items, color = "var(--success)" }: { items: string[]; color?: string }) {
  return (
    <div className="rounded-[16px] p-4 space-y-2.5" style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span className="shrink-0 grid place-items-center w-5 h-5 rounded-full mt-0.5" style={{ background: `color-mix(in srgb, ${color} 22%, transparent)`, color }}>
            <CheckIcon width={12} height={12} strokeWidth={2.4} />
          </span>
          <p className="text-[14px] leading-[20px] text-ink-2">{it}</p>
        </div>
      ))}
    </div>
  );
}

export function DontBlock({ items, color = "var(--error)" }: { items: string[]; color?: string }) {
  return (
    <div className="rounded-[16px] p-4 space-y-2.5" style={{ background: `color-mix(in srgb, ${color} 9%, transparent)` }}>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span className="shrink-0 grid place-items-center w-5 h-5 rounded-full mt-0.5 text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}>
            ✕
          </span>
          <p className="text-[14px] leading-[20px] text-ink-2">{it}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Reveal (myth flip) ---------- */

export function MythCard({ myth, truth }: { myth: string; truth: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-4" onClick={() => setOpen(!open)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow color="var(--error)">Myth</Eyebrow>
          <p className="text-[15px] font-semibold text-ink leading-snug mt-1">“{myth}”</p>
        </div>
        <span
          className="shrink-0 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{ background: open ? "var(--success-soft)" : "var(--surface-muted)", color: open ? "var(--success)" : "var(--ink-3)" }}
        >
          {open ? "fact" : "tap"}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-line-soft">
              <Eyebrow color="var(--success)">The truth</Eyebrow>
              <p className="text-[14px] leading-[21px] text-ink-2 mt-1.5">{truth}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ---------- Stagger entrance wrapper ---------- */

export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 30);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((c, i) => (
            <div
              key={i}
              className={shown ? "rise-in" : ""}
              style={shown ? { animationDelay: `${Math.min(i, 6) * 40}ms` } : { opacity: 0 }}
            >
              {c}
            </div>
          ))
        : children}
    </div>
  );
}

/* ---------- screen title (per-tab H1) ---------- */

export function ScreenTitle({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent: string; children?: ReactNode }) {
  return (
    <header className="pt-6 pb-2">
      <Eyebrow color={accent}>{eyebrow}</Eyebrow>
      <h1 className="font-display text-[28px] leading-[34px] text-ink mt-1.5">{title}</h1>
      {children && <div className="mt-2">{children}</div>}
    </header>
  );
}
