/**
 * The sprite atelier — every RM product drawn in code as a front elevation
 * (GDD §4). Sprites are rendered once per tier per DPR into offscreen
 * canvases; the game loop only blits transforms.
 *
 * Palette discipline: warm-white bodies, greys, one orange element each.
 */

import { PRODUCTS, Product } from "../data/products";

const C = {
  paper: "#f4f2ed",
  body: "#e9e6df",
  bodyDark: "#ddd8cd",
  case: "#d9d2c6",
  steel: "#aab7bf",
  steelDark: "#8d9aa3",
  taupe: "#736356",
  oak: "#b08f62",
  oakLight: "#c8a878",
  graphite: "#4d4d4d",
  ink: "#261201",
  dark: "#332f2a",
  screen: "#2a3129",
  orange: "#ed8008",
  orangeDeep: "#ea5b0c",
  white: "#fbfaf7",
  hairline: "#c9c2b4",
};

export interface SpriteSheet {
  /** canvas per tier (index tier-1), drawn at `raster` px per plane unit */
  canvases: HTMLCanvasElement[];
  raster: number;
  /** sprite plane-size per tier: width, height, and baseline offset */
  dims: { w: number; h: number }[];
}

/** Padding around each sprite in plane units (shadow bleed). */
const PAD = 8;

export function buildSprites(dpr: number): SpriteSheet {
  const raster = Math.min(3, Math.max(1.5, dpr)) * 1.25; // crisp on retina
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

/* ── drawing helpers ─────────────────────────────────────────────── */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** speaker perforation grid */
function holes(ctx: CanvasRenderingContext2D, x: number, y: number, cols: number, rows: number, pitch: number, r: number, color = C.graphite) {
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) dot(ctx, x + i * pitch, y + j * pitch, r, color);
}

/** concentric perforation spiral (Klang face, DR06 reference) */
function spiralHoles(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxR: number, color = C.graphite) {
  dot(ctx, cx, cy, 1.6, color);
  for (let ring = 1; ring * 7 < maxR; ring++) {
    const r = ring * 7;
    const n = Math.max(6, Math.round((Math.PI * 2 * r) / 8));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + ring * 0.35;
      dot(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.6, color);
    }
  }
}

/* ── the eleven products ─────────────────────────────────────────── */

type Drawer = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** RM-01 Punkt — pocket alarm clock */
const punkt: Drawer = (ctx, w, h) => {
  const r = w / 2;
  const cx = r, cy = h - r; // face circle sits on the base
  // feet
  fillRR(ctx, cx - r * 0.55, h - 3, r * 0.35, 3, 1.5, C.graphite);
  fillRR(ctx, cx + r * 0.2, h - 3, r * 0.35, 3, 1.5, C.graphite);
  // bell hump
  ctx.beginPath();
  ctx.arc(cx, cy - r + 2, r * 0.28, Math.PI, 0);
  ctx.fillStyle = C.case;
  ctx.fill();
  // body
  dot(ctx, cx, cy, r, C.white);
  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 0.75, 0, Math.PI * 2);
  ctx.stroke();
  // ticks
  ctx.strokeStyle = C.case;
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    ctx.lineTo(cx + Math.cos(a) * (r - 7), cy + Math.sin(a) * (r - 7));
    ctx.stroke();
  }
  // hands at 10:08
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(-2.1) * r * 0.45, cy + Math.sin(-2.1) * r * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(-0.55) * r * 0.68, cy + Math.sin(-0.55) * r * 0.68);
  ctx.stroke();
  dot(ctx, cx, cy, 1.8, C.ink);
  // orange second-dot at rim
  dot(ctx, cx + Math.cos(-1.1) * (r - 5.5), cy + Math.sin(-1.1) * (r - 5.5), 2.2, C.orange);
};

/** RM-02 Funk — transistor radio */
const funk: Drawer = (ctx, w, h) => {
  fillRR(ctx, 0, 0, w, h, 7, C.body, C.hairline);
  // speaker grid upper 2/3
  holes(ctx, 9, 10, 6, 6, (w - 18) / 5, 1.5);
  // divider hairline
  ctx.strokeStyle = C.hairline;
  ctx.beginPath();
  ctx.moveTo(6, h * 0.66);
  ctx.lineTo(w - 6, h * 0.66);
  ctx.stroke();
  // tuning dial with orange pointer
  const dy = h * 0.83;
  dot(ctx, w * 0.3, dy, 8.5, C.white);
  ctx.strokeStyle = C.case;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.3, dy, 8.5, 0, Math.PI * 2);
  ctx.strokeStyle = C.hairline;
  ctx.stroke();
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, dy);
  ctx.lineTo(w * 0.3 + 6, dy - 4.5);
  ctx.stroke();
  // thumbwheel slot
  fillRR(ctx, w * 0.55, dy - 2.5, w * 0.3, 5, 2.5, C.graphite);
};

/** RM-03 Notiz — pocket tape recorder */
const notiz: Drawer = (ctx, w, h) => {
  // leather strap peeking over the top
  ctx.strokeStyle = C.taupe;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, 4);
  ctx.quadraticCurveTo(w / 2, -6, w * 0.7, 4);
  ctx.stroke();
  fillRR(ctx, 0, 2, w, h - 2, 8, C.body, C.hairline);
  // cassette window
  const wx = w * 0.14, wy = h * 0.18, ww = w * 0.72, wh = h * 0.4;
  fillRR(ctx, wx, wy, ww, wh, 5, C.bodyDark, C.hairline);
  dot(ctx, wx + ww * 0.28, wy + wh / 2, wh * 0.28, C.dark);
  dot(ctx, wx + ww * 0.72, wy + wh / 2, wh * 0.28, C.dark);
  dot(ctx, wx + ww * 0.28, wy + wh / 2, wh * 0.12, C.body);
  dot(ctx, wx + ww * 0.72, wy + wh / 2, wh * 0.12, C.body);
  // acrylic sheen
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(wx + 3, wy + wh - 3);
  ctx.lineTo(wx + ww * 0.4, wy + 3);
  ctx.stroke();
  // three piano keys, middle orange (record)
  const ky = h * 0.72, kw = w * 0.22, kh = h * 0.17;
  fillRR(ctx, w * 0.13, ky, kw, kh, 3, C.case, C.hairline);
  fillRR(ctx, w * 0.39, ky, kw, kh, 3, C.orange);
  fillRR(ctx, w * 0.65, ky, kw, kh, 3, C.case, C.hairline);
};

/** RM-04 Zahl — desktop calculator (wedge, top display visible) */
const zahl: Drawer = (ctx, w, h) => {
  fillRR(ctx, 0, 0, w, h, 6, C.body, C.hairline);
  // top face wedge with display
  fillRR(ctx, 3, 3, w - 6, h * 0.22, 4, C.bodyDark);
  fillRR(ctx, w * 0.12, h * 0.06, w * 0.76, h * 0.13, 2, C.dark);
  ctx.fillStyle = "#9fb2a0";
  ctx.font = `600 ${h * 0.1}px ui-monospace, monospace`;
  ctx.textAlign = "right";
  ctx.fillText("0.", w * 0.84, h * 0.165);
  // 4×4 key grid, one orange `=`
  const gx = w * 0.1, gy = h * 0.32, pitch = (w * 0.8) / 4;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const orange = i === 3 && j === 3;
      const kx = gx + i * pitch, ky = gy + j * pitch * 0.72;
      dot(ctx, kx + pitch * 0.38, ky + pitch * 0.3, pitch * 0.3, orange ? C.orange : C.white);
      if (!orange) {
        ctx.strokeStyle = C.hairline;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(kx + pitch * 0.38, ky + pitch * 0.3, pitch * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
};

/** RM-05 Klang — bookshelf speaker (squircle, spiral grille) */
const klang: Drawer = (ctx, w, h) => {
  // oak rim catching light on top
  fillRR(ctx, 0, 0, w, h, w * 0.24, C.oak);
  fillRR(ctx, 2, 3, w - 4, h - 5, w * 0.22, C.body);
  spiralHoles(ctx, w / 2, h / 2 + 1, Math.min(w, h) * 0.38);
  // orange power dot, bottom center
  dot(ctx, w / 2, h - 8, 2.6, C.orange);
};

/** RM-06 Welle — table radio (slat grille + tuning scale) */
const welle: Drawer = (ctx, w, h) => {
  // plinth
  fillRR(ctx, w * 0.06, h - 5, w * 0.88, 5, 2, C.graphite);
  fillRR(ctx, 0, 0, w, h - 4, 6, C.body, C.hairline);
  // top-face key row
  const bw = w * 0.05;
  for (let i = 0; i < 4; i++) fillRR(ctx, w * 0.62 + i * bw * 1.5, 4, bw, 4, 1.5, C.case, C.hairline);
  // slat grille, left half
  ctx.fillStyle = C.dark;
  const slats = 13, gx = w * 0.07, gw = w * 0.42, gy = h * 0.16, gh = h * 0.68;
  for (let i = 0; i < slats; i++)
    fillRR(ctx, gx, gy + (i * gh) / slats, gw, (gh / slats) * 0.55, 1, C.dark);
  // tuning scale, right — vertical, red needle
  const sx = w * 0.58, sw = w * 0.34, sy = h * 0.16;
  fillRR(ctx, sx, sy, sw, h * 0.5, 3, C.white, C.hairline);
  ctx.strokeStyle = C.case;
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(sx + 4, sy + (i * h * 0.5) / 6);
    ctx.lineTo(sx + sw - 4, sy + (i * h * 0.5) / 6);
    ctx.stroke();
  }
  ctx.strokeStyle = "#c33";
  ctx.beginPath();
  ctx.moveTo(sx + 3, sy + h * 0.21);
  ctx.lineTo(sx + sw - 3, sy + h * 0.21);
  ctx.stroke();
  // knob row + one orange
  dot(ctx, sx + sw * 0.2, h * 0.82, 4.5, C.white);
  ctx.strokeStyle = C.hairline;
  ctx.beginPath();
  ctx.arc(sx + sw * 0.2, h * 0.82, 4.5, 0, Math.PI * 2);
  ctx.stroke();
  dot(ctx, sx + sw * 0.6, h * 0.82, 4.5, C.orange);
};

/** RM-07 Dreh — record player (low console, platter on visible top plane) */
const dreh: Drawer = (ctx, w, h) => {
  // body
  fillRR(ctx, 0, h * 0.42, w, h * 0.55, 5, C.body, C.hairline);
  // top plane (raised camera): acrylic-lidded deck
  fillRR(ctx, w * 0.02, 0, w * 0.96, h * 0.5, 6, C.bodyDark, C.hairline);
  // platter
  const px = w * 0.38, py = h * 0.25;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(1, 0.55); // foreshortened circle
  dot(ctx, 0, 0, w * 0.26, C.dark);
  dot(ctx, 0, 0, w * 0.09, C.orange); // record label
  dot(ctx, 0, 0, w * 0.012, C.ink);
  ctx.restore();
  // tonearm
  ctx.strokeStyle = C.steelDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.82, h * 0.08);
  ctx.lineTo(w * 0.62, h * 0.3);
  ctx.stroke();
  dot(ctx, w * 0.82, h * 0.08, 3.5, C.steel);
  // acrylic lid hint
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1;
  rr(ctx, w * 0.04, 2, w * 0.92, h * 0.46, 5);
  ctx.stroke();
  // fascia: two knobs + vent
  dot(ctx, w * 0.82, h * 0.7, 4, C.white);
  ctx.strokeStyle = C.hairline;
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.7, 4, 0, Math.PI * 2);
  ctx.stroke();
  dot(ctx, w * 0.91, h * 0.7, 4, C.white);
  ctx.beginPath();
  ctx.arc(w * 0.91, h * 0.7, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = C.case;
  for (let i = 0; i < 6; i++) fillRR(ctx, w * 0.07 + i * 7, h * 0.66, 4, 8, 1, C.case);
};

/** RM-08 Bild — portable television */
const bild: Drawer = (ctx, w, h) => {
  // antenna nub
  fillRR(ctx, w * 0.46, 0, w * 0.08, 6, 2, C.case);
  fillRR(ctx, 0, 4, w, h - 4, w * 0.16, C.body, C.hairline);
  // screen
  const sx = w * 0.1, sy = h * 0.09, sw = w * 0.8, sh = h * 0.66;
  fillRR(ctx, sx, sy, sw, sh, w * 0.09, C.screen);
  // scanline sheen
  const grad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
  grad.addColorStop(0, "rgba(255,255,255,0.14)");
  grad.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  rr(ctx, sx, sy, sw, sh, w * 0.09);
  ctx.fill();
  // grille dots along bottom lip
  holes(ctx, w * 0.16, h * 0.85, 10, 2, w * 0.07, 1.6);
  // orange channel knob
  dot(ctx, w * 0.88, h * 0.87, 5, C.orange);
};

/** RM-09 System — modular hi-fi stack */
const system: Drawer = (ctx, w, h) => {
  const mh = (h - 8) / 3;
  const brushed = (y: number) => {
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(6, y + (i * mh) / 6);
      ctx.lineTo(w - 6, y + (i * mh) / 6);
      ctx.stroke();
    }
  };
  // module 1: reel-to-reel
  fillRR(ctx, 0, 0, w, mh, 5, C.steel, C.steelDark);
  brushed(0);
  dot(ctx, w * 0.3, mh / 2, mh * 0.34, C.white);
  dot(ctx, w * 0.7, mh / 2, mh * 0.34, C.white);
  dot(ctx, w * 0.3, mh / 2, mh * 0.12, C.graphite);
  dot(ctx, w * 0.7, mh / 2, mh * 0.12, C.graphite);
  dot(ctx, w * 0.92, mh * 0.2, 3.5, C.orange); // record dot
  // module 2: amplifier
  fillRR(ctx, 0, mh + 4, w, mh, 5, C.steel, C.steelDark);
  brushed(mh + 4);
  for (let i = 0; i < 4; i++) {
    dot(ctx, w * (0.2 + i * 0.2), mh + 4 + mh / 2, mh * 0.16, C.white);
    ctx.strokeStyle = C.steelDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w * (0.2 + i * 0.2), mh + 4 + mh / 2, mh * 0.16, 0, Math.PI * 2);
    ctx.stroke();
  }
  // module 3: tuner
  fillRR(ctx, 0, (mh + 4) * 2, w, mh, 5, C.steel, C.steelDark);
  brushed((mh + 4) * 2);
  fillRR(ctx, w * 0.1, (mh + 4) * 2 + mh * 0.3, w * 0.8, mh * 0.18, 2, C.white, C.steelDark);
  ctx.strokeStyle = "#c33";
  ctx.beginPath();
  ctx.moveTo(w * 0.62, (mh + 4) * 2 + mh * 0.28);
  ctx.lineTo(w * 0.62, (mh + 4) * 2 + mh * 0.5);
  ctx.stroke();
  ctx.fillStyle = C.graphite;
  for (let i = 0; i < 5; i++) fillRR(ctx, w * (0.15 + i * 0.15), (mh + 4) * 2 + mh * 0.62, w * 0.08, mh * 0.14, 2, C.graphite);
};

/** RM-10 Regal — modular sideboard on hairpin legs */
const regal: Drawer = (ctx, w, h) => {
  const bodyH = h * 0.72;
  // hairpin legs
  ctx.strokeStyle = C.graphite;
  ctx.lineWidth = 2;
  for (const lx of [w * 0.1, w * 0.88]) {
    ctx.beginPath();
    ctx.moveTo(lx - 4, bodyH);
    ctx.lineTo(lx + 2, h);
    ctx.moveTo(lx + 8, bodyH);
    ctx.lineTo(lx + 2, h);
    ctx.stroke();
  }
  // carcass: oak sides, white front
  fillRR(ctx, 0, 0, w, bodyH, 6, C.oak);
  fillRR(ctx, w * 0.03, 3, w * 0.94, bodyH - 6, 4, C.white, C.hairline);
  // three flush doors
  const dw = (w * 0.94) / 3;
  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.03 + dw * i, 6);
    ctx.lineTo(w * 0.03 + dw * i, bodyH - 6);
    ctx.stroke();
  }
  // door 1: radio grille
  holes(ctx, w * 0.09, bodyH * 0.25, 6, 4, dw * 0.12, 1.6, C.case);
  // door 2: turntable well
  ctx.save();
  ctx.translate(w * 0.5, bodyH * 0.48);
  ctx.scale(1, 0.5);
  dot(ctx, 0, 0, dw * 0.3, C.bodyDark);
  dot(ctx, 0, 0, dw * 0.1, C.dark);
  ctx.restore();
  // door 3: blank storage with tiny handle
  fillRR(ctx, w * 0.87, bodyH * 0.45, w * 0.05, 3, 1.5, C.case);
  // the orange cable spiral, leftmost door
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

/** RM-11 Monolith — the thesis */
const monolith: Drawer = (ctx, w, h) => {
  const r = Math.min(w, h) / 2 - 2;
  const cx = w / 2, cy = h / 2;
  // plinth-thin edge
  dot(ctx, cx, cy, r, C.white);
  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 0.75, 0, Math.PI * 2);
  ctx.stroke();
  // the single orange dot
  dot(ctx, cx, cy, 12, C.orange);
};

const DRAWERS: Drawer[] = [punkt, funk, notiz, zahl, klang, welle, dreh, bild, system, regal, monolith];
