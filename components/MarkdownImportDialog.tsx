"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useBoardStore } from "@/store/boardStore";
import { nanoid } from "nanoid";
import type { Widget } from "@/types";
import { STICKY_COLORS } from "@/types";

interface MarkdownImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarkdownImportDialog({ isOpen, onClose }: MarkdownImportDialogProps) {
  const [markdown, setMarkdown] = useState("");
  const viewport = useBoardStore((s) => s.viewport);
  const widgets = useBoardStore((s) => s.widgets);
  const setWidgets = useBoardStore.setState;

  if (!isOpen) return null;

  const handleImport = () => {
    if (!markdown.trim()) return;

    const lines = markdown.split("\n");
    let y = (-viewport.y + 100) / viewport.zoom; // Start near top of visible area
    const startX = (-viewport.x + 100) / viewport.zoom;

    let currentContent = "";
    let currentType: "sticky" | "notepad" | "code" | null = null;
    let codeLanguage = "javascript";
    let inCodeBlock = false;

    const maxZ = widgets.reduce((max, w) => Math.max(max, w.zIndex), 0);
    const newWidgets: Widget[] = [];
    let zIndex = maxZ + 1;

    const createWidget = (type: string, content: string, x: number, y: number, extraProps: any = {}) => {
      const id = nanoid();
      const base = { id, x, y, zIndex: zIndex++, locked: false, createdAt: Date.now() };

      switch (type) {
        case "sticky":
          newWidgets.push({
            ...base,
            type: "sticky",
            width: 200,
            height: 150,
            content,
            color: STICKY_COLORS[0].value,
            markdown: false,
            ...extraProps,
          });
          break;
        case "notepad":
          newWidgets.push({
            ...base,
            type: "notepad",
            width: 320,
            height: 240,
            content,
            markdown: true,
          });
          break;
        case "codeSnippet":
          newWidgets.push({
            ...base,
            type: "codeSnippet",
            width: 300,
            height: 200,
            content,
            language: extraProps.language || "javascript",
          });
          break;
        case "taskList":
          newWidgets.push({
            ...base,
            type: "taskList",
            width: 250,
            height: 200,
            title: extraProps.title || "Tasks",
            items: extraProps.items || [],
          });
          break;
      }
    };

    const flushCurrent = () => {
      if (currentContent.trim()) {
        const x = startX;
        if (currentType === "code") {
          createWidget("codeSnippet", currentContent.trim(), x, y, { language: codeLanguage });
        } else if (currentType === "notepad") {
          createWidget("notepad", currentContent.trim(), x, y);
        } else if (currentType === "sticky") {
          createWidget("sticky", currentContent.trim(), x, y);
        }
        y += 180; // Space between widgets
        currentContent = "";
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          inCodeBlock = false;
          createWidget("codeSnippet", currentContent.trim(), startX, y, { language: codeLanguage });
          y += 200;
          currentContent = "";
        } else {
          // Start code block
          flushCurrent();
          inCodeBlock = true;
          currentType = "code";
          codeLanguage = line.slice(3).trim() || "javascript";
          currentContent = "";
        }
        continue;
      }

      if (inCodeBlock) {
        currentContent += line + "\n";
        continue;
      }

      // Task list item
      if (line.match(/^[-*]\s\[([ x])\]\s/)) {
        flushCurrent();
        // Collect all task items
        const items: { id: string; text: string; done: boolean }[] = [];
        while (i < lines.length && lines[i].match(/^[-*]\s\[([ x])\]\s/)) {
          const match = lines[i].match(/^[-*]\s\[([x ])\]\s(.+)$/);
          if (match) {
            items.push({
              id: nanoid(),
              text: match[2],
              done: match[1] === "x",
            });
          }
          i++;
        }
        i--; // Step back one since loop will increment
        createWidget("taskList", "", startX, y, { title: "Imported Tasks", items });
        y += 180;
        continue;
      }

      // Heading (make sticky note)
      if (line.startsWith("#")) {
        flushCurrent();
        const headingText = line.replace(/^#+\s*/, "");
        createWidget("sticky", headingText, startX, y, { markdown: false });
        y += 140;
        continue;
      }

      // Empty line - might be paragraph break
      if (!line.trim()) {
        if (currentContent.trim()) {
          flushCurrent();
          currentType = null;
        }
        continue;
      }

      // Regular content - accumulate into notepad
      if (!currentType) {
        currentType = "notepad";
      }
      currentContent += line + "\n";
    }

    // Flush any remaining content
    flushCurrent();

    // Add all new widgets to the board
    setWidgets({ widgets: [...widgets, ...newWidgets] });

    setMarkdown("");
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a1f26] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Import from Markdown
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Paste markdown text below. Headings become sticky notes, task lists become task widgets,
            code blocks become code snippets, and paragraphs become notepad widgets.
          </p>

          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# My Heading&#10;&#10;Some paragraph text.&#10;&#10;- [ ] Task 1&#10;- [x] Task 2&#10;&#10;```javascript&#10;const foo = 'bar';&#10;```"
            className="w-full h-64 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              resize-none outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
              font-mono text-sm"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-black/5 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!markdown.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
