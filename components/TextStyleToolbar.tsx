"use client";

import type { TextStyle, FontSizeOption, ListStyleOption } from "@/types";
import { mergeWithDefault } from "@/lib/textStyle";
import type { SelectionFormatType } from "@/lib/selectionFormat";

interface TextStyleToolbarProps {
  value?: TextStyle | null;
  onChange: (style: TextStyle) => void;
  /** When set, Bold/Italic/Bullet/Number apply to the current selection instead of the whole widget. */
  onFormatSelection?: (format: SelectionFormatType) => void;
  /** Show bullet/number list options (for sticky, notepad). Default true. */
  showListOptions?: boolean;
  /** When set, show Insert table button (e.g. for notepad). */
  onInsertTable?: () => void;
  className?: string;
}

const FONT_SIZES: { value: FontSizeOption; label: string; title: string }[] = [
  { value: "xs", label: "XS", title: "Extra small" },
  { value: "sm", label: "S", title: "Small" },
  { value: "base", label: "M", title: "Medium" },
  { value: "lg", label: "L", title: "Large" },
  { value: "xl", label: "XL", title: "Extra large" },
];

export function TextStyleToolbar({
  value,
  onChange,
  onFormatSelection,
  showListOptions = true,
  onInsertTable,
  className = "",
}: TextStyleToolbarProps) {
  const s = mergeWithDefault(value);
  const selectionMode = !!onFormatSelection;

  const toggle = (key: keyof TextStyle, val: unknown) => {
    onChange({ ...s, [key]: val });
  };

  const keepSelection = selectionMode
    ? { onMouseDown: (e: React.MouseEvent) => e.preventDefault() }
    : {};

  return (
    <div
      className={`flex items-center gap-0.5 flex-wrap ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        {...keepSelection}
        onClick={() => (selectionMode ? onFormatSelection!("bold") : toggle("bold", !s.bold))}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
          !selectionMode && s.bold
            ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title={selectionMode ? "Bold (selection)" : "Bold"}
      >
        <span className="font-bold text-sm">B</span>
      </button>
      <button
        type="button"
        {...keepSelection}
        onClick={() => (selectionMode ? onFormatSelection!("italic") : toggle("italic", !s.italic))}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
          !selectionMode && s.italic
            ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title={selectionMode ? "Italic (selection)" : "Italic"}
      >
        <span className="italic text-sm">I</span>
      </button>
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
      <div className="flex items-center rounded overflow-hidden border border-gray-200 dark:border-gray-600">
        {FONT_SIZES.map(({ value: v, label, title }) => (
          <button
            key={v}
            type="button"
            onClick={() => toggle("fontSize", v)}
            className={`w-7 h-7 flex items-center justify-center text-xs transition-colors ${
              s.fontSize === v
                ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={title}
          >
            {label}
          </button>
        ))}
      </div>
      {showListOptions && (
        <>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <button
            type="button"
            {...keepSelection}
            onClick={() =>
              selectionMode ? onFormatSelection!("bullet") : toggle("listStyle", s.listStyle === "bullet" ? "none" : "bullet")
            }
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              !selectionMode && s.listStyle === "bullet"
                ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={selectionMode ? "Bullet list (selection)" : "Bullet list"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="8" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="1.5" fill="currentColor" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" />
              <circle cx="4" cy="18" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            {...keepSelection}
            onClick={() =>
              selectionMode ? onFormatSelection!("number") : toggle("listStyle", s.listStyle === "number" ? "none" : "number")
            }
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              !selectionMode && s.listStyle === "number"
                ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={selectionMode ? "Numbered list (selection)" : "Numbered list"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="8" y1="18" x2="20" y2="18" />
              <line x1="4" y1="5" x2="4" y2="19" />
            </svg>
          </button>
        </>
      )}
      {onInsertTable && (
        <>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
            onClick={onInsertTable}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Insert table"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
