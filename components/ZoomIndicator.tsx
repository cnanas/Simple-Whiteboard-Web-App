"use client";

import { useBoardStore } from "@/store/boardStore";

export function ZoomIndicator() {
  const zoom = useBoardStore((s) => s.viewport.zoom);
  const percent = Math.round(zoom * 100);

  return (
    <div
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-4 z-30
        px-2 py-1 rounded-md bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-sm
        border border-black/5 dark:border-white/10
        text-xs font-mono text-gray-600 dark:text-gray-400 tabular-nums"
      title="Zoom level"
    >
      {percent}%
    </div>
  );
}
