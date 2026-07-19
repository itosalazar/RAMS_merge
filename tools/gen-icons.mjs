/**
 * Generates the PWA PNG icons from the same geometry as public/icons/icon.svg.
 * Zero dependencies — flat shapes rasterized by hand, encoded with zlib.
 * Run: node tools/gen-icons.mjs
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const PAPER = [0xf3, 0xf4, 0xf6];
const ORANGE = [0xed, 0x80, 0x08];
const INK = [0x23, 0x25, 0x28];

/** Signed-distance helpers (4x supersampled coverage). */
const sdRoundRect = (x, y, cx, cy, hw, hh, r) => {
  const qx = Math.abs(x - cx) - (hw - r);
  const qy = Math.abs(y - cy) - (hh - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const sdCircle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;

function render(size, maskable) {
  const s = size / 512;
  const px = new Uint8Array(size * size * 4);
  const SS = 4; // supersamples per axis
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgCov = 0, barCov = 0, dotCov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = x + (sx + 0.5) / SS;
          const fy = y + (sy + 0.5) / SS;
          const bg = maskable
            ? -1
            : sdRoundRect(fx, fy, size / 2, size / 2, size / 2, size / 2, 96 * s);
          if (bg < 0) {
            bgCov++;
            if (sdRoundRect(fx, fy, 256 * s, 232 * s, 152 * s, 56 * s, 8 * s) < 0) barCov++;
            else if (sdCircle(fx, fy, 256 * s, 368 * s, 22 * s) < 0) dotCov++;
          }
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      const a = bgCov / n;
      // composite: paper base, then bar/dot coverage
      const mix = (c, cov, base) => Math.round(base + (c - base) * cov);
      const paperOr = (k) => PAPER[k];
      px[i] = mix(ORANGE[0], barCov / n, mix(INK[0], dotCov / n, paperOr(0)));
      px[i + 1] = mix(ORANGE[1], barCov / n, mix(INK[1], dotCov / n, paperOr(1)));
      px[i + 2] = mix(ORANGE[2], barCov / n, mix(INK[2], dotCov / n, paperOr(2)));
      px[i + 3] = Math.round(a * 255);
    }
  }
  return encodePNG(size, size, px);
}

function encodePNG(w, h, rgba) {
  const crcTable = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });
  const crc = (buf) => {
    let c = -1;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, crcBuf]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // filter 0 per scanline
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (1 + w * 4) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "icon-192.png"), render(192, false));
writeFileSync(join(OUT, "icon-512.png"), render(512, false));
writeFileSync(join(OUT, "icon-512-maskable.png"), render(512, true));
writeFileSync(join(OUT, "apple-touch-icon.png"), render(180, true));
console.log("icons written to", OUT);
