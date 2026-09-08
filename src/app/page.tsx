"use client";

/* ============================================================
   AURELIA — main app
   Hydration-safe store (rehydrate after mount) · hash routing
   (deep-linkable tabs + back button) · global search · onboarding
   · toast + service-worker update flow · lazy-loaded tabs
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/aurelia/shell";
import { useAurelia, rehydrateStore, type TabId, type Category } from "@/lib/store";
import { BottomSheet, type SheetData } from "@/components/aurelia/sheet";
import { HomeTab } from "@/components/aurelia/tabs/home-tab";
import { SearchOverlay } from "@/components/aurelia/search-sheet";
import { Onboarding } from "@/components/aurelia/onboarding";
import { Card, Chip, SaveButton } from "@/components/aurelia/bits";
import { EmptySavedIllustration, SparkleRing } from "@/components/aurelia/illustrations";
import { tabIcons, SparkleIcon, RefreshIcon } from "@/components/aurelia/icons";

/* Lazy-load the four heavy tabs — smaller first paint */
const ColorsTab = dynamic(() => import("@/components/aurelia/tabs/colors-tab").then((m) => m.ColorsTab), {
  loading: () => <TabSkeleton />,
  ssr: true,
});
const MakeupTab = dynamic(() => import("@/components/aurelia/tabs/makeup-tab").then((m) => m.MakeupTab), {
  loading: () => <TabSkeleton />,
  ssr: true,
});
const SkinTab = dynamic(() => import("@/components/aurelia/tabs/skin-tab").then((m) => m.SkinTab), {
  loading: () => <TabSkeleton />,
  ssr: true,
});
const HairTab = dynamic(() => import("@/components/aurelia/tabs/hair-tab").then((m) => m.HairTab), {
  loading: () => <TabSkeleton />,
  ssr: true,
});

function TabSkeleton() {
  return (
    <div className="pt-6 space-y-4" aria-hidden>
      <div className="skeleton h-8 w-2/3 rounded-[10px]" />
      <div className="skeleton h-4 w-1/2 rounded-[8px]" />
      <div className="grid grid-cols-4 gap-3 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-full" />
        ))}
      </div>
      <div className="skeleton h-20 rounded-[16px] mt-4" />
      <div className="skeleton h-20 rounded-[16px]" />
    </div>
  );
}

const TAB_IDS: TabId[] = ["home", "colors", "makeup", "skin", "hair"];

const catMeta: Record<Category, { label: string; accent: string }> = {
  colors: { label: "Colors", accent: "var(--cat-colors)" },
  makeup: { label: "Makeup", accent: "var(--cat-makeup)" },
  skin: { label: "Skincare", accent: "var(--cat-skin)" },
  hair: { label: "Hair", accent: "var(--cat-hair)" },
};

/* ---------- Saved collection sheet ---------- */

function SavedSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            const I = tabIcons[item.category];
            return (
              <div key={item.id} className="bg-surface-muted rounded-[14px] p-3.5 flex items-center gap-3">
                <span
                  className="grid place-items-center w-9 h-9 rounded-[12px] shrink-0"
                  style={{ background: `color-mix(in srgb, ${meta.accent} 14%, transparent)`, color: meta.accent }}
                >
                  {I ? <I width={18} height={18} /> : null}
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

/* ---------- Toast (copy confirmations + update prompt) ---------- */

function Toast() {
  const { toast, hideToast } = useAurelia();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          role="status"
          aria-live="polite"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[55] mx-auto w-max max-w-[92vw]"
        >
          <button
            onClick={() => {
              toast.action?.();
              hideToast();
            }}
            style={{ background: "var(--ink-900)", color: "var(--bg)" }}
            className="press flex items-center gap-2.5 rounded-full pl-3.5 pr-4 h-11 shadow-[0_8px_28px_rgba(45,35,32,0.35)]"
          >
            {toast.actionLabel ? <SparkleRing width={20} height={20} className="text-gold shrink-0" /> : <SparkleIcon width={16} height={16} />}
            <span className="text-[13.5px] font-semibold whitespace-nowrap">{toast.msg}</span>
            {toast.actionLabel && (
              <span className="text-[12.5px] font-bold underline underline-offset-2 flex items-center gap-1 shrink-0">
                <RefreshIcon width={13} height={13} />
                {toast.actionLabel}
              </span>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- App ---------- */

function AureliaApp() {
  const { tab, profile, saved } = useAurelia();
  const [savedOpen, setSavedOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* ---- 1. Hydration-safe boot: rehydrate persisted state AFTER mount,
     then streak touch + onboarding decision. ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await rehydrateStore();
      if (cancelled) return;
      useAurelia.getState().touchStreak();
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- 2. Hash routing: deep-linkable tabs + working back button ---- */
  const fromHash = (): TabId => {
    const h = window.location.hash.replace(/^#\/?/, "").split("?")[0] as TabId;
    return TAB_IDS.includes(h) ? h : "home";
  };

  const popGuard = useRef(false);
  const prevTab = useRef<TabId | null>(null);

  useEffect(() => {
    const applyHash = () => {
      const t = fromHash();
      popGuard.current = true;
      useAurelia.getState().setTab(t);
      // reset guard if the tab didn't actually change (no render will consume it)
      requestAnimationFrame(() => {
        popGuard.current = false;
      });
    };
    applyHash(); // initial deep link (#/skin etc.)
    window.addEventListener("popstate", applyHash);
    return () => window.removeEventListener("popstate", applyHash);
  }, []);

  useEffect(() => {
    if (prevTab.current === null) {
      prevTab.current = tab;
      return;
    }
    if (prevTab.current !== tab) {
      prevTab.current = tab;
      if (popGuard.current) {
        popGuard.current = false;
      } else {
        window.history.pushState({ tab }, "", `#/${tab}`);
      }
    }
  }, [tab]);

  /* ---- 3. Service worker + update flow ---- */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let waitingWorker: ServiceWorker | null = null;
    const onControllerChange = () => window.location.reload();
    let reloaded = false;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        /* an update was already waiting when we loaded */
        if (reg.waiting && navigator.serviceWorker.controller) {
          waitingWorker = reg.waiting;
          offerUpdate();
        }
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorker = installing;
              offerUpdate();
            }
          });
        });
        /* check for updates when the app comes back to the foreground */
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") reg.update().catch(() => {});
        });
      })
      .catch(() => {});

    function offerUpdate() {
      if (reloaded || !waitingWorker) return;
      useAurelia.getState().showToast("A fresh new Aurelia is ready", "Update", () => {
        reloaded = true;
        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, { once: true });
        waitingWorker?.postMessage({ type: "SKIP_WAITING" });
        /* safety net: if controllerchange never fires, reload anyway */
        setTimeout(() => window.location.reload(), 4000);
      });
    }
  }, []);

  return (
    <>
      <Shell onOpenSaved={() => setSavedOpen(true)} onOpenSearch={() => setSearchOpen(true)} savedCount={saved.length}>
        {tab === "home" && <HomeTab />}
        {tab === "colors" && <ColorsTab />}
        {tab === "makeup" && <MakeupTab />}
        {tab === "skin" && <SkinTab />}
        {tab === "hair" && <HairTab />}
        <SavedSheet open={savedOpen} onClose={() => setSavedOpen(false)} />
      </Shell>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* First-run onboarding — only decided after hydration, never during SSR.
         Onboarding sets the profile itself; profile != null removes it. */}
      <AnimatePresence>{hydrated && !profile && <Onboarding key="onboarding" />}</AnimatePresence>

      <Toast />
    </>
  );
}

export default function Page() {
  return <AureliaApp />;
}
