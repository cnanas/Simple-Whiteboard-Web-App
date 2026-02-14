export type WidgetType = "sticky" | "notepad" | "taskList" | "sticker" | "calendar" | "linkCard" | "focus" | "codeSnippet" | "dayPlanner";

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
  createdAt?: number;
}

// Base fields that are NOT encrypted when locking a widget
export const WIDGET_BASE_KEYS: ReadonlySet<string> = new Set([
  "id", "type", "x", "y", "width", "height", "zIndex", "locked", "encryptedContent", "createdAt",
]);

export interface StickyWidget extends WidgetBase {
  type: "sticky";
  content: string;
  color: string;
  markdown?: boolean;
}

export interface NotepadWidget extends WidgetBase {
  type: "notepad";
  content: string;
  markdown?: boolean;
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

export interface LinkCardWidget extends WidgetBase {
  type: "linkCard";
  title: string;
  url: string;
}

export interface FocusWidget extends WidgetBase {
  type: "focus";
  title: string;
  items: string[];
}

export interface CodeSnippetWidget extends WidgetBase {
  type: "codeSnippet";
  language: string;
  content: string;
}

/** Sub-task in a day planner task */
export interface DayPlannerSubTask {
  id: string;
  text: string;
  done: boolean;
}

/** Single task in a day column (Sunsama-style) */
export interface DayPlannerTask {
  id: string;
  text: string;
  done: boolean;
  duration?: number; // minutes
  scheduledTime?: string; // "10:00"
  subTasks?: DayPlannerSubTask[];
  tags?: string[];
}

export interface DayPlannerWidget extends WidgetBase {
  type: "dayPlanner";
  startDate: string; // YYYY-MM-DD
  numDays: number; // 2-7
  tasksByDate: Record<string, DayPlannerTask[]>; // key = YYYY-MM-DD
}

export type Widget =
  | StickyWidget
  | NotepadWidget
  | TaskListWidget
  | StickerWidget
  | CalendarWidget
  | LinkCardWidget
  | FocusWidget
  | CodeSnippetWidget
  | DayPlannerWidget;

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
