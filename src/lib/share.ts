"use client";

/* ============================================================
   AURELIA — share utilities
   Web Share API (files where supported) → text share → clipboard
   + canvas share-cards (brand gradient + swatches)
   ============================================================ */

export interface ShareOpts {
  title: string;
  text: string;
}

export async function shareText(opts: ShareOpts): Promise<"shared" | "copied" | "failed"> {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const data = { title: opts.title, text: opts.text, url };
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(data);
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${opts.text}\n\n${url}`);
      return "copied";
    }
  } catch {
    /* user cancelled or blocked — fall through to manual copy */
  }
  try {
    await navigator.clipboard.writeText(`${opts.text}\n\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

/* ---------- canvas share card ---------- */

export interface CardOpts {
  eyebrow: string;
  title: string;
  subtitle?: string;
  swatches?: string[]; // hexes
  footer?: string;
}

export function makeShareCard(o: CardOpts): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  /* background: cream + soft rose/terracotta wash */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#FAF7F3");
  bg.addColorStop(0.55, "#F7ECE7");
  bg.addColorStop(1, "#F2E3D9");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* decorative circles */
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#A84A62";
  ctx.beginPath();
  ctx.arc(940, 190, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C97B58";
  ctx.beginPath();
  ctx.arc(120, 1180, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  /* brand mark */
  ctx.fillStyle = "#A84A62";
  ctx.beginPath();
  ctx.arc(96, 132, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 52px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", 96, 136);

  ctx.textAlign = "left";
  ctx.fillStyle = "#2d2320";
  ctx.font = "italic 600 64px Georgia, serif";
  ctx.fillText("Aurelia", 170, 135);
  ctx.fillStyle = "#9c8f85";
  ctx.font = "600 30px Georgia, serif";
  ctx.fillText("your pocket beauty editor", 172, 190);

  /* eyebrow */
  const ey = 560;
  ctx.fillStyle = "#A84A62";
  ctx.font = "700 34px Georgia, serif";
  ctx.fillText(o.eyebrow.toUpperCase(), 96, ey);

  /* title — naive word wrap */
  ctx.fillStyle = "#2d2320";
  ctx.font = "600 84px Georgia, serif";
  const maxWidth = W - 192;
  const words = o.title.split(" ");
  let line = "";
  let ty = ey + 110;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, 96, ty);
      line = w;
      ty += 104;
    } else line = test;
  }
  ctx.fillText(line, 96, ty);
  ty += 90;

  /* subtitle */
  if (o.subtitle) {
    ctx.fillStyle = "#5a4e46";
    ctx.font = "400 44px Georgia, serif";
    const subWords = o.subtitle.split(" ");
    let sline = "";
    for (const w of subWords) {
      const test = sline ? `${sline} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && sline) {
        ctx.fillText(sline, 96, ty);
        sline = w;
        ty += 58;
      } else sline = test;
    }
    ctx.fillText(sline, 96, ty);
    ty += 60;
  }

  /* swatches */
  if (o.swatches?.length) {
    const n = o.swatches.length;
    const size = Math.min(150, Math.floor((maxWidth - (n - 1) * 28) / n));
    let sx = 96;
    const sy = Math.max(ty + 40, 860);
    for (const hex of o.swatches) {
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.arc(sx + size / 2, sy + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(45,35,32,0.14)";
      ctx.lineWidth = 3;
      ctx.stroke();
      sx += size + 28;
    }
    ty = sy + size + 90;
  }

  /* footer watermark */
  ctx.fillStyle = "#9c8f85";
  ctx.font = "italic 400 38px Georgia, serif";
  ctx.fillText(o.footer ?? "aurelia · style & beauty tips", 96, Math.min(ty + 60, H - 120));

  return canvas;
}

export async function shareCard(o: CardOpts & { text: string }): Promise<"shared" | "copied" | "failed"> {
  const canvas = makeShareCard(o);
  try {
    const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
    if (blob && typeof navigator !== "undefined" && navigator.canShare) {
      const file = new File([blob], "aurelia.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: o.title, text: o.text });
        return "shared";
      }
    }
  } catch {
    /* cancelled or unsupported — fall back to text */
  }
  return shareText({ title: o.title, text: o.text });
}
