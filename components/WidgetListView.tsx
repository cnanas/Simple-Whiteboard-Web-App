"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/boardStore";
import type { Widget } from "@/types";
import { getWidgetTypeLabel, getWidgetPreview, sortWidgetsByPosition } from "@/lib/widgetUtils";
import { BottomSheet } from "./BottomSheet";
import { WidgetRenderer } from "./WidgetRenderer";

const TYPE_ICONS: Record<Widget["type"], React.ReactNode> = {
  sticky: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" />
    </svg>
  ),
  notepad: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  taskList: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  sticker: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  linkCard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  focus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  codeSnippet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  dayPlanner: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

export function WidgetListView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const widgets = useBoardStore((s) => s.widgets);
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);
  const setViewport = useBoardStore((s) => s.setViewport);

  const sorted = sortWidgetsByPosition(widgets);
  const selectedWidget = selectedId ? widgets.find((w) => w.id === selectedId) : null;

  const openOnCanvas = () => {
    if (!selectedWidget) return;
    const zoom = 1;
    setViewport({
      x: window.innerWidth / 2 - (selectedWidget.x + selectedWidget.width / 2) * zoom,
      y: window.innerHeight / 2 - (selectedWidget.y + selectedWidget.height / 2) * zoom,
      zoom,
    });
    setSelectedId(null);
    setViewMode("canvas");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8fafc] dark:bg-[#0f1419]
      pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-black/5 dark:border-white/10 shrink-0
        pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Widgets</h1>
        <button
          onClick={() => setViewMode("canvas")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl
            bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium
            transition-colors duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 9l-5 5-4-4-3 3" />
          </svg>
          Canvas
        </button>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3
        pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
            No widgets yet. Add one from the canvas.
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((widget) => (
              <li key={widget.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(widget.id)}
                  className="w-full text-left rounded-xl p-4
                    bg-white dark:bg-[#1a1f26] border border-black/5 dark:border-white/10
                    shadow-sm hover:shadow-md transition-shadow duration-150
                    flex items-start gap-3"
                >
                  <span className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                    {TYPE_ICONS[widget.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {getWidgetTypeLabel(widget.type)}
                      </span>
                      {widget.locked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 line-clamp-2">
                      {widget.locked ? "••••••••" : getWidgetPreview(widget)}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Widget detail sheet */}
      <BottomSheet
        open={!!selectedWidget}
        onClose={() => setSelectedId(null)}
        showOnDesktop
      >
        {selectedWidget && (
          <>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {getWidgetTypeLabel(selectedWidget.type)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={openOnCanvas}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium
                    bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Show on canvas
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium
                    bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                    text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div
              className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#1e2328]"
              style={{
                width: selectedWidget.width,
                height: selectedWidget.height,
                minWidth: 200,
                minHeight: 120,
                maxWidth: "100%",
                maxHeight: "min(400px, 50vh)",
              }}
            >
              <WidgetRenderer widget={selectedWidget} standalone />
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
