"use client";

import { useEffect } from "react";
import { NotFoundIllustration } from "@/components/aurelia/illustrations";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6 text-center">
      <NotFoundIllustration className="w-36 h-32" aria-hidden />
      <p className="eyebrow text-ink-400 mt-6">Something smudged</p>
      <h1 className="font-display text-[26px] leading-[32px] text-ink mt-2">A little makeup mishap</h1>
      <p className="text-[14px] leading-[21px] text-ink-2 mt-3 max-w-[300px]">
        An unexpected error occurred. Blot, reset, try again — it usually works.
      </p>
      <button
        onClick={reset}
        className="mt-8 h-12 px-7 rounded-full bg-rose text-white text-[15px] font-bold press"
      >
        Try again
      </button>
    </div>
  );
}
