"use client";

/** Bottom navigation — caption labels, orange dot marks the active station. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { audio } from "@/src/audio/AudioEngine";

const TABS = [
  { href: "/", label: "PLAY" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/records", label: "RECORDS" },
  { href: "/settings", label: "SETTINGS" },
];

export function TabRail() {
  const path = usePathname();
  return (
    <nav
      className="sticky bottom-0 w-full bg-paper/95 backdrop-blur border-t border-case"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-md grid grid-cols-4">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => audio.ui("tick")}
              className="flex flex-col items-center gap-1.5 py-3 min-h-14"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${active ? "bg-orange" : "bg-case"}`}
              />
              <span
                className={`text-[11px] font-medium tracking-[0.08em] ${active ? "text-ink" : "text-graphite/70"}`}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
