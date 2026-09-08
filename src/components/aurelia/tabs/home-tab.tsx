"use client";

/* ============================================================
   AURELIA — Home tab
   Personalized greeting (hydration-safe: computed after mount)
   Daily tip · for-you · streak · palette of the day · explorer
   ============================================================ */

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tipOfTheDay, paletteOfTheDay } from "@/data/tips";
import { palettes, type Palette } from "@/data/colors";
import { looks } from "@/data/makeup";
import { skinTypes } from "@/data/skincare";
import { useAurelia, type TabId, type Category } from "@/lib/store";
import { shareCard, shareText } from "@/lib/share";
import { Card, Chip, Eyebrow, SectionHeader, SaveButton } from "./../bits";
import { HeroIllustration } from "./../illustrations";
import { tabIcons, ArrowRightIcon, SparkleIcon, ShareIcon, FlameIcon, PencilIcon, DropletIcon, MirrorIcon } from "./../icons";

const categoryMeta: Record<Category, { label: string; blurb: string; accent: string; tint: string }> = {
  colors: { label: "Color Combos", blurb: "What goes with what — the match engine", accent: "var(--cat-colors)", tint: "var(--terra-soft)" },
  makeup: { label: "Makeup", blurb: "From your first mascara to soft glam", accent: "var(--cat-makeup)", tint: "var(--rose-soft)" },
  skin: { label: "Skincare", blurb: "Find your type + build your routine", accent: "var(--cat-skin)", tint: "var(--sage-soft)" },
  hair: { label: "Hairstyles", blurb: "Match your hair to your outfit", accent: "var(--cat-hair)", tint: "var(--terra-soft)" },
};

/* vibe → makeup look suggestion */
const vibeLook: Record<string, string> = {
  soft: "no-makeup",
  classic: "fresh-campus",
  bold: "date-night",
  playful: "party-glam",
};

function greeting(h: number) {
  if (h < 5) return "Up late";
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
  const { setTab, saved, profile, streak, skinResult, showToast, setProfile, setFocus } = useAurelia();

  /* ---- hydration-safe greeting: server & first client render agree on
     "Hello"; the time-based greeting only lands AFTER mount. ---- */
  const [greet, setGreet] = useState("Hello");
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGreet(greeting(new Date().getHours())));
    return () => cancelAnimationFrame(raf);
  }, []);

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

  const effectiveSkin = skinResult?.base ?? profile?.skinType ?? null;
  const skinType = effectiveSkin ? skinTypes.find((t) => t.id === effectiveSkin) : null;
  const suggestedLook = profile?.vibe ? looks.find((l) => l.id === vibeLook[profile.vibe]) ?? looks[0] : null;

  const shareTip = async () => {
    const res = await shareText({
      title: tip.title,
      text: `${tip.title} — ${tip.body}`,
    });
    if (res === "copied") showToast("Tip copied — paste it anywhere ✦");
    else if (res === "failed") showToast("Couldn't share from here — try again ✦");
  };

  const sharePalette = async () => {
    const res = await shareCard({
      eyebrow: "Palette of the day",
      title: palette.name,
      subtitle: `${palette.mood} · ${palette.occasion}`,
      swatches: palette.swatches.map((s) => s.hex),
      text: `${palette.name} — ${palette.mood}. From Aurelia, your pocket beauty editor.`,
    });
    if (res === "copied") showToast("Palette copied ✦");
    else if (res === "failed") showToast("Couldn't share from here — try again ✦");
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="pt-6">
        <div className="hero-card relative overflow-hidden rounded-[20px] border border-line bg-[linear-gradient(135deg,var(--primary-soft)_0%,var(--surface-muted)_55%,var(--terra-soft)_130%)]">
          <div className="p-5 pb-3 relative z-10">
            <Eyebrow color="var(--rose)">Your daily edit</Eyebrow>
            <p className="font-display text-[24px] leading-[30px] text-ink mt-1.5">
              {greet}
              {profile?.name ? `, ${profile.name}` : ""}, beautiful ✦
            </p>
            <p className="text-[14px] leading-[21px] text-ink-2 mt-2 max-w-[60%]">
              One warm little app for colors, makeup, skin and hair — your pocket beauty editor.
            </p>
            {streak && streak.count >= 2 && (
              <div className="inline-flex items-center gap-1.5 mt-3.5 rounded-full bg-surface/80 backdrop-blur px-3 h-7 border border-line-soft">
                <FlameIcon width={13} height={13} className="text-rose" />
                <span className="text-[11.5px] font-bold text-ink-2">{streak.count}-day glow streak</span>
              </div>
            )}
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
            <div className="flex flex-col items-center gap-1 shrink-0">
              <SaveButton
                item={{
                  id: `tip-${tip.id}`,
                  category: tip.category,
                  title: tip.title,
                  subtitle: "Daily tip",
                }}
              />
              <button
                aria-label="Share this tip"
                onClick={shareTip}
                className="tap-target press grid place-items-center w-10 h-10 rounded-full text-ink-3 hover:text-rose transition-colors"
              >
                <ShareIcon width={19} height={19} />
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* For you */}
      {(skinType || suggestedLook) && (
        <section className="mt-8">
          <SectionHeader
            eyebrow="For you"
            title={profile?.name ? `Picked for ${profile.name}` : "Picked for you"}
            accent="var(--ink-400)"
            action={
              <button
                aria-label="Edit your profile"
                onClick={() => setProfile(null)}
                className="tap-target press grid place-items-center w-9 h-9 rounded-full text-ink-3 hover:text-ink hover:bg-surface-muted transition-colors mt-1"
              >
                <PencilIcon width={15} height={15} />
              </button>
            }
          />
          <div className="space-y-3">
            {skinType && (
              <Card onClick={() => setTab("skin")} ariaLabel="Open your skincare routine" className="p-4 flex items-center gap-3.5">
                <span className="grid place-items-center w-11 h-11 rounded-[14px] bg-sage-soft text-cat-skin shrink-0">
                  <DropletIcon width={21} height={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-ink leading-tight">{skinType.name} skin routine</p>
                  <p className="text-[12px] text-ink-3 mt-0.5">Daily checklist, heroes &amp; habits for you</p>
                </div>
                <ArrowRightIcon width={16} height={16} className="text-ink-3 shrink-0" />
              </Card>
            )}
            {suggestedLook && (
              <Card
                onClick={() => {
                  setTab("makeup");
                  setFocus({ category: "makeup", id: `look-${suggestedLook.id}` });
                }}
                ariaLabel={`Open the ${suggestedLook.name} look`}
                className="p-4 flex items-center gap-3.5"
              >
                <span className="grid place-items-center w-11 h-11 rounded-[14px] bg-rose-soft text-cat-makeup shrink-0">
                  <MirrorIcon width={21} height={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-ink leading-tight">{suggestedLook.name}</p>
                  <p className="text-[12px] text-ink-3 mt-0.5">Your vibe match · {suggestedLook.minutes} min · step by step</p>
                </div>
                <ArrowRightIcon width={16} height={16} className="text-ink-3 shrink-0" />
              </Card>
            )}
          </div>
        </section>
      )}

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
            <div className="flex items-center gap-1">
              <button
                aria-label="Share this palette"
                onClick={sharePalette}
                className="tap-target press grid place-items-center w-9 h-9 rounded-full text-ink-3 hover:text-rose transition-colors mt-1"
              >
                <ShareIcon width={16} height={16} />
              </button>
              <button onClick={() => setTab("colors")} className="text-[12px] font-semibold text-rose flex items-center gap-1 tap-target press pt-2">
                More <ArrowRightIcon width={14} height={14} />
              </button>
            </div>
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
