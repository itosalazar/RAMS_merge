"use client";

/**
 * The Rams Moment — four seconds of quiet wisdom (GDD §12, revised).
 * The mentor appears on his calculator screen, the principle types on
 * in dot-matrix, holds, fades. The game continues behind it.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PixelRams } from "./PixelRams";

export function RamsToast({ text, nonce }: { text: string | null; nonce: number }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!text) return;
    // type-on over ~0.9s: first tick clears, then one glyph per tick
    let i = -1;
    const iv = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 900 / Math.max(1, text.length));
    return () => clearInterval(iv);
  }, [text, nonce]);

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={nonce}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute left-2 flex items-end gap-2 pointer-events-none z-30"
          style={{ bottom: "calc(max(0.9rem, env(safe-area-inset-bottom)) + 6px)" }}
        >
          <PixelRams size={44} />
          {/* compact speech bubble, tucked left of the NEXT tray */}
          <div className="relative bg-paper/95 border border-case rounded-lg px-2 py-1.5 shadow-contact mb-1 max-w-[132px]">
            <p className="dot-matrix text-[10px] leading-[1.25] text-ink">{shown}</p>
            <span className="absolute -left-[5px] bottom-2 w-2 h-2 rotate-45 bg-paper/95 border-l border-b border-case" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
