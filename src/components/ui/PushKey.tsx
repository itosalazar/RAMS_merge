"use client";

/**
 * PushKey — a moulded control with real volume (ref: product_06).
 * Super-rounded pill, top light, inner bevel; pressing sinks it 2px.
 */

import { audio } from "@/src/audio/AudioEngine";
import { haptic, initHaptics } from "@/src/lib/haptics";

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
    "relative inline-flex items-center justify-center rounded-full font-semibold transition-[transform,filter,box-shadow] duration-100 active:translate-y-[2px] active:brightness-95 active:shadow-contact disabled:opacity-40 disabled:pointer-events-none min-h-12 px-7 text-base";
  // primary and default sit on fixed light surfaces, so their text is
  // fixed too — never the theme's `ink`, which flips to white in night.
  const look =
    variant === "primary"
      ? "text-white shadow-knob bg-[linear-gradient(180deg,#ffa63e_0%,#ed8008_45%,#e06c06_100%)]"
      : variant === "danger"
        ? "bg-transparent text-signal border border-signal/40"
        : variant === "ghost"
          ? "bg-transparent text-graphite border border-case"
          : "text-[#232528] shadow-knob bg-[linear-gradient(180deg,#fafbfc_0%,#e6e8eb_55%,#d5d8dd_100%)]";
  return (
    <button
      className={`${base} ${look} ${className}`}
      disabled={disabled}
      onClick={() => {
        audio.unlock();
        initHaptics();
        audio.ui("key");
        haptic.ui();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

/** Knob — a circular turned control; dark grey body, orange glyph. */
export function Knob({
  children,
  onClick,
  size = 56,
  className = "",
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`relative inline-flex items-center justify-center rounded-full text-orange transition-transform duration-100 active:translate-y-[2px] active:brightness-95 shadow-knob-dark bg-[radial-gradient(circle_at_35%_28%,#6a6e75_0%,#55585e_45%,#3b3e43_100%)] ${className}`}
      style={{ width: size, height: size }}
      onClick={() => {
        audio.unlock();
        initHaptics();
        audio.ui("tick");
        haptic.ui();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
