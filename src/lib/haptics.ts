/** Micro-haptics — 8ms taps on impact, 20ms on merge (GDD §11). */

let enabled = true;

export function setHaptics(on: boolean): void {
  enabled = on;
}

export function vibrate(ms: number): void {
  if (!enabled) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported — fine */
  }
}

export const haptic = {
  impact: () => vibrate(8),
  merge: () => vibrate(20),
  ui: () => vibrate(5),
};
