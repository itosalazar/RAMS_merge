import { TABLE_W, TABLE_D, FAR_WIDTH_RATIO, FAR_SPRITE_SCALE } from "../lib/constants";

/**
 * Maps the flat physics plane onto the on-screen trapezoid of the drafting
 * table (GDD §10 Projection). Physics is simulated undistorted; this is
 * presentation only, and input is inverse-projected so aiming stays honest.
 */
export interface Viewport {
  /** canvas CSS pixel size */
  cw: number;
  ch: number;
  /** trapezoid metrics, CSS px */
  nearY: number; // screen y of the near table edge (bottom)
  farY: number; // screen y of the far table edge (top)
  nearHalfW: number;
  farHalfW: number;
  cx: number; // horizontal center
  /** overall plane→screen unit scale at the near edge */
  unit: number;
}

export function computeViewport(cw: number, ch: number): Viewport {
  // Table occupies the width minus breathing margins, and most of the height.
  const margin = Math.max(10, cw * 0.03);
  const nearHalfW = (cw - margin * 2) / 2;
  const farHalfW = nearHalfW * FAR_WIDTH_RATIO;
  const unit = (nearHalfW * 2) / TABLE_W;

  const farY = ch * 0.14; // room for HUD above the far rail
  const nearY = ch * 0.9; // staging tray lives below

  return { cw, ch, nearY, farY, nearHalfW, farHalfW, cx: cw / 2, unit };
}

/** depth 0 at the near edge (y = TABLE_D), 1 at the far rail (y = 0). */
export function depthOf(planeY: number): number {
  return 1 - planeY / TABLE_D;
}

export function project(v: Viewport, x: number, y: number): { sx: number; sy: number; scale: number } {
  const d = depthOf(y);
  const halfW = v.nearHalfW + (v.farHalfW - v.nearHalfW) * d;
  const sx = v.cx + ((x - TABLE_W / 2) / (TABLE_W / 2)) * halfW;
  const sy = v.nearY + (v.farY - v.nearY) * d;
  const scale = v.unit * (1 + (FAR_SPRITE_SCALE - 1) * d);
  return { sx, sy, scale };
}

/** Inverse: screen point → plane point (for touch input). */
export function unproject(v: Viewport, sx: number, sy: number): { x: number; y: number } {
  const d = clamp((sy - v.nearY) / (v.farY - v.nearY), 0, 1);
  const halfW = v.nearHalfW + (v.farHalfW - v.nearHalfW) * d;
  const x = ((sx - v.cx) / halfW) * (TABLE_W / 2) + TABLE_W / 2;
  const y = (1 - d) * TABLE_D;
  return { x, y };
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
