"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import { STICKY_COLORS } from "@/types";
import type { StickyWidget } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";

interface StickyNoteProps {
  widget: StickyWidget;
  standalone?: boolean;
  isSelected?: boolean;
}

export function StickyNote({ widget, standalone, isSelected }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const updateWidget = useBoardStore((s) => s.updateWidget);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        setShowColors(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isEditing || showColors) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing, showColors, handleClickOutside]);

  const inner = (
    <div
        ref={noteRef}
        className="w-full h-full rounded-xl shadow-md border border-black/5 dark:border-white/10
          transition-shadow duration-150 hover:shadow-lg flex flex-col overflow-hidden relative group"
        style={{ backgroundColor: widget.color }}
      >
        {/* Header bar with color toggle */}
        <div className="flex items-center justify-end gap-1 px-2 pt-1.5 pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColors(!showColors);
            }}
            className="w-5 h-5 rounded-full flex items-center justify-center
              text-black/40 hover:text-black/70 text-xs"
            title="Change color"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* Color picker */}
        {showColors && (
          <div className="flex gap-1.5 px-2 pb-1.5">
            {STICKY_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  updateWidget(widget.id, { color: c.value });
                  setShowColors(false);
                }}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  borderColor:
                    widget.color === c.value
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(0,0,0,0.1)",
                }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 px-3 pb-2 min-h-0">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={widget.content}
              onChange={(e) =>
                updateWidget(widget.id, { content: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsEditing(false);
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent resize-none outline-none
                text-sm text-black/80 placeholder-black/30
                font-[family-name:var(--font-geist-sans)]"
              placeholder="Type something..."
            />
          ) : (
            <p className="text-sm text-black/80 whitespace-pre-wrap break-words font-[family-name:var(--font-geist-sans)]">
              {widget.content || (
                <span className="text-black/30 italic">Click to edit...</span>
              )}
            </p>
          )}
        </div>
        <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={120} minHeight={100} />
      </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} onTap={() => setIsEditing(true)} isSelected={isSelected}>
      {inner}
    </DragWrapper>
  );
}
