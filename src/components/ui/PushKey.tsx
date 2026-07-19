"use client";

/**
 * PushKey — the primary control (GDD §8). A physical key: pressing
 * translates it down 2px and darkens it; never a color swap alone.
 */

import { audio } from "@/src/audio/AudioEngine";
import { haptic } from "@/src/lib/haptics";

export function PushKey({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "relative inline-flex items-center justify-center rounded-lg font-semibold transition-[transform,filter] duration-100 active:translate-y-[2px] active:brightness-95 disabled:opacity-40 disabled:pointer-events-none min-h-12 px-6 text-base";
  const look =
    variant === "primary"
      ? "bg-orange text-paper shadow-contact border-b-2 border-orange-deep"
      : variant === "danger"
        ? "bg-transparent text-signal border border-signal/40"
        : variant === "ghost"
          ? "bg-transparent text-graphite border border-case"
          : "bg-bench text-ink shadow-contact border-b-2 border-case";
  return (
    <button
      className={`${base} ${look} ${className}`}
      disabled={disabled}
      onClick={() => {
        audio.unlock();
        audio.ui("key");
        haptic.ui();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
