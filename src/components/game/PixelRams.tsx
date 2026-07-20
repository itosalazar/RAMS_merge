/**
 * The design mentor, rendered on a small calculator screen (GDD §12).
 * 20×23 grayscale pixel portrait — hand-placed, calm, no comedy — set
 * behind dark display glass like the Zahl's readout.
 */

const GRID = [
  "....hhhhhhhhhhhh....",
  "..hhhhhhhhhhhhhhhh..",
  ".hhhhsssssssssshhhh.",
  ".hhhsssssssssssshhh.",
  ".hhsssssssssssssshh.",
  ".hhsssssssssssssshh.",
  ".hssssssssssssssssh.",
  ".hggggggssssggggggh.",
  ".hgleelgssssgleelgh.",
  ".hggggggssssggggggh.",
  ".hsssssssnnsssssssh.",
  "..ssssssssnnssssss..",
  "..ssssssssssssssss..",
  "..ssssSmmmmmmSssss..",
  "..sssssssssssssss...",
  "...sssssssssssss....",
  "....sssssssssss.....",
  ".....dddssssddd.....",
  "...ddddddwwdddddd...",
  "..dddddddwwddddddd..",
  ".ddddddddwwdddddddd.",
  ".ddddddddwwdddddddd.",
  "dddddddddwwddddddddd",
];

/** Grayscale only — luminous greys on display glass. */
const COLORS: Record<string, string> = {
  h: "#9a9ea6", // side hair
  s: "#d5d8dd", // face
  S: "#b9bdc4", // face shading
  g: "#4a4d52", // glasses frame
  l: "#f4f5f7", // lens glint
  e: "#33363b", // eyes
  n: "#b9bdc4", // nose shade
  m: "#8a8e95", // mouth line
  d: "#6a6e75", // suit
  w: "#eceded", // shirt
};

export function PixelRams({ size = 60 }: { size?: number }) {
  const cols = GRID[0].length;
  const rows = GRID.length;
  const px = size / cols;
  return (
    <span
      className="inline-block rounded-lg p-1 bg-[linear-gradient(180deg,#fafbfc_0%,#e6e8eb_55%,#d2d5da_100%)] shadow-knob border border-white/60"
      aria-hidden
    >
      <span className="block rounded-md p-1 bg-[#1d1f22] shadow-[inset_0_2px_4px_rgba(0,0,0,0.65)]">
        <svg
          width={size}
          height={px * rows}
          viewBox={`0 0 ${cols * px} ${rows * px}`}
          shapeRendering="crispEdges"
          style={{ display: "block", filter: "drop-shadow(0 0 3px rgba(213,216,221,0.25))" }}
        >
          {GRID.flatMap((row, y) =>
            row.split("").map((c, x) =>
              COLORS[c] ? (
                <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px + 0.15} height={px + 0.15} fill={COLORS[c]} />
              ) : null
            )
          )}
        </svg>
      </span>
    </span>
  );
}
