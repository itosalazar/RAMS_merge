"use client";

/** Renders a product's front elevation into a small canvas — used by the
 * staging tray, target banners and museum cards. Same drawing code as the
 * game sprites, so the archive and the bench can never disagree. */

import { useEffect, useRef } from "react";
import { buildSprites } from "@/src/engine/sprites";

let sheet: ReturnType<typeof buildSprites> | null = null;

export function ProductThumb({ tier, size = 56, className = "" }: { tier: number; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!sheet) sheet = buildSprites(window.devicePixelRatio || 1);
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const src = sheet.canvases[tier - 1];
    const dim = sheet.dims[tier - 1];
    const k = Math.min(size / dim.w, size / dim.h) * 0.92;
    const w = dim.w * k;
    const h = dim.h * k;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(src, (size - w) / 2, size - h - size * 0.04, w, h);
  }, [tier, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} className={className} aria-hidden />;
}
