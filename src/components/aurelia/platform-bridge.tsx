"use client";

/* ============================================================
   AURELIA — Platform bridge (client, mounted once)
   One quiet home for the platform integrations:
   1. WebMCP tool registration — makes Aurelia's color-science /
      season / routine / conflict / search engines callable by
      the user's AI agent (ChatGPT Desktop site tools, Chrome &
      Edge origin trials). Silent no-op elsewhere.
   2. Storage persistence — protects the zero-party profile
      (season, routine, saved looks) against iOS ITP eviction.
   3. Badging — the glow streak count as a home-screen badge
      (iOS 16.4+ installed, desktop Chromium).
   4. Share-target handoff — Android share sheet → SW stashed
      the photo; we route to the Color Lab / search.
   ============================================================ */

import { useEffect } from "react";
import { useAurelia } from "@/lib/store";
import { registerAureliaTools, unregisterAureliaTools } from "@/lib/webmcp";
import { markSharePending, openSearchWithQuery, stashDirectImage } from "@/lib/share-inbox";

export function PlatformBridge() {
  const { streak } = useAurelia();

  /* 1 — WebMCP: register after mount, unregister on unload */
  useEffect(() => {
    registerAureliaTools();
    return () => unregisterAureliaTools();
  }, []);

  /* 2 — storage persistence (best-effort, silent) */
  useEffect(() => {
    try {
      void navigator.storage?.persist?.()?.catch?.(() => {});
    } catch {
      /* not supported — fine */
    }
  }, []);

  /* 3 — badge mirrors the glow streak */
  useEffect(() => {
    const n = streak?.count ?? 0;
    const nav = navigator as Navigator & { setAppBadge?: (c?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    try {
      if (n >= 2) void nav.setAppBadge?.(n)?.catch?.(() => {});
      else void nav.clearAppBadge?.()?.catch?.(() => {});
    } catch {
      /* badge unsupported */
    }
  }, [streak?.count]);

  /* 4 — share-target: listen for the SW handoff + cold-start ?shared=1 */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string; name?: string; mime?: string; text?: string; title?: string } | null;
      if (!data?.type) return;
      if (data.type === "shared-image") {
        markSharePending();
        useAurelia.getState().setTab("colors");
        useAurelia.getState().setFocus({ category: "colors", id: "lab-photo" });
      } else if (data.type === "shared-text") {
        const q = [data.title, data.text].filter(Boolean).join(" ").trim();
        if (q) openSearchWithQuery(q.slice(0, 80));
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onMessage);
    }

    /* cold start: the SW redirected here with ?shared=1 (or ?q=) */
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("shared")) {
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
        markSharePending();
        useAurelia.getState().setTab("colors");
        useAurelia.getState().setFocus({ category: "colors", id: "lab-photo" });
      } else if (params.has("q")) {
        const q = (params.get("q") ?? "").slice(0, 80);
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
        if (q) openSearchWithQuery(q);
      }
    } catch {
      /* noop */
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onMessage);
      }
    };
  }, []);

  /* 5 — File Handling API (desktop Chromium): "Open with Aurelia"
     hands us the File directly via launchQueue */
  useEffect(() => {
    const lq = (window as Window & { launchQueue?: { setConsumer?: (cb: (params: { files?: { getFile: () => Promise<File> }[] }) => void) => void } }).launchQueue;
    if (!lq?.setConsumer) return;
    try {
      lq.setConsumer(async (params) => {
        const [handle] = params.files ?? [];
        if (!handle) return;
        const file = await handle.getFile();
        if (!file.type.startsWith("image/")) return;
        stashDirectImage(file);
        useAurelia.getState().setTab("colors");
        useAurelia.getState().setFocus({ category: "colors", id: "lab-photo" });
      });
    } catch {
      /* launchQueue unsupported/changed — no-op */
    }
  }, []);

  return null;
}
