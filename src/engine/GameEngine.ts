/**
 * GameEngine — framework-free core (GDD §14). Owns the Matter.js world,
 * the fixed-timestep loop, input, merge resolution and mode logic.
 * React talks to it only through the Emitter and a few methods.
 */

import Matter from "matter-js";
import {
  TABLE_W,
  TABLE_D,
  LAUNCH_ZONE_D,
  DENSITY_BASE,
  UNIFORM_MASS,
  RESTITUTION,
  FRICTION_AIR,
  SURFACE_FRICTION,
  WALL_RESTITUTION,
  MAGNET_RANGE,
  MAGNET_FORCE,
  MERGE_MIN_SPEED,
  MERGE_REST_MS,
  LAUNCH_V_MIN,
  LAUNCH_V_MAX,
  COMBO_WINDOW_MS,
  COMBO_MULT,
  OCCUPANCY_FAIL,
  FAIL_SUSTAIN_MS,
  SPAWN_WEIGHTS,
  SPEED_MERGE_START_S,
  SPEED_MERGE_MIN_S,
  SPEED_MERGE_DECAY_S,
  SHRINK_RATE,
  SHRINK_EXPAND_RATIO,
  SHRINK_MAX_INSET,
  ZEN_DECLUTTER_OCCUPANCY,
  SCORE_FOR_MERGE,
  MONOLITH_CLEAR_BONUS,
} from "../lib/constants";
import { MAX_TIER, productForTier, footprintArea, footprintRadius } from "../data/products";
import { Emitter } from "./events";
import { ParticleField } from "./particles";
import { mulberry32, dailySeed } from "./rng";
import type { GameMode } from "./modes";

const { Engine, Bodies, Body, Composite, Events } = Matter;

interface BodyMeta {
  tier: number;
  bornAt: number;
  /** squash animation */
  hitAt: number;
  hitMag: number;
  /** sustained same-tier contact start times, keyed by other body id */
  restContacts: Map<number, number>;
}

export interface StagedProduct {
  tier: number;
  x: number;
}

export interface AimState {
  active: boolean;
  dirX: number;
  dirY: number; // normalized, dirY < 0 = up-table
  power: number; // 0..1
}

export interface RunStats {
  score: number;
  merges: number;
  largestTier: number;
  startedAt: number;
  targetsHit: number;
}

export class GameEngine {
  readonly events = new Emitter();
  readonly particles = new ParticleField();
  readonly mode: GameMode;

  engine: Matter.Engine;
  world: Matter.World;
  private walls: Matter.Body[] = [];
  private meta = new Map<number, BodyMeta>();
  private rand: () => number;

  staged: StagedProduct | null = null;
  nextTier = 1;
  aim: AimState = { active: false, dirX: 0, dirY: -1, power: 0 };

  stats: RunStats = { score: 0, merges: 0, largestTier: 0, startedAt: 0, targetsHit: 0 };
  running = false;
  over = false;
  paused = false;

  /** combo */
  private lastMergeAt = -Infinity;
  private chain = 0;

  /** failure tracking */
  private failSince = 0;
  occupancy = 0;

  /** discoveries within this run (first-ever handled by meta store) */
  discoveredThisRun = new Set<number>();
  private knownTiers: Set<number>;

  /** mode state */
  targetTier = 0;
  speedRemainingS = 0;
  shrinkInset = 0;
  private launchCooldownUntil = 0;
  private accumulator = 0;
  private lastT = 0;
  private elapsedMs = 0;
  private timerEmitAcc = 0;

  constructor(mode: GameMode, knownTiers: number[], seed?: number) {
    this.mode = mode;
    this.knownTiers = new Set(knownTiers);
    this.rand = mulberry32(seed ?? dailySeed() * 31 + ((performance.now() * 1000) % 100000 | 0));

    this.engine = Engine.create({ gravity: { x: 0, y: 0 } });
    this.world = this.engine.world;
    this.engine.enableSleeping = true;

    this.buildWalls();
    Events.on(this.engine, "collisionStart", (e) => this.onCollisions(e.pairs, true));
    Events.on(this.engine, "collisionActive", (e) => this.onCollisions(e.pairs, false));
    Events.on(this.engine, "collisionEnd", (e) => {
      for (const p of e.pairs) {
        this.meta.get(p.bodyA.id)?.restContacts.delete(p.bodyB.id);
        this.meta.get(p.bodyB.id)?.restContacts.delete(p.bodyA.id);
      }
    });

    if (mode === "time-attack") {
      this.rand = mulberry32(dailySeed());
      this.targetTier = 6 + Math.floor(this.rand() * 4); // 6..9, daily-seeded
    }
    if (mode === "speed-merge") this.speedRemainingS = SPEED_MERGE_START_S;
  }

  /* ── lifecycle ─────────────────────────────────────────────────── */

  start(): void {
    this.running = true;
    this.stats.startedAt = performance.now();
    this.lastT = performance.now();
    this.stage();
    if (this.targetTier) this.events.emit("newTarget", { tier: this.targetTier });
  }

  destroy(): void {
    this.running = false;
    this.events.clear();
    Matter.Events.off(this.engine, "collisionStart");
    Matter.Events.off(this.engine, "collisionActive");
    Matter.Events.off(this.engine, "collisionEnd");
    Engine.clear(this.engine);
  }

  setPaused(p: boolean): void {
    this.paused = p;
    if (!p) this.lastT = performance.now();
  }

  /** Fixed-timestep update, called from rAF. */
  tick(now: number): void {
    if (!this.running || this.paused || this.over) return;
    const frame = Math.min(100, now - this.lastT);
    this.lastT = now;
    this.accumulator += frame;
    const STEP = 1000 / 60;
    while (this.accumulator >= STEP) {
      this.accumulator -= STEP;
      this.elapsedMs += STEP;
      this.applyMagnetism();
      Engine.update(this.engine, STEP);
      this.afterStep(STEP, now);
    }
    this.particles.step(frame, now);
  }

  /* ── the table ─────────────────────────────────────────────────── */

  private buildWalls(): void {
    for (const w of this.walls) Composite.remove(this.world, w);
    const t = 80; // wall thickness, outside the plane
    const inset = this.shrinkInset;
    const opts = { isStatic: true, restitution: WALL_RESTITUTION, friction: 0.02 };
    this.walls = [
      Bodies.rectangle(TABLE_W / 2, -t / 2, TABLE_W * 2, t, opts), // far
      Bodies.rectangle(-t / 2 + inset, TABLE_D / 2, t, TABLE_D * 2, opts), // left
      Bodies.rectangle(TABLE_W + t / 2 - inset, TABLE_D / 2, t, TABLE_D * 2, opts), // right
      // the throw line is one-way: objects live above it and bounce off it,
      // never back into the staging zone (launches spawn above the barrier)
      Bodies.rectangle(TABLE_W / 2, TABLE_D - LAUNCH_ZONE_D + t / 2, TABLE_W * 2, t, opts),
    ];
    Composite.add(this.world, this.walls);
  }

  /* ── staging & launch ──────────────────────────────────────────── */

  private rollTier(): number {
    const w = SPAWN_WEIGHTS;
    const total = w.reduce((a, b) => a + b, 0);
    let roll = this.rand() * total;
    for (let i = 0; i < w.length; i++) {
      roll -= w[i];
      if (roll <= 0) return i + 1;
    }
    return 1;
  }

  private stage(): void {
    const tier = this.nextTier || this.rollTier();
    this.nextTier = this.rollTier();
    this.staged = { tier, x: TABLE_W / 2 };
    this.events.emit("staged", { tier, nextTier: this.nextTier });
  }

  moveStaged(x: number): void {
    if (!this.staged) return;
    const r = footprintRadius(productForTier(this.staged.tier).footprint);
    this.staged.x = Math.max(r + this.shrinkInset, Math.min(TABLE_W - r - this.shrinkInset, x));
  }

  setAim(dirX: number, dirY: number, power: number): void {
    const len = Math.hypot(dirX, dirY) || 1;
    let ny = dirY / len;
    let nx = dirX / len;
    // clamp to up-table within ±75°
    if (ny > -0.26) {
      const sign = nx >= 0 ? 1 : -1;
      nx = sign * 0.966;
      ny = -0.259;
    }
    this.aim = { active: true, dirX: nx, dirY: ny, power: Math.max(0, Math.min(1, power)) };
  }

  clearAim(): void {
    this.aim = { active: false, dirX: 0, dirY: -1, power: 0 };
  }

  launch(): boolean {
    const now = performance.now();
    if (!this.staged || this.over || now < this.launchCooldownUntil || !this.aim.active) return false;
    if (this.aim.power < 0.08) {
      this.clearAim();
      return false;
    }
    const { tier } = this.staged;
    // spawn just above the one-way throw line
    const r = footprintRadius(productForTier(tier).footprint);
    const body = this.createBody(tier, this.staged.x, TABLE_D - LAUNCH_ZONE_D - r - 4, now);
    const v = LAUNCH_V_MIN + (LAUNCH_V_MAX - LAUNCH_V_MIN) * this.aim.power;
    Body.setVelocity(body, { x: this.aim.dirX * v, y: this.aim.dirY * v });
    Body.setAngularVelocity(body, (this.rand() - 0.5) * 0.15);
    Composite.add(this.world, body);
    if (process.env.NODE_ENV !== "production") console.log("[engine] launch tier", tier, "bodies:", this.productBodies().length);
    this.events.emit("launch", { tier });
    this.staged = null;
    this.clearAim();
    this.launchCooldownUntil = now + 550;
    setTimeout(() => {
      if (this.running && !this.over) this.stage();
    }, 560);
    return true;
  }

  private createBody(tier: number, x: number, y: number, now: number): Matter.Body {
    const p = productForTier(tier);
    const common = {
      restitution: RESTITUTION(),
      frictionAir: FRICTION_AIR(),
      friction: SURFACE_FRICTION,
      density: DENSITY_BASE,
    };
    const body =
      p.footprint.kind === "circle"
        ? Bodies.circle(x, y, p.footprint.r, common)
        : Bodies.rectangle(x, y, p.footprint.w, p.footprint.h, {
            ...common,
            chamfer: { radius: Math.min(p.footprint.w, p.footprint.h) * 0.18 },
          });
    // every object weighs the same — a clock can shove a sideboard
    Body.setMass(body, UNIFORM_MASS);
    this.meta.set(body.id, { tier, bornAt: now, hitAt: 0, hitMag: 0, restContacts: new Map() });
    return body;
  }

  tierOf(body: Matter.Body): number {
    return this.meta.get(body.id)?.tier ?? 0;
  }

  metaOf(body: Matter.Body): BodyMeta | undefined {
    return this.meta.get(body.id);
  }

  productBodies(): Matter.Body[] {
    return Composite.allBodies(this.world).filter((b) => this.meta.has(b.id));
  }

  /* ── physics extras ────────────────────────────────────────────── */

  private applyMagnetism(): void {
    const bodies = this.productBodies();
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const ta = this.tierOf(a), tb = this.tierOf(b);
        if (ta !== tb || ta === 0) continue;
        const ra = footprintRadius(productForTier(ta).footprint);
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dist = Math.hypot(dx, dy);
        const range = MAGNET_RANGE * (ra * 2);
        if (dist > range || dist < 1) continue;
        const closeness = 1 - dist / range;
        const f = MAGNET_FORCE * Math.min(1, closeness) * a.mass;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        Body.applyForce(a, a.position, { x: fx, y: fy });
        Body.applyForce(b, b.position, { x: -fx, y: -fy });
      }
    }
  }

  private onCollisions(pairs: Matter.Pair[], fresh: boolean): void {
    const now = performance.now();
    const consumed = new Set<number>();
    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;
      const ma = this.meta.get(bodyA.id);
      const mb = this.meta.get(bodyB.id);
      const relSpeed = Math.hypot(bodyA.velocity.x - bodyB.velocity.x, bodyA.velocity.y - bodyB.velocity.y);

      if (fresh) {
        // impact FX + audio for any product collision (incl. walls)
        if (ma) this.registerHit(ma, relSpeed);
        if (mb) this.registerHit(mb, relSpeed);
        if (relSpeed > 0.8) {
          this.events.emit("impact", {
            energy: Math.min(1, relSpeed / 10),
            tierA: ma?.tier ?? 0,
            tierB: mb?.tier ?? 0,
          });
        }
      }

      if (!ma || !mb || ma.tier !== mb.tier) continue;
      if (consumed.has(bodyA.id) || consumed.has(bodyB.id)) continue;

      let shouldMerge = false;
      if (fresh && relSpeed >= MERGE_MIN_SPEED) shouldMerge = true;
      else {
        // sustained-contact merge
        const t0 = ma.restContacts.get(bodyB.id);
        if (t0 === undefined) {
          ma.restContacts.set(bodyB.id, now);
          mb.restContacts.set(bodyA.id, now);
        } else if (now - t0 >= MERGE_REST_MS) {
          shouldMerge = true;
        }
      }

      if (shouldMerge && ma.tier < MAX_TIER) {
        consumed.add(bodyA.id).add(bodyB.id);
        this.merge(bodyA, bodyB, ma.tier, now);
      }
    }
  }

  private registerHit(m: BodyMeta, relSpeed: number): void {
    if (relSpeed < 0.6) return;
    m.hitAt = performance.now();
    m.hitMag = Math.min(0.08, relSpeed * 0.012);
  }

  /* ── merging ───────────────────────────────────────────────────── */

  private merge(a: Matter.Body, b: Matter.Body, tier: number, now: number): void {
    const newTier = tier + 1;
    const mx = (a.position.x * a.mass + b.position.x * b.mass) / (a.mass + b.mass);
    const my = (a.position.y * a.mass + b.position.y * b.mass) / (a.mass + b.mass);
    const vx = (a.velocity.x * a.mass + b.velocity.x * b.mass) / (a.mass + b.mass);
    const vy = (a.velocity.y * a.mass + b.velocity.y * b.mass) / (a.mass + b.mass);

    this.meta.delete(a.id);
    this.meta.delete(b.id);
    Composite.remove(this.world, a);
    Composite.remove(this.world, b);

    const body = this.createBody(newTier, mx, my, now);
    if (process.env.NODE_ENV !== "production") console.log("[engine] merge →", newTier, "bodies:", this.productBodies().length);
    Body.setVelocity(body, { x: vx, y: vy });
    Body.setAngularVelocity(body, (this.rand() - 0.5) * 0.5);
    Composite.add(this.world, body);

    // combo
    if (now - this.lastMergeAt <= COMBO_WINDOW_MS) this.chain += 1;
    else this.chain = 1;
    this.lastMergeAt = now;
    const mult = COMBO_MULT(this.chain);

    const delta = Math.round(SCORE_FOR_MERGE(newTier) * mult);
    this.stats.score += delta;
    this.stats.merges += 1;
    this.stats.largestTier = Math.max(this.stats.largestTier, newTier);

    const firstDiscovery = !this.knownTiers.has(newTier) && !this.discoveredThisRun.has(newTier);
    if (firstDiscovery) this.discoveredThisRun.add(newTier);

    this.particles.burst(mx, my, footprintRadius(productForTier(newTier).footprint), now, this.rand);

    this.events.emit("merge", { tier: newTier, x: mx, y: my, chain: this.chain, score: delta, firstDiscovery });
    this.events.emit("score", { score: this.stats.score, delta });
    if (this.chain > 1) this.events.emit("combo", { chain: this.chain, mult });
    if (firstDiscovery) this.events.emit("discover", { tier: newTier });

    // mode reactions
    if (this.mode === "speed-merge") {
      this.speedRemainingS = Math.max(
        SPEED_MERGE_MIN_S,
        SPEED_MERGE_START_S - this.stats.merges * SPEED_MERGE_DECAY_S
      );
    }
    if (this.mode === "time-attack" && newTier === this.targetTier) {
      this.stats.targetsHit += 1;
      this.events.emit("targetHit", { tier: newTier, count: this.stats.targetsHit });
      this.endRun(); // completion — timer stops
      return;
    }
    if (this.mode === "shrinking" && newTier === this.targetTier) {
      this.stats.targetsHit += 1;
      this.shrinkInset = Math.max(0, this.shrinkInset - TABLE_W * SHRINK_MAX_INSET * SHRINK_EXPAND_RATIO);
      this.buildWalls();
      this.events.emit("targetHit", { tier: newTier, count: this.stats.targetsHit });
      this.targetTier = 4 + Math.floor(this.rand() * 4); // 4..7
      this.events.emit("newTarget", { tier: this.targetTier });
    }
    if (newTier === MAX_TIER && this.mode === "classic") {
      // the Monolith's exhibition debut clears the bench
      this.stats.score += MONOLITH_CLEAR_BONUS;
      this.events.emit("score", { score: this.stats.score, delta: MONOLITH_CLEAR_BONUS });
      this.events.emit("monolith", { score: this.stats.score });
      setTimeout(() => this.clearBench(), 900);
    }
  }

  private clearBench(): void {
    const now = performance.now();
    for (const b of this.productBodies()) {
      this.particles.burst(b.position.x, b.position.y, 20, now, this.rand);
      this.meta.delete(b.id);
      Composite.remove(this.world, b);
    }
  }

  /* ── per-step bookkeeping ──────────────────────────────────────── */

  private afterStep(stepMs: number, now: number): void {
    // occupancy
    const area = this.productBodies().reduce((sum, b) => sum + footprintArea(productForTier(this.tierOf(b)).footprint), 0);
    const tableArea = (TABLE_W - this.shrinkInset * 2) * TABLE_D;
    this.occupancy = area / tableArea;
    this.events.emit("occupancy", { ratio: this.occupancy });

    // mode timers
    if (this.mode === "speed-merge") {
      this.speedRemainingS -= stepMs / 1000;
      if (this.speedRemainingS <= 0) {
        this.endRun();
        return;
      }
    }
    if (this.mode === "shrinking") {
      this.shrinkInset = Math.min(TABLE_W * SHRINK_MAX_INSET, this.shrinkInset + (SHRINK_RATE * stepMs) / 1000);
      if (this.elapsedMs % 500 < stepMs) this.buildWalls();
      if (!this.targetTier) {
        this.targetTier = 4 + Math.floor(this.rand() * 4);
        this.events.emit("newTarget", { tier: this.targetTier });
      }
    }

    this.timerEmitAcc += stepMs;
    if (this.timerEmitAcc >= 250) {
      this.timerEmitAcc = 0;
      this.events.emit("timer", {
        elapsedS: (now - this.stats.startedAt) / 1000,
        remainingS: this.mode === "speed-merge" ? Math.max(0, this.speedRemainingS) : undefined,
      });
    }

    // zen declutter
    if (this.mode === "zen" && this.occupancy > ZEN_DECLUTTER_OCCUPANCY) {
      const lowest = this.productBodies().sort((a, b) => this.tierOf(a) - this.tierOf(b))[0];
      if (lowest) {
        this.particles.burst(lowest.position.x, lowest.position.y, 16, now, this.rand);
        this.meta.delete(lowest.id);
        Composite.remove(this.world, lowest);
      }
    }

    // failure (not in zen; time-attack ends by completion but can still jam)
    if (this.mode !== "zen") {
      const jammed = this.occupancy > OCCUPANCY_FAIL || this.launchZoneBlocked();
      if (jammed) {
        if (!this.failSince) this.failSince = now;
        else if (now - this.failSince > FAIL_SUSTAIN_MS) this.endRun();
      } else {
        this.failSince = 0;
      }
    }
  }

  private launchZoneBlocked(): boolean {
    const zoneY = TABLE_D - LAUNCH_ZONE_D;
    let blocked = 0;
    for (const b of this.productBodies()) {
      const r = footprintRadius(productForTier(this.tierOf(b)).footprint);
      if (b.position.y + r > zoneY && b.speed < 0.15) blocked += r * 2;
    }
    return blocked > (TABLE_W - this.shrinkInset * 2) * 0.7;
  }

  private endRun(): void {
    if (this.over) return;
    this.over = true;
    this.events.emit("gameover", {
      score: this.stats.score,
      largestTier: this.stats.largestTier,
      merges: this.stats.merges,
      durationS: (performance.now() - this.stats.startedAt) / 1000,
    });
  }
}
