import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Widget, WidgetType, Viewport } from "@/types";
const DEFAULT_QUICK_ACTIONS: WidgetType[] = ["sticky", "notepad", "taskList", "calendar", "linkCard", "dayPlanner"];
import { STICKY_COLORS, WIDGET_BASE_KEYS } from "@/types";
import { encrypt, decrypt } from "@/lib/crypto";
import { createDebouncedStorage } from "@/lib/debouncedStorage";

export type ViewMode = "canvas" | "list";

interface BoardState {
  widgets: Widget[];
  viewport: Viewport;
  viewMode: ViewMode;
  quickActions: WidgetType[];

  addWidget: (type: WidgetType) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateWidget: (id: string, updates: Record<string, any>) => void;
  deleteWidget: (id: string) => void;
  bringToFront: (id: string) => void;
  setViewport: (viewport: Partial<Viewport>) => void;
  setViewMode: (mode: ViewMode) => void;
  setQuickActions: (actions: WidgetType[]) => void;
  loadBoard: (widgets: Widget[], viewport: Viewport) => void;
  lockWidget: (id: string, password: string) => Promise<void>;
  unlockWidget: (id: string, password: string) => Promise<boolean>;
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

      addWidget: (type: WidgetType) => {
        const { viewport, widgets } = get();
        const maxZ = widgets.reduce((max, w) => Math.max(max, w.zIndex), 0);
        const id = nanoid();

        let widget: Widget;

        switch (type) {
          case "sticky": {
            const { x, y } = getCenter(viewport, 100, 75);
            widget = {
              id, type: "sticky", x, y,
              width: 200, height: 150, zIndex: maxZ + 1, locked: false,
              content: "",
              color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)].value,
            };
            break;
          }
          case "notepad": {
            const { x, y } = getCenter(viewport, 160, 120);
            widget = {
              id, type: "notepad", x, y,
              width: 320, height: 240, zIndex: maxZ + 1, locked: false,
              content: "",
            };
            break;
          }
          case "taskList": {
            const { x, y } = getCenter(viewport, 125, 100);
            widget = {
              id, type: "taskList", x, y,
              width: 250, height: 200, zIndex: maxZ + 1, locked: false,
              title: "Tasks",
              items: [],
            };
            break;
          }
          case "sticker": {
            const { x, y } = getCenter(viewport, 50, 50);
            widget = {
              id, type: "sticker", x, y,
              width: 100, height: 100, zIndex: maxZ + 1, locked: false,
              emoji: "",
            };
            break;
          }
          case "calendar": {
            const now = new Date();
            const { x, y } = getCenter(viewport, 120, 130);
            widget = {
              id, type: "calendar", x, y,
              width: 240, height: 260, zIndex: maxZ + 1, locked: false,
              month: now.getMonth(),
              year: now.getFullYear(),
            };
            break;
          }
          case "linkCard": {
            const { x, y } = getCenter(viewport, 100, 40);
            widget = {
              id, type: "linkCard", x, y,
              width: 220, height: 80, zIndex: maxZ + 1, locked: false,
              title: "",
              url: "",
            };
            break;
          }
          case "focus": {
            const { x, y } = getCenter(viewport, 120, 100);
            widget = {
              id, type: "focus", x, y,
              width: 260, height: 180, zIndex: maxZ + 1, locked: false,
              title: "Today",
              items: [],
            };
            break;
          }
          case "codeSnippet": {
            const { x, y } = getCenter(viewport, 150, 100);
            widget = {
              id, type: "codeSnippet", x, y,
              width: 300, height: 160, zIndex: maxZ + 1, locked: false,
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
              width: 560, height: 360, zIndex: maxZ + 1, locked: false,
              startDate,
              numDays: 5,
              tasksByDate: {},
            };
            break;
          }
        }

        set({ widgets: [...widgets, widget] });
      },

      updateWidget: (id, updates) => {
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? ({ ...w, ...updates } as Widget) : w
          ),
        });
      },

      deleteWidget: (id) => {
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
    }),
    {
      name: "whiteboard-store",
      partialize: (state) => ({ widgets: state.widgets, viewport: state.viewport, quickActions: state.quickActions }),
      storage: typeof window !== "undefined"
        ? createDebouncedStorage({
            getItem: (n) => localStorage.getItem(n),
            setItem: (n, v) => localStorage.setItem(n, v),
            removeItem: (n) => localStorage.removeItem(n),
          })
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
