"use client";

/**
 * The Archive — a museum you build by playing (GDD §13).
 * Museum cards, the exhibition wall, the Ten Principles, design trivia.
 * Knowledge, not currency.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabRail } from "@/src/components/ui/TabRail";
import { ProductThumb } from "@/src/components/game/ProductThumb";
import { PRODUCTS, productForTier } from "@/src/data/products";
import { PRINCIPLES } from "@/src/data/principles";
import { TRIVIA } from "@/src/data/trivia";
import { ACHIEVEMENTS } from "@/src/data/achievements";
import { useMeta } from "@/src/state/meta";

export default function ArchivePage() {
  const discovered = useMeta((s) => s.archive.discovered);
  const principlesSeen = useMeta((s) => s.archive.principlesSeen);
  const triviaUnlocked = useMeta((s) => s.archive.triviaUnlocked);
  const achievements = useMeta((s) => s.archive.achievements);
  const perTier = useMeta((s) => s.stats.perTierCreated);
  const [open, setOpen] = useState<number | null>(null);

  const totalItems = PRODUCTS.length + PRINCIPLES.length + TRIVIA.length;
  const haveItems = discovered.length + principlesSeen.length + triviaUnlocked.length;

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto w-full">
      <main className="flex-1 px-6 pb-8" style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}>
        <h1 className="text-[32px] font-bold tracking-tight leading-tight">ARCHIVE</h1>
        <p className="text-sm text-graphite mt-1">
          {haveItems} of {totalItems} items. The collection grows by use.
        </p>

        {/* the exhibition wall */}
        <section className="mt-8 -mx-6">
          <div className="bg-ink px-6 py-8">
            <p className="text-[11px] font-medium tracking-[0.14em] text-paper/50 mb-6">THE EXHIBITION</p>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
              {PRODUCTS.map((p) => {
                const has = discovered.includes(p.tier);
                return (
                  <button
                    key={p.tier}
                    onClick={() => has && setOpen(p.tier)}
                    className="flex flex-col items-center shrink-0"
                    disabled={!has}
                  >
                    <div
                      className={`w-24 h-24 rounded-lg flex items-center justify-center ${
                        has ? "bg-paper shadow-raised" : "bg-paper/5 border border-paper/10"
                      }`}
                    >
                      {has ? (
                        <ProductThumb tier={p.tier} size={78} />
                      ) : (
                        <span className="dot-matrix text-paper/25 text-lg">?</span>
                      )}
                    </div>
                    <p className={`mt-2 text-[10px] tracking-[0.1em] ${has ? "text-paper/80" : "text-paper/30"}`}>
                      {has ? `${p.model} · ${p.year}` : p.model}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* principles */}
        <section className="mt-10">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-4">
            TEN PRINCIPLES · {principlesSeen.length}/10
          </p>
          <div className="space-y-2">
            {PRINCIPLES.map((p) => {
              const has = principlesSeen.includes(p.n);
              return (
                <div key={p.n} className={`rounded-lg border p-4 ${has ? "border-case bg-bench shadow-contact" : "border-case/50"}`}>
                  <p className={`text-sm font-semibold ${has ? "text-ink" : "text-graphite/40"}`}>
                    {p.n.toString().padStart(2, "0")} — {has ? p.text : "· · ·"}
                  </p>
                  {has && <p className="selectable text-[13px] text-graphite mt-2 leading-relaxed">{p.commentary}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* achievements */}
        <section className="mt-10">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-4">
            CATALOGUE · {achievements.length}/{ACHIEVEMENTS.length}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const has = achievements.includes(a.id);
              return (
                <div key={a.id} className={`rounded-lg border p-3 ${has ? "border-case bg-bench shadow-contact" : "border-case/50"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${has ? "bg-olive" : "bg-case"}`} />
                    <p className={`text-[13px] font-semibold ${has ? "text-ink" : "text-graphite/40"}`}>{a.name}</p>
                  </div>
                  <p className={`text-[11px] mt-1 ${has ? "text-graphite" : "text-graphite/40"}`}>{a.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* trivia */}
        <section className="mt-10">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-4">
            DESIGN NOTES · {triviaUnlocked.length}/{TRIVIA.length}
          </p>
          <div className="space-y-2">
            {TRIVIA.filter((t) => triviaUnlocked.includes(t.id)).map((t) => (
              <div key={t.id} className="rounded-lg border border-case bg-bench p-4 shadow-contact">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                <p className="selectable text-[13px] text-graphite mt-1.5 leading-relaxed">{t.text}</p>
              </div>
            ))}
            {triviaUnlocked.length === 0 && (
              <p className="text-[13px] text-graphite/50 leading-relaxed">
                Catalogue entries unlock design notes — small, true stories from the history of industrial design.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* museum card sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] flex items-end"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="w-full max-w-md mx-auto bg-paper rounded-t-3xl p-6 pb-12"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const p = productForTier(open);
                const made = perTier[open] ?? 0;
                return (
                  <>
                    <div className="w-8 h-1 rounded-full bg-case mx-auto mb-6" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.12em] text-orange">{p.year}</p>
                        <h2 className="text-2xl font-bold tracking-tight mt-0.5">
                          {p.model} <span className="font-medium italic">{p.name}</span>
                        </h2>
                        <p className="text-sm text-graphite">{p.object}</p>
                      </div>
                      <div className="bg-bench border border-case rounded-lg p-2 shadow-contact">
                        <ProductThumb tier={p.tier} size={72} />
                      </div>
                    </div>
                    <p className="selectable text-[15px] text-ink/90 leading-relaxed mt-5">{p.rationale}</p>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {p.materials.split(", ").map((m) => (
                        <span key={m} className="text-[11px] font-medium text-graphite border border-case rounded px-2 py-1">
                          {m}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-graphite/60 mt-5">
                      Principle {p.principle}: {PRINCIPLES[p.principle - 1].text}
                      {made > 0 && <> · Created {made}×</>}
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TabRail />
    </div>
  );
}
