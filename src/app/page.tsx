"use client";

/* ============================================================
   AURELIA — main app
   Tab router · saved sheet · PWA registration
   ============================================================ */

import { useEffect, useState } from "react";
import { Shell } from "@/components/aurelia/shell";
import { useAurelia, type Category } from "@/lib/store";
import { BottomSheet, type SheetData } from "@/components/aurelia/sheet";
import { HomeTab } from "@/components/aurelia/tabs/home-tab";
import { ColorsTab } from "@/components/aurelia/tabs/colors-tab";
import { MakeupTab } from "@/components/aurelia/tabs/makeup-tab";
import { SkinTab } from "@/components/aurelia/tabs/skin-tab";
import { HairTab } from "@/components/aurelia/tabs/hair-tab";
import { Card, Chip, Eyebrow, SaveButton } from "@/components/aurelia/bits";
import { EmptySavedIllustration } from "@/components/aurelia/illustrations";
import { tabIcons, SparkleIcon } from "@/components/aurelia/icons";

const catMeta: Record<Category, { label: string; accent: string }> = {
  colors: { label: "Colors", accent: "var(--cat-colors)" },
  makeup: { label: "Makeup", accent: "var(--cat-makeup)" },
  skin: { label: "Skincare", accent: "var(--cat-skin)" },
  hair: { label: "Hair", accent: "var(--cat-hair)" },
};

function SavedSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { saved, setTab } = useAurelia();

  const data: SheetData | null = open
    ? {
        id: "saved-collection",
        category: "colors",
        eyebrow: "Your collection",
        title: "Saved looks",
        subtitle: `${saved.length} saved`,
        accent: "var(--rose)",
      }
    : null;

  return (
    <BottomSheet data={data} onClose={onClose}>
      {saved.length === 0 ? (
        <div className="text-center py-6">
          <EmptySavedIllustration className="mx-auto w-32 h-32" aria-hidden />
          <p className="font-display text-[18px] text-ink mt-2">Nothing saved yet</p>
          <p className="text-[13px] text-ink-3 mt-1.5 px-6 leading-[19px]">
            Tap the heart on any tip, palette, look or style — it waits for you here, even offline.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {saved.map((item) => {
            const meta = catMeta[item.category];
            return (
              <div
                key={item.id}
                className="bg-surface-muted rounded-[14px] p-3.5 flex items-center gap-3"
              >
                <span className="grid place-items-center w-9 h-9 rounded-[12px] shrink-0" style={{ background: `color-mix(in srgb, ${meta.accent} 14%, transparent)`, color: meta.accent }}>
                  {tabIcons[item.category] ? <>{(() => { const I = tabIcons[item.category]; return <I width={18} height={18} />; })()}</> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-ink leading-tight truncate">{item.title}</p>
                  <p className="text-[12px] text-ink-3 mt-0.5 truncate">{item.subtitle}</p>
                </div>
                <Chip color={meta.accent}>{meta.label}</Chip>
                <SaveButton item={item} size={36} />
              </div>
            );
          })}
          <button
            onClick={() => {
              const first = saved[0];
              setTab(first.category);
              onClose();
            }}
            className="tap-target w-full h-11 rounded-full border border-line text-[13px] font-semibold text-ink-2 press mt-2"
          >
            Continue exploring
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function AureliaApp() {
  const { tab, saved } = useAurelia();
  const [savedOpen, setSavedOpen] = useState(false);

  /* register service worker */
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <Shell onOpenSaved={() => setSavedOpen(true)} savedCount={saved.length}>
      {tab === "home" && <HomeTab />}
      {tab === "colors" && <ColorsTab />}
      {tab === "makeup" && <MakeupTab />}
      {tab === "skin" && <SkinTab />}
      {tab === "hair" && <HairTab />}
      <SavedSheet open={savedOpen} onClose={() => setSavedOpen(false)} />
    </Shell>
  );
}

export default function Page() {
  return <AureliaApp />;
}
