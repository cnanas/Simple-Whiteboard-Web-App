"use client";

import { useState, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGesture } from "@use-gesture/react";
import { useBoardStore } from "@/store/boardStore";
import type { Widget } from "@/types";
import { LockedOverlay } from "./LockedOverlay";
import { PasswordModal } from "./PasswordModal";

interface DragWrapperProps {
  widget: Widget;
  children: ReactNode;
  onTap?: () => void;
  isSelected?: boolean;
}

export function DragWrapper({ widget, children, onTap, isSelected }: DragWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const moveBtnRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const initialPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [showLockModal, setShowLockModal] = useState(false);

  const updateWidget = useBoardStore((s) => s.updateWidget);
  const moveWidgets = useBoardStore((s) => s.moveWidgets);
  const deleteWidget = useBoardStore((s) => s.deleteWidget);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const lockWidget = useBoardStore((s) => s.lockWidget);
  const saveHistory = useBoardStore((s) => s.saveHistory);
  const viewport = useBoardStore((s) => s.viewport);
  const selectedWidgets = useBoardStore((s) => s.selectedWidgets);
  const focusedWidgetId = useBoardStore((s) => s.focusedWidgetId);
  const isFocused = focusedWidgetId === widget.id;

  const startDrag = () => {
    isDragging.current = false;
    hasMoved.current = false;
    const positions = new Map<string, { x: number; y: number }>();
    if (isSelected && selectedWidgets.size > 1) {
      const allWidgets = useBoardStore.getState().widgets;
      for (const w of allWidgets) {
        if (selectedWidgets.has(w.id)) {
          positions.set(w.id, { x: w.x, y: w.y });
        }
      }
    } else {
      positions.set(widget.id, { x: widget.x, y: widget.y });
    }
    initialPositions.current = positions;
    bringToFront(widget.id);
  };

  const doDrag = (mx: number, my: number) => {
    if (!hasMoved.current) {
      saveHistory();
      hasMoved.current = true;
    }
    isDragging.current = true;
    const dx = mx / viewport.zoom;
    const dy = my / viewport.zoom;
    if (initialPositions.current.size > 1) {
      const moves: Record<string, { x: number; y: number }> = {};
      for (const [id, pos] of initialPositions.current) {
        moves[id] = { x: pos.x + dx, y: pos.y + dy };
      }
      moveWidgets(moves, true);
    } else {
      const pos = initialPositions.current.get(widget.id)!;
      updateWidget(widget.id, { x: pos.x + dx, y: pos.y + dy }, true);
    }
  };

  const endDrag = (tap: boolean) => {
    if (tap && !isDragging.current && onTap && !widget.locked) {
      onTap();
    }
    isDragging.current = false;
    hasMoved.current = false;
  };

  const dragHandlers = {
    onDragStart: startDrag,
    onDrag: ({ movement: [mx, my], tap }: { movement: [number, number]; tap: boolean }) => {
      if (tap) return;
      doDrag(mx, my);
    },
    onDragEnd: ({ tap }: { tap: boolean }) => endDrag(tap),
  };

  // Drag only from the move circle button (keeps right-click free for copy/paste)
  useGesture(
    { ...dragHandlers },
    {
      target: moveBtnRef,
      drag: { filterTaps: true },
    }
  );

  return (
    <div
      ref={wrapperRef}
      data-widget
      className={`absolute group hover:shadow-lg transition-shadow ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2 shadow-xl" : ""
      } ${isFocused ? "widget-focused" : ""}`}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: widget.zIndex,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="w-full h-full min-h-0 overflow-hidden select-text"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isInteractive = target.closest("button, a, input, textarea, select, [contenteditable]");
          const hasSelection = typeof window !== "undefined" && (window.getSelection()?.toString() ?? "").length > 0;
          if (!widget.locked && onTap && !isInteractive && !hasSelection) {
            onTap();
          }
        }}
      >
        {children}
      </div>

      {/* Locked overlay */}
      {widget.locked && <LockedOverlay widgetId={widget.id} />}

      {/* Action buttons: Move, Lock, Delete */}
      <div
        data-widget-actions
        className="absolute -top-2 -right-2 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity duration-150 z-10 pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Move button — drag from here or hold right-click anywhere on widget */}
        <button
          ref={moveBtnRef}
          type="button"
          data-widget-move-btn
          className="w-6 h-6 rounded-full cursor-move touch-none
            bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10
            shadow-sm flex items-center justify-center
            text-black/40 dark:text-white/40 hover:text-gray-600 dark:hover:text-gray-300"
          title="Drag to move"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {/* Lock button (only when unlocked) */}
        {!widget.locked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLockModal(true);
            }}
            className="w-6 h-6 rounded-full
              bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10
              shadow-sm flex items-center justify-center
              text-black/40 dark:text-white/40 hover:text-blue-500 dark:hover:text-blue-400"
            title="Lock"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        )}

        {/* Delete button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteWidget(widget.id);
          }}
          className="w-6 h-6 rounded-full
            bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10
            shadow-sm flex items-center justify-center
            text-black/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400"
          title="Delete"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Lock password modal — portaled to body to escape canvas transform */}
      {showLockModal && createPortal(
        <PasswordModal
          mode="lock"
          onSubmit={async (password) => {
            await lockWidget(widget.id, password);
            setShowLockModal(false);
          }}
          onClose={() => setShowLockModal(false)}
        />,
        document.body
      )}
    </div>
  );
}
