"use client";

import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

/** Format YYYY-MM-DD for display (e.g. "Mar 15" or "Mar 15, 2025") */
function formatDue(due: string): string {
  const d = new Date(due + "T12:00:00");
  if (isNaN(d.getTime())) return due;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

function isOverdue(due: string): boolean {
  return due < new Date().toISOString().slice(0, 10);
}

function formatEstimate(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

interface SortableTaskRowProps {
  item: TaskItem;
  widget: TaskListWidgetType;
  isEditingText: boolean;
  isEditingDue: boolean;
  isEditingEstimate: boolean;
  deleteConfirmId: string | null;
  onStartEditText: () => void;
  onStartEditDue: () => void;
  onStartEditEstimate: () => void;
  onToggle: () => void;
  onUpdateText: (text: string) => void;
  onUpdateDue: (due: string) => void;
  onUpdateEstimate: (minutes: number) => void;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onEndEdit: () => void;
}

function SortableTaskRow({
  item,
  widget,
  isEditingText,
  isEditingDue,
  isEditingEstimate,
  deleteConfirmId,
  onStartEditText,
  onStartEditDue,
  onStartEditEstimate,
  onToggle,
  onUpdateText,
  onUpdateDue,
  onUpdateEstimate,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
  onEndEdit,
}: SortableTaskRowProps) {
  const textInputRef = useRef<HTMLInputElement>(null);
  const dueInputRef = useRef<HTMLInputElement>(null);
  const estimateInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditingText) textInputRef.current?.focus();
  }, [isEditingText]);
  useEffect(() => {
    if (isEditingDue) dueInputRef.current?.focus();
  }, [isEditingDue]);
  useEffect(() => {
    if (isEditingEstimate) estimateInputRef.current?.focus();
  }, [isEditingEstimate]);

  const overdue = item.due && !item.done && isOverdue(item.due);
  const showDeleteConfirm = deleteConfirmId === item.id;

  const handleRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !isEditingText && !isEditingDue && !isEditingEstimate) {
      e.preventDefault();
      e.stopPropagation();
      onDeleteClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleRowKeyDown}
      className={`flex items-center gap-2 py-1 group/item rounded-md -mx-1 px-1 ${
        isDragging ? "opacity-50 bg-gray-100 dark:bg-gray-800" : ""
      } ${overdue ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
      data-task-id={item.id}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 p-0.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>

      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={item.done ? "Mark as not done" : "Mark as done"}
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

      {/* Text or text input */}
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {isEditingText ? (
          <input
            ref={textInputRef}
            type="text"
            value={item.text}
            onChange={(e) => onUpdateText(e.target.value)}
            onBlur={() => onUpdateText(item.text.trim())}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                onUpdateText(item.text);
                e.currentTarget.blur();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 min-w-[80px] bg-transparent outline-none border-b border-blue-500 text-gray-800 dark:text-gray-200 ${getTextStyleClassName(widget.textStyle)}`}
            aria-label="Edit task text"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditText();
            }}
            className={`text-left flex-1 min-w-0 ${
              item.done
                ? "text-gray-400 dark:text-gray-600 line-through"
                : "text-gray-700 dark:text-gray-300"
            } ${getTextStyleClassName(widget.textStyle)} hover:text-blue-500 dark:hover:text-blue-400`}
          >
            {item.text || "Untitled"}
          </button>
        )}

        {/* Due: display or date input */}
        {isEditingDue ? (
          <input
            ref={dueInputRef}
            type="date"
            value={item.due ?? ""}
            onChange={(e) => onUpdateDue(e.target.value)}
            onBlur={() => onEndEdit()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" || e.key === "Escape") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-[110px] text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300"
            aria-label="Due date"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditDue();
            }}
            className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
              item.due
                ? overdue
                  ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                  : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
            aria-label={item.due ? `Due ${formatDue(item.due)}` : "Set due date"}
          >
            {item.due ? formatDue(item.due) : "Due"}
          </button>
        )}

        {/* Estimate: display or number input */}
        {isEditingEstimate ? (
          <input
            ref={estimateInputRef}
            type="number"
            min={1}
            max={999}
            value={item.estimate ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") onUpdateEstimate(0);
              else onUpdateEstimate(Math.max(0, parseInt(v, 10) || 0));
            }}
            onBlur={() => onEndEdit()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" || e.key === "Escape") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-12 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300"
            placeholder="min"
            aria-label="Time estimate (minutes)"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditEstimate();
            }}
            className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
              item.estimate != null && item.estimate > 0
                ? "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
            aria-label={item.estimate ? `${item.estimate} minutes` : "Set estimate"}
          >
            {item.estimate != null && item.estimate > 0 ? formatEstimate(item.estimate) : "Est."}
          </button>
        )}
      </div>

      {/* Delete: button or confirm */}
      {showDeleteConfirm ? (
        <span className="shrink-0 flex items-center gap-0.5 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConfirm();
            }}
            className="text-red-600 dark:text-red-400 font-medium px-1"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCancel();
            }}
            className="text-gray-500 dark:text-gray-400 px-1"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
          className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 p-0.5"
          aria-label="Delete task"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function TaskListWidget({ widget, standalone, isSelected }: TaskListWidgetProps) {
  const [newItemText, setNewItemText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"text" | "due" | "estimate" | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

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
    // Keep focus in add input so user can add more
    requestAnimationFrame(() => addInputRef.current?.focus());
  };

  const toggleItem = (itemId: string) => {
    updateWidget(widget.id, {
      items: widget.items.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    });
  };

  const updateItem = (itemId: string, patch: Partial<TaskItem>) => {
    updateWidget(widget.id, {
      items: widget.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      ),
    });
  };

  const deleteItem = (itemId: string) => {
    updateWidget(widget.id, {
      items: widget.items.filter((item) => item.id !== itemId),
    });
    setDeleteConfirmId(null);
  };

  const setItemsOrder = (items: TaskItem[]) => {
    updateWidget(widget.id, { items });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = widget.items.findIndex((i) => i.id === active.id);
    const newIndex = widget.items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setItemsOrder(arrayMove(widget.items, oldIndex, newIndex));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: () => ({ x: 0, y: 0 }) })
  );

  const doneCount = widget.items.filter((i) => i.done).length;
  const totalEstimate = widget.items
    .filter((i) => !i.done && i.estimate != null && i.estimate > 0)
    .reduce((sum, i) => sum + (i.estimate ?? 0), 0);

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
              aria-label="Widget title"
            />
          ) : (
            <button
              type="button"
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
              {totalEstimate > 0 && (
                <span className="ml-1.5 text-gray-400 dark:text-gray-500" title="Total estimate for incomplete tasks">
                  · {formatEstimate(totalEstimate)}
                </span>
              )}
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

      {/* Progress bar */}
      {widget.items.length > 0 && (
        <div className="px-3 pb-1">
          <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${widget.items.length ? (doneCount / widget.items.length) * 100 : 0}%` }}
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={widget.items.length}
              aria-label="Tasks completed"
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 min-h-0" role="list">
        {widget.items.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center" role="status">
            No tasks yet — add one below.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widget.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {widget.items.map((item) => (
                <SortableTaskRow
                  key={item.id}
                  item={item}
                  widget={widget}
                  isEditingText={editingItemId === item.id && editingField === "text"}
                  isEditingDue={editingItemId === item.id && editingField === "due"}
                  isEditingEstimate={editingItemId === item.id && editingField === "estimate"}
                  deleteConfirmId={deleteConfirmId}
                  onStartEditText={() => {
                    setEditingItemId(item.id);
                    setEditingField("text");
                  }}
                  onStartEditDue={() => {
                    setEditingItemId(item.id);
                    setEditingField("due");
                  }}
                  onStartEditEstimate={() => {
                    setEditingItemId(item.id);
                    setEditingField("estimate");
                  }}
                  onToggle={() => toggleItem(item.id)}
                  onUpdateText={(text) => {
                    updateItem(item.id, { text: text.trim() || item.text });
                    setEditingItemId(null);
                    setEditingField(null);
                  }}
                  onUpdateDue={(due) => {
                    updateItem(item.id, { due: due || undefined });
                    if (editingField === "due") setEditingItemId(null);
                    setEditingField(null);
                  }}
                  onUpdateEstimate={(minutes) => {
                    updateItem(item.id, { estimate: minutes > 0 ? minutes : undefined });
                    if (editingField === "estimate") setEditingItemId(null);
                    setEditingField(null);
                  }}
                  onDeleteClick={() => setDeleteConfirmId(item.id)}
                  onDeleteConfirm={() => deleteItem(item.id)}
                  onDeleteCancel={() => setDeleteConfirmId(null)}
                  onEndEdit={() => {
                    setEditingItemId(null);
                    setEditingField(null);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add item input */}
      <div className="px-3 pb-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
        <input
          ref={addInputRef}
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") addItem();
            if (e.key === "Backspace" && !newItemText && widget.items.length > 0) {
              // Optional: focus last item for deletion
              e.preventDefault();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 font-[family-name:var(--font-geist-sans)] ${getTextStyleClassName(widget.textStyle)}`}
          placeholder="Add a task..."
          aria-label="Add a task"
        />
      </div>
        <ResizeHandle widgetId={widget.id} width={widget.width} height={widget.height} minWidth={200} minHeight={160} />
      </div>
  );

  if (standalone) return inner;
  return <DragWrapper widget={widget} isSelected={isSelected}>{inner}</DragWrapper>;
}
