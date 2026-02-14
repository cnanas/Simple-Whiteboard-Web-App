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
  /** When true, show selection border */
  isSelected?: boolean;
}

function WidgetRendererInner({ widget, standalone, isSelected }: WidgetRendererProps) {
  switch (widget.type) {
    case "sticky":
      return <StickyNote widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "notepad":
      return <NotepadWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "taskList":
      return <TaskListWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "sticker":
      return <StickerWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "calendar":
      return <CalendarWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "linkCard":
      return <LinkCardWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "focus":
      return <FocusWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "codeSnippet":
      return <CodeSnippetWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
    case "dayPlanner":
      return <DayPlannerWidget widget={widget} standalone={standalone} isSelected={isSelected} />;
  }
}

export const WidgetRenderer = memo(WidgetRendererInner);
