"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useBoardStore } from "@/store/boardStore";
import { useHistoryStore } from "@/store/historyStore";
import type { WidgetType, Widget } from "@/types";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category: "action" | "widget" | "navigation";
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget?: (widgetId: string) => void;
}

const WIDGET_ICONS: Record<WidgetType, string> = {
  sticky: "📝",
  notepad: "📄",
  taskList: "✅",
  sticker: "⭐",
  calendar: "📅",
  linkCard: "🔗",
  focus: "🎯",
  codeSnippet: "💻",
  dayPlanner: "📊",
};

export function CommandPalette({ isOpen, onClose, onSelectWidget }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const addWidget = useBoardStore((s) => s.addWidget);
  const widgets = useBoardStore((s) => s.widgets);
  const setViewMode = useBoardStore((s) => s.setViewMode);
  const viewMode = useBoardStore((s) => s.viewMode);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.canUndo());
  const canRedo = useHistoryStore((s) => s.canRedo());

  const commands = useMemo((): Command[] => {
    const cmds: Command[] = [];

    // Action commands
    if (canUndo) {
      cmds.push({
        id: "undo",
        label: "Undo",
        description: "Undo last action",
        icon: "↶",
        category: "action",
        action: () => {
          undo();
          onClose();
        },
        keywords: ["undo", "revert"],
      });
    }

    if (canRedo) {
      cmds.push({
        id: "redo",
        label: "Redo",
        description: "Redo last undone action",
        icon: "↷",
        category: "action",
        action: () => {
          redo();
          onClose();
        },
        keywords: ["redo"],
      });
    }

    cmds.push({
      id: "toggle-view",
      label: viewMode === "canvas" ? "Switch to List View" : "Switch to Canvas View",
      description: `Currently in ${viewMode} view`,
      icon: viewMode === "canvas" ? "📋" : "🗺️",
      category: "action",
      action: () => {
        setViewMode(viewMode === "canvas" ? "list" : "canvas");
        onClose();
      },
      keywords: ["view", "list", "canvas", "toggle"],
    });

    // Widget creation commands
    const widgetTypes: { type: WidgetType; label: string; description: string }[] = [
      { type: "sticky", label: "New Sticky Note", description: "Create a sticky note" },
      { type: "notepad", label: "New Notepad", description: "Create a notepad for longer text" },
      { type: "taskList", label: "New Task List", description: "Create a checklist" },
      { type: "calendar", label: "New Calendar", description: "Add a calendar widget" },
      { type: "linkCard", label: "New Link Card", description: "Add a link card" },
      { type: "focus", label: "New Focus Widget", description: "Create a focus/today widget" },
      { type: "codeSnippet", label: "New Code Snippet", description: "Add a code snippet" },
      { type: "dayPlanner", label: "New Day Planner", description: "Create a day planner" },
      { type: "sticker", label: "New Sticker", description: "Add a sticker/emoji" },
    ];

    widgetTypes.forEach(({ type, label, description }) => {
      cmds.push({
        id: `create-${type}`,
        label,
        description,
        icon: WIDGET_ICONS[type],
        category: "widget",
        action: () => {
          addWidget(type);
          onClose();
        },
        keywords: ["create", "new", "add", type],
      });
    });

    // Widget navigation commands (go to existing widgets)
    widgets.slice(0, 20).forEach((widget) => {
      const content = getWidgetSearchableContent(widget);
      if (content) {
        cmds.push({
          id: `goto-${widget.id}`,
          label: `Go to ${widget.type}`,
          description: content.substring(0, 60) + (content.length > 60 ? "..." : ""),
          icon: WIDGET_ICONS[widget.type],
          category: "navigation",
          action: () => {
            onSelectWidget?.(widget.id);
            onClose();
          },
          keywords: ["go", "goto", "find", widget.type, content],
        });
      }
    });

    return cmds;
  }, [addWidget, widgets, canUndo, canRedo, undo, redo, viewMode, setViewMode, onClose, onSelectWidget]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const searchText = [
        cmd.label,
        cmd.description || "",
        ...(cmd.keywords || []),
      ].join(" ").toLowerCase();
      return searchText.includes(lowerQuery);
    });
  }, [commands, query]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filteredCommands[selectedIndex]?.action();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 bg-white dark:bg-[#1a1f26] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base"
          />
          <kbd className="px-2 py-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {cmd.icon && <span className="text-xl">{cmd.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {cmd.label}
                  </div>
                  {cmd.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {cmd.description}
                    </div>
                  )}
                </div>
                {index === selectedIndex && (
                  <kbd className="px-2 py-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                    ↵
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-black/5 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}

function getWidgetSearchableContent(widget: Widget): string {
  switch (widget.type) {
    case "sticky":
      return widget.content || "";
    case "notepad":
      return widget.content || "";
    case "taskList":
      return widget.title || "";
    case "linkCard":
      return widget.title || widget.url || "";
    case "focus":
      return widget.title || "";
    case "codeSnippet":
      return widget.content?.substring(0, 100) || "";
    default:
      return "";
  }
}
