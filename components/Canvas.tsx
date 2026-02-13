"use client";

import { useRef, useCallback, useMemo } from "react";
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
  const setViewportThrottled = useThrottledViewport();

  const clampZoom = useCallback(
    (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)),
    []
  );

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        if ((event.target as HTMLElement).closest("[data-widget]")) return;
        const v = viewportRef.current;
        setViewportThrottled({ x: v.x + dx, y: v.y + dy });
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
    () => widgets.filter(Boolean).map((widget) => <WidgetRenderer key={widget.id} widget={widget} />),
    [widgets]
  );

  return (
    <div
      ref={canvasRef}
      data-tour="canvas"
      className="fixed inset-0 overflow-hidden cursor-grab active:cursor-grabbing touch-none
        bg-[#f8fafc] dark:bg-[#0f1419]"
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
    </div>
  );
}
