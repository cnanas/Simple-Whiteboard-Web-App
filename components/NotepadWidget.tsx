"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { NotepadWidget as NotepadWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";
import { MarkdownContent } from "./MarkdownContent";
import { TextStyleToolbar } from "./TextStyleToolbar";
import { getTextStyleClassName, getListStyle } from "@/lib/textStyle";
import { applyFormatToSelection, type SelectionFormatType } from "@/lib/selectionFormat";
import { htmlTableToMarkdown, plainTextTableToMarkdown, getDefaultMarkdownTable } from "@/lib/htmlTableToMarkdown";

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

  const handleInsertTable = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const content = widget.content ?? "";
    const before = content.slice(0, start);
    const after = content.slice(start);
    const table = getDefaultMarkdownTable(3, 3);
    const prefix = before && !before.endsWith("\n") ? "\n\n" : before ? "\n" : "";
    const newContent = before + prefix + table + "\n\n" + after;
    updateWidget(widget.id, { content: newContent, markdown: true });
    const insertLen = prefix.length + table.length + 2;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + insertLen, start + insertLen);
    });
  }, [widget.id, widget.content, updateWidget]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      let markdown: string | null = null;
      const html = e.clipboardData?.getData("text/html");
      const plain = e.clipboardData?.getData("text/plain");
      if (html) markdown = htmlTableToMarkdown(html);
      if (markdown == null && plain && plain.includes("\t")) {
        markdown = plainTextTableToMarkdown(plain);
      }
      if (markdown != null) {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const content = widget.content ?? "";
        const before = content.slice(0, start);
        const after = content.slice(end);
        const prefix = before && !before.endsWith("\n") ? "\n\n" : before ? "\n" : "";
        const newContent = before + prefix + markdown + "\n\n" + after;
        updateWidget(widget.id, { content: newContent, markdown: true });
        const insertLen = prefix.length + markdown.length + 2;
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start + insertLen, start + insertLen);
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
        <div className="flex flex-wrap items-center justify-between gap-1 px-3 pt-2 pb-1">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Notepad
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TextStyleToolbar
              value={widget.textStyle}
              onChange={(textStyle) => updateWidget(widget.id, { textStyle })}
              onFormatSelection={isEditing ? handleFormatSelection : undefined}
              showListOptions
              onInsertTable={isEditing ? handleInsertTable : undefined}
            />
          </div>
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
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsEditing(false);
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full h-full bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 font-[family-name:var(--font-geist-sans)] ${getTextStyleClassName(widget.textStyle)}`}
              placeholder="Write your notes..."
            />
          ) : widget.content ? (
            <MarkdownContent content={widget.content} className={`overflow-y-auto ${getTextStyleClassName(widget.textStyle)}`} />
          ) : (() => {
            const listStyle = getListStyle(widget.textStyle);
            const lines = (widget.content || "").trim().split(/\n/).filter(Boolean);
            const contentClass = `text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words font-[family-name:var(--font-geist-sans)] ${getTextStyleClassName(widget.textStyle)}`;
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
                  <span className="text-gray-400 dark:text-gray-600 italic">
                    Click to write...
                  </span>
                )}
              </p>
            );
          })()}
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
