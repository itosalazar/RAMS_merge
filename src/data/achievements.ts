/** Achievements — named like catalogue entries. Each unlocks two trivia cards (GDD §13). */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  /** trivia ids unlocked */
  trivia: [string, string];
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-merge", name: "Erste Schritte", description: "Perform your first merge.", trivia: ["ulm-school", "braun-1955"] },
  { id: "merges-100", name: "Serial Production", description: "100 total merges.", trivia: ["snow-white", "grid-system"] },
  { id: "merges-1000", name: "Werkbank", description: "1,000 total merges.", trivia: ["lufthansa", "less-more"] },
  { id: "first-klang", name: "Kabinettstück", description: "Create the RM-05 Klang.", trivia: ["speaker-fabric", "606-shelf"] },
  { id: "first-system", name: "Systemdenken", description: "Create the RM-09 System.", trivia: ["modularity", "et66"] },
  { id: "monolith", name: "Weniger, aber besser", description: "Create the RM-11 Monolith.", trivia: ["apple-rams", "vitsoe"] },
  { id: "combo-3", name: "Kettenreaktion", description: "A three-merge chain.", trivia: ["bauhaus-1919", "gugelot"] },
  { id: "combo-5", name: "Perpetuum", description: "A five-merge chain.", trivia: ["sk4", "t3-ipod"] },
  { id: "speed-3min", name: "Ausdauer", description: "Survive 3 minutes of Speed Merge.", trivia: ["flip-clock", "orange-dot"] },
  { id: "shrink-5", name: "Präzision", description: "Complete 5 targets in Shrinking Table.", trivia: ["ten-principles-origin", "museum-moma"] },
  { id: "daily-5", name: "Werkwoche", description: "Complete 5 daily challenges.", trivia: ["functionalism", "kaffeemaschine"] },
  { id: "zen-10", name: "Stille", description: "Spend 10 minutes in Zen mode.", trivia: ["japanese-design", "ram-quote"] },
];
