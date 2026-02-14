"use client";

import { useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore";
import { useHistoryStore } from "@/store/historyStore";

interface UseKeyboardShortcutsOptions {
  onCommandPalette?: () => void;
  onSearch?: () => void;
  selectedWidgetId?: string | null;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onCommandPalette, onSearch, selectedWidgetId } = options;
  const addWidget = useBoardStore((s) => s.addWidget);
  const deleteWidget = useBoardStore((s) => s.deleteWidget);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.canUndo());
  const canRedo = useHistoryStore((s) => s.canRedo());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Command Palette: Cmd/Ctrl + K
      if (cmdOrCtrl && e.key === "k") {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      // Search: Cmd/Ctrl + F
      if (cmdOrCtrl && e.key === "f") {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if ((cmdOrCtrl && e.shiftKey && e.key === "z" && canRedo) || (cmdOrCtrl && e.key === "y" && canRedo)) {
        e.preventDefault();
        redo();
        return;
      }

      // Don't allow widget shortcuts when typing
      if (isInput) return;

      // New Sticky Note: N
      if (e.key === "n" && !cmdOrCtrl && !e.shiftKey) {
        e.preventDefault();
        addWidget("sticky");
        return;
      }

      // New Notepad: Shift + N
      if (e.key === "N" && e.shiftKey && !cmdOrCtrl) {
        e.preventDefault();
        addWidget("notepad");
        return;
      }

      // New Task List: T
      if (e.key === "t" && !cmdOrCtrl && !e.shiftKey) {
        e.preventDefault();
        addWidget("taskList");
        return;
      }

      // Delete selected widget: Delete or Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedWidgetId) {
        e.preventDefault();
        deleteWidget(selectedWidgetId);
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && e.key === "d" && selectedWidgetId) {
        e.preventDefault();
        // TODO: Implement duplicate functionality
        return;
      }
    },
    [
      addWidget,
      deleteWidget,
      undo,
      redo,
      canUndo,
      canRedo,
      selectedWidgetId,
      onCommandPalette,
      onSearch,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { canUndo, canRedo };
}
