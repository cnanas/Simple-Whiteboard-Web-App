"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { NotepadWidget as NotepadWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";

interface NotepadWidgetProps {
  widget: NotepadWidgetType;
  standalone?: boolean;
  isSelected?: boolean;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 120;

export function NotepadWidget({ widget, standalone, isSelected }: NotepadWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
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

  const inner = (
    <div
        ref={noteRef}
        className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
          bg-white dark:bg-[#1e2328] transition-shadow duration-150 hover:shadow-lg
          flex flex-col overflow-hidden relative group"
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

        <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={MIN_WIDTH} minHeight={MIN_HEIGHT} />
      </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} isSelected={isSelected} onTap={() => setIsEditing(true)}>
      {inner}
    </DragWrapper>
  );
}
