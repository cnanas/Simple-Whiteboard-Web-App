"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/boardStore";
import { EMOJIS } from "@/types";
import type { StickerWidget as StickerWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";

interface StickerWidgetProps {
  widget: StickerWidgetType;
  standalone?: boolean;
}

export function StickerWidget({ widget, standalone }: StickerWidgetProps) {
  const [showPicker, setShowPicker] = useState(!widget.emoji);
  const updateWidget = useBoardStore((s) => s.updateWidget);

  const inner = (
    <div className="w-full h-full flex items-center justify-center relative group">
      {showPicker && !widget.emoji ? (
          <div
            className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
              bg-white dark:bg-[#1e2328] p-2 grid grid-cols-5 gap-1 overflow-y-auto"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  updateWidget(widget.id, { emoji });
                  setShowPicker(false);
                }}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors flex items-center justify-center aspect-square"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : showPicker ? (
          <div
            className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
              bg-white dark:bg-[#1e2328] p-2 grid grid-cols-5 gap-1 overflow-y-auto"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  updateWidget(widget.id, { emoji });
                  setShowPicker(false);
                }}
                className={`text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors flex items-center justify-center aspect-square
                  ${widget.emoji === emoji ? "bg-blue-100 dark:bg-blue-900/30" : ""}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPicker(true);
            }}
            className="text-6xl leading-none hover:scale-110 transition-transform cursor-pointer"
            title="Click to change"
          >
            {widget.emoji}
          </button>
        )}
      <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={60} minHeight={60} />
    </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} onTap={() => setShowPicker(true)}>
      {inner}
    </DragWrapper>
  );
}
