"use client";

/* ============================================================
   AURELIA — Bottom sheet (detail view)
   Spring: 320ms cubic-bezier(0.32,0.72,0,1) per DESIGN_BRIEF §5
   ============================================================ */

import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "./icons";
import { SaveButton, type Category } from "./bits";

export interface SheetData {
  id: string;
  category: Category;
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent: string;
}

export function BottomSheet({
  data,
  onClose,
  children,
}: {
  data: SheetData | null;
  onClose: () => void;
  children: ReactNode;
}) {
  /* ---- Android/browser back button closes the sheet instead of leaving the app.
     Opening pushes a history entry; UI-close consumes it; popstate closes the sheet. ---- */
  const pushedFor = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const sheetId = data?.id ?? null;

  useEffect(() => {
    if (sheetId && pushedFor.current !== sheetId) {
      pushedFor.current = sheetId;
      try {
        window.history.pushState({ aureliaSheet: sheetId }, "");
      } catch {
        /* history blocked — sheet still works, just no back-close */
      }
    } else if (!sheetId && pushedFor.current) {
      // closed via UI (drag/X/backdrop) — consume our pushed entry
      pushedFor.current = null;
      try {
        window.history.back();
      } catch {
        /* noop */
      }
    }
  }, [sheetId]);

  useEffect(() => {
    const onPop = () => {
      if (pushedFor.current) {
        pushedFor.current = null;
        onCloseRef.current();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!data) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [data]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[rgba(45,35,32,0.35)] backdrop-blur-[2px]"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={data.title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 550) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] bg-surface border-t border-line rounded-t-[24px] shadow-[0_-8px_40px_rgba(45,35,32,0.18)]"
          >
            {/* drag handle */}
            <div className="pt-2.5 pb-1 grid place-items-center shrink-0 touch-none">
              <div className="w-10 h-1.5 rounded-full bg-surface-deep" />
            </div>
            {/* header */}
            <div className="px-5 pt-2 pb-4 flex items-start gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                <p className="eyebrow" style={{ color: data.accent }}>
                  {data.eyebrow}
                </p>
                <h2 className="font-display text-[22px] leading-[27px] text-ink mt-1">{data.title}</h2>
                {data.subtitle && <p className="text-[13px] text-ink-3 mt-1">{data.subtitle}</p>}
              </div>
              <SaveButton
                item={{ id: data.id, category: data.category, title: data.title, subtitle: data.subtitle ?? "" }}
              />
              <button
                aria-label="Close"
                onClick={onClose}
                className="tap-target press grid place-items-center w-10 h-10 rounded-full text-ink-3 hover:bg-surface-muted transition-colors"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>
            {/* body */}
            <div className="px-5 pb-[calc(28px+env(safe-area-inset-bottom))] max-h-[72vh] overflow-y-auto no-scrollbar overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
