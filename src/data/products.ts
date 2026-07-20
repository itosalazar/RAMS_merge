/**
 * The RM series — eleven fictional products, 1962–2024 (GDD §3/§4).
 * Footprint = physics body on the table plane. Sprite = front elevation.
 */

export type Footprint =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

export type SoundMaterial =
  | "plastic"
  | "wood"
  | "metal"
  | "glass"
  | "fabric"
  | "ceramic";

export interface Product {
  tier: number;
  model: string;
  name: string;
  object: string;
  year: number;
  footprint: Footprint;
  /** Visual height of the front-elevation sprite, plane units. */
  spriteH: number;
  material: SoundMaterial;
  materials: string; // museum card chips
  principle: number; // 1..10, the principle this object embodies
  rationale: string; // museum card prose, curator voice
}

export const PRODUCTS: Product[] = [
  {
    tier: 1,
    model: "RM-01",
    name: "Punkt",
    object: "Pocket alarm clock",
    year: 1962,
    footprint: { kind: "circle", r: 30 },
    spriteH: 66,
    material: "plastic",
    materials: "ABS, glass, steel",
    principle: 10,
    rationale:
      "The Punkt asks a single question — what time is it? — and refuses to answer anything else. One face, two hands, one orange second-dot circling like a patient metronome. Its bell rings once, apologises, and stops. The smallest object in the series, and the hardest to improve.",
  },
  {
    tier: 2,
    model: "RM-02",
    name: "Funk",
    object: "Transistor radio",
    year: 1963,
    footprint: { kind: "rect", w: 66, h: 48 },
    spriteH: 88,
    material: "plastic",
    materials: "ABS, aluminium, paper cone",
    principle: 4,
    rationale:
      "A radio the size of a matchbox, honest about its anatomy: holes where the sound comes out, a dial where the world comes in. The Funk's twenty-four perforations were drilled, not moulded — the workshop believed you should hear the tooling. Turn the orange pointer and somewhere, an orchestra.",
  },
  {
    tier: 3,
    model: "RM-03",
    name: "Notiz",
    object: "Pocket tape recorder",
    year: 1965,
    footprint: { kind: "rect", w: 82, h: 58 },
    spriteH: 104,
    material: "plastic",
    materials: "ABS, acrylic, leather",
    principle: 2,
    rationale:
      "Memory, made mechanical. The Notiz records exactly what it hears and plays back exactly what it recorded — a radical form of honesty in 1965. Three keys: back, record, forward. The record key is orange because it is the only one that changes anything. The leather strap outlived every cassette.",
  },
  {
    tier: 4,
    model: "RM-04",
    name: "Zahl",
    object: "Desktop calculator",
    year: 1968,
    footprint: { kind: "rect", w: 100, h: 88 },
    spriteH: 96,
    material: "plastic",
    materials: "ABS, silicone, LED",
    principle: 4,
    rationale:
      "Sixteen keys, arranged the way fingers actually move. The Zahl's designers spent a year on the key travel — 1.2 millimetres, with a click you feel before you hear. The equals key is orange: the moment of consequence deserves the accent. Everything else is arithmetic.",
  },
  {
    tier: 5,
    model: "RM-05",
    name: "Klang",
    object: "Bookshelf speaker",
    year: 1971,
    footprint: { kind: "circle", r: 62 },
    spriteH: 130,
    material: "fabric",
    materials: "Beech ply, wool fabric, ABS",
    principle: 5,
    rationale:
      "The Klang abandons the cabinet. A single squircle of acoustic fabric, edged in oak, designed to be heard and then forgotten. The perforation spiral is not mysticism — equal hole spacing whistled at 4 kHz. One orange dot marks power. Nothing else asked to exist.",
  },
  {
    tier: 6,
    model: "RM-06",
    name: "Welle",
    object: "Table radio-receiver",
    year: 1974,
    footprint: { kind: "rect", w: 150, h: 95 },
    spriteH: 108,
    material: "metal",
    materials: "Steel, elm, acrylic",
    principle: 3,
    rationale:
      "The Welle brought the slat grille indoors: thirteen horizontal openings, machined until the shadows fell evenly. Its tuning scale is printed at 1:1 — a station occupies exactly the width of the needle that finds it. The aesthetic is a by-product of the acoustics. That was the point.",
  },
  {
    tier: 7,
    model: "RM-07",
    name: "Dreh",
    object: "Record player",
    year: 1977,
    footprint: { kind: "rect", w: 185, h: 130 },
    spriteH: 110,
    material: "glass",
    materials: "Aluminium, acrylic, rubber",
    principle: 6,
    rationale:
      "A record player is a machine that must disappear twice — first visually, then audibly. The Dreh's acrylic lid shows you the mechanism because hiding it would be a lie; the platter spins so quietly the dust stays asleep. The orange label at the centre is the record's, not ours.",
  },
  {
    tier: 8,
    model: "RM-08",
    name: "Bild",
    object: "Portable television",
    year: 1981,
    footprint: { kind: "circle", r: 112 },
    spriteH: 190,
    material: "glass",
    materials: "CRT glass, ABS, steel",
    principle: 5,
    rationale:
      "Television promised the world and delivered furniture. The Bild pushed back: a screen, a handle, one orange channel knob, and no cabinet pretending to be walnut. Off, it is a calm grey object. On, it is only the picture. The best compliment it received: nobody remembered what it looked like.",
  },
  {
    tier: 9,
    model: "RM-09",
    name: "System",
    object: "Modular hi-fi stack",
    year: 1986,
    footprint: { kind: "rect", w: 270, h: 180 },
    spriteH: 220,
    material: "metal",
    materials: "Brushed aluminium, glass, steel",
    principle: 7,
    rationale:
      "Three modules, one grid, zero adjectives. The System was sold in pieces because homes are not showrooms; you bought the tuner when you could afford the tuner. Every knob sits on the same 8-millimetre matrix, so the stack reads as one instrument. It outlasted four owners and three formats.",
  },
  {
    tier: 10,
    model: "RM-10",
    name: "Regal",
    object: "Modular sideboard",
    year: 1994,
    footprint: { kind: "rect", w: 330, h: 200 },
    spriteH: 180,
    material: "wood",
    materials: "Oak, white laminate, steel hairpin",
    principle: 9,
    rationale:
      "By 1994 the electronics had earned a home of their own. The Regal is furniture that behaves like infrastructure: three flush doors, a radio grille, a turntable well, and one orange cable spiral — the only joke the workshop ever allowed itself. Repairable with a screwdriver. Designed to be inherited, not replaced.",
  },
  {
    tier: 11,
    model: "RM-11",
    name: "Monolith",
    object: "Museum-scale concept object",
    year: 2024,
    footprint: { kind: "circle", r: 190 },
    spriteH: 380,
    material: "ceramic",
    materials: "Seamless ceramic",
    principle: 10,
    rationale:
      "The final product does nothing. A seamless ceramic disc, one orange dot at its centre — the RM series reduced to its thesis. Sixty years of radios, recorders and shelving argued toward this silence: the endpoint of good design is the disappearance of design. Exhibited once. Understood slowly.",
  },
];

export const productForTier = (tier: number): Product => PRODUCTS[tier - 1];

export const MAX_TIER = PRODUCTS.length;

/** Approximate occupied area of a footprint (plane units²). */
export function footprintArea(f: Footprint): number {
  return f.kind === "circle" ? Math.PI * f.r * f.r : f.w * f.h;
}

/** Radius used for magnet range / spawn clearance. */
export function footprintRadius(f: Footprint): number {
  return f.kind === "circle" ? f.r : Math.hypot(f.w, f.h) / 2;
}
