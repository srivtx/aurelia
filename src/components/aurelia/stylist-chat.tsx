"use client";

/* ============================================================
   AURELIA — AI Stylist chat overlay
   - Renders assistant replies as formatted markdown (no raw *** ** *)
   - Streams responses token-by-token (NDJSON deltas from /api/stylist)
   - Zero-party personalization (name / season / skin type / vibe)
   - The AI provider/model is a SERVER decision (env-driven, see
     docs/DEPLOYMENT.md) — deliberately invisible to the user.
     No picker, no provider labels, nothing to choose.
   Chat input bulletproofed: typed text always uses --ink on
   --surface-muted (the old invisible-text bug was a broken
   var(--rose) on the user bubble — fixed at the token level).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAurelia } from "@/lib/store";
import { seasonById } from "@/data/seasons";
import { skinTypes } from "@/data/skincare";
import { XIcon, SendIcon, ChatIcon } from "./icons";
import { StylistIllustration } from "./illustrations";
import { Markdown } from "./markdown";

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

/* ---------- typing dots ---------- */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-[18px] rounded-bl-md w-max" style={{ background: "var(--surface-muted)" }} aria-live="polite" aria-label="Aurelia is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--ink-3)", animation: `typing-bounce 1.2s ${i * 0.15}s ease-in-out infinite` }}
        />
      ))}
    </div>
  );
}

/* ---------- message bubble ---------- */
function MessageBubble({ m }: { m: UIMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div
          className="max-w-[85%] px-4 py-3 rounded-[18px] rounded-br-md text-[14px] leading-[20px] whitespace-pre-wrap"
          style={{ background: "var(--rose)", color: "var(--rose-foreground)" }}
        >
          {m.content}
        </div>
      ) : (
        <div className="max-w-[92%] px-4 py-3 rounded-[18px] rounded-bl-md" style={{ background: "var(--surface-muted)", color: "var(--ink-2)" }}>
          <Markdown text={m.content} />
        </div>
      )}
    </div>
  );
}

/* ---------- main chat ---------- */

export function StylistChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, seasonResult, skinResult } = useAurelia();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(false); // first delta arrived
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

  /* auto-scroll to newest message / while streaming */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: busy ? "auto" : "smooth" });
  }, [messages, busy, streaming, open]);

  const season = seasonResult ? seasonById(seasonResult.id) : null;
  const skinLabel = skinResult?.base ?? profile?.skinType ?? null;
  const skinName = skinLabel ? skinTypes.find((t) => t.id === skinLabel)?.name ?? skinLabel : null;

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setError(null);
    const userMsg: UIMessage = { role: "user", content: clean };
    const next: UIMessage[] = [...messages, userMsg];
    setMessages(next);
    setBusy(true);
    setStreaming(false);

    /* append an empty assistant bubble that fills as deltas arrive */
    const withEmpty = [...next, { role: "assistant" as const, content: "" }];

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

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok || !contentType.includes("ndjson")) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Try again");
      }

      setMessages(withEmpty);
      setStreaming(true);

      /* stream NDJSON deltas into the last assistant message */
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let gotDone = false;
      let streamErr: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { delta?: string; done?: boolean; error?: string };
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.error) {
            streamErr = evt.error;
            continue;
          }
          if (evt.delta) {
            acc += evt.delta;
            setMessages([...withEmpty.slice(0, -1), { role: "assistant", content: acc }]);
          }
          if (evt.done) gotDone = true;
        }
      }

      if (streamErr && !acc) {
        setMessages(next); // roll back empty bubble, keep user msg
        throw new Error(streamErr);
      }
      if (!acc.trim()) {
        setMessages(next);
        throw new Error(gotDone ? "Empty reply — try again in a moment ✦" : "Stream interrupted — try again ✦");
      }
    } catch (e) {
      setMessages(next); // keep user message
      setError(e instanceof Error ? e.message : "Something went sideways — try again ✦");
    } finally {
      setBusy(false);
      setStreaming(false);
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
          className="fixed inset-0 z-[60] mx-auto w-full max-w-[480px] flex flex-col"
          style={{ background: "var(--surface)" }}
        >
          {/* header */}
          <div className="shrink-0 px-4 pt-[calc(14px+env(safe-area-inset-top))] pb-3 border-b flex items-center gap-3" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            <span className="grid place-items-center w-10 h-10 rounded-full shrink-0" style={{ background: "var(--rose-soft)", color: "var(--rose)" }}>
              <ChatIcon width={20} height={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] leading-tight" style={{ color: "var(--ink)" }}>
                Ask Aurelia
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--ink-3)" }}>
                {season ? `${season.name} · ` : ""}
                {skinName ? `${skinName} skin · ` : ""}AI beauty editor
              </p>
            </div>
            <button
              aria-label="Close chat"
              onClick={onClose}
              className="tap-target press grid place-items-center w-10 h-10 rounded-full shrink-0 transition-colors"
              style={{ color: "var(--ink-3)" }}
            >
              <XIcon width={18} height={18} />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar overscroll-contain px-4 py-5 space-y-3" style={{ background: "var(--bg)" }}>
            {messages.length === 0 && !busy && (
              <div className="text-center pt-4">
                <StylistIllustration className="w-44 h-[150px] mx-auto" aria-label="Aurelia, your AI stylist" />
                <p className="font-display text-[19px] mt-2" style={{ color: "var(--ink)" }}>
                  Your pocket stylist
                </p>
                <p className="text-[13px] leading-[19px] mt-1.5 px-6" style={{ color: "var(--ink-3)" }}>
                  Ask anything about colors, makeup, skin or hair — she knows your {season ? "season, " : ""}profile and the whole Aurelia playbook.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-5 px-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="press text-[12.5px] font-semibold rounded-full px-3.5 h-9 border outline-none focus-visible:ring-2 focus-visible:ring-rose/40 transition-colors"
                      style={{ color: "var(--ink-2)", background: "var(--surface-muted)", borderColor: "var(--line-soft)" }}
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

            {busy && !streaming && <TypingDots />}

            {error && (
              <div className="text-center py-2">
                <p className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>
                  {error}
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    send(messages[messages.length - 1]?.content ?? "Hello!");
                  }}
                  className="mt-2 text-[13px] font-bold press tap-target"
                  style={{ color: "var(--rose)" }}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* input — typed text always visible (ink on surface-muted) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="shrink-0 px-4 pt-2 pb-[calc(14px+env(safe-area-inset-bottom))] border-t"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
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
                className="aurelia-input flex-1 h-11 rounded-full border px-[18px] text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                style={{ borderColor: "var(--line)", background: "var(--surface-muted)", color: "var(--ink)" }}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || busy}
                className="press grid place-items-center w-11 h-11 rounded-full shrink-0 disabled:opacity-40 transition-opacity"
                style={{ background: "var(--rose)", color: "var(--rose-foreground)" }}
              >
                <SendIcon width={18} height={18} />
              </button>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: "var(--ink-3)" }}>
              Aurelia gives friendly guidance — for persistent skin issues, see a dermatologist.
            </p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
