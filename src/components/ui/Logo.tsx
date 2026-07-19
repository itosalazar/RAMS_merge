/**
 * The RAMS MERGE wordmark (GDD Appendix A).
 * RAMS in ExtraBold, MERGE knocked out of the orange bar beneath —
 * the bar is the pedestal the wordmark stands on.
 */

export function Logo({ size = 64 }: { size?: number }) {
  const barH = size * 0.42;
  return (
    <div className="inline-flex flex-col items-start select-none" aria-label="RAMS MERGE">
      <span
        className="font-extrabold text-ink leading-none"
        style={{ fontSize: size, letterSpacing: "-0.02em" }}
      >
        RAMS
      </span>
      <span
        className="bg-orange text-paper font-bold flex items-center justify-center leading-none"
        style={{
          height: barH,
          marginTop: size * 0.12,
          borderRadius: 2,
          fontSize: barH * 0.52,
          letterSpacing: "0.12em",
          paddingInline: barH * 0.35,
          minWidth: size * 2.62,
        }}
      >
        MERGE
      </span>
    </div>
  );
}
