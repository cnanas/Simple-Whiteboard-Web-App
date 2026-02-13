"use client";

import { memo } from "react";
import type { Widget } from "@/types";
import { StickyNote } from "./StickyNote";
import { NotepadWidget } from "./NotepadWidget";
import { TaskListWidget } from "./TaskListWidget";
import { StickerWidget } from "./StickerWidget";
import { CalendarWidget } from "./CalendarWidget";
import { LinkCardWidget } from "./LinkCardWidget";
import { FocusWidget } from "./FocusWidget";
import { CodeSnippetWidget } from "./CodeSnippetWidget";
import { DayPlannerWidget } from "./DayPlannerWidget";

interface WidgetRendererProps {
  widget: Widget;
  /** When true, render without DragWrapper (e.g. in list-view detail sheet) */
  standalone?: boolean;
}

function WidgetRendererInner({ widget, standalone }: WidgetRendererProps) {
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
    case "linkCard":
      return <LinkCardWidget widget={widget} standalone={standalone} />;
    case "focus":
      return <FocusWidget widget={widget} standalone={standalone} />;
    case "codeSnippet":
      return <CodeSnippetWidget widget={widget} standalone={standalone} />;
    case "dayPlanner":
      return <DayPlannerWidget widget={widget} standalone={standalone} />;
  }
}

export const WidgetRenderer = memo(WidgetRendererInner);
