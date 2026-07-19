"use client";

import { useEffect } from "react";
import { useMeta } from "@/src/state/meta";

export function ThemeApplier() {
  const theme = useMeta((s) => s.settings.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme === "night" ? "night" : "";
  }, [theme]);
  return null;
}
