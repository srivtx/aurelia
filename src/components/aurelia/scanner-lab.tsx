"use client";

/* ============================================================
   AURELIA — Label Scanner Lab (Ingredient Lab's camera door)
   ------------------------------------------------------------
   Photo of an INCI label (on-device OCR, tesseract.js lazy) OR
   pasted text → alias matcher → the existing conflict/synergy
   matrix, crossed against HER saved routine. Every scan can
   join her Shelf (Mirror Test V4: PAO + duplicates), and the
   ingredient list gets an oxidation formula read (V2).
   Privacy: OCR runs in a local web worker — the photo never
   leaves the device. Honest by design: fuzzy matches are
   labeled, the raw text is always one tap away to verify.
   ============================================================ */

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { actives, activeById } from "@/data/actives";
import { paoCategories, paoById } from "@/data/pao";
import {
  scanLabel,
  scanHeadline,
  suggestRoutine,
  type ScanResult,
} from "@/lib/label-scan";
import { formulaOxidation } from "@/lib/oxidation";
import { findDuplicates } from "@/lib/shelf";
import { ocrFile, OcrError, type OcrProgress } from "@/lib/ocr";
import { useAurelia, todayKey } from "@/lib/store";
import { Card, Chip, Eyebrow } from "./bits";
import {
  AlertIcon,
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  FlaskIcon,
  ScanIcon,
  ShelfIcon,
  TextIcon,
} from "./icons";

const ROUTINE_CAP = 6;

const STATUS_META: Record<ScanResult["status"], { label: string; color: string; bg: string }> = {
  clear: { label: "Plays well", color: "var(--success)", bg: "var(--sage-soft)" },
  careful: { label: "Layer with care", color: "var(--gold)", bg: "color-mix(in srgb, var(--gold) 14%, transparent)" },
  conflict: { label: "Conflict found", color: "var(--error)", bg: "color-mix(in srgb, var(--error) 12%, transparent)" },
};

const CONFIDENCE_HINT: Record<string, string> = {
  exact: "exact",
  family: "family",
  fuzzy: "fuzzy",
};

/* smart default category from what the scan matched (V4 wiring) */
function suggestCategory(result: ScanResult): string {
  const ids = result.matched.map((m) => m.id);
  if (ids.includes("spf")) return "sunscreen";
  if (ids.includes("benzoyl") || ids.includes("bha")) return "serum"; // targeted treatments
  if (ids.length > 0) return "serum"; // actives-heavy → leave-on serum by default
  return "moisturizer";
}

/* ---------- save this scan to her Shelf (Mirror Test V4) ---------- */

function SaveToShelfCard({ result }: { result: ScanResult }) {
  const { addShelfItem, shelf, showToast } = useAurelia();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(() => suggestCategory(result));
  const [price, setPrice] = useState("");
  const [uses, setUses] = useState("");
  const [swatch, setSwatch] = useState("");
  const [opened, setOpened] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const onShelf = savedKey
    ? shelf.some((x) => x.id === savedKey || (x.name === savedKey && x.category === category))
    : false;

  const save = () => {
    const label = (name.trim() || `${paoById(category).label} (scanned)`).slice(0, 40);
    const item = addShelfItem({
      name: label,
      category,
      openedOn: opened ? todayKey() : null,
      price: price ? Number(price) : null,
      usesPerWeek: uses ? Number(uses) : null,
      swatchHex: swatch.trim() || null,
      activeId: result.matched[0]?.id ?? null,
      scanned: true,
    });
    if (!item) return;
    setSavedKey(label);
    const others = shelf.filter((x) => x.id !== item.id);
    const hit = findDuplicates([...others, item]).find((d) => d.aId === item.id || d.bId === item.id);
    showToast(
      hit
        ? hit.basis === "shade"
          ? "On your shelf — heads up: near-identical shade already there ✦"
          : "On your shelf — you already own something doing this job ✦"
        : "Saved to your shelf — PAO clock armed ✦",
    );
  };

  if (onShelf && !name && !price && !uses && !swatch) {
    return (
      <Card className="p-3.5 flex items-center gap-2.5 bg-sage-soft">
        <CheckIcon width={17} height={17} className="text-sage shrink-0" strokeWidth={2.4} />
        <p className="text-[12.5px] font-semibold text-ink min-w-0">On your shelf — countdown running in the Shelf sheet</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <ShelfIcon width={16} height={16} className="text-cat-skin" />
        <p className="text-[13.5px] font-bold text-ink">Save to your Shelf</p>
        <span className="ml-auto text-[11px] text-ink-3">PAO clock + duplicate check</span>
      </div>
      <div className="space-y-3 mt-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${paoById(category).label} (scanned)`}
          aria-label="Product name"
          className="aurelia-input w-full h-10 rounded-[12px] px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
        />
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
            aria-label="Swatch hex color for duplicate detection"
            spellCheck={false}
            className="aurelia-input h-10 rounded-[12px] px-3 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          />
        </div>
        {swatch && /^#[0-9a-fA-F]{6}$/.test(swatch.trim()) && (
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full border border-line shrink-0" style={{ background: swatch.trim() }} aria-label="Swatch preview" />
            <p className="text-[11.5px] text-ink-3">Swatch — powers the near-identical duplicate check (ΔE2000 &lt; 5)</p>
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
        <button
          onClick={save}
          className="press w-full h-11 rounded-full text-[14px] font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          style={{ background: "var(--cat-skin)" }}
        >
          {onShelf ? "Update shelf entry" : "Save to shelf"}
        </button>
        <p className="text-[10.5px] leading-[15px] text-ink-3">{paoById(category).note}</p>
      </div>
    </Card>
  );
}

/* ---------- her routine editor (shared by capture + result) ---------- */

function RoutineEditor({ compact = false }: { compact?: boolean }) {
  const { myActives, setMyActives, journal } = useAurelia();
  const [open, setOpen] = useState(false); // collapsed until asked (both modes)

  const suggestions = useMemo(() => {
    const have = new Set(myActives);
    return suggestRoutine(journal.map((e) => (e as { actives?: string[] }).actives ?? [])).filter(
      (id) => !have.has(id),
    );
  }, [journal, myActives]);

  const toggle = (id: string) => {
    setMyActives(
      myActives.includes(id) ? myActives.filter((x) => x !== id) : myActives.length >= ROUTINE_CAP ? myActives : [...myActives, id],
    );
  };

  if (compact && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="press rounded-full border border-line-soft px-3 py-1.5 text-[11.5px] font-semibold text-ink-2 hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
      >
        Checked against {myActives.length === 0 ? "—" : `${myActives.length} active${myActives.length > 1 ? "s" : ""}`} · edit
      </button>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <FlaskIcon width={16} height={16} className="text-cat-skin" />
        <p className="text-[13.5px] font-bold text-ink">Your routine</p>
        <span className="ml-auto text-[11px] text-ink-3">{myActives.length}/{ROUTINE_CAP} · what we check against</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {actives.map((a) => {
          const on = myActives.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              aria-pressed={on}
              aria-label={`${a.name} — ${on ? "in your routine" : "not in your routine"}`}
              className="press h-8 px-3 rounded-full text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-rose/40 transition-colors"
              style={
                on
                  ? { background: "var(--cat-skin)", color: "white" }
                  : { background: "var(--surface-muted)", color: "var(--ink-2)", border: "1px solid var(--line-soft)" }
              }
            >
              {a.short}
            </button>
          );
        })}
      </div>
      {suggestions.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-ink-3">From your journal:</span>
          {suggestions.map((id) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="press h-7 px-2.5 rounded-full text-[11px] font-semibold bg-sage-soft text-cat-skin outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
            >
              + {activeById(id)?.short ?? id}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------- the scanner sheet ---------- */

export function ScannerLab() {
  const { myActives, scanResult, setScanResult, showToast } = useAurelia();
  const [view, setView] = useState<"capture" | "analyzing" | "result">(
    scanResult ? "result" : "capture",
  );
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* the persisted scan keeps the raw text; the verdict is re-derived from
     HER CURRENT routine — editing the routine updates the verdict live */
  const liveResult = useMemo(
    () => (scanResult ? scanLabel(scanResult.text, myActives) : null),
    [scanResult, myActives],
  );
  const result = view === "result" ? liveResult : null;
  const headline = result ? scanHeadline(result, myActives.length) : null;
  const meta = result ? STATUS_META[result.status] : null;

  /* Mirror Test V2 — the oxidation formula read on the same tokens
     (raw text catches CI 774xx codes the tokenizer digit-strips) */
  const formulaRead = useMemo(
    () => (result ? formulaOxidation(result.ingredients, result.text) : null),
    [result],
  );

  /* photo → OCR → scan */
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setOcrError(null);
    setView("analyzing");
    setProgress({ phase: "loading", progress: 0 });
    try {
      const text = await ocrFile(file, setProgress);
      if (!text || text.replace(/\s/g, "").length < 12) {
        setOcrError("Couldn't read enough text from that photo — try filling the frame, or paste the list instead ✦");
        setPastedText(text ?? "");
        setPasteMode(true);
        setView("capture");
        return;
      }
      commitScan(text);
    } catch (e) {
      const msg = e instanceof OcrError ? e.message : "OCR failed — paste the list instead ✦";
      setOcrError(msg);
      setPasteMode(true);
      setView("capture");
    } finally {
      setProgress(null);
    }
  };

  /* pasted text → scan */
  const runPaste = () => {
    const text = pastedText.trim();
    if (text.replace(/\s/g, "").length < 8) {
      showToast("Paste the ingredient list first — even a few lines work ✦");
      return;
    }
    setOcrError(null);
    commitScan(text);
  };

  const commitScan = (text: string) => {
    const r = scanLabel(text, myActives);
    setScanResult(r);
    setShowRaw(false);
    setView("result");
    showToast(
      r.matched.length === 0
        ? "Scan done — no known actives found"
        : r.status === "conflict"
          ? "Scan done — heads up, there's a clash ✦"
          : "Scan done ✦ verdict saved",
    );
  };

  const rescan = () => {
    setView("capture");
    setPasteMode(true);
    setPastedText("");
    setOcrError(null);
    setShowRaw(false);
  };

  const fixText = () => {
    if (result) setPastedText(result.text);
    setView("capture");
    setPasteMode(true);
    setOcrError(null);
  };

  /* ---------- render ---------- */
  return (
    <div>
      <p className="text-[13px] leading-[19px] text-ink-2">
        Photograph any ingredient label — the scan runs on your phone, matches the actives it knows, and checks them against your routine. No photo ever leaves the device.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Choose a photo of an ingredient label"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* ---------- capture ---------- */}
      {view === "capture" && (
        <div className="mt-4 space-y-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-[16px] border border-dashed border-line p-5 press hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
          >
            <ScanIcon width={30} height={30} className="mx-auto text-cat-skin" />
            <p className="text-[14px] font-bold text-ink mt-2">Scan a label</p>
            <p className="text-[12px] text-ink-3 mt-0.5">Flat label, bright light, ingredients filling the frame</p>
          </button>

          {ocrError && (
            <div className="rounded-[14px] bg-honey-soft border border-line-soft p-3.5 flex gap-2.5">
              <AlertIcon width={18} height={18} className="text-honey shrink-0 mt-0.5" />
              <p className="text-[13px] leading-[17px] text-ink-2">{ocrError}</p>
            </div>
          )}

          <div className="rounded-[16px] border border-line-soft p-3.5">
            <button
              onClick={() => setPasteMode((p) => !p)}
              className="w-full flex items-center gap-2.5 press outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded-[10px]"
              aria-expanded={pasteMode}
            >
              <TextIcon width={18} height={18} className="text-cat-skin shrink-0" />
              <span className="text-[13px] font-semibold text-ink flex-1 text-left">Or paste the list</span>
              <ArrowRightIcon
                width={14}
                height={14}
                className="text-ink-3 transition-transform"
                style={{ transform: pasteMode ? "rotate(90deg)" : "none" }}
              />
            </button>
            {pasteMode && (
              <div className="mt-3">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Aqua, Glycerin, Niacinamide, Salicylic Acid, Retinol, Alcohol Denat., Parfum…"
                  aria-label="Paste the ingredient list"
                  className="aurelia-input w-full min-h-[110px] rounded-[12px] text-[13px] leading-[18px] p-3 resize-y outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                  spellCheck={false}
                />
                <button
                  onClick={runPaste}
                  className="press mt-2.5 w-full h-10 rounded-full font-semibold text-[13.5px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                  style={{ background: "var(--cat-skin)", color: "white" }}
                >
                  Read this label
                </button>
              </div>
            )}
          </div>

          <RoutineEditor />
        </div>
      )}

      {/* ---------- analyzing ---------- */}
      {view === "analyzing" && (
        <div className="mt-6">
          <motion.div
            className="mx-auto w-16 h-16 rounded-full border-[3px] border-sage-soft"
            style={{ borderTopColor: "var(--cat-skin)" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          />
          <p className="text-center text-[14.5px] font-bold text-ink mt-4">
            {progress?.phase === "reading" ? "Reading the label…" : "Loading the OCR engine…"}
          </p>
          <p className="text-center text-[12px] text-ink-3 mt-1">
            {progress?.phase === "reading"
              ? "Spotting ingredient names — fuzzy OCR is expected on shiny labels"
              : "First scan downloads the engine (~4 MB) — it's cached after that"}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${Math.round((progress?.progress ?? 0) * 100)}%`, background: "var(--cat-skin)" }}
            />
          </div>
        </div>
      )}

      {/* ---------- result ---------- */}
      {view === "result" && result && meta && headline && (
        <div className="mt-4 space-y-3">
          {/* verdict banner */}
          <div className="rounded-[16px] p-4 flex items-center gap-3" style={{ background: meta.bg }}>
            <span
              className="grid place-items-center w-10 h-10 rounded-full shrink-0"
              style={{ background: "var(--surface)", color: meta.color }}
            >
              {result.status === "clear" ? <CheckIcon width={20} height={20} /> : <AlertIcon width={20} height={20} />}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight" style={{ color: meta.color }}>
                {headline.title}
              </p>
              <p className="text-[12px] text-ink-3 mt-0.5 leading-[16px]">{headline.sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <RoutineEditor compact />
            <button onClick={rescan} className="press rounded-full bg-surface-muted border border-line-soft px-3 py-1.5 text-[11.5px] font-semibold text-ink-2 hover:bg-surface transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40">
              Scan another
            </button>
          </div>

          {/* matched actives */}
          {result.matched.length > 0 ? (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-bold text-ink">Actives found ({result.matched.length})</p>
                <span className="ml-auto text-[11px] text-ink-3">{result.ingredients.length} ingredients read</span>
              </div>
              <div className="space-y-2 mt-3">
                {result.matched.map((m) => {
                  const a = activeById(m.id);
                  return (
                    <div key={m.id} className="rounded-[12px] bg-surface-muted p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-semibold text-ink">{m.name}</p>
                        <Chip color="var(--cat-skin)">{a?.slots.join(" / ").toUpperCase() ?? ""}</Chip>
                        {m.confidence !== "exact" && (
                          <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--gold)" }}>
                            {CONFIDENCE_HINT[m.confidence]} match
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-ink-3 mt-1">
                        matched “{m.via}” {m.confidence === "fuzzy" ? "— please verify this one against the label" : ""}
                      </p>
                      {a && <p className="text-[12.5px] leading-[16px] text-ink-2 mt-1.5">{a.note}</p>}
                    </div>
                  );
                })}
              </div>
              {result.newActives.length > 0 && (
                <p className="text-[12px] text-ink-3 mt-3">
                  New for you: {result.newActives.map((m) => activeById(m.id)?.short ?? m.id).join(" · ")}
                </p>
              )}
            </Card>
          ) : (
            <Card className="p-4 text-center">
              <FlaskIcon width={24} height={24} className="mx-auto text-ink-3" />
              <p className="text-[13px] text-ink-3 mt-2">
                No actives from our dictionary — common for cleansers and basics. Check the raw text below.
              </p>
            </Card>
          )}

          {/* conflicts */}
          {result.conflicts.map((c, i) => (
            <div
              key={`${c.aid}-${c.bid}-${i}`}
              className="rounded-[14px] p-3.5"
              style={{ background: c.severity === "avoid" ? "var(--honey-soft)" : "color-mix(in srgb, var(--gold) 10%, transparent)" }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Chip color={c.severity === "avoid" ? "var(--error)" : "var(--gold)"}>
                  {c.severity === "avoid" ? "don't combine" : "careful"}
                </Chip>
                <Chip color="var(--ink-3)">
                  {c.scope === "product-vs-routine" ? "with your routine" : "inside this product"}
                </Chip>
                <p className="text-[13.5px] font-bold text-ink">
                  {c.a} × {c.b}
                </p>
              </div>
              <p className="text-[12.5px] leading-[17px] text-ink-3 mt-1.5">{c.why}</p>
            </div>
          ))}

          {/* synergies */}
          {result.synergies.length > 0 && (
            <div className="rounded-[14px] p-3.5 bg-sage-soft">
              <Eyebrow color="var(--cat-skin)">Power couples</Eyebrow>
              <div className="space-y-2 mt-2">
                {result.synergies.map((s, i) => (
                  <p key={`${s.a}-${s.b}-${i}`} className="text-[12.5px] leading-[17px] text-ink-2">
                    <b>{s.a} + {s.b}</b>
                    {s.scope === "product-vs-routine" ? " (with your routine)" : ""} — {s.why}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* flags */}
          {result.flags.length > 0 && (
            <div className="rounded-[14px] p-3.5 border border-gold/30 bg-gold/10 space-y-2.5">
              {result.flags.map((f, i) => (
                <div key={`${f.kind}-${f.via}-${i}`} className="flex gap-2.5 items-start">
                  <AlertIcon width={16} height={16} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink capitalize">
                      {f.kind === "essential-oil" ? "essential oil" : f.kind} — “{f.via}”
                    </p>
                    <p className="text-[12px] leading-[16px] text-ink-3 mt-0.5">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* formula read — Mirror Test V2 on the ingredient list */}
          {formulaRead && (
            <div className="rounded-[14px] border border-gold/30 bg-gold/10 p-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Eyebrow color="var(--gold)">Formula read · can oxidize</Eyebrow>
                <Chip color="var(--gold)">{Math.round(formulaRead.propensity * 100)}% signal</Chip>
              </div>
              <div className="space-y-2 mt-2">
                {formulaRead.notes.map((n, i) => (
                  <p key={i} className="text-[12.5px] leading-[17px] text-ink-2">{n}</p>
                ))}
                <p className="text-[11.5px] leading-[16px] text-ink-3">
                  Oily skin? Check this shade in the Shade Lab (Makeup tab) — it simulates the one-hour drift before you buy.
                </p>
              </div>
            </div>
          )}

          {/* save to her Shelf — Mirror Test V4 */}
          <SaveToShelfCard result={result} />

          {/* raw text */}
          <div className="rounded-[14px] border border-line-soft p-3.5">
            <button
              onClick={() => setShowRaw((s) => !s)}
              className="w-full flex items-center gap-2 press outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded-[8px]"
              aria-expanded={showRaw}
            >
              <span className="text-[12.5px] font-semibold text-ink-2 flex-1 text-left">
                The raw list we read ({result.ingredients.length} ingredients)
              </span>
              <ArrowRightIcon
                width={14}
                height={14}
                className="text-ink-3 transition-transform"
                style={{ transform: showRaw ? "rotate(90deg)" : "none" }}
              />
            </button>
            {showRaw && (
              <div className="mt-2.5 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {result.ingredients.map((ing, i) => {
                    const known = result.matched.some((m) => m.via === ing) || result.flags.some((f) => f.via === ing);
                    return (
                      <span
                        key={`${ing}-${i}`}
                        className="text-[11px] px-2 py-1 rounded-full"
                        style={
                          known
                            ? { background: "color-mix(in srgb, var(--cat-skin) 18%, transparent)", color: "var(--cat-skin)", fontWeight: 600 }
                            : { background: "var(--surface-muted)", color: "var(--ink-3)" }
                        }
                      >
                        {ing}
                      </span>
                    );
                  })}
                </div>
                <p className="text-[11px] text-ink-3 leading-[15px] break-words whitespace-pre-wrap">{result.text}</p>
                <button
                  onClick={fixText}
                  className="press text-[12px] font-semibold text-cat-skin underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-rose/40 rounded"
                >
                  Something look wrong? Fix the text
                </button>
              </div>
            )}
          </div>

          <p className="text-[10.5px] text-ink-3 leading-[15px] px-1">
            OCR is fuzzy — verify fuzzy matches against the real label before acting on them. Education, not medical advice: patch-test new products and ask a pharmacist or dermatologist about your skin.
          </p>
        </div>
      )}
    </div>
  );
}
