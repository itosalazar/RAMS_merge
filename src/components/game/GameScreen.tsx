"use client";

/**
 * GameScreen — mounts the framework-free GameEngine on a single canvas and
 * renders the quiet chrome around it. React never touches the 60fps loop;
 * it listens to engine events (GDD §14).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GameEngine } from "@/src/engine/GameEngine";
import { Renderer, LIGHT, NIGHT } from "@/src/engine/renderer";
import { unproject } from "@/src/engine/projection";
import { TABLE_D, LAUNCH_ZONE_D, RAMS_COOLDOWN_MS } from "@/src/lib/constants";
import { productForTier, MAX_TIER } from "@/src/data/products";
import { PRINCIPLES } from "@/src/data/principles";
import type { GameMode } from "@/src/engine/modes";
import { modeInfo } from "@/src/engine/modes";
import { audio } from "@/src/audio/AudioEngine";
import { haptic, setHaptics } from "@/src/lib/haptics";
import { useMeta } from "@/src/state/meta";
import { dailySeed } from "@/src/engine/rng";
import { ProductThumb } from "./ProductThumb";
import { RamsToast } from "./RamsToast";
import { PushKey } from "../ui/PushKey";

interface OverState {
  score: number;
  largestTier: number;
  merges: number;
  durationS: number;
  newRecord: boolean;
}

export function GameScreen({ mode }: { mode: GameMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const meta = useMeta;
  const theme = useMeta((s) => s.settings.theme);
  const sound = useMeta((s) => s.settings.sound);
  const music = useMeta((s) => s.settings.music);
  const hapticsOn = useMeta((s) => s.settings.haptics);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [queue, setQueue] = useState<number[]>([]);
  const [target, setTarget] = useState(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [elapsedS, setElapsedS] = useState(0);
  const [remainingS, setRemainingS] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState<OverState | null>(null);
  const [rams, setRams] = useState<{ text: string; nonce: number } | null>(null);
  const [runKey, setRunKey] = useState(0);
  const lastRamsAt = useRef(0);
  const comboTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRams = useCallback((force = false) => {
    const now = performance.now();
    if (!force && now - lastRamsAt.current < RAMS_COOLDOWN_MS) return;
    lastRamsAt.current = now;
    const seen = meta.getState().archive.principlesSeen;
    const unseen = PRINCIPLES.filter((p) => !seen.includes(p.n));
    const p = unseen.length
      ? unseen[0]
      : PRINCIPLES[Math.floor(Math.random() * PRINCIPLES.length)];
    meta.getState().seePrinciple(p.n);
    audio.ramsMoment();
    setRams({ text: p.short, nonce: now });
    setTimeout(() => setRams((r) => (r && r.nonce === now ? null : r)), 4000);
  }, [meta]);

  /* ── engine lifecycle ──────────────────────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current!;
    const known = meta.getState().archive.discovered;
    const seed = mode === "time-attack" ? dailySeed() : undefined;
    const engine = new GameEngine(mode, known, seed);
    const renderer = new Renderer(canvas);
    renderer.theme = theme === "night" ? NIGHT : LIGHT;
    renderer.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    engineRef.current = engine;
    rendererRef.current = renderer;
    setHaptics(meta.getState().settings.haptics);
    audio.setSfx(meta.getState().settings.sound);
    audio.setMusic(meta.getState().settings.music);

    const offs = [
      engine.events.on("score", ({ score }) => setScore(score)),
      engine.events.on("staged", ({ queue }) => setQueue(queue)),
      engine.events.on("launch", ({ tier }) => {
        audio.launch();
        const m = meta.getState();
        m.addLaunch();
        // throwing an object is meeting it — spawn tiers enter the archive
        m.discover(tier);
      }),
      engine.events.on("impact", ({ energy, tierA, tierB }) => {
        const matA = productForTier(Math.max(1, tierA)).material;
        const matB = productForTier(Math.max(1, tierB)).material;
        audio.impact(matA, matB, energy, (tierA + tierB) / 2 || 1);
        if (energy > 0.25) haptic.impact();
      }),
      engine.events.on("merge", ({ tier, chain }) => {
        audio.merge(tier);
        haptic.merge();
        const m = meta.getState();
        m.addMerges(1);
        m.bumpTierCount(tier);
        m.recordCombo(chain);
        // achievements
        m.award("first-merge");
        if (m.stats.totalMerges >= 100) m.award("merges-100");
        if (m.stats.totalMerges >= 1000) m.award("merges-1000");
        if (tier === 5) m.award("first-klang");
        if (tier === 9) m.award("first-system");
        if (tier === MAX_TIER) m.award("monolith");
      }),
      engine.events.on("combo", ({ chain }) => {
        setCombo(chain);
        audio.combo(chain);
        if (comboTimeout.current) clearTimeout(comboTimeout.current);
        comboTimeout.current = setTimeout(() => setCombo(0), 1600);
        const m = meta.getState();
        if (chain >= 3) m.award("combo-3");
        if (chain >= 5) m.award("combo-5");
        if (chain >= 3) showRams();
      }),
      engine.events.on("discover", ({ tier }) => {
        meta.getState().discover(tier);
        showRams(true);
      }),
      engine.events.on("monolith", () => showRams(true)),
      engine.events.on("newTarget", ({ tier }) => setTarget(tier)),
      engine.events.on("targetHit", ({ count }) => {
        setTargetsHit(count);
        const m = meta.getState();
        if (mode === "shrinking" && count >= 5) m.award("shrink-5");
      }),
      engine.events.on("timer", ({ elapsedS, remainingS }) => {
        if (elapsedS !== undefined) setElapsedS(elapsedS);
        setRemainingS(remainingS ?? null);
      }),
      engine.events.on("gameover", ({ score, largestTier, merges, durationS }) => {
        const m = meta.getState();
        m.addRun();
        m.addPlayTime(durationS);
        let newRecord = false;
        if (mode === "classic") newRecord = m.recordClassic(score, largestTier).newHighScore;
        if (mode === "time-attack") {
          newRecord = m.recordTimeAttack(engine.targetTier, durationS).newBest;
          const today = new Date().toISOString().slice(0, 10);
          m.completeDaily(today);
          if (m.daily.completedDates.length >= 5) m.award("daily-5");
        }
        if (mode === "speed-merge") {
          newRecord = m.recordSpeedMerge(durationS, merges).newBest;
          if (durationS >= 180) m.award("speed-3min");
        }
        if (mode === "shrinking") newRecord = m.recordShrinking(engine.stats.targetsHit).newBest;
        setOver({ score, largestTier, merges, durationS, newRecord });
        audio.stopMusic();
      }),
    ];

    // loop
    let raf = 0;
    const loop = (now: number) => {
      engine.tick(now);
      renderer.render(engine, now);
      raf = requestAnimationFrame(loop);
    };
    engine.start();
    raf = requestAnimationFrame(loop);

    const onResize = () => renderer.resize();
    window.addEventListener("resize", onResize);

    // zen achievement clock
    const zenClock =
      mode === "zen"
        ? setTimeout(() => meta.getState().award("zen-10"), 10 * 60 * 1000)
        : null;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (zenClock) clearTimeout(zenClock);
      const m = meta.getState();
      if (!engine.over && engine.running) m.addPlayTime((performance.now() - engine.stats.startedAt) / 1000);
      offs.forEach((off) => off());
      engine.destroy();
      audio.stopMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, runKey]);

  /* settings side-effects */
  useEffect(() => {
    audio.setSfx(sound);
  }, [sound]);
  useEffect(() => {
    audio.setMusic(music);
    if (!music) audio.stopMusic();
  }, [music]);
  useEffect(() => setHaptics(hapticsOn), [hapticsOn]);
  useEffect(() => {
    if (rendererRef.current) rendererRef.current.theme = theme === "night" ? NIGHT : LIGHT;
  }, [theme]);

  /* pause on tab hide */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && engineRef.current && !engineRef.current.over) {
        engineRef.current.setPaused(true);
        setPaused(true);
        audio.suspend();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* ── input: reposition below the line, flick to launch ─────────── */

  const dragState = useRef<{ id: number; startX: number; startY: number; aiming: boolean } | null>(null);

  const planePoint = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return unproject(rendererRef.current!.viewport, e.clientX - rect.left, e.clientY - rect.top);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (paused || over) return;
    audio.unlock();
    if (music) audio.startMusic(mode === "zen" ? "zen" : mode === "speed-merge" ? "speed" : "focus");
    const p = planePoint(e);
    dragState.current = { id: e.pointerId, startX: p.x, startY: p.y, aiming: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const engine = engineRef.current!;
    if (p.y > TABLE_D - LAUNCH_ZONE_D) engine.moveStaged(p.x);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag || drag.id !== e.pointerId || paused || over) return;
    const engine = engineRef.current!;
    if (!engine.staged) return;
    const p = planePoint(e);
    const stagedY = TABLE_D - LAUNCH_ZONE_D / 2;
    const dx = p.x - engine.staged.x;
    const dy = p.y - stagedY;
    const dist = Math.hypot(dx, dy);
    if (p.y <= TABLE_D - LAUNCH_ZONE_D || drag.aiming) {
      // above the line (or already aiming): aim a flick
      drag.aiming = true;
      engine.setAim(dx, dy, Math.min(1, dist / 520));
    } else {
      // sliding along the tray
      engine.moveStaged(p.x);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag || drag.id !== e.pointerId) return;
    dragState.current = null;
    const engine = engineRef.current!;
    if (drag.aiming) engine.launch();
    else engine.clearAim();
  };

  /* ── helpers ───────────────────────────────────────────────────── */

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const restart = () => {
    setOver(null);
    setScore(0);
    setCombo(0);
    setTargetsHit(0);
    setTarget(0);
    setPaused(false);
    setRunKey((k) => k + 1); // re-runs the engine effect
  };

  const info = modeInfo(mode);

  return (
    <div className="fixed inset-0 flex flex-col bg-paper overflow-hidden">
      {/* HUD — the score presides at the top center */}
      <header
        className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-start px-4 pt-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {/* left: target (orange box) / countdown (LED) */}
        <div className="flex items-center justify-start">
          {(mode === "time-attack" || mode === "shrinking") && target > 0 && (
            <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 shadow-knob bg-[linear-gradient(180deg,#ffa63e_0%,#ed8008_45%,#e06c06_100%)]">
              <span className="bg-paper rounded-lg p-0.5 shadow-contact">
                <ProductThumb tier={target} size={30} />
              </span>
              <div className="pr-1">
                <p className="text-[9px] font-semibold tracking-[0.12em] text-paper/85">TARGET</p>
                <p className="text-[11px] font-bold text-paper">
                  {productForTier(target).model}
                  {mode === "shrinking" && targetsHit > 0 ? ` · ${targetsHit}` : ""}
                </p>
              </div>
            </div>
          )}
          {mode === "speed-merge" && remainingS !== null && (
            <Led value={remainingS.toFixed(1)} urgent={remainingS < 3} />
          )}
        </div>

        {/* center: the score / LED timer */}
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.1em] text-graphite/70 mb-0.5">{info.title}</p>
          {mode !== "zen" && mode !== "time-attack" && (
            <p className="dot-matrix text-3xl text-ink leading-tight" aria-label="score">
              {score.toLocaleString("en-US")}
            </p>
          )}
          {mode === "time-attack" && <Led value={fmtTime(elapsedS)} />}
          <AnimatePresence>
            {combo > 1 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="dot-matrix text-sm text-orange font-bold"
              >
                ×{combo}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-start justify-end">
          <button
            aria-label={paused ? "resume" : "pause"}
            className="w-11 h-11 rounded-full shadow-knob-dark bg-[radial-gradient(circle_at_35%_28%,#6a6e75_0%,#55585e_45%,#3b3e43_100%)] flex items-center justify-center active:translate-y-[1px] text-orange"
            onClick={() => {
              const en = engineRef.current!;
              const p = !paused;
              en.setPaused(p);
              setPaused(p);
              audio.ui("switch");
              if (p) audio.suspend();
              else audio.resume();
            }}
          >
            {paused ? (
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
                <path d="M1 1l10 6-10 6z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
                <rect x="1" y="1" width="3.5" height="12" fill="currentColor" />
                <rect x="7.5" y="1" width="3.5" height="12" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* the board */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {/* the feed: a small dark window — a product detail. Items read
          left → right; the leftmost, marked orange, is thrown next. */}
      <div
        className="absolute inset-x-0 z-20 flex flex-col items-center gap-1 pointer-events-none"
        style={{ bottom: "max(0.9rem, env(safe-area-inset-bottom))" }}
      >
        <p className="text-[9px] font-semibold tracking-[0.14em] text-graphite/60">NEXT</p>
        <div className="flex items-end gap-6 px-6 pt-3 pb-2.5 rounded-2xl bg-[linear-gradient(180deg,#4a4d52_0%,#33363b_55%,#26282c_100%)] shadow-knob-dark border border-white/10">
          {queue.slice(0, 3).map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={i === 0 ? "" : "opacity-55"}>
                <ProductThumb tier={t} size={i === 0 ? 53 : 41} />
              </div>
              <span
                className={`h-[3px] rounded-full transition-all ${
                  i === 0 ? "w-7 bg-orange shadow-[0_0_5px_rgba(237,128,8,0.7)]" : "w-2.5 bg-white/15"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <RamsToast text={rams?.text ?? null} nonce={rams?.nonce ?? 0} />

      {/* pause: a small product materializes at the center (ref: product_05) */}
      <AnimatePresence>
        {paused && !over && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-ink/25 backdrop-blur-[2px] flex items-center justify-center px-8"
            onClick={() => {
              engineRef.current!.setPaused(false);
              setPaused(false);
              audio.resume();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="w-full max-w-70 rounded-[28px] p-6 pb-7 text-center bg-[linear-gradient(180deg,#fafbfc_0%,#eceded_50%,#dcdee2_100%)] shadow-raised border border-white/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* speaker perforation */}
              <div className="flex flex-col items-center gap-[5px] mb-5 pt-1" aria-hidden>
                {[7, 9, 7].map((n, row) => (
                  <div key={row} className="flex gap-[5px]">
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className="w-1 h-1 rounded-full bg-graphite/50 shadow-[0_0.5px_0_rgba(255,255,255,0.8)]" />
                    ))}
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">PAUSED</h2>
              <p className="text-[13px] text-graphite mt-1 mb-6">{info.caption}</p>
              <div className="flex flex-col gap-3">
                <PushKey
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    engineRef.current!.setPaused(false);
                    setPaused(false);
                    audio.resume();
                  }}
                >
                  Resume
                </PushKey>
                <Link href="/" className="w-full">
                  <PushKey className="w-full">Leave the board</PushKey>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* game over / completion sheet */}
      <AnimatePresence>
        {over && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-ink/25 backdrop-blur-[2px] flex items-end"
          >
            <motion.div
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="w-full bg-paper rounded-t-3xl p-6 pb-10"
            >
              <div className="w-8 h-1 rounded-full bg-case mx-auto mb-6" />
              <p className="text-[11px] font-medium tracking-[0.12em] text-graphite/70 mb-1">
                {mode === "time-attack"
                  ? "TARGET COMPLETE"
                  : mode === "speed-merge"
                    ? "TIME RAN OUT"
                    : "THE BOARD IS FULL"}
                {over.newRecord && <span className="text-orange"> · NEW RECORD</span>}
              </p>
              <p className="dot-matrix text-5xl text-ink mb-6">
                {mode === "time-attack" || mode === "speed-merge"
                  ? fmtTime(over.durationS)
                  : over.score.toLocaleString("en-US")}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Stat label="MERGES" value={String(over.merges)} />
                <Stat
                  label="LARGEST"
                  value={over.largestTier ? productForTier(over.largestTier).model : "—"}
                />
                <Stat label="TIME" value={fmtTime(over.durationS)} />
              </div>
              <div className="flex gap-3">
                <PushKey variant="primary" className="flex-1" onClick={restart}>
                  Again
                </PushKey>
                <Link href="/" className="flex-1">
                  <PushKey variant="ghost" className="w-full">
                    Menu
                  </PushKey>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A small LED display set into a moulded bezel — a product detail
 * (ref: product_06 clock). Dark glass, luminous digits, two fasteners. */
function Led({ value, urgent = false }: { value: string; urgent?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-xl pl-2 pr-1.5 py-1 bg-[linear-gradient(180deg,#fafbfc_0%,#e6e8eb_55%,#d2d5da_100%)] shadow-knob border border-white/60"
      aria-label="timer"
    >
      <span className="w-[3px] h-[3px] rounded-full bg-graphite/40 shadow-[0_0.5px_0_rgba(255,255,255,0.8)]" />
      <span className="inline-block rounded-md px-2 py-0.5 bg-[#1d1f22] shadow-[inset_0_2px_4px_rgba(0,0,0,0.65)]">
        <span
          className={`dot-matrix text-base leading-none ${urgent ? "text-orange" : "text-[#a9bfa9]"}`}
          style={{ textShadow: urgent ? "0 0 6px rgba(237,128,8,0.6)" : "0 0 5px rgba(169,191,169,0.45)" }}
        >
          {value}
        </span>
      </span>
      <span className="w-[3px] h-[3px] rounded-full bg-graphite/40 shadow-[0_0.5px_0_rgba(255,255,255,0.8)]" />
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-board border border-case rounded-lg p-3 shadow-contact">
      <p className="text-[9px] font-medium tracking-[0.12em] text-graphite/70 mb-1">{label}</p>
      <p className="text-lg font-semibold text-ink leading-none">{value}</p>
    </div>
  );
}
