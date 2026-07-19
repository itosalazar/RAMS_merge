import { describe, expect, it } from "vitest";
import { mulberry32, dailySeed } from "../src/engine/rng";
import { PRODUCTS, MAX_TIER, footprintArea, footprintRadius, productForTier } from "../src/data/products";
import {
  COMBO_MULT,
  SCORE_FOR_MERGE,
  RESTITUTION,
  FRICTION_AIR,
  SPAWN_WEIGHTS,
  DENSITY_BASE,
  DENSITY_GROWTH,
  TABLE_W,
} from "../src/lib/constants";
import { PRINCIPLES } from "../src/data/principles";
import { ACHIEVEMENTS } from "../src/data/achievements";
import { TRIVIA, triviaById } from "../src/data/trivia";

describe("rng", () => {
  it("is deterministic for equal seeds (fair daily leaderboards)", () => {
    const a = mulberry32(20260718);
    const b = mulberry32(20260718);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it("produces values in [0,1)", () => {
    const r = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("derives a stable seed per calendar day", () => {
    expect(dailySeed(new Date(2026, 6, 18))).toBe(20260718);
  });
});

describe("the evolution tree", () => {
  it("has exactly eleven tiers, 1..11, in order", () => {
    expect(PRODUCTS).toHaveLength(11);
    expect(MAX_TIER).toBe(11);
    PRODUCTS.forEach((p, i) => expect(p.tier).toBe(i + 1));
  });

  it("grows strictly in footprint area — every evolution is believable", () => {
    for (let t = 2; t <= MAX_TIER; t++) {
      expect(footprintArea(productForTier(t).footprint)).toBeGreaterThan(
        footprintArea(productForTier(t - 1).footprint)
      );
    }
  });

  it("grows strictly in years — the series moves forward in time", () => {
    for (let t = 2; t <= MAX_TIER; t++) {
      expect(productForTier(t).year).toBeGreaterThan(productForTier(t - 1).year);
    }
  });

  it("every product fits the table", () => {
    for (const p of PRODUCTS) expect(footprintRadius(p.footprint) * 2).toBeLessThanOrEqual(TABLE_W);
  });

  it("every product carries museum content", () => {
    for (const p of PRODUCTS) {
      expect(p.rationale.length).toBeGreaterThan(80);
      expect(p.principle).toBeGreaterThanOrEqual(1);
      expect(p.principle).toBeLessThanOrEqual(10);
      expect(p.materials.length).toBeGreaterThan(0);
    }
  });
});

describe("physics tuning", () => {
  it("large products are heavier (density growth)", () => {
    const mass = (t: number) =>
      footprintArea(productForTier(t).footprint) * DENSITY_BASE * Math.pow(DENSITY_GROWTH, t);
    for (let t = 2; t <= MAX_TIER; t++) expect(mass(t)).toBeGreaterThan(mass(t - 1));
  });

  it("large products bounce less and settle sooner", () => {
    for (let t = 2; t <= MAX_TIER; t++) {
      expect(RESTITUTION(t)).toBeLessThan(RESTITUTION(t - 1));
      expect(FRICTION_AIR(t)).toBeGreaterThan(FRICTION_AIR(t - 1));
    }
    expect(RESTITUTION(MAX_TIER)).toBeGreaterThan(0);
  });

  it("spawns only small tiers, favoring the smallest", () => {
    expect(SPAWN_WEIGHTS).toHaveLength(5);
    for (let i = 1; i < SPAWN_WEIGHTS.length; i++)
      expect(SPAWN_WEIGHTS[i]).toBeLessThan(SPAWN_WEIGHTS[i - 1]);
  });
});

describe("scoring", () => {
  it("rewards higher tiers quadratically", () => {
    expect(SCORE_FOR_MERGE(2)).toBe(40);
    expect(SCORE_FOR_MERGE(11)).toBe(1210);
  });

  it("caps the combo multiplier at ×3", () => {
    expect(COMBO_MULT(1)).toBe(1);
    expect(COMBO_MULT(2)).toBe(1.5);
    expect(COMBO_MULT(5)).toBe(3);
    expect(COMBO_MULT(50)).toBe(3);
  });
});

describe("the archive", () => {
  it("holds all ten principles, numbered", () => {
    expect(PRINCIPLES).toHaveLength(10);
    PRINCIPLES.forEach((p, i) => expect(p.n).toBe(i + 1));
  });

  it("every achievement unlocks two existing trivia cards", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.trivia).toHaveLength(2);
      for (const id of a.trivia) expect(triviaById(id), `missing trivia: ${id}`).toBeDefined();
    }
  });

  it("all trivia is reachable through achievements", () => {
    const reachable = new Set(ACHIEVEMENTS.flatMap((a) => a.trivia));
    for (const t of TRIVIA) expect(reachable.has(t.id), `unreachable trivia: ${t.id}`).toBe(true);
  });
});
