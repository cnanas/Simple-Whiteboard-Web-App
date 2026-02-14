"use client";

import { createPortal } from "react-dom";
import { useBoardStore } from "@/store/boardStore";

interface AlignmentToolsProps {
  selectedWidgets: Set<string>;
}

export function AlignmentTools({ selectedWidgets }: AlignmentToolsProps) {
  const widgets = useBoardStore((s) => s.widgets);
  const moveWidgets = useBoardStore((s) => s.moveWidgets);

  if (selectedWidgets.size < 2) return null;

  const selectedItems = widgets.filter((w) => selectedWidgets.has(w.id));

  const alignLeft = () => {
    const minX = Math.min(...selectedItems.map((w) => w.x));
    const moves: Record<string, { x: number; y: number }> = {};
    selectedItems.forEach((w) => { moves[w.id] = { x: minX, y: w.y }; });
    moveWidgets(moves);
  };

  const alignRight = () => {
    const maxX = Math.max(...selectedItems.map((w) => w.x + w.width));
    const moves: Record<string, { x: number; y: number }> = {};
    selectedItems.forEach((w) => { moves[w.id] = { x: maxX - w.width, y: w.y }; });
    moveWidgets(moves);
  };

  const alignTop = () => {
    const minY = Math.min(...selectedItems.map((w) => w.y));
    const moves: Record<string, { x: number; y: number }> = {};
    selectedItems.forEach((w) => { moves[w.id] = { x: w.x, y: minY }; });
    moveWidgets(moves);
  };

  const alignBottom = () => {
    const maxY = Math.max(...selectedItems.map((w) => w.y + w.height));
    const moves: Record<string, { x: number; y: number }> = {};
    selectedItems.forEach((w) => { moves[w.id] = { x: w.x, y: maxY - w.height }; });
    moveWidgets(moves);
  };

  const alignCenterH = () => {
    const avgY = selectedItems.reduce((sum, w) => sum + w.y + w.height / 2, 0) / selectedItems.length;
    const moves: Record<string, { x: number; y: number }> = {};
    selectedItems.forEach((w) => { moves[w.id] = { x: w.x, y: avgY - w.height / 2 }; });
    moveWidgets(moves);
  };

  const alignCenterV = () => {
    const avgX = selectedItems.reduce((sum, w) => sum + w.x + w.width / 2, 0) / selectedItems.length;
    const moves: Record<string, { x: number; y: number }> = {};
    selectedItems.forEach((w) => { moves[w.id] = { x: avgX - w.width / 2, y: w.y }; });
    moveWidgets(moves);
  };

  const distributeH = () => {
    if (selectedItems.length < 3) return;
    const sorted = [...selectedItems].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
    const totalGap = maxX - minX - sorted.reduce((sum, w) => sum + w.width, 0);
    const gap = totalGap / (sorted.length - 1);
    const moves: Record<string, { x: number; y: number }> = {};
    let currentX = minX;
    sorted.forEach((w) => {
      moves[w.id] = { x: currentX, y: w.y };
      currentX += w.width + gap;
    });
    moveWidgets(moves);
  };

  const distributeV = () => {
    if (selectedItems.length < 3) return;
    const sorted = [...selectedItems].sort((a, b) => a.y - b.y);
    const minY = sorted[0].y;
    const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
    const totalGap = maxY - minY - sorted.reduce((sum, w) => sum + w.height, 0);
    const gap = totalGap / (sorted.length - 1);
    const moves: Record<string, { x: number; y: number }> = {};
    let currentY = minY;
    sorted.forEach((w) => {
      moves[w.id] = { x: w.x, y: currentY };
      currentY += w.height + gap;
    });
    moveWidgets(moves);
  };

  const toolbar = (
    <div
      role="toolbar"
      aria-label="Alignment and distribution"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1
        px-3 py-2 rounded-xl bg-white/95 dark:bg-[#1a1f26]/95 backdrop-blur-md
        shadow-lg border border-black/5 dark:border-white/10"
    >
      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
        {selectedWidgets.size} selected
      </span>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      {/* Align buttons */}
      <div className="flex items-center gap-0.5 px-2">
        <button
          onClick={alignLeft}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Align left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="17" y2="12" />
            <line x1="3" y1="18" x2="19" y2="18" />
          </svg>
        </button>
        <button
          onClick={alignCenterV}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Align center horizontally"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.5" strokeDasharray="2 2" />
            <rect x="5" y="8" width="6" height="3" />
            <rect x="13" y="13" width="6" height="3" />
          </svg>
        </button>
        <button
          onClick={alignRight}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Align right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="7" y1="12" x2="21" y2="12" />
            <line x1="5" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          onClick={alignTop}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Align top"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="3" x2="6" y2="21" />
            <line x1="12" y1="3" x2="12" y2="17" />
            <line x1="18" y1="3" x2="18" y2="19" />
          </svg>
        </button>
        <button
          onClick={alignCenterH}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Align center vertically"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.5" strokeDasharray="2 2" />
            <rect x="8" y="5" width="3" height="6" />
            <rect x="13" y="13" width="3" height="6" />
          </svg>
        </button>
        <button
          onClick={alignBottom}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Align bottom"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="3" x2="6" y2="21" />
            <line x1="12" y1="7" x2="12" y2="21" />
            <line x1="18" y1="5" x2="18" y2="21" />
          </svg>
        </button>
      </div>

      {selectedItems.length >= 3 && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          {/* Distribute buttons */}
          <div className="flex items-center gap-0.5 px-2">
            <button
              onClick={distributeH}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Distribute horizontally"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="4" height="8" />
                <rect x="10" y="8" width="4" height="8" />
                <rect x="17" y="8" width="4" height="8" />
              </svg>
            </button>
            <button
              onClick={distributeV}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Distribute vertically"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="3" width="8" height="4" />
                <rect x="8" y="10" width="8" height="4" />
                <rect x="8" y="17" width="8" height="4" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(toolbar, document.body)
    : toolbar;
}
