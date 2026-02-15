"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import { STICKY_COLORS } from "@/types";
import type { StickyWidget } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";
import { MarkdownContent } from "./MarkdownContent";
import { TextStyleToolbar } from "./TextStyleToolbar";
import { getTextStyleClassName, getListStyle } from "@/lib/textStyle";
import { applyFormatToSelection, type SelectionFormatType } from "@/lib/selectionFormat";

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

  const handleFormatSelection = useCallback(
    (format: SelectionFormatType) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const result = applyFormatToSelection(widget.content || "", start, end, format);
      const isBoldOrItalic = format === "bold" || format === "italic";
      updateWidget(widget.id, {
        content: result.content,
        ...(isBoldOrItalic ? { markdown: true } : {}),
      });
      if (isBoldOrItalic) {
        setIsEditing(false);
      } else {
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(result.selectionStart, result.selectionEnd);
        });
      }
    },
    [widget.id, widget.content, updateWidget]
  );

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
    <div ref={noteRef} className="w-full h-full relative group">
      {/* Floating format bar — above the sticky, outside the card */}
      <div
        className="absolute left-0 right-8 z-10 -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
          <TextStyleToolbar
            value={widget.textStyle}
            onChange={(textStyle) => updateWidget(widget.id, { textStyle })}
            onFormatSelection={isEditing ? handleFormatSelection : undefined}
            showListOptions
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColors(!showColors);
            }}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Change color"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sticky card */}
      <div
        className="w-full h-full rounded-xl shadow-md border border-black/5 dark:border-white/10
          transition-shadow duration-150 hover:shadow-lg flex flex-col overflow-hidden"
        style={{ backgroundColor: widget.color }}
      >
        {/* Color picker (when open) */}
        {showColors && (
          <div className="flex gap-1.5 px-2 pt-2 pb-1">
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
        <div className="flex-1 px-3 pb-2 min-h-0 pt-1">
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
              className={`w-full h-full bg-transparent resize-none outline-none text-black/80 placeholder-black/30 font-[family-name:var(--font-geist-sans)] ${getTextStyleClassName(widget.textStyle)}`}
              placeholder="Type something..."
            />
          ) : widget.content ? (
            <MarkdownContent
              content={widget.content}
              className={`text-black/80 [&_*]:text-black/80 ${getTextStyleClassName(widget.textStyle)}`}
            />
          ) : (() => {
            const listStyle = getListStyle(widget.textStyle);
            const lines = (widget.content || "").trim().split(/\n/).filter(Boolean);
            const contentClass = `text-black/80 whitespace-pre-wrap break-words font-[family-name:var(--font-geist-sans)] ${getTextStyleClassName(widget.textStyle)}`;
            if (listStyle === "bullet" && lines.length > 0) {
              return (
                <ul className={`list-disc pl-4 space-y-0.5 ${contentClass}`}>
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              );
            }
            if (listStyle === "number" && lines.length > 0) {
              return (
                <ol className={`list-decimal pl-4 space-y-0.5 ${contentClass}`}>
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
              );
            }
            return (
              <p className={contentClass}>
                {widget.content || (
                  <span className="text-black/30 italic">Click to edit...</span>
                )}
              </p>
            );
          })()}
        </div>
        <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={120} minHeight={100} />
      </div>
    </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} onTap={() => setIsEditing(true)} isSelected={isSelected}>
      {inner}
    </DragWrapper>
  );
}
