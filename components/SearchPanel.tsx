"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { Widget, WidgetType, StickyWidget } from "@/types";
import { STICKY_COLORS } from "@/types";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget?: (widgetId: string) => void;
}

const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  sticky: "Sticky Note",
  notepad: "Notepad",
  taskList: "Task List",
  sticker: "Sticker",
  calendar: "Calendar",
  linkCard: "Link Card",
  focus: "Focus",
  codeSnippet: "Code Snippet",
  dayPlanner: "Day Planner",
};

type SortOption = "default" | "type" | "dateCreated" | "position";

export function SearchPanel({ isOpen, onClose, onSelectWidget }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<WidgetType | "all">("all");
  const [filterLocked, setFilterLocked] = useState<"all" | "locked" | "unlocked">("all");
  const [filterColor, setFilterColor] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const inputRef = useRef<HTMLInputElement>(null);

  const widgets = useBoardStore((s) => s.widgets);
  const updateWidget = useBoardStore((s) => s.updateWidget);

  const filteredWidgets = useMemo(() => {
    let filtered = widgets;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((w) => w.type === filterType);
    }

    // Filter by locked status
    if (filterLocked === "locked") {
      filtered = filtered.filter((w) => w.locked);
    } else if (filterLocked === "unlocked") {
      filtered = filtered.filter((w) => !w.locked);
    }

    // Filter by color (sticky notes only)
    if (filterColor !== "all") {
      filtered = filtered.filter(
        (w) => w.type === "sticky" && (w as StickyWidget).color === filterColor
      );
    }

    // Search by content
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((w) => {
        const content = getWidgetContent(w).toLowerCase();
        return content.includes(lowerQuery);
      });
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "type":
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "dateCreated":
        sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        break;
      case "position":
        sorted.sort((a, b) => {
          const rowA = Math.round(a.y / 100);
          const rowB = Math.round(b.y / 100);
          if (rowA !== rowB) return rowA - rowB;
          return a.x - b.x;
        });
        break;
    }

    return sorted;
  }, [widgets, query, filterType, filterLocked, filterColor, sortBy]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white dark:bg-[#1a1f26] shadow-2xl border-l border-black/10 dark:border-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Search Widgets
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search content..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as WidgetType | "all")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              {Object.entries(WIDGET_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterLocked}
              onChange={(e) => setFilterLocked(e.target.value as "all" | "locked" | "unlocked")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="default">Default order</option>
              <option value="type">Sort by type</option>
              <option value="dateCreated">Sort by date</option>
              <option value="position">Sort by position</option>
            </select>
          </div>

          {/* Color filter for sticky notes */}
          {(filterType === "all" || filterType === "sticky") && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Color:</span>
              <button
                onClick={() => setFilterColor("all")}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  filterColor === "all" ? "border-blue-500 scale-110" : "border-gray-300 dark:border-gray-600"
                }`}
                style={{ background: "linear-gradient(135deg, #fef08a, #bfdbfe, #bbf7d0)" }}
                title="All colors"
              />
              {STICKY_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setFilterColor(filterColor === c.value ? "all" : c.value)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                    filterColor === c.value ? "border-blue-500 scale-110" : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-3 opacity-30">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p>No widgets found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWidgets.map((widget) => (
                <WidgetSearchResult
                  key={widget.id}
                  widget={widget}
                  query={query}
                  onSelect={() => {
                    onSelectWidget?.(widget.id);
                    onClose();
                  }}
                  onUpdate={(updates) => updateWidget(widget.id, updates)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-black/5 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
          {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? "s" : ""} found
        </div>
      </div>
    </div>
  );
}

interface WidgetSearchResultProps {
  widget: Widget;
  query: string;
  onSelect: () => void;
  onUpdate: (updates: Record<string, unknown>) => void;
}

function WidgetSearchResult({ widget, query, onSelect }: WidgetSearchResultProps) {
  const content = getWidgetContent(widget);
  const preview = content.substring(0, 150) + (content.length > 150 ? "..." : "");

  // Highlight search query
  const highlightText = (text: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <button
      onClick={onSelect}
      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {WIDGET_TYPE_LABELS[widget.type]}
          </span>
          {widget.type === "sticky" && (
            <span
              className="w-3 h-3 rounded-full border border-black/10"
              style={{ backgroundColor: (widget as StickyWidget).color }}
            />
          )}
        </div>
        {widget.locked && (
          <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
            Locked
          </span>
        )}
      </div>
      {preview && (
        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
          {highlightText(preview)}
        </p>
      )}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
        <span>Position: ({Math.round(widget.x)}, {Math.round(widget.y)})</span>
        {widget.createdAt && (
          <span>Created: {new Date(widget.createdAt).toLocaleDateString()}</span>
        )}
      </div>
    </button>
  );
}

function getWidgetContent(widget: Widget): string {
  switch (widget.type) {
    case "sticky":
      return widget.content || "";
    case "notepad":
      return widget.content || "";
    case "taskList":
      return [
        widget.title,
        ...widget.items.map((item) => `${item.done ? "\u2713" : "\u25CB"} ${item.text}`),
      ].join("\n");
    case "linkCard":
      return `${widget.title}\n${widget.url}`;
    case "focus":
      return [widget.title, ...widget.items].join("\n");
    case "codeSnippet":
      return widget.content || "";
    case "sticker":
      return widget.emoji;
    case "calendar":
      return `Calendar ${widget.month + 1}/${widget.year}`;
    case "dayPlanner": {
      const dates = Object.keys(widget.tasksByDate || {});
      return `Day Planner (${dates.length} days)`;
    }
    default:
      return "";
  }
}
