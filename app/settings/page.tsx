"use client";

/** Settings — a Braun control panel: slide switches, one danger key. */

import { useState } from "react";
import { TabRail } from "@/src/components/ui/TabRail";
import { PushKey } from "@/src/components/ui/PushKey";
import { useMeta } from "@/src/state/meta";
import { audio } from "@/src/audio/AudioEngine";
import { haptic } from "@/src/lib/haptics";

function SlideSwitch({
  label,
  caption,
  value,
  onChange,
}: {
  label: string;
  caption: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className="w-full flex items-center justify-between bg-board border border-case rounded-lg p-4 shadow-contact min-h-16"
      onClick={() => {
        audio.unlock();
        audio.ui("switch");
        haptic.ui();
        onChange(!value);
      }}
      role="switch"
      aria-checked={value}
    >
      <span className="text-left">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-[11px] text-graphite mt-0.5">{caption}</span>
      </span>
      {/* the switch: travels with a snap, never a fade */}
      <span className={`relative w-12 h-6 rounded-full border ${value ? "border-orange/50 bg-orange/15" : "border-case bg-paper"}`}>
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-[left] duration-100 ${
            value ? "left-6 bg-orange" : "left-0.5 bg-case"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const settings = useMeta((s) => s.settings);
  const setSetting = useMeta((s) => s.setSetting);
  const resetAll = useMeta((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto w-full">
      <main className="flex-1 px-6 pb-8" style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}>
        <h1 className="text-[32px] font-bold tracking-tight leading-tight">SETTINGS</h1>
        <p className="text-sm text-graphite mt-1">As few as possible.</p>

        <div className="mt-8 space-y-2">
          <SlideSwitch
            label="Sound"
            caption="Impacts, snaps, clicks"
            value={settings.sound}
            onChange={(v) => {
              setSetting("sound", v);
              audio.setSfx(v);
            }}
          />
          <SlideSwitch
            label="Music"
            caption="Electronic piano, slow jazz"
            value={settings.music}
            onChange={(v) => {
              setSetting("music", v);
              audio.setMusic(v);
            }}
          />
          <SlideSwitch
            label="Haptics"
            caption="Micro-pulses on impact and merge"
            value={settings.haptics}
            onChange={(v) => setSetting("haptics", v)}
          />
          <SlideSwitch
            label="Night Shift"
            caption="The board after hours"
            value={settings.theme === "night"}
            onChange={(v) => setSetting("theme", v ? "night" : "light")}
          />
        </div>

        <section className="mt-10">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-3">DATA</p>
          {!confirmReset ? (
            <PushKey variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
              Reset everything
            </PushKey>
          ) : (
            <div className="border border-signal/40 rounded-lg p-4">
              <p className="text-sm text-ink mb-4">
                This erases the archive, records and statistics. There is no undo — the museum burns.
              </p>
              <div className="flex gap-2">
                <PushKey
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                  }}
                >
                  Erase
                </PushKey>
                <PushKey variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>
                  Keep
                </PushKey>
              </div>
            </div>
          )}
        </section>

        <p className="mt-12 text-[11px] text-graphite/50 leading-relaxed selectable">
          RAMS MERGE v1.0 — a quiet celebration of industrial design.
          <br />
          Everything is stored on this device. No accounts, no tracking, nothing expires.
        </p>
      </main>
      <TabRail />
    </div>
  );
}
