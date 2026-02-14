"use client";

import { useOthers, useUpdateMyPresence } from "@/liveblocks.config";
import { useBoardStore } from "@/store/boardStore";
import { useCallback, useEffect } from "react";

export function LiveCursors() {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const viewport = useBoardStore((s) => s.viewport);

  // Track cursor on the window level
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const x = (e.clientX - viewport.x) / viewport.zoom;
      const y = (e.clientY - viewport.y) / viewport.zoom;
      updateMyPresence({ cursor: { x, y } });
    },
    [viewport, updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[80]">
      {others.map(({ connectionId, presence, info }) => {
        if (!presence?.cursor) return null;

        const screenX = presence.cursor.x * viewport.zoom + viewport.x;
        const screenY = presence.cursor.y * viewport.zoom + viewport.y;

        return (
          <div
            key={connectionId}
            className="absolute pointer-events-none"
            style={{
              left: screenX,
              top: screenY,
              transition: "left 80ms linear, top 80ms linear",
            }}
          >
            {/* Cursor arrow */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              style={{ transform: "translate(-1px, -1px)" }}
            >
              <path
                d="M0.928548 2.18278C0.619075 1.37094 1.42087 0.577818 2.2293 0.896107L14.3863 5.68247C15.2271 6.0135 15.2325 7.20148 14.3947 7.54008L9.85984 9.373C9.61167 9.47331 9.41408 9.67076 9.31364 9.91892L7.48032 14.4542C7.14147 15.2922 5.95352 15.2864 5.6228 14.4457L0.928548 2.18278Z"
                fill={info?.color ?? "#2563EB"}
              />
            </svg>
            {/* Name label */}
            <div
              className="absolute left-4 top-4 px-2 py-0.5 rounded-full text-[11px] font-medium text-white whitespace-nowrap shadow-sm"
              style={{ backgroundColor: info?.color ?? "#2563EB" }}
            >
              {info?.name ?? "Anonymous"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
