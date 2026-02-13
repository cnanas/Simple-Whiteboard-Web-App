"use client";

import { useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { useBoardStore } from "@/store/boardStore";

interface ResizeHandleProps {
  widgetId: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  /** Optional: only show on hover (parent should have group) */
  showOnHover?: boolean;
}

export function ResizeHandle({
  widgetId,
  width,
  height,
  minWidth,
  minHeight,
  showOnHover = true,
}: ResizeHandleProps) {
  const resizeRef = useRef<HTMLDivElement>(null);
  const updateWidget = useBoardStore((s) => s.updateWidget);
  const zoom = useBoardStore((s) => s.viewport.zoom);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        event.stopPropagation();
        updateWidget(widgetId, {
          width: Math.max(minWidth, width + dx / zoom),
          height: Math.max(minHeight, height + dy / zoom),
        });
      },
    },
    {
      target: resizeRef,
      drag: { filterTaps: true },
    }
  );

  return (
    <div
      ref={resizeRef}
      className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none
        ${showOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="text-gray-300 dark:text-gray-600"
      >
        <path d="M14 14L8 14L14 8Z" fill="currentColor" />
      </svg>
    </div>
  );
}
