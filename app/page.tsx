"use client";

/**
 * Main menu — the logo, the mode tuner, one orange key (GDD §8/§12).
 * Modes feel like stations on a tuning scale.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/src/components/ui/Logo";
import { PushKey } from "@/src/components/ui/PushKey";
import { TabRail } from "@/src/components/ui/TabRail";
import { MODES } from "@/src/engine/modes";
import { useMeta } from "@/src/state/meta";
import { audio } from "@/src/audio/AudioEngine";
import { PRODUCTS } from "@/src/data/products";

export default function Home() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const discovered = useMeta((s) => s.archive.discovered);
  const highScore = useMeta((s) => s.records.classicHighScore);
  const mode = MODES[idx];

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto w-full">
      <main className="flex-1 flex flex-col px-6" style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}>
        <Logo size={56} />

        {highScore > 0 && (
          <p className="mt-3 text-[11px] tracking-[0.1em] font-medium text-graphite/70">
            BEST <span className="dot-matrix text-ink">{highScore.toLocaleString("en-US")}</span>
            {" · "}
            {discovered.length} OF {PRODUCTS.length} OBJECTS
          </p>
        )}

        {/* mode tuner */}
        <section className="mt-12" aria-label="game mode">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-3">MODE</p>

          {/* tuning scale */}
          <div className="relative bg-bench border border-case rounded-lg px-4 py-3 shadow-contact">
            <div className="relative h-6">
              {/* scale ticks */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between">
                {MODES.map((m, i) => (
                  <button
                    key={m.id}
                    aria-label={m.title}
                    onClick={() => {
                      setIdx(i);
                      audio.unlock();
                      audio.ui("tick");
                    }}
                    className="w-10 h-8 flex items-center justify-center"
                  >
                    <span className={`block w-px h-4 ${i === idx ? "bg-transparent" : "bg-graphite/50"}`} />
                  </button>
                ))}
              </div>
              {/* the needle — aligned to tick centers (buttons are w-10) */}
              <motion.div
                className="absolute top-0 h-6 w-0.5 bg-orange -translate-x-1/2"
                animate={{ left: `calc(20px + ${(idx / (MODES.length - 1)) * 100} * (100% - 40px) / 100)` }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            </div>
            <div className="mt-3 h-14">
              <h1 className="text-[28px] font-bold tracking-tight leading-none text-ink">{mode.title}</h1>
              <p className="text-sm text-graphite mt-1.5">{mode.caption}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <PushKey
              variant="ghost"
              className="!min-h-12 !px-4"
              onClick={() => setIdx((i) => (i - 1 + MODES.length) % MODES.length)}
            >
              ◀
            </PushKey>
            <PushKey variant="primary" className="flex-1" onClick={() => router.push(`/play/${mode.id}`)}>
              Begin
            </PushKey>
            <PushKey
              variant="ghost"
              className="!min-h-12 !px-4"
              onClick={() => setIdx((i) => (i + 1) % MODES.length)}
            >
              ▶
            </PushKey>
          </div>
        </section>

        <p className="mt-auto pb-6 text-[11px] text-graphite/50 leading-relaxed">
          Weniger, aber besser.
        </p>
      </main>
      <TabRail />
    </div>
  );
}
