/**
 * A tiny monochrome pixel-art design mentor (GDD §12 Rams Moments).
 * Hand-placed pixels, rendered as SVG rects. Calm. No comedy.
 */

const GRID = [
  "..hhhhhhhh..",
  ".hhhhhhhhhh.",
  ".hssssssssh.",
  "hsssssssssgh",
  "hssssssssssh",
  "hddddssdddds",
  "hd..dssd..ds",
  "hddddssdddds",
  ".ss..ss..ss.",
  ".sss.ss.sss.",
  ".ssssssssss.",
  "..ss.ss.ss..",
  "..ssssssss..",
  "...dddddd...",
  ".dddwwwwddd.",
  "ddddwwwwdddd",
];

const COLORS: Record<string, string> = {
  h: "#8d8578", // side hair, grey
  s: "#c9c2b4", // skin, warm grey — monochrome portrait
  g: "#b5ac9c",
  d: "#4d4d4d", // glasses + suit
  w: "#edeae3", // shirt
};

export function PixelRams({ size = 48 }: { size?: number }) {
  const px = size / 12;
  return (
    <svg width={size} height={(size / 12) * 16} viewBox={`0 0 ${12 * px} ${16 * px}`} aria-hidden shapeRendering="crispEdges">
      {GRID.flatMap((row, y) =>
        row.split("").map((c, x) =>
          COLORS[c] ? (
            <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px + 0.2} height={px + 0.2} fill={COLORS[c]} />
          ) : null
        )
      )}
    </svg>
  );
}
