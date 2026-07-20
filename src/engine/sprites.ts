/**
 * The sprite atelier — eleven fictional objects INSPIRED BY the Rams school,
 * never copies of real products (creative direction, 2026-07). Rendered
 * "photographically" (ref: product_06): soft top light, body gradients,
 * specular highlights, ambient occlusion. Sprites are rasterized once per
 * tier per DPR; the game loop only blits transforms.
 */

import { PRODUCTS, Product } from "../data/products";

/* cool grey material system */
const C = {
  body: "#eceded", // base plastic
  bodyLo: "#d9dbdf",
  bodyHi: "#f8f9fa",
  panel: "#e0e2e6",
  case: "#d5d8dd",
  dark: "#2e3033",
  darkLo: "#1f2124",
  screen: "#272b29",
  steel: "#aab7bf",
  steelDark: "#8d99a2",
  grey: "#b9bdc4", // rims & frames (no wood in this universe)
  greyDark: "#9a9ea6",
  graphite: "#55585e",
  ink: "#232528",
  white: "#fafbfc",
  hairline: "#c3c6cc",
  orange: "#ed8008",
  orangeHi: "#ffa63e",
  orangeLo: "#cf6a05",
};

export interface SpriteSheet {
  canvases: HTMLCanvasElement[];
  raster: number;
  dims: { w: number; h: number }[];
}

const PAD = 10;

export function buildSprites(dpr: number): SpriteSheet {
  const raster = Math.min(3, Math.max(1.5, dpr)) * 1.25;
  const canvases: HTMLCanvasElement[] = [];
  const dims: { w: number; h: number }[] = [];

  for (const p of PRODUCTS) {
    const w = spriteWidth(p) + PAD * 2;
    const h = p.spriteH + PAD * 2;
    const cv = document.createElement("canvas");
    cv.width = Math.ceil(w * raster);
    cv.height = Math.ceil(h * raster);
    const ctx = cv.getContext("2d")!;
    ctx.scale(raster, raster);
    ctx.translate(PAD, PAD);
    DRAWERS[p.tier - 1](ctx, spriteWidth(p), p.spriteH);
    canvases.push(cv);
    dims.push({ w, h });
  }
  return { canvases, raster, dims };
}

export function spriteWidth(p: Product): number {
  return p.footprint.kind === "circle" ? p.footprint.r * 2 : p.footprint.w;
}

/* ── photographic helpers ────────────────────────────────────────── */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** A moulded plastic body: vertical gradient, top highlight, base shading. */
function body3D(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, hi = C.bodyHi, mid = C.body, lo = C.bodyLo) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, hi);
  g.addColorStop(0.18, mid);
  g.addColorStop(0.85, mid);
  g.addColorStop(1, lo);
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();
  // side vignette
  const sv = ctx.createLinearGradient(x, 0, x + w, 0);
  sv.addColorStop(0, "rgba(35,37,40,0.07)");
  sv.addColorStop(0.12, "rgba(35,37,40,0)");
  sv.addColorStop(0.88, "rgba(35,37,40,0)");
  sv.addColorStop(1, "rgba(35,37,40,0.09)");
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = sv;
  ctx.fill();
  // crisp top light
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.8, y + 0.6);
  ctx.lineTo(x + w - r * 0.8, y + 0.6);
  ctx.stroke();
  // hairline contour
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
  ctx.strokeStyle = "rgba(35,37,40,0.16)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** Recessed panel (speaker fields, wells). */
function inset(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = C.panel) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + Math.min(6, h));
  g.addColorStop(0, "rgba(35,37,40,0.14)");
  g.addColorStop(1, "rgba(35,37,40,0)");
  rr(ctx, x, y, w, Math.min(6, h), r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + r, y + h - 0.5);
  ctx.lineTo(x + w - r, y + h - 0.5);
  ctx.stroke();
}

/** A turned knob / button with a specular. */
function knob3D(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, base = C.white, edge?: string) {
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.15, cx, cy, r * 1.15);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.45, base);
  g.addColorStop(1, edge ?? shade(base, -28));
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(35,37,40,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // soft drop under the knob
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.95, r * 0.8, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The vital orange control. */
function orange3D(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.12, cx, cy, r * 1.1);
  g.addColorStop(0, C.orangeHi);
  g.addColorStop(0.55, C.orange);
  g.addColorStop(1, C.orangeLo);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(35,37,40,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.4, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Drilled speaker hole — dark core, lit lower rim. */
function hole(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  dot(ctx, x, y + 0.6, r, "rgba(255,255,255,0.75)");
  dot(ctx, x, y, r, "#3a3d42");
  dot(ctx, x - r * 0.2, y - r * 0.25, r * 0.5, "#26282c");
}

function holes(ctx: CanvasRenderingContext2D, x: number, y: number, cols: number, rows: number, pitch: number, r: number) {
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) hole(ctx, x + i * pitch, y + j * pitch, r);
}

function spiralHoles(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxR: number) {
  hole(ctx, cx, cy, 1.6);
  for (let ring = 1; ring * 7 < maxR; ring++) {
    const r = ring * 7;
    const n = Math.max(6, Math.round((Math.PI * 2 * r) / 8));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + ring * 0.35;
      hole(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.6);
    }
  }
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, "0")}`;
}

/* ── the eleven objects (inspired, never copied) ─────────────────── */

type Drawer = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** T1 Punkt — a small cube alarm clock, round face, orange snooze on top */
const punkt: Drawer = (ctx, w, h) => {
  const bw = w, bh = h * 0.82, by = h - bh;
  // orange snooze bar on top
  rr(ctx, w * 0.32, by - 4, w * 0.36, 7, 3.5);
  const og = ctx.createLinearGradient(0, by - 4, 0, by + 3);
  og.addColorStop(0, C.orangeHi);
  og.addColorStop(1, C.orangeLo);
  ctx.fillStyle = og;
  ctx.fill();
  // side winder knob
  rr(ctx, w - 3, by + bh * 0.35, 5, bh * 0.16, 2);
  ctx.fillStyle = C.graphite;
  ctx.fill();
  body3D(ctx, 0, by, bw, bh, w * 0.22);
  // dark base band
  rr(ctx, w * 0.08, h - 5, w * 0.84, 5, 2.5);
  ctx.fillStyle = C.dark;
  ctx.fill();
  // recessed round face
  const cx = w / 2, cy = by + bh / 2, r = Math.min(w, bh) * 0.34;
  knob3D(ctx, cx, cy, r + 2, C.white);
  // ticks
  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
    ctx.lineTo(cx + Math.cos(a) * (r - 4.5), cy + Math.sin(a) * (r - 4.5));
    ctx.stroke();
  }
  // hands
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(-2.1) * r * 0.5, cy + Math.sin(-2.1) * r * 0.5);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(-0.55) * r * 0.72, cy + Math.sin(-0.55) * r * 0.72);
  ctx.stroke();
  dot(ctx, cx, cy, 1.8, C.ink);
};

/** T2 Funk — a pocket receiver: dot field above, centered dial below */
const funk: Drawer = (ctx, w, h) => {
  body3D(ctx, 0, 0, w, h, 9);
  inset(ctx, w * 0.12, h * 0.1, w * 0.76, h * 0.42, 5);
  holes(ctx, w * 0.2, h * 0.18, 5, 3, (w * 0.6) / 4, 1.5);
  // centered dial with orange pointer + tick ring
  const dy = h * 0.72;
  knob3D(ctx, w / 2, dy, 10, C.white);
  ctx.strokeStyle = C.graphite;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 + Math.cos(a) * 12, dy + Math.sin(a) * 12);
    ctx.lineTo(w / 2 + Math.cos(a) * 14, dy + Math.sin(a) * 14);
    ctx.stroke();
  }
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(w / 2, dy);
  ctx.lineTo(w / 2 + 6.5, dy - 5);
  ctx.stroke();
  // two dark side knobs
  knob3D(ctx, w * 0.15, dy, 4, C.graphite, C.darkLo);
  knob3D(ctx, w * 0.85, dy, 4, C.graphite, C.darkLo);
  // dark chin strip with volume wheel
  rr(ctx, w * 0.3, h - 5.5, w * 0.4, 4, 2);
  ctx.fillStyle = C.dark;
  ctx.fill();
};

/** T3 Notiz — a pocket dictation machine: window, three keys, grey strap */
const notiz: Drawer = (ctx, w, h) => {
  ctx.strokeStyle = C.greyDark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, 5);
  ctx.quadraticCurveTo(w / 2, -5, w * 0.7, 5);
  ctx.stroke();
  body3D(ctx, 0, 3, w, h - 3, 9);
  // cassette window with glass sheen
  const wx = w * 0.14, wy = h * 0.18, ww = w * 0.72, wh = h * 0.38;
  inset(ctx, wx, wy, ww, wh, 5, C.dark);
  dot(ctx, wx + ww * 0.28, wy + wh / 2, wh * 0.26, "#4a4e54");
  dot(ctx, wx + ww * 0.72, wy + wh / 2, wh * 0.26, "#4a4e54");
  dot(ctx, wx + ww * 0.28, wy + wh / 2, wh * 0.1, C.body);
  dot(ctx, wx + ww * 0.72, wy + wh / 2, wh * 0.1, C.body);
  const glass = ctx.createLinearGradient(wx, wy, wx + ww * 0.5, wy + wh);
  glass.addColorStop(0, "rgba(255,255,255,0.28)");
  glass.addColorStop(0.5, "rgba(255,255,255,0.04)");
  glass.addColorStop(1, "rgba(255,255,255,0)");
  rr(ctx, wx, wy, ww, wh, 5);
  ctx.fillStyle = glass;
  ctx.fill();
  // tape counter window + screws
  inset(ctx, w * 0.14, h * 0.6, w * 0.24, h * 0.08, 2, C.dark);
  ctx.fillStyle = "#a9bfa9";
  ctx.font = `600 ${h * 0.05}px ui-monospace, monospace`;
  ctx.textAlign = "left";
  ctx.fillText("047", w * 0.17, h * 0.66);
  knob3D(ctx, w * 0.72, h * 0.64, 3.5, C.graphite, C.darkLo);
  knob3D(ctx, w * 0.84, h * 0.64, 3.5, C.graphite, C.darkLo);
  dot(ctx, w * 0.08, h * 0.1, 1.2, C.greyDark);
  dot(ctx, w * 0.92, h * 0.1, 1.2, C.greyDark);
  // three keys, middle orange
  const ky = h * 0.72, kw = w * 0.2, kh = h * 0.15;
  for (const [i, kx] of [w * 0.16, w * 0.4, w * 0.64].entries()) {
    rr(ctx, kx, ky, kw, kh, kh / 2);
    const g = ctx.createLinearGradient(0, ky, 0, ky + kh);
    if (i === 1) {
      g.addColorStop(0, C.orangeHi);
      g.addColorStop(1, C.orangeLo);
    } else {
      g.addColorStop(0, C.bodyHi);
      g.addColorStop(1, C.bodyLo);
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(35,37,40,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

/** T4 Zahl — a desk calculator wedge with pillow keys */
const zahl: Drawer = (ctx, w, h) => {
  body3D(ctx, 0, 0, w, h, 7);
  // display
  inset(ctx, w * 0.12, h * 0.07, w * 0.76, h * 0.15, 3, C.dark);
  ctx.fillStyle = "#a9bfa9";
  ctx.font = `600 ${h * 0.09}px ui-monospace, monospace`;
  ctx.textAlign = "right";
  ctx.fillText("0.", w * 0.84, h * 0.18);
  // 4×4 pillow keys: dark function row on top, orange `=`
  const gx = w * 0.1, gy = h * 0.3, pitch = (w * 0.8) / 4;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const kx = gx + i * pitch + pitch * 0.38;
      const ky = gy + j * pitch * 0.72 + pitch * 0.3;
      if (i === 3 && j === 3) orange3D(ctx, kx, ky, pitch * 0.3);
      else if (j === 0) knob3D(ctx, kx, ky, pitch * 0.28, C.graphite, C.darkLo);
      else knob3D(ctx, kx, ky, pitch * 0.3, C.white);
    }
  // side power slider
  rr(ctx, 0, h * 0.34, 3.5, h * 0.14, 1.5);
  ctx.fillStyle = C.dark;
  ctx.fill();
};

/** T5 Klang — a soft-square speaker, spiral drill pattern, grey rim */
const klang: Drawer = (ctx, w, h) => {
  body3D(ctx, 0, 0, w, h, w * 0.24, "#cdd1d7", C.grey, "#a3a8b0");
  body3D(ctx, 2.5, 3, w - 5, h - 6, w * 0.22);
  // dark surround ring behind the drill field
  ctx.strokeStyle = "rgba(35,37,40,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 + 1, Math.min(w, h) * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  spiralHoles(ctx, w / 2, h / 2 + 1, Math.min(w, h) * 0.37);
  // control pair on the chin: dark volume knob + orange power dot
  knob3D(ctx, w * 0.38, h - 9, 4, C.graphite, C.darkLo);
  orange3D(ctx, w * 0.58, h - 9, 3);
};

/** T6 Welle — a table receiver: tuning window up top, slat vents below */
const welle: Drawer = (ctx, w, h) => {
  // plinth
  rr(ctx, w * 0.05, h - 6, w * 0.9, 6, 3);
  ctx.fillStyle = C.graphite;
  ctx.fill();
  body3D(ctx, 0, 0, w, h - 4, 8);
  // tuning window, full width
  inset(ctx, w * 0.08, h * 0.1, w * 0.84, h * 0.2, 4, C.white);
  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 1;
  for (let i = 1; i < 14; i++) {
    const tx = w * 0.1 + (i * w * 0.8) / 14;
    ctx.beginPath();
    ctx.moveTo(tx, h * 0.13);
    ctx.lineTo(tx, i % 2 ? h * 0.2 : h * 0.26);
    ctx.stroke();
  }
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.11);
  ctx.lineTo(w * 0.62, h * 0.29);
  ctx.stroke();
  // slat vents across the lower body
  const gy = h * 0.4, gh = h * 0.42, slats = 9;
  for (let i = 0; i < slats; i++) {
    const sy = gy + (i * gh) / slats;
    rr(ctx, w * 0.08, sy, w * 0.84, (gh / slats) * 0.5, 2);
    const g = ctx.createLinearGradient(0, sy, 0, sy + (gh / slats) * 0.5);
    g.addColorStop(0, C.darkLo);
    g.addColorStop(1, "#3d4045");
    ctx.fillStyle = g;
    ctx.fill();
  }
  // dark end caps
  rr(ctx, 0, h * 0.08, 5, h * 0.76, 2.5);
  rr(ctx, w - 5, h * 0.08, 5, h * 0.76, 2.5);
  ctx.fillStyle = C.dark;
  ctx.fill();
  // control row: two dark knobs, one white, one orange
  knob3D(ctx, w * 0.16, h * 0.91, 5, C.graphite, C.darkLo);
  knob3D(ctx, w * 0.34, h * 0.91, 4, C.graphite, C.darkLo);
  knob3D(ctx, w * 0.52, h * 0.91, 4, C.white);
  orange3D(ctx, w * 0.82, h * 0.91, 5);
};

/** T7 Dreh — a turntable console, foreshortened platter, acrylic sheen */
const dreh: Drawer = (ctx, w, h) => {
  body3D(ctx, 0, h * 0.42, w, h * 0.56, 6);
  // deck (top plane)
  body3D(ctx, w * 0.02, 0, w * 0.96, h * 0.5, 7, "#f2f3f5", C.panel, "#cfd2d8");
  const px = w * 0.38, py = h * 0.25;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(1, 0.55);
  const pg = ctx.createRadialGradient(-w * 0.06, -w * 0.06, w * 0.03, 0, 0, w * 0.27);
  pg.addColorStop(0, "#43474c");
  pg.addColorStop(0.7, C.dark);
  pg.addColorStop(1, C.darkLo);
  dot(ctx, 0, 0, w * 0.26, "#000");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.26, 0, Math.PI * 2);
  ctx.fill();
  // grooves
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  for (let r = w * 0.1; r < w * 0.24; r += 3) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  orange3D(ctx, 0, 0, w * 0.085);
  ctx.restore();
  // tonearm
  ctx.strokeStyle = C.steelDark;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(w * 0.82, h * 0.08);
  ctx.lineTo(w * 0.62, h * 0.3);
  ctx.stroke();
  knob3D(ctx, w * 0.82, h * 0.08, 4, C.steel);
  // acrylic lid sheen
  const lid = ctx.createLinearGradient(0, 0, w * 0.5, h * 0.5);
  lid.addColorStop(0, "rgba(255,255,255,0.35)");
  lid.addColorStop(0.4, "rgba(255,255,255,0.05)");
  lid.addColorStop(1, "rgba(255,255,255,0)");
  rr(ctx, w * 0.04, 2, w * 0.92, h * 0.46, 6);
  ctx.fillStyle = lid;
  ctx.fill();
  // fascia: dark control strip with pitch slider, knobs, switches
  rr(ctx, w * 0.05, h * 0.62, w * 0.9, h * 0.2, 4);
  ctx.fillStyle = C.dark;
  ctx.fill();
  rr(ctx, w * 0.09, h * 0.7, w * 0.3, 2.5, 1.25);
  ctx.fillStyle = C.greyDark;
  ctx.fill();
  rr(ctx, w * 0.19, h * 0.66, 5, h * 0.1, 2);
  ctx.fillStyle = C.case;
  ctx.fill();
  knob3D(ctx, w * 0.55, h * 0.72, 4.5, C.graphite, C.darkLo);
  knob3D(ctx, w * 0.68, h * 0.72, 4.5, C.white);
  knob3D(ctx, w * 0.82, h * 0.72, 4.5, C.white);
  knob3D(ctx, w * 0.92, h * 0.72, 3.5, C.graphite, C.darkLo);
  for (let i = 0; i < 6; i++) {
    rr(ctx, w * 0.07 + i * 7, h * 0.88, 4, 7, 2);
    ctx.fillStyle = C.case;
    ctx.fill();
  }
};

/** T8 Bild — a cube monitor on a stub foot */
const bild: Drawer = (ctx, w, h) => {
  // antenna nub
  rr(ctx, w * 0.45, 0, w * 0.1, 7, 3);
  ctx.fillStyle = C.case;
  ctx.fill();
  body3D(ctx, 0, 5, w, h - 12, w * 0.15);
  // screen: dark glass with curved sheen
  const sx = w * 0.1, sy = h * 0.1, sw = w * 0.8, sh = h * 0.62;
  inset(ctx, sx, sy, sw, sh, w * 0.08, C.screen);
  const sheen = ctx.createRadialGradient(sx + sw * 0.3, sy + sh * 0.2, 4, sx + sw * 0.35, sy + sh * 0.3, sw * 0.75);
  sheen.addColorStop(0, "rgba(255,255,255,0.22)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.03)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  rr(ctx, sx, sy, sw, sh, w * 0.08);
  ctx.fillStyle = sheen;
  ctx.fill();
  // dark control band under the screen
  rr(ctx, w * 0.08, h * 0.78, w * 0.84, h * 0.13, 4);
  ctx.fillStyle = C.dark;
  ctx.fill();
  holes(ctx, w * 0.16, h * 0.82, 7, 2, w * 0.055, 1.4);
  // channel dial with tick ring + dark volume knob
  ctx.strokeStyle = C.greyDark;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.87 + Math.cos(a) * 7, h * 0.845 + Math.sin(a) * 7);
    ctx.lineTo(w * 0.87 + Math.cos(a) * 8.5, h * 0.845 + Math.sin(a) * 8.5);
    ctx.stroke();
  }
  orange3D(ctx, w * 0.87, h * 0.845, 5.5);
  knob3D(ctx, w * 0.72, h * 0.845, 4, C.graphite, C.darkLo);
  // feet
  rr(ctx, w * 0.2, h - 6, w * 0.14, 6, 3);
  rr(ctx, w * 0.66, h - 6, w * 0.14, 6, 3);
  ctx.fillStyle = C.graphite;
  ctx.fill();
};

/** T9 System — a brushed-steel component stack */
const system: Drawer = (ctx, w, h) => {
  const mh = (h - 10) / 3;
  const drawModule = (y: number) => {
    const g = ctx.createLinearGradient(0, y, 0, y + mh);
    g.addColorStop(0, "#c4ced5");
    g.addColorStop(0.12, C.steel);
    g.addColorStop(0.9, C.steel);
    g.addColorStop(1, "#93a0a9");
    rr(ctx, 0, y, w, mh, 6);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(35,37,40,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // brushed texture
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(5, y + (i * mh) / 7);
      ctx.lineTo(w - 5, y + (i * mh) / 7);
      ctx.stroke();
    }
  };
  drawModule(0);
  knob3D(ctx, w * 0.3, mh / 2, mh * 0.32, C.white);
  knob3D(ctx, w * 0.7, mh / 2, mh * 0.32, C.white);
  dot(ctx, w * 0.3, mh / 2, mh * 0.1, C.graphite);
  dot(ctx, w * 0.7, mh / 2, mh * 0.1, C.graphite);
  orange3D(ctx, w * 0.92, mh * 0.22, 4);
  drawModule(mh + 5);
  for (let i = 0; i < 4; i++)
    knob3D(ctx, w * (0.2 + i * 0.2), mh + 5 + mh * 0.36, mh * 0.16, i % 2 ? C.graphite : C.white, i % 2 ? C.darkLo : undefined);
  // toggle switch row on the amplifier
  for (let i = 0; i < 5; i++) {
    rr(ctx, w * (0.16 + i * 0.15), mh + 5 + mh * 0.64, w * 0.05, mh * 0.2, 2);
    ctx.fillStyle = C.dark;
    ctx.fill();
    rr(ctx, w * (0.16 + i * 0.15) + 1, mh + 5 + mh * 0.66, w * 0.05 - 2, mh * 0.08, 1.5);
    ctx.fillStyle = i < 3 ? C.case : C.greyDark;
    ctx.fill();
  }
  drawModule((mh + 5) * 2);
  inset(ctx, w * 0.1, (mh + 5) * 2 + mh * 0.28, w * 0.8, mh * 0.2, 3, C.white);
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(w * 0.62, (mh + 5) * 2 + mh * 0.26);
  ctx.lineTo(w * 0.62, (mh + 5) * 2 + mh * 0.5);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    rr(ctx, w * (0.15 + i * 0.15), (mh + 5) * 2 + mh * 0.62, w * 0.08, mh * 0.15, 3);
    ctx.fillStyle = C.graphite;
    ctx.fill();
  }
};

/** T10 Regal — a low sideboard, grey laminate, steel hairpin legs */
const regal: Drawer = (ctx, w, h) => {
  const bodyH = h * 0.72;
  ctx.strokeStyle = C.graphite;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (const lx of [w * 0.1, w * 0.88]) {
    ctx.beginPath();
    ctx.moveTo(lx - 4, bodyH);
    ctx.lineTo(lx + 2, h);
    ctx.moveTo(lx + 8, bodyH);
    ctx.lineTo(lx + 2, h);
    ctx.stroke();
  }
  // grey carcass + white lacquer front on a dark plinth
  rr(ctx, w * 0.04, bodyH - 3, w * 0.92, 6, 3);
  ctx.fillStyle = C.dark;
  ctx.fill();
  body3D(ctx, 0, 0, w, bodyH, 7, "#c9cdd3", C.grey, "#9ba0a8");
  body3D(ctx, w * 0.03, 3, w * 0.94, bodyH - 7, 5, "#fdfdfe", C.white, "#e2e4e8");
  const dw = (w * 0.94) / 3;
  ctx.strokeStyle = "rgba(35,37,40,0.14)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.03 + dw * i, 7);
    ctx.lineTo(w * 0.03 + dw * i, bodyH - 7);
    ctx.stroke();
  }
  holes(ctx, w * 0.09, bodyH * 0.28, 6, 4, dw * 0.12, 1.6);
  // turntable well
  ctx.save();
  ctx.translate(w * 0.5, bodyH * 0.48);
  ctx.scale(1, 0.5);
  const wg = ctx.createRadialGradient(-6, -6, 3, 0, 0, dw * 0.32);
  wg.addColorStop(0, "#e7e9ec");
  wg.addColorStop(1, C.case);
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.arc(0, 0, dw * 0.3, 0, Math.PI * 2);
  ctx.fill();
  dot(ctx, 0, 0, dw * 0.1, C.dark);
  ctx.restore();
  // handle, radio knobs + orange cable spiral
  rr(ctx, w * 0.87, bodyH * 0.45, w * 0.05, 3.5, 1.75);
  ctx.fillStyle = C.case;
  ctx.fill();
  knob3D(ctx, w * 0.13, bodyH * 0.72, dw * 0.06, C.graphite, C.darkLo);
  knob3D(ctx, w * 0.22, bodyH * 0.72, dw * 0.06, C.graphite, C.darkLo);
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 6; t += 0.3) {
    const cx2 = w * 0.075 + Math.cos(t) * 3;
    const cy2 = bodyH * 0.78 + t * 1.1;
    if (t === 0) ctx.moveTo(cx2, cy2);
    else ctx.lineTo(cx2, cy2);
  }
  ctx.stroke();
};

/** T11 Monolith — the thesis: a ceramic disc, one orange dot */
const monolith: Drawer = (ctx, w, h) => {
  const r = Math.min(w, h) / 2 - 2;
  const cx = w / 2, cy = h / 2;
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.1, cx, cy, r * 1.15);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.6, C.white);
  g.addColorStop(1, "#d8dade");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(35,37,40,0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  orange3D(ctx, cx, cy, 13);
};

const DRAWERS: Drawer[] = [punkt, funk, notiz, zahl, klang, welle, dreh, bild, system, regal, monolith];
