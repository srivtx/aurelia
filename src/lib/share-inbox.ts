"use client";

/* ============================================================
   AURELIA — share-inbox (Web Share Target handoff)
   Android's share sheet (installed PWA) POSTs the shared file
   to /share-target; the service worker stashes it in Cache
   Storage at /share-inbox/last and notifies clients. This
   module is the client-side pickup: a pending flag in
   sessionStorage (set when a share actually arrived) gates the
   fetch, so normal app use never issues spurious requests.
   Text shares become a prefilled global search.
   ============================================================ */

const PENDING_KEY = "aurelia-share-pending";
const EVENT_OPEN_SEARCH = "aurelia:open-search";

/* direct handoff (desktop File Handling API hands us the File itself) */
let directImage: File | null = null;

export function stashDirectImage(file: File): void {
  directImage = file;
  markSharePending();
}

export function markSharePending(): void {
  try {
    sessionStorage.setItem(PENDING_KEY, "1");
  } catch {
    /* storage blocked — the SW redirect query still works */
  }
}

export function consumeSharePending(): boolean {
  try {
    if (sessionStorage.getItem(PENDING_KEY) !== "1") return false;
    sessionStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

/* fetch the stashed image — direct handoff first, then the SW cache */
export async function pullSharedImage(): Promise<File | null> {
  if (directImage) {
    const f = directImage;
    directImage = null;
    return f;
  }
  try {
    const res = await fetch("/share-inbox/last", { cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size || !blob.type.startsWith("image/")) return null;
    const name = decodeURIComponent(res.headers.get("x-filename") ?? "shared-photo");
    return new File([blob], name, { type: blob.type });
  } catch {
    return null;
  }
}

/* ask the app shell to open global search prefilled with shared text */
export function openSearchWithQuery(query: string): void {
  window.dispatchEvent(new CustomEvent(EVENT_OPEN_SEARCH, { detail: { query } }));
}
