"use client";

/* ============================================================
   AURELIA — App shell: header + bottom tab bar
   64px nav + safe area · pill active state · blur backdrop
   ============================================================ */

import { ReactNode, useCallback, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { tabIcons, SunIcon, MoonIcon, HeartIcon, SparkleIcon, SearchIcon } from "./icons";
import { useAurelia, type TabId } from "@/lib/store";

const tabs: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "colors", label: "Colors" },
  { id: "makeup", label: "Makeup" },
  { id: "skin", label: "Skin" },
  { id: "hair", label: "Hair" },
];

export function useTheme() {
  const subscribe = useCallback((cb: () => void) => {
    const obs = new MutationObserver(cb);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  const getSnapshot = useCallback(() => document.documentElement.classList.contains("dark"), []);
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("aurelia-theme", next ? "dark" : "light");
    } catch {}
  };
  return { dark, toggle };
}

export function Shell({
  children,
  onOpenSaved,
  onOpenSearch,
  savedCount,
}: {
  children: ReactNode;
  onOpenSaved: () => void;
  onOpenSearch: () => void;
  savedCount: number;
}) {
  const { dark, toggle } = useTheme();
  const { tab, setTab } = useAurelia();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 pt-safe">
        <div
          className="backdrop-blur-[20px] backdrop-saturate-[1.8] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] border-b border-line-soft"
        >
          <div className="shell-col h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 select-none">
              <span className="grid place-items-center w-8 h-8 rounded-[10px] bg-rose text-white">
                <SparkleIcon width={17} height={17} strokeWidth={2} />
              </span>
              <span className="font-display italic text-[19px] leading-none text-ink pt-0.5">Aurelia</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Search tips, colors, looks"
                onClick={onOpenSearch}
                className="tap-target press grid place-items-center w-10 h-10 rounded-full text-ink-3 hover:text-ink hover:bg-surface-muted transition-colors"
              >
                <SearchIcon width={19} height={19} />
              </button>
              <button
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggle}
                className="tap-target press grid place-items-center w-10 h-10 rounded-full text-ink-3 hover:text-ink hover:bg-surface-muted transition-colors"
              >
                {dark ? <SunIcon width={19} height={19} /> : <MoonIcon width={19} height={19} />}
              </button>
              <button
                aria-label={`Saved items (${savedCount})`}
                onClick={onOpenSaved}
                className="tap-target press relative grid place-items-center w-10 h-10 rounded-full text-ink-3 hover:text-rose hover:bg-surface-muted transition-colors"
              >
                <HeartIcon width={19} height={19} filled={savedCount > 0} className={savedCount > 0 ? "text-rose" : ""} />
                {savedCount > 0 && (
                  <span className="absolute top-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose text-white text-[10px] font-bold grid place-items-center">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <div className="shell-col flex-1 w-full pb-[calc(80px+env(safe-area-inset-bottom))]">{children}</div>
      </main>

      {/* Bottom tab bar */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 h-safe-nav pb-safe border-t border-line backdrop-blur-[20px] backdrop-saturate-[1.8] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)]"
      >
        <div className="mx-auto w-full max-w-[480px] h-16 grid grid-cols-5">
          {tabs.map((t) => {
            const Icon = tabIcons[t.id];
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                aria-label={t.label}
                onClick={() => setTab(t.id)}
                className="tap-target press flex flex-col items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded-2xl"
              >
                <span className="relative grid place-items-center w-8 h-8">
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                      className="absolute inset-0 rounded-full bg-rose-soft dark:bg-[#3A2A2E]"
                    />
                  )}
                  <Icon
                    width={21}
                    height={21}
                    strokeWidth={active ? 2 : 1.8}
                    className={`relative z-10 transition-colors ${active ? "text-rose" : "text-ink-3"}`}
                  />
                </span>
                <span
                  className={`text-[10.5px] font-semibold leading-none transition-colors ${
                    active ? "text-rose" : "text-ink-3"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
