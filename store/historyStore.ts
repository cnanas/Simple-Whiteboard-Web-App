import { create } from "zustand";
import type { Widget, Viewport } from "@/types";

interface HistoryEntry {
  widgets: Widget[];
  viewport: Viewport;
  timestamp: number;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistorySize: number;

  pushHistory: (widgets: Widget[], viewport: Viewport) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistorySize: MAX_HISTORY_SIZE,

  pushHistory: (widgets, viewport) => {
    const { past, maxHistorySize } = get();
    const entry: HistoryEntry = {
      widgets: JSON.parse(JSON.stringify(widgets)), // Deep clone
      viewport: { ...viewport },
      timestamp: Date.now(),
    };

    const newPast = [...past, entry];

    // Limit history size
    if (newPast.length > maxHistorySize) {
      newPast.shift();
    }

    set({ past: newPast, future: [] }); // Clear future on new action
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const newPast = [...past];
    const current = newPast.pop()!;
    const newFuture = [current, ...future];

    set({ past: newPast, future: newFuture });
    return newPast[newPast.length - 1] || null;
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const newFuture = [...future];
    const next = newFuture.shift()!;
    const newPast = [...past, next];

    set({ past: newPast, future: newFuture });
    return next;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}));
