# RAMS MERGE
## Game Design Document — v1.1

*A digital design object that happens to be a game.*

**Platform:** Mobile-first web (PWA) · **Stack:** Next.js / TypeScript / Matter.js · **Status:** Awaiting approval

---

## 1. Core Design Philosophy

**Weniger, aber besser.** Less, but better.

RAMS Merge is not a Suika clone wearing a Braun costume. It is an interactive answer to a question: *what would a casual game look like if Dieter Rams had designed it in 1968 — and it had quietly kept evolving until today?*

Every decision passes through five filters, derived from the Ten Principles:

1. **Honest** — The physics never lies. No rubber-banding, no pity merges, no fake near-misses. What you see colliding is what merges. Weight is real: a turntable genuinely displaces a pocket radio.
2. **Unobtrusive** — The interface disappears during play. No floating coins, no pulsing "TAP HERE" badges, no energy meters. The products are the interface.
3. **As little design as possible** — One accent color. One typeface. One shadow style. If an element can be removed without losing function, it is removed.
4. **Long-lasting** — No seasonal skins, no FOMO. Progression is a permanent, growing archive of design knowledge. The game should feel the same — and as good — in ten years.
5. **Thorough down to the last detail** — The sound a calculator makes when it nudges a speaker is different from the sound it makes against wood. The launch dial has a machined detent every 15 degrees. Details are the game.

**The Reward Philosophy — Knowledge, not currency.**
There are no coins, gems, or loot. The player is rewarded the way a museum rewards a visitor: with understanding. Every new product unlocks a **Museum Card** (design rationale, fictional year, material notes), design sketches, Rams principles, and trivia — assembled into a personal, ever-growing **Archive** (a virtual exhibition). Progression *is* curation. The game educates through use, which is the most Rams idea of all.

**Tone target:** Nintendo's tactility × Braun's restraint × the calm of a well-lit museum on a Tuesday morning.

---

## 2. Gameplay Loop

### 2.1 The Table

Play happens on a **designer's drafting table seen in perspective** (reference: `game_ref_01/02`) — the camera is raised ~30° above the far edge, so the table recedes into the screen with real depth. The surface is a **warm-paper drafting grid** — fine 1px hairline squares in `case` grey on `bench` paper, with heavier hairlines every 8 cells and faint registration crosses at the corners: blueprint discipline without the blue.

The simulation itself is a flat, frictionless-feeling 2D plane (no gravity pulling objects down-screen); the perspective is pure presentation. Products **slide into the depth of the table**, carom off the raised wooden rail, transfer momentum, and settle naturally — closer to shuffleboard than to Suika's drop-bucket. Products are rendered **front-view, standing upright** on the grid like Braun catalogue photography, each grounded by a soft contact shadow. This is our key mechanical differentiator, and it is what makes the "tabletop" premise honest.

A **dashed launch line** spans the near edge of the table; the player slides products from below it up into the field.

### 2.2 Core Loop (one breath, ~10 seconds)

```
SEE next product (staging tray, below the launch line)
→ AIM   drag left/right and pull back: a thin hairline guide extends up the table, power shown as dial ticks
→ LAUNCH release: the product slides up, into the table's depth
→ WATCH physics: it bumps, rotates, nudges the field, settles among the others
→ MERGE two identical products that touch with enough intent become one, larger
→ BREATHE the field has changed; plan the next shot
```

### 2.3 Merge Rules

- Two products of the same tier **merge on contact** when relative velocity exceeds a small threshold (0.35 m/s) *or* when they rest in contact for 600 ms (a slow "magnetic settle" merge — feels like a precision part clicking home).
- **Magnetic assist:** same-tier products within 1.15× their combined radii experience a gentle mutual attraction (max 0.002 N·scaled). Merges feel *earned but inevitable* — like magnets finding each other, never like vacuum suction.
- The merged product spawns at the pair's center of mass, inheriting their averaged momentum, with a 180 ms compress-and-release scale pulse.
- Chain reactions are natural physics consequences, not scripted: a merge's spawn pulse can nudge neighbors into other merges. **Combos** count merges within a 1.5 s rolling window.

### 2.4 Failure

The bench is full when the **staging tray is blocked** (a new product cannot physically enter) or field occupancy exceeds 85% for 3 continuous seconds. A thin orange hairline around the bench edge fades in as a quiet early warning at 70% — no sirens, no flashing.

### 2.5 Scoring

- Merge score = `tier² × 10`, multiplied by combo (×1.5, ×2, ×3 …).
- Discovering a tier for the first time (per profile) triggers a **Rams Moment** and archive unlock — worth zero points. Knowledge is not exchangeable for score; they are separate economies by design.

---

## 3. Product Evolution Tree

Eleven tiers (Suika-depth). An entirely fictional product family — the **RM series** by an unnamed workshop, 1962–present. Silhouettes, grille patterns, and knob language are *derived from* the reference corpus but belong to no real product. All products render as **front-view elevations standing upright on the table** — exactly how Braun products were photographed for catalogues — with a hint of top plane revealed by the raised camera. Geometric, iconic, legible at small sizes, like the Braun icon-poster reference.

The **footprint** below is the physics body on the table plane (what collides and merges); the visible sprite is the product's front elevation, whose height may exceed its footprint depth.

| Tier | Model | Object | Fictional Year | Footprint (Ø or w×h, px @1x) | Body Shape | Material Voice |
|---|---|---|---|---|---|---|
| 1 | RM-01 *Punkt* | Pocket alarm clock | 1962 | Ø 44 | circle | hard plastic, tiny |
| 2 | RM-02 *Funk* | Matchbox transistor radio | 1963 | 56×40 | rounded rect | plastic + speaker holes |
| 3 | RM-03 *Notiz* | Pocket tape recorder | 1965 | 72×50 | rounded rect | plastic + metal keys |
| 4 | RM-04 *Zahl* | Desktop calculator | 1968 | 74×98 | rounded rect | matte plastic, key grid |
| 5 | RM-05 *Klang* | Bookshelf speaker | 1971 | Ø 118 | squircle | fabric + wood edge |
| 6 | RM-06 *Welle* | Table radio-receiver | 1974 | 168×110 | rounded rect | steel slat grille |
| 7 | RM-07 *Dreh* | Record player | 1977 | 196×150 | rounded rect + disc | acrylic lid, platter |
| 8 | RM-08 *Bild* | Portable television | 1981 | Ø 224 | squircle | CRT glass + housing |
| 9 | RM-09 *System* | Modular hi-fi stack | 1986 | 268×200 | rounded rect | brushed aluminium |
| 10 | RM-10 *Regal* | Modular sideboard | 1994 | 340×230 | rounded rect | oak + white laminate |
| 11 | RM-11 *Monolith* | Museum-scale concept object | 2024 | Ø 400 | perfect circle | seamless ceramic |

**Evolution logic:** personal → desktop → room → architecture → idea. Each step up is a believable increase in scale, complexity, and cultural weight. RM-11 *Monolith* is deliberately the simplest form in the game — a perfect white circle with a single orange dot — because the endpoint of good design is the disappearance of design. Creating it in Classic mode clears the bench (its "exhibition debut") and scores massively.

**Mass & feel:** density scales with tier (§10), so an RM-09 barrelling across the bench scatters RM-02s like a cruise ship among rowboats. Weight hierarchy is the emotional spine of the physics.

---

## 4. Product Concept Sketches (described)

All products drawn as **front elevations standing on the table**, flat design + a hint of top plane (raised camera) + one soft elliptical contact shadow at the base, on the warm-white body palette. Orange appears on exactly **one element per product** — the "vital control."

- **RM-01 Punkt** — A small round-faced alarm clock on two stub feet. Hairline grey bezel, two black hands at 10:08, one orange sweep-second dot at the rim, tiny bell hump on top. The game's atom.
- **RM-02 Funk** — Upright rounded rectangle; upper two-thirds a 6×4 grid of speaker holes, lower third a small circular tuning dial with orange pointer beside a thin thumbwheel slot. Reads "radio" in eight shapes.
- **RM-03 Notiz** — Upright rounded rectangle; centered cassette window (two dark reel circles behind 1px acrylic), three piano keys along the bottom face — the middle key orange (record). A stitch of leather strap peeks over the top edge.
- **RM-04 Zahl** — Portrait slab, gently wedge-shaped (top face visible as a thin dark display strip showing `0.` in dot-matrix); 4×4 key grid on the front. Fifteen warm-grey keys, one orange `=` key, lower right.
- **RM-05 Klang** — An upright squircle cabinet wearing a full-face dot-grid grille (concentric perforation like the DR06 reference); thin oak rim catching the light on top; small orange power dot at the lower edge, dead center.
- **RM-06 Welle** — Landscape cabinet on a slim plinth; horizontal slat grille across the left half (the black-and-white slatted reference), thin vertical tuning scale with red hairline needle on the right, row of four grey push buttons along the top face.
- **RM-07 Dreh** — Low, wide console; the raised camera reveals its top plane: dark platter circle (record with orange center label) under a 1px acrylic lid outline, slim tonearm at 2 o'clock, two small knobs on the front fascia beside a slatted vent.
- **RM-08 Bild** — A rounded-cube television; rounded-square screen (very dark grey-green, faint scanline sheen) filling the face, grille dots along the bottom lip, one orange channel knob at the lower right corner, stub antenna nub on top.
- **RM-09 System** — A vertical hi-fi stack of three modules with visible 2px seams: reel-to-reel on top (two reels seen face-on), amplifier middle (row of four knobs), tuner below (horizontal scale). Brushed-metal texture as subtle horizontal hairlines. Orange record dot on the top module.
- **RM-10 Regal** — Wide, low sideboard on four hairpin legs: two oak-tone side panels, white lacquer front with three flush module doors (radio grille, turntable well, blank storage). One orange coiled cable hangs from the leftmost door — the only playful gesture in the entire tree.
- **RM-11 Monolith** — A Ø 400 perfect warm-white disc standing on edge, museum-plinth thin, no grille, no controls. A single centered orange dot Ø 24. Its shadow is slightly deeper than all others — it *weighs* culturally.

---

## 5. Visual Design System

**Design principle:** the game screen is a **product photograph you can touch**. Minimal Japanese product-photography lighting: single soft top-light, shadows at 12% opacity, no gradients except two sanctioned material sheens (CRT glass, brushed metal).

- **Layout grid:** strict 8-pt. Spacing scale: 4 / 8 / 16 / 24 / 32 / 48 / 64.
- **Radii:** 4 (keys) / 8 (cards, buttons) / 16 (panels) / 24 (bench corners) / full (dials, dots).
- **Shadows:** exactly two — `contact: 0 1px 2px rgba(38,18,1,0.10)` and `raised: 0 4px 16px rgba(38,18,1,0.08)`. Nothing floats higher.
- **Hairlines:** 1px, `#D9D2C6` — the connective tissue of the entire UI (dividers, dial ticks, aim line).
- **Iconography:** geometric, 2px stroke, derived from Braun control glyphs (▶ ■ ● ▲▼); no icon library — we draw all ~20 ourselves.
- **The table:** a drafting table in perspective. Surface `bench` (#E8E4DC) ruled with a fine drafting grid — 1px hairline squares in `#D3CCC0` (24px pitch at the near edge, converging with the perspective), heavier `case` hairlines every 8 cells, faint registration crosses at the corners. Blueprint rigor, warm paper instead of blue. Products sink "into" this grid as they slide deeper. The rail is a raised wooden edge frame in `taupe`-tinted oak with a 2px highlight on its top face; the dashed launch line sits near the bottom edge in `graphite` dashes (8/8px).
- **Depth cues (exactly three, no more):** perspective convergence of the grid, sprite scale falloff (100% at launch line → 82% at far rail), and y-sorted overlap. No blur, no fog, no fake lighting gradient.

---

## 6. Color Palette

Anchored to the documented reference palettes (DR01 / DR06) and the black-orange-grey system sheet.

### Core
| Token | Hex | Use |
|---|---|---|
| `paper` | `#F4F2ED` | app background, product bodies (light) |
| `bench` | `#E8E4DC` | tabletop |
| `case` | `#D9D2C6` | hairlines, secondary surfaces, DR06 `D9D2C6` |
| `steel` | `#AAB7BF` | metal products, cool accents (DR01) |
| `taupe` | `#736356` | wood/warm-grey products (DR01) |
| `graphite` | `#4D4D4D` | secondary text, dark knobs |
| `ink` | `#261201` | primary text, near-black (DR01) — never pure #000 |

### Accent (used with extreme discipline)
| Token | Hex | Use |
|---|---|---|
| `orange` | `#ED8008` | THE accent (DR06). Logo bar, one control per product, primary CTA, combo counter |
| `orange-deep` | `#EA5B0C` | pressed states, record dots |
| `signal-red` | `#AD1D1D` | destructive only (quit, reset) — rare |
| `olive` | `#736B1E` | single achievement tier accent (DR06) — rarer |

**Rule of Orange:** orange is the accent that threads through the entire game — logo bar, primary CTA, each product's vital control, combo counter, merge particles, active tab dot, warning hairline. But it stays an *accent*: at most one orange element per composed view is interactive, and orange never fills large surfaces. It always means "the vital thing," which is precisely why it works everywhere.

Dark theme ("Night Shift," unlockable): `paper→#1C1A17`, `ink→#EDEAE3`, bench `#242220`; orange unchanged — like a Braun clock's luminous hands.

---

## 7. Typography System

**One typeface:** [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) (Google Fonts, variable). Loaded via `next/font` — self-hosted, zero layout shift, offline-safe.

| Style | Weight | Size/Line | Tracking | Use |
|---|---|---|---|---|
| Display | 800 | 56/56 | -0.02em | logo, game-over score |
| H1 | 700 | 32/40 | -0.01em | screen titles (MONDAY-style, all-caps) |
| H2 | 600 | 24/32 | 0 | card titles |
| Body | 400 | 16/24 | 0 | museum card prose |
| Caption | 500 | 13/16 | +0.04em, caps | labels under controls (`volume`-style) |
| Data | 600, tabular-nums | 20/24 | +0.02em | score, timers |

**One exception:** the score/timer readout and Rams Moment captions use a **dot-matrix treatment** — Hanken Grotesk digits rendered through a 5×7 dot shader (like the TP-7 "TODAY" display and pixel-clock references). It is a *material*, not a second font.

All-caps day-name headers (reference: MONDAY/TUESDAY to-do app) become mode headers: **CLASSIC**, **TIME ATTACK**, **ZEN**.

---

## 8. UI Component Library

Every component is a fictional Braun control. Inventory (~16 components):

1. **PushKey** — primary button. Rounded-rect key with 1px darker base edge; pressing translates it down 2px and darkens 6% (a physical key, not a color swap). Orange variant = primary CTA.
2. **Dial** — circular knob for settings (volume, haptics). Drag to rotate; 15° detents with tick marks and a caption label beneath. The game's signature control.
3. **SlideSwitch** — two/three-position toggle (mode select, sound on/off). Travels with a magnetic snap, never a fade.
4. **HairlineCard** — museum card: 1px border, 16px radius, `paper` fill, `raised` shadow on press.
5. **StagingTray** — dock below the launch line showing the current product in place and the next product in a recessed well, top-right (as in the Tasty Travels reference, minus the noise).
6. **AimHairline** — 1px guide line extending from the product up into the table's perspective + power shown as dial ticks arcing around the launch point.
7. **ScoreLedger** — top-left dot-matrix score; combo appears as `×2` in orange beside it.
8. **ProgressDots** — level/tier progress as a row of Ø 6 dots filling in (never a bar).
9. **ModalPanel** — full-width bottom sheet with 24px top radius; drag handle is a 32×4 grey pill.
10. **TabRail** — bottom navigation, 4 items (Play / Archive / Records / Settings), caption-style labels, active item gets the orange dot.
11. **MuseumCard** — the archive item: product top-view render, model number, fictional year, 60-word rationale, material chips. Modeled on the "1958 Pocket Radio" exhibit reference.
12. **RamsToast** — the Rams Moment overlay (§12 of gameplay; spec in Motion/Audio).
13. **StatCell** — label-over-value cell (reference: "Current week / Week 2" cards).
14. **TickerTape** — thin tuning-scale strip used as Time Attack progress (needle slides along a frequency scale).
15. **GhostRing** — placement preview ring on the bench while aiming.
16. **AppShell** — safe-area-aware frame, max-width 480 centered on desktop with the bench vignette behind.

Touch targets ≥ 48×48. All components keyboard-operable (web a11y) even though touch-first.

---

## 9. Motion Language

**Physical, never cartoon.** Everything moves like it has mass and a damped spring inside — a Braun flip-clock leaf, not a jelly.

- **Curves:** `snap` cubic-bezier(0.2, 0, 0, 1) 120ms (keys, switches) · `settle` spring(stiffness 380, damping 30) (panels, cards) · `drift` ease-out 400ms (fades).
- **Merge event (the money moment, ≤ 400ms total):**
  1. Contact: both bodies compress 6% along the impact axis (80 ms).
  2. Fuse: new product spawns at 92% scale → overshoots to 103% → settles at 100% (spring).
  3. Emission: 6–10 tier-colored dot particles (Ø 2–3) tossed with physics, dying in 300 ms; one soft `paper`-white glow pulse at 8% opacity.
  4. The dot-matrix score ticks up digit-by-digit (odometer style), never all at once.
- **Squash & stretch:** capped at 8% deformation — perceptible, never comic. Implemented as render-layer scaling on impact normal; physics bodies stay rigid.
- **Screen transitions:** bottom-sheet slides + 150ms cross-fades. No page ever "flies."
- **Rams Moment:** 1.1s total — pixel-Rams fades in over 120ms, principle types on in dot-matrix over 500ms, holds 300ms, fades 180ms. The game does not pause; the world quietly continues behind it.
- **Reduced motion:** honors `prefers-reduced-motion` — particles off, springs become fades, physics unchanged.

---

## 10. Physics Specification

**Engine:** Matter.js, fixed 60 Hz step (`Engine.update(engine, 1000/60)` with accumulator), interpolated rendering for 120 Hz displays.

### World
- Gravity: `{ x: 0, y: 0 }` — the simulation is a flat 2D table plane. The perspective view is presentation-only (see *Projection* below).
- Bench friction is simulated via `frictionAir` (a true tabletop drag), tuned low so products glide: small tiers 0.015, large tiers 0.035 (heavier objects grind to rest sooner — feels correct).
- Rail (walls): static rounded-rect chain, `restitution 0.55` — a padded bumper, not a trampoline.

### Bodies (per tier t = 1…11)
| Property | Formula / value | Feel |
|---|---|---|
| Shape | circles & rounded rects (chamfered vertices) matching §3 footprints | honest silhouettes |
| Density | `0.0012 × 1.35^t` | RM-09 ≈ 18× the mass of RM-01 |
| Restitution | `0.42 − 0.02t` (0.40 → 0.20) | small = lively, large = dead-weight thud |
| Friction (surface) | 0.08 | slidey product-on-product contact |
| Angular damping | 0.02 | slow, satisfying residual rotation |
| Launch impulse | player power 0–100% → velocity 4–14 (scaled by 1/√mass) | heavy products need commitment |

### Interactions
- **Momentum transfer** is pure Matter.js conservation — no scripting.
- **Magnetic assist:** custom per-step force between same-tier pairs within `1.15 × (rA + rB)`: `F = 0.002 × min(1, overlapCloseness)` toward each other. Disabled while either body is player-controlled.
- **Merge trigger:** collision pair same tier AND (relSpeed > 0.35 OR sustained contact 600ms). Both removed; replacement body spawned with `velocity = (mA·vA + mB·vB)/(mA+mB)`, `angle = mean`, plus 0.5 rad/s random spin for life.
- **Sleep:** bodies sleep below 0.05 velocity for battery; any launch wakes neighbors in a 1.5× radius.
- **Determinism note:** fixed seed per Time Attack daily run so leaderboard times are comparable.

### Projection (physics plane → perspective table)
The renderer maps the flat physics plane onto the on-screen trapezoid of the table:
- `screenX = lerp(nearLeft, farLeft, depth) + physX × widthScale(depth)` where `depth = physY / tableDepth`.
- `widthScale` narrows linearly from 1.0 (launch line) to ~0.84 (far rail); sprite scale follows the same curve down to 82%.
- Sprites are drawn **anchored at their base** (where product meets table), y-sorted back-to-front so nearer products overlap farther ones correctly.
- Contact shadows are ellipses in table-space (they foreshorten with depth automatically).
- Input is inverse-projected: touches on the trapezoid resolve to plane coordinates, so aiming stays 1:1 honest.

Physics is computed entirely in undistorted plane-space — collision circles/rects never deform. The projection cannot introduce unfairness because it is applied after simulation.

Performance budget: ≤ 60 active bodies (occupancy limit enforces this naturally); collision pairs via built-in grid broadphase; render on a single `<canvas>` — DOM/Framer Motion never touches per-frame object rendering.

---

## 11. Audio Direction

**ASMR of the workshop.** Reference: the soundtrack of a Braun product film — room tone, precise mechanics, warm sine pads.

### Engine
Web Audio API. A single `AudioContext`, unlocked on first gesture. Two buses: **SFX** (compressor → master) and **Music** (lowpass → master), independent Dial-controlled gains. All samples ≤ 96 kB, preloaded, decoded once.

### SFX palette (layered, parameterized — not one-file-per-event)
| Event | Sound design |
|---|---|
| Launch | fingertip flick on matte plastic + faint felt slide |
| Slide loop | filtered pink-noise "felt on paper," volume follows velocity |
| Impact | material pair matrix: plastic·plastic click / plastic·wood knock / metal·metal tink / glass thunk — pitch scales inversely with combined mass (big = lower), velocity maps to gain + lowpass opening |
| Merge | magnetic **snap** (two-layer: soft magnet clack + airy click) + one warm sine blip; pitch steps up a pentatonic degree per tier — an RM-11 merge lands a deep, resonant fifth |
| Combo | adds a subtle tape-machine relay click per chain step |
| UI | PushKey = camera-shutter half-press; Dial = 15° ratchet ticks; SlideSwitch = solid double-clunk |
| Rams Moment | everything ducks −6 dB for 1s; a single soft vibraphone note |
| Warning (85%) | the room tone tightens (highpass sweep) — tension by subtraction, no alarm |

### Music
Generative, not looped MP3s: 4 layers (warm sine pad, sub pulse at 54 BPM, occasional Rhodes-like dyad, vinyl-crackle room tone at −38 dB) mixed by game state — Zen gets all four, Speed Merge drops the pad and doubles the pulse. Built with Web Audio oscillators + one crackle sample, so the entire soundtrack costs ~100 kB and never repeats exactly.

Haptics: `navigator.vibrate` micro-pulses (8 ms tap on impact, 20 ms on merge) where supported; a Dial in Settings.

---

## 12. Game Modes

| Mode | Header | Rules | Failure | Records |
|---|---|---|---|---|
| **Classic** | CLASSIC | Endless merge; RM-11 clears the bench | bench full | highest score, largest product |
| **Time Attack** | TIME ATTACK | Daily seeded target product (RM-06…RM-09); build it fast | none (timer runs) | fastest per target; daily board |
| **Speed Merge** | SPEED MERGE | 12s countdown; any merge resets it to `max(6, 12 − merges×0.1)`s — creeping difficulty | timer hits zero | longest run, most merges |
| **Shrinking Table** | SHRINKING | Rail closes in 4 px/s; creating the random target expands it +25%, new target chosen | bench full | most targets completed |
| **Zen** | ZEN | No score, no timer, no failure; bench auto-declutters lowest tier at 90% occupancy; full ambient music | — | none, deliberately |

Mode select is a **SlideSwitch rail** — modes feel like stations on a tuner, with the TickerTape needle sliding between them.

### Dieter Rams Moments
Trigger on: first discovery of a tier · combo ≥ 3 · personal record broken · RM-11 created.
A 48×48 monochrome pixel-art Rams (grey scale, round glasses, calm) fades in bottom-left; one of the Ten Principles types on beside him in dot-matrix. One second. No sound but the vibraphone note. Never twice in 60 s (cooldown), never repeats a principle until all ten have appeared. It should feel like the mentor glanced over from the next desk and nodded.

---

## 13. Progression — The Archive

The fourth tab is a museum you build by playing.

- **Museum Cards (11):** unlocked on first creation of each tier. Top-view render on `paper`, model number, name, fictional year, 60-word design rationale, material chips. Written in honest curator prose — no lore-babble.
- **Design Sketches (22):** 2 per product — "early study" line drawings (1px ink hairlines on grid paper) unlocked by creating that product 10× / 50×. Presented as if photographed from a workshop notebook.
- **The Ten Principles (10):** each Rams Moment permanently files its principle into the Archive with a short (real, factual) commentary.
- **Design Trivia (24):** short true design-history notes (Bauhaus, Ulm School, functionalism) unlocked by achievements.
- **The Exhibition:** a scrollable, horizontally-panning gallery wall (dark `ink` background, spot-lit cards — the 1958 exhibit reference) showing everything discovered, with completion stated simply: "23 of 67 objects."
- **Table skins & themes** (Blueprint, Graphite Night Shift, Drafting Paper) and **material soundpacks** unlock via total-merge milestones — cosmetic, quiet, functional.
- **Statistics:** total merges, largest chain, play time, per-mode bests — StatCell grid.
- **Achievements (~20):** understated, named like catalogue entries ("Serial Production" — 100 merges; "Systemdenken" — first RM-09).
- **Daily Challenge:** one seeded Time Attack per calendar day; completing any 5 days unlocks the olive accent achievement tier.

No currency. Nothing purchasable. Nothing expires.

---

## 14. Technical Architecture

### Stack
- **Next.js 14+ (App Router)**, static export mindset — the game is 100% client-side; no server runtime needed.
- **TypeScript strict**, **Tailwind CSS** (tokens from §6/§7 as theme extension), **Framer Motion** (UI/menus only — never in the 60fps canvas loop), **Matter.js** (physics), **Web Audio API** (custom engine), **zustand** (game + meta state), **localStorage / IndexedDB** (persistence via a small typed wrapper), **next-pwa / serwist** (offline).

### Architecture principles
1. **The game loop owns the frame.** One `<canvas>`; a `GameEngine` class (plain TS, zero React) runs physics + render via rAF. React renders the chrome around it and communicates through a thin event bus + zustand. React re-renders never block simulation.
2. **Deterministic core.** Physics/game logic is UI-agnostic and seeded (mulberry32) — enables daily challenges, replay verification, and headless testing.
3. **Data-driven products.** The evolution tree is one typed config file (`products.ts`); shapes, colors, sounds, museum text all keyed to it. Adding a product family = adding data, not code.
4. **Audio as a service.** `AudioEngine` singleton; game code emits semantic events (`impact {matA, matB, energy}`), the engine performs sound design.

### State layers
- `useGameStore` — volatile run state (bodies handled by engine; score, combo, mode, timers here).
- `useMetaStore` — persistent (archive, unlocks, records, settings), hydrated from storage, versioned migrations.

### Rendering
Canvas 2D (not WebGL — our flat aesthetic needs no shaders; 2D keeps bundle honest and battery kind). Product sprites pre-rendered once per tier per DPR into offscreen canvases; per-frame cost is transforms + draws. Squash rendered via non-uniform scale on the sprite draw. Target: 60fps on a 2019 mid-tier Android.

---

## 15. Folder Structure

```
rams-merge/
├─ app/                        # Next.js App Router (chrome only)
│  ├─ layout.tsx               # fonts, theme, PWA meta
│  ├─ page.tsx                 # main menu
│  ├─ play/[mode]/page.tsx     # game screen
│  ├─ archive/page.tsx         # museum
│  ├─ records/page.tsx         # leaderboards/stats
│  └─ settings/page.tsx
├─ src/
│  ├─ engine/                  # framework-free game core
│  │  ├─ GameEngine.ts         # loop, orchestration
│  │  ├─ physics/              # world, bodies, magnetic assist, merge resolver
│  │  ├─ render/               # canvas renderer, sprites, particles, squash
│  │  ├─ modes/                # ClassicMode.ts, TimeAttack.ts, ... (strategy pattern)
│  │  └─ rng.ts                # seeded random
│  ├─ audio/                   # AudioEngine, buses, sfx recipes, generative music
│  ├─ data/                    # products.ts, principles.ts, trivia.ts, achievements.ts
│  ├─ state/                   # zustand stores, persistence, migrations
│  ├─ components/              # ui/ (PushKey, Dial, ...), game/ (HUD, StagingTray), archive/
│  ├─ hooks/                   # useEngine, useAudio, useHaptics
│  └─ lib/                     # types, constants, utils
├─ public/
│  ├─ audio/                   # samples (≤ 1 MB total)
│  ├─ icons/                   # PWA icons, favicon
│  └─ manifest.webmanifest
├─ tests/                      # vitest: merge logic, scoring, persistence
└─ [configs]                   # tailwind, tsconfig, next.config, .github/
```

## 16. GitHub Repository Organization

- **Repo:** `rams-merge` (public). Default branch `main` = deployable, always.
- **Flow:** short-lived feature branches → PR → squash merge. Conventional Commits (`feat:`, `fix:`, `perf:`, `content:` for archive text).
- **CI (GitHub Actions):** on PR — typecheck, ESLint, vitest, `next build`. On `main` — Vercel handles deploy.
- **Structure niceties:** `README.md` with the logo and a design-philosophy section (the repo itself is a design object); `docs/GDD.md` (this file); issue labels mirroring milestones (M1…M6); `LICENSE` MIT for code, content noted separately.

## 17. Deployment Strategy — Vercel

- Vercel Git integration: every PR gets a preview URL (design review on real phones via QR); `main` → production.
- Fully static output — no server functions, zero cold starts; assets on Vercel edge CDN, immutable cache headers for sprites/audio/fonts.
- **PWA:** manifest (name RAMS MERGE, `display: standalone`, theme `#F4F2ED`), Serwist service worker precaching the full app shell + audio (~1.5 MB total) → complete offline play after first visit. `Cache-Control` + SW versioning keyed to build id so updates arrive silently on next launch.
- Lighthouse budget in CI: Performance ≥ 90 mobile, PWA installable, CLS 0 (canvas + reserved layout), bundle ≤ 300 kB JS gzipped (Matter.js ~87 kB is the biggest line item).
- Analytics: none, or privacy-clean Vercel Analytics only. No trackers — unobtrusive extends to data.

## 18. Development Roadmap

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M0 · Foundation** (wk 1) | Repo, Next.js+TS+Tailwind+CI, tokens, fonts, PWA shell, canvas + fixed-step loop | empty bench renders 60fps on phone; deployed to Vercel |
| **M1 · Feel** (wk 2–3) | Matter.js world, launch input, sliding/collisions, merge resolver, magnetic assist, squash render, placeholder circles | *the toy is fun with grey circles* — internal feel-test passes |
| **M2 · The Objects** (wk 4–5) | All 11 product sprites, bench art, particles, merge choreography, HUD (ScoreLedger, StagingTray, combo) | Classic mode playable start-to-game-over, looks like the GDD |
| **M3 · The Product** (wk 6–7) | Menus, TabRail, all 5 modes, mode-select tuner, settings Dials, logo screen, transitions | full app navigable; modes complete |
| **M4 · The Sound** (wk 8) | AudioEngine, material impact matrix, merge snaps, generative music, haptics, Rams Moment (visual+audio) | eyes-closed test: gameplay is legible by ear |
| **M5 · The Archive** (wk 9–10) | Museum cards + all written content, sketches, principles, trivia, exhibition wall, achievements, records, daily challenge, persistence+migrations | knowledge progression fully working offline |
| **M6 · Museum Quality** (wk 11–12) | Performance pass, reduced-motion, a11y, dark theme, icon/splash, README, Lighthouse budget, device matrix QA | v1.0 tagged; production URL public |

Each milestone ships to the Vercel preview — the game is playable (increasingly well) from week 2 onward.

---

## Appendix A — Logo Specification

**Construction:** two stacked elements on the 8-pt grid, flush-left.
1. `RAMS` — Hanken Grotesk ExtraBold (800), all caps, tracking −2%, `ink` (#261201). Set large; the A may be lowered/cut in the Bauhaus manner of the reference wordmark (crossbar dropped to align with the x-height baseline of the surrounding letters).
2. `MERGE` — Hanken Grotesk Bold (700), all caps, tracking +12%, `paper` (#F4F2ED) knocked out of an **orange rectangle** (#ED8008). The bar's width exactly matches the optical width of RAMS; height = 0.42× the cap height of RAMS; corner radius 2px (nearly sharp — it is a printed label, not a pill). The bar sits 8px beneath RAMS and acts as the pedestal the wordmark stands on.

Clear space: 1× bar height on all sides. Minimum size: 96px wide. Mono version: all-`ink` with outlined bar. The logo doubles as the app icon (bar only, `RM` monogram) — a tiny orange plaque.

## Appendix B — Museum Card Sample (tone reference)

> **RM-05 Klang · Bookshelf Speaker · 1971**
> The Klang abandons the cabinet. A single squircle of acoustic fabric, edged in oak, it was designed to be heard and then forgotten. The perforation pattern follows a Fibonacci spiral — not for mysticism, but because equal hole spacing whistled at 4 kHz. One orange dot marks power. Nothing else asked to exist.
> *Materials: beech ply, wool fabric, ABS · Principle 5: Good design is unobtrusive.*

---

*End of GDD v1.1 — table perspective, front-view products, and drafting-grid surface revised per creative direction, 2026-07-18.*
