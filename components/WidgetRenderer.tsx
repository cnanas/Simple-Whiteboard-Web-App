"use client";

import type { Widget } from "@/types";
import { StickyNote } from "./StickyNote";
import { NotepadWidget } from "./NotepadWidget";
import { TaskListWidget } from "./TaskListWidget";
import { StickerWidget } from "./StickerWidget";
import { CalendarWidget } from "./CalendarWidget";

interface WidgetRendererProps {
  widget: Widget;
  /** When true, render without DragWrapper (e.g. in list-view detail sheet) */
  standalone?: boolean;
}

export function WidgetRenderer({ widget, standalone }: WidgetRendererProps) {
  switch (widget.type) {
    case "sticky":
      return <StickyNote widget={widget} standalone={standalone} />;
    case "notepad":
      return <NotepadWidget widget={widget} standalone={standalone} />;
    case "taskList":
      return <TaskListWidget widget={widget} standalone={standalone} />;
    case "sticker":
      return <StickerWidget widget={widget} standalone={standalone} />;
    case "calendar":
      return <CalendarWidget widget={widget} standalone={standalone} />;
  }
}
