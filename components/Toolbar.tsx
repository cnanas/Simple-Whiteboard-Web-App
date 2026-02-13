"use client";

import { useState, useRef, useEffect } from "react";
import { useBoardStore } from "@/store/boardStore";
import { ThemeToggle } from "./ThemeToggle";
import { WidgetPicker } from "./WidgetPicker";
import { exportToTxt, exportToPdf } from "@/lib/export";
import { AuthMenu } from "./AuthMenu";

export function Toolbar() {
  const [showPicker, setShowPicker] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const addWidget = useBoardStore((s) => s.addWidget);
  const widgets = useBoardStore((s) => s.widgets);
  const viewport = useBoardStore((s) => s.viewport);
  const setViewport = useBoardStore((s) => s.setViewport);
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    if (showExport) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExport]);

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2
      px-3 py-2 rounded-xl bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md
      border border-black/5 dark:border-white/10 shadow-lg">
      {/* Add widget button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium
            transition-colors duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>

        {showPicker && (
          <WidgetPicker
            onSelect={(type) => addWidget(type)}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={() => {
            const newZoom = Math.max(0.1, viewport.zoom - 0.1);
            setViewport({ zoom: newZoom });
          }}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150
            text-gray-600 dark:text-gray-400"
          title="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={() => setViewport({ zoom: 1, x: 0, y: 0 })}
          className="px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150
            text-xs font-mono text-gray-600 dark:text-gray-400 min-w-[3rem] text-center"
          title="Reset zoom"
        >
          {zoomPercent}%
        </button>
        <button
          onClick={() => {
            const newZoom = Math.min(3, viewport.zoom + 0.1);
            setViewport({ zoom: newZoom });
          }}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150
            text-gray-600 dark:text-gray-400"
          title="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Export */}
      <div className="relative" ref={exportRef}>
        <button
          onClick={() => setShowExport(!showExport)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
            text-gray-700 dark:text-gray-200 text-sm font-medium
            transition-colors duration-150"
          title="Export board"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
        {showExport && (
          <div className="absolute top-full left-0 mt-1 py-1 min-w-[140px] rounded-lg
            bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 shadow-lg z-[100]">
            <button
              onClick={() => {
                const date = new Date().toISOString().slice(0, 10);
                exportToTxt(widgets, `whiteboard-${date}.txt`);
                setShowExport(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-white/10 rounded-t-lg transition-colors"
            >
              Export as TXT
            </button>
            <button
              onClick={async () => {
                const date = new Date().toISOString().slice(0, 10);
                await exportToPdf(widgets, `whiteboard-${date}.pdf`);
                setShowExport(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-white/10 rounded-b-lg transition-colors"
            >
              Export as PDF
            </button>
          </div>
        )}
      </div>

      {/* List / Canvas toggle */}
      <button
        onClick={() => setViewMode(viewMode === "canvas" ? "list" : "canvas")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200 text-sm font-medium
          transition-colors duration-150"
        title={viewMode === "canvas" ? "Switch to list view" : "Switch to canvas"}
      >
        {viewMode === "canvas" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
            Canvas
          </>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

      {/* Sign in / Account & cloud */}
      <AuthMenu />

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  );
}
