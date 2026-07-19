"use client";

/** Records — personal bests and workshop statistics (GDD §13). */

import { TabRail } from "@/src/components/ui/TabRail";
import { useMeta } from "@/src/state/meta";
import { productForTier } from "@/src/data/products";

function fmtTime(s: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-board border border-case rounded-lg p-4 shadow-contact">
      <p className="text-[10px] font-medium tracking-[0.12em] text-graphite/70">{label}</p>
      <p className="dot-matrix text-xl text-ink mt-1.5 leading-none">{value}</p>
    </div>
  );
}

export default function RecordsPage() {
  const records = useMeta((s) => s.records);
  const stats = useMeta((s) => s.stats);
  const daily = useMeta((s) => s.daily);

  const bestTimeAttack = Object.entries(records.timeAttackBestS).sort((a, b) => a[1] - b[1])[0];

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto w-full">
      <main className="flex-1 px-6 pb-8" style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}>
        <h1 className="text-[32px] font-bold tracking-tight leading-tight">RECORDS</h1>
        <p className="text-sm text-graphite mt-1">Personal bests. All-time. Honest.</p>

        <section className="mt-8">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-3">BESTS</p>
          <div className="grid grid-cols-2 gap-2">
            <Cell label="CLASSIC · SCORE" value={records.classicHighScore ? records.classicHighScore.toLocaleString("en-US") : "—"} />
            <Cell
              label="LARGEST PRODUCT"
              value={records.classicLargestTier ? productForTier(records.classicLargestTier).model : "—"}
            />
            <Cell
              label="TIME ATTACK"
              value={bestTimeAttack ? `${fmtTime(bestTimeAttack[1])} · ${productForTier(Number(bestTimeAttack[0])).model}` : "—"}
            />
            <Cell label="SPEED MERGE" value={fmtTime(records.speedMergeLongestS)} />
            <Cell label="SHRINKING · TARGETS" value={records.shrinkingMostTargets ? String(records.shrinkingMostTargets) : "—"} />
            <Cell label="HIGHEST COMBO" value={records.highestCombo > 1 ? `×${records.highestCombo}` : "—"} />
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-3">WORKSHOP STATISTICS</p>
          <div className="grid grid-cols-2 gap-2">
            <Cell label="TOTAL MERGES" value={stats.totalMerges.toLocaleString("en-US")} />
            <Cell label="PRODUCTS LAUNCHED" value={stats.totalLaunches.toLocaleString("en-US")} />
            <Cell label="TIME AT THE BOARD" value={fmtTime(stats.playTimeS)} />
            <Cell label="SESSIONS" value={String(stats.runs)} />
            <Cell label="DAILY CHALLENGES" value={String(daily.completedDates.length)} />
            <Cell
              label="MOST PRODUCED"
              value={(() => {
                const top = Object.entries(stats.perTierCreated).sort((a, b) => b[1] - a[1])[0];
                return top ? productForTier(Number(top[0])).model : "—";
              })()}
            />
          </div>
        </section>
      </main>
      <TabRail />
    </div>
  );
}
