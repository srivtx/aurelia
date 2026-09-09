"use client";

/* ============================================================
   AURELIA — OCR wrapper (client-only, lazy tesseract.js)
   ------------------------------------------------------------
   · tesseract.js + eng model load lazily from CDN on first use
     (never part of the app bundle / first paint)
   · labels are preprocessed: upscaled to ≥1400px, grayscale +
     contrast stretch — the two cheapest OCR accuracy wins
   · the photo never leaves the browser: OCR runs in a local
     web worker (this is the privacy claim, keep it true)
   · every failure mode resolves to a typed error the UI turns
     into "paste the list instead" guidance
   ============================================================ */

export class OcrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OcrError";
  }
}

/** grayscale + 2%–98% percentile contrast stretch */
function preprocess(source: HTMLCanvasElement): HTMLCanvasElement {
  const MIN_W = 1400;
  const scale = Math.max(1, MIN_W / Math.max(1, source.width));
  const w = Math.min(2400, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * (w / source.width)));
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    const g = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
    data[i] = data[i + 1] = data[i + 2] = g;
    hist[Math.min(255, Math.round(g))]++;
  }
  const total = w * h;
  const pct = (p: number) => {
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= total * p) return v;
    }
    return 255;
  };
  const lo = pct(0.02);
  const hi = Math.max(lo + 1, pct(0.98));
  const range = hi - lo;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.max(0, Math.min(255, Math.round(((data[i] - lo) / range) * 255)));
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

export interface OcrProgress {
  phase: "loading" | "reading";
  progress: number; // 0..1
}

/** run OCR on an image file → raw text. Throws OcrError on any failure. */
export async function ocrFile(file: File, onProgress?: (p: OcrProgress) => void): Promise<string> {
  if (!file.type.startsWith("image/")) throw new OcrError("That file isn't an image — try a photo of the label ✦");

  /* decode + draw to canvas */
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new OcrError("Couldn't read that photo — try another ✦"));
      el.src = url;
    });
    const base = document.createElement("canvas");
    base.width = Math.max(1, img.naturalWidth);
    base.height = Math.max(1, img.naturalHeight);
    base.getContext("2d", { willReadFrequently: true })!.drawImage(img, 0, 0);

    const canvas = preprocess(base);
    onProgress?.({ phase: "loading", progress: 0 });

    /* lazy-load the engine — first use pulls worker + eng model from CDN */
    let worker: Awaited<ReturnType<typeof import("tesseract.js").createWorker>>;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng", 1, {
        logger: (m: { status?: string; progress?: number }) => {
          if (m?.status === "recognizing text") {
            onProgress?.({ phase: "reading", progress: Math.min(1, Math.max(0, m.progress ?? 0)) });
          } else if (m?.status) {
            onProgress?.({ phase: "loading", progress: Math.min(0.95, Math.max(0, m.progress ?? 0)) });
          }
        },
      });
    } catch {
      throw new OcrError("The OCR engine couldn't load (offline first time?) — paste the list instead ✦");
    }

    try {
      const { data } = await worker.recognize(canvas);
      return (data?.text ?? "").trim();
    } finally {
      worker.terminate().catch(() => undefined);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}
