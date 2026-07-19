/**
 * Canvas renderer — draws the drafting table in perspective and blits
 * pre-rendered product sprites, y-sorted, with squash and pulse (GDD §5/§9/§10).
 */

import { GameEngine } from "./GameEngine";
import { Viewport, project, computeViewport } from "./projection";
import { buildSprites, SpriteSheet, spriteWidth } from "./sprites";
import { productForTier, footprintRadius } from "../data/products";
import { TABLE_W, TABLE_D, LAUNCH_ZONE_D, OCCUPANCY_WARN, OCCUPANCY_FAIL } from "../lib/constants";

const GRID_PITCH = 40; // plane units between hairlines
const HEAVY_EVERY = 8;

export interface ThemeColors {
  paper: string;
  bench: string;
  grid: string;
  case_: string;
  graphite: string;
  ink: string;
  orange: string;
  oak: string;
  oakDark: string;
}

export const LIGHT: ThemeColors = {
  paper: "#f3f4f6",
  bench: "#e2e4e8", // the board
  grid: "#b9bdc4",
  case_: "#d5d8dd",
  graphite: "#55585e",
  ink: "#232528",
  orange: "#ed8008",
  oak: "#c6cad0", // board frame (grey, not wood)
  oakDark: "#a7abb3",
};

export const NIGHT: ThemeColors = {
  paper: "#17181b",
  bench: "#212327",
  grid: "#3a3d43",
  case_: "#33363b",
  graphite: "#b3b6bd",
  ink: "#eceef1",
  orange: "#ed8008",
  oak: "#33363b",
  oakDark: "#26282c",
};

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteSheet;
  private v: Viewport;
  private dpr: number;
  theme: ThemeColors = LIGHT;
  reducedMotion = false;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.dpr = Math.min(3, window.devicePixelRatio || 1);
    this.sprites = buildSprites(this.dpr);
    this.v = computeViewport(canvas.clientWidth, canvas.clientHeight);
    this.resize();
  }

  resize(): void {
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    this.canvas.width = Math.round(cw * this.dpr);
    this.canvas.height = Math.round(ch * this.dpr);
    this.v = computeViewport(cw, ch);
  }

  get viewport(): Viewport {
    return this.v;
  }

  render(engine: GameEngine, now: number): void {
    const { ctx, v, theme } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, v.cw, v.ch);

    this.drawTable(engine);
    this.drawBodies(engine, now);
    this.drawStaged(engine, now);
    this.drawParticles(engine, now);
    this.drawWarning(engine, now);
    void theme;
  }

  /* ── the drafting table ────────────────────────────────────────── */

  private trapezoid(inset = 0): { nl: number; nr: number; fl: number; fr: number } {
    const { v } = this;
    const insetNear = (inset / (TABLE_W / 2)) * v.nearHalfW;
    const insetFar = (inset / (TABLE_W / 2)) * v.farHalfW;
    return {
      nl: v.cx - v.nearHalfW + insetNear,
      nr: v.cx + v.nearHalfW - insetNear,
      fl: v.cx - v.farHalfW + insetFar,
      fr: v.cx + v.farHalfW - insetFar,
    };
  }

  private drawTable(engine: GameEngine): void {
    const { ctx, v, theme } = this;
    const t = this.trapezoid();

    // rail — a moulded grey frame with a lit top edge
    const railN = 14, railF = railN * 0.84;
    ctx.beginPath();
    ctx.moveTo(t.nl - railN, v.nearY + railN);
    ctx.lineTo(t.fl - railF, v.farY - railF * 0.6);
    ctx.lineTo(t.fr + railF, v.farY - railF * 0.6);
    ctx.lineTo(t.nr + railN, v.nearY + railN);
    ctx.closePath();
    const railG = ctx.createLinearGradient(0, v.farY - railF, 0, v.nearY + railN);
    railG.addColorStop(0, theme.oak);
    railG.addColorStop(1, theme.oakDark);
    ctx.fillStyle = railG;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // board drop shadow onto the page
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.filter = "blur(6px)";
    ctx.fillStyle = "#141619";
    ctx.beginPath();
    ctx.ellipse(v.cx, v.nearY + railN + 8, v.nearHalfW + railN, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = "none";
    ctx.restore();

    // surface — soft vertical falloff like a photographed board
    ctx.beginPath();
    ctx.moveTo(t.nl, v.nearY);
    ctx.lineTo(t.fl, v.farY);
    ctx.lineTo(t.fr, v.farY);
    ctx.lineTo(t.nr, v.nearY);
    ctx.closePath();
    const surf = ctx.createLinearGradient(0, v.farY, 0, v.nearY);
    surf.addColorStop(0, theme.bench);
    surf.addColorStop(1, this.theme === NIGHT ? "#26282c" : "#eceef0");
    ctx.fillStyle = surf;
    ctx.fill();

    // dotted grid (speaker-drill language) at every crossing
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(t.nl, v.nearY);
    ctx.lineTo(t.fl, v.farY);
    ctx.lineTo(t.fr, v.farY);
    ctx.lineTo(t.nr, v.nearY);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = theme.grid;
    for (let gx = GRID_PITCH, i = 1; gx < TABLE_W; gx += GRID_PITCH, i++) {
      for (let gy = GRID_PITCH, j = 1; gy < TABLE_D; gy += GRID_PITCH, j++) {
        const p = project(this.v, gx, gy);
        const heavy = i % HEAVY_EVERY === 0 && j % HEAVY_EVERY === 0;
        const r = (heavy ? 2 : 1.15) * (p.scale / this.v.unit);
        ctx.globalAlpha = heavy ? 0.85 : 0.55;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // registration crosses at the four grid corners
    ctx.strokeStyle = theme.graphite;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (const [px, py] of [
      [GRID_PITCH * 2, GRID_PITCH * 2],
      [TABLE_W - GRID_PITCH * 2, GRID_PITCH * 2],
      [GRID_PITCH * 2, TABLE_D - GRID_PITCH * 2],
      [TABLE_W - GRID_PITCH * 2, TABLE_D - GRID_PITCH * 2],
    ]) {
      const c = project(this.v, px, py);
      const s = 5 * (c.scale / this.v.unit);
      ctx.beginPath();
      ctx.moveTo(c.sx - s, c.sy);
      ctx.lineTo(c.sx + s, c.sy);
      ctx.moveTo(c.sx, c.sy - s);
      ctx.lineTo(c.sx, c.sy + s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // shrinking-table inset shading
    if (engine.shrinkInset > 1) {
      const ti = this.trapezoid(engine.shrinkInset);
      ctx.fillStyle = "rgba(20,22,25,0.07)";
      ctx.beginPath();
      ctx.moveTo(t.nl, v.nearY);
      ctx.lineTo(t.fl, v.farY);
      ctx.lineTo(ti.fl, v.farY);
      ctx.lineTo(ti.nl, v.nearY);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ti.nr, v.nearY);
      ctx.lineTo(ti.fr, v.farY);
      ctx.lineTo(t.fr, v.farY);
      ctx.lineTo(t.nr, v.nearY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = LIGHT.orange;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ti.nl, v.nearY);
      ctx.lineTo(ti.fl, v.farY);
      ctx.moveTo(ti.nr, v.nearY);
      ctx.lineTo(ti.fr, v.farY);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // dashed launch line
    const ly = project(this.v, 0, TABLE_D - LAUNCH_ZONE_D);
    const lyR = project(this.v, TABLE_W, TABLE_D - LAUNCH_ZONE_D);
    ctx.strokeStyle = theme.graphite;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(ly.sx, ly.sy);
    ctx.lineTo(lyR.sx, lyR.sy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /** Photographic ground shadow: dense elliptical core with soft falloff. */
  private softShadow(sx: number, sy: number, r: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, 0.42);
    const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.25);
    g.addColorStop(0, "rgba(20,22,25,0.26)");
    g.addColorStop(0.55, "rgba(20,22,25,0.13)");
    g.addColorStop(1, "rgba(20,22,25,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ── products ──────────────────────────────────────────────────── */

  private drawBodies(engine: GameEngine, now: number): void {
    const { ctx } = this;
    const bodies = engine.productBodies().sort((a, b) => a.position.y - b.position.y);

    for (const body of bodies) {
      const meta = engine.metaOf(body);
      if (!meta) continue;
      const tier = meta.tier;
      const p = productForTier(tier);
      const proj = project(this.v, body.position.x, body.position.y);
      const sheet = this.sprites;
      const cv = sheet.canvases[tier - 1];
      const dim = sheet.dims[tier - 1];

      // spawn pulse: 92 → 103 → 100 over 350ms
      let pulse = 1;
      if (!this.reducedMotion) {
        const age = now - meta.bornAt;
        if (age < 350) {
          const k = age / 350;
          pulse = k < 0.5 ? 0.92 + (1.03 - 0.92) * (k / 0.5) : 1.03 - 0.03 * ((k - 0.5) / 0.5);
        }
      }

      // impact squash along vertical, capped 8%
      let squash = 0;
      if (!this.reducedMotion && meta.hitAt) {
        const age = now - meta.hitAt;
        if (age < 160) squash = meta.hitMag * (1 - age / 160);
      }

      const w = dim.w * proj.scale * pulse * (1 + squash);
      const h = dim.h * proj.scale * pulse * (1 - squash);

      // photographic contact shadow: dense core, soft falloff
      const fr = footprintRadius(p.footprint);
      this.softShadow(proj.sx, proj.sy, fr * proj.scale);

      // sprite, anchored at base, subtle physical rotation
      const rot = clampAngle(body.angle) * 0.25;
      ctx.save();
      ctx.translate(proj.sx, proj.sy + fr * proj.scale * 0.18);
      ctx.rotate(Math.max(-0.16, Math.min(0.16, rot)));
      ctx.drawImage(cv, -w / 2, -h, w, h);
      ctx.restore();
    }
  }

  private drawStaged(engine: GameEngine, now: number): void {
    const { ctx, theme } = this;
    const staged = engine.staged;
    if (!staged || engine.over) return;
    const p = productForTier(staged.tier);
    const proj = project(this.v, staged.x, TABLE_D - LAUNCH_ZONE_D / 2);
    const dim = this.sprites.dims[staged.tier - 1];
    const cv = this.sprites.canvases[staged.tier - 1];
    const fr = footprintRadius(p.footprint);

    // aim guide
    if (engine.aim.active && engine.aim.power > 0.04) {
      const a = engine.aim;
      const reach = 140 + a.power * 420;
      const tx = staged.x + a.dirX * reach;
      const ty = TABLE_D - LAUNCH_ZONE_D / 2 + a.dirY * reach;
      const target = project(this.v, Math.max(0, Math.min(TABLE_W, tx)), Math.max(0, Math.min(TABLE_D, ty)));
      ctx.strokeStyle = theme.orange;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      ctx.moveTo(proj.sx, proj.sy);
      ctx.lineTo(target.sx, target.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // power ticks arc around the launch point (dial language)
      const ticks = 12;
      const lit = Math.round(a.power * ticks);
      for (let i = 0; i < ticks; i++) {
        const ang = Math.PI * 0.75 + (i / (ticks - 1)) * Math.PI * 1.5;
        const r1 = fr * proj.scale + 12;
        ctx.strokeStyle = i < lit ? theme.orange : theme.case_;
        ctx.globalAlpha = i < lit ? 0.95 : 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(proj.sx + Math.cos(ang) * r1, proj.sy + Math.sin(ang) * r1 * 0.6);
        ctx.lineTo(proj.sx + Math.cos(ang) * (r1 + 6), proj.sy + Math.sin(ang) * (r1 + 6) * 0.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // gentle idle bob
    const bob = this.reducedMotion ? 0 : Math.sin(now / 600) * 1.5;
    const w = dim.w * proj.scale;
    const h = dim.h * proj.scale;
    this.softShadow(proj.sx, proj.sy, fr * proj.scale);
    ctx.drawImage(cv, proj.sx - w / 2, proj.sy - h + fr * proj.scale * 0.18 + bob, w, h);
  }

  private drawParticles(engine: GameEngine, now: number): void {
    const { ctx } = this;
    for (const g of engine.particles.glows) {
      const age = (now - g.born) / 400;
      const proj = project(this.v, g.x, g.y);
      ctx.globalAlpha = 0.08 * (1 - age);
      ctx.fillStyle = "#fbfaf7";
      ctx.beginPath();
      ctx.ellipse(proj.sx, proj.sy - g.r * proj.scale * 0.4, g.r * proj.scale * (1 + age), g.r * proj.scale * (0.7 + age * 0.5), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const p of engine.particles.particles) {
      const age = (now - p.born) / p.life;
      const proj = project(this.v, p.x, p.y);
      ctx.globalAlpha = 1 - age;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy - 6, p.r * (proj.scale / this.v.unit), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawWarning(engine: GameEngine, now: number): void {
    if (engine.occupancy < OCCUPANCY_WARN || engine.over) return;
    const { ctx, v } = this;
    const t = this.trapezoid();
    const k = Math.min(1, (engine.occupancy - OCCUPANCY_WARN) / (OCCUPANCY_FAIL - OCCUPANCY_WARN));
    const breathe = 0.5 + 0.5 * Math.sin(now / 300);
    ctx.strokeStyle = "#ed8008";
    ctx.globalAlpha = 0.25 + 0.55 * k * breathe;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(t.nl, v.nearY);
    ctx.lineTo(t.fl, v.farY);
    ctx.lineTo(t.fr, v.farY);
    ctx.lineTo(t.nr, v.nearY);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function clampAngle(a: number): number {
  let r = a % (Math.PI * 2);
  if (r > Math.PI) r -= Math.PI * 2;
  if (r < -Math.PI) r += Math.PI * 2;
  return r;
}

export { spriteWidth };
