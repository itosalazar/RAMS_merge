export type GameMode = "classic" | "time-attack" | "speed-merge" | "shrinking" | "zen";

export interface ModeInfo {
  id: GameMode;
  title: string;
  caption: string;
}

export const MODES: ModeInfo[] = [
  { id: "classic", title: "CLASSIC", caption: "Merge endlessly. The board is finite." },
  { id: "time-attack", title: "TIME ATTACK", caption: "One target product. Build it fast." },
  { id: "speed-merge", title: "SPEED MERGE", caption: "Every merge resets the clock. Survive." },
  { id: "shrinking", title: "SHRINKING", caption: "The table closes in. Targets buy space." },
  { id: "zen", title: "ZEN", caption: "No score. No timer. Just the work." },
];

export const modeInfo = (id: GameMode) => MODES.find((m) => m.id === id)!;
