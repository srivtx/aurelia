"use client";

/* ============================================================
   AURELIA — Beauty Passport (portable zero-party profile)
   The user's profile is HER data: season + signal result, skin
   type, vibe, saved items. Export it as a single small JSON
   file (share it, back it up, move devices) and import it back
   — no account, no cloud, no tracking. Optionally the user's
   AI agent can read it via the WebMCP get_season tool (name +
   palette only, never the raw store).
   ============================================================ */

import { useAurelia } from "./store";
import { seasonById } from "@/data/seasons";
import { journalTrends, JOURNAL_ZONES } from "./skin-journal";

export interface Passport {
  aurelia_passport: 1;
  exported: string; // ISO date
  profile: { name: string | null; skinType: string | null; vibe: string | null };
  season: { id: string; name: string; tagline: string } | null;
  skin: { type: string | null; sensitive: boolean };
  journal: { entries: number; weeks: number; latestDate: string | null; latestCheekRedness: number | null } | null;
  savedCount: number;
  streak: number;
}

export function buildPassport(): Passport {
  const s = useAurelia.getState();
  const season = s.seasonResult ? seasonById(s.seasonResult.id) : null;
  const trends = journalTrends(s.journal);
  const latest = s.journal.find((e) => e.date === trends.latestDate) ?? null;
  const cheeks = JOURNAL_ZONES.filter((z) => z === "cheekL" || z === "cheekR")
    .map((z) => latest?.zones[z])
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  return {
    aurelia_passport: 1,
    exported: new Date().toISOString().slice(0, 10),
    profile: s.profile ? { name: s.profile.name ?? null, skinType: s.profile.skinType ?? null, vibe: s.profile.vibe ?? null } : { name: null, skinType: null, vibe: null },
    season: season ? { id: season.id, name: season.name, tagline: season.tagline } : null,
    skin: { type: s.skinResult?.base ?? s.profile?.skinType ?? null, sensitive: s.skinResult?.sensitiveOverlay ?? false },
    journal: s.journal.length
      ? {
          entries: trends.entries,
          weeks: trends.weeks,
          latestDate: trends.latestDate,
          latestCheekRedness: cheeks.length
            ? Math.round((cheeks.reduce((sum, m) => sum + m.a, 0) / cheeks.length) * 10) / 10
            : null,
        }
      : null,
    savedCount: s.saved.length,
    streak: s.streak?.count ?? 0,
  };
}

export function passportFilename(): string {
  const s = useAurelia.getState();
  const name = s.profile?.name ? `-${s.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "";
  return `aurelia-passport${name}.json`;
}

export function passportToText(p: Passport): string {
  const bits = [
    p.season ? `Season: ${p.season.name}` : null,
    p.skin.type ? `Skin: ${p.skin.type}${p.skin.sensitive ? " (sensitive)" : ""}` : null,
    p.profile.vibe ? `Vibe: ${p.profile.vibe}` : null,
    p.journal ? `Skin Journal: ${p.journal.entries} entries over ${Math.round(p.journal.weeks)} weeks` : null,
    `${p.savedCount} saved looks · ${p.streak}-day streak`,
  ].filter(Boolean);
  return `My Aurelia Beauty Passport ✦ ${bits.join(" · ")} — from the Aurelia app.`;
}

/* download the passport as a JSON file (client only) */
export function downloadPassport(): boolean {
  try {
    const blob = new Blob([JSON.stringify(buildPassport(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = passportFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    return true;
  } catch {
    return false;
  }
}

/* import a passport file → apply to the store. Returns a human
   summary, or null when the file isn't a passport. */
export function importPassport(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result)) as Partial<Passport>;
        if (raw?.aurelia_passport !== 1) {
          resolve(null);
          return;
        }
        const s = useAurelia.getState();
        const applied: string[] = [];

        const profile = raw.profile;
        if (profile && (profile.name || profile.skinType || profile.vibe)) {
          s.setProfile({
            name: typeof profile.name === "string" ? profile.name.slice(0, 24) : (s.profile?.name ?? ""),
            skinType: typeof profile.skinType === "string" ? profile.skinType : (s.profile?.skinType ?? null),
            vibe: typeof profile.vibe === "string" ? profile.vibe : (s.profile?.vibe ?? null),
          });
          if (profile.name) applied.push(`name ${profile.name}`);
        }

        if (raw.season?.id && seasonById(raw.season.id)) {
          s.setSeasonResult({ id: raw.season.id, taken: new Date().toISOString().slice(0, 10) });
          applied.push(`season ${raw.season.name ?? raw.season.id}`);
        }

        const skin = raw.skin;
        if (skin?.type) {
          s.setSkinResult({ base: skin.type, sensitiveOverlay: Boolean(skin.sensitive) });
          applied.push(`skin ${skin.type}${skin.sensitive ? " (sensitive)" : ""}`);
        }

        resolve(applied.length ? `Imported: ${applied.join(", ")}` : "Passport read — nothing new to apply");
      } catch {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
}
