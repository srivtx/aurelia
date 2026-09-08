"use client";

/* ============================================================
   AURELIA — AI Stylist chat overlay
   - Renders assistant replies as formatted markdown (no raw *** ** *)
   - Streams responses token-by-token (NDJSON deltas from /api/stylist)
   - Multi-provider model picker: free Groq / Gemini / OpenRouter /
     Cerebras / Mistral / custom — status from /api/models
   - Zero-party personalization (name / season / skin type / vibe)
   Chat input bulletproofed: typed text always uses --ink on
   --surface-muted (the old invisible-text bug was a broken
   var(--rose) on the user bubble — fixed at the token level).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAurelia, type AIModelChoice } from "@/lib/store";
import { seasonById } from "@/data/seasons";
import { skinTypes } from "@/data/skincare";
import { XIcon, SendIcon, ChatIcon, CheckIcon, FlaskIcon, SparkleIcon, ArrowRightIcon } from "./icons";
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

/* ---------- provider/model types (mirror /api/models) ---------- */

interface ModelInfo {
  id: string;
  label: string;
  note?: string;
}
interface ProviderInfo {
  id: string;
  label: string;
  blurb: string;
  configured: boolean;
  live: boolean;
  freeNote: string;
  keyEnv: string | null;
  keyUrl: string | null;
  models: ModelInfo[];
}

const DEFAULT_MODEL: AIModelChoice = { provider: "zai", id: "aurelia-default", label: "Aurelia Cloud" };

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

/* ---------- model picker sheet ---------- */
function ModelPickerSheet({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (m: AIModelChoice) => void }) {
  const { aiModel, showToast } = useAurelia();
  const [providers, setProviders] = useState<ProviderInfo[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  /* escape closes */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || providers) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/models", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !Array.isArray(data.providers)) throw new Error("Could not load models");
        setProviders(data.providers as ProviderInfo[]);
      } catch {
        if (!cancelled) setErr("Could not load the model list — check your connection.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, providers]);

  const current = aiModel ?? DEFAULT_MODEL;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="model-picker"
          role="dialog"
          aria-modal="true"
          aria-label="Choose AI model"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] mx-auto w-full max-w-[480px] flex flex-col justify-end"
        >
          <button aria-label="Close model picker" onClick={onClose} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 600) onClose();
            }}
            className="relative max-h-[78vh] rounded-t-[24px] flex flex-col"
            style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
          >
            <div className="pt-2.5 pb-1 grid place-items-center shrink-0">
              <div className="w-9 h-1 rounded-full" style={{ background: "var(--line)" }} />
            </div>
            <div className="px-5 pb-3 shrink-0">
              <p className="font-display text-[19px] leading-tight" style={{ color: "var(--ink)" }}>
                Choose the AI brain
              </p>
              <p className="text-[12.5px] mt-1" style={{ color: "var(--ink-3)" }}>
                Free providers work with your own API key — see docs/DEPLOYMENT.md in the repo for the 2-minute setup.
              </p>
            </div>

            <div className="overflow-y-auto no-scrollbar px-4 pb-[calc(18px+env(safe-area-inset-bottom))] space-y-4">
              {err && (
                <p className="text-center text-[13px] py-6" style={{ color: "var(--ink-3)" }}>
                  {err}
                </p>
              )}
              {!providers && !err && (
                <div className="space-y-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-16 rounded-[16px]" />
                  ))}
                </div>
              )}
              {providers?.map((p) => (
                <div key={p.id} className="rounded-[16px] p-4" style={{ background: "var(--surface-muted)" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-8 h-8 rounded-full shrink-0" style={{ background: p.configured ? "var(--sage-soft)" : "var(--surface-deep)", color: p.configured ? "var(--sage)" : "var(--ink-3)" }}>
                      {p.id === "zai" ? <SparkleIcon width={16} height={16} /> : <FlaskIcon width={16} height={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
                        {p.label}
                      </p>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-3)" }}>
                        {p.configured ? p.freeNote : "Not configured"}
                      </p>
                    </div>
                    {p.configured ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: "var(--sage-soft)", color: "var(--sage)" }}>
                        {p.live ? "live" : "ready"}
                      </span>
                    ) : p.keyEnv ? (
                      <a
                        href={p.keyUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 press"
                        style={{ background: "var(--rose-soft)", color: "var(--rose)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Get key <ArrowRightIcon width={11} height={11} />
                      </a>
                    ) : null}
                  </div>

                  {!p.configured && p.keyEnv && (
                    <p className="text-[11.5px] mt-2.5 rounded-[10px] px-3 py-2 leading-[16px]" style={{ background: "var(--surface-deep)", color: "var(--ink-3)" }}>
                      Add <code className="font-mono font-bold">{p.keyEnv}</code> to your server <code className="font-mono">.env</code> file, restart, then pick any model below.
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5">
                    {p.models.length === 0 && p.configured && (
                      <p className="text-[12px] italic" style={{ color: "var(--ink-3)" }}>
                        No models listed — set AI_MODEL for custom endpoints.
                      </p>
                    )}
                    {p.models.map((m) => {
                      const selected = current.provider === p.id && current.id === m.id;
                      return (
                        <button
                          key={m.id}
                          disabled={!p.configured}
                          onClick={() => {
                            onPick({ provider: p.id, id: m.id, label: m.label });
                            showToast(`Stylist brain: ${m.label} ✦`);
                            onClose();
                          }}
                          className={`w-full text-left rounded-[12px] px-3 py-2.5 flex items-center gap-2.5 press outline-none focus-visible:ring-2 focus-visible:ring-rose/40`}
                          style={{
                            background: selected ? "var(--rose-soft)" : "var(--surface)",
                            opacity: p.configured ? 1 : 0.55,
                          }}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-bold leading-tight truncate" style={{ color: "var(--ink)" }}>
                              {m.label}
                            </span>
                            <span className="block text-[11px] mt-0.5 truncate" style={{ color: "var(--ink-3)" }}>
                              {m.note ?? m.id}
                            </span>
                          </span>
                          {selected && <CheckIcon width={17} height={17} style={{ color: "var(--rose)" }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- main chat ---------- */

export function StylistChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, seasonResult, skinResult, aiModel, setAiModel } = useAurelia();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(false); // first delta arrived
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const activeModel = aiModel ?? DEFAULT_MODEL;

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
          model: { provider: activeModel.provider, id: activeModel.id },
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
        throw new Error(gotDone ? "Empty reply — try again or switch models." : "Stream interrupted — try again ✦");
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
              aria-label="Choose AI model"
              onClick={() => setPickerOpen(true)}
              className="tap-target press flex items-center gap-1.5 h-8 px-3 rounded-full shrink-0 border outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
              style={{ borderColor: "var(--line)", background: "var(--surface-muted)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--sage)" }} />
              <span className="text-[11px] font-bold max-w-[110px] truncate" style={{ color: "var(--ink-2)" }}>
                {activeModel.label}
              </span>
            </button>
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

          <ModelPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(m) => setAiModel(m)} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
