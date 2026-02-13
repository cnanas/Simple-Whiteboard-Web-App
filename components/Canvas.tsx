"use client";

import { useRef, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import { useBoardStore } from "@/store/boardStore";
import { WidgetRenderer } from "./WidgetRenderer";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewport = useBoardStore((s) => s.viewport);
  const widgets = useBoardStore((s) => s.widgets);
  const setViewport = useBoardStore((s) => s.setViewport);

  const clampZoom = useCallback(
    (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)),
    []
  );

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        // Only pan if dragging the canvas background, not a widget
        if ((event.target as HTMLElement).closest("[data-widget]")) return;
        setViewport({
          x: viewport.x + dx,
          y: viewport.y + dy,
        });
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        const zoomFactor = dy > 0 ? 0.95 : 1.05;
        const newZoom = clampZoom(viewport.zoom * zoomFactor);

        // Zoom toward cursor position
        const rect = canvasRef.current!.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;

        const scale = newZoom / viewport.zoom;
        setViewport({
          zoom: newZoom,
          x: cursorX - scale * (cursorX - viewport.x),
          y: cursorY - scale * (cursorY - viewport.y),
        });
      },
      onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
        const newZoom = clampZoom(scale);

        const rect = canvasRef.current!.getBoundingClientRect();
        const cursorX = ox - rect.left;
        const cursorY = oy - rect.top;

        const s = newZoom / viewport.zoom;
        setViewport({
          zoom: newZoom,
          x: cursorX - s * (cursorX - viewport.x),
          y: cursorY - s * (cursorY - viewport.y),
        });
      },
    },
    {
      target: canvasRef,
      drag: {
        filterTaps: true,
      },
      wheel: {
        eventOptions: { passive: false },
      },
      pinch: {
        scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM },
      },
    }
  );

  return (
    <div
      ref={canvasRef}
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
        {widgets.filter(Boolean).map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
      </div>
    </div>
  );
}
