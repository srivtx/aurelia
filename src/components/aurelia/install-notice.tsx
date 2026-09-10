"use client";

/* ============================================================
   AURELIA — Install notice (phone only, quiet, dismissible)
   Android/Chromium: captures the native beforeinstallprompt
   event (Chrome drops it silently otherwise) and re-offers it
   as a one-tap "Install" chip. iOS Safari never fires that
   event — shows the Share → Add to Home Screen hint instead.
   Hidden inside standalone (already installed) and after a
   dismissal (30 days), desktop never sees it.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { XIcon } from "./icons";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "aurelia-install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)")?.matches ?? nav.standalone ?? false;
}

function isPhone(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua);
  const android = /Android/.test(ua);
  return ios || android || (window.matchMedia?.("(max-width: 640px)")?.matches ?? false);
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export function canShowInstallNotice(): boolean {
  try {
    if (isStandalone()) return false;
    if (!isPhone()) return false;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 30 * 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function InstallNotice() {
  const [ready, setReady] = useState(false);
  const [deferred, setDeferred] = useState<InstallPrompt | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const onInstalled = () => setHidden(true);
    window.addEventListener("appinstalled", onInstalled);
    setReady(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* Evaluate after hydration rules: display-mode/UA checks only in effects */
  useEffect(() => {
    if (!ready) return;
    if (!canShowInstallNotice()) {
      setHidden(true);
      return;
    }
    if (isIOS()) setIosHint(true);
    timerRef.current = setTimeout(() => setHidden(!canShowInstallNotice()), 1800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  const install = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        await deferred.userChoice.catch(() => null);
      } catch {
        /* prompt failed — leave the chip */
      } finally {
        setDeferred(null);
      }
    }
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-[calc(var(--h-safe-nav,64px)+env(safe-area-inset-bottom,0px)+10px)] z-40 mx-auto max-w-sm"
      role="region"
      aria-label="Install Aurelia"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-[var(--bg)] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <span className="size-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
        {deferred ? (
          <>
            <p className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--ink-900)]">
              Install Aurelia — full screen, offline, and on your home screen.
            </p>
            <button
              type="button"
              onClick={install}
              className="shrink-0 rounded-full bg-[var(--primary)] px-4 py-1.5 text-[13px] font-semibold text-[var(--rose-foreground)]"
            >
              Install
            </button>
          </>
        ) : iosHint ? (
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--ink-900)]">
            Add Aurelia to your Home Screen: tap the{" "}
            <span className="font-semibold">Share</span> button, then{" "}
            <span className="font-semibold">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--ink-900)]">
            Install Aurelia — full screen, offline, and on your home screen.
          </p>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install notice"
          className="shrink-0 rounded-full p-1 text-[var(--ink-400)] transition-colors hover:text-[var(--ink-900)]"
        >
          <XIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
