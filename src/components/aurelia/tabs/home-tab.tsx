"use client";

/* ============================================================
   AURELIA — Home tab
   Daily tip · palette of the day · category explorer
   ============================================================ */

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tipOfTheDay, paletteOfTheDay } from "@/data/tips";
import { palettes, type Palette } from "@/data/colors";
import { useAurelia, type TabId } from "@/lib/store";
import { Card, Chip, Eyebrow, SectionHeader, SaveButton } from "./../bits";
import { HeroIllustration } from "./../illustrations";
import { tabIcons, ArrowRightIcon, ClockIcon, SparkleIcon } from "./../icons";

const categoryMeta: Record<string, { label: string; blurb: string; accent: string; tint: string }> = {
  colors: { label: "Color Combos", blurb: "What goes with what — the match engine", accent: "var(--cat-colors)", tint: "var(--terra-soft)" },
  makeup: { label: "Makeup", blurb: "From your first mascara to soft glam", accent: "var(--cat-makeup)", tint: "var(--rose-soft)" },
  skin: { label: "Skincare", blurb: "Find your type + build your routine", accent: "var(--cat-skin)", tint: "var(--sage-soft)" },
  hair: { label: "Hairstyles", blurb: "Match your hair to your outfit", accent: "var(--cat-hair)", tint: "var(--terra-soft)" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late?";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function HomeTab() {
  const { setTab, saved } = useAurelia();
  const tip = useMemo(() => tipOfTheDay(), []);
  const palette: Palette = useMemo(() => palettes.find((p) => p.id === paletteOfTheDay(palettes))!, []);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="pt-6">
        <div className="relative overflow-hidden rounded-[20px] border border-line bg-[linear-gradient(135deg,var(--primary-soft)_0%,var(--surface-muted)_55%,var(--terra-soft)_130%)]">
          <div className="p-5 pb-3 relative z-10">
            <Eyebrow color="var(--rose)">Your daily edit</Eyebrow>
            <p className="font-display text-[24px] leading-[30px] text-ink mt-1.5">{greeting()}, beautiful ✦</p>
            <p className="text-[14px] leading-[21px] text-ink-2 mt-2 max-w-[60%]">
              One warm little app for colors, makeup, skin and hair — your pocket beauty editor.
            </p>
          </div>
          <HeroIllustration className="absolute -right-4 -bottom-2 w-[190px] h-[175px] pointer-events-none select-none" aria-hidden />
        </div>
      </section>

      {/* Daily tip */}
      <section className="mt-6">
        <SectionHeader eyebrow="Tip of the day" title={tip.title} accent="var(--rose)" />
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Chip color={categoryMeta[tip.category].accent}>{categoryMeta[tip.category].label}</Chip>
              <p className="text-[15px] leading-[23px] text-ink-2 mt-3">{tip.body}</p>
            </div>
            <SaveButton
              item={{
                id: `tip-${tip.id}`,
                category: tip.category,
                title: tip.title,
                subtitle: "Daily tip",
              }}
            />
          </div>
        </Card>
      </section>

      {/* Category explorer */}
      <section className="mt-8">
        <SectionHeader eyebrow="Explore" title="The four pillars" accent="var(--ink-400)" />
        <div className="grid grid-cols-2 gap-3">
          {(["colors", "makeup", "skin", "hair"] as const).map((cat) => {
            const meta = categoryMeta[cat];
            const Icon = tabIcons[cat];
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(cat as TabId)}
                className="text-left bg-surface border border-line rounded-[16px] p-4 shadow-[0_2px_8px_rgba(45,35,32,0.05)] hover:border-rose/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                aria-label={`Open ${meta.label}`}
              >
                <span className="grid place-items-center w-10 h-10 rounded-[12px]" style={{ background: meta.tint, color: meta.accent }}>
                  <Icon width={22} height={22} strokeWidth={1.9} />
                </span>
                <p className="text-[15px] font-bold text-ink mt-3 leading-tight">{meta.label}</p>
                <p className="text-[12px] leading-[16px] text-ink-3 mt-1">{meta.blurb}</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Palette of the day */}
      <section className="mt-8">
        <SectionHeader
          eyebrow="Palette of the day"
          title={palette.name}
          accent="var(--cat-colors)"
          action={
            <button onClick={() => setTab("colors")} className="text-[12px] font-semibold text-rose flex items-center gap-1 tap-target press pt-2">
              More <ArrowRightIcon width={14} height={14} />
            </button>
          }
        />
        <Card className="p-5">
          <div className="flex gap-2">
            {palette.swatches.map((s) => (
              <div key={s.name} className="flex-1 min-w-0">
                <div
                  className="w-full aspect-square rounded-[12px] border border-line-soft"
                  style={{ background: s.hex }}
                  role="img"
                  aria-label={`${s.name} ${s.hex}`}
                />
                <p className="text-[10.5px] text-ink-3 text-center mt-1.5 truncate">{s.name}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Chip soft>{palette.occasion}</Chip>
            <Chip soft>{palette.season}</Chip>
          </div>
          <p className="text-[13px] leading-[19px] text-ink-3 mt-3">{palette.outfit}</p>
        </Card>
      </section>

      {/* PWA install card */}
      {installEvent && (
        <section className="mt-8">
          <Card className="p-4 flex items-center gap-3.5 bg-[linear-gradient(135deg,var(--rose-soft),var(--surface))]">
            <span className="grid place-items-center w-11 h-11 rounded-[14px] bg-rose text-white shrink-0">
              <SparkleIcon width={22} height={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-ink">Add to your home screen</p>
              <p className="text-[12px] text-ink-3 mt-0.5">Your pocket beauty editor — works offline ✦</p>
            </div>
            <button
              onClick={async () => {
                installEvent.prompt();
                await installEvent.userChoice;
                setInstallEvent(null);
              }}
              className="press h-9 px-4 rounded-full bg-rose text-white text-[12.5px] font-bold shrink-0"
            >
              Install
            </button>
          </Card>
        </section>
      )}

      {/* Saved shortcut */}
      <section className="mt-8 mb-2">
        {saved.length > 0 ? (
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-ink">Your saved looks</p>
              <p className="text-[12.5px] text-ink-3 mt-0.5">{saved.length} little treasures in your pocket</p>
            </div>
            <span className="grid place-items-center w-10 h-10 rounded-full bg-rose-soft text-rose">
              <ArrowRightIcon width={18} height={18} />
            </span>
          </Card>
        ) : (
          <p className="text-[12.5px] text-ink-3 text-center px-6 leading-[18px]">
            Tap the heart on anything you love — it lives here, even offline.
          </p>
        )}
      </section>
    </div>
  );
}
