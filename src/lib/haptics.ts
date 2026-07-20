/**
 * Haptics — tactile feedback across the whole experience (GDD §11).
 *
 * Two backends, because the web is uneven:
 *  • Android/Chromium: the Vibration API (navigator.vibrate), with rich
 *    patterns per event.
 *  • iOS Safari (17.4+): the Vibration API does not exist, so we use the
 *    "switch input" trick — programmatically toggling a hidden checkbox
 *    styled as an iOS switch fires the system's light haptic tap. It has
 *    no intensity control, so we approximate weight by tapping N times.
 */

let enabled = true;
let canVibrate = false;
let switchEl: HTMLInputElement | null = null;
let ready = false;

export function setHaptics(on: boolean): void {
  enabled = on;
}

/** Call once, from a user gesture, to arm both backends. */
export function initHaptics(): void {
  if (ready || typeof window === "undefined") return;
  ready = true;
  canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  if (!canVibrate && typeof document !== "undefined") {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden";
    const input = document.createElement("input");
    input.type = "checkbox";
    // Safari-only: renders as a switch and taps the Taptic Engine on toggle
    input.setAttribute("switch", "");
    label.appendChild(input);
    document.body.appendChild(label);
    switchEl = input;
  }
}

/** iOS: a single Taptic tap (fire n times spaced out for "weight"). */
function iosTap(count = 1, spacingMs = 45): void {
  if (!switchEl) return;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      if (switchEl) switchEl.checked = !switchEl.checked;
    }, i * spacingMs);
  }
}

/** pattern is passed straight to navigator.vibrate (ms, or [on,off,on,…]);
 *  iosTaps is how many switch taps approximate it on iOS. */
function buzz(pattern: number | number[], iosTaps = 1): void {
  if (!enabled) return;
  if (canVibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  } else {
    iosTap(iosTaps);
  }
}

export const haptic = {
  /** UI tick — menu taps, switches */
  ui: () => buzz(6, 1),
  /** ruler scroll — one crisp click per station line */
  scroll: () => buzz(4, 1),
  /** launching a product — a firm flick */
  launch: () => buzz(14, 1),
  /** collision — scaled by impact energy (0..1) */
  impact: (energy = 0.5) => buzz(Math.round(6 + energy * 16), energy > 0.5 ? 2 : 1),
  /** merge — a satisfying double pulse; heavier for higher tiers */
  merge: (tier = 2) => {
    const big = tier >= 7;
    buzz(big ? [22, 40, 34] : [14, 30, 22], big ? 3 : 2);
  },
  /** combo chain — escalating triple */
  combo: (chain = 2) => buzz([10, 25, 10, 25, 14], Math.min(3, chain)),
  /** game over — a long, final note */
  gameover: () => buzz([40, 60, 90], 3),
};
