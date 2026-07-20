# RAMS MERGE

**A quiet celebration of industrial design.**
A merge game on a designer's drafting table, built the way Braun would have built a digital toy: cool grey, one orange, honest physics, and a museum you earn by playing.

> *Weniger, aber besser.* — Less, but better.

---

## What it is

Slide fictional mid-century products across a drafting table seen in perspective. Two identical products that meet with intent merge into the next, larger object — eleven tiers, from the **RM-01 Punkt** pocket alarm clock (1962) to the **RM-11 Konzert**, a concert stereo console built for a single exhibition (2024).

There are no coins and no gems. Progression is **knowledge**: every discovery files a museum card, a Rams principle, or a design-history note into your personal Archive — a growing exhibition of everything you've made.

### Five modes

| Mode | The idea |
|---|---|
| **Classic** | Merge endlessly. The bench is finite. |
| **Time Attack** | One daily-seeded target product. Build it fast. |
| **Speed Merge** | Every merge resets a shrinking clock. Survive. |
| **Shrinking** | The table closes in; targets buy back space. |
| **Zen** | No score, no timer. Just the work. |

### The details that matter

- **Honest physics** — Matter.js on a flat plane; the perspective is applied after simulation, so aiming is never distorted. Big products are genuinely ~18× heavier than small ones.
- **Magnetic merges** — same-tier products attract gently; merges feel earned, then inevitable.
- **Synthesized ASMR** — every impact is voiced by its material pair (plastic·wood ≠ metal·metal), merges snap up a pentatonic ladder, and the 54 BPM ambient score is generated, not looped. The whole soundtrack is code.
- **Rams Moments** — a tiny monochrome pixel mentor appears on great plays and calmly delivers one of the Ten Principles of Good Design.
- **Nothing expires** — everything is stored on-device. No accounts, no tracking, no currency.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine + content tests (vitest)
npm run typecheck  # strict TypeScript
npm run build      # production build
```

Installable as a PWA; plays offline after the first visit.

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS 4 · Matter.js · Framer Motion (chrome only — never in the 60 fps loop) · Web Audio API · zustand · a hand-rolled service worker.

The game core (`src/engine/`) is framework-free: one canvas, a fixed 60 Hz timestep, pre-rendered vector sprites, and a typed event bus to React. Adding a product family is a data change, not a code change (`src/data/products.ts`).

## Deploying

Push to GitHub, import into [Vercel](https://vercel.com) — zero configuration. Every route is static; there is no server runtime.

## Design

The full Game Design Document lives at [docs/GDD.md](docs/GDD.md) — philosophy, evolution tree, color system, physics numbers, audio recipes, and the roadmap. The visual language is drawn from Dieter Rams' work at Braun and the Ulm School tradition: warm whites, hairline grids, museum typography (Hanken Grotesk), and **orange only where it matters**.

---

*Good design is as little design as possible.*
