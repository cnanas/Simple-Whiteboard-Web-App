export type WidgetType = "sticky" | "notepad" | "taskList" | "sticker" | "calendar";

export interface WidgetBase {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  locked: boolean;
  encryptedContent?: string;
}

// Base fields that are NOT encrypted when locking a widget
export const WIDGET_BASE_KEYS: ReadonlySet<string> = new Set([
  "id", "type", "x", "y", "width", "height", "zIndex", "locked", "encryptedContent",
]);

export interface StickyWidget extends WidgetBase {
  type: "sticky";
  content: string;
  color: string;
}

export interface NotepadWidget extends WidgetBase {
  type: "notepad";
  content: string;
}

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  due?: string;
}

export interface TaskListWidget extends WidgetBase {
  type: "taskList";
  title: string;
  items: TaskItem[];
}

export interface StickerWidget extends WidgetBase {
  type: "sticker";
  emoji: string;
}

export interface CalendarWidget extends WidgetBase {
  type: "calendar";
  month: number;
  year: number;
}

export type Widget =
  | StickyWidget
  | NotepadWidget
  | TaskListWidget
  | StickerWidget
  | CalendarWidget;

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export const STICKY_COLORS = [
  { name: "yellow", value: "#fef08a" },
  { name: "blue", value: "#bfdbfe" },
  { name: "green", value: "#bbf7d0" },
  { name: "pink", value: "#fbcfe8" },
  { name: "orange", value: "#fed7aa" },
  { name: "purple", value: "#e9d5ff" },
] as const;

export const EMOJIS = [
  "⭐", "❤️", "🔥", "✅", "🚀", "💡", "🎯", "⚡",
  "🎉", "👍", "📌", "🔔", "💬", "📝", "🏆", "🌟",
  "⚠️", "❌", "🔑", "💎",
] as const;
