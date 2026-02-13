"use client";

import type { WidgetType } from "@/types";

interface WidgetPickerProps {
  onSelect: (type: WidgetType) => void;
  onClose: () => void;
}

export const WIDGET_OPTIONS: { type: WidgetType; label: string; icon: React.ReactNode }[] = [
  {
    type: "sticky",
    label: "Sticky Note",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M14 3v4a2 2 0 0 0 2 2h4" />
      </svg>
    ),
  },
  {
    type: "notepad",
    label: "Notepad",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    type: "taskList",
    label: "Task List",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    type: "sticker",
    label: "Sticker",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "calendar",
    label: "Calendar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    type: "linkCard",
    label: "Link",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    type: "focus",
    label: "Today / Focus",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    type: "codeSnippet",
    label: "Code",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    type: "dayPlanner",
    label: "Day planner",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="3" width="4" height="18" rx="1" />
        <rect x="10" y="3" width="4" height="18" rx="1" />
        <rect x="16" y="3" width="4" height="18" rx="1" />
        <line x1="4" y1="8" x2="8" y2="8" />
        <line x1="10" y1="8" x2="14" y2="8" />
        <line x1="16" y1="8" x2="20" y2="8" />
      </svg>
    ),
  },
];

export function WidgetPicker({ onSelect, onClose }: WidgetPickerProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div className="absolute top-full left-0 mt-2 z-50 w-48
        bg-white dark:bg-[#1e2328] rounded-xl shadow-xl
        border border-black/10 dark:border-white/10
        py-1 overflow-hidden">
        {WIDGET_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => {
              onSelect(option.type);
              onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700/50
              transition-colors duration-100"
          >
            <span className="text-gray-500 dark:text-gray-400">
              {option.icon}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
