"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardStore } from "@/store/boardStore";
import type { WidgetType } from "@/types";
import { WidgetPicker, WIDGET_OPTIONS } from "./WidgetPicker";
import { ThemeToggle } from "./ThemeToggle";
import { AuthMenu } from "./AuthMenu";
import { exportToTxt, exportToPdf } from "@/lib/export";
import { ChangelogModal } from "./ChangelogModal";

const LONG_PRESS_MS = 600;

function getOption(type: WidgetType) {
  return WIDGET_OPTIONS.find((o) => o.type === type);
}

function DragHandle() {
  return (
    <span className="flex flex-col gap-0.5 text-gray-400 dark:text-gray-500 shrink-0 touch-none" aria-hidden>
      <span className="w-1 h-1 rounded-full bg-current" />
      <span className="w-1 h-1 rounded-full bg-current" />
      <span className="w-1 h-1 rounded-full bg-current" />
    </span>
  );
}

function SortableQuickAction({ type }: { type: WidgetType }) {
  const opt = getOption(type);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!opt) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1.5 rounded-xl touch-none
        py-2.5 sm:py-3 px-2 sm:px-2.5
        text-gray-500 dark:text-gray-400 [&_svg]:w-5 [&_svg]:h-5
        ${isDragging ? "opacity-40" : "hover:bg-gray-100 dark:hover:bg-white/10"}`}
    >
      <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex items-center shrink-0">
        <DragHandle />
      </span>
      <span className="flex items-center justify-center pointer-events-none shrink-0">{opt.icon}</span>
    </div>
  );
}

function DraggingItem({ type }: { type: WidgetType }) {
  const opt = getOption(type);
  if (!opt) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-xl shadow-lg bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 [&_svg]:w-5 [&_svg]:h-5 cursor-grabbing py-2.5 sm:py-3 px-2 sm:px-2.5">
      <DragHandle />
      <span className="flex items-center justify-center">{opt.icon}</span>
    </div>
  );
}

export function BottomBar() {
  const [showPicker, setShowPicker] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeId, setActiveId] = useState<WidgetType | null>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const quickActions = useBoardStore((s) => s.quickActions);
  const setQuickActions = useBoardStore((s) => s.setQuickActions);
  const addWidget = useBoardStore((s) => s.addWidget);
  const widgets = useBoardStore((s) => s.widgets);
  const viewMode = useBoardStore((s) => s.viewMode);
  const setViewMode = useBoardStore((s) => s.setViewMode);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as WidgetType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = quickActions.indexOf(active.id as WidgetType);
    const newIndex = quickActions.indexOf(over.id as WidgetType);
    if (oldIndex === -1 || newIndex === -1) return;
    setQuickActions(arrayMove(quickActions, oldIndex, newIndex));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customizeRef.current && !customizeRef.current.contains(e.target as Node)) {
        setShowCustomize(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
        setShowExport(false);
      }
    };
    if (showCustomize || showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCustomize, showSettings]);

  const toggleInQuickActions = (type: WidgetType) => {
    if (quickActions.includes(type)) {
      setQuickActions(quickActions.filter((t) => t !== type));
    } else {
      setQuickActions([...quickActions, type]);
    }
  };

  const startLongPressForReorder = () => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setReorderMode(true);
      setShowCustomize(false);
      setShowSettings(false);
      longPressTimer.current = null;
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleQuickActionPointerUp = (type: WidgetType) => {
    cancelLongPress();
    if (!longPressTriggered.current) addWidget(type);
  };

  const handleGearPointerUp = () => {
    cancelLongPress();
    if (!longPressTriggered.current) {
      setShowCustomize((v) => !v);
    }
  };

  const iconBtn =
    "p-2.5 sm:p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150";

  const barClasses =
    "fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-1 " +
    "px-3 py-2.5 rounded-full bg-white dark:bg-[#1a1f26] shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] " +
    "border border-black/[0.06] dark:border-white/10 min-w-0";

  if (reorderMode) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden lg:flex flex-col items-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={barClasses} data-tour="quick-actions">
            <SortableContext items={quickActions} strategy={horizontalListSortingStrategy}>
              {quickActions.map((type) => (
                <SortableQuickAction key={type} type={type} />
              ))}
            </SortableContext>
            <div className="w-px h-6 mx-0.5 bg-gray-200/80 dark:bg-white/10 rounded-full flex-shrink-0" />
            <button
              onClick={() => setReorderMode(false)}
              className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </button>
          </div>
          <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeId ? <DraggingItem type={activeId} /> : null}
          </DragOverlay>
        </DndContext>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Drag to reorder • Tap Done when finished
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={barClasses} data-tour="quick-actions">
        {quickActions.map((type) => {
          const opt = getOption(type);
          if (!opt) return null;
          return (
            <button
              key={type}
              onPointerDown={startLongPressForReorder}
              onPointerUp={() => handleQuickActionPointerUp(type)}
              onPointerLeave={cancelLongPress}
              onContextMenu={(e) => e.preventDefault()}
              className={`${iconBtn} flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5`}
              title={`${opt.label} • Hold to reorder bar`}
            >
              {opt.icon}
            </button>
          );
        })}
        <div className="relative" ref={customizeRef} data-tour="customize">
          <button
            onPointerDown={startLongPressForReorder}
            onPointerUp={handleGearPointerUp}
            onPointerLeave={cancelLongPress}
            onContextMenu={(e) => e.preventDefault()}
            className={`${iconBtn} flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5`}
            title="Hold to reorder • Tap to edit quick actions"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {showCustomize && (
            <div className="absolute bottom-full left-0 mb-1 py-2 px-2 min-w-[200px] rounded-xl
              bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 shadow-lg z-[100]">
              <button
                type="button"
                onClick={() => { setShowPicker(true); setShowCustomize(false); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 text-left"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                More widgets…
              </button>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 pt-1 pb-2 border-t border-black/5 dark:border-white/10 mt-1">
                Add to bar
              </p>
              {WIDGET_OPTIONS.map((opt) => (
                <label
                  key={opt.type}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={quickActions.includes(opt.type)}
                    onChange={() => toggleInQuickActions(opt.type)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-600 dark:text-gray-300">{opt.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-5 mx-1 bg-gray-200/80 dark:bg-white/10 rounded-full flex-shrink-0" aria-hidden />
        <div className="relative" ref={settingsRef} data-tour="settings">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`${iconBtn} flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 ${showSettings ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200" : ""}`}
            title="Settings & account"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>
          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 flex items-center gap-1 px-3 py-2.5 rounded-full
              bg-white dark:bg-[#1a1f26] shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
              border border-black/[0.06] dark:border-white/10 min-w-[280px] sm:min-w-[320px]">
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setShowExport((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                    bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                    text-gray-700 dark:text-gray-200 transition-colors"
                  title="Export"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="hidden sm:inline">Export</span>
                </button>
                {showExport && (
                  <div className="absolute bottom-full left-0 mb-1 py-1 min-w-[140px] rounded-xl
                    bg-white dark:bg-[#1a1f26] border border-black/10 dark:border-white/10 shadow-lg z-[100]">
                    <button
                      onClick={() => {
                        exportToTxt(widgets, `whiteboard-${new Date().toISOString().slice(0, 10)}.txt`);
                        setShowExport(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-t-xl"
                    >
                      Export as TXT
                    </button>
                    <button
                      onClick={async () => {
                        await exportToPdf(widgets, `whiteboard-${new Date().toISOString().slice(0, 10)}.pdf`);
                        setShowExport(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-b-xl"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
              <div className="w-px h-5 bg-gray-200/80 dark:bg-white/10 rounded-full" />
              <button
                onClick={() => setViewMode(viewMode === "canvas" ? "list" : "canvas")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-200 transition-colors"
                title={viewMode === "canvas" ? "List view" : "Canvas view"}
              >
                {viewMode === "canvas" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M18 9l-5 5-4-4-3 3" />
                  </svg>
                )}
                <span className="hidden sm:inline">{viewMode === "canvas" ? "List" : "Canvas"}</span>
              </button>
              <div className="w-px h-5 bg-gray-200/80 dark:bg-white/10 rounded-full" />
              <div className="[&_button]:!bg-gray-100 dark:[&_button]:!bg-gray-700 [&_button]:!rounded-xl [&_button]:hover:!bg-gray-200 dark:[&_button]:hover:!bg-gray-600 [&_button]:!px-3 [&_button]:!py-2 [&_button]:!text-sm [&_button]:!whitespace-nowrap [&_button]:!shrink-0">
                <AuthMenu />
              </div>
              <div className="w-px h-5 bg-gray-200/80 dark:bg-white/10 rounded-full" />
              <div className="[&_button]:!p-2 [&_button]:!rounded-xl">
                <ThemeToggle />
              </div>
              <div className="w-px h-5 bg-gray-200/80 dark:bg-white/10 rounded-full" />
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setShowChangelog(true);
                }}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2 px-1"
              >
                Changelog
              </button>
            </div>
          )}
        </div>
      </div>

      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}

      {showPicker && (
        <WidgetPicker
          onSelect={(type) => {
            addWidget(type);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
