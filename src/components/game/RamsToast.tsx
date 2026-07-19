"use client";

/**
 * The Rams Moment — 1.1s of quiet wisdom (GDD §12). Fades in, the principle
 * types on in dot-matrix, holds, fades. The game continues behind it.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PixelRams } from "./PixelRams";

export function RamsToast({ text, nonce }: { text: string | null; nonce: number }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!text) return;
    setShown("");
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 500 / Math.max(1, text.length));
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
          className="absolute left-4 bottom-28 flex items-end gap-3 pointer-events-none z-30"
        >
          <PixelRams size={40} />
          <div className="bg-paper/95 border border-case rounded-lg px-3 py-2 shadow-contact mb-1">
            <p className="dot-matrix text-[13px] text-ink">{shown}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
