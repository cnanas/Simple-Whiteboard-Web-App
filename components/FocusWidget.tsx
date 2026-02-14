"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { FocusWidget as FocusWidgetType } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";

interface FocusWidgetProps {
  widget: FocusWidgetType;
  standalone?: boolean;
  isSelected?: boolean;
}

const MAX_ITEMS = 8;

export function FocusWidget({ widget, standalone, isSelected }: FocusWidgetProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const updateWidget = useBoardStore((s) => s.updateWidget);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setEditingIndex(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const addItem = () => {
    if (!newItem.trim() || widget.items.length >= MAX_ITEMS) return;
    updateWidget(widget.id, { items: [...widget.items, newItem.trim()] });
    setNewItem("");
  };

  const updateItem = (index: number, text: string) => {
    const next = [...widget.items];
    next[index] = text;
    updateWidget(widget.id, { items: next });
  };

  const removeItem = (index: number) => {
    updateWidget(widget.id, { items: widget.items.filter((_, i) => i !== index) });
    setEditingIndex(null);
  };

  const inner = (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
        bg-white dark:bg-[#1e2328] transition-shadow duration-150 hover:shadow-lg
        flex flex-col overflow-hidden relative group p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <input
          value={widget.title}
          onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-semibold bg-transparent outline-none text-gray-800 dark:text-gray-200 flex-1"
          placeholder="Today"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {widget.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group/item">
            <span className="text-gray-400 dark:text-gray-500 w-4 text-xs">{i + 1}.</span>
            {editingIndex === i ? (
              <input
                autoFocus
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") setEditingIndex(null);
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                onBlur={() => setEditingIndex(null)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-sm bg-transparent outline-none border-b border-blue-500 text-gray-800 dark:text-gray-200"
              />
            ) : (
              <span
                className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer py-0.5"
                onClick={(e) => { e.stopPropagation(); setEditingIndex(i); }}
              >
                {item || "—"}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeItem(i); }}
              className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 p-0.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
        {widget.items.length < MAX_ITEMS && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-gray-400 w-4 text-xs">+</span>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") addItem(); }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add focus item..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-500 placeholder-gray-400"
            />
          </div>
        )}
      </div>
      <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={200} minHeight={120} />
    </div>
  );

  if (standalone) return inner;
  return <DragWrapper widget={widget} isSelected={isSelected}>{inner}</DragWrapper>;
}
