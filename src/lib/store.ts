"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TabId = "home" | "colors" | "makeup" | "skin" | "hair";
export type Category = "colors" | "makeup" | "skin" | "hair";

export interface SavedItem {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
}

interface AureliaState {
  tab: TabId;
  saved: SavedItem[];
  skinResult: { base: string; sensitiveOverlay: boolean } | null;
  setTab: (tab: TabId) => void;
  toggleSaved: (item: SavedItem) => void;
  isSaved: (id: string) => boolean;
  setSkinResult: (r: { base: string; sensitiveOverlay: boolean } | null) => void;
}

export const useAurelia = create<AureliaState>()(
  persist(
    (set, get) => ({
      tab: "home",
      saved: [],
      skinResult: null,
      setTab: (tab) => set({ tab }),
      toggleSaved: (item) =>
        set((state) => ({
          saved: state.saved.some((s) => s.id === item.id)
            ? state.saved.filter((s) => s.id !== item.id)
            : [item, ...state.saved],
        })),
      isSaved: (id) => get().saved.some((s) => s.id === id),
      setSkinResult: (r) => set({ skinResult: r }),
    }),
    {
      name: "aurelia-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ saved: state.saved, skinResult: state.skinResult }),
    }
  )
);
