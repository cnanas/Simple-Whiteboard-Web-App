"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { LinkCardWidget as LinkCardWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";
import { TextStyleToolbar } from "./TextStyleToolbar";
import { getTextStyleClassName } from "@/lib/textStyle";

interface LinkCardWidgetProps {
  widget: LinkCardWidgetType;
  standalone?: boolean;
  isSelected?: boolean;
}

export function LinkCardWidget({ widget, standalone, isSelected }: LinkCardWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const updateWidget = useBoardStore((s) => s.updateWidget);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setIsEditing(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing, handleClickOutside]);

  const inner = (
    <div
      ref={cardRef}
      className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
        bg-white dark:bg-[#1e2328] transition-shadow duration-150 hover:shadow-lg
        flex flex-col overflow-hidden relative group p-3"
    >
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Link</span>
          <TextStyleToolbar
            value={widget.textStyle}
            onChange={(textStyle) => updateWidget(widget.id, { textStyle })}
            showListOptions={false}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
        {isEditing ? (
          <>
            <input
              value={widget.title}
              onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") setIsEditing(false); }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Title"
              className={`w-full px-2 py-1 font-semibold bg-transparent outline-none border-b border-blue-500 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${getTextStyleClassName(widget.textStyle)}`}
            />
            <input
              value={widget.url}
              onChange={(e) => updateWidget(widget.id, { url: e.target.value })}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") setIsEditing(false); }}
              onClick={(e) => e.stopPropagation()}
              placeholder="https://..."
              className="w-full px-2 py-1 text-sm bg-transparent outline-none border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 placeholder-gray-400"
            />
          </>
        ) : (
          <>
            {widget.title || widget.url ? (
              <a
                href={widget.url?.startsWith("http") ? widget.url : `https://${widget.url || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all ${getTextStyleClassName(widget.textStyle)}`}
              >
                {widget.title || widget.url || "Add title or URL"}
              </a>
            ) : (
              <span className={`text-gray-400 dark:text-gray-500 italic ${getTextStyleClassName(widget.textStyle)}`}>Click to add link</span>
            )}
          </>
        )}
      </div>
      <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={180} minHeight={60} />
    </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} isSelected={isSelected} onTap={() => setIsEditing(true)}>
      {inner}
    </DragWrapper>
  );
}
