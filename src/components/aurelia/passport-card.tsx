"use client";

/* ============================================================
   AURELIA — Beauty Passport card (Home)
   Export/import the zero-party profile as a portable JSON file.
   ============================================================ */

import { useRef, useState } from "react";
import { useAurelia } from "@/lib/store";
import { seasonById } from "@/data/seasons";
import { shareText } from "@/lib/share";
import { downloadPassport, importPassport, passportToText, buildPassport } from "@/lib/passport";
import { Card, Chip } from "./bits";
import { ShareIcon, ArrowDownIcon, ArrowUpIcon } from "./icons";

export function PassportCard() {
  const { profile, seasonResult, skinResult, journal, showToast } = useAurelia();
  const inputRef = useRef<HTMLInputElement>(null);
  const season = seasonResult ? seasonById(seasonResult.id) : null;
  const [busy, setBusy] = useState(false);

  const exportShare = async () => {
    const text = passportToText(buildPassport());
    const res = await shareText({ title: "My Aurelia Beauty Passport", text });
    if (res === "copied") showToast("Passport copied — share it anywhere ✦");
  };

  const onImport = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    const result = await importPassport(file);
    setBusy(false);
    showToast(result ?? "That file isn't an Aurelia passport ✦");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center w-9 h-9 rounded-[12px] shrink-0" style={{ background: "var(--gold)", color: "white" }}>
          <ArrowDownIcon width={17} height={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[17px] leading-tight" style={{ color: "var(--ink)" }}>
            Beauty Passport
          </p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-3)" }}>
            Your profile is yours — export it, move devices, import it back
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3.5">
        {season && <Chip color="var(--gold)">{season.name}</Chip>}
        {(skinResult?.base ?? profile?.skinType) && <Chip soft>{(skinResult?.base ?? profile?.skinType)?.replace("-", " ")} skin</Chip>}
        {profile?.vibe && <Chip soft>{profile.vibe} vibe</Chip>}
        {journal.length > 0 && <Chip soft>skin journal · {journal.length}</Chip>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Import an Aurelia passport file"
        onChange={(e) => onImport(e.target.files?.[0])}
      />

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          onClick={() => {
            const ok = downloadPassport();
            showToast(ok ? "Passport saved ✦" : "Couldn't save the file ✦");
          }}
          className="tap-target press h-10 rounded-full border text-[12.5px] font-bold flex items-center justify-center gap-1.5"
          style={{ borderColor: "var(--line)", color: "var(--ink-2)", background: "var(--surface)" }}
        >
          <ArrowDownIcon width={14} height={14} /> Save
        </button>
        <button
          onClick={exportShare}
          className="tap-target press h-10 rounded-full border text-[12.5px] font-bold flex items-center justify-center gap-1.5"
          style={{ borderColor: "var(--line)", color: "var(--ink-2)", background: "var(--surface)" }}
        >
          <ShareIcon width={14} height={14} /> Share
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="tap-target press h-10 rounded-full text-[12.5px] font-bold flex items-center justify-center gap-1.5"
          style={{ background: "var(--rose)", color: "var(--rose-foreground)" }}
        >
          <ArrowUpIcon width={14} height={14} /> Import
        </button>
      </div>
      <p className="text-[10.5px] leading-[15px] mt-2.5" style={{ color: "var(--ink-3)" }}>
        A tiny JSON file — season, skin type, vibe, journal summary. No account, no cloud: it lives only on your devices.
      </p>
    </Card>
  );
}
