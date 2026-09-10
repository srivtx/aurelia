/* ============================================================
   AURELIA — Shelf engine (Mirror Test V4)
   ------------------------------------------------------------
   Every scanned product joins her Shelf: an offline, exported
   inventory with the two verdicts nobody else ships:
     · PAO countdown (the >90% PAO-overrun problem, Wang 2025)
     · duplicate detection — swatch ΔE2000 < 5 within the same
       category + same active slot ("you already own a
       near-identical berry")
     · cost-per-use as the bonus honesty layer
   Pure + deterministic (today is always a parameter) →
   SSR/hydration safe, bun-testable. No DOM, no deps.
   ============================================================ */

import { hexDeltaE } from "./color-science";
import { paoById, PAO_DISCLAIMER } from "@/data/pao";

/* ---------- types ---------- */

export interface ShelfItem {
  id: string;
  name: string;
  category: string; // PaoCategory id (src/data/pao.ts)
  addedOn: string; // local YYYY-MM-DD
  openedOn: string | null; // PAO countdown starts here
  price: number | null; // as-entered, any currency
  usesPerWeek: number | null; // for cost-per-use
  swatchHex: string | null; // for duplicate detection
  activeId: string | null; // primary active id (from a scan), same-slot check
  scanned: boolean; // arrived via the Label Scanner
}

export type PaoState = "unopened" | "fresh" | "expiring-soon" | "expired";

export interface PaoStatus {
  months: number;
  opened: boolean;
  openedOn: string | null;
  expiresOn: string | null; // YYYY-MM-DD
  daysLeft: number | null; // negative once expired
  pct: number | null; // 0–100 of the PAO window remaining
  state: PaoState;
  label: string; // "5 months left" / "expired 3 weeks ago" / "sealed — clock starts when you open it"
}

export interface ShelfDuplicate {
  aId: string;
  bId: string;
  aName: string;
  bName: string;
  category: string;
  basis: "shade" | "active"; // near-identical color | same active slot
  dE: number | null;
  message: string;
}

export interface ShelfSummary {
  total: number;
  open: number;
  expired: number;
  expiringSoon: number;
  duplicates: number;
  headline: string;
  shareText: string;
  disclaimer: string;
}

/* ---------- date helpers (all UTC-safe on YYYY-MM-DD strings) ---------- */

function parseDay(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  /* reject 2026-02-31-style junk */
  return d.getUTCMonth() === Number(m[2]) - 1 ? t : null;
}

/** months added in calendar terms (Jan 31 + 1M = Feb 28/29) */
function addMonths(iso: string, months: number): string | null {
  const t = parseDay(iso);
  if (t === null) return null;
  const d = new Date(t);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

const DAY_MS = 86_400_000;

/* ---------- PAO countdown ---------- */

/**
 * The PAO verdict for one item. `todayISO` is always a parameter —
 * pure, deterministic, testable with frozen dates.
 */
export function paoStatus(item: ShelfItem, todayISO: string): PaoStatus {
  const cat = paoById(item.category);
  const today = parseDay(todayISO);
  if (!item.openedOn || today === null) {
    return {
      months: cat.paoMonths,
      opened: false,
      openedOn: item.openedOn ?? null,
      expiresOn: null,
      daysLeft: null,
      pct: null,
      state: "unopened",
      label: `Sealed — ${cat.paoMonths}M clock starts when you open it`,
    };
  }
  const opened = parseDay(item.openedOn);
  const expires = addMonths(item.openedOn, cat.paoMonths);
  if (opened === null || expires === null) {
    return {
      months: cat.paoMonths,
      opened: true,
      openedOn: item.openedOn,
      expiresOn: null,
      daysLeft: null,
      pct: null,
      state: "unopened",
      label: `Opened — date unreadable, assume ${cat.paoMonths}M from opening`,
    };
  }
  const daysLeft = Math.round((parseDay(expires)! - today) / DAY_MS);
  const total = Math.max(1, Math.round((parseDay(expires)! - opened) / DAY_MS));
  const pct = Math.max(0, Math.min(100, Math.round((daysLeft / total) * 100)));
  const state: PaoState = daysLeft < 0 ? "expired" : daysLeft <= 30 ? "expiring-soon" : "fresh";
  const label =
    daysLeft < 0
      ? `Past PAO — ${ago(daysLeft)} ago`
      : daysLeft === 0
        ? "Hits its PAO today"
        : daysLeft <= 45
          ? `${Math.round(daysLeft / 7)} week${Math.round(daysLeft / 7) === 1 ? "" : "s"} left`
          : `${Math.round(daysLeft / 30)} month${Math.round(daysLeft / 30) === 1 ? "" : "s"} left`;
  return { months: cat.paoMonths, opened: true, openedOn: item.openedOn, expiresOn: expires, daysLeft, pct, state, label };
}

function ago(daysLeft: number): string {
  const days = -daysLeft;
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

/* ---------- duplicate detection ---------- */

/**
 * Pairwise scan for near-duplicates:
 *  · shade twins — same category, both swatched, ΔE2000 < 5
 *    (the "near-identical berry" case)
 *  · active twins — same category, same non-null activeId
 *    (two products doing the same job)
 * First matching basis wins per pair; deterministic order.
 */
export function findDuplicates(items: ShelfItem[]): ShelfDuplicate[] {
  const out: ShelfDuplicate[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (a.category !== b.category) continue;

      /* shade twin */
      if (a.swatchHex && b.swatchHex) {
        const dE = hexDeltaE(a.swatchHex, b.swatchHex);
        if (dE < 5) {
          out.push({
            aId: a.id,
            bId: b.id,
            aName: a.name,
            bName: b.name,
            category: a.category,
            basis: "shade",
            dE: Math.round(dE * 10) / 10,
            message: `${a.name} and ${b.name} are near-identical in color (ΔE ${Math.round(dE * 10) / 10} — under 5 is a visual twin). Same job, same finish: one of them can retire.`,
          });
          continue;
        }
      }

      /* active twin (only when the shade test didn't fire) */
      if (a.activeId && a.activeId === b.activeId) {
        out.push({
          aId: a.id,
          bId: b.id,
          aName: a.name,
          bName: b.name,
          category: a.category,
          basis: "active",
          dE: null,
          message: `${a.name} and ${b.name} both do the ${a.activeId} job in the same category — duplicates before you buy a third.`,
        });
      }
    }
  }
  return out;
}

/* ---------- cost per use ---------- */

/**
 * price ÷ (uses/week × PAO weeks). Honest math: assumes she
 * finishes the product inside its PAO window. Null when the
 * inputs aren't there.
 */
export function costPerUse(item: ShelfItem): { perUse: number; totalUses: number } | null {
  if (item.price === null || item.price <= 0 || !item.usesPerWeek || item.usesPerWeek <= 0) return null;
  const cat = paoById(item.category);
  const totalUses = Math.max(1, Math.round(item.usesPerWeek * cat.paoMonths * 4.33));
  return { perUse: Math.round((item.price / totalUses) * 100) / 100, totalUses };
}

/* ---------- summary ---------- */

export function shelfSummary(items: ShelfItem[], todayISO: string): ShelfSummary {
  const statuses = items.map((i) => paoStatus(i, todayISO));
  const expired = statuses.filter((s) => s.state === "expired").length;
  const expiringSoon = statuses.filter((s) => s.state === "expiring-soon").length;
  const open = statuses.filter((s) => s.opened).length;
  const duplicates = findDuplicates(items).length;

  const bits: string[] = [];
  if (expired) bits.push(`${expired} past PAO`);
  if (expiringSoon) bits.push(`${expiringSoon} expiring soon`);
  if (duplicates) bits.push(`${duplicates} duplicate${duplicates > 1 ? "s" : ""}`);
  const headline = items.length
    ? bits.length
      ? `${items.length} products — ${bits.join(" · ")}`
      : `${items.length} products — all fresh ✦`
    : "Your shelf is empty";

  const shareText = items.length
    ? `My Aurelia Shelf ✦ ${items.length} products${expired ? `, ${expired} past their PAO` : ""}${duplicates ? `, ${duplicates} near-duplicates caught` : ""} — tracked on-device, exported with my Beauty Passport.`
    : "My Aurelia Shelf ✦ tracking PAO + duplicates, fully on-device.";

  return { total: items.length, open, expired, expiringSoon, duplicates, headline, shareText, disclaimer: PAO_DISCLAIMER };
}

/* ---------- item construction (store calls this) ---------- */

export interface ShelfItemInput {
  name: string;
  category: string;
  openedOn?: string | null;
  price?: number | null;
  usesPerWeek?: number | null;
  swatchHex?: string | null;
  activeId?: string | null;
  scanned?: boolean;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** sanitize + complete a raw input into a valid ShelfItem (id supplied by caller) */
export function buildShelfItem(input: ShelfItemInput, id: string, addedOn: string): ShelfItem {
  const name = (input.name ?? "").trim().slice(0, 40) || "New product";
  const cat = paoById(input.category);
  const price =
    typeof input.price === "number" && Number.isFinite(input.price) && input.price > 0
      ? Math.min(999999, Math.round(input.price * 100) / 100)
      : null;
  const uses =
    typeof input.usesPerWeek === "number" && Number.isFinite(input.usesPerWeek) && input.usesPerWeek > 0
      ? Math.min(70, Math.round(input.usesPerWeek))
      : null;
  const swatch =
    input.swatchHex && HEX_RE.test(input.swatchHex.trim()) ? input.swatchHex.trim().toUpperCase() : null;
  const opened = input.openedOn && parseDay(input.openedOn) !== null ? input.openedOn : null;
  return {
    id,
    name,
    category: cat.id,
    addedOn,
    openedOn: opened,
    price,
    usesPerWeek: uses,
    swatchHex: swatch,
    activeId: input.activeId && input.activeId.length > 0 && input.activeId.length <= 30 ? input.activeId : null,
    scanned: Boolean(input.scanned),
  };
}

export const SHELF_MAX_ITEMS = 60;
