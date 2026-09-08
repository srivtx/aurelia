"use client";

/* ============================================================
   AURELIA — global search overlay
   One box across colors · makeup · skin · hair · tips
   Back-aware: Android back / swipe closes it.
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { search, popularSearches, type SearchHit } from "@/lib/search";
import { useAurelia, type Category } from "@/lib/store";
import { Chip, Eyebrow } from "./bits";
import { SearchIcon, tabIcons, XIcon, ArrowRightIcon } from "./icons";
import { SearchIllustration } from "./illustrations";

const catLabel: Record<Category, string> = {
  colors: "Colors",
  makeup: "Makeup",
  skin: "Skincare",
  hair: "Hair",
};

const catAccent: Record<Category, string> = {
  colors: "var(--cat-colors)",
  makeup: "var(--cat-makeup)",
  skin: "var(--cat-skin)",
  hair: "var(--cat-hair)",
};

export function SearchOverlay({ open, onClose, initialQuery }: { open: boolean; onClose: () => void; initialQuery?: string }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTab, setFocus, setStylistOpen } = useAurelia();

  /* debounce input */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  /* reset when opened — a shared-text seed (initialQuery) prefills */
  useEffect(() => {
    if (open) {
      const seed = typeof initialQuery === "string" ? initialQuery.slice(0, 80) : "";
      const t = setTimeout(() => {
        setQuery(seed);
        setDebounced(seed);
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [open, initialQuery]);

  /* back-button + escape handling */
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (open && !pushedRef.current) {
      pushedRef.current = true;
      try {
        window.history.pushState({ aureliaSearch: true }, "");
      } catch {
        /* ignore */
      }
    }
    if (!open && pushedRef.current) {
      pushedRef.current = false;
      try {
        window.history.back();
      } catch {
        /* ignore */
      }
    }
  }, [open]);
  useEffect(() => {
    const onPop = () => {
      if (pushedRef.current) {
        pushedRef.current = false;
        onCloseRef.current();
      }
    };
    window.addEventListener("popstate", onPop);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pushedRef.current) {
        pushedRef.current = false;
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const hits = useMemo(() => search(debounced), [debounced]);
  const grouped = useMemo(() => {
    const g: Record<Category, SearchHit[]> = { colors: [], makeup: [], skin: [], hair: [] };
    for (const h of hits) g[h.category].push(h);
    /* order groups by their best hit score — most relevant section first */
    const order = (Object.keys(g) as Category[]).sort((a, b) => (g[b][0]?.score ?? 0) - (g[a][0]?.score ?? 0));
    return { groups: order.filter((c) => g[c].length > 0), g };
  }, [hits]);

  const go = (hit: SearchHit) => {
    /* special: AI stylist opens the chat directly */
    if (hit.id === "ask-aurelia") {
      if (pushedRef.current) {
        pushedRef.current = false;
        onClose();
      } else onClose();
      setStylistOpen(true);
      return;
    }
    /* deep-open: tips live on home, everything else on its tab */
    setTab(hit.category === "colors" || hit.category === "makeup" || hit.category === "skin" || hit.category === "hair" ? hit.category : "home");
    setFocus({ category: hit.category, id: hit.id });
    if (pushedRef.current) {
      pushedRef.current = false;
      onClose();
    } else onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="search"
          role="dialog"
          aria-modal="true"
          aria-label="Search Aurelia"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 600) {
              if (pushedRef.current) {
                pushedRef.current = false;
                onClose();
              } else onClose();
            }
          }}
          className="fixed inset-0 z-50 mx-auto w-full max-w-[480px] bg-background flex flex-col"
        >
          {/* input row */}
          <div className="pt-safe shrink-0 border-b border-line-soft bg-surface">
            <div className="shell-col flex items-center gap-2 h-14">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-surface-muted text-ink-3 shrink-0">
                <SearchIcon width={18} height={18} />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search colors, looks, skin, hair…"
                aria-label="Search"
                enterKeyHint="search"
                className="flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder:text-ink-400 outline-none"
              />
              {query ? (
                <button
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="tap-target press grid place-items-center w-9 h-9 rounded-full text-ink-3 hover:text-ink"
                >
                  <XIcon width={16} height={16} />
                </button>
              ) : (
                <button aria-label="Close search" onClick={onClose} className="tap-target press grid place-items-center w-9 h-9 rounded-full text-ink-3 hover:text-ink">
                  <XIcon width={18} height={18} />
                </button>
              )}
            </div>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain shell-col">
            {debounced.length < 2 ? (
              <div className="py-8">
                <Eyebrow color="var(--ink-400)">Try searching for</Eyebrow>
                <div className="flex flex-wrap gap-2 mt-3">
                  {popularSearches.map((p) => (
                    <button key={p} onClick={() => setQuery(p)} className="press">
                      <Chip soft>{p}</Chip>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {(["colors", "makeup", "skin", "hair"] as const).map((c) => {
                    const Icon = tabIcons[c];
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          setTab(c);
                          onClose();
                        }}
                        className="press text-left bg-surface border border-line rounded-[16px] p-4"
                        aria-label={`Browse ${catLabel[c]}`}
                      >
                        <span
                          className="grid place-items-center w-9 h-9 rounded-[12px]"
                          style={{ color: catAccent[c], background: `color-mix(in srgb, ${catAccent[c]} 12%, transparent)` }}
                        >
                          <Icon width={20} height={20} strokeWidth={1.9} />
                        </span>
                        <p className="text-[14px] font-bold text-ink mt-2.5">Browse {catLabel[c]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : hits.length === 0 ? (
              <div className="text-center py-14">
                <SearchIllustration className="mx-auto w-36 h-32" aria-hidden />
                <p className="font-display text-[18px] text-ink mt-3">Nothing found</p>
                <p className="text-[13px] text-ink-3 mt-1.5 px-8 leading-[19px]">
                  Try a color, a product, or a mood — “camel”, “concealer”, “oily”, “braid”.
                </p>
              </div>
            ) : (
              <div className="py-6">
                <p className="text-[12px] font-semibold text-ink-3 mb-4">
                  {hits.length} {hits.length === 1 ? "result" : "results"}
                </p>
                <div className="space-y-5">
                  {grouped.groups.map((cat) => {
                    const list = grouped.g[cat];
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="grid place-items-center w-6 h-6 rounded-full" style={{ color: catAccent[cat], background: `color-mix(in srgb, ${catAccent[cat]} 14%, transparent)` }}>
                            {(() => {
                              const I = tabIcons[cat];
                              return <I width={13} height={13} />;
                            })()}
                          </span>
                          <Eyebrow color={catAccent[cat]}>{catLabel[cat]}</Eyebrow>
                        </div>
                        <div className="space-y-2">
                          {list.map((hit) => (
                            <button
                              key={hit.id}
                              onClick={() => go(hit)}
                              className="press w-full text-left bg-surface border border-line rounded-[14px] p-3.5 flex items-center gap-3 hover:border-rose/30 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-[14px] font-semibold text-ink leading-tight truncate">{hit.title}</p>
                                  <span className="text-[10px] font-bold uppercase tracking-wide shrink-0" style={{ color: catAccent[cat] }}>
                                    {hit.kind}
                                  </span>
                                </div>
                                <p className="text-[12px] leading-[16px] text-ink-3 mt-1 line-clamp-2">{hit.snippet}</p>
                              </div>
                              <ArrowRightIcon width={15} height={15} className="text-ink-3 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
