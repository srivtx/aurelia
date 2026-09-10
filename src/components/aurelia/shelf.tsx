"use client";

/* ============================================================
   AURELIA — The Shelf (Mirror Test V4)
   ------------------------------------------------------------
   Every scanned product joins her Shelf, offline:
     · PAO countdown — the >90% PAO-overrun problem, solved
       with a visible clock per product
     · duplicate detection — swatch ΔE2000 < 5 within the
       same category (+ same active slot): "you already own a
       near-identical berry"
     · cost-per-use as the honest-ownership layer
   Nothing syncs anywhere: the shelf exports with the Beauty
   Passport and lives in localStorage only.
   ============================================================ */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paoCategories, paoById } from "@/data/pao";
import {
  costPerUse,
  findDuplicates,
  paoStatus,
  shelfSummary,
  type ShelfItem,
} from "@/lib/shelf";
import { useAurelia, todayKey } from "@/lib/store";
import { shareText } from "@/lib/share";
import { Card, Chip, Eyebrow } from "./bits";
import { ShelfIcon, ShareIcon, XIcon, AlertIcon } from "./icons";

/* ---------- state chip colors ---------- */

const STATE_META: Record<string, { color: string; bg: string }> = {
  unopened: { color: "var(--ink-2)", bg: "var(--surface-muted)" },
  fresh: { color: "var(--success)", bg: "var(--sage-soft)" },
  "expiring-soon": { color: "var(--gold)", bg: "color-mix(in srgb, var(--gold) 14%, transparent)" },
  expired: { color: "var(--error)", bg: "color-mix(in srgb, var(--error) 12%, transparent)" },
};

const today = () => todayKey();

/* ---------- add-item form ---------- */

function AddItemForm({ onDone }: { onDone: () => void }) {
  const { addShelfItem, showToast, shelf } = useAurelia();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("cream-foundation");
  const [price, setPrice] = useState("");
  const [uses, setUses] = useState("");
  const [swatch, setSwatch] = useState("");
  const [opened, setOpened] = useState(true);

  const save = () => {
    const item = addShelfItem({
      name: name || paoById(category).label,
      category,
      openedOn: opened ? today() : null,
      price: price ? Number(price) : null,
      usesPerWeek: uses ? Number(uses) : null,
      swatchHex: swatch || null,
      activeId: null,
      scanned: false,
    });
    if (!item) return;
    /* immediate duplicate feedback against the rest of the shelf */
    const others = shelf.filter((x) => x.id !== item.id);
    const hit = findDuplicates([...others, item]).find((d) => d.aId === item.id || d.bId === item.id);
    showToast(
      hit
        ? hit.basis === "shade"
          ? "Saved — heads up: you already own a near-identical shade ✦"
          : "Saved — you already own a product doing this job ✦"
        : "Saved to your shelf ✦",
    );
    onDone();
  };

  return (
    <Card className="p-4">
      <Eyebrow>Add a product</Eyebrow>
      <div className="space-y-3 mt-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Berry blush 01)"
          aria-label="Product name"
          className="aurelia-input w-full h-10 rounded-[12px] px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
        />
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-3 mb-1.5">Category (sets the PAO clock)</p>
          <div className="flex flex-wrap gap-1.5">
            {paoCategories.map((c) => {
              const on = c.id === category;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={on}
                  className="press h-7 px-2.5 rounded-full text-[11px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-rose/40 transition-colors"
                  style={
                    on
                      ? { background: "var(--cat-skin)", color: "white" }
                      : { background: "var(--surface-muted)", color: "var(--ink-2)", border: "1px solid var(--line-soft)" }
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="Price"
            aria-label="Price"
            className="aurelia-input h-10 rounded-[12px] px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          />
          <input
            value={uses}
            onChange={(e) => setUses(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="Uses/wk"
            aria-label="Uses per week"
            className="aurelia-input h-10 rounded-[12px] px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          />
          <input
            value={swatch}
            onChange={(e) => setSwatch(e.target.value)}
            placeholder="#A84A62"
            aria-label="Swatch hex color"
            spellCheck={false}
            className="aurelia-input h-10 rounded-[12px] px-3 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          />
        </div>
        {swatch && /^#[0-9a-fA-F]{6}$/.test(swatch.trim()) && (
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full border border-line shrink-0" style={{ background: swatch.trim() }} aria-label="Swatch preview" />
            <p className="text-[11.5px] text-ink-3">Swatch color — powers duplicate detection (ΔE2000 &lt; 5)</p>
          </div>
        )}
        <label className="flex items-center gap-2.5 press">
          <input
            type="checkbox"
            checked={opened}
            onChange={(e) => setOpened(e.target.checked)}
            className="w-4.5 h-4.5 accent-[var(--cat-skin)]"
            aria-label="Already opened"
          />
          <span className="text-[13px] text-ink-2">Already opened (starts the PAO countdown today)</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="press flex-1 h-11 rounded-full text-[14px] font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
            style={{ background: "var(--cat-skin)" }}
          >
            Save to shelf
          </button>
          <button
            onClick={onDone}
            className="press h-11 px-5 rounded-full border border-line text-[13px] font-bold text-ink-2 outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- one shelf row ---------- */

function ShelfRow({ item }: { item: ShelfItem }) {
  const { removeShelfItem, markShelfOpened, showToast } = useAurelia();
  const st = useMemo(() => paoStatus(item, today()), [item]);
  const meta = STATE_META[st.state] ?? STATE_META.unopened;
  const cat = paoById(item.category);
  const cpu = costPerUse(item);
  const [confirming, setConfirming] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* swatch */}
        <span
          className="shrink-0 w-10 h-10 rounded-[12px] border border-line-soft grid place-items-center"
          style={{ background: item.swatchHex ?? "var(--surface-muted)" }}
          aria-label={item.swatchHex ? `Swatch ${item.swatchHex}` : "No swatch"}
        >
          {!item.swatchHex && <ShelfIcon width={16} height={16} className="text-ink-3" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14.5px] font-bold text-ink leading-tight truncate">{item.name}</p>
            <Chip color={meta.color} soft={st.state === "unopened"}>
              {st.label}
            </Chip>
          </div>
          <p className="text-[11.5px] text-ink-3 mt-0.5">
            {cat.label} · {cat.paoMonths}M PAO{item.scanned ? " · scanned" : ""}
            {cpu ? ` · ~${cpu.perUse}/use` : ""}
          </p>
          {st.pct !== null && (
            <div className="mt-2.5 h-1.5 rounded-full bg-surface-muted overflow-hidden" role="progressbar" aria-valuenow={st.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`PAO remaining ${st.pct}%`}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${st.pct}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{
                  background:
                    st.state === "expired" ? "var(--error)" : st.state === "expiring-soon" ? "var(--gold)" : "var(--cat-skin)",
                }}
              />
            </div>
          )}
          {st.state === "expired" && (
            <p className="text-[11.5px] leading-[15px] text-ink-3 mt-1.5">{cat.note}</p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            {st.state === "unopened" && (
              <button
                onClick={() => {
                  markShelfOpened(item.id, today());
                  showToast("Clock started — PAO is counting down now ✦");
                }}
                className="press h-8 px-3 rounded-full text-[11.5px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                style={{ background: "var(--cat-skin)" }}
              >
                Opened it today
              </button>
            )}
            <AnimatePresence mode="wait">
              {confirming ? (
                <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                  <button
                    onClick={() => removeShelfItem(item.id)}
                    className="press h-8 px-3 rounded-full text-[11.5px] font-semibold bg-honey-soft text-ink outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                  >
                    Remove
                  </button>
                  <button onClick={() => setConfirming(false)} aria-label="Keep this product" className="press h-8 px-2.5 rounded-full text-[11.5px] font-semibold text-ink-3 border border-line-soft outline-none focus-visible:ring-2 focus-visible:ring-rose/40">
                    Keep
                  </button>
                </motion.span>
              ) : (
                <motion.button
                  key="t"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setConfirming(true)}
                  aria-label={`Remove ${item.name}`}
                  className="press h-8 w-8 rounded-full grid place-items-center border border-line-soft text-ink-3 outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                >
                  <XIcon width={14} height={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- the shelf sheet body ---------- */

export function Shelf() {
  const { shelf, clearShelf } = useAurelia();
  const [adding, setAdding] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const summary = useMemo(() => shelfSummary(shelf, today()), [shelf]);
  const dups = useMemo(() => findDuplicates(shelf), [shelf]);

  const sorted = useMemo(
    () =>
      [...shelf].sort((a, b) => {
        const sa = paoStatus(a, today());
        const sb = paoStatus(b, today());
        const order = { expired: 0, "expiring-soon": 1, unopened: 2, fresh: 3 } as Record<string, number>;
        return (order[sa.state] ?? 4) - (order[sb.state] ?? 4);
      }),
    [shelf],
  );

  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Every scanned product lands here — with its PAO clock and a duplicate check against the rest of your
        shelf. Nothing syncs: it lives on your device and exports with your Beauty Passport.
      </p>

      {/* summary strip */}
      {shelf.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Chip color="var(--cat-skin)">{summary.headline}</Chip>
          <button
            onClick={() =>
              shareText({ title: "My Aurelia Shelf", text: summary.shareText })
            }
            className="press ml-auto h-7 px-3 rounded-full bg-surface-muted border border-line-soft text-[11.5px] font-semibold text-ink-2 inline-flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            <ShareIcon width={13} height={13} /> Share
          </button>
        </div>
      )}

      {/* duplicates */}
      {dups.length > 0 && (
        <div className="mt-3 rounded-[14px] border border-gold/30 bg-gold/10 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertIcon width={16} height={16} className="text-gold shrink-0" />
            <p className="text-[13px] font-bold text-ink">Near-duplicates on your shelf</p>
          </div>
          {dups.map((d) => (
            <div key={`${d.aId}-${d.bId}`} className="flex items-start gap-2.5">
              <Chip color={d.basis === "shade" ? "var(--gold)" : "var(--ink-3)"}>{d.basis === "shade" ? `ΔE ${d.dE}` : "same active"}</Chip>
              <p className="text-[12.5px] leading-[17px] text-ink-2 min-w-0">{d.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* add */}
      <div className="mt-3">
        <AnimatePresence initial={false}>
          {adding ? (
            <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <AddItemForm onDone={() => setAdding(false)} />
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setAdding(true)}
              className="press w-full rounded-[16px] border border-dashed border-line p-4 hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
            >
              <span className="flex items-center justify-center gap-2 text-[13.5px] font-bold text-ink">
                <ShelfIcon width={18} height={18} className="text-cat-skin" /> Add a product to your shelf
              </span>
              <span className="block text-[11.5px] text-ink-3 mt-0.5">
                Or save one straight from a label scan — category, swatch and actives come pre-filled
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* the shelf */}
      {shelf.length === 0 ? (
        !adding && (
          <Card className="p-6 mt-3 text-center">
            <span className="mx-auto grid place-items-center w-12 h-12 rounded-[16px] bg-surface-muted">
              <ShelfIcon width={24} height={24} className="text-ink-3" />
            </span>
            <p className="text-[13.5px] font-semibold text-ink mt-3">Your shelf is empty</p>
            <p className="text-[12px] text-ink-3 mt-1 leading-[17px]">
              Scan a label and tap “Save to shelf” — the PAO countdown and duplicate check start the moment it lands.
            </p>
          </Card>
        )
      ) : (
        <>
          <div className="space-y-2.5 mt-3">
            {sorted.map((item) => (
              <ShelfRow key={item.id} item={item} />
            ))}
          </div>

          {/* footer actions + disclaimer */}
          <div className="mt-4 flex items-center gap-2 justify-between">
            <p className="text-[10.5px] text-ink-3 leading-[15px] max-w-[62%]">{summary.disclaimer}</p>
            {confirmClear ? (
              <span className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    clearShelf();
                    setConfirmClear(false);
                  }}
                  className="press h-8 px-3 rounded-full text-[11.5px] font-semibold bg-honey-soft text-ink outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                >
                  Clear everything
                </button>
                <button onClick={() => setConfirmClear(false)} className="press h-8 px-2.5 rounded-full text-[11.5px] font-semibold text-ink-3 border border-line-soft outline-none focus-visible:ring-2 focus-visible:ring-rose/40">
                  Keep
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="press text-[11.5px] font-semibold text-ink-3 underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded"
              >
                Clear shelf
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

