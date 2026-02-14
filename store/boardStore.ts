import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Widget, WidgetType, Viewport } from "@/types";
const DEFAULT_QUICK_ACTIONS: WidgetType[] = ["sticky", "notepad", "taskList", "calendar", "linkCard", "dayPlanner"];
import { STICKY_COLORS, WIDGET_BASE_KEYS } from "@/types";
import { encrypt, decrypt } from "@/lib/crypto";
import { createDebouncedStorage } from "@/lib/debouncedStorage";
import { useHistoryStore } from "./historyStore";

export type ViewMode = "canvas" | "list";

interface BoardState {
  widgets: Widget[];
  viewport: Viewport;
  viewMode: ViewMode;
  quickActions: WidgetType[];
  selectedWidgets: Set<string>;
  focusedWidgetId: string | null;

  addWidget: (type: WidgetType) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateWidget: (id: string, updates: Record<string, any>, skipHistory?: boolean) => void;
  moveWidgets: (moves: Record<string, { x: number; y: number }>, skipHistory?: boolean) => void;
  deleteWidget: (id: string) => void;
  bringToFront: (id: string) => void;
  setViewport: (viewport: Partial<Viewport>) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedWidgets: (ids: Set<string>) => void;
  setQuickActions: (actions: WidgetType[]) => void;
  loadBoard: (widgets: Widget[], viewport: Viewport) => void;
  lockWidget: (id: string, password: string) => Promise<void>;
  unlockWidget: (id: string, password: string) => Promise<boolean>;
  focusWidget: (id: string) => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

function getCenter(viewport: Viewport, offsetX = 0, offsetY = 0) {
  const x = (-viewport.x + window.innerWidth / 2) / viewport.zoom - offsetX;
  const y = (-viewport.y + window.innerHeight / 2) / viewport.zoom - offsetY;
  return { x, y };
}

/** Extract content fields (everything except base widget fields) */
function getContentFields(widget: Widget): Record<string, unknown> {
  const content: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(widget)) {
    if (!WIDGET_BASE_KEYS.has(key)) {
      content[key] = value;
    }
  }
  return content;
}

/** Get default (empty) content fields for a given widget type */
function getDefaultContent(type: WidgetType): Record<string, unknown> {
  switch (type) {
    case "sticky": return { content: "", color: "#e5e7eb" };
    case "notepad": return { content: "" };
    case "taskList": return { title: "", items: [] };
    case "sticker": return { emoji: "" };
    case "calendar": return { month: 0, year: 2000 };
    case "linkCard": return { title: "", url: "" };
    case "focus": return { title: "Today", items: [] };
    case "codeSnippet": return { language: "text", content: "" };
    case "dayPlanner": {
      const d = new Date();
      const start = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      return { startDate: start, numDays: 5, tasksByDate: {} };
    }
  }
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      viewMode: "canvas",
      quickActions: DEFAULT_QUICK_ACTIONS,
      selectedWidgets: new Set<string>(),
      focusedWidgetId: null,

      addWidget: (type: WidgetType) => {
        // Save history before adding
        get().saveHistory();

        const { viewport, widgets } = get();
        const maxZ = widgets.reduce((max, w) => Math.max(max, w.zIndex), 0);
        const id = nanoid();

        let widget: Widget;

        switch (type) {
          case "sticky": {
            const { x, y } = getCenter(viewport, 100, 75);
            widget = {
              id, type: "sticky", x, y,
              width: 200, height: 150, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              content: "",
              color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)].value,
            };
            break;
          }
          case "notepad": {
            const { x, y } = getCenter(viewport, 160, 120);
            widget = {
              id, type: "notepad", x, y,
              width: 320, height: 240, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              content: "",
            };
            break;
          }
          case "taskList": {
            const { x, y } = getCenter(viewport, 125, 100);
            widget = {
              id, type: "taskList", x, y,
              width: 250, height: 200, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              title: "Tasks",
              items: [],
            };
            break;
          }
          case "sticker": {
            const { x, y } = getCenter(viewport, 50, 50);
            widget = {
              id, type: "sticker", x, y,
              width: 100, height: 100, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              emoji: "",
            };
            break;
          }
          case "calendar": {
            const now = new Date();
            const { x, y } = getCenter(viewport, 120, 130);
            widget = {
              id, type: "calendar", x, y,
              width: 240, height: 260, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              month: now.getMonth(),
              year: now.getFullYear(),
            };
            break;
          }
          case "linkCard": {
            const { x, y } = getCenter(viewport, 100, 40);
            widget = {
              id, type: "linkCard", x, y,
              width: 220, height: 80, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              title: "",
              url: "",
            };
            break;
          }
          case "focus": {
            const { x, y } = getCenter(viewport, 120, 100);
            widget = {
              id, type: "focus", x, y,
              width: 260, height: 180, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              title: "Today",
              items: [],
            };
            break;
          }
          case "codeSnippet": {
            const { x, y } = getCenter(viewport, 150, 100);
            widget = {
              id, type: "codeSnippet", x, y,
              width: 300, height: 160, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              language: "text",
              content: "",
            };
            break;
          }
          case "dayPlanner": {
            const d = new Date();
            const startDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
            const { x, y } = getCenter(viewport, 280, 180);
            widget = {
              id, type: "dayPlanner", x, y,
              width: 560, height: 360, zIndex: maxZ + 1, locked: false, createdAt: Date.now(),
              startDate,
              numDays: 5,
              tasksByDate: {},
            };
            break;
          }
        }

        set({ widgets: [...widgets, widget] });
      },

      updateWidget: (id, updates, skipHistory = false) => {
        // Skip history for rapid updates like dragging (handled separately)
        if (!skipHistory && !('x' in updates || 'y' in updates || 'width' in updates || 'height' in updates)) {
          get().saveHistory();
        }

        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? ({ ...w, ...updates } as Widget) : w
          ),
        });
      },

      moveWidgets: (moves, skipHistory = false) => {
        if (!skipHistory) get().saveHistory();
        set({
          widgets: get().widgets.map((w) =>
            moves[w.id] ? ({ ...w, ...moves[w.id] } as Widget) : w
          ),
        });
      },

      deleteWidget: (id) => {
        // Save history before deleting
        get().saveHistory();
        set({ widgets: get().widgets.filter((w) => w.id !== id) });
      },

      bringToFront: (id) => {
        const { widgets } = get();
        const maxZ = widgets.reduce((max, w) => Math.max(max, w.zIndex), 0);
        set({
          widgets: widgets.map((w) =>
            w.id === id ? ({ ...w, zIndex: maxZ + 1 } as Widget) : w
          ),
        });
      },

      setViewport: (partial) => {
        set({ viewport: { ...get().viewport, ...partial } });
      },

      setViewMode: (viewMode) => set({ viewMode }),

      setSelectedWidgets: (selectedWidgets) => set({ selectedWidgets }),

      setQuickActions: (quickActions) => set({ quickActions }),

      loadBoard: (widgets, viewport) => {
        const valid = widgets.filter(
          (w): w is Widget => w != null && typeof w === "object" && "id" in w && "type" in w
        );
        set({ widgets: valid, viewport });
      },

      lockWidget: async (id, password) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget || widget.locked) return;

        const contentFields = getContentFields(widget);
        const plaintext = JSON.stringify(contentFields);
        const encryptedContent = await encrypt(plaintext, password);

        // Replace content fields with defaults, set locked
        const defaults = getDefaultContent(widget.type);
        set({
          widgets: get().widgets.map((w) =>
            w.id === id
              ? ({ ...w, ...defaults, locked: true, encryptedContent } as Widget)
              : w
          ),
        });
      },

      unlockWidget: async (id, password) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget || !widget.locked || !widget.encryptedContent) return false;

        const plaintext = await decrypt(widget.encryptedContent, password);
        if (plaintext === null) return false;

        const contentFields = JSON.parse(plaintext);
        set({
          widgets: get().widgets.map((w) =>
            w.id === id
              ? ({ ...w, ...contentFields, locked: false, encryptedContent: undefined } as Widget)
              : w
          ),
        });
        return true;
      },

      saveHistory: () => {
        const { widgets, viewport } = get();
        useHistoryStore.getState().pushHistory(widgets, viewport);
      },

      focusWidget: (id: string) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget) return;

        const zoom = get().viewport.zoom;
        const centerX = widget.x + widget.width / 2;
        const centerY = widget.y + widget.height / 2;
        const newX = window.innerWidth / 2 - centerX * zoom;
        const newY = window.innerHeight / 2 - centerY * zoom;

        set({
          viewport: { x: newX, y: newY, zoom },
          focusedWidgetId: id,
        });

        setTimeout(() => {
          set({ focusedWidgetId: null });
        }, 1500);
      },

      undo: () => {
        const historyState = useHistoryStore.getState();
        if (!historyState.canUndo()) return;

        // Save current state to history before undoing
        const { widgets, viewport } = get();
        if (historyState.past.length === 0) {
          historyState.pushHistory(widgets, viewport);
        }

        const previousState = historyState.undo();
        if (previousState) {
          set({ widgets: previousState.widgets, viewport: previousState.viewport });
        }
      },

      redo: () => {
        const historyState = useHistoryStore.getState();
        if (!historyState.canRedo()) return;

        const nextState = historyState.redo();
        if (nextState) {
          set({ widgets: nextState.widgets, viewport: nextState.viewport });
        }
      },
    }),
    {
      name: "whiteboard-store",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: (state) => ({
        widgets: state.widgets,
        viewport: state.viewport,
        quickActions: state.quickActions
      }) as any,
      storage: typeof window !== "undefined"
        ? createDebouncedStorage({
            getItem: (n) => localStorage.getItem(n),
            setItem: (n, v) => localStorage.setItem(n, v),
            removeItem: (n) => localStorage.removeItem(n),
          }) as any
        : undefined,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.widgets = state.widgets.filter(
            (w): w is Widget => w != null && typeof w === "object" && "id" in w
          );
          if (!state.quickActions?.length) state.quickActions = DEFAULT_QUICK_ACTIONS;
        }
      },
    }
  )
);
