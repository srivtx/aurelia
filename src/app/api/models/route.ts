/* ============================================================
   AURELIA — /api/models (server-side)
   Lists available AI providers + their models with live
   discovery (cached 10 min) and configuration status.
   Keys themselves are never returned — only env var NAMES.
   ============================================================ */

import { NextResponse } from "next/server";
import { providerStatus } from "@/lib/ai-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providers = await providerStatus();
    return NextResponse.json(
      {
        providers: providers.map((p) => ({
          id: p.id,
          label: p.label,
          blurb: p.blurb,
          configured: p.configured,
          live: p.live,
          freeNote: p.freeNote,
          keyEnv: p.keyEnv || null,
          keyUrl: p.keyUrl || null,
          models: p.models,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[/api/models]", err);
    return NextResponse.json({ providers: [], error: "Could not list models" }, { status: 500 });
  }
}
