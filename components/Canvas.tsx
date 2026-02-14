"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { useGesture } from "@use-gesture/react";
import { useBoardStore } from "@/store/boardStore";
import { WidgetRenderer } from "./WidgetRenderer";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

/** Throttle viewport updates to once per animation frame to reduce re-renders during pan/zoom */
function useThrottledViewport() {
  const setViewport = useBoardStore((s) => s.setViewport);
  const viewportRef = useRef(useBoardStore.getState().viewport);
  const rafId = useRef<number | null>(null);
  const pending = useRef<Partial<{ x: number; y: number; zoom: number }>>({});

  viewportRef.current = useBoardStore((s) => s.viewport);

  return useCallback((update: Partial<{ x: number; y: number; zoom: number }>) => {
    pending.current = { ...pending.current, ...update };
    const apply = () => {
      rafId.current = null;
      const next = { ...viewportRef.current, ...pending.current };
      pending.current = {};
      setViewport(next);
    };
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(apply);
    }
  }, [setViewport]);
}

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewport = useBoardStore((s) => s.viewport);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const widgets = useBoardStore((s) => s.widgets);
  const selectedWidgets = useBoardStore((s) => s.selectedWidgets);
  const setSelectedWidgets = useBoardStore((s) => s.setSelectedWidgets);
  const setViewportThrottled = useThrottledViewport();
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const clampZoom = useCallback(
    (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)),
    []
  );

  // Track space key for pan mode and escape to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.code === "Space" && !isSpacePressed && !isTyping) {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      // Clear selection with Escape
      if (e.code === "Escape" && selectedWidgets.size > 0) {
        setSelectedWidgets(new Set());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpacePressed, selectedWidgets]);

  useGesture(
    {
      onDragStart: ({ event }) => {
        const target = event.target as HTMLElement;
        const isWidget = target.closest("[data-widget]") || target.closest("[data-widget-actions]");

        if (isWidget) return;

        // Space key = pan mode
        if (isSpacePressed) {
          setIsDraggingCanvas(true);
          return;
        }

        // Otherwise = selection box mode
        const rect = canvasRef.current!.getBoundingClientRect();
        const startX = ((event as PointerEvent).clientX - rect.left - viewport.x) / viewport.zoom;
        const startY = ((event as PointerEvent).clientY - rect.top - viewport.y) / viewport.zoom;

        setSelectionBox({
          startX,
          startY,
          endX: startX,
          endY: startY,
        });
      },
      onDrag: ({ delta: [dx, dy], event }) => {
        const target = event.target as HTMLElement;
        const isWidget = target.closest("[data-widget]") || target.closest("[data-widget-actions]");

        if (isWidget) return;

        // Pan canvas if space is pressed
        if (isSpacePressed) {
          const v = viewportRef.current;
          setViewportThrottled({ x: v.x + dx, y: v.y + dy });
          return;
        }

        // Update selection box
        if (selectionBox) {
          const rect = canvasRef.current!.getBoundingClientRect();
          const endX = ((event as PointerEvent).clientX - rect.left - viewport.x) / viewport.zoom;
          const endY = ((event as PointerEvent).clientY - rect.top - viewport.y) / viewport.zoom;

          setSelectionBox({
            ...selectionBox,
            endX,
            endY,
          });

          // Calculate which widgets are in the selection box
          const minX = Math.min(selectionBox.startX, endX);
          const maxX = Math.max(selectionBox.startX, endX);
          const minY = Math.min(selectionBox.startY, endY);
          const maxY = Math.max(selectionBox.startY, endY);

          const selected = new Set<string>();
          widgets.forEach((widget) => {
            const widgetRight = widget.x + widget.width;
            const widgetBottom = widget.y + widget.height;

            // Check if widget intersects with selection box
            if (
              widget.x < maxX &&
              widgetRight > minX &&
              widget.y < maxY &&
              widgetBottom > minY
            ) {
              selected.add(widget.id);
            }
          });

          setSelectedWidgets(selected);
        }
      },
      onDragEnd: ({ event, tap }) => {
        setIsDraggingCanvas(false);

        // If it was just a tap (not a drag), clear selection
        if (tap) {
          setSelectedWidgets(new Set());
        }

        // Hide selection box but keep selected widgets
        setSelectionBox(null);
      },
      onWheel: ({ delta: [dx, dy], event }) => {
        event.preventDefault();
        const v = viewportRef.current;
        if (event.ctrlKey || event.metaKey) {
          const zoomFactor = dy > 0 ? 0.95 : 1.05;
          const newZoom = clampZoom(v.zoom * zoomFactor);
          const rect = canvasRef.current!.getBoundingClientRect();
          const cursorX = event.clientX - rect.left;
          const cursorY = event.clientY - rect.top;
          const scale = newZoom / v.zoom;
          setViewportThrottled({
            zoom: newZoom,
            x: cursorX - scale * (cursorX - v.x),
            y: cursorY - scale * (cursorY - v.y),
          });
        } else {
          setViewportThrottled({ x: v.x - dx, y: v.y - dy });
        }
      },
      onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
        const v = viewportRef.current;
        const newZoom = clampZoom(scale);
        const rect = canvasRef.current!.getBoundingClientRect();
        const cursorX = ox - rect.left;
        const cursorY = oy - rect.top;
        const s = newZoom / v.zoom;
        setViewportThrottled({
          zoom: newZoom,
          x: cursorX - s * (cursorX - v.x),
          y: cursorY - s * (cursorY - v.y),
        });
      },
    },
    {
      target: canvasRef,
      drag: { filterTaps: true },
      wheel: { eventOptions: { passive: false } },
      pinch: { scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM } },
    }
  );

  const widgetList = useMemo(
    () => widgets.filter(Boolean).map((widget) => (
      <WidgetRenderer
        key={widget.id}
        widget={widget}
        isSelected={selectedWidgets.has(widget.id)}
      />
    )),
    [widgets, selectedWidgets]
  );

  const getCursorClass = () => {
    if (isDraggingCanvas) return "cursor-grabbing";
    if (isSpacePressed) return "cursor-grab";
    if (selectionBox) return "cursor-crosshair";
    return "cursor-default";
  };

  return (
    <div
      ref={canvasRef}
      data-tour="canvas"
      className={`fixed inset-0 overflow-hidden touch-none bg-[#f8fafc] dark:bg-[#0f1419] ${getCursorClass()}`}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--dot-color) 1px, transparent 1px)`,
          backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {/* Transform layer for widgets */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {widgetList}
      </div>

      {/* Selection box overlay */}
      {selectionBox && (
        <div
          className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/10"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX) * viewport.zoom + viewport.x,
            top: Math.min(selectionBox.startY, selectionBox.endY) * viewport.zoom + viewport.y,
            width: Math.abs(selectionBox.endX - selectionBox.startX) * viewport.zoom,
            height: Math.abs(selectionBox.endY - selectionBox.startY) * viewport.zoom,
          }}
        />
      )}

      {/* Space key hint */}
      {isSpacePressed && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-sm rounded-lg pointer-events-none z-50">
          Pan mode - Drag to move canvas
        </div>
      )}

      {/* Selection count */}
      {selectedWidgets.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span className="font-medium">{selectedWidgets.size} widget{selectedWidgets.size !== 1 ? 's' : ''} selected</span>
          <button
            onClick={() => setSelectedWidgets(new Set())}
            className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs"
          >
            Clear (Esc)
          </button>
        </div>
      )}
    </div>
  );
}
