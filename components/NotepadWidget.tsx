"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import { useBoardStore } from "@/store/boardStore";
import type { NotepadWidget as NotepadWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";

interface NotepadWidgetProps {
  widget: NotepadWidgetType;
  standalone?: boolean;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 120;

export function NotepadWidget({ widget, standalone }: NotepadWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const updateWidget = useBoardStore((s) => s.updateWidget);
  const zoom = useBoardStore((s) => s.viewport.zoom);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing, handleClickOutside]);

  // Resize handle gesture
  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        event.stopPropagation();
        updateWidget(widget.id, {
          width: Math.max(MIN_WIDTH, widget.width + dx / zoom),
          height: Math.max(MIN_HEIGHT, widget.height + dy / zoom),
        });
      },
    },
    {
      target: resizeRef,
      drag: { filterTaps: true },
    }
  );

  const inner = (
    <div
        ref={noteRef}
        className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
          bg-white dark:bg-[#1e2328] transition-shadow duration-150 hover:shadow-lg
          flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center px-3 pt-2 pb-1">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Notepad
          </span>
        </div>

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
                text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600
                font-[family-name:var(--font-geist-sans)]"
              placeholder="Write your notes..."
            />
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words
              font-[family-name:var(--font-geist-sans)]">
              {widget.content || (
                <span className="text-gray-400 dark:text-gray-600 italic">
                  Click to write...
                </span>
              )}
            </p>
          )}
        </div>

        {/* Resize handle */}
        <div
          ref={resizeRef}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <svg
            width="16" height="16" viewBox="0 0 16 16"
            className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <path d="M14 14L8 14L14 8Z" fill="currentColor" />
          </svg>
        </div>
      </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} onTap={() => setIsEditing(true)}>
      {inner}
    </DragWrapper>
  );
}
