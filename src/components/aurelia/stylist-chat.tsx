"use client";

/* ============================================================
   AURELIA — AI Stylist chat overlay
   A warm, expert chat grounded in the app's knowledge base,
   personalized with the user's season / skin type / vibe.
   Backend: /api/stylist (z-ai-web-dev-sdk, server-side only).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAurelia } from "@/lib/store";
import { seasonById } from "@/data/seasons";
import { skinTypes } from "@/data/skincare";
import { XIcon, SendIcon, ChatIcon } from "./icons";
import { StylistIllustration } from "./illustrations";

interface UIMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What colors go with a forest-green dress?",
  "Build me a 5-item capsule wardrobe",
  "How do I start using retinol safely?",
  "Soft makeup for my first date",
  "Which hairstyle suits a heart-shaped face?",
  "What's my best outfit formula for college?",
];

/* typing dots */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-[18px] rounded-bl-md bg-surface-muted w-max" aria-live="polite" aria-label="Aurelia is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-ink-3"
          style={{ animation: `typing-bounce 1.2s ${i * 0.15}s ease-in-out infinite` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ m }: { m: UIMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-[18px] text-[14px] leading-[20px] whitespace-pre-wrap ${
          isUser ? "rounded-br-md bg-rose text-white" : "rounded-bl-md bg-surface-muted text-ink-2"
        }`}
        style={isUser ? { background: "var(--rose)" } : undefined}
      >
        {m.content}
      </div>
    </div>
  );
}

export function StylistChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, seasonResult, skinResult } = useAurelia();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* back button closes chat (same pattern as BottomSheet) */
  const pushedRef = useRef(false);
  useEffect(() => {
    if (open && !pushedRef.current) {
      pushedRef.current = true;
      try {
        window.history.pushState({ aureliaChat: true }, "");
      } catch {
        /* noop */
      }
    } else if (!open && pushedRef.current) {
      pushedRef.current = false;
      try {
        window.history.back();
      } catch {
        /* noop */
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
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* auto-scroll to newest message */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  const season = seasonResult ? seasonById(seasonResult.id) : null;
  const skinLabel = skinResult?.base ?? profile?.skinType ?? null;
  const skinName = skinLabel ? skinTypes.find((t) => t.id === skinLabel)?.name ?? skinLabel : null;

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setError(null);
    const next: UIMessage[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-12),
          context: {
            name: profile?.name ?? null,
            season: season?.name ?? null,
            skinType: skinName,
            vibe: profile?.vibe ?? null,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) throw new Error(data.error || "Try again");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages(next); // keep user message
      setError(e instanceof Error ? e.message : "Something went sideways — try again ✦");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="stylist"
          role="dialog"
          aria-modal="true"
          aria-label="Ask Aurelia — AI stylist chat"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[60] mx-auto w-full max-w-[480px] bg-surface flex flex-col"
        >
          {/* header */}
          <div className="shrink-0 px-4 pt-[calc(14px+env(safe-area-inset-top))] pb-3 border-b border-line flex items-center gap-3 bg-surface">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-rose-soft text-rose shrink-0" style={{ background: "var(--rose-soft)", color: "var(--rose)" }}>
              <ChatIcon width={20} height={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] text-ink leading-tight">Ask Aurelia</p>
              <p className="text-[11px] text-ink-3">
                {season ? `${season.name} · ` : ""}
                {skinName ? `${skinName} skin · ` : ""}AI beauty editor
              </p>
            </div>
            <button
              aria-label="Close chat"
              onClick={onClose}
              className="tap-target press grid place-items-center w-10 h-10 rounded-full text-ink-3 hover:bg-surface-muted transition-colors shrink-0"
            >
              <XIcon width={18} height={18} />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar overscroll-contain px-4 py-5 space-y-3">
            {messages.length === 0 && !busy && (
              <div className="text-center pt-4">
                <StylistIllustration className="w-44 h-[150px] mx-auto" aria-label="Aurelia, your AI stylist" />
                <p className="font-display text-[19px] text-ink mt-2">Your pocket stylist</p>
                <p className="text-[13px] leading-[19px] text-ink-3 mt-1.5 px-6">
                  Ask anything about colors, makeup, skin or hair — she knows your {season ? "season, " : ""}profile and the whole Aurelia playbook.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-5 px-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="press text-[12.5px] font-semibold text-ink-2 bg-surface-muted border border-line-soft rounded-full px-3.5 h-9 hover:bg-terra-soft transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} />
            ))}

            {busy && <TypingDots />}

            {error && (
              <div className="text-center py-2">
                <p className="text-[12.5px] text-ink-3">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    send(messages[messages.length - 1]?.content ?? "Hello!");
                  }}
                  className="mt-2 text-[13px] font-bold text-rose press tap-target"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="shrink-0 px-4 pt-2 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-line bg-surface"
          >
            <div className="flex items-center gap-2.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about colors, skin, makeup, hair…"
                aria-label="Message Aurelia"
                maxLength={600}
                autoComplete="off"
                className="flex-1 h-11 rounded-full border border-line bg-surface-muted px-[18px] text-[14px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || busy}
                className="press grid place-items-center w-11 h-11 rounded-full bg-rose text-white shrink-0 disabled:opacity-40 transition-opacity"
                style={{ background: "var(--rose)" }}
              >
                <SendIcon width={18} height={18} />
              </button>
            </div>
            <p className="text-[10px] text-ink-3 text-center mt-2">Aurelia gives friendly guidance — for persistent skin issues, see a dermatologist.</p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
