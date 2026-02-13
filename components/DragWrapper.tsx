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
}

export function DragWrapper({ widget, children, onTap }: DragWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const updateWidget = useBoardStore((s) => s.updateWidget);
  const deleteWidget = useBoardStore((s) => s.deleteWidget);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const lockWidget = useBoardStore((s) => s.lockWidget);
  const zoom = useBoardStore((s) => s.viewport.zoom);

  useGesture(
    {
      onDragStart: () => {
        isDragging.current = false;
        bringToFront(widget.id);
      },
      onDrag: ({ delta: [dx, dy], tap }) => {
        if (tap) return;
        isDragging.current = true;
        updateWidget(widget.id, {
          x: widget.x + dx / zoom,
          y: widget.y + dy / zoom,
        });
      },
      onDragEnd: ({ tap }) => {
        if (tap && !isDragging.current && onTap && !widget.locked) {
          onTap();
        }
        isDragging.current = false;
      },
    },
    {
      target: wrapperRef,
      drag: { filterTaps: true },
    }
  );

  return (
    <div
      ref={wrapperRef}
      data-widget
      className="absolute group touch-none select-none"
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: widget.zIndex,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}

      {/* Locked overlay */}
      {widget.locked && <LockedOverlay widgetId={widget.id} />}

      {/* Action buttons */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
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
          onClick={(e) => {
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
