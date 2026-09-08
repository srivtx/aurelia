"use client";

/* ============================================================
   AURELIA — first-run onboarding
   3 light steps: name → skin type → style vibe.
   Skippable; everything is optional; visibly personalizes Home.
   ============================================================ */

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAurelia } from "@/lib/store";
import { skinTypes } from "@/data/skincare";
import { Eyebrow } from "./bits";
import { SparkleIcon, ArrowRightIcon, FlowerIcon, MirrorIcon, LipstickIcon, DropletIcon, SearchIcon } from "./icons";
import { OnboardingIllustration } from "./illustrations";

const vibes: { id: string; label: string; blurb: string; Icon: typeof SparkleIcon }[] = [
  { id: "soft", label: "Soft & sweet", blurb: "Creams, blushes, gentle glow", Icon: FlowerIcon },
  { id: "classic", label: "Clean & classic", blurb: "Neutrals, polish, everyday chic", Icon: MirrorIcon },
  { id: "bold", label: "Bold & bossy", blurb: "A statement lip, sharp lines", Icon: LipstickIcon },
  { id: "playful", label: "Playful & fun", blurb: "Color, sparkle, trying it all", Icon: SparkleIcon },
];

export function Onboarding({ onDone }: { onDone?: () => void }) {
  const { setProfile } = useAurelia();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [skinType, setSkinType] = useState<string | null>(null);
  const [vibe, setVibe] = useState<string | null>(null);

  const finish = (p: { name: string; skinType: string | null; vibe: string | null }) => {
    setProfile(p);
    onDone?.();
  };

  const skip = () => finish({ name: "", skinType: null, vibe: null });

  const next = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else finish({ name: name.trim(), skinType, vibe });
  };

  const canNext = step !== 0 || name.trim().length <= 20; // name optional

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Aurelia"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="shell-col pt-10 pb-6 flex-1 flex flex-col min-h-[100dvh]">
          {/* progress dots */}
          <div className="flex gap-1.5 mb-8" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-rose" : "bg-surface-deep"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                <OnboardingIllustration className="w-[190px] h-[156px] -ml-2" aria-hidden />
                <Eyebrow color="var(--rose)">Welcome to Aurelia</Eyebrow>
                <h1 className="font-display text-[30px] leading-[37px] text-ink mt-2">
                  Your pocket
                  <br />
                  beauty editor ✦
                </h1>
                <p className="text-[14px] leading-[21px] text-ink-2 mt-3">
                  Colors that go together, makeup from zero, skincare that makes sense, hair that matches your outfit — all in one warm little app.
                </p>
                <p className="text-[14px] font-semibold text-ink mt-8">What should we call you?</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  placeholder="Your name (optional)"
                  aria-label="Your name, optional"
                  className="mt-2.5 w-full h-12 rounded-[16px] border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-400 outline-none focus-visible:ring-2 focus-visible:ring-rose/40"
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                <Eyebrow color="var(--cat-skin)">Make it yours · 1 of 2</Eyebrow>
                <h1 className="font-display text-[26px] leading-[33px] text-ink mt-2">How does your skin usually feel?</h1>
                <p className="text-[13.5px] leading-[20px] text-ink-2 mt-2">
                  A quick guess is fine — there&apos;s a proper 10-question quiz inside if you want it.
                </p>
                <div className="space-y-2.5 mt-6">
                  {skinTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSkinType(t.id)}
                      aria-pressed={skinType === t.id}
                      className={`w-full text-left rounded-[16px] border p-4 press transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose/40 ${
                        skinType === t.id ? "border-cat-skin bg-sage-soft" : "border-line bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-full bg-sage-soft text-cat-skin shrink-0">
                          <DropletIcon width={18} height={18} />
                        </span>
                        <div>
                          <p className="text-[14.5px] font-bold text-ink">{t.name} skin</p>
                          <p className="text-[12px] leading-[16px] text-ink-3 mt-0.5 line-clamp-1">{t.snapshot}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setSkinType(null)}
                    aria-pressed={skinType === null}
                    className={`w-full text-left rounded-[16px] border p-4 press ${
                      skinType === null ? "border-rose bg-rose-soft" : "border-dashed border-line bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-9 h-9 rounded-full bg-rose-soft text-rose shrink-0">
                        <SearchIcon width={18} height={18} />
                      </span>
                      <p className="text-[14.5px] font-bold text-ink">Not sure — take me to the quiz later</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                <Eyebrow color="var(--cat-makeup)">Make it yours · 2 of 2</Eyebrow>
                <h1 className="font-display text-[26px] leading-[33px] text-ink mt-2">Pick a style mood</h1>
                <p className="text-[13.5px] leading-[20px] text-ink-2 mt-2">
                  We&apos;ll point you to the looks and palettes that feel most you.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {vibes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      aria-pressed={vibe === v.id}
                      className={`text-left rounded-[16px] border p-4 press transition-colors ${
                        vibe === v.id ? "border-rose bg-rose-soft" : "border-line bg-surface"
                      }`}
                    >
                      <span className={`grid place-items-center w-9 h-9 rounded-[12px] ${vibe === v.id ? "bg-rose text-white" : "bg-surface-muted text-ink-2"}`}>
                        <v.Icon width={19} height={19} strokeWidth={1.9} />
                      </span>
                      <p className="text-[14px] font-bold text-ink mt-2.5 leading-tight">{v.label}</p>
                      <p className="text-[11.5px] leading-[15px] text-ink-3 mt-1">{v.blurb}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* footer actions */}
      <div className="shrink-0 border-t border-line-soft bg-surface pb-safe" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 18px)" }}>
        <div className="shell-col flex items-center gap-3 h-[76px]">
          <button onClick={step === 0 ? skip : () => setStep(step - 1)} className="tap-target text-[13.5px] font-semibold text-ink-3 press">
            {step === 0 ? "Skip for now" : "Back"}
          </button>
          <div className="flex-1" />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={next}
            disabled={!canNext}
            className="h-12 px-7 rounded-full bg-rose text-white text-[15px] font-bold press flex items-center gap-2 disabled:opacity-40"
          >
            {step === 2 ? "Start exploring" : "Continue"}
            <ArrowRightIcon width={16} height={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
