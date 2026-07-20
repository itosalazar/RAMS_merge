"use client";

/**
 * Main menu — a speaker face you can touch (refs: product_06, DR06 drill
 * pattern, UI_game_03 type). The logo sits centered in a field of drilled
 * holes; one hole is orange and follows the finger. Below, the mode menu
 * is a tuning ruler you drag like finding a station.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Logo } from "@/src/components/ui/Logo";
import { PushKey, Knob } from "@/src/components/ui/PushKey";
import { TabRail } from "@/src/components/ui/TabRail";
import { MODES } from "@/src/engine/modes";
import { useMeta } from "@/src/state/meta";
import { audio } from "@/src/audio/AudioEngine";
import { haptic, initHaptics } from "@/src/lib/haptics";
import { PRODUCTS } from "@/src/data/products";

/* ── the speaker face ────────────────────────────────────────────── */

interface Hole {
  x: number;
  y: number;
}

function SpeakerField({ size }: { size: number }) {
  const holes = useMemo<Hole[]>(() => {
    const out: Hole[] = [];
    const c = size / 2;
    // concentric drill rings around the logo clearing
    for (let ring = 0; ring < 7; ring++) {
      const r = size * 0.31 + ring * (size * 0.032);
      if (r > c - 6) break;
      const n = Math.max(10, Math.round((Math.PI * 2 * r) / (size * 0.045)));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + ring * 0.26;
        // round: server and client trig differ in the last float digit,
        // which would make React cry hydration tears
        out.push({
          x: Math.round((c + Math.cos(a) * r) * 100) / 100,
          y: Math.round((c + Math.sin(a) * r) * 100) / 100,
        });
      }
    }
    return out;
  }, [size]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerAt = useRef<{ x: number; y: number } | null>(null);
  const glow = useRef<Float32Array | null>(null);

  useEffect(() => {
    // a wide orange glow blooms under the finger and fades away behind it;
    // idle, it drifts in a slow orbit
    const c = size / 2;
    const REACH = size * 0.19; // influence radius
    const cv = canvasRef.current!;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext("2d")!;
    if (!glow.current || glow.current.length !== holes.length)
      glow.current = new Float32Array(holes.length);
    const g = glow.current;

    const INK = [0x23, 0x25, 0x28];
    const ORANGE = [0xed, 0x80, 0x08];

    let raf = 0;
    const loop = (t: number) => {
      const target =
        pointerAt.current ?? {
          x: c + Math.cos(t / 2400) * size * 0.36,
          y: c + Math.sin(t / 2400) * size * 0.36,
        };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      for (let i = 0; i < holes.length; i++) {
        const d = Math.hypot(holes[i].x - target.x, holes[i].y - target.y);
        const near = Math.max(0, 1 - d / REACH);
        // rise fast under the finger, fade slowly behind it
        g[i] = Math.max(g[i] * 0.94, near * near);
        const k = g[i];
        const r = size * (0.009 + 0.004 * k);
        ctx.fillStyle = `rgba(${Math.round(INK[0] + (ORANGE[0] - INK[0]) * k)},${Math.round(
          INK[1] + (ORANGE[1] - INK[1]) * k
        )},${Math.round(INK[2] + (ORANGE[2] - INK[2]) * k)},${0.82 + 0.18 * k})`;
        ctx.beginPath();
        ctx.arc(holes[i].x, holes[i].y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [holes, size]);

  return (
    <div
      className="relative touch-none"
      style={{ width: size, height: size }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerAt.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerAt.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onPointerLeave={() => (pointerAt.current = null)}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: size, height: size }} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Logo size={Math.round(size * 0.16)} />
      </div>
    </div>
  );
}

/* ── the tuning ruler ────────────────────────────────────────────── */

const GAP = 96; // px between stations
const FINE = 8; // mm ticks per gap

export default function Home() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const x = useMotionValue(0);
  const lastTick = useRef(0);
  const discovered = useMeta((s) => s.archive.discovered);
  const highScore = useMeta((s) => s.records.classicHighScore);
  const mode = MODES[idx];

  const snapTo = (i: number) => {
    const clamped = Math.max(0, Math.min(MODES.length - 1, i));
    setIdx(clamped);
    animate(x, -clamped * GAP, { type: "spring", stiffness: 320, damping: 28 });
  };

  useEffect(() => {
    // dial ratchet while dragging across mm ticks
    return x.on("change", (v) => {
      const tick = Math.round(-v / (GAP / FINE));
      if (tick !== lastTick.current) {
        lastTick.current = tick;
        audio.ui("tick");
        haptic.scroll();
      }
      const live = Math.round(-v / GAP);
      setIdx((p) => {
        const c = Math.max(0, Math.min(MODES.length - 1, live));
        return p === c ? p : c;
      });
    });
  }, [x]);

  const rulerW = (MODES.length - 1) * GAP;

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto w-full">
      <main
        className="flex-1 flex flex-col items-center justify-center px-6"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* the speaker face */}
        <SpeakerField size={300} />

        {highScore > 0 && (
          <p className="text-[11px] tracking-[0.1em] font-medium text-graphite/70 -mt-1">
            BEST <span className="dot-matrix text-ink">{highScore.toLocaleString("en-US")}</span>
            {" · "}
            {discovered.length} OF {PRODUCTS.length} OBJECTS
          </p>
        )}

        {/* the tuner */}
        <section className="w-full mt-6" aria-label="game mode">
          {/* animated station overlay */}
          <div className="h-16 flex flex-col items-center justify-end overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="text-center"
              >
                <h1 className="text-[30px] font-extrabold tracking-tight leading-none text-ink">
                  {mode.title}
                </h1>
                <p className="text-[13px] text-graphite mt-1">{mode.caption}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* the ruler */}
          <div className="relative mt-4 h-14 overflow-hidden select-none touch-pan-y">
            {/* fixed needle */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[3px] h-9 rounded-full bg-orange z-10 shadow-contact" />
            {/* fade masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10 bg-[linear-gradient(90deg,var(--paper),transparent)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-[linear-gradient(270deg,var(--paper),transparent)]" />
            <motion.div
              className="absolute top-0 h-full cursor-grab active:cursor-grabbing"
              style={{ x, left: "50%", width: rulerW + GAP }}
              drag="x"
              dragConstraints={{ left: -rulerW, right: 0 }}
              dragElastic={0.08}
              dragMomentum={false}
              onPointerDown={() => initHaptics()}
              onDragEnd={() => snapTo(Math.round(-x.get() / GAP))}
            >
              {/* millimetre ticks */}
              {Array.from({ length: (MODES.length - 1) * FINE + 1 }, (_, i) => {
                const station = i % FINE === 0;
                const half = i % (FINE / 2) === 0;
                return (
                  <div
                    key={i}
                    className={`absolute top-0 rounded-full ${
                      station ? "w-[2.5px] h-9 bg-graphite" : half ? "w-px h-6 bg-graphite/60" : "w-px h-4 bg-graphite/35"
                    }`}
                    style={{ left: (i * GAP) / FINE }}
                  />
                );
              })}
              {/* station labels */}
              {MODES.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => snapTo(i)}
                  className={`absolute top-10 -translate-x-1/2 text-[9px] font-semibold tracking-[0.1em] whitespace-nowrap ${
                    i === idx ? "text-ink" : "text-graphite/50"
                  }`}
                  style={{ left: i * GAP }}
                >
                  {m.title}
                </button>
              ))}
            </motion.div>
          </div>

          {/* transport: knob · begin · knob */}
          <div className="flex items-center justify-center gap-5 mt-6">
            <Knob label="previous mode" onClick={() => snapTo(idx - 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M9.5 2 4.5 7l5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Knob>
            <PushKey variant="primary" className="min-w-44 !min-h-14 text-lg" onClick={() => router.push(`/play/${mode.id}`)}>
              Begin
            </PushKey>
            <Knob label="next mode" onClick={() => snapTo(idx + 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M4.5 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Knob>
          </div>
        </section>

        <p className="mt-8 pb-4 text-[11px] text-graphite/50">Weniger, aber besser.</p>
      </main>
      <TabRail />
    </div>
  );
}
