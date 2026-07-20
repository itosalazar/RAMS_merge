/**
 * Persistent meta state — the Archive, records, achievements, settings.
 * Versioned localStorage persistence (GDD §14). No currency. Nothing expires.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS } from "../data/achievements";
import type { GameMode } from "../engine/modes";

export interface Settings {
  sound: boolean;
  music: boolean;
  haptics: boolean;
  theme: "light" | "night";
}

export interface Records {
  classicHighScore: number;
  classicLargestTier: number;
  timeAttackBestS: Record<number, number>; // per target tier
  speedMergeLongestS: number;
  speedMergeMostMerges: number;
  shrinkingMostTargets: number;
  highestCombo: number;
}

interface MetaState {
  settings: Settings;
  records: Records;
  stats: {
    totalMerges: number;
    totalLaunches: number;
    playTimeS: number;
    runs: number;
    perTierCreated: Record<number, number>;
  };
  archive: {
    discovered: number[]; // tiers
    principlesSeen: number[];
    achievements: string[];
    triviaUnlocked: string[];
  };
  daily: { completedDates: string[] };

  // actions
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  discover: (tier: number) => void;
  seePrinciple: (n: number) => void;
  award: (id: string) => boolean;
  bumpTierCount: (tier: number) => void;
  addMerges: (n: number) => void;
  addLaunch: () => void;
  addPlayTime: (s: number) => void;
  addRun: () => void;
  recordCombo: (chain: number) => void;
  recordClassic: (score: number, largestTier: number) => { newHighScore: boolean };
  recordTimeAttack: (target: number, seconds: number) => { newBest: boolean };
  recordSpeedMerge: (seconds: number, merges: number) => { newBest: boolean };
  recordShrinking: (targets: number) => { newBest: boolean };
  completeDaily: (date: string) => void;
  resetAll: () => void;
}

const initialRecords: Records = {
  classicHighScore: 0,
  classicLargestTier: 0,
  timeAttackBestS: {},
  speedMergeLongestS: 0,
  speedMergeMostMerges: 0,
  shrinkingMostTargets: 0,
  highestCombo: 0,
};

const initial = {
  settings: { sound: true, music: true, haptics: true, theme: "light" as const },
  records: initialRecords,
  stats: { totalMerges: 0, totalLaunches: 0, playTimeS: 0, runs: 0, perTierCreated: {} as Record<number, number> },
  archive: { discovered: [] as number[], principlesSeen: [] as number[], achievements: [] as string[], triviaUnlocked: [] as string[] },
  daily: { completedDates: [] as string[] },
};

export const useMeta = create<MetaState>()(
  persist(
    (set, get) => ({
      ...initial,

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      discover: (tier) =>
        set((s) =>
          s.archive.discovered.includes(tier)
            ? s
            : { archive: { ...s.archive, discovered: [...s.archive.discovered, tier].sort((a, b) => a - b) } }
        ),

      seePrinciple: (n) =>
        set((s) =>
          s.archive.principlesSeen.includes(n)
            ? s
            : { archive: { ...s.archive, principlesSeen: [...s.archive.principlesSeen, n] } }
        ),

      award: (id) => {
        const s = get();
        if (s.archive.achievements.includes(id)) return false;
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        set({
          archive: {
            ...s.archive,
            achievements: [...s.archive.achievements, id],
            triviaUnlocked: a
              ? [...new Set([...s.archive.triviaUnlocked, ...a.trivia])]
              : s.archive.triviaUnlocked,
          },
        });
        return true;
      },

      bumpTierCount: (tier) =>
        set((s) => {
          const per = s.stats.perTierCreated ?? {};
          return {
            stats: { ...s.stats, perTierCreated: { ...per, [tier]: (per[tier] ?? 0) + 1 } },
          };
        }),

      addMerges: (n) => set((s) => ({ stats: { ...s.stats, totalMerges: s.stats.totalMerges + n } })),
      addLaunch: () => set((s) => ({ stats: { ...s.stats, totalLaunches: s.stats.totalLaunches + 1 } })),
      addPlayTime: (sec) => set((s) => ({ stats: { ...s.stats, playTimeS: s.stats.playTimeS + sec } })),
      addRun: () => set((s) => ({ stats: { ...s.stats, runs: s.stats.runs + 1 } })),

      recordCombo: (chain) =>
        set((s) => ({ records: { ...s.records, highestCombo: Math.max(s.records.highestCombo, chain) } })),

      recordClassic: (score, largestTier) => {
        const s = get();
        const newHighScore = score > s.records.classicHighScore;
        set({
          records: {
            ...s.records,
            classicHighScore: Math.max(s.records.classicHighScore, score),
            classicLargestTier: Math.max(s.records.classicLargestTier, largestTier),
          },
        });
        return { newHighScore };
      },

      recordTimeAttack: (target, seconds) => {
        const s = get();
        const prev = s.records.timeAttackBestS[target];
        const newBest = prev === undefined || seconds < prev;
        if (newBest)
          set({
            records: { ...s.records, timeAttackBestS: { ...s.records.timeAttackBestS, [target]: seconds } },
          });
        return { newBest };
      },

      recordSpeedMerge: (seconds, merges) => {
        const s = get();
        const newBest = seconds > s.records.speedMergeLongestS;
        set({
          records: {
            ...s.records,
            speedMergeLongestS: Math.max(s.records.speedMergeLongestS, seconds),
            speedMergeMostMerges: Math.max(s.records.speedMergeMostMerges, merges),
          },
        });
        return { newBest };
      },

      recordShrinking: (targets) => {
        const s = get();
        const newBest = targets > s.records.shrinkingMostTargets;
        set({ records: { ...s.records, shrinkingMostTargets: Math.max(s.records.shrinkingMostTargets, targets) } });
        return { newBest };
      },

      completeDaily: (date) =>
        set((s) =>
          s.daily.completedDates.includes(date)
            ? s
            : { daily: { completedDates: [...s.daily.completedDates, date] } }
        ),

      resetAll: () => set(initial),
    }),
    {
      name: "rams-merge-v1",
      version: 1,
      // deep-merge persisted state over defaults so a store written by an
      // older build (missing a nested field) never drops sub-objects and
      // crashes an updater — zustand's default merge is shallow.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MetaState>;
        return {
          ...current,
          settings: { ...current.settings, ...p.settings },
          records: { ...current.records, ...p.records },
          stats: { ...current.stats, ...p.stats },
          archive: { ...current.archive, ...p.archive },
          daily: { ...current.daily, ...p.daily },
        };
      },
    }
  )
);

export type { GameMode };
