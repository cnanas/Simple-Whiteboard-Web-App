"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { CodeSnippetWidget as CodeSnippetWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";

interface CodeSnippetWidgetProps {
  widget: CodeSnippetWidgetType;
  standalone?: boolean;
  isSelected?: boolean;
}

const LANGUAGES = ["text", "javascript", "typescript", "python", "html", "css", "json", "bash"];

export function CodeSnippetWidget({ widget, standalone, isSelected }: CodeSnippetWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateWidget = useBoardStore((s) => s.updateWidget);

  useEffect(() => {
    if (isEditing && textareaRef.current) textareaRef.current.focus();
  }, [isEditing]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      ref={containerRef}
      className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
        bg-gray-900 dark:bg-[#0d1117] transition-shadow duration-150 hover:shadow-lg
        flex flex-col overflow-hidden relative group"
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
        <select
          value={widget.language}
          onChange={(e) => updateWidget(widget.id, { language: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-mono bg-transparent text-gray-400 border-none outline-none cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-h-0 p-2">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={widget.content}
            onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") setIsEditing(false); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent resize-none outline-none text-sm text-gray-100 font-mono"
            placeholder="Paste or type code..."
            spellCheck={false}
          />
        ) : (
          <pre
            className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words cursor-pointer min-h-[2em]"
            onClick={() => setIsEditing(true)}
          >
            {widget.content || <span className="text-gray-500 italic">Click to add code</span>}
          </pre>
        )}
      </div>
      <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={200} minHeight={100} showOnHover={true} />
    </div>
  );

  if (standalone) return inner;
  return (
    <DragWrapper widget={widget} isSelected={isSelected} onTap={() => setIsEditing(true)}>
      {inner}
    </DragWrapper>
  );
}
