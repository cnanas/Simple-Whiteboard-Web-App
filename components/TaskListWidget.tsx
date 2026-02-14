"use client";

import { useState, useRef } from "react";
import { nanoid } from "nanoid";
import { useBoardStore } from "@/store/boardStore";
import type { TaskListWidget as TaskListWidgetType, TaskItem } from "@/types";
import { DragWrapper } from "./DragWrapper";
import { ResizeHandle } from "./ResizeHandle";
import { TextStyleToolbar } from "./TextStyleToolbar";
import { getTextStyleClassName } from "@/lib/textStyle";

interface TaskListWidgetProps {
  widget: TaskListWidgetType;
  standalone?: boolean;
  isSelected?: boolean;
}

export function TaskListWidget({ widget, standalone, isSelected }: TaskListWidgetProps) {
  const [newItemText, setNewItemText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const updateWidget = useBoardStore((s) => s.updateWidget);

  const addItem = () => {
    if (!newItemText.trim()) return;
    const item: TaskItem = {
      id: nanoid(),
      text: newItemText.trim(),
      done: false,
    };
    updateWidget(widget.id, { items: [...widget.items, item] });
    setNewItemText("");
  };

  const toggleItem = (itemId: string) => {
    updateWidget(widget.id, {
      items: widget.items.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    });
  };

  const deleteItem = (itemId: string) => {
    updateWidget(widget.id, {
      items: widget.items.filter((item) => item.id !== itemId),
    });
  };

  const doneCount = widget.items.filter((i) => i.done).length;

  const inner = (
    <div
        className="w-full h-full rounded-xl shadow-md border border-black/10 dark:border-white/10
          bg-white dark:bg-[#1e2328] transition-shadow duration-150 hover:shadow-lg
          flex flex-col overflow-hidden relative group"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-1 px-3 pt-2 pb-1">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {editingTitle ? (
              <input
                ref={titleRef}
                autoFocus
                value={widget.title}
                onChange={(e) => {
                  e.stopPropagation();
                  updateWidget(widget.id, { title: e.target.value });
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false);
                }}
                onBlur={() => setEditingTitle(false)}
                onClick={(e) => e.stopPropagation()}
                className={`font-semibold bg-transparent outline-none border-b border-blue-500 text-gray-800 dark:text-gray-200 w-full ${getTextStyleClassName(widget.textStyle)}`}
              />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle(true);
                }}
                className={`font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-500 transition-colors text-left ${getTextStyleClassName(widget.textStyle)}`}
              >
                {widget.title || "Tasks"}
              </button>
            )}
            {widget.items.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
                {doneCount}/{widget.items.length}
              </span>
            )}
          </div>
          <TextStyleToolbar
            value={widget.textStyle}
            onChange={(textStyle) => updateWidget(widget.id, { textStyle })}
            showListOptions={false}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0">
          {widget.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1 group/item"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
                className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                  item.done
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                }`}
              >
                {item.done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 ${
                  item.done
                    ? "text-gray-400 dark:text-gray-600 line-through"
                    : "text-gray-700 dark:text-gray-300"
                } ${getTextStyleClassName(widget.textStyle)}`}
              >
                {item.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item.id);
                }}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400
                  opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add item input */}
        <div className="px-3 pb-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
          <input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") addItem();
            }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 font-[family-name:var(--font-geist-sans)] ${getTextStyleClassName(widget.textStyle)}`}
            placeholder="Add a task..."
          />
        </div>
        <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={200} minHeight={160} />
      </div>
  );

  if (standalone) return inner;
  return <DragWrapper widget={widget} isSelected={isSelected}>{inner}</DragWrapper>;
}
