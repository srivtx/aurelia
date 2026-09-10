"use client";

/* ============================================================
   AURELIA — global store (zustand + persist)
   Hydration-safe: skipHydration + manual rehydrate AFTER mount,
   so the first client render always matches the server HTML.
   ============================================================ */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SkinSignature } from "@/lib/skin-signature";
import type { JournalEntry } from "@/lib/skin-journal";
import type { CurlPatternId } from "@/lib/curl-classifier";
import type { ScanResult } from "@/lib/label-scan";
import type { ShelfItem, ShelfItemInput } from "@/lib/shelf";
import { buildShelfItem, SHELF_MAX_ITEMS } from "@/lib/shelf";
import { actives } from "@/data/actives";

export type TabId = "home" | "colors" | "makeup" | "skin" | "hair";
export type Category = "colors" | "makeup" | "skin" | "hair";

export interface SavedItem {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
}

export interface Profile {
  name: string;
  skinType: string | null; // quick pick from onboarding (not the full quiz)
  vibe: string | null; // "soft" | "classic" | "bold" | "playful"
}

export interface StreakState {
  count: number;
  lastVisit: string; // local YYYY-MM-DD
}

export interface RoutineChecks {
  date: string; // local YYYY-MM-DD — resets daily
  am: number[]; // completed step indexes
  pm: number[];
}

export interface SeasonResult {
  id: string; // season id, e.g. "true-autumn"
  taken: string; // local YYYY-MM-DD
}

/* persisted skin measurement — shape mirrors lib/skin-signature.SkinSignature */
export type SkinSignatureState = SkinSignature;

/* Skin Journal — closed-loop measurement history (lib/skin-journal.JournalEntry) */
export type JournalEntryState = JournalEntry;
export const JOURNAL_MAX_ENTRIES = 40;

/* Texture Lab — measured curl pattern (lib/curl-classifier.CurlClassification) */
export interface CurlResultState {
  pattern: CurlPatternId;
  family: "straight" | "wavy" | "curly" | "coily";
  curlIndex: number;
  confidence: number;
  date: string; // local YYYY-MM-DD
}

/* Label Scanner — the actives HER routine actually uses (ids from data/actives) */
export type MyActivesState = string[];
/* Label Scanner — last scan verdict (lib/label-scan.ScanResult, minus raw text bloat) */
export type ScanResultState = ScanResult;
/* Mirror Test V4 — her product shelf (lib/shelf.ShelfItem) */
export type ShelfItemState = ShelfItem;
export const SHELF_MAX = SHELF_MAX_ITEMS;

export interface FocusTarget {
  category: Category;
  id: string; // deep-open target, e.g. "color-navy", "look-party"
}

interface AureliaState {
  tab: TabId;
  saved: SavedItem[];
  skinResult: { base: string; sensitiveOverlay: boolean } | null;
  seasonResult: SeasonResult | null;
  skinSignature: SkinSignatureState | null;
  journal: JournalEntryState[];
  curlResult: CurlResultState | null;
  myActives: MyActivesState;
  scanResult: ScanResultState | null;
  shelf: ShelfItemState[];
  profile: Profile | null;
  streak: StreakState | null;
  routine: RoutineChecks;
  focus: FocusTarget | null;
  toast: { msg: string; actionLabel?: string; action?: () => void } | null;
  setTab: (tab: TabId) => void;
  toggleSaved: (item: SavedItem) => void;
  isSaved: (id: string) => boolean;
  setSkinResult: (r: { base: string; sensitiveOverlay: boolean } | null) => void;
  setSeasonResult: (r: SeasonResult | null) => void;
  setSkinSignature: (s: SkinSignatureState | null) => void;
  addJournalEntry: (e: JournalEntryState) => void;
  clearJournal: () => void;
  setCurlResult: (c: CurlResultState | null) => void;
  setMyActives: (ids: string[]) => void;
  setScanResult: (r: ScanResultState | null) => void;
  addShelfItem: (input: ShelfItemInput) => ShelfItemState | null;
  removeShelfItem: (id: string) => void;
  markShelfOpened: (id: string, date: string) => void;
  clearShelf: () => void;
  setProfile: (p: Profile | null) => void;
  touchStreak: () => void;
  toggleRoutine: (slot: "am" | "pm", step: number) => void;
  setFocus: (f: FocusTarget | null) => void;
  showToast: (msg: string, actionLabel?: string, action?: () => void) => void;
  hideToast: () => void;
  stylistOpen: boolean;
  setStylistOpen: (b: boolean) => void;
}

/* local YYYY-MM-DD (never called during render — actions/effects only) */
function localDay(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* persisted routine ids must be real actives — guards against junk in storage */
const activeIdOk = (id: string) => actives.some((a) => a.id === id);

/* persisted shelf entries must be well-formed — legacy junk is filtered on rehydrate */
const shelfItemOk = (x: unknown): x is ShelfItem =>
  typeof x === "object" && x !== null &&
  typeof (x as ShelfItem).id === "string" &&
  typeof (x as ShelfItem).name === "string" &&
  typeof (x as ShelfItem).category === "string" &&
  typeof (x as ShelfItem).addedOn === "string";

const isValidDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

/* exported for read-only comparisons in components (safe: same value on any
   same-day render; only differs across midnight, which is a benign re-render) */
export const todayKey = () => localDay();

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useAurelia = create<AureliaState>()(
  persist(
    (set, get) => ({
      tab: "home",
      saved: [],
      skinResult: null,
      seasonResult: null,
      skinSignature: null,
      journal: [],
      curlResult: null,
      myActives: [],
      scanResult: null,
      shelf: [],
      profile: null,
      streak: null,
      routine: { date: "", am: [], pm: [] },
      focus: null,
      toast: null,
      stylistOpen: false,
      setTab: (tab) => set({ tab }),
      toggleSaved: (item) =>
        set((state) => ({
          saved: state.saved.some((s) => s.id === item.id)
            ? state.saved.filter((s) => s.id !== item.id)
            : [item, ...state.saved],
        })),
      isSaved: (id) => get().saved.some((s) => s.id === id),
      setSkinResult: (r) => set({ skinResult: r }),
      setSeasonResult: (r) => set({ seasonResult: r }),
      setSkinSignature: (s) => set({ skinSignature: s }),
      addJournalEntry: (e) =>
        set((state) => {
          /* replace same-date re-measurement, keep chronological, cap history */
          const next = [e, ...state.journal.filter((x) => x.date !== e.date)].sort((a, b) =>
            a.date > b.date ? -1 : a.date < b.date ? 1 : 0,
          );
          return { journal: next.slice(0, JOURNAL_MAX_ENTRIES) };
        }),
      clearJournal: () => set({ journal: [] }),
      setCurlResult: (c) => set({ curlResult: c }),
      setMyActives: (ids) => set({ myActives: ids.filter((id) => activeIdOk(id)) }),
      setScanResult: (r) => set({ scanResult: r }),
      addShelfItem: (input) => {
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const item = buildShelfItem(input, id, localDay());
        if (!item) return null;
        const state = get();
        /* replace on exact same name+category (re-saving a scan), else prepend, cap */
        const dupeIdx = state.shelf.findIndex(
          (x) => x.name === item.name && x.category === item.category,
        );
        const next =
          dupeIdx >= 0
            ? state.shelf.map((x) => (x.id === state.shelf[dupeIdx].id ? item : x))
            : [item, ...state.shelf].slice(0, SHELF_MAX_ITEMS);
        set({ shelf: next });
        return item;
      },
      removeShelfItem: (id) => set((s) => ({ shelf: s.shelf.filter((x) => x.id !== id) })),
      markShelfOpened: (id, date) =>
        set((s) => ({
          shelf: s.shelf.map((x) =>
            x.id === id
              ? { ...x, openedOn: x.openedOn ?? (isValidDay(date) ? date : localDay()) }
              : x,
          ),
        })),
      clearShelf: () => set({ shelf: [] }),
      setProfile: (p) => set({ profile: p }),
      touchStreak: () => {
        const today = localDay();
        const s = get().streak;
        if (s && s.lastVisit === today) return;
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const count = s && s.lastVisit === localDay(y) ? s.count + 1 : 1;
        set({ streak: { count, lastVisit: today } });
      },
      toggleRoutine: (slot, step) => {
        const today = localDay();
        const r = get().routine;
        const base = r.date === today ? r : { date: today, am: [], pm: [] };
        const list = base[slot];
        set({
          routine: {
            ...base,
            [slot]: list.includes(step) ? list.filter((i) => i !== step) : [...list, step],
          },
        });
      },
      setFocus: (f) => set({ focus: f }),
      setStylistOpen: (b) => set({ stylistOpen: b }),
      showToast: (msg, actionLabel, action) => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: { msg, actionLabel, action } });
        toastTimer = setTimeout(() => set({ toast: null }), 4200);
      },
      hideToast: () => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: null });
      },
    }),
    {
      name: "aurelia-store",
      storage: createJSONStorage(() => localStorage),
      /* Never auto-rehydrate: the first client render must match SSR HTML. */
      skipHydration: true,
      partialize: (state) => ({
        saved: state.saved,
        skinResult: state.skinResult,
        seasonResult: state.seasonResult,
        skinSignature: state.skinSignature,
        journal: state.journal,
        curlResult: state.curlResult,
        myActives: state.myActives,
        scanResult: state.scanResult,
        shelf: state.shelf,
        profile: state.profile,
        streak: state.streak,
        routine: state.routine,
      }),
      /* sanitize the shelf on rehydrate — legacy/junk entries are dropped
         (default merge is kept for every other key) */
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AureliaState>;
        return {
          ...current,
          ...p,
          shelf: Array.isArray(p.shelf) ? p.shelf.filter(shelfItemOk).slice(0, SHELF_MAX_ITEMS) : [],
        };
      },
    }
  )
);

/* Convenience: hydrate the persisted state once, after mount. */
export async function rehydrateStore(): Promise<void> {
  try {
    await useAurelia.persist.rehydrate();
  } catch {
    /* first run / storage blocked — defaults are fine */
  }
}
